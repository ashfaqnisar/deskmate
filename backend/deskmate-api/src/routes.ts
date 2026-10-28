import chatRoutes from "~/modules/chat/chat.routes";
import documentsRoutes from "~/modules/documents/documents.routes";
import healthRoutes from "~/modules/health/health.routes";

import type { FastifyPluginAsync } from "fastify";

const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes);
  await app.register(chatRoutes, { prefix: "/chat" });
  await app.register(documentsRoutes, { prefix: "/documents" });
};

export default routes;
