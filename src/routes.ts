import healthRoutes from "~/modules/health/health.routes";

import type { FastifyPluginAsync } from "fastify";

const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes);
  // TODO (Phase 1): await app.register(chatRoutes, { prefix: "/chat" });
};

export default routes;
