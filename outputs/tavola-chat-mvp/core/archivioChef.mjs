import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));

// D-067: archivio verificato delle tecniche degli chef italiani (99 schede, ciascuna con
// percorso, filosofia, tecniche distintive, piatti icona e fonti con link), fornito dal
// progettista e già completo. Fa il paio con l'Atlante Tecnico (core/atlante.mjs, D-046/D-047)
// ma risponde a una domanda diversa: l'Atlante dice *come funziona* una tecnica, questo dice
// *chi la pratica davvero e dove è documentato*.
//
// È la gamba che mancava a D-009 ("riferimenti solo affidabili"): finché il modello poteva
// nominare chef a memoria, quella decisione era un'intenzione senza un controllo. Qui diventa
// verificabile — l'archivio è l'unico elenco di nomi attribuibili, e il gate editoriale
// (core/lab.mjs) rifiuta un'attribuzione a chiunque non ci sia dentro.
//
// Nessuna dipendenza esterna e nessun embedding: il file è un solo markdown di 412 KB, viene
// analizzato una volta all'avvio (poche decine di millisecondi) e la ricerca è per
// sovrapposizione di token, come nell'Atlante.
const SOURCE_FILE=path.join(__dirname,'..','data','archivio-chef','Schede_Tecniche_01-99.md');

const REGIONS=['Emilia-Romagna','Friuli-Venezia Giulia','Trentino-Alto Adige','Alto Adige','Valle d\'Aosta','Lombardia','Piemonte','Liguria','Veneto','Toscana','Umbria','Marche','Lazio','Abruzzo','Molise','Campania','Puglia','Basilicata','Calabria','Sicilia','Sardegna'];

function parseArchive(text){
  // Ogni scheda comincia con "# Scheda Tecnica — Nome". Il file usa tre trattini diversi nello
  // stesso ruolo (em dash, "--", "---") e riconoscerne uno solo faceva sparire silenziosamente
  // parte dell'archivio: il primo tentativo ne caricava 61 su 99 senza sollevare errori. Il
  // sommario iniziale non contiene il marcatore, quindi cade da solo.
  const parts=text.split(/^# Scheda Tecnica (?:—|-{2,3})\s*/m).slice(1);
  return parts.map((part,index)=>{
    const lines=part.split('\n');
    const chef=lines[0].trim();
    // Le sezioni si raccolgono scorrendo le righe invece che con una regex: in modalità multilinea
    // "$" chiude alla prima fine riga, e un'espressione non golosa si fermava dopo il primo
    // elemento dell'elenco (una tecnica su cinque, una fonte su sei).
    const sections=new Map();
    let current=null;
    for(const line of lines.slice(1)){
      const heading=line.match(/^## (.+?)\s*$/);
      if(heading){current=heading[1];sections.set(current,[]);continue}
      if(/^---\s*$/.test(line)){current=null;continue}
      if(current)sections.get(current).push(line);
    }
    const section=name=>(sections.get(name)||[]).join('\n').trim();
    // In una parte delle schede l'intestazione è mandata a capo a metà frase e "Riconoscimenti"
    // prosegue sulla stessa riga del ristorante: i campi si estraggono dal blocco iniziale
    // ricompattato in una riga sola, non riga per riga.
    const header=lines.slice(1,lines.findIndex((l,i)=>i>0&&l.startsWith('## '))).join(' ').replace(/\s+/g,' ');
    const field=name=>{
      const match=header.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*(.*?)(?=\\*\\*[A-ZÀ-Ý][^*]*:\\*\\*|$)`));
      return match?match[1].trim():'';
    };
    // Gli elenchi sono mandati a capo a metà riga, e in 31 voci il grassetto del nome della
    // tecnica si spezza fra due righe: leggendo riga per riga quelle voci finivano nell'indice
    // senza nome, cioè irrecuperabili proprio per la parola che le identifica. Le righe di
    // continuazione vengono ricucite all'elemento precedente prima di qualunque analisi.
    const bullets=block=>{
      const merged=[];
      for(const raw of block.split('\n')){
        if(/^-\s+\S/.test(raw))merged.push(raw.replace(/^-\s+/,'').trim());
        else if(merged.length&&raw.trim())merged[merged.length-1]+=` ${raw.trim()}`;
      }
      return merged.map(line=>{
        const named=line.match(/^\*\*(.+?)\*\*:?\s*(.*)$/);
        return named?{name:named[1].trim(),text:named[2].trim()}:{name:'',text:line};
      });
    };
    // Una scheda su 99 (Franco Pepe, pizzaiolo) intitola il campo "Attività" invece di
    // "Ristorante": sono lo stesso dato, e leggerne uno solo lasciava quella scheda senza locale.
    const restaurant=field('Ristorante')||field('Attività');
    // La regione si riconosce da un elenco chiuso invece che prendendo l'ultimo campo dopo la
    // virgola: in una decina di schede l'intestazione continua con una parentesi o una nota
    // ("Lombardia (fondato nel 1962 con la moglie)"), e la lettura posizionale restituiva quella.
    const region=REGIONS.find(r=>restaurant.includes(r))||'';
    const sources=(section('Fonti').match(/\[([^\]]+)\]\(([^)]+)\)/g)||[]).map(raw=>{
      const m=raw.match(/\[([^\]]+)\]\(([^)]+)\)/);
      return {title:m[1],url:m[2]};
    });
    return {
      n:index+1,
      chef,
      restaurant,
      region,
      awards:field('Riconoscimenti'),
      path:section('Percorso essenziale'),
      philosophy:section('Filosofia e cifra stilistica'),
      techniques:bullets(section('Tecniche distintive')),
      dishes:bullets(section('Piatti icona')),
      sources,
    };
  });
}

export const SCHEDE=parseArchive(fs.readFileSync(SOURCE_FILE,'utf8'));

// Ogni tecnica distintiva è un'unità di recupero a sé, come i chunk di sezione dell'Atlante: è il
// livello a cui la domanda "chi lavora la frollatura del pesce?" trova davvero risposta.
export const TECHNIQUE_ENTRIES=SCHEDE.flatMap(s=>s.techniques.map((t,i)=>({
  id:`${String(s.n).padStart(2,'0')}-${i+1}`,
  chef:s.chef,
  restaurant:s.restaurant,
  region:s.region,
  name:t.name,
  text:t.text,
  sources:s.sources,
})));

// I nomi attribuibili: l'archivio è l'unica autorità. Oltre al nome della scheda si indicizzano i
// cognomi, perché nel testo di una ricetta un cuoco viene nominato per cognome molto più spesso
// che per nome completo.
function chefTokens(name){
  // "Famiglia Cera (Lionello, Daniele, Lorena)" -> anche "Cera", "Lionello", ...
  const cleaned=name.replace(/[()"]/g,' ').replace(/\b(?:famiglia|con il fratello|con la sorella|e)\b/gi,' ');
  return cleaned.split(/[\s,/]+/).map(w=>w.trim()).filter(w=>w.length>=4&&/^[A-ZÀ-Ý]/.test(w));
}
export const CHEF_NAMES=new Set(SCHEDE.map(s=>s.chef));
const KNOWN_NAME_PARTS=new Set(SCHEDE.flatMap(s=>chefTokens(s.chef)).map(w=>w.toLowerCase()));
export function isKnownChefName(word){return KNOWN_NAME_PARTS.has(String(word||'').toLowerCase())}

function normalize(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()}
const STOPWORDS=new Set(['di','del','della','dei','delle','dello','degli','e','o','in','con','per','da','al','ai','allo','alla','un','una','uno','la','lo','le','il','i','gli','che','come','piu','non','sul','sulla','suo','sua','viene','essere','anche']);
function tokens(s){return normalize(s).split(/[^a-z0-9]+/).filter(w=>w.length>=4&&!STOPWORDS.has(w))}

// Ricerca per sovrapposizione di token sulle singole tecniche distintive. Il nome della tecnica
// pesa più del corpo, come nell'Atlante: "frollatura" nel titolo di una voce vale più della stessa
// parola citata di passaggio dentro un paragrafo.
export function searchChefTechniques(queryText,limit=3){
  const qTokens=new Set(tokens(queryText));
  if(!qTokens.size)return [];
  const scored=TECHNIQUE_ENTRIES.map(entry=>{
    const nameTokens=tokens(entry.name);
    const bodyTokens=tokens(entry.text);
    let score=0;
    for(const tok of qTokens){
      if(nameTokens.includes(tok))score+=3;
      if(bodyTokens.includes(tok))score+=1;
    }
    return {entry,score};
  }).filter(x=>x.score>=3); // almeno una corrispondenza sul nome della tecnica, non solo di passaggio
  scored.sort((a,b)=>b.score-a.score||a.entry.id.localeCompare(b.entry.id));
  // Un solo riferimento per cuoco: tre voci dello stesso chef non aggiungono nulla al contesto.
  const seen=new Set(),out=[];
  for(const {entry} of scored){
    if(seen.has(entry.chef))continue;
    seen.add(entry.chef);
    out.push(entry);
    if(out.length>=limit)break;
  }
  return out;
}

const MAX_TEXT=420;
function trim(text){return text.length<=MAX_TEXT?text:`${text.slice(0,MAX_TEXT).replace(/\s+\S*$/,'')}…`}

// Blocco da iniettare nel prompt del laboratorio. Dice due cose al modello: ecco i riferimenti
// culturali verificati pertinenti a questa ricetta, e — soprattutto — non nominare nessun altro.
export function chefContext(queryText,limit=3){
  const matches=searchChefTechniques(queryText,limit);
  if(!matches.length)return {text:'',matches:[]};
  const blocks=matches.map(m=>{
    const source=m.sources[0];
    return `- ${m.chef} (${m.restaurant}) — ${m.name}: ${trim(m.text)}\n  Fonte verificata: ${source?`${source.title} — ${source.url}`:'nessuna fonte risolta'}`;
  }).join('\n');
  return {
    text:`ARCHIVIO VERIFICATO DEGLI CHEF ITALIANI (99 schede con fonti; pertinenti a questa richiesta):\n${blocks}\nPuoi citare questi cuochi e queste fonti quando il collegamento con la tecnica dominante è reale e utile, per esempio nella curiosità o nel D+1. Non attribuire nulla a cuochi, ristoranti o scuole che non compaiono qui: un'attribuzione non verificata fa rifiutare la ricetta.`,
    matches,
  };
}

// Consultazione diretta, per la dashboard e per le risposte di approfondimento.
export function findChef(name){
  const wanted=normalize(name);
  if(!wanted)return null;
  return SCHEDE.find(s=>normalize(s.chef)===wanted)
    ||SCHEDE.find(s=>normalize(s.chef).includes(wanted))
    ||null;
}
