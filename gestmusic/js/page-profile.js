// ============================================================
// PROFILE
// ============================================================
let profileTab = 'info';

function buildProfile() {
  const u = session;
  const stats = [
    ['Total de Projetos',   appData.projects.length,                                          'var(--gold)'],
    ['Projetos Ativos',     appData.projects.filter(p=>p.status!=='Finalizado').length,        'var(--neon)'],
    ['Artistas Cadastrados',appData.artists.length,                                            'var(--green)'],
    ['Sessões Pendentes',   appData.sessions.filter(s=>s.status!=='Concluído').length,         'var(--purple)'],
    ['Arquivos no Sistema', appData.files.length,                                              'var(--orange)'],
  ];

  const avatarInner = u.photo
    ? `<img src="${u.photo}" style="width:110px;height:110px;border-radius:50%;object-fit:cover;border:3px solid var(--border-bright);box-shadow:0 0 24px var(--gold-glow)">`
    : `<div style="width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,var(--gold),#5B3E08);display:flex;align-items:center;justify-content:center;font-family:Bebas Neue;font-size:46px;color:var(--bg-deep);border:3px solid var(--border-bright);box-shadow:0 0 24px var(--gold-glow)">${(u.name[0]||'A').toUpperCase()}</div>`;

  return `
  <div class="section-header">
    <div><div class="page-title">Meu Perfil</div><div class="page-sub">Gerencie as suas informações e configurações</div></div>
  </div>
  <div class="grid-2" style="align-items:start">

    <!-- LEFT COLUMN -->
    <div style="display:flex;flex-direction:column;gap:16px">

      <!-- AVATAR CARD -->
      <div class="card" style="text-align:center;padding:32px 24px">
        <div class="profile-avatar-wrap" onclick="document.getElementById('prof-photo').click()" style="margin:0 auto 20px">
          ${avatarInner}
          <div class="profile-avatar-overlay">${icon('camera',22)}</div>
          <div class="profile-badge">${icon('camera',12)}</div>
        </div>
        <input type="file" id="prof-photo" accept="image/*" style="display:none" onchange="uploadProfilePhoto(this)">

        <div style="font-family:Bebas Neue;font-size:24px;letter-spacing:2px;margin-bottom:3px">${escH(u.name)}</div>
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:8px">@${escH(u.username)}</div>
        <span class="badge badge-gold" style="margin-bottom:14px;display:inline-flex">${escH(u.role)}</span>

        ${u.studioRole ? `<div style="font-size:13px;color:var(--text-secondary);margin-bottom:3px">${escH(u.studioRole)}</div>` : ''}
        ${u.studioName ? `<div style="font-size:13px;color:var(--gold);margin-bottom:3px">${escH(u.studioName)}</div>` : ''}
        ${u.studioCity ? `<div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">${escH(u.studioCity)}</div>` : ''}
        ${u.email      ? `<div style="font-size:12px;color:var(--text-muted);margin-bottom:3px">${escH(u.email)}</div>` : ''}
        ${u.phone      ? `<div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">${escH(u.phone)}</div>` : ''}
        ${u.bio ? `<div style="font-size:13px;color:var(--text-secondary);font-style:italic;border-top:1px solid var(--border);padding-top:12px;margin-top:8px;line-height:1.6">"${escH(u.bio)}"</div>` : ''}

        <div style="display:flex;gap:8px;margin-top:16px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="document.getElementById('prof-photo').click()">
            ${icon('camera',13)} ${u.photo?'Trocar Foto':'Adicionar Foto'}
          </button>
          ${u.photo ? `<button class="btn btn-danger btn-sm" onclick="removeProfilePhoto()">${icon('trash',13)} Remover</button>` : ''}
        </div>
      </div>

      <!-- STATS CARD -->
      <div class="card">
        <div class="card-header"><div class="card-title">Resumo do Sistema</div></div>
        <div style="display:flex;flex-direction:column">
          ${stats.map(([l,v,c],i) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:${i<stats.length-1?'1px solid var(--border)':'none'}">
            <span style="font-size:13px;color:var(--text-secondary)">${l}</span>
            <span style="font-family:Bebas Neue;font-size:22px;color:${c};letter-spacing:1px">${v}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- RIGHT COLUMN: TABBED FORMS -->
    <div class="card" style="padding:0">
      <div style="padding:20px 24px 0">
        <div class="tab-bar">
          <div class="tab-item ${profileTab==='info'?'active':''}" onclick="profileTab='info';rerenderPage()">Informações Pessoais</div>
          <div class="tab-item ${profileTab==='pwd'?'active':''}"  onclick="profileTab='pwd';rerenderPage()">Alterar Senha</div>
        </div>
      </div>
      <div style="padding:8px 24px 28px">
        ${profileTab==='info' ? buildProfileInfo(u) : buildProfilePwd()}
      </div>
    </div>

  </div>`;
}

// ── INFO TAB ──────────────────────────────────────────────
function buildProfileInfo(u) {
  return `
  <div style="font-family:Bebas Neue;letter-spacing:2px;font-size:14px;color:var(--gold);margin-bottom:14px;margin-top:10px">DADOS PESSOAIS</div>
  <div class="form-row">
    <div class="form-group"><label class="form-label">Nome Completo *</label><input class="form-input" id="pi-name" value="${escH(u.name||'')}"></div>
    <div class="form-group"><label class="form-label">Nome de Utilizador</label><input class="form-input" id="pi-user" value="${escH(u.username||'')}"></div>
  </div>
  <div class="form-row">
    <div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" id="pi-email" value="${escH(u.email||'')}" placeholder="email@exemplo.com"></div>
    <div class="form-group"><label class="form-label">Telefone / WhatsApp</label><input class="form-input" id="pi-phone" value="${escH(u.phone||'')}" placeholder="+244 9xx xxx xxx"></div>
  </div>
  <div style="border-top:1px solid var(--border);margin:16px 0"></div>
  <div style="font-family:Bebas Neue;letter-spacing:2px;font-size:14px;color:var(--gold);margin-bottom:14px">DADOS DO ESTÚDIO</div>
  <div class="form-row">
    <div class="form-group"><label class="form-label">Nome do Estúdio</label><input class="form-input" id="pi-studio" value="${escH(u.studioName||'')}" placeholder="Ex: Gold Records Studio"></div>
    <div class="form-group"><label class="form-label">Cidade / País</label><input class="form-input" id="pi-city" value="${escH(u.studioCity||'')}" placeholder="Ex: Luanda, Angola"></div>
  </div>
  <div class="form-group"><label class="form-label">Cargo / Função</label><input class="form-input" id="pi-role" value="${escH(u.studioRole||'')}" placeholder="Ex: Produtor Musical, Engenheiro de Som..."></div>
  <div class="form-group"><label class="form-label">Bio / Apresentação</label><textarea class="form-textarea" id="pi-bio" style="min-height:90px">${escH(u.bio||'')}</textarea></div>
  <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:12px">
    <button class="btn btn-ghost" onclick="rerenderPage()">Cancelar</button>
    <button class="btn btn-gold" onclick="saveProfileInfo()">${icon('check',14)} Salvar Alterações</button>
  </div>`;
}

// ── PASSWORD TAB ──────────────────────────────────────────
function buildProfilePwd() {
  return `
  <div style="font-family:Bebas Neue;letter-spacing:2px;font-size:14px;color:var(--gold);margin-bottom:14px;margin-top:10px">SEGURANÇA DA CONTA</div>
  <div id="pwd-err" class="login-error" style="display:none;margin-bottom:16px"></div>
  <div class="form-group">
    <label class="form-label">Senha Atual</label>
    <div style="position:relative">
      <input class="form-input" type="password" id="pp-cur" placeholder="Senha atual" style="padding-right:44px">
      <button onclick="togglePwd('pp-cur',this)" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted)">${icon('eye',15)}</button>
    </div>
  </div>
  <div style="border-top:1px solid var(--border);margin:16px 0"></div>
  <div class="form-group">
    <label class="form-label">Nova Senha</label>
    <div style="position:relative">
      <input class="form-input" type="password" id="pp-new" placeholder="Mínimo 6 caracteres" style="padding-right:44px"
        oninput="updateStrengthBar('pp-new','str2-bar','str2-fill','str2-label')">
      <button onclick="togglePwd('pp-new',this)" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted)">${icon('eye',15)}</button>
    </div>
    <div id="str2-bar" style="margin-top:8px;display:none">
      <div class="progress" style="height:5px"><div id="str2-fill" class="progress-bar" style="width:0%"></div></div>
      <div id="str2-label" style="font-size:11px;margin-top:4px"></div>
    </div>
  </div>
  <div class="form-group">
    <label class="form-label">Confirmar Nova Senha</label>
    <div style="position:relative">
      <input class="form-input" type="password" id="pp-conf" placeholder="Repita a nova senha" style="padding-right:44px">
      <button onclick="togglePwd('pp-conf',this)" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted)">${icon('eye',15)}</button>
    </div>
  </div>
  <div style="display:flex;justify-content:flex-end;margin-top:12px">
    <button class="btn btn-gold" onclick="saveProfilePwd()">${icon('lock',14)} Alterar Senha</button>
  </div>`;
}

// ── ACTIONS ───────────────────────────────────────────────
function uploadProfilePhoto(input) {
  const f = input.files[0]; if(!f) return;
  if (!f.type.startsWith('image/'))   { notify('Apenas imagens são permitidas','error'); return; }
  if (f.size > 3*1024*1024)           { notify('Imagem deve ter menos de 3MB','error');  return; }
  const reader = new FileReader();
  reader.onload = ev => {
    session = {...session, photo: ev.target.result};
    const i = appData.users.findIndex(u=>u.id===session.id);
    if (i>=0) appData.users[i] = {...appData.users[i], photo: ev.target.result};
    persist('users'); notify('Foto atualizada!'); rerenderPage();
  };
  reader.readAsDataURL(f);
}

function removeProfilePhoto() {
  session = {...session, photo: null};
  const i = appData.users.findIndex(u=>u.id===session.id);
  if (i>=0) appData.users[i] = {...appData.users[i], photo: null};
  persist('users'); notify('Foto removida!'); rerenderPage();
}

function saveProfileInfo() {
  const name = document.getElementById('pi-name')?.value.trim();
  if (!name) { notify('Nome obrigatório','error'); return; }
  const updates = {
    name,
    username:   document.getElementById('pi-user')?.value.trim()   || session.username,
    email:      document.getElementById('pi-email')?.value          || '',
    phone:      document.getElementById('pi-phone')?.value          || '',
    studioName: document.getElementById('pi-studio')?.value         || '',
    studioCity: document.getElementById('pi-city')?.value           || '',
    studioRole: document.getElementById('pi-role')?.value           || '',
    bio:        document.getElementById('pi-bio')?.value            || '',
  };
  session = {...session, ...updates};
  const i = appData.users.findIndex(u=>u.id===session.id);
  if (i>=0) appData.users[i] = {...appData.users[i], ...updates};
  persist('users'); notify('Perfil atualizado!'); rerenderPage();
}

function saveProfilePwd() {
  const cur  = document.getElementById('pp-cur')?.value;
  const np   = document.getElementById('pp-new')?.value;
  const conf = document.getElementById('pp-conf')?.value;
  const err  = document.getElementById('pwd-err');
  err.style.display = 'none';
  if (cur !== session.password)  { err.textContent='Senha atual incorreta.'; err.style.display='block'; return; }
  if (!np || np.length<6)        { err.textContent='Nova senha deve ter pelo menos 6 caracteres.'; err.style.display='block'; return; }
  if (np !== conf)               { err.textContent='As senhas não coincidem.'; err.style.display='block'; return; }
  session = {...session, password: np};
  const i = appData.users.findIndex(u=>u.id===session.id);
  if (i>=0) appData.users[i] = {...appData.users[i], password: np};
  persist('users');
  document.getElementById('pp-cur').value  = '';
  document.getElementById('pp-new').value  = '';
  document.getElementById('pp-conf').value = '';
  notify('Senha alterada com sucesso!');
}
