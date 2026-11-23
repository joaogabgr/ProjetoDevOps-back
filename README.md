# Vigia das Águas – Back-end

API e serviços do sistema de monitoramento comunitário e prevenção de enchentes do Instituto Vigia das Águas: recepção das leituras das estações via MQTT, processamento (médias horárias e diárias), persistência, alertas e controle de acesso.

## Onde está cada coisa

| O quê | Onde |
|---|---|
| Requisitos, atas e processo do time | [Confluence – espaço Vigia das Águas](https://projetodevops.atlassian.net/wiki/spaces/VIGIA) |
| Pipeline de CI/CD: jobs de cada ambiente e regras | [Confluence › Pipeline de CI/CD](https://projetodevops.atlassian.net/wiki/spaces/VIGIA/pages/491764) |
| Modelo de dados | [Confluence › Modelo de dados](https://projetodevops.atlassian.net/wiki/spaces/VIGIA/pages/720910) |
| Onde roda, publicação, dimensionamento e custo | [Confluence › Deploy e ambientes](https://projetodevops.atlassian.net/wiki/spaces/VIGIA/pages/3440642) |
| Histórias e tarefas | [Jira – projeto SCRUM](https://projetodevops.atlassian.net/jira/software/projects/SCRUM/boards/1) (componente **Backend**) |
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

## Publicação

O merge na `homolog` publica a API na homologação e o merge na `main`, em produção, sem passo manual ([`deploy.yml`](.github/workflows/deploy.yml)):

1. roda o CI inteiro de novo; o job `build` também testa a imagem Docker (migrations num banco limpo e `/api/health`);
2. envia a imagem ao Artifact Registry;
3. roda as migrations no Cloud Run Job `vigia-migrate-<ambiente>`, com a mesma imagem;
4. publica o serviço (`vigia-api-homolog` ou `vigia-api`);
5. confere `GET /api/health`: precisa responder `db: ok` com a versão (SHA) publicada;
6. na `main`, cria a release e a versão no Jira.

`GET /api/health` responde 200 `{ "status": "ok", "db": "ok", "version": "<sha>" }`, ou 503 com o banco fora.

Enquanto o repositório não tem a variável `GCP_PROJECT_ID`, o deploy é pulado. A preparação da nuvem está em [`infra/`](infra/).

## Branch, commit e PR

O fluxo completo está no [Processo do PO](https://projetodevops.atlassian.net/wiki/spaces/VIGIA/pages/524289).

- **Branch:** uma por tarefa `[BACK]` (componente Backend) do Jira, a partir da `develop`, com a chave e o requisito: `SCRUM-NN-rf-N-descricao`. Ex.: `SCRUM-57-rf-2-novos-campos-da-estacao`.
- **Commit:** `SCRUM-57 feat: descrição curta`, ao menos dois por branch. A chave faz o commit aparecer no painel *Development* da tarefa.
- **PR:** o título é o nome da branch (o CI confere). No squash, a mensagem do commit na `develop` sai com esse nome.
- **Regras:** `develop`, `homolog` e `main` só aceitam PR com o CI verde; a `develop` também exige a branch atualizada.
- **Merge:**
  - feature → `develop`: *Squash and merge*;
  - `develop` → `homolog` → `main`: *Create a merge commit*.
- **Release:** cada merge na `main` cria a release e a versão `back vX.Y.Z` no Jira, depois que a produção passa no teste de `/api/health`.

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Melhoria de código sem mudar comportamento |
| `docs` | Documentação |
| `style` | Estilos e formatação |
| `test` | Testes |
