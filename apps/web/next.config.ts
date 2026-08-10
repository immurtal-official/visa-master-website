import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // packages/core is consumed as TypeScript source rather than a build artifact,
  // so there is no build step to keep in sync while the schemas are moving.
  transpilePackages: ["@visa-master/core"],
};

export default nextConfig;
