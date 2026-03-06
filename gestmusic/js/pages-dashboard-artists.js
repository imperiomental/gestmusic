// ============================================================
// DASHBOARD
// ============================================================
function buildDashboard() {
  const totalArtists   = appData.artists.length;
  const activeProjects = appData.projects.filter(p => p.status !== 'Finalizado').length;
  const doneProjects   = appData.projects.filter(p => p.status === 'Finalizado').length;
  const totalRevenue   = appData.projects.reduce((a,p) => a + p.value, 0);
  const pendingPayment = appData.financials.filter(f => f.status !== 'Pago').reduce((a,f) => {
    const proj = appData.projects.find(p => p.id === f.projectId);
    return a + (proj ? proj.value - f.paid : 0);
  }, 0);

  const rev  = [3200,4100,2800,5600,3900,6200,4800,7100,5200,4400,6800,5900];
  const maxR = Math.max(...rev);

  const statusCounts = {};
  appData.projects.forEach(p => { statusCounts[p.status] = (statusCounts[p.status]||0)+1; });
  const sColors = {'Em gravação':'#00D4FF','Em edição':'#F59E0B','Em mixagem':'#8B5CF6','Em masterização':'#C99B3C','Finalizado':'#10B981'};

  const nextSessions = appData.sessions
    .filter(s => s.status !== 'Concluído')
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(0,4);

  return `
  <div class="stats-grid">
    <div class="stat-card gold">
      <div class="stat-icon">${icon('artists',28)}</div>
      <div class="stat-label">Total de Artistas</div>
      <div class="stat-value" style="color:var(--gold-bright)">${totalArtists}</div>
      <div class="stat-sub">${appData.artists.filter(a=>a.status==='Ativo').length} ativos</div>
    </div>
    <div class="stat-card neon">
      <div class="stat-icon">${icon('projects',28)}</div>
      <div class="stat-label">Projetos Ativos</div>
      <div class="stat-value" style="color:var(--neon)">${activeProjects}</div>
      <div class="stat-sub">${doneProjects} finalizados</div>
    </div>
    <div class="stat-card green">
      <div class="stat-icon">${icon('finance',28)}</div>
      <div class="stat-label">Receita Total</div>
      <div class="stat-value" style="color:var(--green);font-size:22px">${fmt(totalRevenue)}</div>
      <div class="stat-sub">todos os projetos</div>
    </div>
    <div class="stat-card red">
      <div class="stat-icon">${icon('alert',28)}</div>
      <div class="stat-label">Pendente</div>
      <div class="stat-value" style="color:var(--orange);font-size:22px">${fmt(pendingPayment)}</div>
      <div class="stat-sub">a receber</div>
    </div>
  </div>

  <div class="grid-2" style="margin-bottom:24px">
    <div class="card">
      <div class="card-header">
        <div class="card-title">Receita Mensal (Kz)</div>
        <span style="color:var(--green);font-size:12px;display:flex;align-items:center;gap:4px">${icon('trending',13)} +12%</span>
      </div>
      <div class="chart-bars">
        ${rev.map((v,i) => `
        <div class="chart-bar" style="height:${(v/maxR)*100}%;background:${i===11?'var(--gold)':'linear-gradient(to top,rgba(201,155,60,.4),rgba(201,155,60,.15))'}">
          <div class="chart-bar-label">${monthsShort[i]}</div>
          ${i===11?`<div class="chart-bar-value" style="color:var(--gold)">Kz5.9k</div>`:''}
        </div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Status dos Projetos</div></div>
      <div class="pie-legend">
        ${Object.entries(statusCounts).map(([s,c]) => `
        <div class="pie-legend-item">
          <div class="pie-dot" style="background:${sColors[s]||'var(--text-muted)'}"></div>
          <span style="flex:1">${s}</span>
          <span style="font-family:Space Mono;font-size:12px;color:var(--text-secondary)">${c}</span>
          <div style="width:80px">
            <div class="progress"><div class="progress-bar" style="width:${(c/appData.projects.length)*100}%;background:${sColors[s]}"></div></div>
          </div>
        </div>`).join('')}
        ${Object.keys(statusCounts).length===0?'<div style="color:var(--text-muted);font-size:13px">Nenhum projeto ainda</div>':''}
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><div class="card-title">Próximas Sessões</div></div>
    ${nextSessions.length===0
      ? '<div class="empty-state"><div class="empty-text">Nenhuma sessão agendada</div></div>'
      : `<div class="table-wrap"><table>
          <thead><tr><th>DATA</th><th>HORA</th><th>ARTISTA</th><th>TIPO</th><th>STATUS</th></tr></thead>
          <tbody>${nextSessions.map(s => {
            const a = appData.artists.find(x=>x.id===s.artistId);
            return `<tr>
              <td style="font-family:Space Mono;font-size:13px">${s.date}</td>
              <td style="font-family:Space Mono;font-size:13px">${s.time}</td>
              <td style="font-weight:700">${escH(a?.artisticName||'-')}</td>
              <td><span class="badge badge-neon">${s.type}</span></td>
              <td><span class="badge badge-${statusColor(s.status)}">${s.status}</span></td>
            </tr>`;
          }).join('')}</tbody>
         </table></div>`
    }
  </div>`;
}

// ============================================================
// ARTISTS
// ============================================================
let artistSearch='', artistFilter='Todos', artistModal=null, artistForm={}, viewArtistId=null;

function buildArtists() {
  const filtered = appData.artists.filter(a =>
    (artistFilter==='Todos' || a.status===artistFilter) &&
    (a.artisticName.toLowerCase().includes(artistSearch.toLowerCase()) ||
     (a.fullName||'').toLowerCase().includes(artistSearch.toLowerCase()) ||
     (a.email||'').toLowerCase().includes(artistSearch.toLowerCase()))
  );
  return `
  <div class="section-header">
    <div><div class="page-title">Artistas</div><div class="page-sub">${appData.artists.length} cadastrados</div></div>
    <button class="btn btn-gold" onclick="openArtistModal('new')">${icon('plus',15)} Novo Artista</button>
  </div>
  <div class="filter-row">
    <div class="search-bar">${icon('search',15)}<input placeholder="Buscar artista..." value="${escH(artistSearch)}" oninput="artistSearch=this.value;rerenderPage()"></div>
    ${['Todos','Ativo','Inativo'].map(f=>`<button class="btn ${artistFilter===f?'btn-gold':'btn-ghost'} btn-sm" onclick="artistFilter='${f}';rerenderPage()">${f}</button>`).join('')}
  </div>
  <div class="card">
    ${filtered.length===0
      ? `<div class="empty-state"><div class="empty-icon">${icon('artists',40)}</div><div class="empty-text">Nenhum artista encontrado</div></div>`
      : `<div class="table-wrap"><table>
          <thead><tr><th>ARTISTA</th><th>CONTATO</th><th>GÉNERO</th><th>CÓDIGO PORTAL</th><th>STATUS</th><th>PROJETOS</th><th>AÇÕES</th></tr></thead>
          <tbody>${filtered.map(a => {
            const projs = appData.projects.filter(p=>p.artistId===a.id).length;
            const avatar = a.photo
              ? `<img src="${a.photo}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid var(--border-bright);flex-shrink:0">`
              : `<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--gold),#5B3E08);display:flex;align-items:center;justify-content:center;font-size:14px;font-family:Bebas Neue;color:var(--bg-deep);flex-shrink:0">${a.artisticName[0]}</div>`;
            return `<tr>
              <td><div style="display:flex;align-items:center;gap:10px">
                ${avatar}
                <div>
                  <div style="font-weight:700;font-size:15px">${escH(a.artisticName)}</div>
                  <div style="font-size:12px;color:var(--text-muted)">${escH(a.fullName||'')}</div>
                </div>
              </div></td>
              <td><div style="font-size:13px">${escH(a.email||'-')}</div><div style="font-size:12px;color:var(--text-muted)">${escH(a.phone||'')}</div></td>
              <td><span class="badge badge-neon">${escH(a.genre||'-')}</span></td>
              <td><span class="badge badge-${statusColor(a.status)}">${a.status}</span></td>
              <td style="font-family:Space Mono;text-align:center">${projs}</td>
              <td>
                ${a.codigoPortal
                  ? `<div style="display:flex;align-items:center;gap:6px">
                      <span style="font-family:Space Mono;font-size:12px;font-weight:700;color:var(--gold);background:rgba(201,155,60,.1);padding:3px 10px;border-radius:6px;border:1px solid rgba(201,155,60,.3)">${escH(a.codigoPortal)}</span>
                      <button class="btn btn-ghost btn-icon btn-sm" onclick="regenerarCodigo(${a.id})" title="Gerar novo código">${icon('trending',12)}</button>
                    </div>`
                  : `<button class="btn btn-outline btn-sm" style="font-size:11px" onclick="gerarEsalvarCodigo(${a.id})">${icon('plus',12)} Gerar Código</button>`
                }
              </td>
              <td><div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-icon btn-sm" onclick="viewArtistId=${a.id};rerenderPage()" title="Ver">${icon('eye',14)}</button>
                <button class="btn btn-ghost btn-icon btn-sm" onclick="openArtistModal('edit',${a.id})" title="Editar">${icon('edit',14)}</button>
                <button class="btn btn-danger btn-icon btn-sm" onclick="deleteArtist(${a.id})" title="Excluir">${icon('trash',14)}</button>
              </div></td>
            </tr>`;
          }).join('')}</tbody>
         </table></div>`
    }
  </div>
  ${artistModal ? buildArtistModal() : ''}
  ${viewArtistId ? buildViewArtist() : ''}`;
}

function buildArtistModal() {
  const isNew = artistModal === 'new';
  return `
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">${isNew?'Novo Artista':'Editar Artista'}</div>
        <button class="btn btn-ghost btn-icon" onclick="artistModal=null;rerenderPage()">${icon('close',16)}</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Nome Artístico *</label><input class="form-input" id="af-artistic" value="${escH(artistForm.artisticName||'')}"></div>
          <div class="form-group"><label class="form-label">Nome Completo</label><input class="form-input" id="af-full" value="${escH(artistForm.fullName||'')}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Telefone</label><input class="form-input" id="af-phone" value="${escH(artistForm.phone||'')}"></div>
          <div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" id="af-email" value="${escH(artistForm.email||'')}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Género Musical</label>
            <select class="form-select" id="af-genre">${genres.map(g=>`<option ${artistForm.genre===g?'selected':''}>${g}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label class="form-label">Status</label>
            <select class="form-select" id="af-status">
              <option ${artistForm.status==='Ativo'?'selected':''}>Ativo</option>
              <option ${artistForm.status==='Inativo'?'selected':''}>Inativo</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label class="form-label">Observações</label><textarea class="form-textarea" id="af-notes">${escH(artistForm.notes||'')}</textarea></div>
        
        <!-- CÓDIGO DO PORTAL -->
        <div style="background:rgba(201,155,60,.06);border:1px solid var(--border);border-radius:10px;padding:14px 16px">
          <div style="font-size:11px;letter-spacing:2px;color:var(--gold);margin-bottom:8px;font-weight:700">CÓDIGO DE ACESSO AO PORTAL</div>
          <div style="display:flex;gap:8px;align-items:center">
            <input class="form-input" id="af-codigo"
              value="${escH(artistForm.codigoPortal||'')}"
              placeholder="Será gerado automaticamente"
              style="font-family:Space Mono;letter-spacing:2px;font-size:14px;text-transform:uppercase"
              oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9-]/g,'')">
            <button class="btn btn-ghost" style="white-space:nowrap;flex-shrink:0" onclick="previewGerarCodigo()" type="button">${icon('trending',14)} Gerar</button>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:8px;line-height:1.5">
            O artista usa este código para entrar no Portal. ${artistForm.codigoPortal?'<strong style=\"color:var(--gold)\">Código actual: <span style=\"font-family:Space Mono\">' + escH(artistForm.codigoPortal) + '</span></strong>':'Um código é gerado automaticamente ao salvar.'}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="artistModal=null;rerenderPage()">Cancelar</button>
        <button class="btn btn-gold" onclick="saveArtist('${artistModal}')">Salvar</button>
      </div>
    </div>
  </div>`;
}

function buildViewArtist() {
  const a = appData.artists.find(x => x.id === viewArtistId); if (!a) return '';
  const projs = appData.projects.filter(p => p.artistId === a.id);
  const avatar = a.photo
    ? `<img src="${a.photo}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid var(--border-bright)">`
    : `<div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--gold),#5B3E08);display:flex;align-items:center;justify-content:center;font-size:26px;font-family:Bebas Neue;color:var(--bg-deep)">${a.artisticName[0]}</div>`;
  return `
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">Perfil — ${escH(a.artisticName)}</div>
        <button class="btn btn-ghost btn-icon" onclick="viewArtistId=null;rerenderPage()">${icon('close',16)}</button>
      </div>
      <div class="modal-body">
        <div style="display:flex;gap:16px;align-items:center;margin-bottom:20px">
          ${avatar}
          <div>
            <div style="font-family:Bebas Neue;font-size:22px">${escH(a.artisticName)}</div>
            <div style="color:var(--text-secondary)">${escH(a.fullName||'')}</div>
            <span class="badge badge-${statusColor(a.status)}">${a.status}</span>
          </div>
        </div>
        <div class="form-row">
          <div><div style="font-size:11px;letter-spacing:2px;color:var(--text-muted);margin-bottom:4px">EMAIL</div><div style="font-weight:600">${escH(a.email||'-')}</div></div>
          <div><div style="font-size:11px;letter-spacing:2px;color:var(--text-muted);margin-bottom:4px">TELEFONE</div><div style="font-weight:600">${escH(a.phone||'-')}</div></div>
          <div><div style="font-size:11px;letter-spacing:2px;color:var(--text-muted);margin-bottom:4px">GÉNERO</div><div style="font-weight:600">${escH(a.genre||'-')}</div></div>
        </div>
        <!-- ACESSO AO PORTAL -->
        <div style="background:rgba(201,155,60,.06);border:1px solid rgba(201,155,60,.3);border-radius:12px;padding:16px;margin-bottom:4px">
          <div style="font-size:10px;letter-spacing:2px;color:var(--gold);margin-bottom:12px;font-weight:700;display:flex;align-items:center;gap:6px">
            ${icon('music',13)} ACESSO AO PORTAL DO ARTISTA
          </div>
          ${a.codigoPortal ? `
          <!-- CÓDIGO -->
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
            <div style="flex:1;min-width:0">
              <div style="font-size:10px;color:var(--text-muted);letter-spacing:1px;margin-bottom:4px">CÓDIGO DE ACESSO</div>
              <div style="font-family:Space Mono;font-size:22px;font-weight:700;color:var(--gold-bright);letter-spacing:4px">${escH(a.codigoPortal)}</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="copiarCodigo('${escH(a.codigoPortal)}')" style="flex-shrink:0">
              ${icon('upload',14)} Copiar Código
            </button>
          </div>
          <!-- LINK DIRECTO -->
          <div style="margin-bottom:10px">
            <div style="font-size:10px;color:var(--text-muted);letter-spacing:1px;margin-bottom:6px">LINK DIRECTO (entra automaticamente)</div>
            <div style="display:flex;gap:6px;align-items:center">
              <input id="link-portal-${a.id}" readonly
                value="${escH(gerarLinkPortal(a.codigoPortal))}"
                style="flex:1;font-family:Space Mono;font-size:11px;background:var(--bg-deep);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:var(--text-secondary);min-width:0;cursor:text"
                onclick="this.select()">
              <button class="btn btn-ghost btn-sm" onclick="copiarLink('link-portal-${a.id}')" style="flex-shrink:0" title="Copiar link">
                ${icon('upload',14)}
              </button>
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.5">
              📱 Manda este link ao artista por WhatsApp — ele abre o portal já dentro da conta dele.
            </div>
          </div>
          <!-- MENSAGEM WHATSAPP PRONTA -->
          <button class="btn btn-ghost btn-sm" style="width:100%;color:var(--green);border-color:rgba(16,185,129,.3)" onclick="copiarMsgWhatsApp('${escH(a.artisticName)}','${escH(a.codigoPortal)}','${escH(gerarLinkPortal(a.codigoPortal))}')">
            💬 Copiar Mensagem para WhatsApp
          </button>` : `
          <div style="text-align:center;padding:10px 0">
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:10px">Este artista ainda não tem código de acesso.</div>
            <button class="btn btn-gold btn-sm" onclick="gerarEsalvarCodigo(${a.id})">
              ${icon('plus',13)} Gerar Código Agora
            </button>
          </div>`}
        </div>
        ${a.notes?`<div class="divider"></div><div style="font-size:13px;color:var(--text-secondary)">${escH(a.notes)}</div>`:''}
        <div class="divider"></div>
        <div style="font-family:Bebas Neue;letter-spacing:2px;margin-bottom:12px">Projetos</div>
        ${projs.length===0?'<div style="color:var(--text-muted);font-size:13px">Nenhum projeto</div>':projs.map(p=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="font-weight:600">${escH(p.name)}</span>
          <span class="badge badge-${statusColor(p.status)}">${p.status}</span>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function openArtistModal(type, id=null) {
  artistModal = type;
  if (type==='edit' && id) { artistForm = {...appData.artists.find(x=>x.id===id)}; }
  else { artistForm = {artisticName:'',fullName:'',phone:'',email:'',genre:genres[0],status:'Ativo',notes:''}; }
  rerenderPage();
}
function saveArtist(type) {
  const name = document.getElementById('af-artistic')?.value.trim();
  if (!name) { notify('Nome artístico obrigatório','error'); return; }
  const genero = document.getElementById('af-genre')?.value||'MUSI';
  let codigo = (document.getElementById('af-codigo')?.value||'').trim().toUpperCase();
  if (!codigo) codigo = gerarCodigoPortal(genero);
  const obj = {
    artisticName: name,
    fullName:  document.getElementById('af-full')?.value||'',
    phone:     document.getElementById('af-phone')?.value||'',
    email:     document.getElementById('af-email')?.value||'',
    genre:     genero,
    status:    document.getElementById('af-status')?.value||'Ativo',
    notes:     document.getElementById('af-notes')?.value||'',
    codigoPortal: codigo,
  };
  if (type==='new') { appData.artists.push({...obj,id:Date.now()}); }
  else { const i=appData.artists.findIndex(x=>x.id===artistForm.id); if(i>=0) appData.artists[i]={...appData.artists[i],...obj}; }
  persist('artists'); artistModal=null;
  notify(type==='new'?'Artista cadastrado!':'Artista atualizado!');
  rerenderPage();
}
function deleteArtist(id) {
  if (!confirm('Remover este artista?')) return;
  appData.artists = appData.artists.filter(a=>a.id!==id);
  persist('artists'); notify('Artista removido!'); rerenderPage();
}

// ── LINK DO PORTAL — helpers ──────────────────────────────

// Gera o link completo para o portal com o código no URL
// Funciona localmente (file://) e em servidor web
function gerarLinkPortal(codigo) {
  const base = window.location.href
    .replace(/\/admin\.html.*$/, '')
    .replace(/\/index\.html.*$/, '')
    .replace(/\?.*$/, '');
  return base + '/portal.html?codigo=' + encodeURIComponent(codigo);
}

function copiarCodigo(codigo) {
  navigator.clipboard.writeText(codigo)
    .then(()=>notify('Código copiado!'))
    .catch(()=>{ prompt('Copia manualmente:', codigo); });
}

function copiarLink(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return;
  navigator.clipboard.writeText(el.value)
    .then(()=>notify('Link copiado!'))
    .catch(()=>{ el.select(); document.execCommand('copy'); notify('Link copiado!'); });
}

function copiarMsgWhatsApp(nome, codigo, link) {
  const msg = `Olá ${nome}! 🎵

O teu portal no GESTMUSIC RECORD está pronto.

Podes aceder aqui:
${link}

Ou entrar manualmente com o código: *${codigo}*

Qualquer dúvida fala connosco! 🎶`;
  navigator.clipboard.writeText(msg)
    .then(()=>notify('Mensagem copiada! Cola no WhatsApp.'))
    .catch(()=>{ prompt('Copia a mensagem:', msg); });
}

// ── CÓDIGO DO PORTAL — helpers ────────────────────────────
function previewGerarCodigo() {
  const genero = document.getElementById('af-genre')?.value || 'MUSI';
  const codigo = gerarCodigoPortal(genero);
  const inp = document.getElementById('af-codigo');
  if (inp) inp.value = codigo;
}

function gerarEsalvarCodigo(artistId) {
  const i = appData.artists.findIndex(a=>a.id===artistId);
  if (i<0) return;
  const codigo = gerarCodigoPortal(appData.artists[i].genre||'MUSI');
  appData.artists[i].codigoPortal = codigo;
  persist('artists');
  notify('Código gerado: ' + codigo);
  rerenderPage();
}

function regenerarCodigo(artistId) {
  const a = appData.artists.find(x=>x.id===artistId);
  if (!confirm('Gerar novo código para ' + (a?.artisticName||'este artista') + '?\nO código antigo deixará de funcionar.')) return;
  gerarEsalvarCodigo(artistId);
}
