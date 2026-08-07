import openapiSpec from "@config/openapi.json";

export const GET = () =>
  Response.json(openapiSpec, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
