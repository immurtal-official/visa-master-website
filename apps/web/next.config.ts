import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Next allows one dev server per build directory, so running a second one —
  // the end-to-end tests start an unconfigured instance alongside the normal
  // one — needs somewhere else to put its output.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // packages/core is consumed as TypeScript source rather than a build artifact,
  // so there is no build step to keep in sync while the schemas are moving.
  transpilePackages: ["@visa-master/core"],
  // Next writes its own AGENTS.md and CLAUDE.md into the app directory unless
  // this is off. The repo's conventions live in its own documents, and a
  // generated file that reappears after every build is noise in review.
  agentRules: false,
  // The end-to-end suite drives the app over 127.0.0.1 while the dev server
  // serves localhost; without this every asset request logs a cross-origin
  // warning and buries the test output.
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    // Serves app/global-not-found.tsx for URLs that match no route. Needed
    // because the root layout sits under a dynamic [locale] segment, so an
    // unmatched URL has no layout to render inside.
    globalNotFound: true,
  },
};

export default withNextIntl(nextConfig);
