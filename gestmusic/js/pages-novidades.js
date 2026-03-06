// ============================================================
// NOVIDADES — Gestão de comunicados com imagem e texto justificado
// ============================================================
let novidadeModal = null;
let novidadeForm  = {};

// ── PÁGINA ADMIN ─────────────────────────────────────────
function buildNovidades() {
  const lista    = (appData.novidades||[]).sort((a,b)=>b.id-a.id);
  const publicas = lista.filter(n=>n.publica).length;
  const privadas = lista.filter(n=>!n.publica).length;

  return `
  <div class="section-header">
    <div>
      <div class="page-title">Novidades & Comunicados</div>
      <div class="page-sub">${lista.length} posts · ${publicas} públicos · ${privadas} privados</div>
    </div>
    <button class="btn btn-gold" onclick="openNovidadeModal('new')">${icon('plus',15)} Nova Publicação</button>
  </div>

  <div style="background:rgba(201,155,60,.06);border:1px solid var(--border);border-radius:10px;padding:12px 16px;margin-bottom:20px;display:flex;gap:10px;align-items:flex-start">
    <span style="color:var(--gold);flex-shrink:0;margin-top:1px">${icon('alert',16)}</span>
    <div style="font-size:13px;color:var(--text-secondary);line-height:1.5">
      Posts <strong style="color:var(--gold)">Públicos</strong> aparecem para todos os artistas (incluindo no ecrã de login).
      Posts <strong style="color:var(--neon)">Para Artista</strong> são visíveis apenas pelo artista selecionado.
    </div>
  </div>

  ${lista.length === 0 ? `
  <div style="text-align:center;padding:60px 20px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px">
    <div style="font-size:40px;margin-bottom:12px">📢</div>
    <div style="font-family:Bebas Neue;font-size:20px;letter-spacing:2px;color:var(--text-muted)">SEM PUBLICAÇÕES</div>
    <div style="font-size:13px;color:var(--text-muted);margin-top:6px">Cria o primeiro comunicado para os teus artistas.</div>
  </div>` : `
  <div style="display:flex;flex-direction:column;gap:12px">
    ${lista.map(n => {
      const artista = n.artistaId ? appData.artists.find(a=>a.id==n.artistaId) : null;
      return `
      <div style="background:var(--bg-card);border:1px solid ${n.publica?'rgba(201,155,60,.25)':'rgba(0,212,255,.2)'};border-radius:14px;overflow:hidden">
        ${n.imagem ? `<img src="${escH(n.imagem)}" style="width:100%;max-height:200px;object-fit:cover;display:block">` : ''}
        <div style="padding:16px 18px">
          <div style="display:flex;align-items:flex-start;gap:12px">
            ${n.emoji ? `<span style="font-size:26px;flex-shrink:0;line-height:1;margin-top:3px">${n.emoji}</span>` : ''}
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">
                ${n.tag?`<span style="font-size:10px;letter-spacing:2px;color:var(--gold);font-weight:700">${escH(n.tag)}</span>`:''}
                <span style="font-size:10px;padding:2px 8px;border-radius:20px;${n.publica?'background:rgba(201,155,60,.1);color:var(--gold)':'background:rgba(0,212,255,.1);color:var(--neon)'}">
                  ${n.publica ? '🌍 Público' : `👤 Para: ${escH(artista?.artisticName||'Artista')}`}
                </span>
                <span style="font-size:11px;color:var(--text-muted)">${new Date(n.id).toLocaleDateString('pt-AO')}</span>
              </div>
              <div style="font-weight:700;font-size:16px;margin-bottom:6px">${escH(n.titulo)}</div>
              <div style="font-size:13px;color:var(--text-secondary);line-height:1.7;text-align:justify">${escH(n.corpo)}</div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="openNovidadeModal('edit',${n.id})">${icon('edit',14)}</button>
              <button class="btn btn-danger btn-icon btn-sm" onclick="deleteNovidade(${n.id})">${icon('trash',14)}</button>
            </div>
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>`}

  ${novidadeModal ? buildNovidadeModal() : ''}`;
}

// ── MODAL DE CRIAÇÃO/EDIÇÃO ───────────────────────────────
function buildNovidadeModal() {
  const isNew  = novidadeModal === 'new';
  const emojis = ['📢','🎵','🎙️','💿','🎚️','🏆','📅','💰','🔥','✨','🎶','📝','🎉','⚡','🎤'];

  return `
  <div class="modal-overlay">
    <div class="modal" style="max-width:600px">
      <div class="modal-header">
        <div class="modal-title">${isNew?'Nova Publicação':'Editar Publicação'}</div>
        <button class="btn btn-ghost btn-icon" onclick="novidadeModal=null;rerenderPage()">${icon('close',16)}</button>
      </div>
      <div class="modal-body" style="max-height:75vh;overflow-y:auto">

        <!-- EMOJI -->
        <div class="form-group">
          <label class="form-label">Emoji (opcional)</label>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">
            ${emojis.map(e=>`
            <button type="button"
              onclick="novidadeForm.emoji=${JSON.stringify(e)};document.getElementById('nf-emoji').value=${JSON.stringify(e)};this.closest('.form-group').querySelectorAll('button[type=button]').forEach(b=>b.style.background='');this.style.background='rgba(201,155,60,.25)'"
              style="width:36px;height:36px;border-radius:8px;border:1px solid var(--border);background:${novidadeForm.emoji===e?'rgba(201,155,60,.25)':'transparent'};cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .15s">
              ${e}
            </button>`).join('')}
          </div>
          <input class="form-input" id="nf-emoji" value="${escH(novidadeForm.emoji||'')}" placeholder="Ou escreve qualquer emoji" oninput="novidadeForm.emoji=this.value">
        </div>

        <!-- IMAGEM -->
        <div class="form-group">
          <label class="form-label">Imagem (opcional)</label>
          <!-- Preview -->
          <div id="nf-img-preview" style="margin-bottom:10px;${novidadeForm.imagem?'':'display:none'}">
            <div style="position:relative;display:inline-block;width:100%">
              <img id="nf-img-el" src="${escH(novidadeForm.imagem||'')}" style="width:100%;max-height:200px;object-fit:cover;border-radius:10px;display:block;border:1px solid var(--border)">
              <button type="button" onclick="removerImagemNovidade()"
                style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,.7);border:none;border-radius:6px;width:28px;height:28px;cursor:pointer;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center">✕</button>
            </div>
          </div>
          <!-- Tabs URL / Upload -->
          <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:10px">
            <button type="button" id="nf-tab-url" onclick="switchImgTab('url')"
              style="flex:1;padding:9px;font-family:Rajdhani;font-size:13px;font-weight:700;border:none;cursor:pointer;background:rgba(201,155,60,.15);color:var(--gold);transition:all .2s">
              🔗 Link URL
            </button>
            <button type="button" id="nf-tab-upload" onclick="switchImgTab('upload')"
              style="flex:1;padding:9px;font-family:Rajdhani;font-size:13px;font-weight:700;border:none;cursor:pointer;background:transparent;color:var(--text-muted);transition:all .2s">
              📁 Upload
            </button>
          </div>
          <div id="nf-panel-url">
            <input class="form-input" id="nf-img-url"
              value="${novidadeForm.imagem&&!novidadeForm.imagem.startsWith('data:')?escH(novidadeForm.imagem):''}"
              placeholder="https://exemplo.com/imagem.jpg"
              oninput="previewUrlImagem(this.value)">
            <div style="font-size:11px;color:var(--text-muted);margin-top:5px">Cole o link directo de uma imagem da internet.</div>
          </div>
          <div id="nf-panel-upload" style="display:none">
            <div id="nf-drop-zone"
              ondragover="event.preventDefault();this.style.borderColor='var(--gold)'"
              ondragleave="this.style.borderColor='var(--border)'"
              ondrop="handleImgDrop(event)"
              style="border:2px dashed var(--border);border-radius:10px;padding:24px;text-align:center;cursor:pointer;transition:all .2s"
              onclick="document.getElementById('nf-file-input').click()">
              <div style="font-size:28px;margin-bottom:8px">🖼️</div>
              <div style="font-size:13px;color:var(--text-secondary)">Clica ou arrasta uma imagem aqui</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:4px">JPG, PNG, GIF, WebP · máx. 3MB</div>
            </div>
            <input type="file" id="nf-file-input" accept="image/*" style="display:none" onchange="handleImgFileSelect(event)">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group"><label class="form-label">Tag / Categoria</label>
            <select class="form-select" id="nf-tag">
              <option value="">Sem tag</option>
              ${['NOVIDADE','PROMOÇÃO','AVISO','EVENTO','LANÇAMENTO','AGENDA','FINANCEIRO'].map(t=>`<option ${novidadeForm.tag===t?'selected':''}>${t}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Visibilidade</label>
            <select class="form-select" id="nf-publica" onchange="toggleArtistSelect(this.value)">
              <option value="1" ${novidadeForm.publica!==false?'selected':''}>🌍 Público (todos)</option>
              <option value="0" ${novidadeForm.publica===false?'selected':''}>👤 Artista específico</option>
            </select>
          </div>
        </div>

        <div id="nf-artista-wrap" style="display:${novidadeForm.publica===false?'block':'none'}">
          <div class="form-group"><label class="form-label">Artista</label>
            <select class="form-select" id="nf-artista">
              ${appData.artists.map(a=>`<option value="${a.id}" ${novidadeForm.artistaId==a.id?'selected':''}>${escH(a.artisticName)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group"><label class="form-label">Título *</label>
          <input class="form-input" id="nf-titulo" value="${escH(novidadeForm.titulo||'')}" placeholder="Ex: Estúdio disponível este fim de semana!">
        </div>
        <div class="form-group"><label class="form-label">Mensagem *</label>
          <textarea class="form-textarea" id="nf-corpo" rows="5"
            style="text-align:justify;line-height:1.7"
            placeholder="Escreve a mensagem completa aqui...">${escH(novidadeForm.corpo||'')}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="novidadeModal=null;rerenderPage()">Cancelar</button>
        <button class="btn btn-gold" onclick="saveNovidade('${novidadeModal}')">${icon('check',15)} Publicar</button>
      </div>
    </div>
  </div>`;
}

// ── IMAGEM — HELPERS ──────────────────────────────────────
function switchImgTab(tab) {
  const urlPanel    = document.getElementById('nf-panel-url');
  const upPanel     = document.getElementById('nf-panel-upload');
  const btnUrl      = document.getElementById('nf-tab-url');
  const btnUpload   = document.getElementById('nf-tab-upload');
  if (!urlPanel) return;
  if (tab === 'url') {
    urlPanel.style.display = 'block';
    upPanel.style.display  = 'none';
    btnUrl.style.background    = 'rgba(201,155,60,.15)';
    btnUrl.style.color         = 'var(--gold)';
    btnUpload.style.background = 'transparent';
    btnUpload.style.color      = 'var(--text-muted)';
  } else {
    urlPanel.style.display = 'none';
    upPanel.style.display  = 'block';
    btnUrl.style.background    = 'transparent';
    btnUrl.style.color         = 'var(--text-muted)';
    btnUpload.style.background = 'rgba(201,155,60,.15)';
    btnUpload.style.color      = 'var(--gold)';
  }
}

function previewUrlImagem(url) {
  if (!url || !url.startsWith('http')) {
    document.getElementById('nf-img-preview').style.display = 'none';
    novidadeForm.imagem = '';
    return;
  }
  novidadeForm.imagem = url;
  const el = document.getElementById('nf-img-el');
  const pr = document.getElementById('nf-img-preview');
  if (el && pr) { el.src = url; pr.style.display = 'block'; }
}

function handleImgDrop(e) {
  e.preventDefault();
  document.getElementById('nf-drop-zone').style.borderColor = 'var(--border)';
  const file = e.dataTransfer.files[0];
  if (file) _processarImagem(file);
}

function handleImgFileSelect(e) {
  const file = e.target.files[0];
  if (file) _processarImagem(file);
}

function _processarImagem(file) {
  if (!file.type.startsWith('image/')) { notify('Ficheiro deve ser uma imagem','error'); return; }
  if (file.size > 3 * 1024 * 1024)    { notify('Imagem muito grande (máx. 3MB)','error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    novidadeForm.imagem = e.target.result;
    const el = document.getElementById('nf-img-el');
    const pr = document.getElementById('nf-img-preview');
    if (el && pr) { el.src = e.target.result; pr.style.display = 'block'; }
    notify('Imagem carregada!');
  };
  reader.readAsDataURL(file);
}

function removerImagemNovidade() {
  novidadeForm.imagem = '';
  const pr = document.getElementById('nf-img-preview');
  const urlInput = document.getElementById('nf-img-url');
  if (pr) pr.style.display = 'none';
  if (urlInput) urlInput.value = '';
}

// ── CRUD ──────────────────────────────────────────────────
function toggleArtistSelect(val) {
  document.getElementById('nf-artista-wrap').style.display = val==='0' ? 'block' : 'none';
}

function openNovidadeModal(type, id=null) {
  novidadeModal = type;
  if (type==='edit' && id) {
    novidadeForm = {...(appData.novidades||[]).find(n=>n.id===id)};
  } else {
    novidadeForm = {titulo:'',corpo:'',tag:'',emoji:'📢',publica:true,artistaId:null,imagem:''};
  }
  rerenderPage();
}

function saveNovidade(type) {
  const titulo = document.getElementById('nf-titulo')?.value.trim();
  const corpo  = document.getElementById('nf-corpo')?.value.trim();
  if (!titulo) { notify('Título obrigatório','error'); return; }
  if (!corpo)  { notify('Mensagem obrigatória','error'); return; }
  const publica = document.getElementById('nf-publica')?.value !== '0';
  // Tenta buscar URL se o campo ainda não foi "previewado"
  const urlField = document.getElementById('nf-img-url')?.value.trim();
  const imagem = novidadeForm.imagem || (urlField && urlField.startsWith('http') ? urlField : '');
  const obj = {
    titulo, corpo, imagem,
    tag:       document.getElementById('nf-tag')?.value||'',
    emoji:     document.getElementById('nf-emoji')?.value||'',
    publica,
    artistaId: publica ? null : Number(document.getElementById('nf-artista')?.value)||null,
  };
  if (!appData.novidades) appData.novidades = [];
  if (type==='new') {
    appData.novidades.push({...obj, id:Date.now()});
  } else {
    const i = appData.novidades.findIndex(n=>n.id===novidadeForm.id);
    if (i>=0) appData.novidades[i] = {...appData.novidades[i], ...obj};
  }
  persist('novidades');
  novidadeModal = null;
  notify(type==='new'?'Publicação criada!':'Publicação atualizada!');
  rerenderPage();
}

function deleteNovidade(id) {
  if (!confirm('Remover esta publicação?')) return;
  appData.novidades = (appData.novidades||[]).filter(n=>n.id!==id);
  persist('novidades');
  notify('Publicação removida!');
  rerenderPage();
}
