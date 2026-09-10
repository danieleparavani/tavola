import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));

// D-046/D-047: archivio tecnico locale verificato (Atlante Tecnico della Cucina v2, RAG-ready:
// 413 tecniche, 5305 chunk semantici per sezione, 270 fonti), caricato una sola volta all'avvio
// da data/atlante-rag/. Scopo: dare al laboratorio generativo (core/lab.mjs) un contesto tecnico
// già verificato prima di ricorrere alla ricerca web live, che è il passo più lento della
// generazione della ricetta (evidenza: lentezza percepita dal progettista, 10 settembre 2026,
// cfr. EVIDENCE.md). Non sostituisce D-014 (laboratorio aperto, non catalogo chiuso): resta un
// aiuto opzionale che accelera i casi coperti; se non trova nulla di pertinente, il laboratorio
// continua a poter cercare sul web come prima.
//
// D-047 sostituisce la prima versione (D-046, data/atlante-tecniche/, 413 tecniche condensate e
// solo 30 fonti) con il pacchetto RAG-ready completo fornito dal progettista: retrieval a livello
// di chunk di sezione (non di intera tecnica), come raccomandato dalla strategia RAG dichiarata
// in data/atlante-rag/README_RAG.md, con accesso a tutte le 270 fonti invece di 30.
const DATA_DIR=path.join(__dirname,'..','data','atlante-rag');

function loadJsonl(file){
  const raw=fs.readFileSync(path.join(DATA_DIR,file),'utf8');
  return raw.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>JSON.parse(l));
}
export const TECHNIQUES=loadJsonl('tecniche.jsonl');
export const CHUNKS=loadJsonl('chunks_sezioni.jsonl');
export const SOURCES=loadJsonl('fonti.jsonl');
const TECHNIQUES_BY_ID=new Map(TECHNIQUES.map(t=>[t.id,t]));
// Le fonti sono identificate dalla coppia (volume, local_id): lo stesso local_id (es. "S1") si
// ripete in volumi diversi con significato diverso, quindi non basta come chiave da solo.
const SOURCES_BY_KEY=new Map(SOURCES.map(s=>[`${s.volume}::${s.local_id}`,s]));

function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
const STOPWORDS=new Set(['di','del','della','dei','delle','dello','degli','e','o','in','con','per','da','al','ai','allo','alla','un','una','la','lo','le','il','i','gli','che','come','piu','più','non']);
function tokens(s){return normalize(s).split(/[^a-z0-9]+/).filter(w=>w.length>=3&&!STOPWORDS.has(w))}

// Risolve i source_local_ids di una tecnica o di un chunk (es. ["S1","S5"]) in oggetti fonte
// reali (titolo/descrizione + url), usando il volume del record per disambiguare il local_id.
export function resolveSources(record){
  const ids=Array.isArray(record?.source_local_ids)?record.source_local_ids:[];
  return ids.map(id=>SOURCES_BY_KEY.get(`${record.volume}::${id}`)).filter(Boolean);
}

// Ricerca per sovrapposizione di token sui 5305 chunk di sezione (non sulle 413 tecniche intere):
// è l'unità di recupero più fine, in linea con la "Strategia RAG consigliata" del pacchetto
// (recuperare prima i chunk, poi raggruppare per technique_id). Nessun embedding: l'archivio è
// piccolo abbastanza da restare sincrono e istantaneo nel processo del server.
export function searchChunks(queryText,limit=8){
  const qTokens=new Set(tokens(queryText));
  if(!qTokens.size)return [];
  const scored=CHUNKS.map(c=>{
    let score=0;
    const nameTokens=tokens(c.tecnica);
    const bodyTokens=tokens(c.text);
    for(const tok of qTokens){
      if(nameTokens.includes(tok))score+=3;
      if(bodyTokens.includes(tok))score+=1;
    }
    return {c,score};
  }).filter(x=>x.score>0);
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0,limit).map(x=>x.c);
}

// Raggruppa i chunk più pertinenti per technique_id (max maxTechniques tecniche, max
// chunksPerTechnique sezioni ciascuna), nell'ordine consigliato dal README: chunk -> tecnica ->
// fonti. Ogni tecnica include il proprio principio_trasferibile dal record completo.
export function searchTechniques(queryText,maxTechniques=3,chunksPerTechnique=3){
  const chunks=searchChunks(queryText,maxTechniques*chunksPerTechnique*2);
  const byTechnique=new Map();
  for(const c of chunks){
    if(!byTechnique.has(c.technique_id))byTechnique.set(c.technique_id,[]);
    const list=byTechnique.get(c.technique_id);
    if(list.length<chunksPerTechnique)list.push(c);
  }
  return [...byTechnique.entries()].slice(0,maxTechniques).map(([techniqueId,chunks])=>({
    technique:TECHNIQUES_BY_ID.get(techniqueId),
    chunks
  })).filter(x=>x.technique);
}

// Blocco testuale da iniettare nel prompt del laboratorio: tecniche pertinenti con le sezioni di
// chunk trovate (etichettate per tipo — Definizione, Controversie/varianti, Parametri critici,
// ecc. — senza fondere contenuto documentato e controversie, come richiesto dal README) e le
// fonti risolte (titolo + url), così il modello può citarle direttamente senza una ricerca web
// per le affermazioni che l'archivio copre già.
export function localTechniqueContext(queryText,maxTechniques=3,chunksPerTechnique=3){
  const groups=searchTechniques(queryText,maxTechniques,chunksPerTechnique);
  if(!groups.length)return {text:'',matches:[]};
  const blocks=groups.map(({technique:t,chunks})=>{
    const sections=chunks.map(c=>`  [${c.section_label}] ${c.text}`).join('\n');
    const allSources=new Map();
    for(const c of chunks)for(const s of resolveSources(c))allSources.set(s.source_id,s);
    for(const s of resolveSources(t))allSources.set(s.source_id,s);
    const srcs=[...allSources.values()].map(s=>`${s.descrizione}`).join('; ')||'nessuna fonte risolta';
    return `- ${t.tecnica} [${t.id}] — principio trasferibile: ${t.principio_trasferibile||'non specificato'}\n${sections}\n  Fonti verificate: ${srcs}`;
  }).join('\n');
  return {
    text:`ARCHIVIO TECNICO LOCALE VERIFICATO (Atlante Tecnico della Cucina; usa queste voci e le loro fonti quando coprono la tecnica dominante di questa ricetta, distinguendo sempre contenuto documentato da eventuali controversie/varianti indicate; non serve una ricerca web aggiuntiva per le affermazioni già coperte qui):\n${blocks}`,
    matches:groups.map(g=>g.technique)
  };
}
