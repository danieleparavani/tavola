# Tavola — evidenze, interpretazioni e ipotesi

Questo registro impedisce di confondere ciò che è accaduto con ciò che vorremmo dimostrare.

## Esperimento 1 — Pasta con alici e mollica

### Evidenze osservate

- N=1; tester coincidente con il progettista; test non in cieco.
- Il sistema ha proposto una pasta con contrasto tra componente cremosa e componente croccante.
- Ha adattato il procedimento alla disponibilità di pancarrè.
- Il piatto è riuscito secondo il tester: pasta cremosa e pane croccante.
- Il tester ha riferito una maggiore chiarezza della logica di esecuzione.
- La terminologia tecnica ha contribuito alla percezione di trovarsi in un corso più autorevole.
- Il tester non ha modificato spontaneamente la procedura durante l’esecuzione.
- Dopo cena ha formulato una domanda progettuale sull’aromatizzazione della mollica.
- La progressive disclosure non è stata realmente testata perché la procedura era stata letta in anticipo.

### Interpretazioni plausibili

- Il principio sul momento dell’unione è stato percepito come concreto e memorabile.
- La terminologia può sostenere autorevolezza e strutturazione per il target.
- La maggiore chiarezza potrebbe derivare dalla combinazione tra procedura scritta e modello causale.

### Ipotesi non verificate

- La strutturazione produce valore per utenti diversi dal progettista.
- Il valore è distinguibile da un LLM generalista ben promptato.
- La guida resta fluida in condizioni reali di fretta, bambini e distrazione.
- La memoria longitudinale produce ritorno e valore percepito.
- Esiste transfer.
- La finestra progettuale è utile durante la cucina.

### Decisioni derivate

- Centralizzare un principio trasferibile per sessione.
- Non considerare l’esperimento una validazione della progressive disclosure.
- Preparare un confronto futuro con un LLM generalista trattato lealmente.
- Usare riferimenti culturali solo quando affidabili.

## Osservazione di canale — chat contro web app

### Evidenza osservata

Il progettista ha riferito che, in macchina e al supermercato, lavorare nella chat è stato più naturale della web app.

### Interpretazione

La conversazione si adatta meglio ai momenti frammentati e multimodali che precedono e accompagnano la cucina.

### Ipotesi

Un’esperienza primaria su Telegram potrebbe generare minore attrito e maggiore continuità rispetto a un flusso principalmente web.

### Decisione

Spostare scelta, spesa, guida, assistenza, chiusura e D+1 nel canale conversazionale. Riservare la web app alla dashboard e agli approfondimenti.

## Prototipi tecnici

### Evidenze verificate

- Il primo MVP web completa onboarding, contesto, proposta, guida, chiusura, D+1, dashboard ed export.
- Il nuovo MVP conversazionale completa il percorso simulato da contesto quotidiano a D+1.
- Lo stesso motore alimenta simulatore e webhook Telegram predisposto.
- La dashboard mostra la competenza come “introdotta” dopo una sessione e dichiara che una singola esposizione non dimostra acquisizione o transfer.
- Il flusso end-to-end è stato verificato nel browser senza errori rilevati.

### Limiti attuali

- Telegram non è ancora collegato a un bot reale.
- Vocali e fotografie sono simulati come tipi di input; mancano trascrizione e analisi.
- Esiste una sola esperienza editoriale verificata.
- La generazione AI libera non è attiva.
- Non è stato ancora condotto un pilot con tester indipendenti.

## Failure osservato — ingrediente ignorato

### Evidenza osservata

Il progettista ha indicato “3 persone con 1 ora di preparazione, pensavo alla triglia”. Il prototipo ha registrato il testo, ma ha proposto comunque spaghetti con alici e mollica. Inoltre ha interpretato “1 ora” come 30 minuti.

### Interpretazione

Il flusso conversazionale dava un’impressione di comprensione, ma la proposta era ancora collegata a una ricetta fissa. Questo è un failure di aderenza al contesto, non una semplice imperfezione linguistica.

### Decisione

- Mai sostituire silenziosamente un ingrediente richiesto con l’esperienza predefinita.
- Chiedere il chiarimento minimo necessario quando la tecnica dipende dalla forma dell’ingrediente.
- Non usare più la categoria “ingrediente non supportato”: per ingredienti fuori dai casi editoriali interviene il laboratorio generativo vincolato.
- Aggiungere due percorsi editoriali per la triglia: intera e in filetti.
- Correggere l’interpretazione di ore e minuti.

### Verifica successiva

Lo stesso input produce ora: 3 persone, 60 minuti e la domanda “intere o già sfilettate?”. Se si selezionano i filetti, la proposta diventa “Filetti di triglia in padella, pomodoro crudo e pane aromatico”, con principio dominante di cottura differenziale.

## Correzione di architettura — catalogo chiuso

### Evidenza progettuale

Il progettista ha respinto sia l’idea di una sola ricetta verificata sia la nozione di ingredienti non supportati, richiedendo che Tavola operi come laboratorio completo di idee e ricette.

### Interpretazione

Un catalogo finito contraddice la promessa di accompagnare la vita quotidiana, dove ingredienti, disponibilità e desideri sono imprevedibili.

### Decisione

Integrare un laboratorio generativo capace di creare proposte strutturate per ingredienti arbitrari. Mantenere i casi editoriali come gold examples e costruire progressivamente un corpus verificato per le affermazioni tecniche e culturali.

## Regole per le prossime evidenze

Ogni test deve registrare almeno:

- partecipante e condizione;
- contesto reale;
- utilità per la cena;
- invasività;
- soddisfazione gastronomica;
- punto di abbandono;
- approfondimenti aperti volontariamente;
- domande e problemi reali;
- richiamo post-cena;
- lettura del D+1;
- ritorno per una seconda sessione.

Nessuna risposta sollecitata può essere registrata come transfer.

## Failure osservato — spaghetti alle vongole

### Evidenza osservata

La proposta generata presentava fonti soprattutto igienico-sanitarie, ma non sufficienti per la tecnica centrale. Conteneva inoltre purga discutibile con semola, salinità incoerente, quantità d’olio non riconciliate, riduzione rischiosa del liquido, un elemento annunciato ma non eseguito e nessun reinserimento finale delle vongole. La riflessione dell’utente non riceveva risposta e il D+1 arrivava dopo pochi secondi.

### Interpretazione

La ricerca web e uno schema strutturato non costituiscono da soli controllo editoriale. La proposta appariva autorevole senza esserlo in modo sufficiente.

### Decisione

Introdotto un gate editoriale deterministico con una sola revisione; distinzione fra simulazione e cucina reale; valutazione della riflessione; D+1 differito alla mattina seguente; eliminazione dei valori predefiniti inventati per persone e tempo.

### Verifica tecnica

- Cambio di luogo da macchina a casa interpretato correttamente.
- Input privo di persone o tempo bloccato con richiesta esplicita, senza valori predefiniti.
- Una nuova bozza debole di spaghetti alle vongole è stata respinta dal gate anziché mostrata.
- La chiave cifrata sopravvive al riavvio.

## Audit del codice — 19 agosto 2026

Partecipante e condizione: revisione statica e test automatici sul codice di `outputs/tavola-chat-mvp/`, non una sessione di cucina reale. Le voci seguenti separano ciò che è stato osservato leggendo/eseguendo il codice da ciò che se ne interpreta.

### Evidenze osservate (lettura del codice, prima della correzione)

- Nessun ramo del motore conversazionale impostava mai `user.state='dplus'`: la funzione `dplus()` non aggiornava lo stato, quindi il blocco che gestisce le opzioni di follow-up del D+1 (curiosità aggiuntiva, apertura del percorso) non era mai raggiungibile.
- Dallo stato `waiting_dplus`, un messaggio libero che non fosse esattamente uno dei tre pulsanti di intenzione non riapriva un nuovo capitolo: restava intrappolato nella risposta generica finale. Nel simulatore locale questo non era visibile perché `public/chat.js` invia un `/start` automatico a ogni caricamento di pagina; nei dati di pilot già raccolti (`data/pilot.json`) l’utente `pilot-49ix8d` mostra infatti un evento `dplus_delivered` seguito da uno stato `locating`, coerente con un reset mascherato dal reload del simulatore e non con una reale ripartenza spontanea della conversazione.
- Selezionando “Fammi leggere tutto” e poi cliccando “Inizia la guida”, il testo del pulsante veniva ri-analizzato dalla stessa logica che assegna la modalità, sovrascrivendo silenziosamente la scelta dell’utente con la modalità “guidata”.
- La modalità “Solo punti critici” non aveva alcun effetto distinguibile rispetto a “Guidami”: nessun ramo del codice leggeva `session.mode` durante la cucina.
- `public/dashboard.js` mostrava il passaggio corrente come frazione di un denominatore fisso `/5`, indipendentemente dal numero reale di passaggi della ricetta proposta (le ricette generate dal laboratorio ne hanno spesso un numero diverso).
- `setup.html` e il `README.md` del prodotto dichiaravano che la chiave OpenAI restasse solo in memoria e non venisse mai scritta su disco; il codice (`core/key-store.mjs`, chiamato da `server.mjs`) la cifra invece con AES-256-GCM e la scrive su `data/openai-key.protected`, sopravvivendo ai riavvii — comportamento corretto e voluto (cfr. D-018, verifica precedente in questo registro), ma descritto in modo inesatto agli utenti del pilot.
- Alcuni eventi richiesti esplicitamente per il logging del pilot non venivano mai registrati: dati di contesto mancanti, proposta rifiutata (“Altra idea”), passaggio mostrato, valutazione della riflessione, apertura della dashboard.
- Il gate editoriale (`qualityIssues` in `core/lab.mjs`) verificava la coerenza fra spesa e passaggi solo per due casi hardcoded (risotto, vongole); un ingrediente qualunque annunciato e mai reintrodotto in un piatto generato al di fuori di questi due casi non veniva intercettato.
- I tre piatti editoriali storici (alici, triglia intera, triglia a filetti) e lo stato `clarify_triglia` risultano irraggiungibili dal motore conversazionale dal momento in cui ogni richiesta passa dal laboratorio generativo (D-014): non sono un difetto in sé, ma codice morto non più documentato come tale.

### Interpretazioni

- Il difetto più grave (D-023) avrebbe reso il prodotto inutilizzabile su Telegram dopo la prima sera di utilizzo: un utente reale, senza il reset automatico che solo il simulatore web fornisce, sarebbe rimasto bloccato senza sapere di dover scrivere `/start` — comando che il prodotto vieta esplicitamente di richiedere.
- Il fatto che il simulatore mascherasse il problema è una lezione utile: un simulatore troppo “comodo” (reset automatico a ogni reload) può nascondere esattamente le rotture che il pilot dovrebbe scoprire. Vale la pena tenerlo presente nella Fase 2.
- Le imprecisioni nella copy sulla chiave non erano un rischio di sicurezza (la chiave è effettivamente cifrata e protetta), ma un rischio di fiducia: promettere agli utenti un comportamento diverso da quello reale del sistema.

### Decisioni derivate

- Corretto il motore conversazionale perché qualunque messaggio recapitato in uno stato “dormiente” (in attesa di D+1 o dopo la sua consegna) riapra automaticamente un nuovo capitolo, salvo le risposte esplicitamente legate al D+1 stesso (D-023).
- Corretta la selezione di modalità “Fammi leggere tutto” perché non venga sovrascritta al primo tocco successivo.
- Data alla modalità “Solo punti critici” una differenza di comportamento reale (segnali osservabili mostrati solo nel passaggio dominante e in quello finale di impiattamento).
- Il denominatore dei passaggi in dashboard ora usa il numero reale di passaggi della ricetta proposta.
- Corrette le descrizioni della persistenza della chiave in `setup.html` e nel `README.md` del prodotto.
- Aggiunti gli eventi di logging mancanti: `context_missing`, `proposal_rejected`, `step_shown`, `reflection_assessed`, `dashboard_opened`, `editorial_gate_rejected` (quest’ultimo ora con l’elenco strutturato dei motivi, non solo un messaggio libero).
- Ampliato il gate editoriale con un controllo generico di coerenza fra spesa e passaggi (D-024).
- Documentata nel codice, non rimossa, la natura di “codice morto” dei tre piatti editoriali e dello stato `clarify_triglia`, in attesa di una decisione esplicita su un loro eventuale riutilizzo come fallback offline.

### Verifica successiva (test automatici, senza rete)

- 40 test automatici (`npm test`, `node:test`) coprono: apertura automatica senza `/start`; le tre intenzioni operative; parsing di persone e tempo (incluso il bug storico “1 ora” → 30 minuti, verificato non reintrodotto); dati mancanti mai inventati e correttamente registrati come evento; le tre direzioni gastronomiche generate e la sola direzione scelta sviluppata; il gate editoriale (accetta un piatto coerente, respinge ingredienti mai citati nei passaggi, competenze generiche, impiattamento mancante, fonti insufficienti o non ammesse, falsa precisione da risotto, mancato reinserimento delle vongole); l’impiattamento sempre presente anche in modalità essenziale; la distinzione fra simulazione (passaggi completati in pochi secondi) ed esperienza reale (competenza registrata come “introdotto” solo con ritmo plausibile); il D+1 realmente differito e il suo follow-up leggero; la persistenza cifrata della chiave con un round-trip completo; la sopravvivenza della memoria di un utente a un riavvio reale del processo server (test di integrazione con processo separato, non solo verifica in-memory).
- Tutti i piatti generati registrati nel pilot (`qa-credit-live`, `qa-credit-live-2`) sono stati ripassati contro il nuovo controllo generico spesa/passaggi senza generare falsi positivi.

### Limite dichiarato di questa verifica

Non è stata eseguita una prova end-to-end con una chiamata reale al modello (`gpt-5-mini` via OpenAI) da questo ambiente: la chiave cifrata già salvata sul computer dell’utente è vincolata a quella macchina (derivazione della chiave di cifratura da utente e host locali, D-018) e non è decifrabile da questo ambiente cloud, e non è stata richiesta né incollata una chiave in chiaro qui, per coerenza con la regola “non incollarla nella chat”. La prova con ingrediente non editoriale (Fase 0, checklist) resta da eseguire dal progettista con la propria chiave collegata tramite `/setup.html`, seguendo i passi indicati nel rapporto finale.

## Deployment reale — VM Google Cloud e bot Telegram (21 agosto 2026)

Partecipante e condizione: progettista, prima conversazione reale su Telegram (non simulata), N=1, non in cieco.

### Evidenze osservate

- Server pubblicato su una VM e2-micro gratuita di Google Cloud (`tavola-prod`, us-central1-c), raggiungibile via tunnel HTTPS gratuito ngrok (dominio dev `density-divinely-flip.ngrok-free.dev`), reso persistente con systemd (`tavola.service`, `tavola-tunnel.service`).
- Chiave OpenAI collegata sulla VM tramite `/setup.html`; `/api/status` conferma `labConnected:true`, modello `gpt-5-mini`.
- Bot Telegram reale creato (`@tavola_cucina_bot`), webhook registrato e confermato via `getWebhookInfo`.
- Prima conversazione reale: apertura senza `/start`, raccolta contesto (3 persone, 1 ora, ingrediente “seppia” — non editoriale) completata in due scambi, generazione delle tre direzioni gastronomiche (D-019) riuscita al primo tentativo.

### Failure osservato — pulsanti Telegram consegnati in modo silenziosamente fallito

Il messaggio con le tre proposte (testo + tre pulsanti) non è mai arrivato all’utente su Telegram, senza alcun errore visibile nei log del server.

Causa isolata con test diretti: `server.mjs` costruiva `callback_data` usando lo stesso testo esteso mostrato sul pulsante (nome e descrizione del piatto, 68–96 byte). Telegram impone un limite di 64 byte su questo campo e rifiutava l’intera chiamata `sendMessage` con `400 Bad Request: BUTTON_DATA_INVALID`; il codice non controllava la risposta HTTP della chiamata, quindi il fallimento restava completamente invisibile sia all’utente sia nei log.

### Decisione

Corretto `server.mjs`: `callback_data` viene troncato a 64 byte su un confine di carattere Unicode valido, mantenendo intatto il testo visibile del pulsante; aggiunto un log esplicito quando `sendMessage` restituisce un errore, per evitare che un fallimento futuro resti di nuovo silenzioso. Fix verificato con invii diretti sulla VM (stesso messaggio, prima rifiutato con `BUTTON_DATA_INVALID`, poi consegnato con successo). Applicato e committato sulla VM; **non ancora sincronizzato su GitHub** perché la VM non ha credenziali git per il push (nessuna credenziale è stata inserita da Claude, per policy) — da completare dal progettista.

### Verifica successiva — gate editoriale su una proposta reale (seppia, livello Gourmet)

Selezionato il livello “Gourmet”: il laboratorio ha generato una bozza (“Seppia scottata, crema di sedano rapa e riduzione d’inchiostro”), respinta dal gate editoriale (D-015) con motivi concreti e strutturati: persone/tempo non confermati nel testo generato, impiattamento finale mancante (viola D-020), e un riferimento incongruente a un “risotto” non pertinente alla proposta. Il sistema si è astenuto correttamente, spiegando i motivi, invece di mostrare una ricetta scadente — comportamento coerente con D-015.

La latenza della generazione completa (dopo la scelta del livello) ha superato il timeout del webhook di Telegram (`getWebhookInfo` ha registrato `last_error_message: "Read timeout expired"`), ma il processo server ha comunque completato l’elaborazione e consegnato il messaggio di astensione in background, con qualche decina di secondi di ritardo rispetto al tocco del pulsante.

### Interpretazioni

- Il bug dei pulsanti conferma, con un caso reale, l’importanza già segnalata nell’audit del 19 agosto di non fidarsi di un “200 OK” lato client come prova di consegna: senza controllo esplicito della risposta di Telegram, un fallimento totale del messaggio principale del prodotto (le tre proposte) sarebbe rimasto invisibile per l’intero pilot.
- Il riferimento a “risotto” nel motivo di rifiuto è sospetto per una ricetta di seppia: potrebbe indicare una frase o un controllo di validazione residuo/hardcoded in `core/lab.mjs`, non un giudizio realmente specifico su questa proposta. Da verificare prima di fidarsi ciecamente delle motivazioni testuali del gate.
- La latenza della generazione completa (livello scelto → proposta) è un rischio di percezione (“non funziona”) distinto dal corretto funzionamento tecnico: il sistema ha lavorato correttamente, ma senza un segnale intermedio l’utente non può distinguere un ritardo da un guasto.

### Ipotesi non verificate

- Se la latenza osservata sia un caso isolato (rete della VM, carico del modello) o un pattern ricorrente da correggere con un messaggio “sto pensando…” intermedio.
- Se il livello “Gourmet” fallisca il gate più spesso di “Semplice curato” o “Tecnico” per requisiti oggettivamente più complessi da soddisfare (impiattamento, coerenza) — non ancora testato sugli altri due livelli.

## Sessione di sviluppo su Claude/Cowork — 21 agosto 2026 (D-027 in codice, bug "risotto")

Partecipante e condizione: sessione di sviluppo (D-025), non una sessione di cucina reale. Clone del repository GitHub tramite token fornito dal progettista, lettura e modifica diretta del codice, verifica con la suite di test automatici.

### Evidenza rilevante sullo stato del repository

Al momento del clone, `git log` sul repository mostrava un solo commit (import iniziale del 20 agosto). Il codice dei tasti rapidi persone/tempo (D-027) descritto in `DECISIONS.md` e `NEXT.md` come "già implementato e testato in locale, 46 test passano" **non era presente** in `core/tavola.mjs`: il motore poneva ancora la domanda combinata in testo libero ("Per quante persone, quanto tempo avrai e quali ingredienti..."). Anche `DECISIONS.md`, `EVIDENCE.md` e `NEXT.md` nel repository risultavano fermi allo stato del 20 agosto, senza le voci più recenti (D-027, D-028, la sezione "Deployment reale" del 21 agosto) presenti invece nei documenti canonici del progetto Claude. L'implementazione descritta come completata in una sessione precedente risulta quindi essersi persa fra quella sessione e il repository versionato — coerente con quanto già segnalato in `NEXT.md` (deploy sulla VM interrotto a metà), ma con un dettaglio più preciso: non è solo il deploy sulla VM a essere incompleto, il codice e i documenti aggiornati non erano mai arrivati su GitHub.

### Decisione

Portati i documenti canonici nel repository allo stato corrente (allineati alle copie del progetto Claude) prima di aggiungere le voci di questa sessione, per eliminare la divergenza. Implementato D-027 da zero in questa sessione, seguendo esattamente la specifica già approvata in `DECISIONS.md` (nessuna modifica alla decisione stessa): nuovi stati `collecting_people`/`collecting_time` in `core/tavola.mjs`, tasti rapidi (persone: 1/2/3/4/5+; tempo: 15 min/30 min/45 min/1 ora/più di un'ora), parser morbidi `parsePeopleLoose`/`parseTimeLoose` che riconoscono le etichette dei tasti oltre al testo libero già gestito dai parser rigorosi, e scorciatoia one-shot (`tryOneShot`) che salta direttamente alle tre direzioni gastronomiche quando un solo messaggio contiene già persone, tempo e ingrediente — verificata sia al primo messaggio dopo la scelta dell'intenzione sia a metà flusso (persone già note, tempo e ingrediente insieme). "5+" è mappato su 5 persone; "più di un'ora" su 90 minuti come valore rappresentativo, coerente con l'uso di `context.time` come minuti interi nel laboratorio generativo.

Aggiornati anche i test preesistenti che assumevano il vecchio stato unico `collecting_context` subito dopo la scelta dell'intenzione (in `test/engine.test.mjs` e `test/server.integration.test.mjs`), aggiunti nuovi test per i tasti, per i valori "5+"/"più di un'ora" e per entrambe le varianti della scorciatoia one-shot.

### Failure osservato e corretto — controllo "risotto" nel gate editoriale mai vincolato al risotto

Indagato il riferimento sospetto a "risotto" comparso nel motivo di rifiuto del gate su una proposta di seppia (21 agosto, vedi sopra). Causa trovata in `core/lab.mjs`, `qualityIssues()`: il controllo `/sigill.*amid|frusta.*ris/i.test(all)` non era mai vincolato al tipo di piatto, a differenza degli altri controlli specifici (es. quelli sulle vongole, correttamente condizionati da `/vongol/i.test(...)`). In particolare `frusta.*ris` intercettava qualunque piatto contenente la parola "frusta" seguita, ovunque più avanti nel testo concatenato di tutti i passaggi, dalla sola sequenza di tre lettere "ris" — presente in moltissime parole italiane comuni (risultato, riscaldare, riserva, risalire...) e quindi non specifica del risotto.

Un test preesistente (`test/unit.test.mjs`) certificava di fatto il comportamento scorretto: verificava che la frase pseudotecnica "la tostatura sigilla l'amido", applicata a un piatto di *pesce spada*, producesse un messaggio contenente la parola "risotto" — e lo considerava corretto.

### Decisione

Separati i due controlli in `qualityIssues()`:
- la falsa precisione "la tostatura sigilla l'amido" resta un controllo generico su qualunque piatto (coerente con le istruzioni del laboratorio, che la vietano in generale), ma il messaggio non nomina più il risotto quando il piatto non lo è;
- il controllo sul gesto scorretto ("si frusta invece di mantecare") ora si applica solo quando il piatto è davvero un risotto (titolo, principio tecnico o richiesta originale contengono "risott").

Corretto anche il test preesistente che certificava il comportamento sbagliato, e aggiunti due test di regressione: uno che riproduce lo scenario reale (piatto di seppia con "frusta" nel testo, nessun riferimento al risotto atteso nell'esito) e uno che conferma che il controllo scatta ancora correttamente su un vero risotto.

### Verifica successiva

Suite di test completa eseguita dopo entrambe le correzioni: 52 test, tutti superati (`npm test`, `node:test`), incluse le nuove verifiche su tasti rapidi, scorciatoia one-shot e gate del risotto.

### Limite dichiarato di questa verifica

Come nell'audit del 19 agosto, non è stata eseguita alcuna chiamata reale al modello da questo ambiente (nessuna chiave OpenAI disponibile qui, per policy nessuna è stata richiesta né incollata). Le correzioni sono state verificate con la suite automatica e con fixture di test, non con una nuova conversazione reale su Telegram: la verifica su Telegram reale del flusso a tasti (D-027) resta da fare dopo il deploy sulla VM (cfr. `NEXT.md`). Il codice e i documenti canonici sono stati committati e pushati su GitHub al termine di questa sessione; il deploy sulla VM di produzione resta un passaggio separato, non eseguito da qui (nessun accesso diretto alla VM da questo ambiente).

## Continuazione operativa — verifica GitHub/VM e fix latenza webhook (22 agosto 2026)

Partecipante e condizione: sessione di sviluppo (accesso diretto a Cloud Shell/VM e a GitHub via sessione browser autenticata, nessun token incollato in chat), non una sessione di cucina reale.

### Evidenza osservata — stato reale di GitHub e VM all'apertura della sessione

Alla ripresa del lavoro, i documenti canonici allegati al progetto descrivevano ancora come aperti alcuni punti in realtà già risolti in una sessione precedente (fix `callback_data` sincronizzato su GitHub, VM riallineata, D-027 verificato via API locale, bug "risotto" corretto). Verifica diretta su GitHub (`git log`, lettura dei file raw) e sulla VM (`git log`, `npm test`, stato dei servizi) ha confermato che il codice era realmente allineato: VM e `origin/main` allo stesso commit, 52/52 test, servizi `active`, `labConnected:true`. La discrepanza era quindi solo nei documenti canonici del progetto Claude (non riletti dopo l'ultima sessione), non nel codice o nel repository.

### Interpretazione

I documenti canonici (`PROJECT.md`, `DECISIONS.md`, `EVIDENCE.md`, `NEXT.md`) allegati al progetto Claude e il repository GitHub sono due copie distinte: aggiornare l'una non aggiorna automaticamente l'altra. Una sessione che modifica solo il repository (via sandbox o editor GitHub) lascia i documenti del progetto Claude non sincronizzati finché qualcuno non li aggiorna esplicitamente allo stesso modo. Vale la stessa cautela già maturata per VM/GitHub: prima di agire su un punto segnato come aperto, verificare lo stato reale piuttosto che fidarsi ciecamente del testo del documento.

### Decisione

Nessuna nuova decisione di prodotto. Verificati e chiusi nei documenti i punti già risolti nel codice (fix `callback_data`, D-027, bug "risotto"), per eliminare la discrepanza fra documenti e stato reale.

### Failure osservato e corretto — latenza della generazione senza segnale intermedio (ipotesi aperta nella sessione del 21 agosto, ora verificata e risolta)

L'ipotesi lasciata aperta nella sezione "Deployment reale" del 21 agosto — se la latenza della generazione completa dopo la scelta del livello meritasse un messaggio intermedio — è stata verificata leggendo il codice: `server.mjs` attendeva (`await`) il completamento dell'intera elaborazione (`handle()`, inclusa l'eventuale chiamata al laboratorio con ricerca web) prima di rispondere al webhook Telegram con `200 OK`. Questo spiega tecnicamente il `Read timeout expired` già osservato su `getWebhookInfo` dopo la scelta del livello Gourmet: non un guasto, ma un'attesa sincrona superiore al timeout del webhook.

### Decisione

Corretto `server.mjs`: il webhook risponde ora subito (`200 OK`) e l'elaborazione prosegue in background (`telegramUpdate(update).catch(...)`, con log esplicito in caso di errore per non ripetere l'errore già corretto in precedenza sul `callback_data` — un fallimento silenzioso). Aggiunto inoltre l'invio di un messaggio "Sto pensando alla proposta..." quando l'utente si trova nello stato `difficulty_choice` (cioè ha appena scelto un livello), prima della chiamata lenta al laboratorio.

### Verifica successiva

Aggiunto un test di integrazione (`test/server.integration.test.mjs`) che invia un aggiornamento al webhook e verifica sia la risposta immediata (`200`, `{ok:true}`) sia — tramite polling su `/api/user/:id` — che l'elaborazione in background aggiorni comunque correttamente lo stato dell'utente. Suite completa: 53/53 test superati sia sulla VM sia (implicitamente, stesso codice) su quanto pubblicato su GitHub. Fix applicato prima sulla VM (verificato con `npm test`, servizio riavviato, `/api/status` confermato), poi replicato su GitHub (commit `16df30c` per `server.mjs`, `c8624f4` per il test), poi VM riallineata con `git reset --hard origin/main` allo stesso commit.

### Limite dichiarato di questa verifica

Il messaggio "Sto pensando alla proposta..." e la risposta immediata del webhook sono stati verificati con test automatici (incluso un test end-to-end contro un processo server reale, ma senza chiamata reale a Telegram: nessun `TELEGRAM_BOT_TOKEN` impostato in ambiente di test, quindi `sendTelegram` non esegue chiamate di rete durante i test) e con lo stato del servizio sulla VM (attivo, laboratorio collegato). **Non è stata verificata una consegna reale su Telegram**: nessuna conversazione con `@tavola_cucina_bot` è stata avviata da questa sessione. La verifica che il messaggio intermedio arrivi davvero e nell'ordine corretto durante una scelta di livello reale resta da fare dal progettista sul proprio telefono (cfr. `NEXT.md`).
