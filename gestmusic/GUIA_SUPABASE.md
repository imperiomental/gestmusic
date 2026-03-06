# 🗄️ GUIA DE CONFIGURAÇÃO — SUPABASE + NETLIFY

Segue estes passos **uma única vez**. Depois o sistema funciona automaticamente.

---

## PASSO 1 — Criar conta no Supabase

1. Vai a **https://supabase.com** e clica em **Start your project**
2. Regista-te com o teu email ou conta GitHub
3. Clica em **New project**
4. Preenche:
   - **Name:** `gestmusic-record`
   - **Database Password:** escolhe uma senha forte (guarda-a!)
   - **Region:** escolhe `West EU (Ireland)` — mais perto de Angola
5. Clica **Create new project** e aguarda ~2 minutos

---

## PASSO 2 — Criar as tabelas (SQL)

1. No painel do Supabase, clica em **SQL Editor** (menu da esquerda)
2. Clica em **New query**
3. Cola TODO o código abaixo e clica **Run**:

```sql
-- ============================================================
-- GESTMUSIC RECORD — Criação das tabelas
-- Cola este SQL no editor do Supabase e executa
-- ============================================================

-- Utilizadores (admins do sistema)
create table if not exists users (
  id        bigint primary key,
  name      text,
  role      text,
  username  text unique,
  password  text,
  photo     text,
  bio       text
);

-- Artistas
create table if not exists artists (
  id              bigint primary key,
  "artisticName"  text not null,
  "fullName"      text,
  phone           text,
  email           text,
  genre           text,
  status          text default 'Ativo',
  notes           text,
  photo           text,
  "codigoPortal"  text unique
);

-- Projetos
create table if not exists projects (
  id           bigint primary key,
  name         text not null,
  "artistId"   bigint references artists(id) on delete cascade,
  type         text,
  status       text default 'Em gravação',
  "startDate"  text,
  deadline     text,
  value        numeric default 0,
  notes        text,
  "downloadLinks" jsonb default '[]'
);

-- Sessões / Agenda
create table if not exists sessions (
  id          bigint primary key,
  title       text,
  "artistId"  bigint,
  "projectId" bigint,
  date        text,
  time        text,
  studio      text,
  type        text,
  status      text default 'Confirmado',
  notes       text
);

-- Financeiro
create table if not exists financials (
  id              bigint primary key,
  "projectId"     bigint references projects(id) on delete cascade,
  paid            numeric default 0,
  "paymentDate"   text,
  "paymentMethod" text,
  status          text,
  notes           text
);

-- Ficheiros / Arquivos
create table if not exists files (
  id          bigint primary key,
  name        text,
  "projectId" bigint,
  type        text,
  size        text,
  url         text,
  data        text,
  "uploadDate" text,
  notes       text
);

-- Novidades / Comunicados
create table if not exists novidades (
  id          bigint primary key,
  titulo      text not null,
  corpo       text,
  tag         text,
  emoji       text,
  imagem      text,
  publica     boolean default true,
  "artistaId" bigint
);

-- ============================================================
-- Segurança: permitir leitura/escrita com a chave "anon"
-- (o sistema usa a chave pública — não expõe dados sensíveis
--  porque as passwords são guardadas com hash no app)
-- ============================================================
alter table users      enable row level security;
alter table artists    enable row level security;
alter table projects   enable row level security;
alter table sessions   enable row level security;
alter table financials enable row level security;
alter table files      enable row level security;
alter table novidades  enable row level security;

-- Política: permitir tudo com a chave anon
-- (para produção avançada podes restringir mais tarde)
create policy "anon_all" on users      for all using (true) with check (true);
create policy "anon_all" on artists    for all using (true) with check (true);
create policy "anon_all" on projects   for all using (true) with check (true);
create policy "anon_all" on sessions   for all using (true) with check (true);
create policy "anon_all" on financials for all using (true) with check (true);
create policy "anon_all" on files      for all using (true) with check (true);
create policy "anon_all" on novidades  for all using (true) with check (true);
```

4. Deves ver **"Success. No rows returned"** — as tabelas foram criadas ✅

---

## PASSO 3 — Copiar as credenciais

1. No menu do Supabase vai a **Project Settings** → **API**
2. Copia dois valores:

| Campo | Onde está |
|---|---|
| **Project URL** | Secção "Project URL" — ex: `https://abcdefgh.supabase.co` |
| **anon public** | Secção "Project API keys" → linha "anon public" |

3. Abre o ficheiro **`js/core.js`** num editor de texto
4. Substitui as linhas no topo:

```javascript
// ANTES (linhas 8-9):
const SUPA_URL = 'COLOCA_AQUI_O_TUA_URL';
const SUPA_KEY = 'COLOCA_AQUI_A_TUA_ANON_KEY';

// DEPOIS (com os teus valores reais):
const SUPA_URL = 'https://abcdefgh.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

5. Guarda o ficheiro

---

## PASSO 4 — Deploy no Netlify

### Opção A — Arrastar e largar (mais simples)
1. Vai a **https://netlify.com** e faz login
2. Clica em **Add new site** → **Deploy manually**
3. Abre a pasta `gestmusic/` no teu computador
4. **Arrasta a pasta inteira** para a área de drop do Netlify
5. Aguarda o deploy (~30 segundos)
6. O Netlify dá-te um URL como `https://amazing-fox-123.netlify.app`

### Opção B — Via GitHub (recomendado para actualizações fáceis)
1. Cria um repositório no **https://github.com** e faz upload da pasta `gestmusic/`
2. No Netlify: **Add new site** → **Import from Git**
3. Liga ao teu repositório GitHub
4. Em **Publish directory** escreve: `.` (ponto)
5. Clica **Deploy site**
6. Para futuras actualizações: basta fazer push ao GitHub → Netlify actualiza automaticamente

---

## PASSO 5 — Configurar os links correctos

Após o deploy, os teus links ficam assim (substitui pelo teu URL real):

| Quem usa | Link |
|---|---|
| **Admin do estúdio** | `https://amazing-fox-123.netlify.app/admin.html` |
| **Portal dos artistas** | `https://amazing-fox-123.netlify.app/portal.html` |
| **Link directo artista** | `https://amazing-fox-123.netlify.app/portal.html?codigo=AFRO-5531` |

---

## PASSO 6 — Primeiro acesso ao admin

1. Abre o link do admin no browser
2. O sistema detecta que está vazio e mostra o ecrã de **Primeiro Setup**
3. Cria o teu utilizador administrador
4. Começa a cadastrar artistas — os dados ficam automaticamente no Supabase

---

## ❓ Problemas comuns

**"Erro de ligação" ao abrir o admin**
→ Verifica se o URL e a chave em `js/core.js` estão correctos (sem espaços extra)

**"new row violates row-level security"**
→ Executaste o SQL das políticas? Corre a parte `create policy` novamente

**As imagens dos artistas não aparecem**
→ As imagens são guardadas em base64 — ficheiros grandes (>2MB) podem ser lentos

**O portal do artista abre mas não vê dados**
→ Normal se o admin ainda não cadastrou nada. Os dados partilham o mesmo Supabase.

---

## 🔒 Segurança — notas importantes

- A **chave `anon`** é segura para usar em código público — o Supabase foi desenhado para isso
- As **passwords dos utilizadores** são validadas no próprio app (não uses passwords importantes)
- Para segurança avançada no futuro: podes adicionar autenticação Supabase Auth
- **Nunca partilhes** a chave `service_role` (diferente da `anon`) — essa dá acesso total

---

*GESTMUSIC RECORD STUDIO — Sistema de Gestão v8*
