// ============================================================
// RENDER ENGINE
// ============================================================
function render() {
  if (appMode === 'portal') {
    renderPortal();
  } else {
    document.getElementById('root').innerHTML = buildApp();
    bindGlobalEvents();
  }
}

function rerenderPage() {
  const area = document.getElementById('page-area');
  if (area) {
    area.innerHTML = buildPage();
    area.className = 'page-content fade-in';
  } else {
    render();
  }
}

function buildApp() {
  if (!session && appData.users.length === 0) return buildFirstSetup();
  if (!session) return buildLogin();
  return `
    <div class="sidebar-overlay ${sidebarOpen?'show':''}" onclick="toggleSidebar(false)"></div>
    <div class="app">
      ${buildSidebar()}
      <div class="main" id="main-area" style="margin-left:${window.innerWidth>900?'260px':'0'}">
        ${buildTopbar()}
        <div class="page-content fade-in" id="page-area">${buildPage()}</div>
      </div>
    </div>`;
}

function bindGlobalEvents() {
  window.onresize = () => {
    const m = document.getElementById('main-area');
    if (m) m.style.marginLeft = window.innerWidth > 900 ? '260px' : '0';
  };
}

function navigate(page) { currentPage = page; sidebarOpen = false; render(); }
function toggleSidebar(val) { sidebarOpen = val === undefined ? !sidebarOpen : val; render(); }
function doLogout() { session = null; render(); }
function switchToPortal() { appMode = 'portal'; renderPortal(); }

// ============================================================
// SIDEBAR
// ============================================================
function buildSidebar() {
  const nav = [
    {id:'dashboard', label:'Dashboard',  icon:'dashboard'},
    {id:'artists',   label:'Artistas',   icon:'artists'},
    {id:'projects',  label:'Projetos',   icon:'projects'},
    {id:'files',     label:'Arquivos',   icon:'files'},
    {id:'sessions',  label:'Agenda',     icon:'calendar'},
    {id:'finance',   label:'Financeiro', icon:'finance'},
    {id:'novidades', label:'Novidades',  icon:'alert'},
  ];
  const avatarHTML = session.photo
    ? `<img src="${session.photo}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--border-bright);flex-shrink:0">`
    : `<div class="user-avatar">${session.name[0]}</div>`;
  return `
  <aside class="sidebar ${sidebarOpen?'open':''}" id="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon" style="color:var(--bg-deep)">${icon('music',20)}</div>
      <div><div class="logo-text">GESTMUSIC</div><div class="logo-sub">RECORD STUDIO</div></div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">NAVEGAÇÃO</div>
      ${nav.map(n=>`<div class="nav-item ${currentPage===n.id?'active':''}" onclick="navigate('${n.id}')">${icon(n.icon,17)} ${n.label}</div>`).join('')}
      <div class="nav-section" style="margin-top:8px">CONTA</div>
      <div class="nav-item ${currentPage==='profile'?'active':''}" onclick="navigate('profile')">${icon('settings',17)} Meu Perfil</div>
    </nav>
    <div class="sidebar-user" onclick="navigate('profile')">
      ${avatarHTML}
      <div class="user-info">
        <div class="user-name">${escH(session.name)}</div>
        <div class="user-role">${escH(session.role)}</div>
      </div>
      <button class="logout-btn" onclick="event.stopPropagation();doLogout()" title="Sair">${icon('logout',17)}</button>
    </div>
  </aside>`;
}

// ============================================================
// TOPBAR
// ============================================================
function buildTopbar() {
  const titles = {dashboard:'Dashboard',artists:'Artistas',projects:'Projetos',files:'Arquivos',sessions:'Agenda',finance:'Financeiro',profile:'Meu Perfil',novidades:'Novidades & Comunicados'};
  return `
  <div class="topbar">
    <button class="menu-btn" onclick="toggleSidebar()">${icon(sidebarOpen?'close':'menu',18)}</button>
    <div class="topbar-title">${titles[currentPage]||currentPage}</div>
    <div style="display:flex;align-items:center;gap:10px">
      <div style="display:flex;align-items:center;gap:6px;background:rgba(201,155,60,.1);border:1px solid rgba(201,155,60,.25);border-radius:20px;padding:4px 10px">
        <span style="color:var(--gold);display:inline-flex">${icon('database',13)}</span>
        <span style="font-size:11px;color:var(--gold);font-weight:700;letter-spacing:.5px">SUPABASE</span>
      </div>
      <button class="btn btn-ghost btn-icon btn-sm" onclick="exportBackup()" title="Exportar backup dos dados">${icon('export',15)}</button>
      <label class="btn btn-ghost btn-icon btn-sm" title="Importar backup">
        ${icon('import',15)}
        <input type="file" accept=".json" style="display:none" onchange="importBackup(this)">
      </label>
    </div>
  </div>`;
}

// ============================================================
// PAGE ROUTER
// ============================================================
function buildPage() {
  switch(currentPage) {
    case 'dashboard': return buildDashboard();
    case 'artists':   return buildArtists();
    case 'projects':  return buildProjects();
    case 'files':     return buildFiles();
    case 'sessions':  return buildSessions();
    case 'finance':   return buildFinance();
    case 'profile':   return buildProfile();
    case 'novidades': return buildNovidades();
    default: return '<p style="color:var(--text-muted)">Página não encontrada.</p>';
  }
}

// ============================================================
// LOGIN
// ============================================================
function buildLogin() {
  return `
  <div class="login-wrap">
    <div class="login-box fade-in">
      <div class="login-logo">
        <div class="login-logo-icon" style="color:var(--bg-deep)">${icon('music',32)}</div>
        <div class="login-title">GESTMUSIC</div>
        <div class="login-sub" style="color:var(--gold);letter-spacing:4px;margin-top:2px">RECORD STUDIO</div>
      </div>
      <div id="login-err" class="login-error" style="display:none"></div>
      <div class="form-group">
        <label class="form-label">Utilizador</label>
        <div class="login-input-wrap">
          <div class="login-input-icon">${icon('user',15)}</div>
          <input class="form-input" id="login-user" placeholder="Digite o seu utilizador" onkeydown="if(event.key==='Enter')doLogin()">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Senha</label>
        <div class="login-input-wrap">
          <div class="login-input-icon">${icon('lock',15)}</div>
          <input class="form-input" id="login-pwd" type="password" placeholder="Digite a sua senha" onkeydown="if(event.key==='Enter')doLogin()">
          <button class="eye-btn" onclick="togglePwd('login-pwd',this)">${icon('eye',15)}</button>
        </div>
      </div>
      <button class="btn btn-gold login-btn" onclick="doLogin()">✦ Entrar no Sistema</button>
      <div style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:16px">GESTMUSIC RECORD — Sistema de Gestão de Estúdio</div>
    </div>
  </div>`;
}

function doLogin() {
  const u   = document.getElementById('login-user')?.value.trim();
  const p   = document.getElementById('login-pwd')?.value;
  const err = document.getElementById('login-err');
  if (!u || !p) { err.textContent='Preencha todos os campos.'; err.style.display='block'; return; }
  const found = appData.users.find(x => x.username===u && x.password===p);
  if (found) { session = found; render(); }
  else { err.textContent='Utilizador ou senha incorretos.'; err.style.display='block'; }
}

// ============================================================
// FIRST SETUP
// ============================================================
function buildFirstSetup() {
  return `
  <div class="login-wrap">
    <div class="login-box fade-in" style="max-width:460px">
      <div class="login-logo">
        <div class="login-logo-icon pulse" style="color:var(--bg-deep)">${icon('music',32)}</div>
        <div class="login-title">GESTMUSIC RECORD</div>
        <div class="login-sub" style="color:var(--gold);letter-spacing:3px;margin-top:4px">PRIMEIRO ACESSO</div>
      </div>
      <div style="background:rgba(201,155,60,.06);border:1px solid var(--border);border-radius:10px;padding:14px 16px;margin-bottom:24px;display:flex;gap:10px;align-items:flex-start">
        <span style="color:var(--gold);flex-shrink:0;margin-top:1px">${icon('alert',16)}</span>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.5">Nenhum administrador cadastrado. Crie o <strong style="color:var(--gold)">primeiro administrador</strong> do sistema.</div>
      </div>
      <div id="setup-err" class="login-error" style="display:none"></div>
      <div class="form-group">
        <label class="form-label">Nome Completo *</label>
        <div class="login-input-wrap">
          <div class="login-input-icon">${icon('user',15)}</div>
          <input class="form-input" id="s-name" placeholder="Ex: João Silva">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Nome de Utilizador *</label>
        <div class="login-input-wrap">
          <div class="login-input-icon">${icon('user',15)}</div>
          <input class="form-input" id="s-user" placeholder="Ex: admin" oninput="this.value=this.value.toLowerCase().replace(/\s/g,'')">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Senha * <span style="color:var(--text-muted);font-size:10px">(mín. 6 caracteres)</span></label>
        <div class="login-input-wrap">
          <div class="login-input-icon">${icon('lock',15)}</div>
          <input class="form-input" id="s-pwd" type="password" placeholder="Crie uma senha segura" oninput="updateStrengthBar('s-pwd','str-bar','str-fill','str-label')">
          <button class="eye-btn" onclick="togglePwd('s-pwd',this)">${icon('eye',15)}</button>
        </div>
        <div id="str-bar" style="margin-top:8px;display:none">
          <div class="progress" style="height:4px"><div id="str-fill" class="progress-bar" style="width:0%"></div></div>
          <div id="str-label" style="font-size:11px;margin-top:4px"></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Confirmar Senha *</label>
        <div class="login-input-wrap">
          <div class="login-input-icon">${icon('check',15)}</div>
          <input class="form-input" id="s-conf" type="password" placeholder="Repita a senha" onkeydown="if(event.key==='Enter')doSetup()">
          <button class="eye-btn" onclick="togglePwd('s-conf',this)">${icon('eye',15)}</button>
        </div>
        <div id="conf-err" style="font-size:11px;color:var(--red);margin-top:4px;display:none">Senhas não coincidem</div>
      </div>
      <button class="btn btn-gold login-btn" onclick="doSetup()">✦ Criar Administrador &amp; Entrar</button>
      <div style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:16px">Esta conta terá acesso completo ao sistema</div>
    </div>
  </div>`;
}

function doSetup() {
  const n    = document.getElementById('s-name')?.value.trim();
  const u    = document.getElementById('s-user')?.value.trim();
  const p    = document.getElementById('s-pwd')?.value;
  const c    = document.getElementById('s-conf')?.value;
  const err  = document.getElementById('setup-err');
  const cerr = document.getElementById('conf-err');
  err.style.display='none'; cerr.style.display='none';
  if (!n)              { err.textContent='Nome completo obrigatório.'; err.style.display='block'; return; }
  if (!u||u.length<3)  { err.textContent='Utilizador deve ter pelo menos 3 caracteres.'; err.style.display='block'; return; }
  if (!p||p.length<6)  { err.textContent='Senha deve ter pelo menos 6 caracteres.'; err.style.display='block'; return; }
  if (p !== c)          { cerr.style.display='block'; return; }
  const admin = { id:Date.now(), username:u, password:p, role:'Administrador', name:n };
  appData = { ...emptyData, users:[admin] };
  session = admin;
  saveData(appData).then(() => render()).catch(() => render());
}
