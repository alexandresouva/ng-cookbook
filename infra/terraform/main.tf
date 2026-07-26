# DEV Environment (Hospedagem de Teste e Homologação)
module "dev" {
  source                   = "./modules/spa_hosting"
  bucket_name              = "${var.project_name}-front-end-dev"
  environment              = "dev"
  enable_lifecycle_cleanup = true
}

# PROD Environment (Hospedagem de Produção Definitiva)
module "prod" {
  source                   = "./modules/spa_hosting"
  bucket_name              = "${var.project_name}-front-end-prod"
  environment              = "prod"
  enable_lifecycle_cleanup = false
}

# Policy allowing GitHub Actions to access S3 buckets and invalidate CloudFront distributions
resource "aws_iam_policy" "github_actions_deploy" {
  name        = "${var.project_name}-github-actions-deploy-policy"
  description = "Dynamic permissions for GitHub Actions to deploy Standard SPA"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Resource = [
          module.dev.bucket_arn,
          "${module.dev.bucket_arn}/*",
          module.prod.bucket_arn,
          "${module.prod.bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation"
        ]
        Resource = [
          module.dev.cloudfront_distribution_arn,
          module.prod.cloudfront_distribution_arn
        ]
      }
    ]
  })
}

# Attach the policy to the existing bootstrap IAM Role
resource "aws_iam_role_policy_attachment" "github_actions_attach" {
  role       = "github-actions-deploy-role"
  policy_arn = aws_iam_policy.github_actions_deploy.arn
}
