# Runbook: [Nome do Serviço / Aplicação]

- **Time Responsável:** [Nome do Time, ex: Equipe de Platform Engineering]
- **Comunicação & Escala:** [Link Slack/Teams, ex: #canal-alerta-producao] | [Link On-Call, ex: PagerDuty/Opsgenie]
- **Repositório do Código:** [URL do Repositório]

---

## 1. Triagem e Severidade (Triage & Severity)

_Classificação rápida do nível de urgência do problema para definir a ação imediata._

- **SEV-1 (Crítico - Serviço/receita interrompida):** Abra sala de crise no canal `#incidente-sev1` imediatamente e notifique stakeholders.
  - _Exemplo:_ API de pagamentos fora do ar, impossibilitando compras.
- **SEV-2 (Alto - Degradação parcial de funções principais):** Trate de forma prioritária, mas assíncrona.
  - _Exemplo:_ Lentidão de >2s para concluir a compra, porém o fluxo funciona.
- **SEV-3 (Baixo - Bugs visuais, suporte ou admin):** Trate no backlog padrão de sprints.
  - _Exemplo:_ Erro de digitação no relatório administrativo mensal.

---

## 2. Visão Geral e Onboarding (Service Overview)

_Contexto básico para entender o serviço e começar a operar/desenvolver._

- **O que faz:** _[Ex: API responsável por processar as transações de pagamento via Pix e Boleto.]_
- **Links Úteis:**
  - **README:** [README local](file:///path/to/readme) -> Guia de configuração e execução local.
  - **Métricas:** [Dashboard de APM (Grafana/Datadog)](http://link-do-dashboard) -> Gráficos de saúde e latência.
  - **Logs:** [Logs Consolidados (Kibana/CloudWatch)](http://link-dos-logs) -> Logs em tempo real de produção.
- **Acessos Necessários:** _[Ex: Solicitar acesso ao cluster Kubernetes no grupo "dev-payments" via portal de IAM.]_

---

## 3. Resolução de Cenários Comuns (Troubleshooting & Playbooks)

_Guia passo a passo para qualquer situação (alertas de monitoramento, incidentes ou chamados frequentes de suporte)._

### Cenário 1: [Ex: Alerta de Elevada Taxa de Erros 5xx - Crise]

1. **Como Diagnosticar (Sintomas):**
   - Acesse o painel de logs [Link Kibana] e filtre por `status: 5xx` e `service: [nome]`.
   - Verifique se o pico de erro começou logo após um deploy recente na pipeline.
2. **Como Resolver (Passo a Passo):**
   - Caso haja um deploy recente que causou os erros, siga para a **Seção 4** e execute o Rollback imediato.
   - Caso seja um pico de tráfego, aumente o número de instâncias (Scaling) via painel da nuvem.
3. **Se não resolver (Escalação):**
   - Acione a equipe de Plataforma/Infraestrutura no canal `#infra-oncall` ou chame @NomeDoLead no Slack.

### Cenário 2: [Ex: Chamado de Suporte - Usuário Admin sem Acesso]

1. **Como Diagnosticar (Sintomas):**
   - O time de suporte relata que o admin não consegue acessar o painel administrativo.
   - Verifique se a API retorna erro `403 Forbidden` nos logs para o e-mail do usuário.
2. **Como Resolver (Passo a Passo):**
   - Acesse o console do banco de dados (produção-readonly) e execute:
     ```sql
     UPDATE users SET status = 'active' WHERE email = 'usuario@empresa.com';
     ```
   - Solicite ao usuário que limpe o cache do navegador e tente novamente.
3. **Se não resolver (Escalação):**
   - Acione o time de Segurança/IAM no canal `#security-ops`.

---

## 4. Operações de Rotina (Routine Operations)

_Comandos ou links para as ações operacionais mais frequentes._

- **Como Reiniciar (Restart):** _[Ex: Acesse o painel AWS ECS -> Task -> Clique em "Force New Deployment"]_
- **Como Reverter (Rollback):** _[Ex: Execute a pipeline no GitHub Actions selecionando a branch da última tag estável. Link: URL-pipeline]_
