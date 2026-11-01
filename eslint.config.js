import tseslint from "typescript-eslint";

export default [
  { ignores: ["node_modules/", "generated/"] },
  ...tseslint.configs.recommended,
];
