import { HealthSchema } from "./health.schema";

import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Liveness check",
        description:
          "Returns `ok` while the API process is running. It does not check the database or the AI provider. The web app polls it to show the API status badge.",
        response: { 200: HealthSchema },
      },
    },
    async () => ({ status: "ok" as const }),
  );
};

export default healthRoutes;
