# RCA / Post-Mortem: Incident #[Número ou ID] - [Título Curto do Incidente]

- **Data do Incidente:** [AAAA-MM-DD]
- **Autor/Líder da Investigação:** [Nome]
- **Gravidade:** [P0 - Crítico | P1 - Alto | P2 - Médio]
- **Tempo Total de Indisponibilidade (Downtime):** [Ex: 42 minutos]
- **Serviços Impactados:** [Ex: Painel Administrativo, API de Checkout]

---

## 1. Resumo Executivo (Executive Summary)

_Um resumo conciso de alto nível sobre o que aconteceu, qual o impacto sofrido e como o incidente foi eventualmente resolvido._

- _Ex: "No dia AAAA-MM-DD, a API de Checkout sofreu uma indisponibilidade total devido a um estouro de conexões com o banco de dados após uma campanha de marketing. O incidente durou 42 minutos e impactou aproximadamente 2.500 transações de compra. O serviço foi reestabelecido após aumentarmos o pool de conexões e reiniciarmos as instâncias da API."_

## 2. Linha do Tempo (Timeline)

_Descreva a cronologia detalhada dos fatos (use fusos horários consistentes, ex: UTC ou Horário de Brasília)._

- **14:10** - Origem: A campanha de marketing é disparada via e-mail e push notification.
- **14:12** - Detecção: O PagerDuty dispara o alerta `Elevada Taxa de Erros 502 no Gateway`.
- **14:15** - Resposta: O engenheiro de plantão inicia a investigação e identifica latência alta no banco de dados.
- **14:20** - Diagnóstico: Identificado que o pool de conexões com o PostgreSQL atingiu o limite máximo de 100 conexões.
- **14:35** - Mitigação: Aumentado temporariamente o limite máximo de conexões no DB para 200 e reiniciados os containers da API.
- **14:52** - Resolução: Latência normalizada, taxa de erros zerada. Incidente finalizado.

## 3. Análise da Causa Raiz (Root Cause Analysis - 5 Whys)

_Use a técnica dos "5 Porquês" para investigar profundamente a causa raiz, evitando ficar na superfície do erro operacional._

1.  **Por que a API de Checkout ficou indisponível?**
    - Porque não conseguia se conectar com o banco de dados.
2.  **Por que ela não conseguia se conectar com o banco de dados?**
    - Porque todas as conexões do pool estavam ocupadas e novas conexões eram rejeitadas.
3.  **Por que todas as conexões estavam ocupadas?**
    - Porque o volume de requisições de checkout quadruplicou repentinamente.
4.  **Por que o volume quadruplicou repentinamente sem aviso prévio?**
    - Porque a campanha de marketing foi disparada sem que o time de engenharia fosse avisado para planejar o escalonamento preventivo.
5.  **Por que o time de marketing não avisou a engenharia? (Causa Raiz)**
    - Porque não existe um processo estabelecido de comunicação e planejamento de capacidade integrado entre o marketing e a engenharia para grandes campanhas.

## 4. Plano de Ação (Action Items)

_Quais tarefas precisam ser realizadas para mitigar o problema a curto prazo e para evitar que ele ocorra novamente a longo prazo?_

| Prioridade | Ação Preventiva / Correção                                                    | Responsável | Status  | Link da Issue |
| :--------: | :---------------------------------------------------------------------------- | :---------- | :-----: | :------------ |
|  **Alta**  | Implementar autoscaling automático na API baseado em CPU/Memória.             | [Nome]      | A Fazer | [Link]        |
|  **Alta**  | Adicionar regras de Rate Limiting na rota de Checkout para evitar sobrecarga. | [Nome]      | A Fazer | [Link]        |
| **Média**  | Criar um calendário compartilhado de campanhas entre Marketing e Engenharia.  | [Nome]      | A Fazer | [Link]        |

## 5. Lições Aprendidas (Lessons Learned)

- **O que funcionou bem:**
  - O sistema de monitoramento detectou e alertou o plantonista em menos de 2 minutos.
  - A documentação de Runbook de banco de dados facilitou o aumento rápido do pool.
- **O que funcionou mal:**
  - Demoramos cerca de 15 minutos para isolar o problema porque não tínhamos um dashboard consolidado do banco de dados na tela de triagem rápida.
- **Onde demos sorte:**
  - O banco de dados não sofreu corrupção de dados sob estresse extremo.
