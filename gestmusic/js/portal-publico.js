// ============================================================
// PORTAL PÚBLICO — Acesso para Músicos/Artistas
// Autenticação OBRIGATÓRIA via código único — nunca auto-login
// ============================================================

let portalArtist         = null;
let portalPage           = 'musicas';
let portalCodigoPreenchido = ''; // código do URL (pré-preenche campo, NÃO entra sozinho)

// ── RENDER ───────────────────────────────────────────────
function renderPortal() {
  document.getElementById('root').innerHTML = buildPortal();
}
function buildPortal() {
  return portalArtist ? buildPortalApp() : buildPortalLogin();
}

// ── ECRÃ DE LOGIN ────────────────────────────────────────
function buildPortalLogin() {
  const news = (appData.novidades || [])
    .filter(n => n.publica)
    .sort((a,b) => b.id - a.id)
    .slice(0, 2);

  // Se veio com código no URL, mostra aviso de que ainda precisa confirmar
  const temCodigoPre = !!portalCodigoPreenchido;

  return `
  <div style="min-height:100vh;background:var(--bg-deep);display:flex;flex-direction:column">

    <!-- HERO -->
    <div style="background:linear-gradient(180deg,#0d0a00 0%,var(--bg-deep) 100%);padding:48px 20px 36px;text-align:center;position:relative;overflow:hidden;border-bottom:1px solid var(--border)">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(201,155,60,.18) 0%,transparent 65%);pointer-events:none"></div>
      <div style="position:relative;z-index:1">
        <div style="width:70px;height:70px;background:linear-gradient(135deg,var(--gold),#5B3E08);border-radius:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 0 50px rgba(201,155,60,.35)">
          ${icon('music',36)}
        </div>
        <div style="font-family:Bebas Neue;font-size:clamp(30px,7vw,46px);letter-spacing:5px;color:var(--gold-bright);line-height:1">GESTMUSIC RECORD</div>
        <div style="font-size:12px;color:var(--text-muted);letter-spacing:4px;margin-top:6px">PORTAL DO ARTISTA</div>
        <div style="margin-top:14px;font-size:14px;color:var(--text-secondary);max-width:380px;margin-left:auto;margin-right:auto;line-height:1.7">
          Acede às tuas músicas, à tua agenda e às novidades do estúdio.
        </div>
      </div>
    </div>

    <!-- CONTEÚDO -->
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:36px 16px;gap:28px;max-width:860px;margin:0 auto;width:100%">

      <!-- CARD DE ACESSO -->
      <div style="background:var(--bg-card);border:1px solid ${temCodigoPre?'rgba(201,155,60,.5)':'var(--border)'};border-radius:18px;padding:32px;width:100%;max-width:420px;box-shadow:${temCodigoPre?'0 0 30px rgba(201,155,60,.15)':'0 8px 40px rgba(0,0,0,.4)'}">
        <div style="font-family:Bebas Neue;font-size:20px;letter-spacing:2px;color:var(--gold-bright);margin-bottom:4px">
          ${temCodigoPre ? '✦ O TEU CÓDIGO JÁ ESTÁ PRONTO' : 'O TEU CÓDIGO DE ACESSO'}
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:${temCodigoPre?'16':'24'}px;line-height:1.6">
          ${temCodigoPre
            ? 'O teu produtor enviou-te este link com o código pré-preenchido. Confirma que é o teu código e carrega <strong style="color:var(--gold)">Entrar</strong>.'
            : 'Introduz o código que o estúdio te forneceu. Ex: <span style="font-family:Space Mono;color:var(--gold)">AFRO-5531</span>'}
        </div>

        <div id="portal-err" style="display:none;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:10px;padding:12px 14px;font-size:13px;color:var(--red);margin-bottom:18px;line-height:1.5"></div>

        <div class="form-group" style="margin-bottom:${temCodigoPre?'10':'20'}px">
          <label class="form-label">Código do Artista</label>
          <div style="position:relative">
            <div style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--gold);pointer-events:none">${icon('lock',16)}</div>
            <input class="form-input" id="pa-code"
              value="${escH(portalCodigoPreenchido)}"
              style="padding-left:42px;font-family:Space Mono;font-size:18px;letter-spacing:4px;text-transform:uppercase;${temCodigoPre?'border-color:rgba(201,155,60,.6);color:var(--gold-bright);font-weight:700;text-align:center':''}"
              placeholder="XXXX-0000"
              maxlength="9"
              oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9-]/g,'')"
              onkeydown="if(event.key==='Enter')doPortalLogin()">
          </div>
          ${temCodigoPre ? `<div style="font-size:11px;color:var(--text-muted);margin-top:6px;text-align:center">Podes alterar o código se necessário</div>` : ''}
        </div>

        <button class="btn btn-gold" style="width:100%;height:50px;font-size:15px;letter-spacing:1px" onclick="doPortalLogin()">
          ${icon('music',16)} Entrar no Meu Portal
        </button>
        <div style="margin-top:14px;text-align:center;font-size:12px;color:var(--text-muted)">
          Não tens código? Pede ao teu produtor.
        </div>
      </div>

      <!-- NOVIDADES PÚBLICAS -->
      ${news.length > 0 ? `
      <div style="width:100%;max-width:420px">
        <div style="font-size:10px;letter-spacing:3px;color:var(--text-muted);margin-bottom:14px;text-align:center">📢 NOVIDADES DO ESTÚDIO</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${news.map(n=>`
          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;overflow:hidden">
            ${n.imagem?`<img src="${escH(n.imagem)}" style="width:100%;max-height:180px;object-fit:cover;display:block" onerror="this.style.display='none'">` : ''}
            <div style="padding:16px 18px;display:flex;gap:12px;align-items:flex-start">
              ${n.emoji?`<span style="font-size:22px;flex-shrink:0;line-height:1;margin-top:2px">${n.emoji}</span>`:''}
              <div>
                ${n.tag?`<div style="font-size:10px;letter-spacing:2px;color:var(--gold);font-weight:700;margin-bottom:4px">${escH(n.tag)}</div>`:''}
                <div style="font-weight:700;font-size:14px;margin-bottom:6px">${escH(n.titulo)}</div>
                <div style="font-size:12px;color:var(--text-secondary);line-height:1.75;text-align:justify">${escH(n.corpo)}</div>
                <div style="font-size:10px;color:var(--text-muted);margin-top:8px">${new Date(n.id).toLocaleDateString('pt-AO',{day:'2-digit',month:'long',year:'numeric'})}</div>
              </div>
            </div>
          </div>`).join('')}
        </div>
      </div>` : ''}

    </div>

    <div style="text-align:center;padding:18px 20px;font-size:12px;color:var(--text-muted);border-top:1px solid var(--border)">
      GESTMUSIC RECORD STUDIO
    </div>
  </div>`;
}

// Login — SEMPRE validação manual, nunca automático
function doPortalLogin() {
  const code = (document.getElementById('pa-code')?.value || '').trim().toUpperCase();
  const err  = document.getElementById('portal-err');
  err.style.display = 'none';

  if (!code || code.length < 4) {
    err.textContent = 'Introduz o teu código de acesso.';
    err.style.display = 'block'; return;
  }

  const found = appData.artists.find(a =>
    a.codigoPortal && a.codigoPortal.toUpperCase() === code
  );

  if (!found) {
    err.innerHTML = `Código <strong style="font-family:Space Mono">${escH(code)}</strong> não encontrado.<br>Confirma o código com o teu produtor.`;
    err.style.display = 'block'; return;
  }

  portalArtist         = found;
  portalPage           = 'musicas';
  portalCodigoPreenchido = '';
  renderPortal();
}

// ── APP SHELL ────────────────────────────────────────────
function buildPortalApp() {
  const a = portalArtist;
  const avatar = a.photo
    ? `<img src="${a.photo}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);flex-shrink:0">`
    : `<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--gold),#5B3E08);display:flex;align-items:center;justify-content:center;font-family:Bebas Neue;font-size:18px;color:var(--bg-deep);flex-shrink:0">${a.artisticName[0]}</div>`;

  const tabs = [
    { id:'musicas',   label:'Músicas',   emoji:'🎵' },
    { id:'novidades', label:'Novidades', emoji:'📢' },
    { id:'agenda',    label:'Agenda',    emoji:'📅' },
  ];

  const projs      = appData.projects.filter(p=>p.artistId===a.id);
  const downloads  = projs.filter(p=>p.status==='Finalizado'&&(p.downloadLinks||[]).length>0).length;
  const newsCount  = (appData.novidades||[]).filter(n=>n.publica||n.artistaId==a.id).length;
  const now        = new Date();
  const sessoes    = getPortalSessions().filter(s=>new Date(s.date+'T'+(s.time||'00:00'))>=now).length;
  const badges     = { musicas: downloads||'', novidades: newsCount||'', agenda: sessoes||'' };

  return `
  <div style="min-height:100vh;background:var(--bg-deep);display:flex;flex-direction:column">
    <!-- TOPBAR -->
    <div style="background:var(--bg-card);border-bottom:1px solid var(--border);padding:0 16px;height:58px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;gap:10px">
      <div style="display:flex;align-items:center;gap:10px;min-width:0">
        <div style="width:32px;height:32px;background:linear-gradient(135deg,var(--gold),#5B3E08);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          ${icon('music',16)}
        </div>
        <div>
          <div style="font-family:Bebas Neue;font-size:14px;letter-spacing:2px;color:var(--gold-bright);line-height:1">GESTMUSIC</div>
          <div style="font-size:9px;color:var(--text-muted);letter-spacing:1px">PORTAL DO ARTISTA</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
        ${avatar}
        <div style="display:flex;flex-direction:column;line-height:1.2">
          <span style="font-weight:700;font-size:13px;white-space:nowrap">${escH(a.artisticName)}</span>
          <span style="font-size:10px;color:var(--gold);font-family:Space Mono">${escH(a.codigoPortal||'')}</span>
        </div>
        <button onclick="portalLogout()" style="background:none;border:1px solid var(--border);border-radius:8px;padding:5px 10px;cursor:pointer;color:var(--text-muted);font-size:12px;display:flex;align-items:center;gap:4px;font-family:Rajdhani;font-weight:600">
          ${icon('logout',13)} Sair
        </button>
      </div>
    </div>

    <!-- TABS -->
    <div style="background:var(--bg-card);border-bottom:1px solid var(--border);display:flex;overflow-x:auto;scrollbar-width:none">
      ${tabs.map(t=>`
      <button onclick="portalPage='${t.id}';renderPortal()"
        style="flex:1;min-width:110px;display:flex;align-items:center;justify-content:center;gap:7px;padding:14px 10px;border:none;background:none;cursor:pointer;font-family:Rajdhani;font-size:13px;font-weight:700;letter-spacing:.5px;color:${portalPage===t.id?'var(--gold)':'var(--text-secondary)'};border-bottom:2px solid ${portalPage===t.id?'var(--gold)':'transparent'};white-space:nowrap">
        ${t.emoji} ${t.label}
        ${badges[t.id]?`<span style="background:var(--gold);color:var(--bg-deep);border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700">${badges[t.id]}</span>`:''}
      </button>`).join('')}
    </div>

    <!-- CONTEÚDO -->
    <div style="flex:1;padding:20px 14px 40px;max-width:820px;margin:0 auto;width:100%">
      ${buildPortalPage()}
    </div>

    <div style="text-align:center;padding:14px;font-size:11px;color:var(--text-muted);border-top:1px solid var(--border)">
      GESTMUSIC RECORD STUDIO
    </div>
  </div>`;
}

function buildPortalPage() {
  switch(portalPage) {
    case 'musicas':   return buildPortalMusicas();
    case 'novidades': return buildPortalNovidades();
    case 'agenda':    return buildPortalAgenda();
    default:          return buildPortalMusicas();
  }
}

function getPortalSessions() {
  const a = portalArtist;
  const projIds = appData.projects.filter(p=>p.artistId===a.id).map(p=>p.id);
  return appData.sessions.filter(s =>
    s.artistId == a.id || projIds.includes(Number(s.projectId)) || projIds.includes(s.projectId)
  );
}

// ══════════════════════════════════════════════════════════
// MÚSICAS — com estado visual claro por projeto
// ══════════════════════════════════════════════════════════
function buildPortalMusicas() {
  const a       = portalArtist;
  const todos   = appData.projects.filter(p=>p.artistId===a.id);
  const feitos  = todos.filter(p=>p.status==='Finalizado');
  const emCurso = todos.filter(p=>p.status!=='Finalizado');

  if (todos.length === 0) return `
  <div style="text-align:center;padding:60px 20px">
    <div style="font-size:52px;margin-bottom:16px">🎵</div>
    <div style="font-family:Bebas Neue;font-size:22px;letter-spacing:2px;color:var(--text-muted)">NENHUMA MÚSICA AINDA</div>
    <div style="font-size:13px;color:var(--text-muted);margin-top:8px;line-height:1.6">Os teus projetos aparecerão aqui assim que o teu produtor os criar no sistema.</div>
  </div>`;

  return `
  <div style="font-family:Bebas Neue;font-size:24px;letter-spacing:2px;margin-bottom:4px;color:var(--gold-bright)">🎵 AS MINHAS MÚSICAS</div>
  <div style="font-size:13px;color:var(--text-muted);margin-bottom:22px">
    ${feitos.length} finalizada${feitos.length!==1?'s':''} · ${emCurso.length} em produção
  </div>

  <!-- FINALIZADAS -->
  ${feitos.length > 0 ? `
  <div style="margin-bottom:28px">
    <div style="font-size:10px;letter-spacing:3px;color:var(--green);font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:6px">
      ${icon('check',13)} MÚSICAS CONCLUÍDAS
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      ${feitos.map(p => {
        const links   = p.downloadLinks || [];
        const temLink = links.length > 0;
        return `
        <div style="background:var(--bg-card);border:1px solid ${temLink?'rgba(16,185,129,.35)':'var(--border)'};border-radius:16px;overflow:hidden">

          <!-- CABEÇALHO DO PROJETO -->
          <div style="padding:16px 18px;background:${temLink?'rgba(16,185,129,.04)':'rgba(201,155,60,.03)'}">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap">
              <div>
                <div style="font-family:Bebas Neue;font-size:21px;letter-spacing:1px">${escH(p.name)}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
                  ${escH(p.type||'')}
                  ${p.startDate ? ' · Início: '+p.startDate : ''}
                  ${p.deadline  ? ' · Prazo: '+p.deadline   : ''}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
                <span class="badge badge-green">✅ Concluído</span>
                ${temLink
                  ? `<span style="font-size:10px;background:rgba(16,185,129,.15);color:var(--green);padding:3px 10px;border-radius:20px;font-weight:700;letter-spacing:1px">⬇ DOWNLOAD DISPONÍVEL</span>`
                  : `<span style="font-size:10px;background:rgba(201,155,60,.1);color:var(--gold);padding:3px 10px;border-radius:20px;font-weight:700;letter-spacing:1px">⏳ LINK EM BREVE</span>`
                }
              </div>
            </div>
            ${p.notes ? `<div style="font-size:12px;color:var(--text-secondary);margin-top:10px;padding-top:10px;border-top:1px solid var(--border);line-height:1.7;text-align:justify">${escH(p.notes)}</div>` : ''}
          </div>

          <!-- SECÇÃO DE DOWNLOAD -->
          ${temLink ? `
          <div style="border-top:1px solid rgba(16,185,129,.2);padding:14px 18px">
            <div style="font-size:10px;letter-spacing:2px;color:var(--green);font-weight:700;margin-bottom:12px">FICHEIROS DISPONÍVEIS PARA DOWNLOAD</div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${links.map(lk=>`
              <div style="display:flex;align-items:center;gap:12px;background:var(--bg-deep);border-radius:10px;padding:11px 14px;border:1px solid var(--border)">
                <div style="width:38px;height:38px;border-radius:10px;background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.2);display:flex;align-items:center;justify-content:center;color:var(--green);flex-shrink:0">
                  ${icon('music',18)}
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font-weight:700;font-size:14px;margin-bottom:2px">${escH(lk.label||'Download')}</div>
                  <div style="font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                    ${lk.url.startsWith('data:') ? '📁 Ficheiro no servidor' : '🔗 '+escH(lk.url)}
                  </div>
                </div>
                <a href="${escH(lk.url)}"
                   download="${escH(lk.filename||lk.label||p.name)}"
                   target="_blank"
                   style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:10px;background:var(--green);color:var(--bg-deep);font-family:Rajdhani;font-size:14px;font-weight:700;text-decoration:none;flex-shrink:0;white-space:nowrap">
                  ${icon('download',15)} Baixar
                </a>
              </div>`).join('')}
            </div>
          </div>` : `
          <!-- SEM LINK — botão bloqueado -->
          <div style="border-top:1px solid var(--border);padding:14px 18px">
            <div style="display:flex;align-items:center;gap:12px;background:var(--bg-deep);border-radius:10px;padding:12px 16px;border:1px dashed var(--border)">
              <div style="width:38px;height:38px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--text-muted);flex-shrink:0">
                ${icon('lock',18)}
              </div>
              <div style="flex:1">
                <div style="font-weight:700;font-size:13px;color:var(--text-secondary)">Download ainda não disponível</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px;line-height:1.5">
                  A tua música está concluída mas o link ainda não foi adicionado pelo produtor. Será libertado em breve!
                </div>
              </div>
              <div style="flex-shrink:0;opacity:.4;pointer-events:none">
                <div style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:10px;background:var(--border);color:var(--text-muted);font-family:Rajdhani;font-size:13px;font-weight:700">
                  ${icon('lock',14)} Bloqueado
                </div>
              </div>
            </div>
          </div>`}
        </div>`;
      }).join('')}
    </div>
  </div>` : ''}

  <!-- EM PRODUÇÃO -->
  ${emCurso.length > 0 ? `
  <div>
    <div style="font-size:10px;letter-spacing:3px;color:var(--neon);font-weight:700;margin-bottom:12px">🎚️ EM PRODUÇÃO</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${emCurso.map(p=>{
        const pct = completionPct[p.status]||0;
        const col = completionColor(pct);
        const si  = statuses.indexOf(p.status);
        const isLate = p.deadline && new Date(p.deadline)<new Date();
        return `
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:16px 18px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px">
            <div>
              <div style="font-weight:700;font-size:16px">${escH(p.name)}</div>
              <div style="font-size:11px;color:var(--text-muted)">${escH(p.type||'')}${p.deadline?' · Prazo: '+p.deadline:''}</div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <span class="badge badge-${statusColor(p.status)}">${p.status}</span>
              ${isLate?'<span class="badge badge-red">⚠ Atrasado</span>':''}
            </div>
          </div>

          <!-- PIPELINE -->
          <div style="display:flex;align-items:center;margin-bottom:10px">
            ${pipeline.map((step,i)=>{
              const done=i<si, cur=i===si;
              return `<div style="display:flex;align-items:center;flex:${i<pipeline.length-1?'1':'none'}">
                <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
                  <div style="width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;
                    background:${done?'var(--green)':cur?col:'var(--bg-hover)'};
                    border:2px solid ${cur?col:done?'var(--green)':'var(--border)'};
                    box-shadow:${cur?'0 0 10px '+col+'55':'none'};flex-shrink:0">
                    ${done?'✓':step.icon}
                  </div>
                  <div style="font-size:8px;color:${cur?col:done?'var(--green)':'var(--text-muted)'};white-space:nowrap;letter-spacing:.3px">${step.label}</div>
                </div>
                ${i<pipeline.length-1?`<div style="flex:1;height:2px;background:${done?'var(--green)':'var(--border)'};margin:0 2px;margin-bottom:18px"></div>`:''}
              </div>`;
            }).join('')}
          </div>

          <div class="progress" style="height:8px;border-radius:4px">
            <div class="progress-bar" style="width:${pct}%;background:linear-gradient(90deg,${col}99,${col});border-radius:4px"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:5px">
            <span style="font-size:11px;color:var(--text-muted)">${pct<100?`Faltam ${100-pct}% para concluir`:'✅ Concluído!'}</span>
            <span style="font-family:Space Mono;font-size:12px;color:${col};font-weight:700">${pct}%</span>
          </div>

          <!-- AVISO: download só depois de concluir -->
          <div style="margin-top:10px;padding:8px 12px;background:rgba(201,155,60,.05);border:1px solid rgba(201,155,60,.15);border-radius:8px;font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:6px">
            ${icon('lock',12)} O download só fica disponível quando o projeto estiver concluído
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>` : ''}`;
}

// ══════════════════════════════════════════════════════════
// NOVIDADES
// ══════════════════════════════════════════════════════════
function buildPortalNovidades() {
  const a    = portalArtist;
  const lista = (appData.novidades||[])
    .filter(n => n.publica || n.artistaId == a.id)
    .sort((a,b) => b.id - a.id);

  if (lista.length === 0) return `
  <div style="text-align:center;padding:60px 20px">
    <div style="font-size:52px;margin-bottom:16px">📢</div>
    <div style="font-family:Bebas Neue;font-size:22px;letter-spacing:2px;color:var(--text-muted)">SEM NOVIDADES</div>
    <div style="font-size:13px;color:var(--text-muted);margin-top:8px">O estúdio ainda não publicou comunicados.</div>
  </div>`;

  return `
  <div style="font-family:Bebas Neue;font-size:24px;letter-spacing:2px;margin-bottom:4px;color:var(--gold-bright)">📢 NOVIDADES DO ESTÚDIO</div>
  <div style="font-size:13px;color:var(--text-muted);margin-bottom:22px">${lista.length} publicação${lista.length!==1?'ões':''}</div>
  <div style="display:flex;flex-direction:column;gap:16px">
    ${lista.map(n=>{
      const pessoal = !n.publica && n.artistaId == a.id;
      return `
      <div style="background:var(--bg-card);border:1px solid ${pessoal?'rgba(0,212,255,.3)':'var(--border)'};border-radius:16px;overflow:hidden">
        ${pessoal?`<div style="background:rgba(0,212,255,.12);padding:5px 16px;font-size:10px;color:var(--neon);font-weight:700;letter-spacing:2px;border-bottom:1px solid rgba(0,212,255,.2)">✦ MENSAGEM PARA TI</div>`:''}
        ${n.imagem?`<img src="${escH(n.imagem)}" style="width:100%;max-height:260px;object-fit:cover;display:block" onerror="this.style.display='none'">`:''}
        <div style="padding:18px 20px">
          <div style="display:flex;gap:14px;align-items:flex-start">
            ${n.emoji?`<div style="font-size:28px;flex-shrink:0;line-height:1;margin-top:3px">${n.emoji}</div>`:''}
            <div style="flex:1;min-width:0">
              ${n.tag?`<div style="font-size:10px;letter-spacing:2px;color:var(--gold);font-weight:700;margin-bottom:7px;background:rgba(201,155,60,.1);display:inline-block;padding:2px 10px;border-radius:20px">${escH(n.tag)}</div>`:''}
              <div style="font-weight:700;font-size:17px;margin-bottom:10px;line-height:1.3">${escH(n.titulo)}</div>
              <div style="font-size:13px;color:var(--text-secondary);line-height:1.85;text-align:justify">${escH(n.corpo)}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:12px">
                📅 ${new Date(n.id).toLocaleDateString('pt-AO',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}
              </div>
            </div>
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// ══════════════════════════════════════════════════════════
// AGENDA
// ══════════════════════════════════════════════════════════
function buildPortalAgenda() {
  const todas   = getPortalSessions();
  const now     = new Date();
  const futuras = todas.filter(s=>new Date(s.date+'T'+(s.time||'00:00'))>=now)
                       .sort((a,b)=>new Date(a.date+a.time)-new Date(b.date+b.time));
  const passadas= todas.filter(s=>new Date(s.date+'T'+(s.time||'00:00'))<now)
                       .sort((a,b)=>new Date(b.date)-new Date(a.date));

  const cardSessao = (s, passada=false) => {
    const proj = appData.projects.find(p=>p.id==s.projectId);
    const d    = new Date(s.date);
    return `
    <div style="background:var(--bg-card);border:1px solid ${passada?'var(--border)':'rgba(0,212,255,.2)'};border-radius:13px;padding:14px 16px;display:flex;gap:14px;align-items:flex-start;${passada?'opacity:.65':''}">
      <div style="flex-shrink:0;width:48px;text-align:center;background:${passada?'var(--bg-deep)':'rgba(0,212,255,.07)'};border:1px solid ${passada?'var(--border)':'rgba(0,212,255,.2)'};border-radius:10px;padding:8px 4px">
        <div style="font-family:Space Mono;font-size:20px;font-weight:700;color:${passada?'var(--text-muted)':'var(--neon)'};line-height:1">${d.getDate()}</div>
        <div style="font-size:10px;color:var(--text-muted);letter-spacing:1px;margin-top:2px">${monthsShort[d.getMonth()]}</div>
        <div style="font-size:10px;color:var(--text-muted)">${d.getFullYear()}</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:15px;margin-bottom:4px">${escH(s.title||'Sessão de Estúdio')}</div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">🕐 ${s.time||'--:--'} ${s.studio?' · 📍 '+escH(s.studio):''}</div>
        ${proj?`<div style="font-size:11px;color:var(--gold);margin-bottom:4px">🎵 ${escH(proj.name)}</div>`:''}
        ${s.notes?`<div style="font-size:12px;color:var(--text-muted);margin-top:5px;background:var(--bg-deep);padding:7px 10px;border-radius:7px;line-height:1.5">${escH(s.notes)}</div>`:''}
      </div>
      <span class="badge badge-${statusColor(s.status||'Confirmado')}" style="flex-shrink:0">${s.status||'Confirmado'}</span>
    </div>`;
  };

  return `
  <div style="font-family:Bebas Neue;font-size:24px;letter-spacing:2px;margin-bottom:4px;color:var(--gold-bright)">📅 A MINHA AGENDA</div>
  <div style="font-size:13px;color:var(--text-muted);margin-bottom:22px">${futuras.length} sessão${futuras.length!==1?'ões':''} agendada${futuras.length!==1?'s':''}</div>

  ${futuras.length > 0 ? `
  <div style="font-size:10px;letter-spacing:3px;color:var(--neon);font-weight:700;margin-bottom:12px">PRÓXIMAS SESSÕES</div>
  <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:28px">
    ${futuras.map(s=>cardSessao(s,false)).join('')}
  </div>` : `
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:28px;text-align:center;margin-bottom:24px">
    <div style="font-size:36px;margin-bottom:10px">📅</div>
    <div style="font-size:14px;color:var(--text-muted)">Nenhuma sessão agendada. O teu produtor vai marcar em breve.</div>
  </div>`}

  ${passadas.length > 0 ? `
  <div style="font-size:10px;letter-spacing:3px;color:var(--text-muted);font-weight:700;margin-bottom:12px">SESSÕES ANTERIORES</div>
  <div style="display:flex;flex-direction:column;gap:8px">
    ${passadas.slice(0,5).map(s=>cardSessao(s,true)).join('')}
  </div>` : ''}`;
}

// ── HELPERS ──────────────────────────────────────────────
function portalLogout() {
  portalArtist         = null;
  portalPage           = 'musicas';
  portalCodigoPreenchido = '';
  renderPortal();
}
