import swagger from "@fastify/swagger";
import scalar from "@scalar/fastify-api-reference";
import fp from "fastify-plugin";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

import { env } from "~/config/env";

export const docs = fp(
  async (app) => {
    if (!env.DOCS_ENABLED) return;

    await app.register(swagger, {
      openapi: {
        info: {
          title: "Deskmate API",
          version: "0.1.0",
          description:
            "Backend for Deskmate, the internal HR and IT helpdesk assistant for Acme Corp. Answers are grounded in company documents.",
        },
        tags: [
          { name: "Chat", description: "Ask Deskmate a question and get an answer with sources." },
          { name: "Documents", description: "Read the company documents that answers cite." },
          { name: "Health", description: "Check that the API is running." },
        ],
      },
      transform: jsonSchemaTransform,
    });
    await app.register(scalar, {
      routePrefix: "/docs",
      configuration: {
        theme: "kepler",
        withDefaultFonts: false,
        expandAllParameters: true,
        expandAllSchemaProperties: true,
        defaultOpenAllTags: true,
      },
      hooks: {
        onRequest: (_req, reply, done) => {
          reply.helmet({
            contentSecurityPolicy: {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:"],
                fontSrc: ["'self'", "data:"],
              },
            },
          });
          done();
        },
      },
    });
  },
  { name: "docs" },
);
