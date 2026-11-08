import { ApiReference } from "@scalar/nextjs-api-reference";

export const GET = ApiReference({
  url: "/openapi.json",
  theme: "purple",
  darkMode: true,
  layout: "modern",
  metaData: {
    title: "BugSense AI — API Reference",
    description: "Interactive API documentation and client for BugSense AI.",
  },
});
