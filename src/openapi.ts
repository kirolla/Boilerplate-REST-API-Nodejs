import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

import { z } from "zod";

import { registry } from "./openapi/registry.ts";

import "./openapi/announcement.openapi.ts";


extendZodWithOpenApi(z);


export function generateOpenApiDocument() {
  const generator =
    new OpenApiGeneratorV3(
      registry.definitions,
    );

  return generator.generateDocument({
    openapi: "3.0.0",

    info: {
      title: "Your API",
      version: "1.0.0",
      description: "REST API for your project",
    },

    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  });
}