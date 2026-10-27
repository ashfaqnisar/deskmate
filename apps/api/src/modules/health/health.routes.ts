import { HealthSchema } from "./health.schema";

import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Liveness check",
        response: { 200: HealthSchema },
      },
    },
    async () => ({ status: "ok" as const }),
  );
};

export default healthRoutes;
