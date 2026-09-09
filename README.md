# ProjetoDevOps - Back-end

API e serviços da plataforma de monitoramento ambiental da Tecsus: recebimento
dos dados enviados pelas estações meteorológicas, processamento (médias horárias
e diárias), persistência, geração de alertas e controle de acesso.

## Repositórios do projeto

| Repositório | Conteúdo |
|---|---|
| [ProjetoDevOps](https://github.com/joaogabgr/ProjetoDevOps) | Documentação, requisitos, Product Backlog e relatórios de sprint |
| [ProjetoDevOps-front](https://github.com/joaogabgr/ProjetoDevOps-front) | Aplicação web |
| [ProjetoDevOps-back](https://github.com/joaogabgr/ProjetoDevOps-back) | Este repositório: API, processamento e persistência dos dados |

## Gestão

- Board: [Jira - projeto SCRUM](https://projetodevops.atlassian.net/jira/software/projects/SCRUM/boards/1)
- Requisitos e backlog completo: [README do repositório principal](https://github.com/joaogabgr/ProjetoDevOps#product-backlog)

## Convenção de branch e commit

Toda branch e todo commit devem citar a chave da issue do Jira (`SCRUM-00`).
É isso que faz o commit aparecer no painel *Development* da issue.

```bash
git checkout -b feature/SCRUM-31-emulador-estacoes
git commit -m "SCRUM-31 feat: emulador de envio de leituras"
```

O título do Pull Request também deve começar com a chave.

Prefixos de commit: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
