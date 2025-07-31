// @ts-check
import eslintJs from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config({
  files: ["src/**/*.ts", "src/**/*.tsx", "sst.config.ts"],
  ignores: [
    ".sst/**",
    "sst-env.d.ts",
    "routeTree.gen.ts",
    "node_modules/**",
    "dist/**",
    "build/**",
    ".next/**",
    "coverage/**",
  ],

  extends: [
    eslintJs.configs.recommended,
    tseslint.configs.recommended,
    eslintReact.configs["recommended-typescript"],
  ],

  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },

  rules: {
    "@typescript-eslint/triple-slash-reference": "off",
  },
});
