import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    isolate: false,
    passWithNoTests: true,
    include: ["src/**/*.test.ts", "common/**/*.test.ts", "worker/**/*.test.ts"],
  },
});
