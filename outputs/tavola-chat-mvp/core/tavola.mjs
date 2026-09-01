import {generateLabPlan,generateDifficultyIdeas,labAvailable,assessReflection,answerCookingDoubt} from './lab.mjs';

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
    ]
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
    ]
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
    ]
  }
};

const buttons={start:[['💡 Cerco un’idea','🛒 Sto facendo la spesa'],['🍳 Ho gli ingredienti, cuciniamo']],proposal:[['✅ Mi piace','🔄 Altra idea'],['🛒 Prepara la lista','📚 Fonti e scelte']],mode:[['👣 Guidami','📋 Fammi leggere tutto'],['⚡ Solo punti critici']],step:[['✅ Fatto, avanti','❓ Ho un dubbio'],['🔬 Perché?']],dplus:[['✨ Una curiosità in più'],['🧭 Nel mio percorso','Basta così'],['⏰ Cambia orario D+1']],peopleQuick:[['1','2'],['3','4'],['5+']],timeQuick:[['15 min','30 min'],['45 min','1 ora'],['più di un\'ora']]};
const event=(u,type,payload={})=>u.events.push({type,payload,at:new Date().toISOString(),sessionId:u.session?.id||null});
const reply=(text,keyboard=null,extra={})=>({text,keyboard,...extra});
const norm=s=>String(s||'').trim().toLowerCase();

export function newUser(id,name='Tester'){return {id,name,state:'new',context:{people:null,time:null,ingredients:[],constraints:[],intent:null},session:null,pendingDplus:null,competencies:{},techniques:{},events:[],preferences:{dplusTime:'08:30'}}}

export async function handle(user,input,{source='simulator'}={}){
  const text=String(input.text||input||'').trim(),n=norm(text);
  event(user,'message_received',{source,kind:input.voice?'voice':input.photo?'photo':'text',text});
  // Un capitolo si considera "chiuso" quando l'utente è in attesa del D+1 o lo ha già ricevuto.
  // In questi stati la chat non deve mai restare bloccata: qualunque nuovo messaggio riapre
  // automaticamente un nuovo capitolo, senza richiedere /start (D-021).
  const dormant=user.state==='waiting_dplus'||user.state==='dplus';
  const isDplusFollowup=dormant&&(n.includes('d+1')||n.includes('curiosità')||n.includes('curiosita')||n.includes('percorso')||n.includes('basta cos')||n.includes('cambia orario'));

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
  if(user.state==='collecting_people'){
    if(isIntentChoice(n)){user.context.intent=parseIntent(n);user.context.people=null;user.context.time=null;event(user,'intent_changed',{intent:user.context.intent});return reply('Per quante persone cuciniamo?',buttons.peopleQuick)}
    const shortcut=await tryOneShot(user,text,n);if(shortcut)return shortcut;
    const people=parsePeopleLoose(text);
    if(!people){event(user,'people_unrecognized',{text});return reply('Non ho capito il numero di persone: scegli un tasto oppure scrivimelo (es. “3 persone”).',buttons.peopleQuick)}
    user.context.people=people;user.state='collecting_time';event(user,'people_captured',{people});
    return reply('Quanto tempo hai a disposizione?',buttons.timeQuick);
  }
  if(user.state==='collecting_time'){
    if(isIntentChoice(n)){user.context.intent=parseIntent(n);user.context.people=null;user.context.time=null;user.state='collecting_people';event(user,'intent_changed',{intent:user.context.intent});return reply('Per quante persone cuciniamo?',buttons.peopleQuick)}
    const shortcut=await tryOneShot(user,text,n);if(shortcut)return shortcut;
    const time=parseTimeLoose(text);
    if(!time){event(user,'time_unrecognized',{text});return reply('Non ho capito il tempo disponibile: scegli un tasto oppure scrivimelo (es. “45 minuti”).',buttons.timeQuick)}
    user.context.time=time;user.state='collecting_context';event(user,'time_captured',{time});
    return reply(ingredientPrompt(user.context.intent));
  }
  if(user.state==='collecting_context'){
    if(isIntentChoice(n)){user.context.intent=parseIntent(n);user.context.people=null;user.context.time=null;user.state='collecting_people';event(user,'intent_changed',{intent:user.context.intent});return reply('Per quante persone cuciniamo?',buttons.peopleQuick)}
    if(!user.context.people)user.context.people=parsePeopleLoose(text);
    if(!user.context.time)user.context.time=parseTimeLoose(text);
    user.context.raw=text;user.context.ingredients=extractIngredients(n);
    event(user,'context_captured',{...user.context});
    const missing=[];if(!user.context.people)missing.push('per quante persone');if(!user.context.time)missing.push('quanto tempo hai');if(!hasFoodRequest(text))missing.push('ingrediente o piatto desiderato');
    if(missing.length){event(user,'context_missing',{missing});return reply(`Mi manca ${missing.join(', ')}. Scrivimelo pure liberamente, anche a voce.`)}
    return await proposeDifficultyMenu(user);
  }
  if(user.state==='difficulty_choice'){
    if(isIntentChoice(n)){user.context.intent=parseIntent(n);user.context.people=null;user.context.time=null;user.state='collecting_people';event(user,'intent_changed',{intent:user.context.intent,trigger:'difficulty_choice_restart'});return reply('Per quante persone cuciniamo?',buttons.peopleQuick)}
    const index=n.includes('semplice')?0:n.includes('tecnico')?1:n.includes('gourmet')?2:-1;if(index<0)return reply('Scegli una delle tre direzioni: semplice curato, tecnico oppure gourmet.',difficultyButtons(user.context.difficultyIdeas));const idea=user.context.difficultyIdeas[index];user.context.difficulty=idea.level;user.context.selectedIdea=idea;event(user,'difficulty_selected',{level:idea.level,name:idea.name});return await proposeFromLab(user,`Livello scelto: ${idea.level}. Sviluppa: ${idea.name}`);
  }
  if(user.state==='lab_connection_required'){
    return reply('Per attivare il laboratorio generativo bisogna collegare al server una chiave OpenAI API. Non incollarla nella chat: va salvata come variabile d’ambiente OPENAI_API_KEY.');
  }
  if(user.state==='lab_clarification'){
    if(isIntentChoice(n)){user.context.intent=parseIntent(n);user.context.people=null;user.context.time=null;user.state='collecting_people';event(user,'intent_changed',{intent:user.context.intent,trigger:'lab_clarification_restart'});return reply('Per quante persone cuciniamo?',buttons.peopleQuick)}
    user.context.labFollowup=text;user.context.people=parsePeople(text)||user.context.people;user.context.time=parseTime(text)||user.context.time;user.context.raw=[user.context.raw,text].filter(Boolean).join(' — ');event(user,'lab_clarification_answered',{text,people:user.context.people,time:user.context.time});return await proposeFromLab(user,text);
  }
  if(user.state==='clarify_triglia'){
    if(n.includes('filetti'))return propose(user,'triglia_filetti');
    if(n.includes('intere'))return propose(user,'triglia_intera');
    user.state='clarify_triglia';return reply('Quando le scegli o le compri, guarda se il pesce è intero oppure se trovi due filetti separati. Posso aspettare questa informazione prima di proporti una cottura.',[['🐟 Sono intere','🔪 Sono filetti']]);
  }
  if(user.state==='proposal'){
    if(isIntentChoice(n)){user.context.intent=parseIntent(n);user.context.people=null;user.context.time=null;user.state='collecting_people';event(user,'intent_changed',{intent:user.context.intent,trigger:'proposal_restart'});return reply('Per quante persone cuciniamo?',buttons.peopleQuick)}
    const d=currentDish(user);
    if(n.includes('fonti')||n.includes('scelte')){const rows=(d.evidence||[]).map(e=>`**${e.status}** — ${e.claim}\n${e.sourceTitle}: ${e.sourceUrl}`).join('\n\n');event(user,'sources_opened',{dishId:d.id});return reply(rows||'Questa esperienza editoriale non ha ancora una bibliografia esposta.',buttons.proposal,{parseMode:'Markdown'})}
    if(n.includes('lista')){event(user,'shopping_list_requested');return reply(`Lista essenziale:\n${d.shopping.map(x=>'• '+x).join('\n')}\n\nQuando hai tutto, scrivi “ci sono”.`,[['🏠 Ci sono']]);}
    if(n.includes('altra')){user.state='proposal_feedback';event(user,'proposal_rejected',{dishId:d.id});return reply('Posso cambiare direzione, ma prima dimmi cosa non ti convince: tecnica, tempo, ingredienti o gusto. Non genero un’alternativa casuale.')}
    if(n.includes('piace')||n.includes('ci sono')){user.state='mode';event(user,'proposal_accepted',{dishId:d.id});return reply('Come vuoi cucinare stasera?',buttons.mode)}
  }
  if(user.state==='proposal_feedback'){
    // D-037: "Altra idea" chiedeva il motivo del rifiuto ma non riportava mai lo stato fuori da
    // 'proposal', quindi ogni messaggio successivo cadeva nel fallback generico finale e la
    // conversazione sembrava bloccata sulla stessa risposta. Questo stato intermedio raccoglie
    // il motivo, lo integra nel contesto e rigenera davvero tre nuove direzioni (D-019).
    if(isIntentChoice(n)){user.context.intent=parseIntent(n);user.context.people=null;user.context.time=null;user.state='collecting_people';event(user,'intent_changed',{intent:user.context.intent});return reply('Per quante persone cuciniamo?',buttons.peopleQuick)}
    user.context.raw=`${user.context.raw} — non mi convince: ${text}`;user.context.difficultyIdeas=null;user.context.selectedIdea=null;user.context.difficulty=null;
    event(user,'proposal_feedback_captured',{text});
    return await proposeDifficultyMenu(user);
  }
  if(user.state==='mode'){
    if(isIntentChoice(n)){user.context.intent=parseIntent(n);user.context.people=null;user.context.time=null;user.state='collecting_people';event(user,'intent_changed',{intent:user.context.intent,trigger:'mode_restart'});return reply('Per quante persone cuciniamo?',buttons.peopleQuick)}
    if(user.session.mode==='full'){user.state='cooking';return cookingReply(user)}
    const d=currentDish(user);user.session.mode=n.includes('leggere')?'full':n.includes('critici')?'essential':'guided';event(user,'guidance_mode_selected',{mode:user.session.mode});
    if(user.session.mode==='full')return reply(d.steps.map((s,i)=>`**${i+1}. ${s.title}**\n${s.action}`).join('\n\n'),[['👣 Inizia la guida']],{parseMode:'Markdown'});
    user.state='cooking';return cookingReply(user);
  }
  if(user.state==='cooking'){
    if(isIntentChoice(n)){user.context.intent=parseIntent(n);user.context.people=null;user.context.time=null;user.state='collecting_people';event(user,'intent_changed',{intent:user.context.intent,trigger:'cooking_restart'});return reply('Per quante persone cuciniamo?',buttons.peopleQuick)}
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
  if(user.state==='dplus'){const d=currentDish(user);if(n.includes('curiosità')||n.includes('curiosita')){event(user,'dplus_curiosity_opened',{dishId:d?.id});return reply(d?.curiosity||'Nessuna curiosità aggiuntiva disponibile per questa esperienza.',buttons.dplus)}if(n.includes('percorso'))return reply('Apri la dashboard: /dashboard',[['🧭 Apri dashboard']]);if(n.includes('cambia orario')){user.state='awaiting_dplus_time';event(user,'dplus_time_change_started',{});return reply('A che ora preferisci ricevere il prossimo D+1? Scrivimi un orario, ad esempio "8:00" oppure "alle 9".')}return reply('Perfetto. Nessun compito per oggi.')}
  if(user.state==='awaiting_dplus_time'){
    const t=parseClockTime(text);
    if(!t){event(user,'dplus_time_change_failed',{text});return reply('Non ho riconosciuto l\'orario. Prova con un formato come "8:00" oppure "alle 9".')}
    user.preferences=user.preferences||{};user.preferences.dplusTime=t;user.state='dplus';event(user,'dplus_time_changed',{time:t});
    return reply(`Fatto: il prossimo D+1 arriverà verso le ${t}.`,buttons.dplus);
  }
  return reply('Dimmi dove sei e cosa stai cercando di fare: scegliere la cena, fare la spesa, cucinare o risolvere un problema.');
}

function propose(user,dishId,dishOverride=null){const d=dishOverride||dishes[dishId];user.state='proposal';user.session={id:crypto.randomUUID(),dishId:d.id,generatedDish:dishOverride||null,principle:d.competency,stepsTotal:d.steps.length,step:0,startedAt:new Date().toISOString(),lastStepAt:null,mode:null,answers:{},isSimulation:false};event(user,'proposal_created',{dishId:d.id,source:dishOverride?'generative_lab':'editorial'});return reply(`Ti propongo *${d.name}* per ${user.context.people}.\n\n**Principio tecnico — ${d.principle.term}**\n${d.principle.rule}\n\nPredizione: ${d.principle.prediction}`,buttons.proposal,{parseMode:'Markdown'})}
async function proposeDifficultyMenu(user){
  if(!labAvailable()){user.state='lab_connection_required';event(user,'lab_connection_required');return reply('Il laboratorio non è collegato. Apri la configurazione per attivare le tre direzioni gastronomiche.',[['⚙️ Come collegarlo?']])}
  try{const ideas=await generateDifficultyIdeas(user.context);user.context.difficultyIdeas=ideas;user.state='difficulty_choice';event(user,'difficulty_menu_generated',{ideas:ideas.map(x=>({level:x.level,name:x.name}))});const labels=['Semplice curato','Tecnico','Gourmet'];return reply(`Tre direzioni possibili:\n\n${ideas.map((x,i)=>`**${i+1}. ${labels[i]} — ${x.name}**\n${x.description}\n_Tecnica: ${x.principle}_`).join('\n\n')}\n\nQuale vuoi sviluppare?`,difficultyButtons(ideas),{parseMode:'Markdown'})}catch(error){event(user,'difficulty_menu_failed',{message:error.message.slice(0,200)});user.state='collecting_context';return reply('Non sono riuscito a costruire tre direzioni abbastanza distinte. Riprova tra poco: non ti propongo alternative riempitive.')}
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
function cookingReply(user){const d=currentDish(user),i=user.session.step,s=d.steps[i];event(user,'step_shown',{step:i,mode:user.session.mode});const isCritical=i===d.steps.length-1||norm(s.term)===norm(d.principle.term);if(user.session.mode==='essential'&&!isCritical)return reply(`**${i+1}/${d.steps.length} — ${s.title}**\n${s.action}`,buttons.step,{parseMode:'Markdown'});return reply(`**${i+1}/${d.steps.length} — ${s.title}**\n${s.action}\n\n👁 **Osserva:** ${s.observe}`,buttons.step,{parseMode:'Markdown'})}
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
function isIntentChoice(n){if(n.includes('cerco un')||n.includes('facendo la spesa')||n.includes('ingredienti, cuciniamo')||n.includes('ingredienti cuciniamo'))return true;if(n.includes('nuova richiesta')||n.includes('altra richiesta')||n.includes('resett'))return true;if(n.includes('ricominc')||n.includes('da capo')||n.includes('ripart'))return true;if((n.includes('cambi')||n.includes('nuov')||n.includes('altra')||n.includes('altro'))&&(n.includes('ricetta')||n.includes('piatto')))return true;return false}
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
function hasFoodRequest(text){return /[a-zà-ù]{4,}/i.test(String(text).replace(/persone?|commensali|minuti?|oretta|ore|tempo|preparazione|ingrediente|principale|voglio|vorrei|fare|usare/gi,''))}
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
