import {generateLabPlan,generateDifficultyIdeas,labAvailable,assessReflection,answerCookingDoubt,classifyIntent,TECHNIQUE_MAP} from './lab.mjs';
import {renderPlating,platingText} from './platingRender.mjs';

// NOTA: questi tre piatti editoriali (alici, triglia in due varianti) sono gold example
// verificati manualmente (cfr. EVIDENCE.md, Esperimento 1). Da quando il laboratorio
// generativo gestisce ogni richiesta (D-014), non vengono più selezionati automaticamente
// dal motore conversazionale: restano come fixture di riferimento per i test del gate
// editoriale e come possibile fallback futuro se si deciderà di riattivarli quando il
// laboratorio non è disponibile. Lo stato 'clarify_triglia' più sotto è coerentemente
// irraggiungibile allo stato attuale — non è stato rimosso per non eliminare funzionalità
// senza discuterne, cfr. rapporto finale.
const dishes={
  alici:{
    id:'alici',name:'Spaghetti, alici e mollica croccante',competency:'moisture',competencyName:'Gestire umidità e croccantezza',
    principle:{term:'Gestione dell’umidità',rule:'Più a lungo una componente asciutta resta a contatto con una salsa, più acqua assorbe e meno resterà croccante.',prediction:'Se aggiungi la mollica in padella due minuti prima, manterrai il sapore ma perderai parte del contrasto.'},
    shopping:['spaghetti','alici sott’olio','pane asciutto','aglio','peperoncino','prezzemolo o limone'],
    closure:'Com’è venuto il contrasto tra pasta e mollica?',
    closureButtons:[['Molto netto','Abbastanza'],['Poco','Si è ammorbidita']],
    dplus:'Il pane non stava semplicemente sostituendo il formaggio. Nelle cucine domestiche del Sud, il pane raffermo tostato diventava una componente autonoma: portava aroma, assorbiva grasso e creava contrasto. Il gesto di ieri univa economia domestica e controllo dell’umidità.',
    curiosity:'La stessa logica compare in gratin, verdure e secondi con finiture croccanti: cambia il piatto, resta la domanda su quando far incontrare asciutto e umido.',
    steps:[
      {term:'Disidratazione e tostatura',title:'Tosta la mollica',action:'Sbriciola il pane e tostalo con poco olio a fuoco medio. Spostalo in una ciotola appena è asciutto e dorato.',observe:'Il rumore diventa più secco e i pezzi si muovono liberi.',why:'Togliere acqua prima e sviluppare poi gli aromi di tostatura rende più stabile la croccantezza.',help:'Abbassa leggermente il fuoco e muovi il pane. Se scurisce prima di asciugarsi, allarga i pezzi nella padella.'},
      {term:'Estrazione aromatica nel grasso',title:'Costruisci la base',action:'Scalda dolcemente olio, aglio e peperoncino. Aggiungi le alici e lasciale sciogliere senza friggere.',observe:'Il grasso deve fremere appena, non sfrigolare con violenza.',why:'Il calore moderato distribuisce nel grasso gli aromi senza bruciare i residui delle alici.',help:'Abbassa il fuoco: le alici devono sciogliersi nel grasso, non friggere.'},
      {term:'Amido di cottura',title:'Cuoci molto al dente',action:'Sala meno del solito. Conserva una tazza d’acqua e trasferisci la pasta in padella circa due minuti prima del punto desiderato.',observe:'Preleva l’acqua quando è già torbida e ricca di amido.',why:'L’amido disperso nell’acqua aiuta a stabilizzare l’emulsione tra fase acquosa e olio.',help:'Se la pasta è già troppo avanti, trasferiscila subito e termina in padella con pochissima acqua.'},
      {term:'Emulsione e mantecatura',title:'Manteca',action:'Aggiungi poca acqua di cottura e muovi energicamente pasta e padella. Cerca una salsa lucida e aderente, non una pozza.',observe:'Passando il mestolo, il fondo si richiude lentamente.',why:'Movimento e amido aiutano acqua e grasso a restare distribuiti: è la costruzione dell’emulsione.',help:'Non aggiungere altra acqua per 30 secondi. Muovi pasta e padella; se il fondo resta asciutto, aggiungine un solo cucchiaio.'},
      {term:'Gestione dell’umidità',title:'Chiudi al piatto',action:'Distribuisci la pasta e aggiungi la mollica soltanto ora, soprattutto in superficie. Porta subito in tavola.',observe:'La mollica incontra l’umidità il più tardi possibile.',why:'Qui il tempo dell’unione è parte della tecnica e determina la texture finale.',help:'Tieni la mollica fuori dalla padella e aggiungila direttamente sui piatti.'}
    ],
    // D-048: campo strutturato aggiunto retroattivamente ai tre piatti editoriali per coerenza
    // con lo schema del laboratorio generativo, anche se restano fixture non raggiungibili dal
    // motore conversazionale (D-014, nota in cima al file).
    plating:{clockLayout:[{element:'nido di spaghetti',position:'centro',shape:'mucchio'},{element:'mollica croccante',position:'12',shape:'linea'}],sauceStyle:'nessuna',temperature:'piatto tiepido, non caldissimo, per non ammorbidire la mollica',textureNote:'la mollica deve restare croccante fino al primo boccone',finish:'mollica distribuita soprattutto in superficie, non mescolata'}
  },
  triglia_filetti:{
    id:'triglia_filetti',name:'Filetti di triglia in padella, pomodoro crudo e pane aromatico',competency:'delicate_fish',competencyName:'Cuocere un pesce sottile senza asciugarlo',
    principle:{term:'Cottura differenziale',rule:'In un filetto sottile la pelle ha bisogno di calore diretto, mentre la polpa deve riceverne il meno possibile.',prediction:'Se cuoci quasi tutto il tempo dal lato della pelle e giri solo per pochi secondi, la pelle può diventare croccante senza asciugare la polpa.'},
    shopping:['filetti di triglia','pomodori maturi','pane o pangrattato','limone','prezzemolo','olio extravergine'],
    closure:'La pelle era croccante mentre la polpa restava succosa?',
    closureButtons:[['Entrambe','Pelle poco croccante'],['Polpa asciutta','Si è rotta']],
    dplus:'La triglia ha una polpa sottile e delicata: per questo una cottura simmetrica sui due lati raramente è davvero equilibrata. Trattare pelle e polpa come due superfici con bisogni diversi è già progettazione della cottura.',
    curiosity:'La stessa idea vale per molti filetti con pelle: il tempo non si divide automaticamente a metà. Si distribuisce in base al risultato richiesto da ciascun lato.',
    steps:[
      {term:'Controllo dell’acqua superficiale',title:'Asciuga e prepara',action:'Tampona molto bene i filetti, soprattutto la pelle. Sala leggermente solo poco prima della padella.',observe:'La superficie deve apparire opaca e asciutta, non lucida d’acqua.',why:'L’acqua superficiale assorbe energia e produce vapore: finché è presente, ostacola la croccantezza.',help:'Se la pelle è ancora umida, tamponala di nuovo. Non aggiungere farina per nascondere il problema.'},
      {term:'Contrasto acido e aromatico',title:'Prepara il condimento freddo',action:'Taglia il pomodoro, condiscilo con poco sale, limone, prezzemolo e olio. Tienilo separato dal pesce.',observe:'Deve essere fresco e succoso, ma non acquoso sul piatto.',why:'Un condimento freddo e acido contrasta il grasso della triglia senza continuare a cuocerla.',help:'Se il pomodoro rilascia molta acqua, scolalo per un minuto prima di condirlo.'},
      {term:'Tostatura',title:'Tosta il pane aromatico',action:'Tosta poco pane sbriciolato con olio e prezzemolo. Mettilo da parte appena dorato.',observe:'È asciutto e friabile, non intriso d’olio.',why:'La finitura aggiunge una seconda consistenza senza prolungare la cottura del pesce.',help:'Allarga il pane e abbassa il fuoco se colora prima di diventare asciutto.'},
      {term:'Cottura differenziale',title:'Cuoci dalla pelle',action:'Scalda una padella con un velo d’olio. Appoggia i filetti dalla pelle e premili delicatamente per i primi 15 secondi. Cuoci quasi interamente da questo lato.',observe:'La polpa diventa opaca risalendo dai bordi, mentre il centro resta appena traslucido.',why:'La pelle riceve energia sufficiente per diventare croccante; la polpa cuoce soprattutto per conduzione, in modo più dolce.',help:'Se il filetto si incurva, premilo con una paletta solo all’inizio. Se la pelle scurisce subito, riduci il calore.'},
      {term:'Calore residuo',title:'Gira e chiudi',action:'Gira i filetti per 10–20 secondi, poi toglili. Servi con pomodoro e pane senza coprire completamente la pelle.',observe:'La polpa cede leggermente alla pressione e resta lucida all’interno.',why:'Il calore residuo continua la cottura dopo la padella: aspettare il punto finale sul fuoco significa superarlo nel piatto.',help:'Se temi che siano indietro, lasciali riposare un minuto. Non rimetterli subito su calore alto.'}
    ],
    plating:{clockLayout:[{element:'filetti di triglia, pelle in vista',position:'12',shape:'fetta'},{element:'pomodoro crudo condito',position:'6',shape:'mucchio'},{element:'pane aromatico tostato',position:'3',shape:'linea'}],sauceStyle:'nessuna',temperature:'piatto appena tiepido, mai freddo di frigorifero',textureNote:'pelle croccante da non coprire, polpa che deve restare lucida e non seccarsi in attesa',finish:'pane aromatico aggiunto solo al momento, senza coprire la pelle'}
  },
  triglia_intera:{
    id:'triglia_intera',name:'Triglie intere al forno, limone e pangrattato aromatico',competency:'whole_fish',competencyName:'Controllare la cottura di un pesce intero piccolo',
    principle:{term:'Cottura per inerzia',rule:'Un pesce piccolo continua a cuocere dopo essere uscito dal forno; il punto corretto si decide prima che la polpa appaia completamente asciutta.',prediction:'Se lo togli quando la polpa vicino alla lisca è appena opaca e lo lasci riposare, completerà la cottura senza perdere succosità.'},
    shopping:['triglie intere pulite','limone','pane o pangrattato','prezzemolo','aglio facoltativo','olio extravergine'],
    closure:'La polpa si staccava dalla lisca restando umida?',
    closureButtons:[['Sì, nettamente','Era ancora indietro'],['Era asciutta','Cottura irregolare']],
    dplus:'Nei pesci interi la lisca non è soltanto uno scarto: modifica la diffusione del calore e rende la lettura della cottura diversa da quella di un filetto. Il riposo finale completa il lavoro iniziato nel forno.',
    curiosity:'La cottura per inerzia non riguarda solo grandi arrosti. Nei pesci piccoli i tempi sono brevi, ma proprio per questo pochi minuti o un riposo ignorato cambiano molto il risultato.',
    steps:[
      {term:'Preparazione uniforme',title:'Asciuga e condisci',action:'Asciuga bene le triglie dentro e fuori. Sala leggermente e inserisci nel ventre poco prezzemolo e scorza di limone.',observe:'La pelle è asciutta e il ventre non è riempito eccessivamente.',why:'Un ripieno voluminoso rallenterebbe la cottura interna; gli aromi devono profumare, non isolare.',help:'Se sono molto bagnate, tamponale ancora prima di aggiungere olio.'},
      {term:'Tostatura separata',title:'Prepara il pangrattato',action:'Mescola pane, poco olio, prezzemolo e scorza di limone. Tostane una parte in padella e tienila da parte.',observe:'È dorato e asciutto.',why:'La parte aggiunta alla fine resta croccante; quella eventualmente cotta sul pesce assorbe invece i succhi.',help:'Se vuoi vera croccantezza, non mettere tutto il pane sul pesce prima del forno.'},
      {term:'Esposizione al calore',title:'Disponi le triglie',action:'Metti i pesci distanziati su una teglia leggermente unta. Non sovrapporli e non coprirli.',observe:'L’aria calda può circolare attorno a ogni pesce.',why:'Pesci ammassati cuociono con vapore e in modo irregolare.',help:'Usa due teglie se necessario: la distanza conta più della comodità.'},
      {term:'Cottura per inerzia',title:'Cuoci e osserva',action:'Cuoci in forno caldo finché la polpa vicino alla lisca diventa appena opaca. Il tempo varia con peso e forno: controlla presto, senza affidarti solo ai minuti.',observe:'La pinna dorsale offre meno resistenza e la polpa si apre senza apparire asciutta.',why:'Il calore accumulato continua a propagarsi dopo l’uscita dal forno.',help:'Se non conosci peso e temperatura reale del forno, non posso darti un minuto preciso affidabile: controlla visivamente e con una piccola incisione vicino alla lisca.'},
      {term:'Riposo e finitura',title:'Riposa e completa',action:'Lascia riposare due minuti. Aggiungi il pangrattato tostato e poche gocce di limone solo al servizio.',observe:'I succhi restano nella polpa e il pane conserva la sua texture.',why:'Riposo e aggiunta tardiva gestiscono due fenomeni diversi: inerzia termica e migrazione dell’umidità.',help:'Non coprire stretto durante il riposo: ammorbidirai pelle e pane.'}
    ],
    plating:{clockLayout:[{element:'triglie intere',position:'centro',shape:'ventaglio'},{element:'pangrattato tostato',position:'12',shape:'linea'},{element:'spicchio di limone',position:'4',shape:'fetta'}],sauceStyle:'nessuna',temperature:'piatto caldo, servito subito dopo il riposo',textureNote:'pelle e pangrattato devono restare asciutti e croccanti, non a contatto prolungato con i succhi',finish:'limone spremuto solo al momento del servizio, non prima'}
  }
};

const buttons={start:[['💡 Cerco un’idea','🛒 Sto facendo la spesa'],['🍳 Ho gli ingredienti, cuciniamo']],proposal:[['✅ Mi piace','🔄 Altra idea'],['🛒 Prepara la lista','📚 Fonti e scelte']],mode:[['👣 Guidami','📋 Fammi leggere tutto'],['⚡ Solo punti critici']],step:[['✅ Fatto, avanti','❓ Ho un dubbio'],['🔬 Perché?']],dplus:[['✨ Una curiosità in più'],['🧭 Nel mio percorso','Basta così'],['⏰ Cambia orario D+1']],peopleQuick:[['1','2'],['3','4'],['5+']],timeQuick:[['15 min','30 min'],['45 min','1 ora'],['più di un\'ora']]};
const event=(u,type,payload={})=>u.events.push({type,payload,at:new Date().toISOString(),sessionId:u.session?.id||null});
const reply=(text,keyboard=null,extra={})=>({text,keyboard,...extra});
const norm=s=>String(s||'').trim().toLowerCase();

export function newUser(id,name='Tester'){return {id,name,state:'new',context:{people:null,time:null,ingredients:[],constraints:[],intent:null},session:null,pendingDplus:null,competencies:{},techniques:{},events:[],preferences:{dplusTime:'08:30'}}}

// D-050: server.mjs mostra "Sto pensando alla proposta..." prima di chiamare handle() quando
// l'utente è in 'difficulty_choice', perché lì la generazione può richiedere qualche secondo.
// Prima di questa funzione lo faceva incondizionatamente, anche per messaggi che non avrebbero
// mai chiamato il laboratorio (es. un testo non riconosciuto, respinto all'istante con un
// rimando ai tre pulsanti): il risultato era un "sto pensando" seguito da una risposta identica
// a quella precedente, che sembrava un errore. Questa funzione replica solo il sottoinsieme di
// wantsOtherDirections/indice-livello che decide se handle() chiamerà davvero il laboratorio.
// D-051: estesa oltre 'difficulty_choice' (dove era nata in D-050) ai tre altri stati che ora
// possono ricorrere a classifyIntent come fallback (proposal, mode, dplus). Il criterio resta lo
// stesso: vero solo quando il messaggio, in quello stato, farà davvero partire una chiamata di
// rete verso il laboratorio — mai per un messaggio a cui si risponde all'istante.
export function willCallLab(user,text){
  const n=norm(String(text||''));
  if(user.state==='difficulty_choice')return !isIntentChoice(n);
  if(user.state==='proposal')return !isIntentChoice(n)&&!proposalMatchesLexical(n);
  if(user.state==='mode')return !isIntentChoice(n)&&user.session?.mode!=='full'&&!modeMatchesLexical(n);
  if(user.state==='dplus')return !dplusMatchesLexical(n);
  return false;
}

export async function handle(user,input,{source='simulator'}={}){
  const text=String(input.text||input||'').trim(),n=norm(text);
  event(user,'message_received',{source,kind:input.voice?'voice':input.photo?'photo':'text',text});
  // Un capitolo si considera "chiuso" quando l'utente è in attesa del D+1 o lo ha già ricevuto.
  // In questi stati la chat non deve mai restare bloccata: qualunque nuovo messaggio riapre
  // automaticamente un nuovo capitolo, senza richiedere /start (D-021).
  const dormant=user.state==='waiting_dplus'||user.state==='dplus';
  let isDplusFollowup=dormant&&(n.includes('d+1')||n.includes('curiosità')||n.includes('curiosita')||n.includes('percorso')||n.includes('basta cos')||n.includes('cambia orario'));
  // D-051: in stato 'dplus' un testo che non ricalca le parole previste può comunque riferirsi al
  // D+1 corrente formulato diversamente (es. "fammi vedere come sto andando" invece di "percorso"),
  // oppure può essere l'inizio di una richiesta del tutto nuova (D-021: nessun capitolo deve restare
  // bloccato). Chiediamo qui, una sola volta, al laboratorio di distinguere i due casi; se il
  // risultato è una delle quattro azioni valide nello stato dplus lo passiamo al blocco più sotto
  // (user.context._dplusPrecomputedChoice) per non richiamare classifyIntent una seconda volta sullo
  // stesso testo.
  if(user.state==='dplus'&&!isDplusFollowup&&!isIntentChoice(n)){
    const choice=await classifyIntent(text,[
      {key:'curiosity',description:'vuole una curiosità in più su questa esperienza'},
      {key:'percorso',description:'vuole vedere il proprio percorso/la dashboard delle competenze'},
      {key:'cambia_orario',description:'vuole cambiare l\'orario in cui riceve il D+1'},
      {key:'basta',description:'non vuole nulla di più, va bene così'},
      {key:'nuova',description:'sta chiedendo qualcosa di nuovo e diverso, non legato al D+1 di questa esperienza (per esempio vuole cucinare qualcos\'altro)'},
    ]);
    if(choice&&choice!=='nuova'){isDplusFollowup=true;user.context._dplusPrecomputedChoice=choice}
  }

  if(n==='/start'||n==='/reset'||user.state==='new'){
    user.state='locating';user.context={people:null,time:null,ingredients:[],constraints:[],intent:null};user.session=null;event(user,'onboarding_started');
    return reply(`Ciao ${user.name}. Da dove partiamo?`,buttons.start);
  }
  if(dormant&&isIntentChoice(n)){
    user.state='collecting_people';user.context={people:null,time:null,ingredients:[],constraints:[],intent:parseIntent(n)};event(user,'new_chapter_started',{intent:user.context.intent,trigger:'intent_button'});return reply('Per quante persone cuciniamo?',buttons.peopleQuick)
  }
  if(dormant&&!isDplusFollowup){
    user.state='locating';user.context={people:null,time:null,ingredients:[],constraints:[],intent:null};user.session=null;event(user,'new_chapter_started',{intent:null,trigger:'freeform_message'});
    return reply(`Ciao ${user.name}. Da dove partiamo?`,buttons.start);
  }
  if(user.state==='locating'){
    if(!isIntentChoice(n))return reply('Scegli il punto di partenza: un’idea, la spesa oppure cucinare con ciò che hai.',buttons.start);user.context.intent=parseIntent(n);user.state='collecting_people';return reply('Per quante persone cuciniamo?',buttons.peopleQuick);
  }
  // Raccolta contesto (D-027): persone e tempo hanno tasti rapidi dedicati (collecting_people,
  // collecting_time); l'ingrediente resta l'ultima domanda, a testo libero, e mantiene il nome
  // di stato 'collecting_context' per minimizzare l'impatto sul resto del codice che vi fa
  // riferimento (test, eventi, dashboard). In ciascuno dei tre stati un solo messaggio che
  // contenga già tutto (persone, tempo e ingrediente insieme) salta direttamente alle tre
  // direzioni gastronomiche tramite tryOneShot — la scorciatoia resta sempre disponibile.
  if(user.state==='confirm_restart'){
    const pending=user.context.pendingRestart||{};
    const flat=n.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    if(/\bsi\b/.test(flat)||flat.includes('conferm')||flat.includes('certo')||flat.includes('ricomincia')){user.context.intent=pending.intent||null;user.context.people=null;user.context.time=null;user.context.pendingRestart=null;user.state='collecting_people';event(user,'intent_changed',{intent:user.context.intent,trigger:'confirmed_restart'});return reply('Per quante persone cuciniamo?',buttons.peopleQuick)}
    if(/\bno\b/.test(flat)||flat.includes('continu')||flat.includes('annull')||flat.includes('resta')||flat.includes('lascia')){user.state=pending.fromState||'collecting_context';user.context.pendingRestart=null;event(user,'restart_cancelled',{returnedTo:user.state});return reply('Va bene, continuiamo da dove eravamo.')}
    return reply('Non ho capito: confermi di voler ricominciare da capo? Rispondi sì o no.',[['✅ Sì, ricomincia','↩️ No, continua']])
  }
  if(user.state==='collecting_people'){
    if(isIntentChoice(n))return askRestartConfirmation(user,n,'collecting_people')
    const shortcut=await tryOneShot(user,text,n);if(shortcut)return shortcut;
    const people=parsePeopleLoose(text);
    if(!people){event(user,'people_unrecognized',{text});return reply('Non ho capito il numero di persone: scegli un tasto oppure scrivimelo (es. “3 persone”).',buttons.peopleQuick)}
    user.context.people=people;user.state='collecting_time';event(user,'people_captured',{people});
    return reply('Quanto tempo hai a disposizione?',buttons.timeQuick);
  }
  if(user.state==='collecting_time'){
    if(isIntentChoice(n))return askRestartConfirmation(user,n,'collecting_time')
    if(detectFieldCorrection(n)==='people'){user.context.people=null;user.state='collecting_people';event(user,'field_correction',{field:'people',fromState:'collecting_time'});return reply('Va bene, correggiamo: per quante persone cuciniamo?',buttons.peopleQuick)}
    const shortcut=await tryOneShot(user,text,n);if(shortcut)return shortcut;
    const time=parseTimeLoose(text);
    if(!time){event(user,'time_unrecognized',{text});return reply('Non ho capito il tempo disponibile: scegli un tasto oppure scrivimelo (es. “45 minuti”).',buttons.timeQuick)}
    user.context.time=time;user.state='collecting_context';event(user,'time_captured',{time});
    return reply(ingredientPrompt(user.context.intent));
  }
  if(user.state==='collecting_context'){
    if(isIntentChoice(n))return askRestartConfirmation(user,n,'collecting_context')
    const correction=detectFieldCorrection(n);
    if(correction==='people'){user.context.people=null;user.state='collecting_people';event(user,'field_correction',{field:'people',fromState:'collecting_context'});return reply('Va bene, correggiamo: per quante persone cuciniamo?',buttons.peopleQuick)}
    if(correction==='time'){user.context.time=null;user.state='collecting_time';event(user,'field_correction',{field:'time',fromState:'collecting_context'});return reply('Va bene, correggiamo: quanto tempo hai a disposizione?',buttons.timeQuick)}
    if(!user.context.people)user.context.people=parsePeopleLoose(text);
    if(!user.context.time)user.context.time=parseTimeLoose(text);
    user.context.raw=text;user.context.ingredients=extractIngredients(n);
    event(user,'context_captured',{...user.context});
    const missing=[];if(!user.context.people)missing.push('per quante persone');if(!user.context.time)missing.push('quanto tempo hai');if(!hasFoodRequest(text))missing.push('ingrediente o piatto desiderato');
    if(missing.length){
      event(user,'context_missing',{missing});
      // D-049: se il messaggio era una foto/vocale senza testo utile, il generico "scrivimelo
      // pure" è fuorviante (l'utente pensa di averlo già detto mandando la foto). La trascrizione
      // e l'analisi immagine non sono ancora implementate (EVIDENCE.md): meglio dirlo chiaramente.
      if(text==='[contenuto multimediale]')return reply(`Non riesco ancora ad analizzare foto o vocali senza descrizione. Mi manca ${missing.join(', ')}: scrivimi a parole cosa hai (es. "salmone", "melanzane, 30 minuti").`);
      return reply(`Mi manca ${missing.join(', ')}. Scrivimelo pure liberamente, anche a voce.`)
    }
    return await proposeDifficultyMenu(user);
  }
  if(user.state==='difficulty_choice'){
    if(isIntentChoice(n))return askRestartConfirmation(user,n,'difficulty_choice')
    const selectIdea=(idx)=>{const idea=user.context.difficultyIdeas[idx];user.context.difficulty=idea.level;user.context.selectedIdea=idea;event(user,'difficulty_selected',{level:idea.level,name:idea.name});return proposeFromLab(user,`Livello scelto: ${idea.level}. Sviluppa: ${idea.name}`)};
    const regenerate=()=>{const previous=(user.context.difficultyIdeas||[]).map(x=>x.name).filter(Boolean);event(user,'difficulty_menu_regeneration_requested',{text,previous});user.context.raw=`${user.context.raw} — le tre proposte precedenti non convincevano (${previous.join(', ')}). Proponi tre direzioni davvero diverse, non varianti delle stesse.`;return proposeDifficultyMenu(user)};
    const index=n.includes('semplice')?0:n.includes('tecnico')?1:n.includes('gourmet')?2:-1;
    if(index>=0)return await selectIdea(index);
    if(wantsOtherDirections(n))return await regenerate();
    // D-051: le regole lessicali sopra non hanno riconosciuto nulla — prima di arrenderci al
    // messaggio generico, chiediamo al laboratorio di interpretare l'intento tra le sole quattro
    // opzioni valide in questo stato (mai testo libero, cfr. commento su classifyIntent).
    const choice=await classifyIntent(text,[
      {key:'simple',description:'sceglie la prima direzione proposta, quella "semplice curato"'},
      {key:'technical',description:'sceglie la seconda direzione proposta, quella "tecnico"'},
      {key:'gourmet',description:'sceglie la terza direzione proposta, quella "gourmet"'},
      {key:'other',description:"nessuna delle tre proposte convince così com'è, ne vuole altre diverse"},
    ]);
    event(user,'difficulty_intent_classified',{text,choice});
    if(choice==='simple')return await selectIdea(0);
    if(choice==='technical')return await selectIdea(1);
    if(choice==='gourmet')return await selectIdea(2);
    if(choice==='other')return await regenerate();
    return reply('Scegli una delle tre direzioni: semplice curato, tecnico oppure gourmet. Se non ti convincono, scrivimi "altre proposte" e ne preparo tre diverse.',difficultyButtons(user.context.difficultyIdeas));
  }
  if(user.state==='lab_connection_required'){
    return reply('Per attivare il laboratorio generativo bisogna collegare al server una chiave OpenAI API. Non incollarla nella chat: va salvata come variabile d’ambiente OPENAI_API_KEY.');
  }
  if(user.state==='lab_clarification'){
    if(isIntentChoice(n))return askRestartConfirmation(user,n,'lab_clarification')
    user.context.labFollowup=text;user.context.people=parsePeople(text)||user.context.people;user.context.time=parseTime(text)||user.context.time;user.context.raw=[user.context.raw,text].filter(Boolean).join(' — ');event(user,'lab_clarification_answered',{text,people:user.context.people,time:user.context.time});return await proposeFromLab(user,text);
  }
  if(user.state==='clarify_triglia'){
    if(n.includes('filetti'))return propose(user,'triglia_filetti');
    if(n.includes('intere'))return propose(user,'triglia_intera');
    user.state='clarify_triglia';return reply('Quando le scegli o le compri, guarda se il pesce è intero oppure se trovi due filetti separati. Posso aspettare questa informazione prima di proporti una cottura.',[['🐟 Sono intere','🔪 Sono filetti']]);
  }
  if(user.state==='proposal'){
    if(isIntentChoice(n))return askRestartConfirmation(user,n,'proposal')
    const d=currentDish(user);
    const openFonti=()=>{const rows=(d.evidence||[]).map(e=>`**${e.status}** — ${e.claim}\n${e.sourceTitle}: ${e.sourceUrl}`).join('\n\n');event(user,'sources_opened',{dishId:d.id});return reply(rows||'Questa esperienza editoriale non ha ancora una bibliografia esposta.',buttons.proposal,{parseMode:'Markdown'})};
    const openLista=()=>{event(user,'shopping_list_requested');return reply(`Lista essenziale:\n${d.shopping.map(x=>'• '+x).join('\n')}\n\nQuando hai tutto, scrivi “ci sono”.`,[['🏠 Ci sono']])};
    const rejectProposal=()=>{user.state='proposal_feedback';event(user,'proposal_rejected',{dishId:d.id});return reply('Posso cambiare direzione, ma prima dimmi cosa non ti convince: tecnica, tempo, ingredienti o gusto. Non genero un’alternativa casuale.')};
    const acceptProposal=()=>{user.state='mode';event(user,'proposal_accepted',{dishId:d.id});return reply('Come vuoi cucinare stasera?',buttons.mode)};
    if(proposalMatchesLexical(n)){
      if(n.includes('fonti')||n.includes('scelte'))return openFonti();
      if(n.includes('lista'))return openLista();
      if(n.includes('altra'))return rejectProposal();
      return acceptProposal();
    }
    // D-051: nessuna delle frasi previste ha matchato — prima del silenzio (che lasciava
    // proseguire il messaggio fino al fallback generico finale, disorientante a metà proposta),
    // chiediamo al laboratorio quale delle quattro azioni valide qui corrisponde all'intento.
    const choice=await classifyIntent(text,[
      {key:'fonti',description:'vuole vedere le fonti e le scelte tecniche dietro la proposta'},
      {key:'lista',description:'vuole la lista della spesa per questo piatto'},
      {key:'altra',description:'questa proposta non convince, ne vuole un\'altra'},
      {key:'piace',description:'la proposta va bene, vuole procedere / ha già tutti gli ingredienti'},
    ]);
    event(user,'proposal_intent_classified',{text,choice});
    if(choice==='fonti')return openFonti();
    if(choice==='lista')return openLista();
    if(choice==='altra')return rejectProposal();
    if(choice==='piace')return acceptProposal();
    event(user,'proposal_intent_unrecognized',{text});
    return reply('Non ho capito se questa proposta ti convince: dimmelo, oppure chiedimi la lista della spesa, le fonti, o un\'altra idea.',buttons.proposal);
  }
  if(user.state==='proposal_feedback'){
    // D-037: "Altra idea" chiedeva il motivo del rifiuto ma non riportava mai lo stato fuori da
    // 'proposal', quindi ogni messaggio successivo cadeva nel fallback generico finale e la
    // conversazione sembrava bloccata sulla stessa risposta. Questo stato intermedio raccoglie
    // il motivo, lo integra nel contesto e rigenera davvero tre nuove direzioni (D-019).
    if(isIntentChoice(n))return askRestartConfirmation(user,n,'proposal_feedback')
    user.context.raw=`${user.context.raw} — non mi convince: ${text}`;user.context.difficultyIdeas=null;user.context.selectedIdea=null;user.context.difficulty=null;
    event(user,'proposal_feedback_captured',{text});
    return await proposeDifficultyMenu(user);
  }
  if(user.state==='mode'){
    if(isIntentChoice(n))return askRestartConfirmation(user,n,'mode')
    if(user.session.mode==='full'){user.state='cooking';return cookingReply(user)}
    const d=currentDish(user);
    let mode=n.includes('leggere')?'full':n.includes('critici')?'essential':n.includes('guidami')||n.includes('guida')?'guided':null;
    if(!mode){
      // D-051: prima nessun messaggio non riconosciuto veniva mai fermato qui — finiva sempre,
      // silenziosamente, in modalità guidata, anche quando l'utente aveva chiaramente chiesto di
      // leggere tutto o di vedere solo i punti critici con parole diverse da quelle previste.
      const choice=await classifyIntent(text,[
        {key:'full',description:'vuole leggere subito tutta la ricetta, tutti i passaggi in una volta'},
        {key:'essential',description:'vuole solo i punti critici, senza essere guidato passo per passo'},
        {key:'guided',description:'vuole essere guidato passo dopo passo durante la cucina'},
      ]);
      event(user,'mode_intent_classified',{text,choice});
      mode=choice==='full'?'full':choice==='essential'?'essential':'guided';
    }
    user.session.mode=mode;event(user,'guidance_mode_selected',{mode:user.session.mode});
    if(user.session.mode==='full')return reply(d.steps.map((s,i)=>`**${i+1}. ${s.title}**\n${s.action}`).join('\n\n'),[['👣 Inizia la guida']],{parseMode:'Markdown'});
    user.state='cooking';return cookingReply(user);
  }
  if(user.state==='cooking'){
    if(isIntentChoice(n))return askRestartConfirmation(user,n,'cooking')
    const d=currentDish(user),s=d.steps[user.session.step];
    if(n.includes('perché')||n.includes('perche')){event(user,'explanation_opened',{step:user.session.step});return reply(`**${s.term}**\n${s.why}`,buttons.step,{parseMode:'Markdown'})}
    if(n.includes('dubbio')){event(user,'help_requested',{step:user.session.step});return reply(s.help,[['✅ Risolto','🆘 Non è cambiato'],['🔬 Perché?']])}
    if(n.includes('non è cambiato')||n.includes('non e cambiato'))return reply('Descrivimi ciò che vedi oppure manda una foto. Se mancano elementi sufficienti, ti dirò esplicitamente cosa non posso determinare.');
    if(n.includes('risolto'))return reply('Bene. Riprendiamo dal passaggio corrente.',buttons.step);
    if(n.includes('avanti')||n.includes('inizia')){const now=Date.now(),elapsed=user.session.lastStepAt?Math.round((now-user.session.lastStepAt)/1000):null;user.session.lastStepAt=now;event(user,'step_completed',{step:user.session.step,elapsedSeconds:elapsed,pace:elapsed!==null&&elapsed<15?'rapid_test':'plausible'});if(user.session.step===d.steps.length-1){user.state='closure';event(user,'cooking_completed');return reply(d.closure,d.closureButtons)}user.session.step++;return cookingReply(user)}
    event(user,'doubt_asked',{step:user.session.step});const doubtAnswer=await answerCookingDoubt(d,s,text);event(user,'doubt_answered',{step:user.session.step});return reply(doubtAnswer,[['✅ Risolto','🆘 Non è cambiato'],['🔬 Perché?']]);
  }
  if(user.state==='closure'){user.session.answers.result=text;user.session.isSimulation=n.includes('simulazione')||n.includes('non l’ho cucinato')||n.includes('non l ho cucinato');user.state='reflection';event(user,'result_reported',{answer:text,isSimulation:user.session.isSimulation});return reply(user.session.isSimulation?'Questa prova sarà registrata come simulazione dell’interfaccia, non come esperienza culinaria. Quale punto della proposta cambieresti?':'Una sola cosa: cosa rifaresti uguale o cambieresti?')}
  if(user.state==='reflection'){
    const d=currentDish(user);user.session.answers.reflection=text;user.session.completedAt=new Date().toISOString();const rapid=user.events.filter(e=>e.sessionId===user.session.id&&e.type==='step_completed').some(e=>e.payload.pace==='rapid_test');user.session.isSimulation=user.session.isSimulation||rapid;const c=user.competencies[d.competency]??={name:d.competencyName,status:'non_osservato',evidence:[]};if(!user.session.isSimulation){c.status='introdotto';c.evidence.push({type:'exposure_and_report',sessionId:user.session.id,at:user.session.completedAt})}else c.evidence.push({type:'interface_simulation',sessionId:user.session.id,at:user.session.completedAt});
    // D-028: territorio fisso delle tecniche osservate, separato dalla competenza libera per
    // piatto (sopra). Conta solo le sessioni non simulate (coerente con D-016); una sessione
    // simulata resta comunque visibile in dashboard come "vista solo in simulazione".
    if(d.techniqueMapId){const t=user.techniques[d.techniqueMapId]??={id:d.techniqueMapId,note:null,count:0,firstAt:null,lastAt:null,simulatedOnly:true};if(d.techniqueMapId==='altro'&&d.techniqueMapNote)t.note=d.techniqueMapNote;if(!user.session.isSimulation){t.count++;t.firstAt=t.firstAt||user.session.completedAt;t.lastAt=user.session.completedAt;t.simulatedOnly=false}}
    user.state='waiting_dplus';user.session.dplusDueAt=nextDueIso(user);user.pendingDplus={dueAt:user.session.dplusDueAt,dishId:d.id,text:d.dplus,curiosity:d.curiosity,sessionId:user.session.id};event(user,'session_completed',{dishId:d.id,reflection:text,isSimulation:user.session.isSimulation,dplusDueAt:user.session.dplusDueAt});const assessment=await assessReflection(d,text);event(user,'reflection_assessed',{assessment});
    return reply(`${assessment}\n\n${user.session.isSimulation?'Sessione registrata come *simulazione*: non aggiorna la competenza.':'Ho registrato il principio come *introdotto*, non come acquisito.'}\n\nIl D+1 arriverà domattina. Questo capitolo è chiuso: quando vuoi iniziarne un altro, dimmi semplicemente dove sei.`,buttons.start,{parseMode:'Markdown'});
  }
  if(user.state==='waiting_dplus'&&n.includes('d+1'))return dplus(user);
  if(user.state==='dplus'){
    const d=currentDish(user);
    const openCuriosity=()=>{event(user,'dplus_curiosity_opened',{dishId:d?.id});return reply(d?.curiosity||'Nessuna curiosità aggiuntiva disponibile per questa esperienza.',buttons.dplus)};
    const openPercorso=()=>reply('Apri la dashboard: /dashboard',[['🧭 Apri dashboard']]);
    const startTimeChange=()=>{user.state='awaiting_dplus_time';event(user,'dplus_time_change_started',{});return reply('A che ora preferisci ricevere il prossimo D+1? Scrivimi un orario, ad esempio "8:00" oppure "alle 9".')};
    if(dplusMatchesLexical(n)){
      if(n.includes('curiosità')||n.includes('curiosita'))return openCuriosity();
      if(n.includes('percorso'))return openPercorso();
      return startTimeChange();
    }
    // D-051: prima qualunque testo non riconosciuto veniva silenziosamente trattato come "basta
    // così" — corretto per un vero "no grazie", fuorviante se l'utente aveva chiesto la stessa
    // cosa con parole diverse (es. "fammi vedere come sto andando" invece di "percorso"). Se la
    // classificazione è già stata fatta più sopra in handle() (per decidere se restava un
    // "followup" del D+1 o l'inizio di un capitolo nuovo), riusiamo quel risultato invece di
    // richiamare classifyIntent una seconda volta sullo stesso testo.
    const precomputed=user.context._dplusPrecomputedChoice;
    if(precomputed!==undefined)delete user.context._dplusPrecomputedChoice;
    const choice=precomputed!==undefined?precomputed:await classifyIntent(text,[
      {key:'curiosity',description:'vuole una curiosità in più su questa esperienza'},
      {key:'percorso',description:'vuole vedere il proprio percorso/la dashboard delle competenze'},
      {key:'cambia_orario',description:'vuole cambiare l\'orario in cui riceve il D+1'},
      {key:'basta',description:'non vuole nulla di più, va bene così'},
    ]);
    event(user,'dplus_intent_classified',{text,choice});
    if(choice==='curiosity')return openCuriosity();
    if(choice==='percorso')return openPercorso();
    if(choice==='cambia_orario')return startTimeChange();
    return reply('Perfetto. Nessun compito per oggi.')
  }
  if(user.state==='awaiting_dplus_time'){
    const t=parseClockTime(text);
    if(!t){event(user,'dplus_time_change_failed',{text});return reply('Non ho riconosciuto l\'orario. Prova con un formato come "8:00" oppure "alle 9".')}
    user.preferences=user.preferences||{};user.preferences.dplusTime=t;user.state='dplus';event(user,'dplus_time_changed',{time:t});
    return reply(`Fatto: il prossimo D+1 arriverà verso le ${t}.`,buttons.dplus);
  }
  return reply('Dimmi dove sei e cosa stai cercando di fare: scegliere la cena, fare la spesa, cucinare o risolvere un problema.');
}

function propose(user,dishId,dishOverride=null){const d=dishOverride||dishes[dishId];user.state='proposal';user.session={id:crypto.randomUUID(),dishId:d.id,generatedDish:dishOverride||null,principle:d.competency,stepsTotal:d.steps.length,step:0,startedAt:new Date().toISOString(),lastStepAt:null,mode:null,answers:{},isSimulation:false};event(user,'proposal_created',{dishId:d.id,source:dishOverride?'generative_lab':'editorial'});return reply(`*${d.name}*\nTecnica: ${d.principle.term}`,buttons.proposal,{parseMode:'Markdown'})}
// D-049: riassunto in linguaggio naturale delle tecniche già osservate per questo utente
// (user.techniques, popolato in 'reflection' — territorio fisso D-028), passato al laboratorio
// perché il campo 'focus' di ogni direzione sia davvero personalizzato e non un testo generico.
// Solo le sessioni non simulate contano (stesso criterio già usato altrove, D-016): una prova
// dichiarata come simulazione non deve far credere al laboratorio che l'utente sappia già fare
// qualcosa che non ha davvero praticato.
function techniqueHistoryNote(user){
  const seen=Object.values(user.techniques||{}).filter(t=>!t.simulatedOnly&&t.count>0);
  if(!seen.length)return 'Storia dell\'utente: nessuna tecnica ancora osservata su Tavola. Ogni direzione proposta sarebbe una prima esposizione.';
  const labelOf=id=>TECHNIQUE_MAP.find(t=>t.id===id)?.label||id;
  const list=seen.map(t=>`${labelOf(t.id)} (${t.count} volta/e)`).join(', ');
  return `Storia dell'utente: tecniche già praticate su Tavola — ${list}. Se una di queste tre direzioni usa una di queste tecniche, il focus deve proporre un affinamento o una variazione, non ripetere la prima esposizione.`;
}
async function proposeDifficultyMenu(user){
  if(!labAvailable()){user.state='lab_connection_required';event(user,'lab_connection_required');return reply('Il laboratorio non è collegato. Apri la configurazione per attivare le tre direzioni gastronomiche.',[['⚙️ Come collegarlo?']])}
  try{const ideas=await generateDifficultyIdeas(user.context,techniqueHistoryNote(user));user.context.difficultyIdeas=ideas;user.state='difficulty_choice';event(user,'difficulty_menu_generated',{ideas:ideas.map(x=>({level:x.level,name:x.name}))});const labels=['Semplice curato','Tecnico','Gourmet'];return reply(`Tre direzioni possibili:\n\n${ideas.map((x,i)=>`**${i+1}. ${labels[i]} — ${x.name}**\n${x.description}\n_Tecnica: ${x.principle}_\n_Focus: ${x.focus}_`).join('\n\n')}\n\nQuale vuoi sviluppare?`,difficultyButtons(ideas),{parseMode:'Markdown'})}catch(error){event(user,'difficulty_menu_failed',{message:error.message.slice(0,200)});user.state='collecting_context';return reply('Non sono riuscito a costruire tre direzioni abbastanza distinte. Riprova tra poco: non ti propongo alternative riempitive.')}
}
function difficultyButtons(ideas){return ideas.map((x,i)=>[[`${i===0?'🌿':i===1?'🔬':'✨'} ${i===0?'Semplice curato':i===1?'Tecnico':'Gourmet'} — ${x.name}`]]).flat()}
async function proposeFromLab(user,followup=''){
  if(!labAvailable()){user.state='lab_connection_required';event(user,'lab_connection_required');return reply('L’ingrediente è valido. Il laboratorio generativo però non è ancora collegato al modello: non lo chiamerò “non supportato” e non lo sostituirò con un’altra ricetta. Serve collegare la chiave API per progettare davvero questa cena.',[['⚙️ Come collegarlo?']]);}
  try{
    const plan=await generateLabPlan(user.context,followup);event(user,'lab_plan_generated',{kind:plan.kind});
    if(plan.kind==='clarification'){user.state='lab_clarification';return reply(plan.question,[plan.options])}
    return propose(user,plan.dish.id,plan.dish);
  }catch(error){
    user.state='collecting_context';
    if(error.message.startsWith('EDITORIAL_GATE_FAILED:')){
      const issues=error.issues||error.message.slice('EDITORIAL_GATE_FAILED:'.length).split(' | ');
      event(user,'editorial_gate_rejected',{issues});
      if(user.context.difficultyIdeas){
        user.state='difficulty_choice';
        return reply(`Ho respinto la proposta perché non superava il controllo gastronomico: ${issues.join('; ')} Puoi scegliere un'altra delle tre direzioni, oppure scrivere un ingrediente diverso per ricominciare.`, difficultyButtons(user.context.difficultyIdeas), {parseMode:'Markdown'});
      }
      return reply(`Ho respinto la proposta perché non superava il controllo gastronomico: ${issues.join('; ')}. Non te la presento come ricetta affidabile.`);
    }
    event(user,'lab_generation_failed',{message:error.message.slice(0,500)});
    return reply('Il laboratorio non ha completato la proposta. Non improvviso una risposta incompleta: riprova tra poco o riformula ingredienti e vincoli.');
  }
}
function currentDish(user){return user.session?.generatedDish||dishes[user.session?.dishId||'alici']}
function cookingReply(user){
  const d=currentDish(user),i=user.session.step,s=d.steps[i];event(user,'step_shown',{step:i,mode:user.session.mode});
  const isLastStep=i===d.steps.length-1,isCritical=isLastStep||norm(s.term)===norm(d.principle.term);
  // D-048: l'ultimo passaggio è sempre l'impiattamento (D-020). Se il piatto ha uno schema
  // strutturato (plating), qui viene allegato sia come immagine (schema deterministico a regole,
  // non generata da un modello) sia come testo, indipendentemente dalla modalità essenziale —
  // è il passaggio critico per definizione, non va abbreviato.
  const platingExtra=isLastStep&&d.plating?{photo:renderPlating(d.plating),photoCaption:platingText(d.plating)}:{};
  if(user.session.mode==='essential'&&!isCritical)return reply(`**${i+1}/${d.steps.length} — ${s.title}**\n${s.action}`,buttons.step,{parseMode:'Markdown'});
  const base=`**${i+1}/${d.steps.length} — ${s.title}**\n${s.action}\n\n👁 **Osserva:** ${s.observe}`;
  return reply(base,buttons.step,{parseMode:'Markdown',...platingExtra});
}
function parsePeople(text){return text.match(/\b([1-9]\d?)\s*(persone|persona|commensali)\b/i)?.[1]||null}
function parseTime(text){const hours=text.match(/\b(\d+(?:[.,]\d+)?)\s*(ora|ore|oretta)\b/i)?.[1];if(hours)return String(Math.round(parseFloat(hours.replace(',','.'))*60));return text.match(/\b(\d{1,3})\s*(min|minuti)\b/i)?.[1]||null}
// Parser "morbidi" (D-027): riconoscono anche le etichette dei tasti rapidi (persone: 1/2/3/4/5+;
// tempo: 15 min/30 min/45 min/1 ora/più di un'ora) oltre a tutto ciò che i parser rigorosi
// sopra già riconoscevano nel testo libero. "5+" e "più di un'ora" non hanno un numero
// esplicito nel testo del tasto: mappiamo il primo su 5 persone e il secondo su 90 minuti
// come valore rappresentativo, coerente con l'uso di context.time come minuti interi nel
// laboratorio generativo (core/lab.mjs).
function parsePeopleLoose(text){const raw=String(text||'').trim();if(/^5\s*\+$/.test(raw))return '5';if(/^[1-4]$/.test(raw))return raw;return parsePeople(text)}
function parseTimeLoose(text){const raw=String(text||'');if(/pi[uù]\s*di\s*un.?ora/i.test(raw))return '90';return parseTime(text)}
function extractIngredients(n){const found=[];if(n.includes('trigli'))found.push('triglia');if(n.includes('alici'))found.push('alici');if(n.includes('acciugh'))found.push('acciughe');return found}
// D-050: in 'difficulty_choice' un messaggio che non nomina uno dei tre livelli veniva trattato
// come input non valido e ributtava all'utente le STESSE tre proposte già mostrate, senza alcun
// tentativo di capire cosa stesse chiedendo (evidenza reale su Telegram: "dammi altre proposte"
// ha prodotto "Sto pensando alla proposta..." seguito dal messaggio identico a poco prima). Questo
// distingue una vera richiesta di alternative — che deve rigenerare tre direzioni nuove, non
// ripetere le stesse — da isIntentChoice (che invece abbandona il piatto e ricomincia da capo).
function wantsOtherDirections(n){
  if(n.includes('altr')&&(n.includes('propost')||n.includes('idee')||n.includes('opzion')||n.includes('direzion')))return true;
  if(n.includes('non mi piac')||n.includes('non mi convinc')||n.includes('non va bene')||n.includes('nessuna'))return true;
  return false;
}
// D-051: predicati di puro riconoscimento lessicale, condivisi tra il dispatch in handle() (dove
// decidono se agire subito o passare la mano a classifyIntent) e willCallLab() in server.mjs
// (dove decidono se mostrare "sto pensando" prima di una vera chiamata al laboratorio). Tenerli
// come funzioni singole invece di ripetere le stesse condizioni in due punti evita che i due usi
// finiscano per disallinearsi nel tempo.
function proposalMatchesLexical(n){return n.includes('fonti')||n.includes('scelte')||n.includes('lista')||n.includes('altra')||n.includes('piace')||n.includes('ci sono')}
function modeMatchesLexical(n){return n.includes('leggere')||n.includes('critici')||n.includes('guidami')||n.includes('guida')}
function dplusMatchesLexical(n){return n.includes('curiosità')||n.includes('curiosita')||n.includes('percorso')||n.includes('cambia orario')}
function isIntentChoice(n){if(n.includes('cerco un')||n.includes('facendo la spesa')||n.includes('ingredienti, cuciniamo')||n.includes('ingredienti cuciniamo'))return true;if(n.includes('nuova richiesta')||n.includes('altra richiesta')||n.includes('resett'))return true;if(n.includes('ricominc')||n.includes('da capo')||n.includes('ripart'))return true;if((n.includes('cambi')||n.includes('nuov')||n.includes('altra')||n.includes('altro'))&&(n.includes('ricetta')||n.includes('piatto')))return true;return false}
// Correzione di un singolo dato già raccolto (persone o tempo), distinta da isIntentChoice:
// lì l'utente vuole abbandonare il piatto e ricominciare da capo (con conferma, D-036/D-037);
// qui vuole solo correggere un valore sbagliato senza perdere il resto del contesto già dato.
// Evidenza: un tester ha scritto "ho sbagliato il numero di persone" mentre il sistema chiedeva
// il tempo — non veniva riconosciuto né come scelta di tasto né come intento di riavvio, quindi
// il messaggio cadeva nel parsing del tempo, falliva, e il sistema tornava a chiedere il tempo
// all'infinito senza mai lasciare correggere le persone.
function detectFieldCorrection(n){
  const flat=n.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(!(/sbagliat|corregg|modific|cambi/.test(flat)))return null;
  const wantsPeople=/person|commensal/.test(flat);
  const wantsTime=/\btempo\b|minut|\bora\b|\bore\b/.test(flat);
  if(wantsPeople&&!wantsTime)return 'people';
  if(wantsTime&&!wantsPeople)return 'time';
  return null;
}
function askRestartConfirmation(user,n,fromState){user.context.pendingRestart={intent:parseIntent(n),fromState};user.state='confirm_restart';event(user,'restart_confirmation_asked',{fromState});return reply('Sei sicuro di voler ricominciare? Il piatto in corso andrà perso.',[['✅ Sì, ricomincia','↩️ No, continua']])}
function parseIntent(n){return n.includes('spesa')?'shopping':n.includes('cuciniamo')?'cook':'idea'}
// Con i tasti rapidi (D-027) persone e tempo hanno domande proprie (vedi handle()); questa
// prompt resta solo per l'ultima domanda, sempre a testo libero per non ridurre l'ampiezza
// degli ingredienti a un menu chiuso (D-014).
function ingredientPrompt(intent){return intent==='shopping'?'Quali ingredienti stai valutando al supermercato? Puoi scriverlo o usare il vocale.':intent==='cook'?'Quali ingredienti hai già, o quale piatto vorresti fare? Puoi scriverlo o usare il vocale.':'Quale ingrediente o piatto vorresti esplorare? Puoi scriverlo o usare il vocale.'}
// Scorciatoia "one-shot" (D-027): se un solo messaggio — anche dettato tutto insieme in auto
// o al supermercato — contiene già persone, tempo e ingrediente, si salta direttamente alle
// tre direzioni gastronomiche, senza obbligare comunque a passare dai singoli tasti. Usa i
// valori già raccolti nel contesto quando il messaggio corrente non li ripete (es. in
// collecting_time, dove le persone sono già note dal passaggio precedente).
async function tryOneShot(user,text,n){
  const people=parsePeopleLoose(text)||user.context.people;
  const time=parseTimeLoose(text)||user.context.time;
  if(!people||!time||!hasFoodRequest(text))return null;
  user.context.people=people;user.context.time=time;user.context.raw=text;user.context.ingredients=extractIngredients(n);
  event(user,'context_captured',{...user.context,source:'one_shot'});
  return await proposeDifficultyMenu(user);
}
// D-049: '[contenuto multimediale]' è il testo segnaposto che server.mjs usa quando un messaggio
// Telegram è una foto/vocale senza didascalia (trascrizione e analisi immagine non sono ancora
// implementate, cfr. EVIDENCE.md). Prima di questa correzione il segnaposto superava comunque il
// controllo (le parole "contenuto" e "multimediale" hanno 4+ lettere), quindi un input privo di
// un vero ingrediente arrivava al laboratorio, che — non avendo un modo di chiedere chiarimenti
// nello schema delle tre direzioni — riempiva il campo principle con testo di richiesta di
// chiarimento invece di una vera tecnica. Qui il segnaposto (e in generale qualunque testo tra
// parentesi quadre, mai scritto da un utente reale) viene rimosso prima del controllo.
function hasFoodRequest(text){return /[a-zà-ù]{4,}/i.test(String(text).replace(/\[[^\]]*\]/g,'').replace(/persone?|commensali|minuti?|oretta|ore|tempo|preparazione|ingrediente|principale|voglio|vorrei|fare|usare/gi,''))}
// Fascia oraria del D+1 (Fase 1, item "Programmare il D+1 in una fascia scelta dall'utente"):
// per scelta esplicita del progettista, l'utente indica un orario libero (es. "8:00" o "alle 9"),
// interpretato da parseClockTime; il valore scelto è una preferenza permanente (user.preferences.dplusTime),
// non legata a una singola sessione. Il default resta 08:30, invariato rispetto al comportamento precedente.
function nextDueIso(user){const raw=String(user?.preferences?.dplusTime||'08:30');const [h,mi]=raw.split(':').map(Number);const d=new Date();d.setDate(d.getDate()+1);d.setHours(h,mi||0,0,0);return d.toISOString()}
// Riconosce un orario libero scritto dall'utente (non una durata: vedi invece parseTime/parseTimeLoose
// sopra, che restano dedicate al "quanto tempo hai per cucinare"). Accetta "8", "8:00", "8.30", "alle 9".
function parseClockTime(text){const m=String(text||'').match(/(\d{1,2})(?:[:.,](\d{2}))?/);if(!m)return null;const h=Number(m[1]),mi=m[2]?Number(m[2]):0;if(h<0||h>23||mi<0||mi>59)return null;return `${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`}
// Predicato puro riusato sia dalla consegna reattiva (dplus, sotto) sia dallo scheduler proattivo
// in server.mjs, così le due strade concordano sempre sulla stessa definizione di "scaduto".
export function isDplusDue(user){return Boolean(user?.pendingDplus)&&Date.now()>=Date.parse(user.pendingDplus.dueAt)}
// `proactive` distingue nell'evento se la consegna è stata inviata da sola dallo scheduler della VM
// oppure mostrata perché l'utente ha riscritto dopo la scadenza (comportamento invariato di default).
export function dplus(user,{proactive=false}={}){const pending=user.pendingDplus;if(!pending)return reply('Non ci sono D+1 in attesa.');if(!isDplusDue(user))return reply(`Il D+1 sarà disponibile domattina, verso le ${user.preferences?.dplusTime||'08:30'}.`);event(user,'dplus_delivered',{dishId:pending.dishId,sourceSessionId:pending.sessionId,delivery:proactive?'proactive':'reactive'});user.pendingDplus=null;user.state='dplus';return reply(`☀️ **25 secondi**\n\n${pending.text}`,buttons.dplus,{parseMode:'Markdown'})}
export function publicUser(u){return {id:u.id,name:u.name,state:u.state,context:u.context,session:u.session,pendingDplus:u.pendingDplus||null,competencies:u.competencies,techniques:u.techniques||{},events:u.events}}
export function logDashboardOpened(u){event(u,'dashboard_opened',{})}
// Esportate solo per i test automatici (funzioni pure, nessun cambiamento di comportamento).
export {parsePeople,parseTime,parsePeopleLoose,parseTimeLoose,hasFoodRequest,isIntentChoice,parseIntent,extractIngredients,parseClockTime};
