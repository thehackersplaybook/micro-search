import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      'dist/**/*',
      'node_modules/**/*',
      'coverage/**/*',
      '**/*.js',
      '!eslint.config.js'
    ]
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
