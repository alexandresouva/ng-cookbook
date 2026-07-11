# SDD: Issue #3 - Git Hooks & Linting Automation (Husky + lint-staged + Commitlint)

## 🎯 Objective & Scope

Implement git hooks to automate linting, formatting, and commit message validation before they are committed and pushed. This ensures code quality and standardized commit history.

## 📋 Acceptance Criteria & Rules

- **Rule 1:** `npm install` automatically sets up husky hooks.
- **Rule 2:** Attempting to commit code with linting or formatting errors triggers `lint-staged` and formats/lints the code.
- **Rule 3:** Attempting to use a non-conventional commit message is rejected by `commitlint`.
- **Rule 4:** `git push` triggers the execution of unit tests and blocks push on failure.

## 🛠️ Proposed Changes

### Configuration

- **File:** `package.json` ([MODIFY])
- **Description:** Add `prepare` script for husky initialization, and set up `lint-staged` configuration.
- **Code Block / Raw Configuration:**
  ```json
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,ts,html}": [
      "eslint"
    ],
    "*.{scss,json,md}": [
      "prettier --write"
    ]
  }
  ```

- **File:** `commitlint.config.mjs` ([NEW])
- **Description:** Create commitlint configuration extending conventional config.
- **Code Block / Raw Configuration:**
  ```javascript
  export default { extends: ['@commitlint/config-conventional'] };
  ```

### Git Hooks

- **File:** `.husky/pre-commit` ([NEW])
- **Description:** Run lint-staged on pre-commit.
- **Code Block / Raw Configuration:**
  ```bash
  npx lint-staged
  ```

- **File:** `.husky/commit-msg` ([NEW])
- **Description:** Run commitlint on commit messages.
- **Code Block / Raw Configuration:**
  ```bash
  npx --no -- commitlint --edit $1
  ```

- **File:** `.husky/pre-push` ([NEW])
- **Description:** Run unit tests on pre-push.
- **Code Block / Raw Configuration:**
  ```bash
  npm run test
  ```

## 🧪 Verification Plan

- **Unit/Integration Tests:** Trigger a `git push` on a mock branch to ensure `npm run test` executes.
- **Linting & Quality:** Trigger a commit with intentional unformatted code or unconventional commit message to assert the hooks block the commit.
- **Command:** `npm run test && npm run lint`
