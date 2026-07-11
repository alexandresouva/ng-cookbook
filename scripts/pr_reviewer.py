"""
PR Architect Reviewer Bot
Uses the GitHub Models API (no extra API key needed — runs on GITHUB_TOKEN).
"""
import os
import sys
import json
import subprocess
import urllib.request
import urllib.error

# ---------------------------------------------------------------------------
# 1. Structured review schema (plain dicts — no external deps needed)
# ---------------------------------------------------------------------------

def build_schema_description():
    return """\
Respond ONLY with a valid JSON object matching this schema (no markdown, no extra text):
{
  "approved": <boolean>,
  "summary": "<overall review summary in markdown>",
  "comments": [
    {
      "path": "<relative file path>",
      "line": <line number as integer>,
      "comment": "<inline comment text>"
    }
  ]
}
If there are no violations, return an empty array for "comments" and set "approved" to true."""


# ---------------------------------------------------------------------------
# 2. Call GitHub Models API
# ---------------------------------------------------------------------------

def compress_diff(diff: str, max_lines: int = 800) -> str:
    """
    Strip unchanged context lines from the diff to reduce token usage.
    Keeps: file headers (---/+++/diff/index/@@) and changed lines (+/-).
    Truncates to max_lines if still too large.
    """
    kept = []
    for line in diff.splitlines():
        if (
            line.startswith(("diff ", "index ", "--- ", "+++ ", "@@", "+", "-"))
            and not line.startswith(("--- a/", "+++ b/"))  # keep these
            or line.startswith(("diff ", "index ", "--- ", "+++ ", "@@"))
        ):
            kept.append(line)
        elif line.startswith("+") or line.startswith("-"):
            kept.append(line)

    if len(kept) > max_lines:
        kept = kept[:max_lines]
        kept.append(f"\n... [diff truncated at {max_lines} lines to fit token limit] ...")

    return "\n".join(kept)


def call_github_models(system_instruction: str, prompt: str, token: str) -> dict:
    url = "https://models.inference.ai.azure.com/chat/completions"
    payload = json.dumps({
        "model": "gpt-4o",
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user",   "content": prompt}
        ],
        "max_tokens": 2048,
        "temperature": 0.1   # Low temperature → more deterministic / less hallucination
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"❌ GitHub Models API error {e.code}: {body[:400]}")
        sys.exit(1)


# ---------------------------------------------------------------------------
# 3. Main review logic
# ---------------------------------------------------------------------------

def run_review():
    # --- Context from GitHub Actions environment ---
    event_path = os.getenv("GITHUB_EVENT_PATH")
    github_token = os.getenv("GITHUB_TOKEN")
    repo = os.getenv("GITHUB_REPOSITORY")

    if not event_path or not github_token:
        print("Error: GITHUB_EVENT_PATH or GITHUB_TOKEN not set. Must run inside GitHub Actions.")
        sys.exit(1)

    with open(event_path, "r") as f:
        event_data = json.load(f)

    pr_number = event_data["pull_request"]["number"]
    base_ref  = event_data["pull_request"]["base"]["ref"]

    print(f"🔍 Starting architectural review for PR #{pr_number} in {repo}...")

    # --- Fetch diff (excluding package-lock.json) ---
    try:
        subprocess.run(["git", "fetch", "origin", base_ref], check=True, capture_output=True)
        diff_proc = subprocess.run(
            ["git", "diff", f"origin/{base_ref}...HEAD", "--", ".", ":!package-lock.json"],
            capture_output=True, text=True, check=True
        )
        pr_diff = diff_proc.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error fetching git diff: {e}")
        sys.exit(1)

    if not pr_diff.strip():
        print("✅ No relevant changes found (excluding package-lock.json). Skipping review.")
        sys.exit(0)

    # --- Load project guidelines ---
    guidelines = ""
    arch_path = "docs/architecture.md"
    if os.path.exists(arch_path):
        with open(arch_path, "r") as f:
            guidelines += f"\n=== ARCHITECTURE GUIDELINES ===\n{f.read()}\n"

    rules_dir = ".agents/rules"
    if os.path.exists(rules_dir):
        for rule_file in sorted(os.listdir(rules_dir)):
            if rule_file.endswith(".md"):
                with open(os.path.join(rules_dir, rule_file), "r") as f:
                    guidelines += f"\n=== RULE GUIDE: {rule_file} ===\n{f.read()}\n"

    # --- Build prompts ---
    system_instruction = (
        "You are an elite, quiet PR Architect Reviewer bot for an Angular project.\n"
        "Your primary goal is to APPROVE the PR silently when the code is clean.\n\n"
        "STRICT AUDITING RULES:\n"
        "1. Source Code (.ts, .html, .css, .scss):\n"
        "   - ONLY flag a direct violation of the architecture or style rules provided.\n"
        "   - DO NOT suggest stylistic preferences, refactorings, or personal opinions.\n"
        "   - If the code follows the guidelines, leave 'comments' empty.\n"
        "2. Config files (tsconfig, angular.json, eslint, package.json):\n"
        "   - Evaluate: Is this change necessary? Is it recommended? Any breakage risk?\n"
        "   - Alert only if a core template constraint is weakened without rationale.\n"
        "3. Tone: professional, polite, and concise.\n\n"
        + build_schema_description()
    )

    prompt = (
        f"Review the following Pull Request diff against the project guidelines.\n\n"
        f"{guidelines}\n\n"
        f"=== PR DIFF ===\n"
        f"{pr_diff}\n"
    )

    # --- Compress diff to reduce token usage ---
    compressed_diff = compress_diff(pr_diff)
    original_lines  = len(pr_diff.splitlines())
    compressed_lines = len(compressed_diff.splitlines())
    print(f"📊 Diff compressed: {original_lines} → {compressed_lines} lines (removed unchanged context)")

    prompt = (
        f"Review the following Pull Request diff against the project guidelines.\n\n"
        f"{guidelines}\n\n"
        f"=== PR DIFF (changed lines only) ===\n"
        f"{compressed_diff}\n"
    )

    # --- Call GitHub Models ---
    print("📡 Sending diff to GitHub Models (gpt-4o) for analysis...")
    review_result = call_github_models(system_instruction, prompt, github_token)

    if not review_result:
        print("Error: Empty response from GitHub Models API.")
        sys.exit(1)

    # --- Build GitHub Review payload ---
    raw_comments = review_result.get("comments", [])
    comments_payload = [
        {"path": c["path"], "line": int(c["line"]), "body": c["comment"]}
        for c in raw_comments
        if isinstance(c.get("line"), (int, str)) and str(c.get("line", "")).isdigit()
    ]

    approved   = review_result.get("approved", True)
    event_type = "APPROVE" if approved else "REQUEST_CHANGES"

    # Can't REQUEST_CHANGES with zero inline comments — fallback to COMMENT
    if not comments_payload and not approved:
        event_type = "COMMENT"

    review_payload = {
        "body":     review_result.get("summary", "Automated PR review complete."),
        "event":    event_type,
        "comments": comments_payload
    }

    # --- Submit review via gh CLI ---
    payload_file = "/tmp/pr_review_payload.json"
    with open(payload_file, "w") as f:
        json.dump(review_payload, f)

    try:
        print(f"📝 Submitting review as '{event_type}' with {len(comments_payload)} inline comment(s)...")
        subprocess.run(
            ["gh", "api", f"repos/{repo}/pulls/{pr_number}/reviews", "--input", payload_file],
            check=True
        )
        print("✅ Review submitted successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error submitting review to GitHub API: {e}")
        sys.exit(1)
    finally:
        if os.path.exists(payload_file):
            os.remove(payload_file)


if __name__ == "__main__":
    run_review()
