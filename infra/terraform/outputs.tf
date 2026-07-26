output "dev_bucket_name" {
  value       = module.dev.bucket_name
  description = "The name of the DEV S3 bucket"
}

output "dev_cloudfront_domain" {
  value       = module.dev.cloudfront_domain_name
  description = "The CloudFront domain name for DEV"
}

output "dev_cloudfront_distribution_id" {
  value       = module.dev.cloudfront_distribution_id
  description = "The CloudFront distribution ID for DEV"
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
