# Arquitetura & Organização de Pastas (Feature-Based)

Esta documentação descreve as diretrizes arquiteturais recomendadas para este projeto Angular. Nosso objetivo é manter o código modular, altamente coeso, fracamente acoplado e de fácil escala.

---

## 🏗️ Padrão Feature-Based (Baseado em Funcionalidades)

Em vez de organizar o código por tipo técnico (`components/`, `services/`, `pipes/`), nós organizamos nosso código ao redor de **domínios ou regras de negócio** chamados de **Features** (ex: `auth`, `products`, `billing`).

Cada feature deve ser o mais autossuficiente possível.

### Estrutura de Pastas Recomendada

```text
src/
└── app/
    ├── core/                # Recursos globais de instância única (Singletons)
    │   ├── guards/          # Guards globais (ex: auth.guard.ts)
    │   ├── interceptors/    # Interceptors HTTP (ex: auth.interceptor.ts)
    │   └── services/        # Serviços globais (ex: theme.service.ts)
    │
    ├── shared/              # Recursos reutilizáveis compartilhados entre features
    │   ├── components/      # Componentes UI reutilizáveis (ex: button, input, modal)
    │   ├── directives/      # Diretivas globais
    │   └── pipes/           # Pipes reutilizáveis
    │
    └── features/            # Domínios de negócio independentes
        ├── products/        # Exemplo de Feature: Produtos
        │   ├── data-access/ # Gerenciamento de estado e chamadas API
        │   ├── feature/     # Componentes inteligentes / Páginas com rotas
        │   ├── ui/          # Componentes apresentacionais da feature
        │   └── utils/       # Helpers específicos deste domínio
        │
        └── checkout/        # Exemplo de Feature: Checkout
            ├── data-access/
            ├── feature/
            ├── ui/
            └── utils/
```

---

## 🧩 Divisão Interna das Features (Padrão Nx/DDD)

Inspirado nas diretrizes do Nx monorepo, cada feature é segmentada em sub-responsabilidades específicas:

### 1. `data-access`
Contém a lógica de busca e gerenciamento de estado (Store).
*   **O que contém:** Serviços HTTP, store do NgRx ou State baseado em Signals, guards específicos de acesso a dados.
*   **Regra:** Não deve conter elementos visuais (HTML/CSS), apenas lógica e dados.

### 2. `feature`
Componentes inteligentes que conectam a interface com os dados (`data-access`).
*   **O que contém:** Componentes agregadores que gerenciam a orquestração da tela, resolvem dados de rotas, despacham ações.
*   **Regra:** Geralmente possui rotas associadas (`products.routes.ts`).

### 3. `ui`
Componentes de interface puramente visuais e reaproveitáveis dentro desta feature específica.
*   **O que contém:** Componentes apresentacionais ("burros") que recebem dados via inputs (`input()`) e notificam eventos via outputs (`output()`).
*   **Regra:** Não injetam serviços de dados diretamente.

### 4. `utils`
Utilitários específicos que não fazem sentido estarem globais no `shared/`.
*   **O que contém:** Tipagem específica, formatadores de data locais, helpers matemáticos para aquela tela.

---

## 💡 Princípios de Desenvolvimento

1.  **Strict Standalone Components:** Todos os novos componentes, diretivas e pipes devem ser standalone (`standalone: true`). Não utilizamos `NgModule`.
2.  **Signals First:** Priorize o uso de `signals` e `computed` para reatividade local em substituição ao RxJS (ex: gerenciamento de estado de UI simples, formulários). Use RxJS (`Observable`) principalmente para chamadas assíncronas assíncronas HTTP ou fluxos complexos de tempo/concorrência.
3.  **Strict Lint Rules:** Imports devem sempre ser limpos. Evite imports relativos muito longos (ex: `../../../../shared`). Prefira caminhos com aliases (ex: `@shared/*`, `@core/*`).
