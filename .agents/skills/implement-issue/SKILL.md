---
name: implement-issue
description: Orchestrates the planning and implementation of a GitHub issue based on task ID.
---

# Skill: implement-issue

This skill instructs the agent on how to manage the branching flow of planning or implementing a GitHub issue using its ID.

---

## 🛠️ Step-by-Step Decision Tree

### Step 1: Check for Existing Specification
Verify if the Software Design Document for the requested issue ID already exists locally:
*   Check path: `.agents/sdd/sdd-issue-<ISSUE_ID>.md`

### Step 2: Branch Execution

#### Case A: The SDD File Exists
If the SDD file is found, it means the planning phase is approved. Proceed directly to implementation:
1.  Read `.agents/sdd/sdd-issue-<ISSUE_ID>.md` and the workspace root `temp_task.md` checklist.
2.  Initialize implementation steps sequentially:
    *   **Dependencies**: Install the required packages listed in the SDD.
    *   **Coding**: Create or modify the files matching the exact specification blocks in the SDD.
    *   **Update Checklist**: Mark items as completed `[x]` in `temp_task.md` as you progress.
3.  Execute the validation commands defined in the SDD (e.g. `npm run lint && npm run test`).
4.  **Clean up**: Delete the local `temp_task.md` file from the workspace root.
5.  Stop execution and notify the user that the code has been successfully generated and tested locally, awaiting their manual verification in the IDE.

#### Case B: The SDD File Does NOT Exist
If the SDD file is missing, the planning phase must run first:
1.  Invoke the `generate-sdd` skill passing the `<ISSUE_ID>`.
2.  Once the SDD at `.agents/sdd/sdd-issue-<ISSUE_ID>.md` and the `temp_task.md` checklist are created, stop execution.
3.  Notify the user that the specification has been generated and wait for their explicit approval before proceeding with implementation.
