// ============================================================
// FILES
// ============================================================
let fileFilter='Todos', fileProjFilter='Todos', fileModal=false, fileForm={};

function buildFiles() {
  const filtered = appData.files.filter(f =>
    (fileFilter==='Todos' || f.type===fileFilter) &&
    (fileProjFilter==='Todos' || String(f.projectId)===String(fileProjFilter))
  );
  return `
  <div class="section-header">
    <div><div class="page-title">Arquivos</div><div class="page-sub">${appData.files.length} arquivos</div></div>
    <button class="btn btn-gold" onclick="openFileModal()">${icon('upload',15)} Upload</button>
  </div>
  <div class="filter-row">
    ${['Todos','audio','contract'].map(f=>`
    <button class="btn ${fileFilter===f?'btn-gold':'btn-ghost'} btn-sm" onclick="fileFilter='${f}';rerenderPage()">
      ${f==='Todos'?'Todos':f==='audio'?'Áudio':'Contratos'}
    </button>`).join('')}
    <select class="form-select" style="max-width:220px;padding:6px 12px" onchange="fileProjFilter=this.value;rerenderPage()">
      <option value="Todos">Todos os Projetos</option>
      ${appData.projects.map(p=>`<option value="${p.id}" ${fileProjFilter==p.id?'selected':''}>${escH(p.name)}</option>`).join('')}
    </select>
  </div>
  <div class="card">
    <div class="table-wrap"><table>
      <thead><tr><th>ARQUIVO</th><th>PROJETO</th><th>TIPO</th><th>TAMANHO</th><th>ENVIADO POR</th><th>DATA</th><th>AÇÕES</th></tr></thead>
      <tbody>
        ${filtered.map(f => {
          const proj = appData.projects.find(p=>p.id===f.projectId);
          return `<tr>
            <td>
              <div style="display:flex;align-items:center;gap:10px;font-weight:700">
                <div style="width:32px;height:32px;border-radius:6px;background:${f.type==='audio'?'var(--neon-dim)':'rgba(201,155,60,.1)'};display:flex;align-items:center;justify-content:center">
                  ${icon(f.type==='audio'?'music':'files',15)}
                </div>
                ${escH(f.name)}
              </div>
            </td>
            <td>${proj?escH(proj.name):'-'}</td>
            <td><span class="badge ${f.type==='audio'?'badge-neon':'badge-gold'}">${f.type==='audio'?'Áudio':'Contrato'}</span></td>
            <td style="font-family:Space Mono;font-size:12px">${f.size||'-'}</td>
            <td>${f.uploadedBy||'-'}</td>
            <td style="font-family:Space Mono;font-size:12px">${f.uploadedAt||'-'}</td>
            <td><div style="display:flex;gap:6px">
              <button class="btn btn-outline btn-icon btn-sm" title="Download">${icon('download',14)}</button>
              <button class="btn btn-danger btn-icon btn-sm" onclick="deleteFile(${f.id})">${icon('trash',14)}</button>
            </div></td>
          </tr>`;
        }).join('')}
        ${filtered.length===0?`<tr><td colspan="7"><div class="empty-state"><div class="empty-text">Nenhum arquivo encontrado</div></div></td></tr>`:''}
      </tbody>
    </table></div>
  </div>
  ${fileModal ? buildFileModal() : ''}`;
}

function buildFileModal() {
  return `
  <div class="modal-overlay">
    <div class="modal" style="max-width:440px">
      <div class="modal-header">
        <div class="modal-title">Upload de Arquivo</div>
        <button class="btn btn-ghost btn-icon" onclick="fileModal=false;rerenderPage()">${icon('close',16)}</button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Nome do Arquivo *</label><input class="form-input" id="ff-name" placeholder="ex: musica_v2.mp3" value="${escH(fileForm.name||'')}"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Tipo</label>
            <select class="form-select" id="ff-type">
              <option value="audio">Áudio (mp3/wav)</option>
              <option value="contract">Contrato (PDF)</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Tamanho</label><input class="form-input" id="ff-size" placeholder="ex: 4.2 MB" value="${fileForm.size||''}"></div>
        </div>
        <div class="form-group"><label class="form-label">Projeto</label>
          <select class="form-select" id="ff-proj">
            ${appData.projects.map(p=>`<option value="${p.id}">${escH(p.name)}</option>`).join('')}
            ${appData.projects.length===0?'<option value="">Nenhum projeto</option>':''}
          </select>
        </div>
        <div style="border:2px dashed var(--border-bright);border-radius:10px;padding:24px;text-align:center;color:var(--text-muted);cursor:pointer" onclick="document.getElementById('file-input').click()">
          ${icon('upload',28)}
          <div style="margin-top:8px;font-size:13px">Clique para selecionar ficheiro</div>
          <div style="font-size:11px;margin-top:4px">MP3, WAV, PDF suportados</div>
        </div>
        <input type="file" id="file-input" accept=".mp3,.wav,.pdf" style="display:none" onchange="handleFileInput(this)">
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="fileModal=false;rerenderPage()">Cancelar</button>
        <button class="btn btn-gold" onclick="saveFile()">Adicionar</button>
      </div>
    </div>
  </div>`;
}

function openFileModal() { fileForm={name:'',size:''}; fileModal=true; rerenderPage(); }
function handleFileInput(input) {
  const f = input.files[0]; if(!f) return;
  document.getElementById('ff-name').value = f.name;
  document.getElementById('ff-size').value = (f.size/1024/1024).toFixed(1)+' MB';
  document.getElementById('ff-type').value  = f.name.toLowerCase().endsWith('.pdf')?'contract':'audio';
}
function saveFile() {
  const name = document.getElementById('ff-name')?.value.trim();
  if (!name) { notify('Nome obrigatório','error'); return; }
  appData.files.push({
    id: Date.now(), name,
    type:       document.getElementById('ff-type')?.value||'audio',
    size:       document.getElementById('ff-size')?.value||'-',
    projectId:  Number(document.getElementById('ff-proj')?.value)||0,
    uploadedBy: session.username,
    uploadedAt: new Date().toISOString().split('T')[0],
  });
  persist('files'); fileModal=false; notify('Arquivo adicionado!'); rerenderPage();
}
function deleteFile(id) {
  if (!confirm('Remover este arquivo?')) return;
  appData.files = appData.files.filter(f=>f.id!==id);
  persist('files'); notify('Arquivo removido!'); rerenderPage();
}

// ============================================================
// SESSIONS
// ============================================================
let sessionModal=null, sessionForm={}, calMonth=new Date().getMonth(), calYear=new Date().getFullYear();

function buildSessions() {
  const today       = new Date();
  const sessionDates = new Set(appData.sessions.map(s=>s.date));
  const daysInMonth = new Date(calYear,calMonth+1,0).getDate();
  const firstDay    = new Date(calYear,calMonth,1).getDay();
  const days        = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const nextSess    = appData.sessions.filter(s=>s.status!=='Concluído').sort((a,b)=>a.date.localeCompare(b.date));

  return `
  <div class="section-header">
    <div><div class="page-title">Agenda de Sessões</div><div class="page-sub">${appData.sessions.filter(s=>s.status!=='Concluído').length} sessões ativas</div></div>
    <button class="btn btn-gold" onclick="openSessionModal('new')">${icon('plus',15)} Nova Sessão</button>
  </div>

  <div class="grid-2" style="margin-bottom:24px">
    <div class="card">
      <div class="card-header">
        <button class="btn btn-ghost btn-sm" onclick="calPrev()">‹</button>
        <div style="font-family:Bebas Neue;font-size:18px;letter-spacing:2px">${months[calMonth]} ${calYear}</div>
        <button class="btn btn-ghost btn-sm" onclick="calNext()">›</button>
      </div>
      <div class="calendar-grid">
        ${days.map(d=>`<div class="cal-header">${d}</div>`).join('')}
        ${Array(firstDay).fill('<div class="cal-day"></div>').join('')}
        ${Array.from({length:daysInMonth},(_,i)=>{
          const d  = i+1;
          const ds = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const isToday = d===today.getDate() && calMonth===today.getMonth() && calYear===today.getFullYear();
          return `<div class="cal-day ${isToday?'today':''} ${sessionDates.has(ds)?'has-event':''}">${d}</div>`;
        }).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Próximas Sessões</div></div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${nextSess.slice(0,5).map(s=>{
          const a = appData.artists.find(x=>x.id===s.artistId);
          return `<div style="display:flex;gap:12px;align-items:center;padding:10px 12px;background:var(--bg-hover);border-radius:8px;border:1px solid var(--border)">
            <div style="text-align:center;width:44px;flex-shrink:0">
              <div style="font-size:18px;font-family:Bebas Neue;color:var(--gold);line-height:1">${s.date.split('-')[2]}</div>
              <div style="font-size:10px;color:var(--text-muted);letter-spacing:1px">${monthsShort[parseInt(s.date.split('-')[1])-1]}</div>
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:700;font-size:14px">${escH(a?.artisticName||'-')}</div>
              <div style="font-size:12px;color:var(--text-muted)">${s.time} • ${s.type}</div>
            </div>
            <span class="badge badge-${statusColor(s.status)}">${s.status}</span>
          </div>`;
        }).join('')}
        ${nextSess.length===0?'<div class="empty-state"><div class="empty-text">Nenhuma sessão pendente</div></div>':''}
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><div class="card-title">Todas as Sessões</div></div>
    <div class="table-wrap"><table>
      <thead><tr><th>DATA</th><th>HORA</th><th>ARTISTA</th><th>TIPO</th><th>STATUS</th><th>NOTAS</th><th>AÇÕES</th></tr></thead>
      <tbody>
        ${appData.sessions.sort((a,b)=>b.date.localeCompare(a.date)).map(s=>{
          const a = appData.artists.find(x=>x.id===s.artistId);
          return `<tr>
            <td style="font-family:Space Mono;font-size:13px">${s.date}</td>
            <td style="font-family:Space Mono;font-size:13px">${s.time}</td>
            <td style="font-weight:700">${escH(a?.artisticName||'-')}</td>
            <td><span class="badge badge-neon">${s.type}</span></td>
            <td><span class="badge badge-${statusColor(s.status)}">${s.status}</span></td>
            <td style="font-size:12px;color:var(--text-muted);max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escH(s.notes||'-')}</td>
            <td><div style="display:flex;gap:6px">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="openSessionModal('edit',${s.id})">${icon('edit',14)}</button>
              <button class="btn btn-danger btn-icon btn-sm" onclick="deleteSession(${s.id})">${icon('trash',14)}</button>
            </div></td>
          </tr>`;
        }).join('')}
        ${appData.sessions.length===0?`<tr><td colspan="7"><div class="empty-state"><div class="empty-text">Nenhuma sessão</div></div></td></tr>`:''}
      </tbody>
    </table></div>
  </div>
  ${sessionModal ? buildSessionModal() : ''}`;
}

function buildSessionModal() {
  const isNew = sessionModal === 'new';
  return `
  <div class="modal-overlay">
    <div class="modal" style="max-width:480px">
      <div class="modal-header">
        <div class="modal-title">${isNew?'Nova Sessão':'Editar Sessão'}</div>
        <button class="btn btn-ghost btn-icon" onclick="sessionModal=null;rerenderPage()">${icon('close',16)}</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Data *</label><input class="form-input" type="date" id="sf-date" value="${sessionForm.date||''}"></div>
          <div class="form-group"><label class="form-label">Hora</label><input class="form-input" type="time" id="sf-time" value="${sessionForm.time||'10:00'}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Artista</label>
            <select class="form-select" id="sf-artist">
              ${appData.artists.map(a=>`<option value="${a.id}" ${sessionForm.artistId==a.id?'selected':''}>${escH(a.artisticName)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Tipo</label>
            <select class="form-select" id="sf-type">
              ${['Gravação','Mixagem','Master','Edição'].map(t=>`<option ${sessionForm.type===t?'selected':''}>${t}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-select" id="sf-status">
            ${['Confirmado','Cancelado','Concluído'].map(s=>`<option ${sessionForm.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Notas</label><textarea class="form-textarea" id="sf-notes">${escH(sessionForm.notes||'')}</textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="sessionModal=null;rerenderPage()">Cancelar</button>
        <button class="btn btn-gold" onclick="saveSession('${sessionModal}')">Salvar</button>
      </div>
    </div>
  </div>`;
}

function calPrev() { if(calMonth===0){calMonth=11;calYear--}else calMonth--; rerenderPage(); }
function calNext() { if(calMonth===11){calMonth=0;calYear++}else calMonth++; rerenderPage(); }
function openSessionModal(type, id=null) {
  sessionModal = type;
  if (type==='edit' && id) { sessionForm = {...appData.sessions.find(x=>x.id===id)}; }
  else { sessionForm = {date:new Date().toISOString().split('T')[0],time:'10:00',artistId:appData.artists[0]?.id||'',type:'Gravação',status:'Confirmado',notes:''}; }
  rerenderPage();
}
function saveSession(type) {
  const date = document.getElementById('sf-date')?.value;
  if (!date) { notify('Data obrigatória','error'); return; }
  const obj = {
    date, time:     document.getElementById('sf-time')?.value||'',
    artistId: Number(document.getElementById('sf-artist')?.value)||0,
    type:     document.getElementById('sf-type')?.value||'',
    status:   document.getElementById('sf-status')?.value||'',
    notes:    document.getElementById('sf-notes')?.value||'',
  };
  if (type==='new') { appData.sessions.push({...obj,id:Date.now()}); }
  else { const i=appData.sessions.findIndex(x=>x.id===sessionForm.id); if(i>=0) appData.sessions[i]={...appData.sessions[i],...obj}; }
  persist('sessions'); sessionModal=null;
  notify(type==='new'?'Sessão agendada!':'Sessão atualizada!');
  rerenderPage();
}
function deleteSession(id) {
  if (!confirm('Remover esta sessão?')) return;
  appData.sessions = appData.sessions.filter(s=>s.id!==id);
  persist('sessions'); notify('Sessão removida!'); rerenderPage();
}

// ============================================================
// FINANCE
// ============================================================
let financeModal=null, financeForm={};

function buildFinance() {
  const enriched = appData.financials.map(f => {
    const proj   = appData.projects.find(p=>p.id===f.projectId);
    const artist = proj ? appData.artists.find(x=>x.id===proj.artistId) : null;
    return { ...f, proj, artist, pending:(proj?.value||0)-f.paid };
  });
  const totalRevenue = appData.projects.reduce((a,p)=>a+p.value, 0);
  const totalPaid    = appData.financials.reduce((a,f)=>a+f.paid, 0);
  const totalPending = totalRevenue - totalPaid;
  const paidPct      = totalRevenue ? Math.round((totalPaid/totalRevenue)*100) : 0;

  return `
  <div class="section-header">
    <div><div class="page-title">Financeiro</div><div class="page-sub">Controle de pagamentos</div></div>
    <button class="btn btn-gold" onclick="openFinanceModal('new')">${icon('plus',15)} Novo Registo</button>
  </div>

  <div class="stats-grid" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">
    <div class="stat-card green"><div class="stat-label">Total de Projetos</div><div class="stat-value" style="color:var(--gold-bright);font-size:20px">${fmt(totalRevenue)}</div><div class="stat-sub">receita bruta</div></div>
    <div class="stat-card neon"><div class="stat-label">Valor Recebido</div><div class="stat-value" style="color:var(--green);font-size:20px">${fmt(totalPaid)}</div><div class="stat-sub">${paidPct}% recebido</div></div>
    <div class="stat-card red"><div class="stat-label">Valor Pendente</div><div class="stat-value" style="color:var(--red);font-size:20px">${fmt(totalPending)}</div><div class="stat-sub">a receber</div></div>
    <div class="stat-card gold"><div class="stat-label">Projetos Pagos</div><div class="stat-value" style="color:var(--green)">${appData.financials.filter(f=>f.status==='Pago').length}</div><div class="stat-sub">de ${appData.financials.length} total</div></div>
  </div>

  <div class="card" style="margin-bottom:24px">
    <div style="display:flex;justify-content:space-between;margin-bottom:8px">
      <span style="font-size:13px;color:var(--text-secondary)">Progresso de Recebimento</span>
      <span style="font-family:Space Mono;font-size:13px;color:var(--gold)">${paidPct}%</span>
    </div>
    <div class="progress" style="height:10px"><div class="progress-bar" style="width:${paidPct}%;background:linear-gradient(90deg,var(--green),var(--gold))"></div></div>
  </div>

  <div class="card">
    <div class="table-wrap"><table>
      <thead><tr><th>PROJETO</th><th>ARTISTA</th><th>VALOR TOTAL</th><th>PAGO</th><th>PENDENTE</th><th>FORMA PG.</th><th>DATA PG.</th><th>STATUS</th><th>AÇÕES</th></tr></thead>
      <tbody>
        ${enriched.map(f=>`<tr>
          <td style="font-weight:700">${escH(f.proj?.name||'-')}</td>
          <td>${escH(f.artist?.artisticName||'-')}</td>
          <td style="font-family:Space Mono;font-size:13px">${fmt(f.proj?.value)}</td>
          <td style="font-family:Space Mono;font-size:13px;color:var(--green)">${fmt(f.paid)}</td>
          <td style="font-family:Space Mono;font-size:13px;color:${f.pending>0?'var(--red)':'var(--text-muted)'}">${fmt(f.pending)}</td>
          <td>${f.paymentMethod||'-'}</td>
          <td style="font-family:Space Mono;font-size:12px">${f.paymentDate||'-'}</td>
          <td><span class="badge badge-${statusColor(f.status)}">${f.status}</span></td>
          <td><div style="display:flex;gap:6px">
            <button class="btn btn-ghost btn-icon btn-sm" onclick="openFinanceModal('edit',${f.id})">${icon('edit',14)}</button>
            <button class="btn btn-danger btn-icon btn-sm" onclick="deleteFinance(${f.id})">${icon('trash',14)}</button>
          </div></td>
        </tr>`).join('')}
        ${enriched.length===0?`<tr><td colspan="9"><div class="empty-state"><div class="empty-text">Nenhum registo financeiro</div></div></td></tr>`:''}
      </tbody>
    </table></div>
  </div>
  ${financeModal ? buildFinanceModal() : ''}`;
}

function buildFinanceModal() {
  const isNew = financeModal === 'new';
  return `
  <div class="modal-overlay">
    <div class="modal" style="max-width:480px">
      <div class="modal-header">
        <div class="modal-title">${isNew?'Novo Registo Financeiro':'Editar Registo'}</div>
        <button class="btn btn-ghost btn-icon" onclick="financeModal=null;rerenderPage()">${icon('close',16)}</button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Projeto</label>
          <select class="form-select" id="fnf-proj">
            ${appData.projects.map(p=>`<option value="${p.id}" ${financeForm.projectId==p.id?'selected':''}>${escH(p.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Valor Pago (Kz)</label><input class="form-input" type="number" id="fnf-paid" value="${financeForm.paid||''}"></div>
          <div class="form-group"><label class="form-label">Data de Pagamento</label><input class="form-input" type="date" id="fnf-date" value="${financeForm.paymentDate||''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Forma de Pagamento</label>
            <select class="form-select" id="fnf-method">
              ${['Multicaixa','Transferência','TPA','Dinheiro','Outro'].map(m=>`<option ${financeForm.paymentMethod===m?'selected':''}>${m}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Status</label>
            <select class="form-select" id="fnf-status">
              ${['Pago','Parcial','Em aberto'].map(s=>`<option ${financeForm.status===s?'selected':''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group"><label class="form-label">Observações</label><textarea class="form-textarea" id="fnf-notes">${escH(financeForm.notes||'')}</textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="financeModal=null;rerenderPage()">Cancelar</button>
        <button class="btn btn-gold" onclick="saveFinance('${financeModal}')">Salvar</button>
      </div>
    </div>
  </div>`;
}

function openFinanceModal(type, id=null) {
  financeModal = type;
  if (type==='edit' && id) { financeForm = {...appData.financials.find(x=>x.id===id)}; }
  else { financeForm = {projectId:appData.projects[0]?.id||'',paid:'',paymentDate:new Date().toISOString().split('T')[0],paymentMethod:'Multicaixa',status:'Parcial',notes:''}; }
  rerenderPage();
}
function saveFinance(type) {
  const obj = {
    projectId:     Number(document.getElementById('fnf-proj')?.value)||0,
    paid:          Number(document.getElementById('fnf-paid')?.value)||0,
    paymentDate:   document.getElementById('fnf-date')?.value||'',
    paymentMethod: document.getElementById('fnf-method')?.value||'',
    status:        document.getElementById('fnf-status')?.value||'',
    notes:         document.getElementById('fnf-notes')?.value||'',
  };
  if (type==='new') { appData.financials.push({...obj,id:Date.now()}); }
  else { const i=appData.financials.findIndex(x=>x.id===financeForm.id); if(i>=0) appData.financials[i]={...appData.financials[i],...obj}; }
  persist('financials'); financeModal=null;
  notify(type==='new'?'Registo adicionado!':'Registo atualizado!');
  rerenderPage();
}
function deleteFinance(id) {
  if (!confirm('Remover este registo?')) return;
  appData.financials = appData.financials.filter(f=>f.id!==id);
  persist('financials'); notify('Registo removido!'); rerenderPage();
}
