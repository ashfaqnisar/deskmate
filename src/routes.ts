import chatRoutes from "~/modules/chat/chat.routes";
import healthRoutes from "~/modules/health/health.routes";

import type { FastifyPluginAsync } from "fastify";

const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes);
  await app.register(chatRoutes, { prefix: "/chat" });
};

export default routes;
