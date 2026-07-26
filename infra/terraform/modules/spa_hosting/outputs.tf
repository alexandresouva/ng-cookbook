output "bucket_name" {
  value       = aws_s3_bucket.spa_bucket.id
  description = "The S3 bucket name"
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.spa_distribution.domain_name
  description = "The CloudFront CDN domain name"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.spa_distribution.id
  description = "The CloudFront distribution ID"
}

output "bucket_arn" {
  value       = aws_s3_bucket.spa_bucket.arn
  description = "The S3 bucket ARN"
}

output "cloudfront_distribution_arn" {
  value       = aws_cloudfront_distribution.spa_distribution.arn
  description = "The CloudFront distribution ARN"
}
