---
name: submit-issue
description: Commits, pushes, and opens a GitHub Pull Request with conventional commit naming conventions based on task ID and GitHub labels.
---

# Skill: submit-issue

This skill instructs the agent on how to automatically commit, push, and open a semantically versioned Pull Request for a completed issue.

---

## 🛠️ Step-by-Step Submitter Flow

### Step 1: Pre-Commit Checks
1.  Verify the workspace has no active local checklist files (`temp_task.md` or similar temp checklist files must have been deleted or cleaned up).

### Step 2: Semantic Type Detection
1.  Retrieve the issue details from GitHub using the CLI:
    ```bash
    gh issue view <ISSUE_ID> --json title,body,labels
    ```
2.  **Semantic Inference**: Read and analyze the entire JSON output (title, body description, and tags) using natural language understanding:
    *   Determine the most appropriate **Conventional Commits prefix** for the work done (e.g. `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`, `style`).
    *   Extract a very short, kebab-cased semantic description of what is being done (e.g., `setup-linting-formatting`, `user-authentication`, `fix-memory-leak`).
    *   *Examples*: Setup tasks and configs map to `chore` or `ci`; new screens map to `feat`; bugfixes map to `fix`.

### Step 3: Branching & Committing
1.  Create and checkout a new local branch using the dynamic prefix and the kebab-case short description:
    ```bash
    git checkout -b <prefix>/<kebab-case-short-description>
    ```
2.  Stage the modified and created files (specifically ensuring the permanent Software Design Document `.agents/sdd/sdd-issue-<ISSUE_ID>.md` is included in the staging area):
    ```bash
    git add .
    ```
3.  Commit the changes using a conventional commit message containing the prefix, a brief description, and the issue number reference:
    ```bash
    git commit -m "<prefix>: [short description] #<ISSUE_ID>"
    ```
    *Example*: `chore: setup linting and formatting rules #1`

### Step 4: Pushing & Pull Request Creation
1.  Push the newly created branch to the remote origin:
    ```bash
    git push -u origin <prefix>/issue-<ISSUE_ID>
    ```
2.  Create a Pull Request using the GitHub CLI linking to the original issue:
    ```bash
    gh pr create --title "<prefix>: [Issue Title]" --body "Closes #<ISSUE_ID>"
    ```
3.  Capture the output URL of the Pull Request and present it to the developer.
