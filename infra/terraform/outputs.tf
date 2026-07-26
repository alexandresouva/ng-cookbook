output "dev_uat_bucket_name" {
  value       = module.dev_uat.bucket_name
  description = "The name of the DEV/UAT S3 bucket"
}

output "dev_uat_cloudfront_domain" {
  value       = module.dev_uat.cloudfront_domain_name
  description = "The CloudFront domain name for DEV/UAT"
}

output "dev_uat_cloudfront_distribution_id" {
  value       = module.dev_uat.cloudfront_distribution_id
  description = "The CloudFront distribution ID for DEV/UAT"
}

output "prod_bucket_name" {
  value       = module.prod.bucket_name
  description = "The name of the PROD S3 bucket"
}

output "prod_cloudfront_domain" {
  value       = module.prod.cloudfront_domain_name
  description = "The CloudFront domain name for PROD"
}

output "prod_cloudfront_distribution_id" {
  value       = module.prod.cloudfront_distribution_id
  description = "The CloudFront distribution ID for PROD"
}
