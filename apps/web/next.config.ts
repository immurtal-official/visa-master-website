import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // packages/core is consumed as TypeScript source rather than a build artifact,
  // so there is no build step to keep in sync while the schemas are moving.
  transpilePackages: ["@visa-master/core"],
  // Next writes its own AGENTS.md and CLAUDE.md into the app directory unless
  // this is off. The repo's conventions live in its own documents, and a
  // generated file that reappears after every build is noise in review.
  agentRules: false,
};

export default withNextIntl(nextConfig);
