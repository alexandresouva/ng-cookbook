import os
import sys
import json
import subprocess
from pydantic import BaseModel
from typing import List
import google.antigravity as agy

# 1. Define the Pydantic Schema for Structured Review
class PRComment(BaseModel):
    path: str
    line: int
    comment: str

class PRReview(BaseModel):
    comments: List[PRComment]
    summary: str
    approved: bool

async def run_review():
    # 2. Get GitHub Actions Context
    event_path = os.getenv("GITHUB_EVENT_PATH")
    if not event_path:
        print("Error: GITHUB_EVENT_PATH not set. This script must run in GitHub Actions.")
        return

    with open(event_path, "r") as f:
        event_data = json.load(f)

    pr_number = event_data["pull_request"]["number"]
    repo = os.getenv("GITHUB_REPOSITORY")

    print(f"Starting architectural review for PR #{pr_number} in repo {repo}...")

    # 3. Fetch PR Diff (excluding package-lock.json)
    try:
        # In GHA checkout, origin/main is fetched. Compare target branch with current HEAD.
        base_ref = event_data["pull_request"]["base"]["ref"]
        # Fetch target branch to ensure it exists locally for diffing
        subprocess.run(["git", "fetch", "origin", base_ref], check=True)

        diff_proc = subprocess.run(
            ["git", "diff", f"origin/{base_ref}...HEAD", "--", ".", ":!package-lock.json"],
            capture_output=True,
            text=True,
            check=True
        )
        pr_diff = diff_proc.stdout
    except Exception as e:
        print(f"Error fetching git diff: {e}")
        return

    if not pr_diff.strip():
        print("No changes found in the PR (excluding package-lock.json). Skipping review.")
        return

    # 4. Load Architecture & Style Guidelines
    guidelines = ""
    arch_path = "docs/architecture.md"
    if os.path.exists(arch_path):
        with open(arch_path, "r") as f:
            guidelines += f"\n=== ARCHITECTURE GUIDELINES ===\n{f.read()}\n"

    rules_dir = ".agents/rules"
    if os.path.exists(rules_dir):
        for rule_file in os.listdir(rules_dir):
            if rule_file.endswith(".md"):
                with open(os.path.join(rules_dir, rule_file), "r") as f:
                    guidelines += f"\n=== RULE GUIDE: {rule_file} ===\n{f.read()}\n"

    # 5. Invoke Antigravity SDK Agent
    system_instruction = (
        "You are an elite, quiet PR Architect Reviewer bot for the Angular project.\n"
        "Your task is to analyze the provided git diff against the project guidelines.\n\n"
        "STRICT AUDITING RULES:\n"
        "1. For Source Code (.ts, .html, .css, .scss):\n"
        "   - ONLY comment if code directly violates the architecture boundaries (docs/architecture.md) or style recommendations.\n"
        "   - DO NOT suggest stylistic preferences, refactorings, or clean code tips unless there is a clear violation.\n"
        "   - If code adheres to guidelines, do not generate any comments.\n"
        "2. For Configurations (tsconfig, angular.json, eslint, package.json):\n"
        "   - Assess: Is the change necessary? Is it recommended? What are the risks of this modification?\n"
        "   - Alert and explain risks if any template default config is modified without clear rationale.\n"
        "3. Tone: Maintain a highly professional and polite technical tone."
    )

    prompt = (
        f"Review the following Pull Request diff.\n\n"
        f"{guidelines}\n\n"
        f"=== PR DIFF ===\n"
        f"{pr_diff}\n"
    )

    config = agy.LocalAgentConfig(
        system_instruction=system_instruction,
        response_schema=PRReview,
        model="gemini-2.0-flash" # flash model has higher free-tier quota limits
    )

    print("Sending diff and guidelines to Gemini for analysis...")
    try:
        async with agy.Agent(config) as agent:
            response = await agent.chat(prompt)
            review_result = await response.structured_output()
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
            print(
                "⚠️  WARNING: Gemini API quota exceeded. Skipping automated review for this run.\n"
                "   Consider upgrading your Google AI Studio plan or waiting for quota reset.\n"
                f"   Details: {error_str[:300]}"
            )
            sys.exit(0)  # Exit cleanly — do not fail the CI pipeline
        raise  # Re-raise unexpected errors

    if not review_result:
        print("Error: Failed to obtain structured output from the agent.")
        return

    # 6. Post Review to GitHub PR using gh CLI
    comments_payload = []
    for c in review_result.get("comments", []):
        comments_payload.append({
            "path": c["path"],
            "line": int(c["line"]),
            "body": c["comment"]
        })

    # Map the approval boolean to GH review event
    event_type = "APPROVE" if review_result.get("approved") else "REQUEST_CHANGES"
    # If no comments are generated, fall back to COMMENT event or APPROVE
    if not comments_payload and event_type == "REQUEST_CHANGES":
        event_type = "COMMENT"

    review_payload = {
        "body": review_result.get("summary", "Automated PR review complete."),
        "event": event_type,
        "comments": comments_payload
    }

    # Write review payload to temp JSON file
    payload_file = "temp_review_payload.json"
    with open(payload_file, "w") as f:
        json.dump(review_payload, f)

    try:
        print(f"Submitting Pull Request review as {event_type}...")
        api_endpoint = f"repos/{repo}/pulls/{pr_number}/reviews"
        subprocess.run(
            ["gh", "api", api_endpoint, "--input", payload_file],
            check=True
        )
        print("Review submitted successfully!")
    except Exception as e:
        print(f"Error submitting review to GitHub API: {e}")
    finally:
        if os.path.exists(payload_file):
            os.remove(payload_file)

if __name__ == "__main__":
    import asyncio
    asyncio.run(run_review())
