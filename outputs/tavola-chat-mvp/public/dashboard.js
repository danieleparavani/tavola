const $=s=>document.querySelector(s);
let selectedId=new URLSearchParams(location.search).get('user');
let techniqueMap=[];
// D-028: la mappa delle tecniche è un dato statico (non cambia a runtime), quindi va caricata
// una sola volta, separatamente dal polling di /api/users usato per il resto della dashboard.
async function loadTechniqueMap(){try{const d=await fetch('/api/technique-map').then(r=>r.json());techniqueMap=d.techniques||[]}catch(e){techniqueMap=[]}}
async function load(){const d=await fetch('/api/users').then(r=>r.json());$('#users').innerHTML=d.users.length?d.users.map(u=>`<div class="user-row${u.id===selectedId?' active':''}" data-id="${u.id}"><strong>${u.name}</strong><br><small>${u.state} · ${u.events.length} eventi</small></div>`).join(''):'<p>Nessun tester ancora.</p>';document.querySelectorAll('[data-id]').forEach(x=>x.onclick=()=>{selectedId=x.dataset.id;const url=new URL(location);url.searchParams.set('user',selectedId);history.replaceState(null,'',url);document.querySelectorAll('[data-id]').forEach(y=>y.classList.toggle('active',y.dataset.id===selectedId));show(d.users.find(u=>u.id===selectedId))});const cur=d.users.find(u=>u.id===selectedId);if(cur){show(cur)}else if(d.users[0]){selectedId=d.users[0].id;show(d.users[0])}}
function show(u){const comps=Object.values(u.competencies||{});$('#competency').innerHTML=comps.length?comps.map(c=>`<div class="principle"><strong>${c.name||'Competenza tecnica'}</strong><br><span class="status">${c.status.replaceAll('_',' ')}</span><p>${c.evidence.length} evidenze registrate. Una singola esposizione non dimostra acquisizione o transfer.</p></div>`).join(''):'<p>Nessuna competenza ancora osservata.</p>';const total=u.session?.stepsTotal;$('#session').innerHTML=u.session?`<p><strong>Esperienza:</strong> ${u.session.dishId||'storica'}</p><p><strong>Principio dominante:</strong> ${u.session.principle||'—'}</p><p><strong>Stato:</strong> ${u.state}</p><p><strong>Modalità:</strong> ${u.session.mode||'non scelta'}</p><p><strong>Passaggio:</strong> ${(u.session.step??0)+1}${total?`/${total}`:''}</p>`:'<p>Nessuna sessione.</p>';$('#events').innerHTML=u.events.slice(-12).reverse().map(e=>`<div class="event">${e.at.slice(11,19)} · ${e.type}</div>`).join('');renderTechniques(u)}
// Territorio fisso delle tecniche osservate (D-028): a differenza delle competenze libere per
// piatto (sopra), qui la lista delle 54 voci è sempre la stessa per tutti i tester — cambia solo
// quali sono evidenziate come osservate. "altro" (tecnica fuori mappa) è mostrato a parte perché
// non è una voce della mappa statica, ma la valvola di sfogo del laboratorio aperto (D-014).
function renderTechniques(u){
  if(!techniqueMap.length){$('#techniques').innerHTML='<p>Mappa delle tecniche non disponibile.</p>';return}
  const observed=u.techniques||{};
  const byArea=new Map();
  techniqueMap.forEach(t=>{if(!byArea.has(t.area))byArea.set(t.area,[]);byArea.get(t.area).push(t)});
  const sections=[...byArea.entries()].map(([area,items])=>{
    const chips=items.map(t=>{
      const o=observed[t.id];
      const cls=o&&!o.simulatedOnly?'tech-chip seen':o?'tech-chip sim':'tech-chip';
      const title=o&&!o.simulatedOnly?`osservata ${o.count} volta/e`:o?'vista solo in simulazione: non aggiorna il territorio':'non osservata';
      return `<span class="${cls}" title="${title}">${t.label}</span>`;
    }).join('');
    return `<div class="tech-area"><strong>${area}</strong><div class="tech-row">${chips}</div></div>`;
  }).join('');
  const altro=observed.altro;
  const altroHtml=altro&&!altro.simulatedOnly?`<p class="tech-altro"><strong>Fuori mappa (${altro.count} volta/e):</strong> ${altro.note||'tecnica non riconducibile alle voci elencate'}</p>`:'';
  $('#techniques').innerHTML=sections+altroHtml;
}
async function pingDashboardOpened(){const userId=localStorage.tavolaUserId;if(!userId)return;fetch('/api/dashboard-opened',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId})}).catch(()=>{})}
pingDashboardOpened();loadTechniqueMap().then(load);setInterval(load,5000);
