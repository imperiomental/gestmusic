-- ============================================================
-- GESTMUSIC RECORD — Criação das tabelas
-- Cola este SQL no editor do Supabase e clica RUN
-- ============================================================

create table if not exists users (
  id        bigint primary key,
  name      text,
  role      text,
  username  text unique,
  password  text,
  photo     text,
  bio       text
);

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

create table if not exists projects (
  id              bigint primary key,
  name            text not null,
  "artistId"      bigint references artists(id) on delete cascade,
  type            text,
  status          text default 'Em gravação',
  "startDate"     text,
  deadline        text,
  value           numeric default 0,
  notes           text,
  "downloadLinks" jsonb default '[]'
);

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

create table if not exists financials (
  id              bigint primary key,
  "projectId"     bigint references projects(id) on delete cascade,
  paid            numeric default 0,
  "paymentDate"   text,
  "paymentMethod" text,
  status          text,
  notes           text
);

create table if not exists files (
  id           bigint primary key,
  name         text,
  "projectId"  bigint,
  type         text,
  size         text,
  url          text,
  data         text,
  "uploadDate" text,
  notes        text
);

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

-- Activar segurança por linha
alter table users      enable row level security;
alter table artists    enable row level security;
alter table projects   enable row level security;
alter table sessions   enable row level security;
alter table financials enable row level security;
alter table files      enable row level security;
alter table novidades  enable row level security;

-- Permitir acesso com a chave anon
create policy "anon_all" on users      for all using (true) with check (true);
create policy "anon_all" on artists    for all using (true) with check (true);
create policy "anon_all" on projects   for all using (true) with check (true);
create policy "anon_all" on sessions   for all using (true) with check (true);
create policy "anon_all" on financials for all using (true) with check (true);
create policy "anon_all" on files      for all using (true) with check (true);
create policy "anon_all" on novidades  for all using (true) with check (true);
