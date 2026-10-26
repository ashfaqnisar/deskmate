import { AsyncLocalStorage } from "node:async_hooks";
import type { IncomingMessage } from "node:http";
import pino from "pino";

type RequestContext = { reqId: string; req: ReturnType<typeof serializeRawReq> };

export const requestContext = new AsyncLocalStorage<RequestContext>();

export const serializeRawReq = (req: IncomingMessage) => ({
  method: req.method,
  url: req.url,
  host: req.headers.host,
  remoteAddress: req.socket?.remoteAddress,
  remotePort: req.socket?.remotePort,
});

export const logger = pino({
  level: "debug",
  mixin: (_obj, _level, self) => {
    const ctx = requestContext.getStore();
    if (!ctx) return {};
    // Child loggers (req.log) already have reqId bound; skip it to avoid duplicate keys.
    const bound = self.bindings();
    return bound.reqId ? { req: ctx.req } : { reqId: ctx.reqId, req: ctx.req };
  },
  transport: {
    target: "pino-pretty",
    options: {
      singleLine: true,
      ignore: "pid,hostname",
      messageFormat: "{msg}\n{args}",
    },
  },
});
