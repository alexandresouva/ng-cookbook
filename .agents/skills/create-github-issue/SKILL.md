---
name: create-github-issue
description: Creates a structured issue (technical card or BDD) in the GitHub repository using curl or the gh CLI.
---

# Skill: create-github-issue

This skill instructs the agent on how to generate and post structured issues to GitHub for the `alexandresouva/ng-cookbook` repository.

## 📋 Template Conventions

Whenever this skill is triggered, create the issue using one of the two formats below:

### Format A: Technical Card (Default for Refactorings, Infra, and Quality)
*   **Title:** `Phase [X]: [Feature/Task Name]`
*   **Issue Body:**
    ```markdown
    ## 📝 Context
    [High-level explanation of why this task is needed and its impact on the project]

    ## ⚙️ Technical Specifications
    - [ ] [Technical sub-task 1]
    - [ ] [Technical sub-task 2]

    ## ✅ Acceptance Criteria
    - [ ] [Technical acceptance/validation criteria 1]
    - [ ] [Technical acceptance/validation criteria 2]
    ```

### Format B: BDD Card / User Story (For User-Facing Features)
*   **Title:** `Phase [X]: [Feature Name]`
*   **Issue Body:**
    ```markdown
    ## 👤 User Story
    **As a** [type of user]
    **I want to** [action/feature]
    **So that** [value/benefit]

    ## 🎭 Acceptance Criteria (Gherkin BDD)
    **Scenario:** [Scenario Title]
      **Given** [initial context]
      **When** [action performed]
      **Then** [expected result]

    ## ✅ Implementation Checklist
    - [ ] [Sub-task 1]
    ```

---

## 🛠️ Execution Procedure (REST API or CLI)

Follow these steps to post the issue on GitHub:

### Step 1: Retrieve Access Token
Attempt to read the GitHub token from one of the following sources, in this order:
1.  **Environment Variable**: `$GITHUB_TOKEN`
2.  **GitHub CLI (if installed)**: Running `gh auth token`
If no credentials are found, prompt the user in the chat to provide a temporary token in environment variable format before continuing.

### Step 2: Execute GitHub API Call
If the `gh` CLI is installed and authenticated, execute:
```bash
gh issue create --repo alexandresouva/ng-cookbook --title "TITLE_HERE" --body "MARKDOWN_BODY_HERE"
```

Otherwise, use `curl` against the official REST API:
```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN_FOUND" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/alexandresouva/ng-cookbook/issues \
  -d @- <<EOF
{
  "title": "TITLE_HERE",
  "body": "MARKDOWN_BODY_HERE"
}
EOF
```
*(Note: Ensure all quotes and special characters are properly escaped in the JSON body payload).*
