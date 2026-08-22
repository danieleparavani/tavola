import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {newUser,handle,dplus,publicUser,logDashboardOpened} from './core/tavola.mjs';import {labAvailable} from './core/lab.mjs';
import {loadProtectedKey,saveProtectedKey} from './core/key-store.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));const pub=path.join(root,'public');const dataDir=path.join(root,'data');const dataFile=path.join(dataDir,'pilot.json');fs.mkdirSync(dataDir,{recursive:true});
if(!process.env.OPENAI_API_KEY)process.env.OPENAI_API_KEY=loadProtectedKey();
let db=load();function load(){try{return JSON.parse(fs.readFileSync(dataFile,'utf8'))}catch{return {users:{},telegramOffset:0}}}function save(){fs.writeFileSync(dataFile,JSON.stringify(db,null,2))}
const json=(res,status,obj)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(obj))};
const body=req=>new Promise((resolve,reject)=>{let b='';req.on('data',c=>b+=c);req.on('end',()=>{try{resolve(JSON.parse(b||'{}'))}catch(e){reject(e)}})});
function mime(file){return file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html'}
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://local');
  if(req.method==='POST'&&url.pathname==='/api/message'){const b=await body(req);const id=String(b.userId||'demo');const u=db.users[id]??=newUser(id,b.name||'Tester');const out=await handle(u,{text:b.text,voice:b.voice,photo:b.photo},{source:'simulator'});save();return json(res,200,{reply:out,user:publicUser(u)})}
  if(req.method==='POST'&&url.pathname==='/api/dplus'){const b=await body(req);const u=db.users[String(b.userId||'demo')];if(!u)return json(res,404,{error:'user_not_found'});const out=dplus(u);save();return json(res,200,{reply:out,user:publicUser(u)})}
  if(req.method==='GET'&&url.pathname==='/api/users')return json(res,200,{users:Object.values(db.users).filter(u=>!u.id.startsWith('qa-')).map(publicUser)});
  if(req.method==='GET'&&url.pathname==='/api/status')return json(res,200,{labConnected:labAvailable(),model:labAvailable()?(process.env.OPENAI_MODEL||'gpt-5-mini'):null});
  if(req.method==='POST'&&url.pathname==='/api/setup-key'){
    const b=await body(req);const key=String(b.apiKey||'').trim();
    if(!key||key.length<20)return json(res,400,{ok:false,error:'Chiave non valida.'});
    const check=await fetch('https://api.openai.com/v1/models',{headers:{authorization:`Bearer ${key}`}}).catch(()=>null);
    if(!check)return json(res,502,{ok:false,error:'Il server locale non riesce a raggiungere OpenAI.'});
    if(!check.ok)return json(res,401,{ok:false,error:'La chiave non è stata accettata da OpenAI.'});
    saveProtectedKey(key);process.env.OPENAI_API_KEY=key;return json(res,200,{ok:true,model:process.env.OPENAI_MODEL||'gpt-5-mini',protected:true});
  }
  if(req.method==='GET'&&url.pathname.startsWith('/api/user/')){const u=db.users[decodeURIComponent(url.pathname.slice(10))];return u?json(res,200,publicUser(u)):json(res,404,{error:'not_found'})}
  if(req.method==='POST'&&url.pathname==='/api/dashboard-opened'){const b=await body(req);const u=db.users[String(b.userId||'')];if(!u)return json(res,200,{ok:false});logDashboardOpened(u);save();return json(res,200,{ok:true})}
  if(req.method==='POST'&&url.pathname==='/telegram/webhook'){const update=await body(req);telegramUpdate(update).catch(e=>console.error('telegramUpdate failed',e));return json(res,200,{ok:true})}
  let file=url.pathname==='/'?'index.html':url.pathname==='/dashboard'?'dashboard.html':url.pathname.slice(1);file=path.normalize(file).replace(/^(\.\.[/\\])+/, '');const target=path.join(pub,file);if(!target.startsWith(pub)||!fs.existsSync(target)){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'content-type':mime(target)+'; charset=utf-8'});fs.createReadStream(target).pipe(res);
}catch(e){console.error(e);json(res,500,{error:'internal_error'})}});




async function telegramUpdate(update){const msg=update.message||update.callback_query?.message;if(!msg)return;const from=update.message?.from||update.callback_query?.from;const text=update.callback_query?.data||update.message?.text||update.message?.caption||('[contenuto multimediale]');const id='tg-'+from.id;const u=db.users[id]??=newUser(id,from.first_name||'Tester');if(u.state==='difficulty_choice')await sendTelegram(msg.chat.id,{text:'Sto pensando alla proposta...'});const out=await handle(u,{text,voice:Boolean(update.message?.voice),photo:Boolean(update.message?.photo)},{source:'telegram'});save();await sendTelegram(msg.chat.id,out);}
function truncateBytes(str,maxBytes){let bytes=0,result='';for(const ch of String(str)){const b=Buffer.byteLength(ch,'utf8');if(bytes+b>maxBytes)break;bytes+=b;result+=ch}return result}
async function sendTelegram(chatId,out){const token=process.env.TELEGRAM_BOT_TOKEN;if(!token)return;const reply_markup=out.keyboard?{inline_keyboard:out.keyboard.map(row=>row.map(text=>({text,callback_data:truncateBytes(text,64)})))}:undefined;const res=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text:out.text,parse_mode:out.parseMode,reply_markup})});if(!res.ok){const body=await res.text().catch(()=>'');console.error('Telegram sendMessage failed',res.status,body)}}
const port=Number(process.env.PORT||4310),host=process.env.HOST||'127.0.0.1';server.listen(port,host,()=>console.log(`Tavola: http://localhost:${port}`));



