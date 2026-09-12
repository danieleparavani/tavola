import {renderPlating} from './platingRender.mjs';

// D-065: l'immagine del piatto viene generata da un modello di immagini, non più disegnata da
// regole. Tre vincoli, tutti ricavati dalle prove fatte prima di integrare:
//
// 1. NIENTE TITOLO NELL'IMMAGINE. Chiedendo una riga di testo grande in alto, il modello la
//    taglia fuori campo (verificato due volte, anche con istruzioni esplicite sui margini) e la
//    scrive in un carattere tipografico invece che a mano. Titolo e principio restano nel testo
//    del messaggio, che li ha già. Le sole parole nell'immagine sono le etichette degli
//    elementi: corte, e su quelle il modello è affidabile.
// 2. L'IMMAGINE È EVOCATIVA, NON AUTOREVOLE. Il modello può aggiungere un elemento, sbagliare
//    una cottura o una disposizione. La fonte di verità resta il testo strutturato, che viaggia
//    come didascalia. Per questo l'immagine non entra mai nella memoria delle competenze e non
//    viene usata come evidenza di nulla.
// 3. L'IMMAGINE NON STA MAI SUL PERCORSO CRITICO. La generazione costa una trentina di secondi:
//    il testo del passaggio parte subito, l'immagine arriva come messaggio successivo. Da qui la
//    forma a funzione (lazy) invece che a buffer già pronto.
//
// Se la chiave manca, la chiamata fallisce o scade il tempo, si torna alla scheda deterministica
// a regole (D-048 → D-064), che non richiede rete e resta sempre disponibile.

const POSITION_PHRASE={
  centro:'in the centre of the plate',
  '12':'at the twelve o\'clock position',
  '1':'at the one o\'clock position',
  '2':'at the two o\'clock position',
  '3':'at the three o\'clock position',
  '4':'at the four o\'clock position',
  '5':'at the five o\'clock position',
  '6':'at the six o\'clock position, towards the front',
  '7':'at the seven o\'clock position',
  '8':'at the eight o\'clock position',
  '9':'at the nine o\'clock position',
  '10':'at the ten o\'clock position',
  '11':'at the eleven o\'clock position',
};

const SHAPE_PHRASE={
  mucchio:'in a small loose heap',
  quenelle:'shaped into a smooth quenelle',
  fetta:'cut in slices laid flat, slightly overlapping',
  ventaglio:'fanned out',
  linea:'drawn in a line across the plate',
};

const SAUCE_PHRASE={
  specchio:'a thin mirror of sauce spread under the elements',
  virgola:'a single comma-shaped sweep of sauce',
  punti:'a few separate round dots of sauce',
  velo:'a very light veil of sauce, barely visible',
  nessuna:'no sauce on the plate',
};

const MAX_LABELS=4;
const MAX_LABEL_CHARS=30;

function cleanName(name){
  return String(name||'').replace(/\s+/g,' ').trim();
}

// Le etichette sono scritte a mano dal modello: se sono lunghe le sbaglia o le taglia. Si tiene
// la testa del nome, che è la parte che identifica l'elemento (stessa logica di foodStyle). La
// punteggiatura viene tolta: "filetti di triglia, pelle in vista" diventa "filetti di triglia".
function shortLabel(name){
  const clean=cleanName(String(name||'').split(/[,;(]/)[0]).toLowerCase();
  if(clean.length<=MAX_LABEL_CHARS)return clean;
  const words=clean.split(' ');
  let out='';
  for(const w of words){
    if((out?out.length+1:0)+w.length>MAX_LABEL_CHARS)break;
    out=out?`${out} ${w}`:w;
  }
  return out||clean.slice(0,MAX_LABEL_CHARS);
}

export function platingPrompt(plating){
  const elements=(plating?.clockLayout||[]).filter(e=>cleanName(e?.element));
  const described=elements.map(e=>{
    const where=POSITION_PHRASE[String(e.position)]||'on the plate';
    const how=SHAPE_PHRASE[e.shape]||'arranged neatly';
    return `${cleanName(e.element)}, ${how}, ${where}`;
  });
  const labels=elements.slice(0,MAX_LABELS).map(e=>shortLabel(e.element));
  const sauce=SAUCE_PHRASE[plating?.sauceStyle]||SAUCE_PHRASE.nessuna;
  const texture=cleanName(plating?.textureNote);
  const finish=cleanName(plating?.finish);

  return [
    'Watercolour and ink illustration on textured off-white paper, in the style of a chef hand-drawn recipe concept sheet. Loose pencil linework, transparent washes with visible pigment edges and paper grain, hand-made feeling, no photorealism, no 3D render.',
    `No title, no heading, no printed typography anywhere. The only words in the image are ${labels.length} small handwritten pencil annotations.`,
    'Composition: the round plate sits in the middle of the sheet and occupies about half of its width, with plenty of bare paper all around it. Nothing touches the edges of the image.',
    'Subject: a round white ceramic plate seen from a three-quarter angle, holding these elements, described in Italian and to be drawn as they really look:',
    described.map(d=>`- ${d}`).join('\n'),
    `On the plate, ${sauce}.`,
    texture?`Texture to make visible: ${texture}.`:'',
    finish?`Finish: ${finish}.`:'',
    labels.length?`Small handwritten Italian pencil annotations in the empty paper around the plate, each with a thin arrow pointing to its element: ${labels.join(', ')}. A small watercolour colour-swatch strip in the bottom right corner.`:'',
    'Warm natural food colours, no logos, no brand names, no people, no hands, no cutlery.',
  ].filter(Boolean).join('\n');
}

export function imageAvailable(){return Boolean(process.env.OPENAI_API_KEY)}

async function generate(prompt){
  const controller=new AbortController();
  const timeout=Number(process.env.TAVOLA_IMAGE_TIMEOUT_MS||90000);
  const timer=setTimeout(()=>controller.abort(),timeout);
  try{
    const response=await fetch('https://api.openai.com/v1/images/generations',{
      method:'POST',
      signal:controller.signal,
      headers:{authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'content-type':'application/json'},
      body:JSON.stringify({
        model:process.env.OPENAI_IMAGE_MODEL||'gpt-image-1',
        prompt,
        size:process.env.OPENAI_IMAGE_SIZE||'1024x1024',
        quality:process.env.OPENAI_IMAGE_QUALITY||'high',
        n:1,
      }),
    });
    const payload=await response.json();
    const b64=payload?.data?.[0]?.b64_json;
    if(!b64)throw new Error(`immagine non generata (HTTP ${response.status})`);
    return Buffer.from(b64,'base64');
  }finally{clearTimeout(timer)}
}

// Restituisce sempre un PNG: quello generato se possibile, altrimenti la scheda a regole.
export async function platingPhoto(plating,meta={}){
  const fallback=()=>renderPlating(plating,meta);
  if(!imageAvailable())return fallback();
  try{
    return await generate(platingPrompt(plating));
  }catch(error){
    console.error('Immagine del piatto non generata, uso la scheda a regole:',error?.message||error);
    return fallback();
  }
}
