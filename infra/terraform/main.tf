# DEV / UAT Environment (Hospedagem de Teste e Homologação)
module "dev_uat" {
  source                   = "./modules/spa_hosting"
  bucket_name              = "${var.project_name}-front-end-dev-uat"
  environment              = "dev-uat"
  enable_lifecycle_cleanup = true
}

# PROD Environment (Hospedagem de Produção Definitiva - Legado Adoptado)
module "prod" {
  source                   = "./modules/spa_hosting"
  bucket_name              = "${var.project_name}-front-end"
  environment              = "prod"
  enable_lifecycle_cleanup = false
}
