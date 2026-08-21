import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // These talk to the local database, so they run one at a time: the point of
    // several of them is what two conductors do to the same row.
    fileParallelism: false,
    testTimeout: 30_000,
  },
});
