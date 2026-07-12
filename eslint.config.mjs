import path from 'node:path';
import { fileURLToPath } from 'node:url';

import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: eslint.configs.recommended,
  allConfig: eslint.configs.all,
});

export default defineConfig([
  globalIgnores(['projects/**/*', '.angular/**/*', 'dist/**/*']),
  {
    extends: compat.extends('plugin:prettier/recommended'),
    plugins: {
      prettier: prettierPlugin,
      import: importPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'error',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [
            {
              pattern: '@angular/**',
              group: 'external',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],
    },
  },

  // Angular-eslint recommended config for TypeScript files
  ...angular.configs.tsRecommended.map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),

  {
    files: ['**/*.ts'],
    extends: compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:prettier/recommended',
    ),
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.spec.json'],
        createDefaultProgram: true,
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      // Typescript
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/only-throw-error': 'warn',
      '@typescript-eslint/no-deprecated': 'warn',
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^[iI][A-Z]',
            match: false,
          },
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
      ],

      // Angular
      '@angular-eslint/prefer-signals': 'warn',
      '@angular-eslint/prefer-standalone': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@angular-eslint/no-uncalled-signals': 'error',
      '@angular-eslint/no-developer-preview': 'warn',
      '@angular-eslint/sort-lifecycle-methods': 'warn',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },

  // Angular-eslint recommended config for HTML files
  ...angular.configs.templateRecommended.map((config) => ({
    ...config,
    files: ['**/*.html'],
  })),

  // Angular-eslint accessibility rules for HTML files
  ...angular.configs.templateAccessibility.map((config) => ({
    ...config,
    files: ['**/*.html'],
  })),

  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/no-positive-tabindex': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/no-empty-control-flow': 'error',
      '@angular-eslint/template/no-inline-styles': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'error',
      '@angular-eslint/template/prefer-static-string-properties': 'error',
      '@angular-eslint/template/valid-aria': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'warn',
      '@angular-eslint/template/prefer-template-literal': 'warn',
      '@angular-eslint/template/attributes-order': ['warn', { alphabetical: true }],
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'core', pattern: 'src/app/core/*' },
        { type: 'shared', pattern: 'src/app/shared/*' },
        { type: 'feature', pattern: 'src/app/features/*' },
      ],
      'boundaries/ignore': [
        'src/app/app.component.ts',
        'src/app/app.routes.ts',
        'src/app/app.config.ts',
      ],
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.spec.json'],
          noWarnOnMultipleProjects: true,
        },
      },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'core' } },
              allow: [{ to: { element: { type: 'shared' } } }],
            },
            {
              from: { element: { type: 'shared' } },
              allow: [],
            },
            {
              from: { element: { type: 'feature' } },
              allow: [
                { to: { element: { type: 'core' } } },
                { to: { element: { type: 'shared' } } },
              ],
            },
          ],
        },
      ],
    },
  },
]);
