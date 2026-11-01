import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "grader/test/**/*.test.ts"],
  },
});
