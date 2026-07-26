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
