# 🚀 Angular SPA - Roadmap de Estudos & Evolução

Este documento serve como um guia de estudo e passo a passo prático para transformar este repositório em um template robusto, modular e pronto para produção, seguindo as melhores práticas modernas do ecossistema Angular.

No futuro, este repositório poderá ser utilizado como base (boilerplate) para a inicialização de qualquer novo projeto Angular SPA.

---

## 🗺️ Visão Geral do Roadmap & Estratégia de Branches

Adotamos uma estratégia focada exclusivamente na arquitetura de aplicação única (SPA) em Angular, avaliando as duas principais abordagens de renderização web lado a lado:

```mermaid
graph TD
    %% Base Comum e CSR na Branch main
    subgraph Branch main (Vitrine - Client-Side Rendering)
        F1[Fase 1: Fundações & Qualidade] --> F2[Fase 2: IA & SDLC Automation]
        F2 --> F3[Fase 3: Testes, a11y & Mocks]
        F3 --> F4[Fase 4: Standard CSR Setup]
        F4 --> F5[Fase 5: IaC & CI/CD Automatizado]
        F5 --> F6[Fase 6: Tema do Projeto - Open/TBD]
    end

    %% Evolução para SSR
    F6 --> B_SSR[branch: variant/ssr]

    %% Variação SSR
    subgraph variant/ssr (Server-Side Rendering)
        FS7[Fase 7: Migração para Angular SSR] --> FS8[Fase 8: Deploy AWS App Runner]
    end
```

---

## 📅 Detalhamento das Fases (Branch `main`)

### 🟢 Fase 1: Fundações, Arquitetura & Qualidade de Código

- [x] **Linting & Formatting** (ESLint, Prettier, EditorConfig)
- [x] **Git Hooks** (Husky, lint-staged, Commitlint)
- [x] **Feature-Based Architecture** (Folder Structure, Path Aliases & Boundary Enforcement)
- [x] **Zod DTOs & Mappers (Anti-Corruption Layer):** Validação em runtime e sanitização de payloads de API (DTOs).
- [x] **Templates de Documentação Técnica** (ADR e RFC na pasta `docs/`)

---

### 🤖 Fase 2: IA, Agents & Automação de SDLC

- [x] **Integração de Agentes e IA**: Definição e automação do ciclo de desenvolvimento assistido por agentes (Issue Creator, SDD Generator, Code Builder e PR Submitter com commits convencionais).

---

### 🔴 Fase 3: Estrutura de Testes Automatizados, Acessibilidade (a11y) & Mocks

- [x] **Testes Unitários** (Vitest)
- [x] **Políticas de Cobertura (Coverage Thresholds a 100%)**
- [x] **Testes de Componentes / Integração local**
- [x] **Testes End-to-End (E2E)** (Playwright)
- [x] **Testes de Acessibilidade (a11y)** (Vitest-Axe)
- [x] **Estratégia de Mocking de APIs** (MSW - Mock Service Worker para offline e consistência nos testes)

---

### 🔲 Fase 4: Setup Standalone & Zoneless

- [ ] Habilitação e testes da aplicação rodando de forma **Zoneless** (sem zone.js).
- [ ] Definição do State Management local usando Signals (Signals-only).

---

### ⚙️ Fase 5: Infraestrutura como Código (Terraform) & CI/CD Automatizado

- [x] **Hospedagem Estática Inicial:** Criação manual de S3 Bucket Privado com OAC e CDN CloudFront.
- [x] **Automação de CI/CD por Tags (SemVer):** Deploy condicionado a tags `v1.*`, com trava de Release Candidate (`-rc`) para produções estáveis.
- [x] **Infraestrutura como Código (Terraform):** Gerenciamento declarativo dos buckets de desenvolvimento (`-dev`) e produção (`-prod`) com bloqueio de acesso público e políticas seguras.
- [x] **Regra de Ciclo de Vida do S3:** Remoção automática de builds sandbox de branches (`builds/from-branches/`) após 30 dias.
- [x] **Configurações de Ambientes Angular:** Criação de `environment.dev.ts` e `environment.prod.ts` gerenciados via substituições de arquivos nativas no `angular.json`.

---

### 🎨 Fase 6: Tema do Projeto & Interface do Usuário (Vitrine)

- **Status:** `Aberto / A Definir`
- [ ] Escolha e validação do tema visual e escopo de telas da aplicação SPA.
- [ ] Desenvolvimento dos componentes de UI sob padrões estéticos premium.

---

## 🔀 Evolução para Server-Side Rendering (Branch `variant/ssr`)

### 🌀 Fase 7: Migração para Angular SSR

- [ ] Execução do schematic de SSR (`ng add @angular/ssr`) para habilitar pré-renderização no servidor Node.js/Express.
- [ ] Resolução de APIs específicas do navegador (checagem de plataforma `isPlatformBrowser`).
- [ ] Otimização de SEO dinâmico, meta tags e cabeçalhos de resposta.

### 🐳 Fase 8: Deploy Conteinerizado com AWS App Runner

- [ ] Escrita do `Dockerfile` otimizado para expor o servidor Express compilado do Angular SSR.
- [ ] Pipeline de Deploy para compilar a imagem de container e enviá-la para o AWS ECR (Elastic Container Registry).
- [ ] Provisionamento do AWS App Runner gerenciando o ciclo de vida do container dinamicamente (integrado ao CloudFront).
