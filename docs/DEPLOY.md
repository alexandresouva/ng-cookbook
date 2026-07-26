# Onboarding: Release Flow & Production Deployment Guide

This document serves as a practical guide for engineers to understand the Continuous Integration (CI) and Continuous Deployment (CD) lifecycle of the Angular application, including instructions for executing deployments, managing infrastructure via Terraform, and running rollbacks on AWS.

---

## 🏷️ Versioning & Directory Strategy (SemVer)

This project enforces Semantic Versioning (SemVer) with the `v1.x.x` range (Trigger tag: `v1.*`).

The S3 bucket directory layout is structured as follows:

```text
s3://[bucket-name]/
  ├── index.html                  # Active entry point for users
  └── builds/
       ├── from-tags/
       │    ├── v1.0.0-rc.1/      # Versioned Release Candidates (DEV)
       │    └── v1.0.0/           # Versioned Stable Releases (PROD)
       └── from-branches/
            ├── 7a087d7/          # Sandbox commit SHA builds (DEV)
            └── abb6455/
```

### 🧹 Branch Build Cleanup Policy:

> 💡 **NOTE:** To prevent accumulation of obsolete test assets in S3, an AWS Lifecycle Policy configuration automatically expires and deletes all folders and objects under `builds/from-branches/` exactly **30 days** after their creation date. Immutable tag releases under `builds/from-tags/` are preserved indefinitely for auditing.

---

## 🚦 Pipeline Overview

The automation pipeline (GitHub Actions) runs linting and testing concurrently on PRs or branch pushes. Real deployments only occur through manual triggers or tag pushes:

- **Branch Deployments (Sandbox Preview):** Manually triggered via GitHub actions by selecting a branch. Deploys to the **DEV S3 bucket** under `/builds/from-branches/[short-sha]/`.
- **Release Candidate Deployments (DEV Release):** Triggered by pushing a tag with a `-rc` suffix (e.g., `v1.0.0-rc.1`). Deploys to the **DEV S3 bucket** under `/builds/from-tags/[tag]/`.
- **Stable Production Deployments (PROD Release):** Triggered by pushing a stable tag (e.g., `v1.0.0`). Verifies the presence of a matching Release Candidate prerequisite tag in Git history. Deploys to the **PROD S3 bucket** under `/builds/from-tags/[tag]/`.

---

## 🧪 Deploying to DEV (Testing & QA Environment)

### Option A: Manual Sandbox Deployment (From any Branch)

To test and validate a feature branch before merging:

1. Navigate to the **Actions** tab of the repository on GitHub.
2. Select **`Deploy SPA`** from the left workflow menu.
3. Click the **`Run workflow`** dropdown.
4. Select the target feature branch under the **`Use workflow from`** menu.
5. Click **`Run workflow`**.
6. The pipeline compiles the build, uploads it to `/builds/from-branches/[short-sha]/` in the **DEV bucket** (`ng-cookbook-front-end-dev`), and updates the DEV CDN.

### Option B: Official Release Candidate Deployment (From Tag)

To publish an official Release Candidate for QA verification:

1. Merge the Pull Request into the main branch (`main`).
2. Create and push a Git Tag matching the SemVer standard with a `-rc.X` suffix:
   ```bash
   git tag v1.0.0-rc.1
   git push origin v1.0.0-rc.1
   ```
3. The pipeline runs, uploads files to `/builds/from-tags/v1.0.0-rc.1/` in the **DEV bucket**, and updates the DEV CDN.

---

## 🚀 Deploying to PROD (Production Environment)

Deploying to production requires a verified Release Candidate tag (`v1.x.x-rc.*`) in the repository history. If no matching RC tag is found, the stable deployment job will fail immediately.

1. Ensure the Release Candidate tag (`v1.0.0-rc.1`) has been validated and approved.
2. Create and push the stable tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. The pipeline verifies the tag format, checks the RC prerequisite, compiles the application, uploads it to `/builds/from-tags/v1.0.0/` in the **PROD bucket** (`ng-cookbook-front-end-prod`), and updates the PROD CDN.

---

## 🔄 Instant Rollback (Emergency Recovery)

Because the pipeline preserves the complete history of all builds in versioned directories under `/builds/from-tags/` in S3, a rollback does not require recompiling code or running a new pipeline.

To perform a rollback, copy the target version's `index.html` back to the root of the respective S3 bucket and invalidate the CDN.

### Rollback Commands (AWS CLI):

Execute the commands below, replacing the bucket name, distribution ID, and version path with the target values:

```bash
# 1. Overwrite the root index.html with the target version's index
aws s3 cp \
  s3://ng-cookbook-front-end-prod/builds/from-tags/v1.0.0/index.html \
  s3://ng-cookbook-front-end-prod/index.html \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=0, s-maxage=86400, must-revalidate" --content-type "text/html"

# 2. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E9PK53IM6YGYP \
  --paths "/index.html"
```

---

## ⚙️ Infrastructure Management (Terraform)

All infrastructure configurations are managed locally in the **`/infra/terraform/`** directory.

### Initializing the Project:

Before running Terraform plans, navigate to the directory and initialize the provider plugins:

```bash
cd infra/terraform
terraform init
```

### Reviewing Changes:

To review the differences between the HCL configurations and the cloud resources:

```bash
terraform plan
```

### Adopting Legacy Production Resources (Import):

To manage existing manual production assets without recreation or service interruption, import them into the Terraform state:

```bash
# Import the existing production S3 bucket
terraform import module.prod.aws_s3_bucket.spa_bucket ng-cookbook-front-end-prod

# Import the existing production CloudFront distribution
terraform import module.prod.aws_cloudfront_distribution.spa_distribution E9PK53IM6YGYP
```

### Applying Changes:

To deploy or update infrastructure changes to AWS:

```bash
terraform apply
```
