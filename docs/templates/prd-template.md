# PRD: [Nome da Funcionalidade / Épico]

- **Product Owner / PM:** [Nome]
- **Tech Lead:** [Nome]
- **Status:** [Rascunho | Em Definição | Pronto para Engenharia | Em Desenvolvimento | Lançado]
- **Data de Criação:** [AAAA-MM-DD]
- **Link para Jira/Trello/Epic:** [Link]

---

## 1. Visão Geral e Objetivos (Overview & Objectives)

_O que estamos construindo e por que isso importa? Qual problema de negócio ou do cliente estamos tentando resolver?_

### 1.1. Objetivo Geral

_Descreva em 1 ou 2 frases o objetivo principal da iniciativa._

### 1.2. Objetivos de Negócio (KPIs)

_Como saberemos que fomos bem-sucedidos? Quais métricas de negócio esperamos impactar?_

- _Ex: Aumentar a taxa de conversão do checkout em 5%._
- _Ex: Reduzir o tempo de onboarding do usuário de 10 min para 3 min._

## 2. Personas e Público-Alvo (Target Audience)

_Quem é o usuário final desta funcionalidade? Descreva brevemente suas necessidades específicas._

- **Persona A ([Nome/Perfil]):** [Ex: Usuário final móvel que busca agilidade na compra.]
- **Persona B ([Nome/Perfil]):** [Ex: Administrador interno que aprova transações manuais.]

## 3. Requisitos do Produto (Product Requirements)

_Esta é a lista priorizada de recursos que compõem o escopo do desenvolvimento._

_Use a priorização MoSCoW (Must-have, Should-have, Could-have, Won't-have neste momento)._

| ID         | Requisito / User Story                                          | Prioridade | Critérios de Aceitação / Comportamento Esperado |
| :--------- | :-------------------------------------------------------------- | :--------: | :---------------------------------------------- |
| **REQ-01** | _Como [Persona], quero [Funcionalidade], para que [Benefício]._ |  **Must**  | - Critério 1<br>- Critério 2                    |
| **REQ-02** | _Como [Persona], quero [Funcionalidade], para que [Benefício]._ | **Should** | - Critério 1                                    |
| **REQ-03** | _Como [Persona], quero [Funcionalidade], para que [Benefício]._ | **Could**  | - Critério 1                                    |

## 4. Escopo: O que NÃO vamos fazer (Out of Scope)

_Para evitar o aumento descontrolado de escopo (scope creep), liste claramente o que **não** será abordado nesta entrega._

- _Exemplo: Integração com carteiras digitais de terceiros (será feita em uma fase futura)._
- _Exemplo: Suporte a navegadores legados (ex: Internet Explorer)._

## 5. Experiência do Usuário (UX/UI & Protótipos)

_Links para Figma, Miro, wireframes ou mockups de fluxo de telas._

- **Link do Figma:** [URL do Figma]
- **Fluxo do Usuário:** [Breve descrição dos passos essenciais na interface]

## 6. Requisitos Não-Funcionais (NFRs)

_Critérios técnicos importantes sob a perspectiva de produto._

- **Performance:** A página de checkout deve carregar sob rede 3G em menos de 2 segundos.
- **Acessibilidade (a11y):** Conformidade mínima com as diretrizes WCAG 2.1 AA.
- **Suporte de Idiomas (i18n):** Tradução inicial para Português (pt-BR) e Inglês (en-US).

## 7. Planos de Lançamento e Rollout (Go-To-Market)

- **Fase 1 (Alpha):** Lançamento interno para equipe de QA e colaboradores internos.
- **Fase 2 (Beta / Feature Flag):** Disponibilização gradual para 10% da base de usuários ativos.
- **Fase 3 (GA):** Lançamento geral (100% dos usuários).

## 8. Perguntas em Aberto (Open Questions)

_Dúvidas de negócio, produto ou fluxos de usuários que precisam ser resolvidas com stakeholders ou engenharia durante o refinamento._

| ID          | Dúvida / Pergunta                                                 |             Impacto             | Responsável     | Status / Resolução                                                       |
| :---------- | :---------------------------------------------------------------- | :-----------------------------: | :-------------- | :----------------------------------------------------------------------- |
| **Q-01**    | _[Dúvida/Pergunta]_                                               | **[Crítico \| Médio \| Baixo]** | [Nome/Área]     | _[Pendente \| Resolvido: Decisão tomada]_                                |
| _Exemplo 1_ | _Como lidaremos com reembolsos se a compra foi feita via boleto?_ |           **Crítico**           | PM / Financeiro | _Resolvido: O usuário preencherá os dados bancários na tela de estorno._ |
| _Exemplo 2_ | _Teremos suporte a modo escuro nessa primeira versão?_            |            **Baixo**            | Design          | _Resolvido: Não, escopo fechado apenas para Light Mode nesta fase._      |
