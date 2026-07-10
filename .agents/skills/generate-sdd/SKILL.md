---
name: generate-sdd
description: Reads a GitHub issue and generates a Software Design Document (SDD) along with a task.md checklist.
---

# Skill: generate-sdd

This skill instructs the agent on how to read a GitHub issue, analyze the workspace, and generate a Software Design Document (SDD) along with a local `task.md` checklist in the workspace root to plan development before writing code.

---

## 🛠️ Step-by-Step Procedure

### Step 1: Read the GitHub Issue

1. Retrieve the issue details from GitHub using the CLI:
   ```bash
   gh issue view <ISSUE_ID> --json title,body
   ```
2. Parse the issue details (Title, Context, Specifications, Acceptance Criteria).

### Step 2: Analyze the Codebase

1. Inspect the workspace directory structure and configurations.
2. Locate any files or paths that will be affected by the proposed changes.

### Step 3: Write the Software Design Document (SDD)

Create a new file at `.agents/sdd/sdd-issue-<ISSUE_ID>.md` using the structure below.

> [!IMPORTANT]
> **Self-Containment Rule**: The SDD must be 100% self-contained. You must copy all configuration snippets, raw code blocks, file contents and package dependency versions documented in the GitHub issue body directly into the `Proposed Changes` section of the SDD. **Do not** make reference to external local repositories or assume they exist on the developer's machine; all necessary details must live inside this SDD.

````markdown
# SDD: Issue #[ID] - [Title]

## 🎯 Objective & Scope

[Brief summary of the goal]

## 📋 Acceptance Criteria & Rules

- **Rule 1:** [Behavior or style constraint derived from the issue acceptance criteria]
- **Rule 2:** [Quality or validation constraint, e.g. linting, compiling]

## 🛠️ Proposed Changes

### [Component/Layer Name]

- **File:** `path/to/file` ([NEW] or [MODIFY])
- **Description:** [Details of changes to be made]
- **Code Block / Raw Configuration:**
  ```[language]
  [Paste here the exact file content, dependencies list, or settings extracted from the issue]
  ```
````

## 🧪 Verification Plan

- **Unit/Integration Tests:** [Write tests in `*.spec.ts` and run `npm run test`]
- **Linting & Quality:** [Run `npm run lint` and `npm run format` to assert code standards]
- **Command:** `npm run test && npm run lint`

````

### Step 4: Create the Local `temp_task.md` Checklist
Create a `temp_task.md` file in the workspace root mapping each step of the implementation. Use the following format:
```markdown
# Tasks: Issue #[ID] - [Title]

- [ ] **Phase 1: Setup & Dependencies**
  - [ ] Install packages
- [ ] **Phase 2: Implementation**
  - [ ] Write file 1
  - [ ] Write file 2
- [ ] **Phase 3: Verification**
  - [ ] Run verification commands and ensure they pass successfully
````

_(Note: If a temp_task.md already exists, back it up or overwrite it for the active task)._
