import { DocumentParams, DocumentResponse } from "@deskmate/shared";

import { documentsService } from "./documents.service";

import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

const documentsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/:source",
    {
      schema: {
        tags: ["Documents"],
        summary: "Read a company document",
        description:
          "Returns the markdown text of a company document so the app can show the source behind an answer. `source` is the file name, such as `leave-policy.md`. Only documents the caller is allowed to read are returned; restricted or unknown files respond with 404.",
        params: DocumentParams,
        response: { 200: DocumentResponse },
      },
    },
    async (req) => documentsService.get(req.params.source),
  );
};

export default documentsRoutes;
