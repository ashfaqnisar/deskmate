import { env } from "~/config/env";
import { logger } from "~/lib/logger";
import { chatService } from "~/modules/chat/chat.service";
import { intentService } from "~/modules/intent/intent.service";
import { systemPrompt } from "~/prompts";

import { runCheck } from "./checks";
import { CaseSchema } from "./types";

import type { CaseResult, EvalCase, RunResult } from "./types";

const DATA_DIR = new URL("../../../data/evals/", import.meta.url);
const RESULTS_DIR = new URL("./results/", import.meta.url);
const CONCURRENCY = 4;

const compare = process.argv.includes("--compare");
const only = process.argv.slice(2).find((arg) => !arg.startsWith("--"));

const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

const listFiles = async (pattern: string, dir: URL) =>
  (await Array.fromAsync(new Bun.Glob(pattern).scan(Bun.fileURLToPath(dir)))).toSorted((a, b) =>
    a.localeCompare(b),
  );

async function loadCases() {
  const files = await listFiles("*.jsonl", DATA_DIR);
  const selected = files.filter((file) => !only || file === `${only}.jsonl`);
  if (selected.length === 0) throw new Error(`No dataset found for "${only}"`);

  const lists = await Promise.all(
    selected.map(async (file) => {
      const lines = (await Bun.file(new URL(file, DATA_DIR)).text()).split("\n");
      return lines
        .filter((line) => line.trim())
        .map((line) => {
          const testCase = CaseSchema.parse(JSON.parse(line));
          return { name: `${file.replace(".jsonl", "")}/${testCase.id}`, testCase };
        });
    }),
  );
  return lists.flat();
}

async function getReply(testCase: EvalCase) {
  if (!testCase.expected) {
    const { reply, usage, latencyMs } = await chatService.reply({
      message: testCase.input,
      history: testCase.history,
    });
    return { reply, tokens: usage.totalTokens, latencyMs, checks: testCase.checks };
  }

  const startedAt = performance.now();
  const { intent, tokens } = await intentService.classify(testCase.input);
  const latencyMs = Math.round(performance.now() - startedAt);
  return {
    reply: intent,
    tokens,
    latencyMs,
    checks: [{ type: "equals" as const, value: testCase.expected }],
  };
}

async function runCase(name: string, testCase: EvalCase): Promise<CaseResult> {
  try {
    const { reply, tokens: replyTokens, latencyMs, checks: toRun } = await getReply(testCase);

    const outcomes = await Promise.all(toRun.map((c) => runCheck(c, testCase, reply)));
    const checks = outcomes.map(({ check, passed, detail, score, reason }) => ({
      check,
      passed,
      detail,
      score,
      reason,
    }));
    const tokens = outcomes.reduce((sum, o) => sum + o.tokens, replyTokens);
    return {
      name,
      input: testCase.input,
      reply,
      passed: checks.every((c) => c.passed),
      checks,
      tokens,
      latencyMs,
    };
  } catch (err) {
    const detail = `error: ${err instanceof Error ? err.message : String(err)}`;
    const failed = { check: { type: "equals" as const, value: "" }, passed: false, detail };
    const input = testCase.input;
    return { name, input, reply: "", passed: false, checks: [failed], tokens: 0, latencyMs: 0 };
  }
}

async function runAll(cases: { name: string; testCase: EvalCase }[]) {
  const results: CaseResult[] = [];
  let next = 0;

  const worker = async () => {
    while (next < cases.length) {
      const { name, testCase } = cases[next++]!;
      const result = await runCase(name, testCase);
      results.push(result);
      if (result.passed) {
        logger.info({ name }, "Eval case passed");
      } else {
        const failedChecks = result.checks.filter((c) => !c.passed);
        logger.warn({ name, failedChecks, reply: result.reply }, "Eval case failed");
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return results.toSorted((a, b) => a.name.localeCompare(b.name));
}

// Result files are named <timestamp>__<datasets>.json, so a comparison only looks at runs of the
// same datasets (a 5-case run is not comparable with a 25-case one).
async function loadPreviousRun(datasetKey: string) {
  const files = await listFiles(`*__${datasetKey}.json`, RESULTS_DIR).catch(() => []);
  const latest = files.at(-1);
  return latest ? ((await Bun.file(new URL(latest, RESULTS_DIR)).json()) as RunResult) : undefined;
}

function logComparison(run: RunResult, previous?: RunResult) {
  if (!previous) return logger.info("No previous run to compare with");

  const before = new Map(previous.cases.map((c) => [c.name, c.passed]));
  const changed = run.cases.filter((c) => before.has(c.name) && before.get(c.name) !== c.passed);
  logger.info(
    {
      previousPassRate: percent(previous.passRate),
      passRate: percent(run.passRate),
      fixed: changed.filter((c) => c.passed).map((c) => c.name),
      broken: changed.filter((c) => !c.passed).map((c) => c.name),
    },
    "Eval comparison",
  );
}

async function run() {
  const cases = await loadCases();
  const datasetKey = [...new Set(cases.map((c) => c.name.split("/")[0]!))].join("+");
  const previous = compare ? await loadPreviousRun(datasetKey) : undefined;

  logger.info({ cases: cases.length }, "Eval started");
  const results = await runAll(cases);
  const passed = results.filter((r) => r.passed).length;

  const result: RunResult = {
    startedAt: new Date().toISOString(),
    model: env.LLM_MODEL,
    promptVersion: systemPrompt.version,
    intentBackend: env.INTENT_BACKEND,
    passRate: passed / results.length,
    tokens: results.reduce((sum, r) => sum + r.tokens, 0),
    avgLatencyMs: Math.round(results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length),
    cases: results,
  };

  logger.info(
    {
      passRate: percent(result.passRate),
      passed: `${passed}/${results.length}`,
      model: result.model,
      promptVersion: result.promptVersion,
      intentBackend: result.intentBackend,
      tokens: result.tokens,
      avgLatencyMs: result.avgLatencyMs,
    },
    "Eval finished",
  );
  if (compare) logComparison(result, previous);

  const file = `${result.startedAt.replaceAll(":", "-")}__${datasetKey}.json`;
  await Bun.write(new URL(file, RESULTS_DIR), JSON.stringify(result, null, 2));
  logger.info({ file: `evals/results/${file}` }, "Eval results saved");

  process.exitCode = passed === results.length ? 0 : 1;
}

await run();
