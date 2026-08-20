const userId=localStorage.tavolaUserId||(localStorage.tavolaUserId='pilot-'+Math.random().toString(36).slice(2,8));
const messages=document.querySelector('#messages'),form=document.querySelector('#composer'),input=document.querySelector('#input');
function md(s){return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>')}
function add(text,type='bot',keyboard){const el=document.createElement('div');el.className='msg '+type;el.innerHTML=md(text);if(keyboard){const k=document.createElement('div');k.className='keyboard';keyboard.flat().forEach(label=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>send(label);k.append(b)});el.append(k)}messages.append(el);messages.scrollTop=messages.scrollHeight;return el}
async function send(text,voice=false){
  if(!text.trim())return;
  add((voice?'🎙️ ':'')+text,'user');input.value='';input.disabled=true;
  const waiting=add('Sto costruendo una proposta coerente con ingredienti, tempo e persone…','bot');
  try{
    const r=await fetch('/api/message',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId,text,voice,name:'Tester'})});
    const d=await r.json();waiting.remove();
    if(!r.ok)throw new Error(d.error||'internal_error');
    add(d.reply.text,'bot',d.reply.keyboard);
  }catch(e){waiting.remove();add('La proposta non è arrivata. Riprova tra poco: i dati inseriti restano validi.','bot')}
  finally{input.disabled=false;input.focus()}
}
form.onsubmit=e=>{e.preventDefault();send(input.value)};
document.querySelector('#voice').onclick=()=>{const t=prompt('Simula la trascrizione del messaggio vocale');if(t)send(t,true)};
fetch('/api/status').then(r=>r.json()).then(s=>{const e=document.querySelector('#lab-status');e.textContent=s.labConnected?`Laboratorio generativo · ${s.model}`:'Laboratorio generativo · da collegare';if(!s.labConnected){e.style.cursor='pointer';e.onclick=()=>location.href='/setup.html'}});
async function beginNewChapter(){const r=await fetch('/api/message',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId,text:'/start',name:'Tester'})});const d=await r.json();add(d.reply.text,'bot',d.reply.keyboard)}
async function boot(){const r=await fetch(`/api/user/${encodeURIComponent(userId)}`);if(r.ok){const u=await r.json();const pending=u.pendingDplus,due=pending?.dueAt?Date.parse(pending.dueAt):Infinity;if(pending&&Date.now()>=due){const x=await fetch('/api/dplus',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId})});const y=await x.json();add(y.reply.text,'bot',y.reply.keyboard)}}await beginNewChapter()}
boot();
