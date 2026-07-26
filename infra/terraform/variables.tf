variable "aws_region" {
  type        = string
  description = "The AWS region to deploy resources into"
  default     = "us-east-2"
}

variable "project_name" {
  type        = string
  description = "Name prefix for the project resources"
  default     = "ng-cookbook"
}
