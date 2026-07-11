# SDD: Issue #1 - Phase 1: Configure Linting & Formatting (ESLint + Prettier + EditorConfig)

## 🎯 Objective & Scope

Estreitar o padrão de qualidade e estilização de código do repositório através da instalação e configuração das ferramentas de Linting (ESLint), Formatação (Prettier) e configurações gerais do editor (.editorconfig). Toda a configuração é auto-contida nesta especificação, portando exatamente os padrões corporativos desejados.

---

## 📋 Acceptance Criteria & Rules

- **Rule 1 (Code Formatting):** Prettier deve formatar automaticamente todos os arquivos da pasta `src/` aplicando tabulação de 2 espaços, aspas simples, ponto-e-vírgula e parsing específico para templates HTML do Angular.
- **Rule 2 (Code Linting):** ESLint configurado através do padrão Flat Config (`eslint.config.mjs`), cobrindo:
  - TypeScript: Regras estritas de tipagem e restrição de `no-deprecated`.
  - Angular: Obrigatoriedade de Standalone Components (`@angular-eslint/prefer-standalone` como erro) e preferência de Signals (`@angular-eslint/prefer-signals` como aviso).
  - Imports: Regra de ordenação automática alfabética e por grupos de imports (`eslint-plugin-import`).
  - HTML a11y: Validação de acessibilidade semântica básica.
- **Rule 3 (Editor):** Finais de linha UTF-8 e recuo com 2 espaços ativados globalmente pelo `.editorconfig`.
- **Rule 4 (Quality Checks):** Integração de comandos rápidos `npm run lint` e `npm run format` no `package.json` executando com sucesso.

---

## 🛠️ Proposed Changes

### 1. package.json [MODIFY]

Instalar as devDependencies necessárias e adicionar scripts operacionais:

- **Comando de Instalação:**
  ```bash
  npm install -D eslint@^9.39.2 prettier@^3.8.1 angular-eslint@^22.0.0 eslint-config-prettier@^10.1.8 eslint-plugin-prettier@^5.5.5 eslint-plugin-import@^2.32.0 husky@^9.1.7 lint-staged@^16.2.7 @commitlint/cli@^20.4.1 @commitlint/config-conventional@^20.4.1
  ```
- **Scripts a adicionar:**
  ```json
  "lint": "eslint .",
  "format": "prettier --write \"src/**/*.{ts,html,css,scss}\""
  ```

### 2. .prettierrc.json [NEW]

- **File:** `.prettierrc.json`
- **Content:**
  ```json
  {
    "endOfLine": "auto",
    "singleQuote": true,
    "semi": true,
    "tabWidth": 2,
    "bracketSpacing": true,
    "trailingComma": "none",
    "overrides": [
      {
        "files": "*.html",
        "options": {
          "parser": "angular"
        }
      }
    ]
  }
  ```

### 3. .prettierignore [NEW]

- **File:** `.prettierignore`
- **Content:**
  ```text
  /node_modules
  /dist
  /.angular
  package-lock.json
  ```

### 4. eslint.config.mjs [NEW]

- **File:** `eslint.config.mjs`
- **Content:**
  ```javascript
  import path from 'node:path';
  import { fileURLToPath } from 'node:url';

  import angularTemplate from '@angular-eslint/eslint-plugin-template';
  import angularTemplateParser from '@angular-eslint/template-parser';
  import { FlatCompat } from '@eslint/eslintrc';
  import eslint from '@eslint/js';
  import angular from 'angular-eslint';
  import { defineConfig, globalIgnores } from 'eslint/config';
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
  ]);
  ```

### 5. .editorconfig [MODIFY]

- **File:** `.editorconfig`
- **Content:**
  ```ini
  # Editor configuration, see https://editorconfig.org
  root = true

  [*]
  charset = utf-8
  indent_style = space
  indent_size = 2
  insert_final_newline = true
  trim_trailing_whitespace = true

  [*.ts]
  quote_type = single
  ij_typescript_use_double_quotes = false

  [*.md]
  max_line_length = off
  trim_trailing_whitespace = false
  ```

---

## 🧪 Verification Plan

- **Unit/Integration Tests:** Não aplicável para configs.
- **Linting & Quality:**
  - Executar `npm run lint` na raiz para validar a sintaxe e aplicação das novas regras Flat Config.
  - Executar `npm run format` para formatar os arquivos de código do repositório.
- **Command:** `npm run lint && npm run format`
