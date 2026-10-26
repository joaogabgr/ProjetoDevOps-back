// Gera a release do GitHub agrupada por requisito e marca a versão nas issues do Jira.
// Roda no workflow release.yml a cada push na main. Com DRY_RUN=1 só imprime as notas.
//
// Variáveis: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, GH_TOKEN, GITHUB_REPOSITORY, COMPONENT (back|front)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const {
  JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, GITHUB_REPOSITORY,
  COMPONENT = 'back', JIRA_PROJECT_KEY = 'SCRUM', PRODUCTION_URL = '', DRY_RUN,
} = process.env;
const DRY = DRY_RUN === '1';
const KEY_RE = new RegExp(`${JIRA_PROJECT_KEY}-\\d+`, 'g');

const sh = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const shOrNull = (cmd, args) => { try { return sh(cmd, args); } catch { return null; } };

async function jira(method, path, body) {
  const res = await fetch(JIRA_BASE_URL + path, {
    method,
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64'),
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Jira ${method} ${path} -> ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

async function main() {
// 1. Commits desde a última tag
const lastTag = shOrNull('git', ['describe', '--tags', '--abbrev=0', '--match', 'v*']);
const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
const commits = sh('git', ['log', range, '--format=%s%x1f%b%x1e'])
  .split('\x1e').map((c) => c.trim()).filter(Boolean)
  .map((c) => { const [subject, body = ''] = c.split('\x1f'); return { subject, body }; });

// 2. Chaves do Jira: no título do commit e no título e na branch do PR (#N).
// O corpo fica de fora: ele traz a descrição do PR, que pode citar outras issues ("depende do SCRUM-26").
const keys = new Set();
for (const { subject } of commits) {
  for (const k of subject.match(KEY_RE) ?? []) keys.add(k);
  const pr = subject.match(/\(#(\d+)\)\s*$/)?.[1];
  if (pr) {
    const info = shOrNull('gh', ['api', `repos/${GITHUB_REPOSITORY}/pulls/${pr}`, '--jq', '.title + " " + .head.ref']);
    for (const k of info?.match(KEY_RE) ?? []) keys.add(k);
  }
}
if (!keys.size) {
  console.log(`Nenhuma issue do Jira desde ${lastTag ?? 'o início'}. Release não criada.`);
  return;
}

// 3. Versão: a do package.json, se ainda não tiver tag; senão, sobe o patch da última tag
const pkgVersion = existsSync('package.json') ? JSON.parse(readFileSync('package.json', 'utf8')).version : null;
const tagExists = (v) => shOrNull('git', ['rev-parse', '-q', '--verify', `refs/tags/v${v}`]) !== null;
let version;
if (pkgVersion && !tagExists(pkgVersion)) version = pkgVersion;
else if (lastTag) {
  const [maj, min, pat] = lastTag.slice(1).split('.').map(Number);
  version = `${maj}.${min}.${pat + 1}`;
} else version = '0.1.0';
const tag = `v${version}`;

// 4. Histórias no Jira, agrupadas pelo épico (RF).
// A branch é da subtarefa ([BACK]/[FRONT]); quem entra na release é a história dona dela.
const search = async (keyList) => (await jira('POST', '/rest/api/3/search/jql', {
  jql: `key in (${keyList.join(',')})`,
  fields: ['summary', 'issuetype', 'parent'],
  maxResults: 100,
})).issues;
const found = await search([...keys]);
const storyKeys = new Set(found.map((i) => (i.fields.issuetype.subtask ? i.fields.parent.key : i.key)));
// Só entram histórias ligadas a um requisito (épico RF). Tarefas técnicas ficam no link de mudanças técnicas.
const stories = (await search([...storyKeys]))
  .filter((i) => i.fields.issuetype.name !== 'Epic' && /^RF\d+/.test(i.fields.parent?.fields?.summary ?? ''));
if (!stories.length) {
  console.log('Nenhuma história de requisito nos commits. Release não criada.');
  return;
}
const groups = new Map();
for (const i of stories) {
  const rf = i.fields.parent?.fields?.summary ?? 'Outras entregas';
  if (!groups.has(rf)) groups.set(rf, []);
  groups.get(rf).push(i);
}
const rfNumber = (s) => Number(s.match(/^RF(\d+)/)?.[1] ?? 999);
const issueNumber = (k) => Number(k.split('-')[1]);
const storyTitle = (s) => s.replace(/^RF\d+\s*-\s*/, '');

// 5. Notas da release, escritas para o cliente
const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
const lines = [
  `Versão **${tag}** do ${COMPONENT === 'back' ? 'back-end (API)' : 'front-end (aplicação web)'}, publicada em ${today}.`,
  '',
];
if (PRODUCTION_URL) lines.push(`Disponível em: ${PRODUCTION_URL}`, '');
lines.push('Requisitos atendidos nesta versão:', '');
for (const [rf, list] of [...groups].sort((a, b) => rfNumber(a[0]) - rfNumber(b[0]))) {
  lines.push(`### ${rf.replace(/\s*-\s*/, ' – ')}`);
  for (const i of list.sort((a, b) => issueNumber(a.key) - issueNumber(b.key))) {
    lines.push(`- ✅ ${storyTitle(i.fields.summary)} (${i.key})`);
  }
  lines.push('');
}
lines.push(
  `Situação de todos os requisitos: [portal de entregas](https://joaogabgr.github.io/ProjetoDevOps/)`,
  '',
  lastTag ? `Mudanças técnicas: https://github.com/${GITHUB_REPOSITORY}/compare/${lastTag}...${tag}` : '',
);
const notes = lines.join('\n');
console.log(`Release ${tag} com ${stories.length} histórias:\n\n${notes}`);
if (DRY) return;

// 6. Tag e release no GitHub
writeFileSync('release-notes.md', notes);
sh('gh', ['release', 'create', tag, '--title', `${tag} – ${today}`, '--notes-file', 'release-notes.md', '--target', sh('git', ['rev-parse', 'HEAD'])]);
const releaseUrl = `https://github.com/${GITHUB_REPOSITORY}/releases/tag/${tag}`;

// 7. Versão no Jira com as histórias
const project = await jira('GET', `/rest/api/3/project/${JIRA_PROJECT_KEY}`);
const versionName = `${COMPONENT} ${tag}`;
await jira('POST', '/rest/api/3/version', {
  name: versionName,
  projectId: Number(project.id),
  released: true,
  releaseDate: new Date().toISOString().slice(0, 10),
  description: releaseUrl,
});
for (const i of stories) {
  await jira('PUT', `/rest/api/3/issue/${i.key}`, { update: { fixVersions: [{ add: { name: versionName } }] } });
}
console.log(`Release ${releaseUrl} criada e versão "${versionName}" marcada em ${stories.length} issues do Jira.`);
}

await main();
