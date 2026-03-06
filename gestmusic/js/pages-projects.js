// ============================================================
// PROJECTS — com link de download ao concluir
// ============================================================
let projSearch='', projFilter='Todos', projModal=null, projForm={}, viewProjId=null;
let linkModal=null;

// ── TABLE ─────────────────────────────────────────────────
function buildProjects() {
  const filtered = appData.projects.filter(p =>
    (projFilter==='Todos' || p.status===projFilter) &&
    p.name.toLowerCase().includes(projSearch.toLowerCase())
  );
  const totalFin  = appData.projects.filter(p=>p.status==='Finalizado').length;
  const withLinks = appData.projects.filter(p=>p.downloadLinks&&p.downloadLinks.length>0).length;

  return `
  <div class="section-header">
    <div>
      <div class="page-title">Projetos</div>
      <div class="page-sub">${appData.projects.length} projetos · ${totalFin} finalizados · ${withLinks} com download</div>
    </div>
    <button class="btn btn-gold" onclick="openProjModal('new')">${icon('plus',15)} Novo Projeto</button>
  </div>

  <div class="filter-row">
    <div class="search-bar">${icon('search',15)}<input placeholder="Buscar projeto..." value="${escH(projSearch)}" oninput="projSearch=this.value;rerenderPage()"></div>
    ${['Todos',...statuses].map(f=>`<button class="btn ${projFilter===f?'btn-gold':'btn-ghost'} btn-sm" onclick="projFilter=${JSON.stringify(f)};rerenderPage()">${f}</button>`).join('')}
  </div>

  <div class="card">
    <div class="table-wrap"><table>
      <thead><tr><th>PROJETO</th><th>ARTISTA</th><th>TIPO</th><th>STATUS</th><th>CONCLUSÃO</th><th>PRAZO</th><th>VALOR</th><th>DOWNLOAD</th><th>AÇÕES</th></tr></thead>
      <tbody>
        ${filtered.map(p => {
          const a      = appData.artists.find(x=>x.id===p.artistId);
          const isLate = p.deadline && new Date(p.deadline)<new Date() && p.status!=='Finalizado';
          const pct    = completionPct[p.status]||0;
          const col    = completionColor(pct);
          const links  = p.downloadLinks||[];
          const isDone = p.status==='Finalizado';

          const downloadCell = isDone
            ? links.length>0
              ? `<div style="display:flex;flex-direction:column;gap:4px">
                  ${links.map(lk=>`
                  <a href="${escH(lk.url)}" download="${escH(lk.filename||lk.label||'musica')}" target="_blank"
                     style="display:inline-flex;align-items:center;gap:5px;color:var(--green);font-size:12px;text-decoration:none;font-weight:700;white-space:nowrap">
                    ${icon('download',13)} ${escH(lk.label||'Baixar')}
                  </a>`).join('')}
                  <button class="btn btn-ghost btn-sm" style="font-size:10px;padding:2px 8px;margin-top:2px" onclick="openLinkModal(${p.id})">${icon('plus',11)} Gerir</button>
                </div>`
              : `<button class="btn btn-outline btn-sm" onclick="openLinkModal(${p.id})">
                  ${icon('plus',13)} Adicionar Link
                </button>`
            : `<span style="font-size:12px;color:var(--text-muted)">—</span>`;

          return `<tr>
            <td style="font-weight:700">${escH(p.name)}</td>
            <td>${escH(a?.artisticName||'-')}</td>
            <td><span class="badge badge-gray">${p.type}</span></td>
            <td>
              <select onchange="changeProjStatus(${p.id},this.value)" style="background:transparent;border:none;color:inherit;cursor:pointer;font-family:Rajdhani;font-size:13px">
                ${statuses.map(s=>`<option ${p.status===s?'selected':''} style="background:var(--bg-card)">${s}</option>`).join('')}
              </select>
            </td>
            <td style="min-width:130px">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="flex:1"><div class="progress" style="height:6px"><div class="progress-bar" style="width:${pct}%;background:${col}"></div></div></div>
                <span style="font-family:Space Mono;font-size:11px;color:${col};min-width:32px;text-align:right">${pct}%</span>
              </div>
            </td>
            <td style="color:${isLate?'var(--red)':'inherit'};font-family:Space Mono;font-size:12px">${p.deadline||'-'}${isLate?' ⚠':''}</td>
            <td style="font-family:Space Mono;font-size:13px">${fmt(p.value)}</td>
            <td>${downloadCell}</td>
            <td><div style="display:flex;gap:6px">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="viewProjId=${p.id};rerenderPage()">${icon('eye',14)}</button>
              <button class="btn btn-ghost btn-icon btn-sm" onclick="openProjModal('edit',${p.id})">${icon('edit',14)}</button>
              <button class="btn btn-danger btn-icon btn-sm" onclick="deleteProj(${p.id})">${icon('trash',14)}</button>
            </div></td>
          </tr>`;
        }).join('')}
        ${filtered.length===0?`<tr><td colspan="9"><div class="empty-state"><div class="empty-text">Nenhum projeto encontrado</div></div></td></tr>`:''}
      </tbody>
    </table></div>
  </div>
  ${projModal  ? buildProjModal()  : ''}
  ${viewProjId ? buildViewProj()   : ''}
  ${linkModal  ? buildLinkModal()  : ''}`;
}

// ── CREATE / EDIT MODAL ────────────────────────────────────
function buildProjModal() {
  const isNew = projModal === 'new';
  return `
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">${isNew?'Novo Projeto':'Editar Projeto'}</div>
        <button class="btn btn-ghost btn-icon" onclick="projModal=null;rerenderPage()">${icon('close',16)}</button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Nome da Música *</label>
          <input class="form-input" id="pf-name" value="${escH(projForm.name||'')}" placeholder="Ex: Meu Novo Single">
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Artista</label>
            <select class="form-select" id="pf-artist">
              ${appData.artists.map(a=>`<option value="${a.id}" ${projForm.artistId==a.id?'selected':''}>${escH(a.artisticName)}</option>`).join('')}
              ${appData.artists.length===0?'<option value="">Nenhum artista cadastrado</option>':''}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Tipo</label>
            <select class="form-select" id="pf-type">
              ${['Single','EP','Álbum','Instrumental'].map(t=>`<option ${projForm.type===t?'selected':''}>${t}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Status</label>
            <select class="form-select" id="pf-status">
              ${statuses.map(s=>`<option ${projForm.status===s?'selected':''}>${s}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Valor (Kz)</label>
            <input class="form-input" type="number" id="pf-value" value="${projForm.value||''}" placeholder="0">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Data de Início</label>
            <input class="form-input" type="date" id="pf-start" value="${projForm.startDate||''}">
          </div>
          <div class="form-group"><label class="form-label">Prazo de Entrega</label>
            <input class="form-input" type="date" id="pf-deadline" value="${projForm.deadline||''}">
          </div>
        </div>
        <div class="form-group"><label class="form-label">Observações</label>
          <textarea class="form-textarea" id="pf-notes">${escH(projForm.notes||'')}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="projModal=null;rerenderPage()">Cancelar</button>
        <button class="btn btn-gold" onclick="saveProj('${projModal}')">Salvar</button>
      </div>
    </div>
  </div>`;
}

// ── LINK MODAL ─────────────────────────────────────────────
function buildLinkModal() {
  const p     = appData.projects.find(x=>x.id===linkModal.projId);
  const links = p?.downloadLinks||[];
  return `
  <div class="modal-overlay" style="z-index:300">
    <div class="modal" style="max-width:520px">
      <div class="modal-header">
        <div>
          <div class="modal-title">Links de Download</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${escH(p?.name||'')}</div>
        </div>
        <button class="btn btn-ghost btn-icon" onclick="linkModal=null;rerenderPage()">${icon('close',16)}</button>
      </div>
      <div class="modal-body" style="max-height:78vh;overflow-y:auto">

        <!-- BANNER SE RECÉM FINALIZADO -->
        ${links.length===0 ? `
        <div style="background:linear-gradient(135deg,rgba(16,185,129,.1),rgba(201,155,60,.08));border:1px solid rgba(16,185,129,.3);border-radius:12px;padding:16px 18px;margin-bottom:20px;display:flex;gap:12px;align-items:flex-start">
          <span style="font-size:28px;flex-shrink:0">🎉</span>
          <div>
            <div style="font-weight:700;font-size:15px;color:var(--green);margin-bottom:4px">Projecto Finalizado!</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.6">
              Agora adiciona o link do post do teu <strong style="color:var(--gold)">Blogger</strong> onde publicaste a música. O artista verá o link no portal para fazer o download.
            </div>
          </div>
        </div>` : ''}

        <!-- LINKS JÁ CADASTRADOS -->
        ${links.length>0 ? `
        <div style="margin-bottom:20px">
          <div style="font-size:11px;letter-spacing:2px;color:var(--text-muted);margin-bottom:10px">LINKS CADASTRADOS (${links.length})</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${links.map((lk,li)=>`
            <div style="display:flex;align-items:center;gap:10px;background:var(--bg-deep);border:1px solid var(--border);border-radius:10px;padding:10px 14px">
              <div style="width:36px;height:36px;border-radius:9px;background:rgba(16,185,129,.1);display:flex;align-items:center;justify-content:center;color:var(--green);flex-shrink:0">
                ${lk.url.includes('blogger')||lk.url.includes('blogspot')?'<span style="font-size:18px">📝</span>':icon('download',16)}
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-weight:700;font-size:13px">${escH(lk.label||'Download')}</div>
                <div style="font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                  ${lk.url.startsWith('data:')?'📁 Ficheiro local':'🔗 '+escH(lk.url)}
                </div>
              </div>
              <div style="display:flex;gap:6px;flex-shrink:0">
                <a href="${escH(lk.url)}" target="_blank" class="btn btn-outline btn-icon btn-sm" title="Abrir link">${icon('eye',13)}</a>
                <button class="btn btn-danger btn-icon btn-sm" onclick="removeDownloadLink(${p.id},${li})">${icon('trash',13)}</button>
              </div>
            </div>`).join('')}
          </div>
        </div>
        <div class="divider"></div>` : ''}

        <!-- ADICIONAR LINK -->
        <div style="font-size:11px;letter-spacing:2px;color:var(--text-muted);margin-bottom:14px;margin-top:${links.length>0?'16px':'0'}">
          ${links.length>0?'ADICIONAR OUTRO LINK':'COLA O LINK DO BLOGGER'}
        </div>

        <!-- BLOGGER em destaque + outras opções -->
        <div style="background:rgba(255,119,0,.06);border:1px solid rgba(255,119,0,.25);border-radius:12px;padding:16px 18px;margin-bottom:16px">
          <div style="display:flex;align-items:center;gap-8px;margin-bottom:10px">
            <span style="font-size:20px;margin-right:8px">📝</span>
            <span style="font-weight:700;font-size:14px;color:#ff7700">Link do Blogger</span>
            <span style="font-size:11px;color:var(--text-muted);margin-left:6px">(recomendado)</span>
          </div>
          <div class="form-group" style="margin-bottom:10px">
            <input class="form-input" id="lk-url"
              placeholder="https://seuestudio.blogspot.com/2025/01/nome-da-musica.html"
              style="border-color:rgba(255,119,0,.4)"
              oninput="detectarTipoLink(this.value)">
            <div id="lk-url-hint" style="font-size:11px;color:var(--text-muted);margin-top:5px;line-height:1.5">
              Cola o URL completo do post onde publicaste a música no teu blog do Blogger.
            </div>
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label class="form-label">Nome do link (o que o artista vê)</label>
            <input class="form-input" id="lk-label" placeholder="Ex: Baixar no Blogger · Download MP3 · Ouvir agora">
          </div>
          <button class="btn btn-gold" style="width:100%;height:44px;font-size:14px" onclick="addDownloadLinkUrl(${p.id})">
            ${icon('plus',15)} Adicionar Link
          </button>
        </div>

        <!-- OUTROS SERVIÇOS -->
        <details style="margin-bottom:8px">
          <summary style="font-size:12px;color:var(--text-muted);cursor:pointer;padding:8px 0;letter-spacing:1px;list-style:none">
            ▸ Outros serviços (Google Drive, WeTransfer, SoundCloud...)
          </summary>
          <div style="padding-top:12px;display:flex;flex-wrap:wrap;gap:8px">
            ${[
              ['🔗 Google Drive','https://drive.google.com/file/d/'],
              ['📦 WeTransfer','https://wetransfer.com/'],
              ['🎵 SoundCloud','https://soundcloud.com/'],
              ['▶️ YouTube','https://youtube.com/watch?v='],
              ['📦 Dropbox','https://dropbox.com/s/'],
              ['💿 Deezer','https://deezer.com/'],
            ].map(([n,u])=>`
            <button class="btn btn-ghost btn-sm" style="font-size:12px" onclick="document.getElementById('lk-url').value='${u}';document.getElementById('lk-url').focus();detectarTipoLink('${u}')">${n}</button>`).join('')}
          </div>
        </details>

        <!-- TAB UPLOAD (colapsível) -->
        <details>
          <summary style="font-size:12px;color:var(--text-muted);cursor:pointer;padding:8px 0;letter-spacing:1px;list-style:none">
            ▸ Upload directo de ficheiro (MP3, WAV, ZIP...)
          </summary>
          <div style="padding-top:12px">

        <!-- TAB UPLOAD -->
        <div id="link-tab-upload" style="display:none">
          <div style="border:2px dashed var(--border-bright);border-radius:10px;padding:28px;text-align:center;cursor:pointer;transition:border-color .2s"
               onclick="document.getElementById('lk-file').click()"
               ondragover="event.preventDefault();this.style.borderColor='var(--gold)'"
               ondragleave="this.style.borderColor='var(--border-bright)'"
               ondrop="handleLinkFileDrop(event,${p.id})">
            <div style="color:var(--gold);margin-bottom:8px">${icon('upload',32)}</div>
            <div style="font-size:14px;font-weight:700;margin-bottom:4px">Arraste ou clique para selecionar</div>
            <div style="font-size:12px;color:var(--text-muted)">MP3, WAV, FLAC, ZIP — máx. 50MB</div>
            <div id="upload-progress-wrap" style="display:none;margin-top:16px">
              <div class="progress" style="height:8px;margin-bottom:6px"><div id="upload-progress-bar" class="progress-bar" style="width:0%;background:var(--gold)"></div></div>
              <div id="upload-status" style="font-size:12px;color:var(--text-secondary)">A carregar...</div>
            </div>
          </div>
          <input type="file" id="lk-file" accept=".mp3,.wav,.flac,.zip,.pdf,.m4a,.aac" style="display:none" onchange="handleLinkFileSelect(event,${p.id})">
          <div id="upload-result" style="display:none;margin-top:12px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.3);border-radius:8px;padding:12px 14px">
            <div style="font-size:12px;color:var(--green);font-weight:700;margin-bottom:4px">✓ Ficheiro carregado com sucesso</div>
            <div id="upload-result-name" style="font-size:12px;color:var(--text-secondary)"></div>
          </div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:12px;background:rgba(201,155,60,.06);padding:10px 12px;border-radius:8px;border:1px solid var(--border);line-height:1.6">
              💡 <strong style="color:var(--gold)">Dica:</strong> Para partilhar via Blogger, publica o ficheiro no post e cola o link acima. O upload guarda localmente no browser.
            </div>
          </div>
        </details>

      </div>
    </div>
  </div>`;
}

// ── DETAIL VIEW MODAL ──────────────────────────────────────
function buildViewProj() {
  const p = appData.projects.find(x => x.id === viewProjId); if (!p) return '';
  const a      = appData.artists.find(x => x.id === p.artistId);
  const pct    = completionPct[p.status]||0;
  const col    = completionColor(pct);
  const si     = statuses.indexOf(p.status);
  const isLate = p.deadline && new Date(p.deadline)<new Date() && p.status!=='Finalizado';
  const isDone = p.status === 'Finalizado';
  const links  = p.downloadLinks||[];

  return `
  <div class="modal-overlay">
    <div class="modal" style="max-width:660px">
      <div class="modal-header">
        <div>
          <div class="modal-title">${escH(p.name)}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${escH(a?.artisticName||'—')} · ${p.type}</div>
        </div>
        <button class="btn btn-ghost btn-icon" onclick="viewProjId=null;rerenderPage()">${icon('close',16)}</button>
      </div>
      <div class="modal-body">

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">
          <span class="badge badge-${statusColor(p.status)}">${p.status}</span>
          <span class="badge badge-gray">${p.type}</span>
          ${isLate?'<span class="badge badge-red">⚠ Atrasado</span>':''}
          ${isDone&&links.length>0?`<span class="badge badge-green">${icon('download',11)} ${links.length} link${links.length>1?'s':''} disponíve${links.length>1?'is':'l'}</span>`:''}
        </div>

        <!-- PIPELINE -->
        <div style="background:var(--bg-deep);border-radius:12px;padding:16px 20px;margin-bottom:20px;border:1px solid var(--border)">
          <div style="font-size:11px;letter-spacing:2px;color:var(--text-muted);margin-bottom:14px">PROGRESSO DO PROJETO</div>
          <div style="display:flex;align-items:center;margin-bottom:12px">
            ${pipeline.map((step,i) => {
              const done=i<si, cur=i===si;
              return `<div style="display:flex;align-items:center;flex:${i<pipeline.length-1?'1':'none'}">
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
                  <div style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;
                    background:${done?'var(--green)':cur?col:'var(--bg-hover)'};
                    border:2px solid ${cur?col:done?'var(--green)':'var(--border)'};
                    box-shadow:${cur?`0 0 12px ${col}55`:'none'};font-size:14px;flex-shrink:0">
                    ${done?'✓':step.icon}
                  </div>
                  <div style="font-size:9px;color:${cur?col:done?'var(--green)':'var(--text-muted)'};letter-spacing:.5px;text-align:center;white-space:nowrap">${step.label}</div>
                </div>
                ${i<pipeline.length-1?`<div style="flex:1;height:2px;background:${done?'var(--green)':'var(--border)'};margin:0 2px;margin-bottom:20px"></div>`:''}
              </div>`;
            }).join('')}
          </div>
          <div class="progress" style="height:10px;border-radius:5px">
            <div class="progress-bar" style="width:${pct}%;background:linear-gradient(90deg,${col}99,${col});border-radius:5px"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:6px">
            <span style="font-size:12px;color:var(--text-muted)">${pct<100?`Faltam ${100-pct}% para concluir`:'✅ Projeto concluído!'}</span>
            <span style="font-family:Space Mono;font-size:13px;color:${col};font-weight:700">${pct}%</span>
          </div>
        </div>

        <!-- DOWNLOAD BLOCK (só se Finalizado) -->
        ${isDone ? `
        <div style="border-radius:12px;padding:16px 20px;margin-bottom:20px;border:1px solid ${links.length>0?'rgba(16,185,129,.3)':'var(--border-bright)'};background:${links.length>0?'rgba(16,185,129,.05)':'rgba(201,155,60,.04)'}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${links.length>0?'14px':'0'}">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="color:${links.length>0?'var(--green)':'var(--gold)'}">${icon('download',20)}</span>
              <div>
                <div style="font-size:14px;font-weight:700;color:${links.length>0?'var(--green)':'var(--gold-bright)'}">${links.length>0?'Músicas Disponíveis para Download':'Adicionar Links de Download'}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:1px">${links.length>0?`${links.length} ficheiro${links.length>1?'s':''} disponíve${links.length>1?'is':'l'}`:'Nenhum link adicionado ainda'}</div>
              </div>
            </div>
            <button class="btn ${links.length>0?'btn-outline':'btn-gold'} btn-sm" onclick="viewProjId=null;openLinkModal(${p.id})">
              ${icon('plus',13)} ${links.length>0?'Gerir Links':'Adicionar Link'}
            </button>
          </div>
          ${links.length>0?`
          <div style="display:flex;flex-direction:column;gap:8px">
            ${links.map(lk=>`
            <div style="display:flex;align-items:center;gap:12px;background:var(--bg-card);border-radius:8px;padding:10px 14px;border:1px solid var(--border)">
              <div style="width:36px;height:36px;border-radius:8px;background:rgba(16,185,129,.12);display:flex;align-items:center;justify-content:center;color:var(--green);flex-shrink:0">
                ${icon('music',18)}
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-weight:700;font-size:14px">${escH(lk.label||'Download')}</div>
                <div style="font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                  ${lk.url.startsWith('data:')?'📁 Ficheiro local':'🔗 '+escH(lk.url)}
                </div>
              </div>
              <a href="${escH(lk.url)}" download="${escH(lk.filename||lk.label||'musica')}" target="_blank"
                 style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;background:var(--green);color:var(--bg-deep);font-family:Rajdhani;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:.5px;flex-shrink:0">
                ${icon('download',14)} Baixar
              </a>
            </div>`).join('')}
          </div>` : ''}
        </div>` : ''}

        <!-- INFO GRID -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
          ${[['Artista',a?.artisticName||'-'],['Valor',fmt(p.value)],['Prazo',p.deadline||'-'],['Início',p.startDate||'-'],['Tipo',p.type]].map(([l,v])=>`
          <div style="background:var(--bg-deep);border-radius:8px;padding:10px 12px;border:1px solid var(--border)">
            <div style="font-size:10px;letter-spacing:2px;color:var(--text-muted);margin-bottom:4px">${l}</div>
            <div style="font-weight:700;font-size:14px">${escH(v)}</div>
          </div>`).join('')}
        </div>

        ${p.notes?`<div style="background:var(--bg-deep);border-radius:8px;padding:12px 14px;border:1px solid var(--border);margin-bottom:16px;font-size:13px;color:var(--text-secondary)">${escH(p.notes)}</div>`:''}
        <div class="divider"></div>
        <div style="font-family:Bebas Neue;letter-spacing:2px;margin-bottom:12px;font-size:16px">Histórico de Etapas</div>
        <div class="history-list">
          ${(p.history||[]).map(h=>`<div class="history-item"><div class="history-dot"></div>${escH(h)}</div>`).join('')}
          ${!(p.history||[]).length?'<div style="color:var(--text-muted);font-size:13px">Sem histórico</div>':''}
        </div>
      </div>
    </div>
  </div>`;
}

// ── CRUD ──────────────────────────────────────────────────
function openProjModal(type, id=null) {
  projModal = type;
  if (type==='edit' && id) { projForm = {...appData.projects.find(x=>x.id===id)}; }
  else { projForm = {name:'',artistId:appData.artists[0]?.id||'',type:'Single',status:'Em gravação',startDate:new Date().toISOString().split('T')[0],deadline:'',value:'',notes:''}; }
  rerenderPage();
}

function saveProj(type) {
  const name = document.getElementById('pf-name')?.value.trim();
  if (!name) { notify('Nome obrigatório','error'); return; }
  const today = new Date().toISOString().split('T')[0];
  const obj = {
    name,
    artistId:  Number(document.getElementById('pf-artist')?.value)||0,
    type:      document.getElementById('pf-type')?.value||'Single',
    status:    document.getElementById('pf-status')?.value||'Em gravação',
    value:     Number(document.getElementById('pf-value')?.value)||0,
    startDate: document.getElementById('pf-start')?.value||today,
    deadline:  document.getElementById('pf-deadline')?.value||'',
    notes:     document.getElementById('pf-notes')?.value||'',
  };
  if (type==='new') {
    appData.projects.push({...obj, id:Date.now(), history:[`${obj.startDate}: Criado`], downloadLinks:[]});
  } else {
    const i = appData.projects.findIndex(x=>x.id===projForm.id);
    if (i>=0) appData.projects[i] = {...appData.projects[i], ...obj};
  }
  const savedStatus = obj.status;
  persist('projects'); projModal=null;
  rerenderPage();
  // Se foi guardado directamente como Finalizado, abre modal de link
  if (savedStatus === 'Finalizado') {
    const proj = type==='new'
      ? appData.projects[appData.projects.length-1]
      : appData.projects.find(x=>x.id===projForm.id);
    if (proj && !(proj.downloadLinks||[]).length) {
      setTimeout(() => openLinkModal(proj.id), 150);
    }
  } else {
    notify(type==='new'?'Projeto criado!':'Projeto atualizado!');
  }
}

function changeProjStatus(id, newStatus) {
  const today = new Date().toISOString().split('T')[0];
  const i = appData.projects.findIndex(x=>x.id===id);
  if (i>=0) {
    appData.projects[i].status  = newStatus;
    appData.projects[i].history = [...(appData.projects[i].history||[]), `${today}: ${newStatus}`];
  }
  persist('projects');
  rerenderPage();
  // Ao finalizar: abre automaticamente o modal de link de download
  if (newStatus === 'Finalizado') {
    setTimeout(() => openLinkModal(id), 150);
  } else {
    notify(`Status: "${newStatus}"`);
  }
}

function deleteProj(id) {
  if (!confirm('Remover este projeto?')) return;
  appData.projects = appData.projects.filter(p=>p.id!==id);
  persist('projects'); notify('Projeto removido!'); rerenderPage();
}

// ── LINK MANAGEMENT ────────────────────────────────────────
function openLinkModal(projId) {
  linkModal = { projId }; viewProjId = null;
  rerenderPage();
  // Foca o campo de URL após render
  setTimeout(() => document.getElementById('lk-url')?.focus(), 100);
}

function detectarTipoLink(url) {
  const hint = document.getElementById('lk-url-hint');
  const label = document.getElementById('lk-label');
  if (!hint) return;
  if (url.includes('blogspot.com') || url.includes('blogger.com')) {
    hint.innerHTML = '✅ <span style="color:var(--green)">Link do Blogger detectado!</span> O artista verá o link directo para o post.';
    if (label && !label.value) label.value = 'Baixar no Blogger';
  } else if (url.includes('drive.google.com')) {
    hint.innerHTML = '✅ <span style="color:var(--neon)">Google Drive detectado.</span> Certifica-te que o ficheiro está público ("Qualquer pessoa com o link").';
    if (label && !label.value) label.value = 'Download (Google Drive)';
  } else if (url.includes('soundcloud.com')) {
    hint.innerHTML = '✅ <span style="color:var(--orange)">SoundCloud detectado.</span> O artista pode ouvir e descarregar directamente.';
    if (label && !label.value) label.value = 'Ouvir no SoundCloud';
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    hint.innerHTML = '✅ <span style="color:var(--red)">YouTube detectado.</span>';
    if (label && !label.value) label.value = 'Ver no YouTube';
  } else if (url.startsWith('http')) {
    hint.innerHTML = '🔗 Link externo. Cola o URL completo.';
  }
}

function switchLinkTab(tab) {
  document.getElementById('link-tab-url').style.display    = tab==='url'    ? 'block' : 'none';
  document.getElementById('link-tab-upload').style.display = tab==='upload' ? 'block' : 'none';
  document.getElementById('tab-url').className    = `btn btn-sm ${tab==='url'   ?'btn-gold':'btn-ghost'}`;
  document.getElementById('tab-upload').className = `btn btn-sm ${tab==='upload'?'btn-gold':'btn-ghost'}`;
}

function addDownloadLinkUrl(projId) {
  const url   = document.getElementById('lk-url')?.value.trim();
  const label = document.getElementById('lk-label')?.value.trim() || 'Download';
  if (!url) { notify('URL obrigatória','error'); return; }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    notify('URL inválida — deve começar com https://','error'); return;
  }
  _addLink(projId, { url, label });
}

function handleLinkFileSelect(event, projId) {
  const file = event.target.files[0];
  if (file) _processUploadFile(file, projId);
}

function handleLinkFileDrop(event, projId) {
  event.preventDefault();
  event.currentTarget.style.borderColor = 'var(--border-bright)';
  const file = event.dataTransfer.files[0];
  if (file) _processUploadFile(file, projId);
}

function _processUploadFile(file, projId) {
  if (file.size > 50 * 1024 * 1024) { notify('Ficheiro muito grande (máx 50MB)','error'); return; }
  const wrap = document.getElementById('upload-progress-wrap');
  const bar  = document.getElementById('upload-progress-bar');
  const stat = document.getElementById('upload-status');
  const res  = document.getElementById('upload-result');
  const rname= document.getElementById('upload-result-name');
  if (wrap) wrap.style.display='block';
  if (res)  res.style.display='none';
  let pct = 0;
  const iv = setInterval(()=>{ pct=Math.min(pct+Math.random()*20,90); if(bar) bar.style.width=pct+'%'; if(stat) stat.textContent=`A carregar... ${Math.round(pct)}%`; }, 80);
  const reader = new FileReader();
  reader.onload = ev => {
    clearInterval(iv);
    if (bar)  bar.style.width='100%';
    if (stat) stat.textContent='Concluído!';
    setTimeout(()=>{
      if (wrap) wrap.style.display='none';
      if (res)  res.style.display='block';
      if (rname) rname.textContent=`${file.name} · ${(file.size/1024/1024).toFixed(1)} MB`;
      const label = file.name.replace(/\.[^/.]+$/,'');
      _addLink(projId, { url: ev.target.result, label, filename: file.name });
    }, 400);
  };
  reader.onerror = () => { clearInterval(iv); notify('Erro ao ler ficheiro','error'); };
  reader.readAsDataURL(file);
}

function _addLink(projId, linkObj) {
  const i = appData.projects.findIndex(x=>x.id===projId);
  if (i<0) return;
  if (!appData.projects[i].downloadLinks) appData.projects[i].downloadLinks=[];
  appData.projects[i].downloadLinks.push(linkObj);
  persist('projects'); notify('Link adicionado!');
  linkModal = { projId }; rerenderPage();
}

function removeDownloadLink(projId, idx) {
  const i = appData.projects.findIndex(x=>x.id===projId);
  if (i<0) return;
  appData.projects[i].downloadLinks.splice(idx,1);
  persist('projects'); notify('Link removido!');
  linkModal = { projId }; rerenderPage();
}
