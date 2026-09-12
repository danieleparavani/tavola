import {renderPlating} from './platingRender.mjs';
import {createCanvas, encodePNG, decodePNG} from './png.mjs';
import {drawHandText, measureText, wrapText} from './handwriting.mjs';

// D-065: l'immagine del piatto viene generata da un modello di immagini, non più disegnata da
// regole. Tre vincoli, tutti ricavati dalle prove fatte prima di integrare:
//
// 1. IL MODELLO NON SCRIVE NESSUNA PAROLA. Prima gli erano affidate le etichette degli elementi,
//    che sembravano abbastanza corte da riuscirgli sempre. Non è così: in una delle prime
//    immagini reali ha disegnato quattro richiami per tre etichette, lasciando una linea che
//    scende dal piatto e finisce nel nulla. È lo stesso difetto del titolo tagliato — quando
//    decide lui quante parole e quante frecce mettere, ogni tanto ne perde una — e nessuna
//    stretta del prompt lo elimina, la rende solo più rara (D-066). Quindi il modello dipinge
//    soltanto, e ogni parola sul foglio la scrive il nostro codice, con l'alfabeto a mano di
//    D-063, presa dallo schema: titolo in alto e legenda numerata in basso, nelle fasce di carta
//    che aggiungiamo noi sopra e sotto il dipinto. Le frecce spariscono: non sappiamo dove il
//    modello abbia messo gli elementi, e una freccia che punta al posto sbagliato è peggio di
//    nessuna freccia.
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

function cleanName(name){
  return String(name||'').replace(/\s+/g,' ').trim();
}

export function platingPrompt(plating){
  const elements=(plating?.clockLayout||[]).filter(e=>cleanName(e?.element));
  const described=elements.map(e=>{
    const where=POSITION_PHRASE[String(e.position)]||'on the plate';
    const how=SHAPE_PHRASE[e.shape]||'arranged neatly';
    return `${cleanName(e.element)}, ${how}, ${where}`;
  });
  const sauce=SAUCE_PHRASE[plating?.sauceStyle]||SAUCE_PHRASE.nessuna;
  const texture=cleanName(plating?.textureNote);
  const finish=cleanName(plating?.finish);

  return [
    'Watercolour and ink illustration on textured off-white paper, in the style of a chef hand-drawn recipe concept sheet. Loose pencil linework, transparent washes with visible pigment edges and paper grain, hand-made feeling, no photorealism, no 3D render.',
    'NO TEXT AT ALL. No title, no heading, no labels, no annotations, no letters, no numbers, no arrows and no leader lines anywhere in the image. This is a painting only.',
    'Composition: the round plate sits in the middle of the sheet and occupies about two thirds of its width, with bare paper all around it. Nothing touches the edges of the image.',
    'Subject: a round white ceramic plate seen from a three-quarter angle, holding these elements, described in Italian and to be drawn as they really look:',
    described.map(d=>`- ${d}`).join('\n'),
    `On the plate, ${sauce}.`,
    texture?`Texture to make visible: ${texture}.`:'',
    finish?`Finish: ${finish}.`:'',
    'A small watercolour colour-swatch strip in the bottom right corner, made of plain painted squares with no writing next to them.',
    'Warm natural food colours, no logos, no brand names, no people, no hands, no cutlery, no text.',
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

// D-066: le parole le scriviamo noi. Il dipinto arriva senza una lettera; qui viene rimesso in un
// canvas e incorniciato fra due fasce di carta, titolo sopra e legenda numerata sotto, scritti con
// l'alfabeto a mano di D-063 a partire dai campi dello schema. La numerazione è la stessa della
// didascalia (platingText), così l'elenco sul foglio e quello nel messaggio si corrispondono.
const INK=[86,78,70];
const TITLE_SIZE=44, LEGEND_SIZE=30, RULE=[120,110,98];

// Il colore della carta viene preso dal dipinto stesso (mediana grossolana dei quattro angoli),
// così le fasce non sembrano incollate sopra un foglio di tinta diversa.
function paperColor(image){
  const corners=[[4,4],[image.width-5,4],[4,image.height-5],[image.width-5,image.height-5]];
  const sum=[0,0,0];
  for(const [x,y] of corners){
    const i=(y*image.width+x)*4;
    sum[0]+=image.pixels[i];sum[1]+=image.pixels[i+1];sum[2]+=image.pixels[i+2];
  }
  return sum.map(v=>Math.round(v/corners.length));
}

export function composeSheet(pngBuffer,plating,meta={}){
  const image=decodePNG(pngBuffer);
  const paper=paperColor(image);
  const width=image.width;
  const margin=Math.round(width*0.06);
  const textWidth=width-margin*2;

  const title=cleanName(meta.title);
  const titleLines=title?wrapText(title.toLowerCase(),TITLE_SIZE,textWidth).slice(0,2):[];
  const topBand=titleLines.length?Math.round(TITLE_SIZE*0.5)+titleLines.length*Math.round(TITLE_SIZE*1.15)+Math.round(TITLE_SIZE*0.6):0;

  const items=(plating?.clockLayout||[]).map(e=>cleanName(e?.element)).filter(Boolean);
  const legendLines=items.map((name,i)=>`${i+1}. ${name.toLowerCase()}`);
  const bottomBand=legendLines.length?Math.round(LEGEND_SIZE*0.9)+legendLines.length*Math.round(LEGEND_SIZE*1.45)+Math.round(LEGEND_SIZE*0.8):0;

  const canvas=createCanvas(width,topBand+image.height+bottomBand,[...paper,255]);
  image.pixels.copy(canvas.pixels,topBand*width*4);

  let y=Math.round(TITLE_SIZE*1.1);
  for(const line of titleLines){
    drawHandText(canvas,line,margin,y,TITLE_SIZE,{color:INK,alpha:0.8,weight:1.25,seed:7+y});
    y+=Math.round(TITLE_SIZE*1.15);
  }
  if(titleLines.length){
    const ruleY=topBand-Math.round(TITLE_SIZE*0.3);
    const ruleWidth=Math.min(textWidth,Math.max(...titleLines.map(l=>measureText(l,TITLE_SIZE))));
    for(let x=0;x<ruleWidth&&margin+x<width;x++)for(let t=0;t<2;t++)canvas.pixels.set([...RULE,255],((ruleY+t)*width+margin+x)*4);
  }

  let ly=topBand+image.height+Math.round(LEGEND_SIZE*1.5);
  for(const line of legendLines){
    drawHandText(canvas,line,margin,ly,LEGEND_SIZE,{color:INK,alpha:0.72,seed:31+ly});
    ly+=Math.round(LEGEND_SIZE*1.45);
  }
  return encodePNG(canvas);
}

// Restituisce sempre un PNG: il dipinto con le parole scritte da noi se possibile, altrimenti la
// scheda a regole. Se la composizione fallisce (PNG in un formato che il decodificatore non
// gestisce) resta comunque il dipinto, che è già utile anche senza legenda.
export async function platingPhoto(plating,meta={}){
  const fallback=()=>renderPlating(plating,meta);
  if(!imageAvailable())return fallback();
  let painted;
  try{
    painted=await generate(platingPrompt(plating));
  }catch(error){
    console.error('Immagine del piatto non generata, uso la scheda a regole:',error?.message||error);
    return fallback();
  }
  try{
    return composeSheet(painted,plating,meta);
  }catch(error){
    console.error('Parole non scritte sul dipinto, invio il dipinto da solo:',error?.message||error);
    return painted;
  }
}
