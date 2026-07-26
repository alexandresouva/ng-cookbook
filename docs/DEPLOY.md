# Onboarding: Release Flow & Production Deployment Guide

This document serves as a practical guide for engineers to understand the Continuous Integration (CI) and Continuous Deployment (CD) lifecycle of the Angular application, including instructions for executing deployments and rollbacks on the AWS serverless infrastructure.

---

## 🚦 Pipeline Overview

The automation pipeline (GitHub Actions) executes validation steps to ensure code quality prior to any deployment:

1. **Concurrent Validation (CI):** Upon opening a Pull Request (PR) or pushing commits to development branches, the pipeline runs **Code Linting** and **Unit Testing** concurrently in isolated runners.
2. **Conditional Compilation (Build):** The production build step runs only if the linting and testing steps complete successfully.
3. **Restricted Deployment (CD):** Deployment to AWS is blocked for standard development commits. The pipeline is configured to deploy **only** when a Git Tag matching the SemVer standard is created and pushed.

---

## 🧪 Deploying to DEV/UAT (Testing Environment)

To publish modifications for testing and quality assurance (QA/UAT):

1. Merge the Pull Request into the integration branch (`variation/standard-app`).
2. Create and push a Git Tag using the SemVer standard with a `-rc.X` suffix (Release Candidate):
   ```bash
   git tag v1.0.0-rc.1
   git push origin v1.0.0-rc.1
   ```
3. The pipeline triggers automatically, compiling the Angular application with the prefix `/builds/v1.0.0-rc.1/` and uploading the files to the versioned S3 subdirectory. The root `index.html` file is then updated to point to the new version.

---

## 🚀 Deploying to PROD (Production Environment)

Deploying to production requires strict compliance checks to ensure that no code goes live without prior validation in DEV/UAT.

### Release Candidate Prerequisite Check:

> ⚠️ **IMPORTANT:** To deploy a stable release (e.g., `v1.0.0`), a corresponding Release Candidate tag (e.g., `v1.0.0-rc.1` or `v1.0.0-rc.2`) **must** already exist in the repository history. If no matching RC tag is found, the deployment job will **fail** immediately.

### Deployment Steps:

1. Ensure the Release Candidate tag (`v1.0.0-rc.*`) has been validated and approved.
2. Create and push the stable tag (without suffixes):
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. The pipeline verifies the tag format, checks for the matching RC prerequisite, compiles the application, uploads it to `/builds/v1.0.0/` in the S3 bucket, updates the root `index.html` file, and invalidates the CloudFront cache.

---

## 🔄 Instant Rollback (Emergency Recovery)

If a critical issue occurs in production and the application must be rolled back to a previous stable state:

Because the pipeline preserves the complete history of all builds in versioned directories under `/builds/` in S3, a rollback does not require recompiling code or running a new pipeline.

To perform a rollback, the root `index.html` file in S3 must be updated to point back to the previous stable build directory.

### Rollback Commands (AWS CLI):

Execute the command below, replacing `v1.0.0` with the target stable version:

```bash
aws s3 cp \
  s3://ng-cookbook-front-end/builds/v1.0.0/index.html \
  s3://ng-cookbook-front-end/index.html \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=0, s-maxage=86400, must-revalidate"
```

Then, invalidate the CloudFront cache:

```bash
aws cloudfront create-invalidation \
  --distribution-id E9PK53IM6YGYP \
  --paths "/index.html"
```

The site reverts to the selected version instantly.

---

## 🔘 Manual Deployments via GitHub UI

To manually re-trigger a deployment for an existing tag:

1. Navigate to the **Actions** tab of the repository on GitHub.
2. Under the workflows list on the left, select **`CI/CD - Deploy SPA`**.
3. Click the **`Run workflow`** button on the right.
4. In the **`release_version`** input field, type the exact name of the Git Tag to publish (e.g., `v1.0.0-rc.1`).
5. Click the green **`Run workflow`** button.
6. _Note:_ If the specified tag does not exist in the repository, or if a branch is selected instead of a tag, the pipeline will fail.
