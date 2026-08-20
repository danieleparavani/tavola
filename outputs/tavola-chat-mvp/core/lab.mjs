const schema={type:'object',additionalProperties:false,required:['kind','question','options','dish'],properties:{kind:{type:'string',enum:['clarification','proposal']},question:{type:'string'},options:{type:'array',items:{type:'string'}},dish:{type:['object','null'],additionalProperties:false,required:['id','name','competency','competencyName','principle','shopping','closure','closureButtons','dplus','curiosity','evidence','steps'],properties:{id:{type:'string'},name:{type:'string'},competency:{type:'string'},competencyName:{type:'string'},principle:{type:'object',additionalProperties:false,required:['term','rule','prediction'],properties:{term:{type:'string'},rule:{type:'string'},prediction:{type:'string'}}},shopping:{type:'array',items:{type:'string'}},closure:{type:'string'},closureButtons:{type:'array',items:{type:'array',items:{type:'string'}}},dplus:{type:'string'},curiosity:{type:'string'},evidence:{type:'array',minItems:1,maxItems:4,items:{type:'object',additionalProperties:false,required:['claim','status','sourceTitle','sourceUrl'],properties:{claim:{type:'string'},status:{type:'string',enum:['evidence','interpretation','decision']},sourceTitle:{type:'string'},sourceUrl:{type:'string'}}}},steps:{type:'array',minItems:3,maxItems:7,items:{type:'object',additionalProperties:false,required:['term','title','action','observe','why','help'],properties:{term:{type:'string'},title:{type:'string'},action:{type:'string'},observe:{type:'string'},why:{type:'string'},help:{type:'string'}}}}}}}};
const instructions=`Sei il laboratorio gastronomico di Tavola, rivolto a cuochi domestici non principianti. Progetta una cena utile e gastronomicamente sensata a partire dal contesto reale, senza limitarti a un catalogo di ricette.
Obblighi: rispetta ingredienti, persone, tempo e vincoli; se manca una sola informazione decisiva restituisci kind=clarification, domanda breve, 2-3 opzioni e dish=null; altrimenti kind=proposal, dish completo, question vuota e options vuoto. Proponi alta cucina domestica: tecnica precisa, gusto intenzionale, consistenze leggibili e finitura curata, realizzabili in una normale cucina di casa. Non imitare procedure da ristorante quando non portano valore domestico. Cerca sul web prima di formulare una tecnica. Usa soltanto fonti primarie o autorevoli: siti ufficiali di chef e ristoranti riconosciuti, scuole culinarie, consorzi/istituzioni, editori tecnici o letteratura scientifica. Le fonti sono infrastruttura di verifica e non devono appesantire la ricetta; verranno mostrate solo su richiesta. Escludi aggregatori SEO, contenuti anonimi e social senza fonte. Ogni affermazione tecnica deve apparire in evidence e distinguere evidence, interpretation e decision. sourceTitle e sourceUrl devono provenire davvero dalla ricerca; non inventare mai URL, chef, libri, tradizioni, citazioni o origini. Se le fonti non bastano, restituisci clarification e dichiara il limite. Inserisci avvertenze di sicurezza soltanto quando il rischio è concreto, specifico e non ovvio per un cuoco domestico competente; niente formule rituali, note HACCP o raccomandazioni generiche. Scegli un solo principio tecnico dominante; collega termine, meccanismo, gesto, osservazione e risultato; ogni passaggio deve avere segnale osservabile e aiuto operativo. L'ultimo passaggio deve essere sempre un impiattamento esplicito e fattibile: indica disposizione degli elementi, temperatura del piatto o del servizio quando rilevante, consistenze da non compromettere e finitura con funzione gustativa; niente decorazioni gratuite. L'impiattamento è richiesto anche nel livello semplice. Non trasformare una scelta di scuola in regola universale; non usare spiegazioni pseudotecniche come "la tostatura sigilla l'amido"; per il risotto distingui tostatura a secco, tostatura nel grasso e soffritto; non dare precisione falsa; D+1 non interrogativo sotto 30 secondi e mai dedicato a conservazione o sicurezza ordinaria; non dichiarare competenze acquisite o transfer. Scrivi in italiano chiaro e autorevole.`;
export function labAvailable(){return Boolean(process.env.OPENAI_API_KEY)}
const ideasSchema={type:'object',additionalProperties:false,required:['ideas'],properties:{ideas:{type:'array',minItems:3,maxItems:3,items:{type:'object',additionalProperties:false,required:['level','name','description','principle'],properties:{level:{type:'string',enum:['simple','technical','gourmet']},name:{type:'string'},description:{type:'string'},principle:{type:'string'}}}}}};
export async function generateDifficultyIdeas(context){
  if(!labAvailable())throw new Error('LAB_NOT_CONNECTED');
  const input=`Contesto: ${context.people} persone, ${context.time} minuti, fase ${context.intent||'idea'}. Richiesta: ${context.raw}. Proponi esattamente tre piatti realmente diversi che usano l'ingrediente o rispettano il piatto richiesto: simple = semplice curato e immediato; technical = più tecnico ma domestico; gourmet = vera alta cucina domestica, con maggiore trasformazione, precisione e profondità gustativa, senza complessità gratuita. Per ciascuno indica un solo principio tecnico. Non scrivere ancora la ricetta.`;
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5-mini',reasoning:{effort:'low'},instructions:'Sei il progettista gastronomico di Tavola. Non inventare tradizioni, chef o attribuzioni. Le tre direzioni devono essere fattibili nel tempo dato, distinguibili e ordinate per impegno tecnico, non semplicemente per numero di ingredienti. Gourmet significa controllo di cottura, estrazione o concentrazione del sapore, equilibrio e composizione funzionale. Non usare come scorciatoie micro-erbe, gocce decorative, riduzioni di balsamico, coulis gratuiti, schiume, torrette o termini francesi ornamentali. Ogni elemento deve avere una funzione gustativa o di texture evidente. Anche il piatto semplice deve essere tecnicamente corretto: non chiamare bruciatura una normale grigliatura e non promettere preparazioni incompatibili con il tempo disponibile.',input,store:false,text:{format:{type:'json_schema',name:'tavola_difficulty_ideas',strict:true,schema:ideasSchema}}})});
  if(!response.ok)throw new Error(`OPENAI_IDEAS_${response.status}`);const data=await response.json();const outputText=data.output?.flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text||data.output_text;if(!outputText)throw new Error('IDEAS_EMPTY_RESPONSE');const parsed=JSON.parse(outputText);return parsed.ideas;
}
export async function generateLabPlan(context,followup=''){
  if(!labAvailable())throw new Error('LAB_NOT_CONNECTED');
  let editorialNotes='',draft=null,lastIssues=[];
  for(let attempt=0;attempt<2;attempt++){
  const input=`Contesto cena:\n- persone: ${context.people}\n- tempo: ${context.time} minuti\n- richiesta e ingredienti: ${context.raw}\n- luogo: ${context.place||'non specificato'}\n- livello scelto: ${context.difficulty||'non specificato'}\n- direzione scelta: ${context.selectedIdea?.name||'nessuna'} — ${context.selectedIdea?.description||''}\n- risposta a chiarimento: ${followup||'nessuna'}\nSviluppa precisamente la direzione scelta e usa davvero gli ingredienti richiesti.\n${editorialNotes}${draft?`\nBOZZA DA CORREGGERE SENZA CAMBIARE LE FONTI VERIFICATE:\n${JSON.stringify(draft)}`:''}\nPrima di rispondere esegui un controllo editoriale silenzioso: riconcilia tutte le quantità; verifica che ogni elemento annunciato nel titolo e nella spesa compaia nei passaggi; inserisci assemblaggio, reinserimento degli ingredienti temporaneamente rimossi e un ultimo passaggio dedicato all'impiattamento; controlla sale e grassi nell'intera ricetta; assicurati che almeno una fonte sostenga proprio il principio tecnico dominante e non soltanto igiene o sicurezza.`;
  const request={model:process.env.OPENAI_MODEL||'gpt-5-mini',reasoning:{effort:'low'},instructions,input,store:false,text:{format:{type:'json_schema',name:'tavola_lab_plan',strict:true,schema}}};if(attempt===0){request.tools=[{type:'web_search'}];request.tool_choice='auto'}
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'content-type':'application/json'},body:JSON.stringify(request)});
  if(!response.ok){const detail=await response.text();throw new Error(`OPENAI_${response.status}:${detail.slice(0,300)}`)}
  const data=await response.json();const outputText=data.output?.flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text||data.output_text;if(!outputText)throw new Error('LAB_EMPTY_RESPONSE');
  const plan=JSON.parse(outputText);if(plan.kind==='clarification')return plan;
  const issues=qualityIssues(plan.dish,context);lastIssues=issues;
  if(!issues.length){normalizeDish(plan.dish);plan.dish.id='lab_'+String(plan.dish.id||'dish').replace(/[^a-z0-9_]+/gi,'_').toLowerCase();return plan}
  draft=plan;editorialNotes=`La precedente bozza è stata respinta. Correggi tutti questi problemi: ${issues.join('; ')}.`;
  }
  const gateError=new Error(`EDITORIAL_GATE_FAILED:${lastIssues.join(' | ')}`);gateError.issues=lastIssues;throw gateError;
}

export function qualityIssues(d,context){
  const issues=[];if(!d)return ['piatto assente'];
  const all=d.steps.map(s=>`${s.title} ${s.action} ${s.why}`).join(' ').toLowerCase();
  const title=String(d.name||'').toLowerCase(),principle=String(d.principle?.term||'').toLowerCase();
  if(!context.people||!context.time)issues.push('persone o tempo non confermati');
  // Coerenza generica fra spesa e passaggi: ogni ingrediente annunciato deve poi comparire
  // davvero nella preparazione (evita il failure "ingrediente rimosso e mai reinserito" per
  // qualunque piatto, non solo per i casi hardcoded più sotto).
  const stopWords=new Set(['di','del','della','dei','delle','dello','degli','e','o','in','con','per','da','al','ai','allo','alla','un','una','the','the','the']);
  const missingFromSteps=(d.shopping||[]).filter(item=>{
    const clean=String(item).toLowerCase();
    if(/\so\s|facoltativ|a piacere|q\.?b\.?/i.test(clean))return false; // alternative/opzionali: non forzare la corrispondenza
    const words=clean.split(/[^a-zà-ù]+/).filter(w=>w.length>=3&&!stopWords.has(w));
    if(!words.length)return false; // nessuna parola sufficientemente significativa: non forzare
    // tollera plurali/declinazioni italiane (limone/limoni) e il fatto che nei passaggi spesso
    // si usa solo il sostantivo principale ("olio") e non il modificatore ("extravergine")
    const stems=words.map(w=>w.slice(0,Math.max(3,w.length-2))); // radice comune per varianti come sale/sala, olio/oli...
    return !stems.some(st=>all.includes(st));
  });
  if(missingFromSteps.length)issues.push(`ingredienti della spesa mai citati nei passaggi: ${missingFromSteps.join(', ')}`);
  if(['beginner','intermediate','advanced'].includes(String(d.competency||'').toLowerCase()))issues.push('competenza generica: descrivere una capacità tecnica osservabile');
  if(!/(impiatt|dispon.*piatt|serv.*piatt)/i.test(d.steps.at(-1)?.action||''))issues.push('manca un ultimo passaggio esplicito di impiattamento');
  const evidence=d.evidence||[],bad=/bonappetit|giallozafferano|cookist|facebook|instagram|tiktok|pinterest/i;
  if(evidence.length<2)issues.push('fonti insufficienti');
  if(evidence.some(e=>bad.test(e.sourceUrl||'')))issues.push('presenza di fonte editoriale o social non ammessa');
  const technical=evidence.filter(e=>!/(sicurezza|scart|guscio rotto|lavaggio|conserv)/i.test(e.claim||''));
  if(!technical.length)issues.push('nessuna fonte sostiene la tecnica centrale');
  if(/conserv|frigorif|entro 24 ore/i.test(d.dplus||''))issues.push('D+1 pesante o dedicato alla conservazione');
  if(/sigill.*amid|frusta.*ris/i.test(all))issues.push('spiegazione o gesto scorretto sul risotto');
  if(/vongol/i.test(`${title} ${context.raw||''}`)){
    if(/cornmeal|farina di mais|semola.*purg/i.test(all+' '+d.shopping.join(' ')))issues.push('semola/cornmeal nella purga non ammessa senza fonte primaria specifica');
    if(/10\s*g\s*\/\s*l/i.test(all))issues.push('acqua della pasta troppo salata rispetto al liquido delle vongole');
    if(/riduc.*(?:metà|1\/2)/i.test(all))issues.push('riduzione del liquido delle vongole a rischio eccesso di sapidità');
    if(!/(reinser|rimett|aggiung).*vongol/i.test(all))issues.push('manca il reinserimento finale delle vongole');
  }
  return [...new Set(issues)];
}
function normalizeDish(d){
  d.closure='Com’è riuscito il risultato rispetto alla predizione tecnica iniziale?';
  d.closureButtons=[['Come previsto','Parzialmente'],['Diverso','Non l’ho cucinato: era una simulazione']];
}

export async function assessReflection(dish,reflection){
  if(!labAvailable())return `Registro la tua osservazione come ipotesi da verificare, non come competenza acquisita.`;
  const evidence=(dish.evidence||[]).map(e=>`${e.status}: ${e.claim} — ${e.sourceTitle}`).join('\n');
  const body={model:process.env.OPENAI_MODEL||'gpt-5-mini',reasoning:{effort:'low'},store:false,instructions:'Sei il revisore tecnico di Tavola. Rispondi in italiano in massimo 90 parole. Valuta davvero l’osservazione dell’utente rispetto alla ricetta e alle evidenze fornite. Distingui ciò che è plausibile, il rischio o limite, e una prova concreta per la prossima volta. Non lodare automaticamente e non inventare fonti.',input:`Piatto: ${dish.name}\nPrincipio: ${dish.principle.term}\nEvidenze:\n${evidence}\nOsservazione utente: ${reflection}`};
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'content-type':'application/json'},body:JSON.stringify(body)});
  if(!response.ok)return 'Registro l’osservazione come ipotesi da verificare: non ho basi sufficienti per approvarla automaticamente.';
  const data=await response.json();return data.output?.flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text||data.output_text||'Osservazione registrata come ipotesi da verificare.';
}
