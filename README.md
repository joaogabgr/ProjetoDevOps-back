# Vigia das Águas – Back-end

API e serviços do sistema de monitoramento comunitário e prevenção de enchentes do Instituto Vigia das Águas: recepção das leituras das estações via MQTT, processamento (médias horárias e diárias), persistência, alertas e controle de acesso.

## Onde está cada coisa

| O quê | Onde |
|---|---|
| Requisitos, atas e processo do time | [Confluence – espaço Vigia das Águas](https://projetodevops.atlassian.net/wiki/spaces/VIGIA) |
| Modelo de dados e pipeline de CI/CD | [Confluence › Arquitetura](https://projetodevops.atlassian.net/wiki/spaces/VIGIA/pages/491764) |
| Histórias e subtarefas | [Jira – projeto SCRUM](https://projetodevops.atlassian.net/jira/software/projects/SCRUM/boards/1) (componente **Backend**) |
| Front-end | [ProjetoDevOps-front](https://github.com/joaogabgr/ProjetoDevOps-front) |

## Como rodar

Requer Node 20 e Docker.

```bash
cp .env.example .env
npm ci
npm run db:up          # PostgreSQL 16 no Docker
npm run migration:run
npm run dev            # API em modo watch
```

| Comando | O que faz |
|---|---|
| `npm test` | Testes (Vitest + Supertest) |
| `npm run typecheck` | Checagem de tipos |
| `npm run build` | Compila para `dist/` |

## Branch, commit e PR

O fluxo completo está no [Processo do PO](https://projetodevops.atlassian.net/wiki/spaces/VIGIA/pages/524289).

- **Branch:** uma por subtarefa `[BACK]` do Jira, criada pelo botão *Create branch* a partir da `develop`. Ex.: `SCRUM-61-back-gravar-leituras`.
- **Commit:** `SCRUM-61 feat: descrição curta`. A chave faz o commit aparecer no painel *Development* da subtarefa.
- **PR:** título começando com a chave.
- **Merge:**
  - feature → `develop`: *Squash and merge*;
  - `develop` → `homolog` → `main`: *Create a merge commit*.
- **Release:** cada merge na `main` cria a release e a versão `back vX.Y.Z` no Jira.

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Melhoria de código sem mudar comportamento |
| `docs` | Documentação |
| `style` | Estilos e formatação |
| `test` | Testes |
