# Infraestrutura

Como preparar a nuvem para o deploy automático. A arquitetura, o dimensionamento e o custo estão no Confluence, em [Deploy e ambientes](https://projetodevops.atlassian.net/wiki/spaces/VIGIA/pages/3440642).

| Parte | Serviço |
|---|---|
| API | Google Cloud Run (`vigia-api-homolog`, `vigia-api`), região `us-east1` |
| Migrations | Cloud Run Job (`vigia-migrate-homolog`, `vigia-migrate-production`) |
| Front | Firebase Hosting, um site por ambiente, com `/api` repassado ao Cloud Run |
| Banco | Supabase (fase 1, temporário) e depois Cloud SQL para PostgreSQL (fase 2) |
| Segredos | Secret Manager (`vigia-<ambiente>-db-password`, `vigia-<ambiente>-jwt-secret`) |
| Publicação | GitHub Actions (`deploy.yml` no back e no front), autenticado por Workload Identity Federation |

## 1. Antes do script (à mão)

1. **Projeto no Google Cloud:** em [console.cloud.google.com](https://console.cloud.google.com), crie o projeto (ex.: `vigia-aguas`) e ligue a uma conta de faturamento (*Faturamento › Vincular conta*). O Cloud Run exige faturamento mesmo dentro da cota grátis; o alerta de orçamento do script avisa se algo sair dela.
2. **Supabase:** em [supabase.com](https://supabase.com), crie os projetos `vigia-homolog` e `vigia`, região **East US (North Virginia)**. Em cada um, abra *Project Settings › Database › Connection pooling*, modo **Session** (porta 5432), e anote host, usuário e senha. A conexão direta do Supabase é só IPv6 e o Cloud Run não alcança; por isso o pooler.
3. **GitHub CLI (opcional):** se o `gh` estiver logado no terminal onde o script roda, ele grava as variáveis nos repositórios. Senão, o script imprime o que cadastrar à mão.

## 2. Rodar o script

No **Cloud Shell** (ícone `>_` no topo do console do Google), que já tem `gcloud`, `curl` e `openssl`:

```bash
git clone --branch develop https://github.com/joaogabgr/ProjetoDevOps-back.git
cd ProjetoDevOps-back
PROJECT_ID=vigia-aguas BILLING_ACCOUNT=XXXXXX-XXXXXX-XXXXXX bash infra/setup-gcp.sh
```

`BILLING_ACCOUNT` aparece em *Faturamento › Gerenciamento de contas*. O script pergunta host, usuário, banco e senha do Supabase de cada ambiente.

| Variável | Padrão | Para quê |
|---|---|---|
| `PROJECT_ID` | obrigatória | Projeto do Google Cloud |
| `REGION` | `us-east1` | Região do Cloud Run e das imagens |
| `BILLING_ACCOUNT` | vazia | Cria o alerta de orçamento |
| `BUDGET_USD` | `1` | Valor do alerta, em dólares |
| `PRODUCTION_SITE` / `HOMOLOG_SITE` | `<projeto>` / `<projeto>-homolog` | Sites do Firebase (o nome é global; troque se estiver em uso) |

O script pode rodar de novo: o que já existe é mantido. Ele não troca segredos já criados; para trocar uma senha, veja a seção 5.

**O que ele cria:**

| Etapa | O quê |
|---|---|
| APIs | Cloud Run, Artifact Registry, Secret Manager, IAM, Firebase, orçamentos |
| Artifact Registry | Repositório `vigia` que guarda só as 4 imagens mais novas (fica na cota grátis de 0,5 GB) |
| Contas de serviço | `vigia-runtime`: a API, que só lê os próprios segredos. `vigia-deploy`: o GitHub, que publica no Cloud Run e no Firebase |
| Workload Identity Federation | O GitHub prova quem é com um token temporário. Só `ProjetoDevOps-back` e `ProjetoDevOps-front` podem usar a conta de publicação. Nenhuma chave fica guardada |
| Secret Manager | Senha do banco (a que você digitou) e segredo do login (gerado aleatório), por ambiente |
| Firebase | Ativa o Firebase no projeto e cria os dois sites |
| Orçamento | Alerta por e-mail em 50% e 100% de US$ 1 |
| GitHub | Variáveis `GCP_*` nos dois repositórios, `DB_*` nos Environments do back e `FIREBASE_SITE` nos do front. `GCP_PROJECT_ID` é gravada por último, porque é ela que liga o deploy |

Se o Firebase não ativar pelo script (conta que nunca usou o Firebase precisa aceitar os termos), abra [console.firebase.google.com](https://console.firebase.google.com), *Adicionar projeto*, escolha o projeto do Google Cloud e rode o script de novo.

## 3. Primeiro deploy

1. Abra o PR `develop` → `homolog` e faça o merge (*Create a merge commit*).
2. Em *Actions › Deploy*, acompanhe: CI, imagem, migrations, publicação e smoke. No fim aparece a URL da API.
3. Faça o mesmo no front. O site fica em `https://<projeto>-homolog.web.app`.

## 4. Primeiro administrador

Rode no seu computador, com o `.env` apontando para o banco do ambiente (dados do pooler do Supabase):

```bash
DB_HOST=aws-0-us-east-1.pooler.supabase.com DB_PORT=5432 DB_USER=postgres.abcdefghijkl \
DB_PASSWORD=... DB_NAME=postgres DB_SSL=true \
ADMIN_NAME="Ricardo Almeida" ADMIN_EMAIL=ricardo@vigia.org ADMIN_PASSWORD=... ADMIN_CPF=... \
npm run seed:admin
```

## 5. Operação do dia a dia

| Tarefa | Comando |
|---|---|
| Ver os logs da API | `gcloud run services logs read vigia-api --region us-east1 --limit 100` |
| Ver as revisões publicadas | `gcloud run revisions list --service vigia-api --region us-east1` |
| Voltar para a revisão anterior (emergência) | `gcloud run services update-traffic vigia-api --region us-east1 --to-revisions <revisão>=100` |
| Rodar as migrations de novo | `gcloud run jobs execute vigia-migrate-production --region us-east1 --wait` |
| Trocar a senha do banco | `printf '%s' 'nova-senha' \| gcloud secrets versions add vigia-production-db-password --data-file -` e publicar de novo (*Actions › Deploy › Re-run*) |
| Backup do banco (fase 1) | `pg_dump "postgresql://<usuário>:<senha>@<host>:5432/postgres" -Fc -f vigia-$(date +%F).dump` |

Para homologação, troque `vigia-api` por `vigia-api-homolog` e `production` por `homolog`.

## 6. Fase 2: trocar o Supabase pelo Cloud SQL

Quando o banco de produção passar de 400 MB ou a ONG aprovar o custo (~R$ 55 a R$ 70 por mês). O código não muda, só a configuração.

```bash
gcloud services enable sqladmin.googleapis.com
gcloud sql instances create vigia --database-version POSTGRES_16 --tier db-f1-micro \
  --region us-east1 --storage-size 10 --storage-auto-increase --backup-start-time 06:00
gcloud sql databases create vigia --instance vigia
gcloud sql databases create vigia_homolog --instance vigia
gcloud sql users create vigia --instance vigia --password '<senha>'
```

1. Pare a ponte do gateway (as leituras esperam na fila da placa).
2. Copie os dados: `pg_dump` do Supabase e `pg_restore` no Cloud SQL, pelo [Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy).
3. Atualize o segredo `vigia-<ambiente>-db-password` com a senha nova.
4. No GitHub Environment do back: `CLOUD_SQL_INSTANCE=<projeto>:us-east1:vigia`, `DB_HOST=/cloudsql/<projeto>:us-east1:vigia`, `DB_SSL=false`, `DB_USER=vigia`, `DB_NAME=vigia` (ou `vigia_homolog`).
5. *Actions › Deploy › Re-run*: o workflow liga o Cloud Run ao Cloud SQL quando `CLOUD_SQL_INSTANCE` existe.
6. Confira `/api/health` com `db: ok`, religue a ponte e desligue o projeto Supabase depois de uma semana.
