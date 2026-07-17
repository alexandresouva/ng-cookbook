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
    - Determine the most appropriate **Conventional Commits prefix** for the work done (e.g. `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`, `style`).
    - Extract a very short, kebab-cased semantic description of what is being done (e.g., `setup-linting-formatting`, `user-authentication`, `fix-memory-leak`).
    - _Examples_: Setup tasks and configs map to `chore` or `ci`; new screens map to `feat`; bugfixes map to `fix`.

### Step 3: Branching & Committing

1.  Verify that you are on the correct active feature branch (which was created at the beginning by the `implement-issue` skill):
    ```bash
    git branch --show-current
    ```
2.  Stage the modified and created files:
    ```bash
    git add .
    ```
3.  Commit the changes using a conventional commit message with the prefix, the issue number as the **scope**, and a brief description:
    ```bash
    git commit -m "<prefix>(#<ISSUE_ID>): [short description]"
    ```
    _Example_: `chore(#1): setup linting and formatting rules`

### Step 4: Visual Evidence Gathering (For UI/Visual Tasks Only)

1.  **Analyze Visual Impact**: Detect if the changes modify visual/UI aspects (e.g., changes to CSS/SCSS, HTML templates, UI components, Storybook stories).
2.  **Spin-up Dev Server**: If the changes are visual:
    - Start the local dev server (e.g. `npm run start` or `npm run dev`) or Storybook (`npm run storybook`) in the background.
3.  **Capture Screenshot via Browser Subagent**:
    - Launch the `browser_subagent` to navigate to the local application port (e.g., `http://localhost:4200` or `http://localhost:6006`).
    - Interact as necessary and capture a high-resolution screenshot of the component/page.
    - Stop the background dev server.
    - Save the screenshot locally in the repository at `.agents/evidence/issue-<ISSUE_ID>-evidence.png`.
4.  **Non-visual Fallback**: If the changes are purely logical (e.g., configs, backend scripts, logic code), skip this capture step and write `N/A (Non-visual task)` in the evidence section.

### Step 5: Pushing & Pull Request Creation

1.  **Pushing Branch**: Push the branch to the remote origin.
    - _Note_: If SSH authentication is denied (`Permission denied (publickey)`), use the active GitHub CLI token to push via HTTPS:
      ```bash
      git push https://x-access-token:$(gh auth token)@github.com/alexandresouva/ng-cookbook.git <branch_name>
      ```
2.  **Generate Structured PR Body**: Draft a professional markdown Pull Request description containing:
    ```markdown
    ## 📝 Description

    - [Bullet points summarizing the changes implemented]

    ## 🧪 Verification & Tests

    - [Describe verification commands executed (e.g. npm run lint) and results]

    ## 📸 Visual Evidence

    [Embed screenshot if captured, i.e., `![Visual Evidence](.agents/evidence/issue-<ISSUE_ID>-evidence.png)`, or state `N/A (Non-visual task)`]

    ---

    Closes #<ISSUE_ID>
    ```
3.  **Create PR**: Create the Pull Request on GitHub using the explicit branch head flag to prevent upstream errors:
    ```bash
    gh pr create --head <branch_name> --title "<prefix>(#<ISSUE_ID>): [Issue Title]" --body "STRUCTURED_BODY_TEXT"
    ```
4.  **Final Cleanup**:
    - Delete the local temporary SDD file:
      ```bash
      rm -f .agents/sdd/sdd-issue-<ISSUE_ID>.md
      ```
5.  Output the URL of the created Pull Request to the developer.
