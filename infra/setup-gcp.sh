#!/usr/bin/env bash
# Prepara o Google Cloud, o Firebase e o GitHub para o deploy do Vigia das Águas (SCRUM-256).
#
# Rode uma vez, no Cloud Shell (console.cloud.google.com, ícone >_), com o projeto já criado
# e ligado a uma conta de faturamento. Pode rodar de novo: o que já existe é mantido.
#
#   PROJECT_ID=vigia-aguas BILLING_ACCOUNT=XXXXXX-XXXXXX-XXXXXX bash infra/setup-gcp.sh
#
# Passo a passo e o que cada parte cria: infra/README.md.
set -euo pipefail

PROJECT_ID="${PROJECT_ID:?Defina PROJECT_ID, ex.: PROJECT_ID=vigia-aguas bash infra/setup-gcp.sh}"
REGION="${REGION:-us-east1}"
GITHUB_OWNER="${GITHUB_OWNER:-joaogabgr}"
BACK_REPO="$GITHUB_OWNER/ProjetoDevOps-back"
FRONT_REPO="$GITHUB_OWNER/ProjetoDevOps-front"
BILLING_ACCOUNT="${BILLING_ACCOUNT:-}"           # opcional: cria o alerta de orçamento
BUDGET_USD="${BUDGET_USD:-1}"
PRODUCTION_SITE="${PRODUCTION_SITE:-$PROJECT_ID}"  # site padrão do Firebase
HOMOLOG_SITE="${HOMOLOG_SITE:-$PROJECT_ID-homolog}"
AMBIENTES=(homolog production)

step() { printf '\n==> %s\n' "$*"; }
exists() { "$@" >/dev/null 2>&1; }

gcloud config set project "$PROJECT_ID" >/dev/null
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
RUNTIME_SA="vigia-runtime@$PROJECT_ID.iam.gserviceaccount.com"
DEPLOY_SA="vigia-deploy@$PROJECT_ID.iam.gserviceaccount.com"
POOL="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github"
PROVIDER="$POOL/providers/github"

# ---------------------------------------------------------------- dados do banco
# Supabase (fase 1): Project Settings › Database › Connection pooling, modo "Session" (porta 5432).
declare -A DB_HOST DB_USER DB_NAME DB_PASSWORD
for env in "${AMBIENTES[@]}"; do
  if ! exists gcloud secrets describe "vigia-$env-db-password"; then
    echo
    echo "Banco de $env (Supabase › Project Settings › Database › Connection pooling › Session):"
    read -rp "  host (ex.: aws-0-us-east-1.pooler.supabase.com): " "DB_HOST[$env]"
    read -rp "  usuário (ex.: postgres.abcdefghijkl): " "DB_USER[$env]"
    read -rp "  banco [postgres]: " "DB_NAME[$env]"
    DB_NAME[$env]="${DB_NAME[$env]:-postgres}"
    read -rsp "  senha: " "DB_PASSWORD[$env]"; echo
  fi
done

# ---------------------------------------------------------------- APIs
step "Ativando as APIs"
gcloud services enable \
  run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com \
  iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com \
  cloudresourcemanager.googleapis.com serviceusage.googleapis.com \
  firebase.googleapis.com firebasehosting.googleapis.com \
  billingbudgets.googleapis.com cloudbilling.googleapis.com

# ---------------------------------------------------------------- Artifact Registry
step "Artifact Registry: repositório vigia com limpeza automática"
if ! exists gcloud artifacts repositories describe vigia --location "$REGION"; then
  gcloud artifacts repositories create vigia --repository-format docker \
    --location "$REGION" --description "Imagens da API do Vigia das Águas"
fi
POLICY="$(mktemp)"
cat >"$POLICY" <<'JSON'
[
  { "name": "manter-as-4-mais-novas", "action": { "type": "Keep" }, "mostRecentVersions": { "keepCount": 4 } },
  { "name": "apagar-o-resto", "action": { "type": "Delete" }, "condition": { "tagState": "any" } }
]
JSON
gcloud artifacts repositories set-cleanup-policies vigia --location "$REGION" --policy "$POLICY" --no-dry-run >/dev/null
rm -f "$POLICY"

# ---------------------------------------------------------------- contas de serviço
step "Contas de serviço"
exists gcloud iam service-accounts describe "$RUNTIME_SA" ||
  gcloud iam service-accounts create vigia-runtime --display-name "Vigia: API no Cloud Run"
exists gcloud iam service-accounts describe "$DEPLOY_SA" ||
  gcloud iam service-accounts create vigia-deploy --display-name "Vigia: publicação pelo GitHub Actions"

# A API só lê os próprios segredos (abaixo) e, na fase 2, conecta no Cloud SQL.
gcloud projects add-iam-policy-binding "$PROJECT_ID" --member "serviceAccount:$RUNTIME_SA" \
  --role roles/cloudsql.client --condition None --quiet >/dev/null

# O GitHub publica: Cloud Run (serviços e jobs), imagens e Firebase Hosting.
for role in roles/run.admin roles/artifactregistry.writer roles/firebasehosting.admin \
  roles/serviceusage.serviceUsageConsumer roles/serviceusage.apiKeysViewer; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" --member "serviceAccount:$DEPLOY_SA" \
    --role "$role" --condition None --quiet >/dev/null
done
# ... e pode dizer ao Cloud Run para rodar como vigia-runtime.
gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" \
  --member "serviceAccount:$DEPLOY_SA" --role roles/iam.serviceAccountUser --quiet >/dev/null

# ---------------------------------------------------------------- Workload Identity Federation
step "Workload Identity Federation: o GitHub publica sem chave guardada"
exists gcloud iam workload-identity-pools describe github --location global ||
  gcloud iam workload-identity-pools create github --location global --display-name "GitHub Actions"
exists gcloud iam workload-identity-pools providers describe github --location global --workload-identity-pool github ||
  gcloud iam workload-identity-pools providers create-oidc github \
    --location global --workload-identity-pool github --display-name "GitHub" \
    --issuer-uri "https://token.actions.githubusercontent.com" \
    --attribute-mapping "google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition "assertion.repository_owner == '$GITHUB_OWNER'"
# Só os dois repositórios podem usar a conta de publicação.
for repo in "$BACK_REPO" "$FRONT_REPO"; do
  gcloud iam service-accounts add-iam-policy-binding "$DEPLOY_SA" --role roles/iam.workloadIdentityUser \
    --member "principalSet://iam.googleapis.com/$POOL/attribute.repository/$repo" --quiet >/dev/null
done

# ---------------------------------------------------------------- segredos
step "Secret Manager: senha do banco e segredo do login, por ambiente"
create_secret() { # nome valor
  if ! exists gcloud secrets describe "$1"; then
    printf '%s' "$2" | gcloud secrets create "$1" --replication-policy automatic --data-file - >/dev/null
    echo "  criado: $1"
  fi
  gcloud secrets add-iam-policy-binding "$1" --member "serviceAccount:$RUNTIME_SA" \
    --role roles/secretmanager.secretAccessor --quiet >/dev/null
}
for env in "${AMBIENTES[@]}"; do
  create_secret "vigia-$env-db-password" "${DB_PASSWORD[$env]:-}"
  create_secret "vigia-$env-jwt-secret" "$(openssl rand -base64 48 | tr -d '\n')"
done

# ---------------------------------------------------------------- Firebase Hosting
step "Firebase: projeto e sites ($HOMOLOG_SITE, $PRODUCTION_SITE)"
TOKEN="$(gcloud auth print-access-token)"
firebase_api() { # método url [corpo]
  curl -sS -X "$1" "$2" -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: $PROJECT_ID" \
    -H "Content-Type: application/json" ${3:+-d "$3"}
}
if ! firebase_api GET "https://firebase.googleapis.com/v1beta1/projects/$PROJECT_ID" | grep -q '"projectId"'; then
  firebase_api POST "https://firebase.googleapis.com/v1beta1/projects/$PROJECT_ID:addFirebase" '{}' >/dev/null
  echo "  Firebase ativado (pode levar 1 minuto)"
  sleep 60
fi
for site in "$PRODUCTION_SITE" "$HOMOLOG_SITE"; do
  if ! firebase_api GET "https://firebasehosting.googleapis.com/v1beta1/projects/$PROJECT_ID/sites/$site" | grep -q '"name"'; then
    result="$(firebase_api POST "https://firebasehosting.googleapis.com/v1beta1/projects/$PROJECT_ID/sites?siteId=$site" '{}')"
    if ! grep -q '"name"' <<<"$result"; then
      echo "  Não consegui criar o site $site (o nome é global e pode estar em uso): $result"
      echo "  Rode de novo com outro nome, ex.: HOMOLOG_SITE=$site-2"
      exit 1
    fi
    echo "  site criado: https://$site.web.app"
  fi
done

# ---------------------------------------------------------------- orçamento
if [ -n "$BILLING_ACCOUNT" ]; then
  step "Alerta de orçamento de US\$ $BUDGET_USD"
  if ! gcloud billing budgets list --billing-account "$BILLING_ACCOUNT" --format 'value(displayName)' | grep -qx "Vigia"; then
    gcloud billing budgets create --billing-account "$BILLING_ACCOUNT" --display-name "Vigia" \
      --budget-amount "${BUDGET_USD}USD" --filter-projects "projects/$PROJECT_ID" \
      --threshold-rule percent=0.5 --threshold-rule percent=1.0 >/dev/null
    echo "  criado: e-mail para os administradores do faturamento em 50% e 100%"
  fi
else
  step "Alerta de orçamento: pulado (defina BILLING_ACCOUNT para criar)"
fi

# ---------------------------------------------------------------- GitHub
step "Variáveis no GitHub"
set_vars() {
  for repo in "$BACK_REPO" "$FRONT_REPO"; do
    gh variable set GCP_REGION -R "$repo" -b "$REGION"
    gh variable set GCP_WIF_PROVIDER -R "$repo" -b "$PROVIDER"
    gh variable set GCP_DEPLOY_SA -R "$repo" -b "$DEPLOY_SA"
    for env in "${AMBIENTES[@]}"; do gh api -X PUT "repos/$repo/environments/$env" >/dev/null; done
  done
  gh variable set FIREBASE_SITE -R "$FRONT_REPO" -e homolog -b "$HOMOLOG_SITE"
  gh variable set FIREBASE_SITE -R "$FRONT_REPO" -e production -b "$PRODUCTION_SITE"
  for env in "${AMBIENTES[@]}"; do
    if [ -n "${DB_HOST[$env]:-}" ]; then
      gh variable set DB_HOST -R "$BACK_REPO" -e "$env" -b "${DB_HOST[$env]}"
      gh variable set DB_PORT -R "$BACK_REPO" -e "$env" -b 5432
      gh variable set DB_USER -R "$BACK_REPO" -e "$env" -b "${DB_USER[$env]}"
      gh variable set DB_NAME -R "$BACK_REPO" -e "$env" -b "${DB_NAME[$env]}"
    fi
  done
  # Por último: com GCP_PROJECT_ID o deploy deixa de ser pulado.
  for repo in "$BACK_REPO" "$FRONT_REPO"; do gh variable set GCP_PROJECT_ID -R "$repo" -b "$PROJECT_ID"; done
}
if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  set_vars
  echo "  gravadas nos repositórios e nos Environments homolog e production"
else
  cat <<EOF
  O gh (GitHub CLI) não está logado aqui. Cadastre à mão em Settings › Secrets and variables › Actions › Variables:

  Nos dois repositórios (aba Variables):
    GCP_REGION        = $REGION
    GCP_WIF_PROVIDER  = $PROVIDER
    GCP_DEPLOY_SA     = $DEPLOY_SA
    GCP_PROJECT_ID    = $PROJECT_ID      (por último: ela liga o deploy)

  Front, Settings › Environments › homolog / production:
    FIREBASE_SITE     = $HOMOLOG_SITE / $PRODUCTION_SITE

  Back, Settings › Environments › homolog / production:
    DB_HOST, DB_PORT (5432), DB_USER, DB_NAME do pooler do Supabase de cada ambiente
EOF
fi

step "Pronto"
cat <<EOF
  Próximos passos (infra/README.md):
  1. Promover develop → homolog: o deploy cria a API e roda as migrations.
  2. Criar o primeiro administrador.
  3. Conferir https://$HOMOLOG_SITE.web.app e promover homolog → main.
EOF
