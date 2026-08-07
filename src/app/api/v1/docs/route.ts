import { ApiReference } from "@scalar/nextjs-api-reference";
import openapiSpec from "@config/openapi.json";

export const GET = ApiReference({
  content: openapiSpec,
  theme: "default",
  layout: "modern",
});
