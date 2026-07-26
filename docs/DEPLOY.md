# Onboarding: Fluxo de Release e Deploy de Produção (SemVer)

Bem-vindo ao projeto! Este documento serve como guia prático e de bordo para novos engenheiros que precisam entender como funciona o ciclo de vida de Integração Contínua (CI) e Implantação Contínua (CD) do nosso aplicativo Angular, e como realizar novos deploys e rollbacks de forma segura na infraestrutura serverless da AWS.

---

## 🚦 Visão Geral da Pipeline

A nossa esteira de automação (GitHub Actions) é separada em etapas bem definidas para garantir a qualidade do código antes de qualquer deploy:

1. **Validação Concorrente (CI):** Ao abrir um Pull Request (PR) ou commitar em branches de desenvolvimento, a pipeline executa o **Linter** (regras de formatação) e os **Testes Unitários** em paralelo.
2. **Compilação Condicionada (Build):** O processo de build de produção do Angular só inicia se as etapas de linter e testes unitários passarem com sucesso.
3. **Deploy Restrito (CD):** O deploy na nuvem da AWS é bloqueado para commits comuns de desenvolvimento. Ele está configurado de forma rígida para rodar **apenas** quando uma Tag Git que segue o padrão SemVer for criada e enviada para o repositório.

---

## 🧪 Como Publicar em DEV/UAT (Ambiente de Testes)

Para publicar suas alterações e disponibilizá-las para testes e homologação por parte da equipe (UAT/DEV):

1. Finalize e mescle seu Pull Request na branch de integração (`variation/standard-app`).
2. Crie uma tag do Git utilizando o padrão SemVer com o sufixo `-rc.X` (Release Candidate):
   ```bash
   git tag v1.0.0-rc.1
   git push origin v1.0.0-rc.1
   ```
3. A pipeline irá disparar automaticamente. Ela irá compilar o Angular injetando o caminho `/builds/v1.0.0-rc.1/` nas referências e fará o upload dos arquivos para esta subpasta isolada no S3, atualizando o arquivo de entrada `index.html` na raiz do S3 para apontar para a nova versão.

---

## 🚀 Como Publicar em PROD (Ambiente de Produção)

O deploy para produção segue regras estritas de governança para garantir que nenhuma versão vá ao ar sem ter sido homologada anteriormente em DEV/UAT.

### Regra de Ouro (Prerrequisito de RC):

> ⚠️ **IMPORTANTE:** Para implantar uma versão estável em produção (ex: `v1.0.0`), é **obrigatório** que já tenha sido criada e enviada anteriormente a tag Release Candidate correspondente (ex: `v1.0.0-rc.1`). Se a pipeline não encontrar o histórico do RC no repositório, o deploy de produção será **abortado** com erro.

### Passo a Passo:

1. Certifique-se de que a tag `v1.0.0-rc.*` foi testada e aprovada.
2. Crie e envie a tag estável (sem sufixos):
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. A pipeline executará os testes de segurança, validará a presença da tag RC correspondente, compilará o Angular, fará o upload para `/builds/v1.0.0/` no S3 e atualizará o index na raiz do S3, invalidando o cache do CloudFront em seguida.

---

## 🔄 Como Fazer um Rollback Instantâneo (Recuperação de Erros)

Caso ocorra um problema crítico em produção após a publicação de uma versão e você precise retornar para a versão estável anterior imediatamente:

Como mantemos o histórico de todas as builds organizadas por suas respectivas Tags dentro da pasta `/builds/` no S3, você não precisa compilar código ou rodar a pipeline inteira novamente.

Para fazer o rollback, basta apontar o `index.html` da raiz de volta para a pasta da build anterior.

### Comando de Rollback (AWS CLI):

Execute o comando abaixo substituindo `v1.0.0` pela versão estável anterior desejada:

```bash
aws s3 cp \
  s3://ng-cookbook-front-end/builds/v1.0.0/index.html \
  s3://ng-cookbook-front-end/index.html \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=0, s-maxage=86400, must-revalidate"
```

Em seguida, faça a invalidação do cache no CloudFront:

```bash
aws cloudfront create-invalidation \
  --distribution-id E9PK53IM6YGYP \
  --paths "/index.html"
```

O site voltará instantaneamente para a versão anterior para todos os usuários mundiais!

---

## 🔘 Execução de Deploy Manual pelo Painel do GitHub

Se você precisar refazer o deploy de uma tag específica manualmente:

1. Vá até a aba **Actions** do repositório no GitHub.
2. No menu esquerdo, clique em **`CI/CD - Deploy SPA`**.
3. Clique no botão **`Run workflow`** no lado direito.
4. No campo **`release_version`**, digite o nome exato da tag Git que você deseja publicar (ex: `v1.0.0-rc.1`).
5. Clique no botão verde de confirmação.
6. _Nota:_ Se você digitar um nome de tag que não existe no repositório, ou selecionar uma branch em vez de uma tag, a pipeline abortará com erro para proteção.
