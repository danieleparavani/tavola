import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));

// D-044: archivio tecnico locale verificato (413 tecniche, 30 fonti risolte), caricato una sola
// volta all'avvio da data/atlante-tecniche/. Scopo: dare al laboratorio generativo (core/lab.mjs)
// un contesto tecnico già verificato prima di ricorrere alla ricerca web live, che è il passo più
// lento della generazione della ricetta (evidenza: lentezza percepita dal progettista, 10
// settembre 2026, cfr. EVIDENCE.md). Non sostituisce D-014 (laboratorio aperto, non catalogo
// chiuso): resta un aiuto opzionale che accelera i casi coperti; se non trova nulla di pertinente,
// il laboratorio continua a poter cercare sul web come prima.
const DATA_DIR=path.join(__dirname,'..','data','atlante-tecniche');

function loadTechniques(){
  const dir=path.join(DATA_DIR,'tecniche');
  const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json'));
  return files.flatMap(f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')));
}
function loadSources(){
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR,'fonti.json'),'utf8'));
}
export const TECHNIQUES=loadTechniques();
export const SOURCES=loadSources();
const SOURCES_BY_ID=new Map(SOURCES.map(s=>[s.id,s]));

function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
const STOPWORDS=new Set(['di','del','della','dei','delle','dello','degli','e','o','in','con','per','da','al','ai','allo','alla','un','una','la','lo','le','il','i','gli','che','come','piu','più','non','con']);
function tokens(s){return normalize(s).split(/[^a-z0-9]+/).filter(w=>w.length>=3&&!STOPWORDS.has(w))}

// Punteggio per sovrapposizione di token, pesato per campo: nome/sinonimi valgono più di
// definizione/scopo/principio_trasferibile. Niente embedding: l'archivio è piccolo (413 voci) e
// la ricerca deve restare sincrona e istantanea nel processo del server, senza dipendenze esterne.
export function searchTechniques(queryText,limit=3){
  const qTokens=new Set(tokens(queryText));
  if(!qTokens.size)return [];
  const scored=TECHNIQUES.map(t=>{
    let score=0;
    const nameTokens=tokens(`${t.nome} ${t.sinonimi||''}`);
    const bodyTokens=tokens(`${t.definizione} ${t.scopo} ${t.principio_trasferibile}`);
    for(const tok of qTokens){
      if(nameTokens.includes(tok))score+=3;
      if(bodyTokens.includes(tok))score+=1;
    }
    return {t,score};
  }).filter(x=>x.score>0);
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0,limit).map(x=>x.t);
}

export function sourcesFor(technique){
  const ids=String(technique?.fonte_id||'').split(',').map(s=>s.trim()).filter(Boolean);
  return ids.map(id=>SOURCES_BY_ID.get(id)).filter(Boolean);
}

// Blocco testuale da iniettare nel prompt del laboratorio: solo le tecniche pertinenti, forma
// compatta, con le fonti già risolte (titolo + url) così il modello può citarle direttamente
// senza una ricerca web per le affermazioni che l'archivio copre già.
export function localTechniqueContext(queryText,limit=3){
  const matches=searchTechniques(queryText,limit);
  if(!matches.length)return {text:'',matches:[]};
  const blocks=matches.map(t=>{
    const srcs=sourcesFor(t).map(s=>`${s.titolo} (${s.url})`).join('; ')||'nessuna fonte risolta';
    return `- ${t.nome} [${t.cod_macroarea}]: ${t.definizione}\n  Come: ${t.come}\n  Perché: ${t.perche}\n  Parametri critici: ${t.parametri_critici}\n  Errori tipici: ${t.errori}\n  Fonti verificate: ${srcs}`;
  }).join('\n');
  return {text:`ARCHIVIO TECNICO LOCALE VERIFICATO (usa queste voci e le loro fonti quando coprono la tecnica dominante di questa ricetta; non serve una ricerca web aggiuntiva per le affermazioni già coperte qui):\n${blocks}`,matches};
}
