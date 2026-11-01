import tseslint from "typescript-eslint";

export default [
  { ignores: ["node_modules/", "generated/", "grader/test/fixtures/", "grader/runner.cjs", "stand/poshtar/", "stand/platform/raw/", "dumps/", "submissions/"] },
  ...tseslint.configs.recommended,
];
