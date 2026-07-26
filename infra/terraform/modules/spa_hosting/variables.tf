variable "bucket_name" {
  type        = string
  description = "The name of the S3 bucket to create"
}

variable "environment" {
  type        = string
  description = "The environment suffix (e.g. dev-uat, prod)"
}

variable "enable_lifecycle_cleanup" {
  type        = bool
  description = "Whether to configure S3 lifecycle expiration policy for branch deploys"
  default     = false
}
