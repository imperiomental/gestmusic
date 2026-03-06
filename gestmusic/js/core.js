// ============================================================
// GESTMUSIC — Motor de Dados: Supabase
// Os dados ficam na nuvem — admin e portal partilham os mesmos dados
// ============================================================

// ── CONFIGURAÇÃO SUPABASE ─────────────────────────────────
// PASSO 1: substitui estes dois valores com os teus do Supabase
// (ver GUIA_SUPABASE.md para instruções)
const SUPA_URL = 'https://lrdazlmutxyqrmgrqpze.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZGF6bG11dHh5cXJtZ3JxcHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NDQ0NTksImV4cCI6MjA4ODMyMDQ1OX0.AKN-WOMFMO9_X1EOAlmBVaWzM4ud8tW9ce1_YZFsxw8';

// ── CLIENTE SUPABASE (REST API via fetch) ─────────────────
// Usamos a REST API directamente, sem biblioteca externa,
// para manter o projecto como ficheiros estáticos simples.

async function sbFetch(path, opts = {}) {
  const url = `${SUPA_URL}/rest/v1/${path}`;
  const res  = await fetch(url, {
    headers: {
      'apikey':        SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        opts.prefer || 'return=representation',
      ...opts.headers,
    },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  // DELETE devolve 204 sem corpo
  if (res.status === 204) return [];
  return res.json();
}

// SELECT — lê todos os registos de uma tabela
function sbSelect(table) {
  return sbFetch(`${table}?order=id`);
}

// UPSERT — insere ou actualiza (por id)
function sbUpsert(table, record) {
  return sbFetch(table, {
    method:  'POST',
    prefer:  'return=representation,resolution=merge-duplicates',
    headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
    body:    JSON.stringify(record),
  });
}

// DELETE — apaga por id
function sbDelete(table, id) {
  return sbFetch(`${table}?id=eq.${id}`, {
    method: 'DELETE',
    prefer: '',
    headers: { 'Prefer': '' },
  });
}

// ── API PÚBLICA ───────────────────────────────────────────
const TABLES = ['users','artists','projects','sessions','financials','files','novidades'];

// Carrega TODOS os dados de todas as tabelas para memória
async function loadAllData() {
  const results = await Promise.all(TABLES.map(t => sbSelect(t).catch(() => [])));
  const data = {};
  TABLES.forEach((t, i) => { data[t] = results[i]; });
  return data;
}

// Persiste UMA tabela: upsert todos + apaga os removidos
async function saveStore(storeName) {
  const arr      = appData[storeName] || [];
  const remote   = await sbSelect(storeName).catch(() => []);
  const remoteIds = new Set(remote.map(r => r.id));
  const localIds  = new Set(arr.map(r => r.id));

  // Upsert todos os locais
  if (arr.length > 0) {
    await sbFetch(storeName, {
      method:  'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body:    JSON.stringify(arr),
    });
  }
  // Apaga os que foram removidos
  const toDelete = [...remoteIds].filter(id => !localIds.has(id));
  await Promise.all(toDelete.map(id => sbDelete(storeName, id)));
}

// Versão completa: persiste todos os dados
async function saveData(data) {
  await Promise.all(TABLES.map(async t => {
    const arr = data[t] || [];
    if (arr.length > 0) {
      await sbFetch(t, {
        method:  'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
        body:    JSON.stringify(arr),
      });
    }
  }));
}

// Wrapper chamado pelos módulos: persiste uma tabela silenciosamente
function persist(storeName) {
  saveStore(storeName).catch(e => {
    console.error(`Supabase persist error [${storeName}]:`, e);
    notify('Erro ao guardar. Verifica a ligação.', 'error');
  });
}

// ── VERIFICAÇÃO DA CONFIGURAÇÃO ───────────────────────────
function supabaseConfigurado() {
  return SUPA_URL !== 'COLOCA_AQUI_O_TUA_URL' &&
         SUPA_KEY !== 'COLOCA_AQUI_A_TUA_ANON_KEY' &&
         SUPA_URL.startsWith('https://') &&
         SUPA_KEY.length > 20;
}

// ── ESTADO GLOBAL ─────────────────────────────────────────
const emptyData = { users:[], artists:[], projects:[], sessions:[], financials:[], files:[], novidades:[] };
let appData     = { ...emptyData };
let appMode     = 'admin';
let session     = null;
let currentPage = 'dashboard';
let sidebarOpen = false;

// ── BOOT ADMIN ────────────────────────────────────────────
async function bootApp() {
  document.getElementById('root').innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--bg-deep);gap:16px">
      <div style="width:56px;height:56px;background:linear-gradient(135deg,var(--gold),#5B3E08);border-radius:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px var(--gold-glow)">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#080B10" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      </div>
      <div style="font-family:Bebas Neue;font-size:22px;letter-spacing:3px;color:var(--gold-bright)">GESTMUSIC RECORD</div>
      <div style="display:flex;align-items:center;gap:10px;color:var(--text-muted);font-size:13px">
        <div style="width:18px;height:18px;border:2px solid var(--gold);border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite"></div>
        A ligar ao Supabase...
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>`;

  // Verificar se as credenciais foram configuradas
  if (!supabaseConfigurado()) {
    document.getElementById('root').innerHTML = buildSetupPage();
    return;
  }

  try {
    appData = await loadAllData();
  } catch(e) {
    console.error('Supabase connection error:', e);
    document.getElementById('root').innerHTML = buildConnectionError(e.message);
    return;
  }

  appMode = 'admin';
  render();
}

// Ecrã de erro de ligação
function buildConnectionError(msg) {
  return `
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg-deep);padding:20px">
    <div style="background:var(--bg-card);border:1px solid rgba(239,68,68,.3);border-radius:16px;padding:32px;max-width:460px;width:100%;text-align:center">
      <div style="font-size:40px;margin-bottom:16px">⚠️</div>
      <div style="font-family:Bebas Neue;font-size:22px;letter-spacing:2px;color:var(--red);margin-bottom:10px">ERRO DE LIGAÇÃO</div>
      <div style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">
        Não foi possível ligar ao Supabase.<br>
        <span style="font-family:Space Mono;font-size:12px;color:var(--red)">${escH(msg||'')}</span>
      </div>
      <div style="background:var(--bg-deep);border-radius:10px;padding:14px;text-align:left;font-size:12px;color:var(--text-muted);line-height:1.8;margin-bottom:20px">
        <strong style="color:var(--gold)">Verifica:</strong><br>
        1. As credenciais em <code style="color:var(--neon)">js/core.js</code><br>
        2. Se o projecto Supabase está activo<br>
        3. Se as tabelas foram criadas (ver GUIA_SUPABASE.md)
      </div>
      <button class="btn btn-gold" onclick="location.reload()">↺ Tentar novamente</button>
    </div>
  </div>`;
}

// Ecrã de setup inicial (credenciais por configurar)
function buildSetupPage() {
  return `
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg-deep);padding:20px">
    <div style="background:var(--bg-card);border:1px solid rgba(201,155,60,.3);border-radius:16px;padding:32px;max-width:500px;width:100%">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:36px;margin-bottom:12px">🔧</div>
        <div style="font-family:Bebas Neue;font-size:24px;letter-spacing:3px;color:var(--gold-bright)">CONFIGURAÇÃO SUPABASE</div>
        <div style="font-size:13px;color:var(--text-muted);margin-top:6px">As credenciais ainda não foram configuradas.</div>
      </div>
      <div style="background:var(--bg-deep);border-radius:10px;padding:18px;font-size:13px;color:var(--text-secondary);line-height:1.9">
        <div style="font-weight:700;color:var(--gold);margin-bottom:8px">📋 Passos:</div>
        <ol style="margin:0;padding-left:20px">
          <li>Abre o ficheiro <code style="color:var(--neon)">GUIA_SUPABASE.md</code></li>
          <li>Cria o projecto no <a href="https://supabase.com" target="_blank" style="color:var(--gold)">supabase.com</a></li>
          <li>Cria as tabelas com o SQL do guia</li>
          <li>Cola a URL e a chave em <code style="color:var(--neon)">js/core.js</code></li>
          <li>Faz o deploy novamente no Netlify</li>
        </ol>
      </div>
      <div style="margin-top:20px;text-align:center">
        <a href="GUIA_SUPABASE.md" target="_blank" class="btn btn-gold" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px">
          📖 Abrir Guia de Configuração
        </a>
      </div>
    </div>
  </div>`;
}

// ── CONSTANTES ────────────────────────────────────────────
const genres   = ['Kuduro','Afrobeat','Afro House','Zouk','Drill','Rap','Hip-Hop','Funk','Pop','Rock','Eletrônico','Gospel','MPB','Semba','Kizomba','Outro'];
const statuses = ['Em gravação','Em edição','Em mixagem','Em masterização','Finalizado'];
const months      = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const monthsShort = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const pipeline = [
  {label:'Gravação',icon:'🎙️'},{label:'Edição',icon:'✂️'},
  {label:'Mixagem',icon:'🎚️'},{label:'Master',icon:'💿'},{label:'Finalizado',icon:'✅'}
];

// ── HELPERS ───────────────────────────────────────────────
const fmt = (n) => {
  const v = Number(n) || 0;
  return 'Kz ' + new Intl.NumberFormat('pt-AO', { minimumFractionDigits:2, maximumFractionDigits:2 }).format(v);
};
const statusColor = (s) => ({
  'Em gravação':'neon','Em edição':'orange','Em mixagem':'purple',
  'Em masterização':'gold','Finalizado':'green',
  'Ativo':'green','Inativo':'gray',
  'Confirmado':'neon','Cancelado':'red','Concluído':'green',
  'Pago':'green','Parcial':'orange','Em aberto':'red',
}[s] || 'gray');
const completionPct   = { 'Em gravação':20,'Em edição':40,'Em mixagem':60,'Em masterização':80,'Finalizado':100 };
const completionColor = (p) => p<=20?'var(--neon)':p<=40?'var(--orange)':p<=60?'var(--purple)':p<=80?'var(--gold)':'var(--green)';
function escH(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escQ(s){ return String(s||'').replace(/'/g,"\\'"); }
function gerarCodigoPortal(genero) {
  const prefix = (genero||'MUSI').toUpperCase().replace(/[^A-Z]/g,'').slice(0,4).padEnd(4,'X');
  return prefix + '-' + String(Math.floor(1000 + Math.random() * 9000));
}

// ── ICONS ─────────────────────────────────────────────────
const ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  artists:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  projects:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  files:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>',
  calendar:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  finance:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  logout:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  menu:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  close:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  plus:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  edit:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  trash:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  search:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  upload:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',
  download:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>',
  music:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  check:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
  user:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  eye:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
  trending:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  alert:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  settings:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  camera:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  lock:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  database:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
  export:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  import:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
};
function icon(name, size=18) {
  return `<span style="display:inline-flex;align-items:center;width:${size}px;height:${size}px;flex-shrink:0">${ICONS[name]||''}</span>`;
}

// ── NOTIFY ────────────────────────────────────────────────
let _notifTimer = null;
function notify(msg, type='success') {
  let el = document.getElementById('notif');
  if (!el) { el = document.createElement('div'); el.id='notif'; document.body.appendChild(el); }
  el.className = `notif notif-${type}`;
  el.innerHTML = icon(type==='success'?'check':'alert', 16) + ` ${msg}`;
  el.style.display = 'flex';
  clearTimeout(_notifTimer);
  _notifTimer = setTimeout(() => { el.style.display='none'; }, 3200);
}

// ── PASSWORD STRENGTH ─────────────────────────────────────
function pwdStrength(p) {
  if (!p) return {level:0,label:'',color:''};
  let s=0;
  if(p.length>=6)s++; if(p.length>=10)s++;
  if(/[A-Z]/.test(p))s++; if(/[0-9]/.test(p))s++; if(/[^A-Za-z0-9]/.test(p))s++;
  if(s<=1) return {level:20,label:'Fraca',color:'var(--red)'};
  if(s<=2) return {level:40,label:'Regular',color:'var(--orange)'};
  if(s<=3) return {level:65,label:'Boa',color:'var(--gold)'};
  return {level:100,label:'Forte',color:'var(--green)'};
}
function updateStrengthBar(inputId, barId, fillId, labelId) {
  const v=document.getElementById(inputId)?.value||'';
  const bar=document.getElementById(barId); if(!bar) return;
  const s=pwdStrength(v);
  bar.style.display=v?'block':'none';
  document.getElementById(fillId).style.cssText=`width:${s.level}%;background:${s.color};transition:all .3s`;
  const lbl=document.getElementById(labelId); lbl.textContent='Força: '+s.label; lbl.style.color=s.color;
}
function togglePwd(id,btn) {
  const el=document.getElementById(id); if(!el) return;
  const show=el.type==='password'; el.type=show?'text':'password';
  btn.innerHTML=icon(show?'eyeOff':'eye',15);
}

// ── EXPORT / IMPORT BACKUP ────────────────────────────────
function exportBackup() {
  const blob=new Blob([JSON.stringify(appData,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=`gestmusic_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click(); URL.revokeObjectURL(url);
  notify('Backup exportado!');
}
function importBackup(input) {
  const file=input.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=async(e)=>{
    try {
      const data=JSON.parse(e.target.result);
      if(!data.users||!Array.isArray(data.users)) throw new Error('Formato inválido');
      if(!confirm(`Importar backup?\nVAI SUBSTITUIR todos os dados.\n\nUtilizadores: ${data.users.length} | Artistas: ${data.artists?.length||0} | Projetos: ${data.projects?.length||0}`)) return;
      await saveData(data);
      appData=await loadAllData();
      session=null;
      notify('Backup importado!');
      setTimeout(()=>render(),800);
    } catch(err) { notify('Ficheiro inválido: '+err.message,'error'); }
  };
  reader.readAsText(file);
}
