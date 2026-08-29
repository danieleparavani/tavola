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
- Il tester non ha modificato spontaneamente la procedura durante l'esecuzione.
- Dopo cena ha formulato una domanda progettuale sull'aromatizzazione della mollica.
- La progressive disclosure non è stata realmente testata perché la procedura era stata letta in anticipo.

### Interpretazioni plausibili

- Il principio sul momento dell'unione è stato percepito come concreto e memorabile.
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
- Non considerare l'esperimento una validazione della progressive disclosure.
- Preparare un confronto futuro con un LLM generalista trattato lealmente.
- Usare riferimenti culturali solo quando affidabili.

## Osservazione di canale — chat contro web app

### Evidenza osservata

Il progettista ha riferito che, in macchina e al supermercato, lavorare nella chat è stato più naturale della web app.

### Interpretazione

La conversazione si adatta meglio ai momenti frammentati e multimodali che precedono e accompagnano la cucina.

### Ipotesi

Un'esperienza primaria su Telegram potrebbe generare minore attrito e maggiore continuità rispetto a un flusso principalmente web.

### Decisione

Spostare scelta, spesa, guida, assistenza, chiusura e D+1 nel canale conversazionale. Riservare la web app alla dashboard e agli approfondimenti.

## Prototipi tecnici

### Evidenze verificate

- Il primo MVP web completa onboarding, contesto, proposta, guida, chiusura, D+1, dashboard ed export.
- Il nuovo MVP conversazionale completa il percorso simulato da contesto quotidiano a D+1.
- Lo stesso motore alimenta simulatore e webhook Telegram predisposto.
- La dashboard mostra la competenza come "introdotta" dopo una sessione e dichiara che una singola esposizione non dimostra acquisizione o transfer.
- Il flusso end-to-end è stato verificato nel browser senza errori rilevati.

### Limiti attuali

- Telegram non è ancora collegato a un bot reale.
- Vocali e fotografie sono simulati come tipi di input; mancano trascrizione e analisi.
- Esiste una sola esperienza editoriale verificata.
- La generazione AI libera non è attiva.
- Non è stato ancora condotto un pilot con tester indipendenti.

## Failure osservato — ingrediente ignorato

### Evidenza osservata

Il progettista ha indicato "3 persone con 1 ora di preparazione, pensavo alla triglia". Il prototipo ha registrato il testo, ma ha proposto comunque spaghetti con alici e mollica. Inoltre ha interpretato "1 ora" come 30 minuti.

### Interpretazione

Il flusso conversazionale dava un'impressione di comprensione, ma la proposta era ancora collegata a una ricetta fissa. Questo è un failure di aderenza al contesto, non una semplice imperfezione linguistica.

### Decisione

- Mai sostituire silenziosamente un ingrediente richiesto con l'esperienza predefinita.
- Chiedere il chiarimento minimo necessario quando la tecnica dipende dalla forma dell'ingrediente.
- Non usare più la categoria "ingrediente non supportato": per ingredienti fuori dai casi editoriali interviene il laboratorio generativo vincolato.
- Aggiungere due percorsi editoriali per la triglia: intera e in filetti.
- Correggere l'interpretazione di ore e minuti.

### Verifica successiva

Lo stesso input produce ora: 3 persone, 60 minuti e la domanda "intere o già sfilettate?". Se si selezionano i filetti, la proposta diventa "Filetti di triglia in padella, pomodoro crudo e pane aromatico", con principio dominante di cottura differenziale.

## Correzione di architettura — catalogo chiuso

### Evidenza progettuale

Il progettista ha respinto sia l'idea di una sola ricetta verificata sia la nozione di ingredienti non supportati, richiedendo che Tavola operi come laboratorio completo di idee e ricette.

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

La proposta generata presentava fonti soprattutto igienico-sanitarie, ma non sufficienti per la tecnica centrale. Conteneva inoltre purga discutibile con semola, salinità incoerente, quantità d'olio non riconciliate, riduzione rischiosa del liquido, un elemento annunciato ma non eseguito e nessun reinserimento finale delle vongole. La riflessione dell'utente non riceveva risposta e il D+1 arrivava dopo pochi secondi.

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
- Dallo stato `waiting_dplus`, un messaggio libero che non fosse esattamente uno dei tre pulsanti di intenzione non riapriva un nuovo capitolo: restava intrappolato nella risposta generica finale. Nel simulatore locale questo non era visibile perché `public/chat.js` invia un `/start` automatico a ogni caricamento di pagina; nei dati di pilot già raccolti (`data/pilot.json`) l'utente `pilot-49ix8d` mostra infatti un evento `dplus_delivered` seguito da uno stato `locating`, coerente con un reset mascherato dal reload del simulatore e non con una reale ripartenza spontanea della conversazione.
- Selezionando "Fammi leggere tutto" e poi cliccando "Inizia la guida", il testo del pulsante veniva ri-analizzato dalla stessa logica che assegna la modalità, sovrascrivendo silenziosamente la scelta dell'utente con la modalità "guidata".
- La modalità "Solo punti critici" non aveva alcun effetto distinguibile rispetto a "Guidami": nessun ramo del codice leggeva `session.mode` durante la cucina.
- `public/dashboard.js` mostrava il passaggio corrente come frazione di un denominatore fisso `/5`, indipendentemente dal numero reale di passaggi della ricetta proposta (le ricette generate dal laboratorio ne hanno spesso un numero diverso).
- `setup.html` e il `README.md` del prodotto dichiaravano che la chiave OpenAI restasse solo in memoria e non venisse mai scritta su disco; il codice (`core/key-store.mjs`, chiamato da `server.mjs`) la cifra invece con AES-256-GCM e la scrive su `data/openai-key.protected`, sopravvivendo ai riavvii — comportamento corretto e voluto (cfr. D-018, verifica precedente in questo registro), ma descritto in modo inesatto agli utenti del pilot.
- Alcuni eventi richiesti esplicitamente per il logging del pilot non venivano mai registrati: dati di contesto mancanti, proposta rifiutata ("Altra idea"), passaggio mostrato, valutazione della riflessione, apertura della dashboard.
- Il gate editoriale (`qualityIssues` in `core/lab.mjs`) verificava la coerenza fra spesa e passaggi solo per due casi hardcoded (risotto, vongole); un ingrediente qualunque annunciato e mai reintrodotto in un piatto generato al di fuori di questi due casi non veniva intercettato.
- I tre piatti editoriali storici (alici, triglia intera, triglia a filetti) e lo stato `clarify_triglia` risultano irraggiungibili dal motore conversazionale dal momento in cui ogni richiesta passa dal laboratorio generativo (D-014): non sono un difetto in sé, ma codice morto non più documentato come tale.

### Interpretazioni

- Il difetto più grave (D-023) avrebbe reso il prodotto inutilizzabile su Telegram dopo la prima sera di utilizzo: un utente reale, senza il reset automatico che solo il simulatore web fornisce, sarebbe rimasto bloccato senza sapere di dover scrivere `/start` — comando che il prodotto vieta esplicitamente di richiedere.
- Il fatto che il simulatore mascherasse il problema è una lezione utile: un simulatore troppo "comodo" (reset automatico a ogni reload) può nascondere esattamente le rotture che il pilot dovrebbe scoprire. Vale la pena tenerlo presente nella Fase 2.
- Le imprecisioni nella copy sulla chiave non erano un rischio di sicurezza (la chiave è effettivamente cifrata e protetta), ma un rischio di fiducia: promettere agli utenti un comportamento diverso da quello reale del sistema.

### Decisioni derivate

- Corretto il motore conversazionale perché qualunque messaggio recapitato in uno stato "dormiente" (in attesa di D+1 o dopo la sua consegna) riapra automaticamente un nuovo capitolo, salvo le risposte esplicitamente legate al D+1 stesso (D-023).
- Corretta la selezione di modalità "Fammi leggere tutto" perché non venga sovrascritta al primo tocco successivo.
- Data alla modalità "Solo punti critici" una differenza di comportamento reale (segnali osservabili mostrati solo nel passaggio dominante e in quello finale di impiattamento).
- Il denominatore dei passaggi in dashboard ora usa il numero reale di passaggi della ricetta proposta.
- Corrette le descrizioni della persistenza della chiave in `setup.html` e nel `README.md` del prodotto.
- Aggiunti gli eventi di logging mancanti: `context_missing`, `proposal_rejected`, `step_shown`, `reflection_assessed`, `dashboard_opened`, `editorial_gate_rejected` (quest'ultimo ora con l'elenco strutturato dei motivi, non solo un messaggio libero).
- Ampliato il gate editoriale con un controllo generico di coerenza fra spesa e passaggi (D-024).
- Documentata nel codice, non rimossa, la natura di "codice morto" dei tre piatti editoriali e dello stato `clarify_triglia`, in attesa di una decisione esplicita su un loro eventuale riutilizzo come fallback offline.

### Verifica successiva (test automatici, senza rete)

- 40 test automatici (`npm test`, `node:test`) coprono: apertura automatica senza `/start`; le tre intenzioni operative; parsing di persone e tempo (incluso il bug storico "1 ora" → 30 minuti, verificato non reintrodotto); dati mancanti mai inventati e correttamente registrati come evento; le tre direzioni gastronomiche generate e la sola direzione scelta sviluppata; il gate editoriale (accetta un piatto coerente, respinge ingredienti mai citati nei passaggi, competenze generiche, impiattamento mancante, fonti insufficienti o non ammesse, falsa precisione da risotto, mancato reinserimento delle vongole); l'impiattamento sempre presente anche in modalità essenziale; la distinzione fra simulazione (passaggi completati in pochi secondi) ed esperienza reale (competenza registrata come "introdotto" solo con ritmo plausibile); il D+1 realmente differito e il suo follow-up leggero; la persistenza cifrata della chiave con un round-trip completo; la sopravvivenza della memoria di un utente a un riavvio reale del processo server (test di integrazione con processo separato, non solo verifica in-memory).
- Tutti i piatti generati registrati nel pilot (`qa-credit-live`, `qa-credit-live-2`) sono stati ripassati contro il nuovo controllo generico spesa/passaggi senza generare falsi positivi.

### Limite dichiarato di questa verifica

Non è stata eseguita una prova end-to-end con una chiamata reale al modello (`gpt-5-mini` via OpenAI) da questo ambiente: la chiave cifrata già salvata sul computer dell'utente è vincolata a quella macchina (derivazione della chiave di cifratura da utente e host locali, D-018) e non è decifrabile da questo ambiente cloud, e non è stata richiesta né incollata una chiave in chiaro qui, per coerenza con la regola "non incollarla nella chat". La prova con ingrediente non editoriale (Fase 0, checklist) resta da eseguire dal progettista con la propria chiave collegata tramite `/setup.html`, seguendo i passi indicati nel rapporto finale.

## Deployment reale — VM Google Cloud e bot Telegram (21 agosto 2026)

Partecipante e condizione: progettista, prima conversazione reale su Telegram (non simulata), N=1, non in cieco.

### Evidenze osservate

- Server pubblicato su una VM e2-micro gratuita di Google Cloud (`tavola-prod`, us-central1-c), raggiungibile via tunnel HTTPS gratuito ngrok (dominio dev `density-divinely-flip.ngrok-free.dev`), reso persistente con systemd (`tavola.service`, `tavola-tunnel.service`).
- Chiave OpenAI collegata sulla VM tramite `/setup.html`; `/api/status` conferma `labConnected:true`, modello `gpt-5-mini`.
- Bot Telegram reale creato (`@tavola_cucina_bot`), webhook registrato e confermato via `getWebhookInfo`.
- Prima conversazione reale: apertura senza `/start`, raccolta contesto (3 persone, 1 ora, ingrediente "seppia" — non editoriale) completata in due scambi, generazione delle tre direzioni gastronomiche (D-019) riuscita al primo tentativo.

### Failure osservato — pulsanti Telegram consegnati in modo silenziosamente fallito

Il messaggio con le tre proposte (testo + tre pulsanti) non è mai arrivato all'utente su Telegram, senza alcun errore visibile nei log del server.

Causa isolata con test diretti: `server.mjs` costruiva `callback_data` usando lo stesso testo esteso mostrato sul pulsante (nome e descrizione del piatto, 68–96 byte). Telegram impone un limite di 64 byte su questo campo e rifiutava l'intera chiamata `sendMessage` con `400 Bad Request: BUTTON_DATA_INVALID`; il codice non controllava la risposta HTTP della chiamata, quindi il fallimento restava completamente invisibile sia all'utente sia nei log.

### Decisione

Corretto `server.mjs`: `callback_data` viene troncato a 64 byte su un confine di carattere Unicode valido, mantenendo intatto il testo visibile del pulsante; aggiunto un log esplicito quando `sendMessage` restituisce un errore, per evitare che un fallimento futuro resti di nuovo silenzioso. Fix verificato con invii diretti sulla VM (stesso messaggio, prima rifiutato con `BUTTON_DATA_INVALID`, poi consegnato con successo). Applicato e committato sulla VM, poi sincronizzato su GitHub (commit `d72ca78`, vedi sessione del 21 agosto sotto).

### Verifica successiva — gate editoriale su una proposta reale (seppia, livello Gourmet)

Selezionato il livello "Gourmet": il laboratorio ha generato una bozza ("Seppia scottata, crema di sedano rapa e riduzione d'inchiostro"), respinta dal gate editoriale (D-015) con motivi concreti e strutturati: persone/tempo non confermati nel testo generato, impiattamento finale mancante (viola D-020), e un riferimento incongruente a un "risotto" non pertinente alla proposta. Il sistema si è astenuto correttamente, spiegando i motivi, invece di mostrare una ricetta scadente — comportamento coerente con D-015.

La latenza della generazione completa (dopo la scelta del livello) ha superato il timeout del webhook di Telegram (`getWebhookInfo` ha registrato `last_error_message: "Read timeout expired"`), ma il processo server ha comunque completato l'elaborazione e consegnato il messaggio di astensione in background, con qualche decina di secondi di ritardo rispetto al tocco del pulsante.

### Interpretazioni

- Il bug dei pulsanti conferma, con un caso reale, l'importanza già segnalata nell'audit del 19 agosto di non fidarsi di un "200 OK" lato client come prova di consegna: senza controllo esplicito della risposta di Telegram, un fallimento totale del messaggio principale del prodotto (le tre proposte) sarebbe rimasto invisibile per l'intero pilot.
- Il riferimento a "risotto" nel motivo di rifiuto è sospetto per una ricetta di seppia: potrebbe indicare una frase o un controllo di validazione residuo/hardcoded in `core/lab.mjs`, non un giudizio realmente specifico su questa proposta. Da verificare prima di fidarsi ciecamente delle motivazioni testuali del gate.
- La latenza della generazione completa (livello scelto → proposta) è un rischio di percezione ("non funziona") distinto dal corretto funzionamento tecnico: il sistema ha lavorato correttamente, ma senza un segnale intermedio l'utente non può distinguere un ritardo da un guasto.

### Ipotesi non verificate

- Se la latenza osservata sia un caso isolato (rete della VM, carico del modello) o un pattern ricorrente da correggere con un messaggio "sto pensando..." intermedio.
- Se il livello "Gourmet" fallisca il gate più spesso di "Semplice curato" o "Tecnico" per requisiti oggettivamente più complessi da soddisfare (impiattamento, coerenza) — non ancora testato sugli altri due livelli.

## Sessione di sviluppo su Claude/Cowork — 21 agosto 2026 (D-027 in codice, bug "risotto")

Partecipante e condizione: sessione di sviluppo (D-025), non una sessione di cucina reale. Clone del repository GitHub tramite token fornito dal progettista, lettura e modifica diretta del codice, verifica con la suite di test automatici.

### Evidenza rilevante sullo stato del repository

Al momento del clone, `git log` sul repository mostrava un solo commit (import iniziale del 20 agosto). Il codice dei tasti rapidi persone/tempo (D-027) descritto in `DECISIONS.md` e `NEXT.md` come "già implementato e testato in locale, 46 test passano" non era presente in `core/tavola.mjs`: il motore poneva ancora la domanda combinata in testo libero ("Per quante persone, quanto tempo avrai e quali ingredienti..."). Anche `DECISIONS.md`, `EVIDENCE.md` e `NEXT.md` nel repository versionato risultavano fermi allo stato del 20 agosto, senza le voci più recenti (D-027, D-028, la sessione "Deployment reale" del 21 agosto) presenti invece nei documenti canonici del progetto Claude. L'implementazione descritta come completata in una sessione precedente risulta quindi essersi persa fra quella sessione e il repository versionato — coerente con quanto già segnalato in `NEXT.md` (deploy sulla VM interrotto a metà), ma con un dettaglio più preciso: non è solo il deploy sulla VM a essere incompleto, il codice e i documenti aggiornati non erano mai arrivati su GitHub.

### Decisione

Portati i documenti canonici nel repository allo stato corrente (allineate alle copie del progetto Claude) prima di aggiungere le voci di questa sessione, per eliminare la divergenza. Implementato D-027 da zero in questa sessione, seguendo esattamente la specifica già approvata in `DECISIONS.md` (nessuna modifica alla decisione stessa): nuovi stati `collecting_people`/`collecting_time` in `core/tavola.mjs`, tasti rapidi (persone: 1/2/3/4/5+; tempo: 15 min/30 min/45 min/1 ora/più di un'ora), parser morbidi `parsePeopleLoose`/`parseTimeLoose` che riconoscono le etichette dei tasti oltre al testo libero già gestito dai parser rigorosi, e scorciatoia one-shot (`tryOneShot`) che salta direttamente alle tre direzioni gastronomiche quando un solo messaggio contiene già persone, tempo e ingrediente — verificata sia al primo messaggio dopo la scelta dell'intenzione sia a metà flusso (persone già note, tempo e ingrediente insieme). "5+" è mappato su 5 persone; "più di un'ora" su 90 minuti come valore rappresentativo, coerente con l'uso di `context.time` come minuti interi nel laboratorio generativo.

Aggiornati anche i test preesistenti che assumevano il vecchio stato unico `collecting_context` subito dopo la scelta dell'intenzione (in `test/engine.test.mjs` e `test/server.integration.test.mjs`), aggiunti nuovi test per i tasti, per i valori "5+"/"più di un'ora" e per entrambe le varianti della scorciatoia one-shot.

### Failure osservato e corretto — controllo "risotto" nel gate editoriale mai vincolato al risotto

Indagato il riferimento sospetto a "risotto" comparso nel motivo di rifiuto del gate su una proposta di seppia (21 agosto, vedi sopra). Causa trovata in `core/lab.mjs`, `qualityIssues()`: il controllo `/sigill.*amid|frusta.*ris/i.test(all)` non era mai vincolato al tipo di piatto, a differenza degli altri controlli specifici (es. quelli sulle vongole, correttamente condizionati da `/vongol/i.test(...)`). In particolare `frusta.*ris` intercettava qualunque piatto contenente la parola "frusta" seguita, ovunque più avanti nel testo concatenato di tutti i passaggi, dalla sola sequenza di tre lettere "ris" — presente in moltissime parole italiane comuni (risultato, riscaldare, riserva, risalire...) e quindi non specifica del risotto.

Un test preesistente (`test/unit.test.mjs`) certificava di fatto il comportamento scorretto: verificava che la frase pseudotecnica "la tostatura sigilla l'amido", applicata a un piatto di "pesce spada", producesse un messaggio contenente la parola "risotto" — e lo considerava corretto.

### Decisione

Separati i due controlli in `qualityIssues()`:
- la falsa precisione "la tostatura sigilla l'amido" resta un controllo generico su qualunque piatto (coerente con le istruzioni del laboratorio, che la vietano in generale), ma il messaggio non nomina più il risotto quando il piatto non lo è;
- il controllo sul gesto scorretto ("si frusta invece di mantecare") ora si applica solo quando il piatto è davvero un risotto (titolo, principio tecnico o richiesta originale contengono "risott").

Corretto anche il test preesistente che certificava il comportamento sbagliato, e aggiunti due test di regressione: uno che riproduce lo scenario reale (piatto di seppia con "frusta" nel testo, nessun riferimento al risotto atteso nell'esito) e uno che conferma che il controllo scatta ancora correttamente su un vero risotto.

### Verifica successiva

Suite di test completa eseguita dopo entrambe le correzioni: 52 test, tutti superati (`npm test`, `node:test`), incluse le nuove verifiche su tasti rapidi, scorciatoia one-shot e gate del risotto.

### Limite dichiarato di questa verifica

Come nell'audit del 19 agosto, non è stata eseguita alcuna chiamata reale al modello da questo ambiente (nessuna chiave OpenAI disponibile qui, per policy nessuna è stata richiesta né incollata). Le correzioni sono state verificate con la suite automatica e con fixture di test, non con una nuova conversazione reale su Telegram: la verifica su Telegram reale del flusso a tasti (D-027) resta da fare dopo il deploy sulla VM. Il codice e i documenti canonici sono stati committati e pushati su GitHub al termine di questa sessione; il deploy sulla VM di produzione resta un passaggio separato, non eseguito da qui (nessun accesso diretto alla VM da questo ambiente).

## Deploy sulla VM e miglioramenti successivi del progettista (21–22 agosto 2026)

### Evidenze osservate

- La VM di produzione è stata riallineata al commit di GitHub con il fix D-027/risotto (`git reset --hard origin/main`) e riavviata; verificato funzionalmente via `/api/message` locale che un nuovo utente arriva a `collecting_people` con i tasti 1/2/3/4/5+; utente di test rimosso da `data/pilot.json`.
- Il progettista ha poi lavorato direttamente sulla VM/repository, senza una sessione Claude/Cowork intermedia: commit `16df30c` (22 agosto, 12:46 CEST) "Webhook Telegram fire-and-forget e messaggio Sto pensando durante la generazione" e commit `c8624f4` (22 agosto, 12:53 CEST) "Aggiunge test di regressione per il webhook fire-and-forget". Il messaggio del primo commit descrive esattamente la correzione anticipata come ipotesi non verificata nella sezione precedente: il webhook risponde subito 200 invece di attendere l'intera elaborazione, e un messaggio di attesa viene inviato appena l'utente sceglie un livello (stato `difficulty_choice`), prima della chiamata lenta al laboratorio.
- Questi due commit non hanno aggiornato `DECISIONS.md`, `EVIDENCE.md` o `NEXT.md`: il lavoro è rimasto tecnicamente completo ma non documentato nei registri canonici fino alla sessione di riconciliazione del 25 agosto (vedi sotto).
- `tavola.service` sulla VM risulta attivo ininterrottamente dal 22 agosto 2026 alle 10:55 UTC (circa due minuti dopo l'ultimo dei due commit), coerente con un riavvio del servizio fatto dal progettista subito dopo aver deployato questi cambi direttamente sulla VM.

### Interpretazione

Il repository GitHub (D-026) funge davvero da fonte canonica condivisa: il progettista può e infatti continua a modificarlo direttamente, non solo tramite sessioni Claude/Cowork. Questo è coerente con l'obiettivo di D-026 (non restare legati a un solo ambiente di lavoro), ma introduce un rischio operativo nuovo: una sessione che riprende il lavoro assumendo che i documenti canonici del progetto Claude siano sincronizzati con il codice reale può scoprire un disallineamento, come è successo qui.

### Decisione

Aggiunta la decisione D-029 (webhook fire-and-forget e messaggio di attesa) a `DECISIONS.md`, per chiudere il disallineamento fra codice live e documentazione. Aggiunto un promemoria in `NEXT.md` che invita ogni sessione futura a controllare `git log` sulla VM/repository prima di assumere che questo progetto Claude sia già allineato.

## Sessione di riconciliazione — 25 agosto 2026 (deploy D-027 verificato, disallineamento documentale scoperto e corretto)

Partecipante e condizione: sessione di sviluppo (D-025) con l'obiettivo iniziale di completare un deploy che una sessione precedente aveva lasciato interrotto a metà per una disconnessione del browser usato per pilotare il terminale Cloud Shell.

### Evidenza osservata

Riconnesso a Cloud Shell e alla VM di produzione (`gcloud compute ssh tavola-server`) per riprendere il trasferimento della patch interrotta, `git log` e `git status` sulla VM hanno mostrato che il repository era già a un commit (`c8624f4`) più avanzato di quello atteso, con working tree pulito e allineato a `origin/main`: il codice dei tasti rapidi persone/tempo (D-027), il fix del gate del risotto e — inaspettatamente — un webhook fire-and-forget con messaggio di attesa (D-029, non ancora conosciuto da questa sessione) risultavano già live. La suite di test rieseguita sulla VM ha dato 53/53 test superati, e `/api/status` ha confermato il servizio attivo (`labConnected:true`, modello `gpt-5-mini`). Il tentativo di applicare comunque la patch preparata da questa sessione (`git apply --check`) è fallito per conflitto di contesto, proprio perché il codice di destinazione era già cambiato in modo indipendente — segnale corretto che ha impedito una sovrascrittura.

### Interpretazione

Il deploy che questa sessione doveva completare era già stato completato da altre due fonti indipendenti nel frattempo: una sessione Claude/Cowork del 21 agosto (che aveva clonato il repository con un token fornito dal progettista, corretto D-027 e il bug del risotto, vedi sopra) e il progettista stesso il 22 agosto (webhook fire-and-forget, D-029). Nessuna delle due aveva però aggiornato tutti e tre i documenti canonici in modo completo: la sessione del 21 agosto ha documentato sé stessa correttamente, ma il lavoro del 22 agosto non era affatto documentato in `DECISIONS.md`/`EVIDENCE.md`, e `NEXT.md` conteneva ancora una voce contraddittoria ("sincronizzazione sulla VM ancora da fare" ripetuta in una sezione, mentre un'altra sezione dello stesso file la dava già per completata).

### Decisione

Non applicata la patch preparata da questa sessione (resa superflua e potenzialmente regressiva rispetto al codice già live, che include anche D-029). File temporanei di trasferimento rimossi dalla VM. Riscritti `DECISIONS.md` (aggiunta D-029), `NEXT.md` (corrette le voci contraddittorie, aggiunto il promemoria sul controllo di `git log`) ed `EVIDENCE.md` (questa voce) per portare i documenti canonici allo stato realmente corrente. Nessuna modifica al codice del prodotto in questa sessione.

### Verifica successiva

`npm test` rieseguito sulla VM al termine della sessione: 53/53 test superati. `/api/status` confermato attivo. Verifica su una conversazione reale con `@tavola_cucina_bot` su Telegram non eseguita in questa sessione (resta l'unico passaggio ancora aperto, cfr. NEXT.md).

### Limite dichiarato di questa verifica

Questa sessione non ha eseguito una nuova conversazione reale su Telegram, quindi non conferma direttamente l'esperienza utente dei tasti rapidi (D-027) né del messaggio di attesa (D-029) in produzione — solo che il codice è live, testato automaticamente e in esecuzione senza errori nei log del servizio.

## Failure osservato — ingrediente sostituito silenziosamente dopo un rifiuto del gate (25 agosto 2026)

Partecipante e condizione: progettista, prova Fase 0 nel simulatore web (`density-divinely-flip.ngrok-free.dev`), non su Telegram reale. Tentativo di percorrere il checklist "prova del progettista" dall'inizio.

### Evidenza osservata (conversazione)

Sequenza esatta nel simulatore: scelta dell'intenzione, persone e tempo con i tasti rapidi (D-027), ingrediente libero "cavolfiore". Le tre direzioni gastronomiche generate erano coerenti e distinte (bistecche di cavolfiore arrostite / gratin con besciamella / cavolfiore in tre consistenze), coerente con D-019. Selezionato il livello "Tecnico" (gratin con besciamella): il gate editoriale (D-015) ha respinto la bozza per un passaggio di impiattamento mancante, con il messaggio "Ho respinto la proposta perché non superava il controllo gastronomico: manca un ultimo passaggio esplicito di impiattamento. Non te la presento come ricetta affidabile." Nessun pulsante di follow-up è stato mostrato dopo il rifiuto.

A quel punto è stato scritto un messaggio libero per chiedere di riprovare un altro livello sullo stesso piatto: "prova un altro livello, semplice curato". Il sistema non ha riconosciuto la richiesta come una riselezione di livello sul cavolfiore: ha generato tre nuove direzioni gastronomiche completamente diverse, per "petto di pollo" — un ingrediente mai nominato in nessun punto della conversazione — senza segnalare il cambio né chiedere conferma.

### Evidenza osservata (lettura del codice, `core/tavola.mjs` e `core/lab.mjs` sulla VM)

- Nel gestore di `proposeFromLab` (catch di `EDITORIAL_GATE_FAILED`), un rifiuto del gate imposta esplicitamente `user.state='collecting_context'` (non `'difficulty_choice'`) prima di mostrare il messaggio di rifiuto. Il messaggio di rifiuto stesso non indica che la conversazione è tornata a uno stato di raccolta contesto, né invita a fare altro che leggere la spiegazione.
- Il gestore dello stato `collecting_context` (righe ~114–123) tratta qualunque testo libero ricevuto in quello stato come una descrizione completa e nuova della richiesta: se `user.context.people`/`user.context.time` sono già valorizzati non vengono richiesti di nuovo, ma la riga `user.context.raw=text;user.context.ingredients=extractIngredients(n);` sovrascrive incondizionatamente il contesto precedente (compreso l'ingrediente) con il nuovo testo, qualunque cosa contenga.
- L'unico controllo prima di procedere è `hasFoodRequest(text)`, una euristica che considera "richiesta di cibo valida" qualunque testo contenga almeno una parola di 4+ lettere dopo aver rimosso un piccolo elenco di parole di riempimento (persone, minuti, tempo, voglio, vorrei, fare, usare...). Il messaggio "prova un altro livello, semplice curato" supera questo controllo (contiene "prova", "altro", "livello", "semplice", "curato"), pur non nominando alcun ingrediente o piatto.
- `generateDifficultyIdeas(context)` (`core/lab.mjs`) costruisce il prompt per il modello usando direttamente `context.raw` ("Richiesta: ${context.raw}. Proponi esattamente tre piatti realmente diversi che usano l'ingrediente o rispettano il piatto richiesto...") senza alcuna verifica, prima della chiamata, che `context.raw` contenga davvero un ingrediente o un piatto identificabile. Con un `context.raw` privo di riferimenti concreti, il modello ha prodotto comunque tre direzioni — inventando "petto di pollo" come ingrediente di comodo — invece di segnalare l'ambiguità.

### Interpretazione

Il meccanismo è confermato dal codice, non solo ipotizzato: è la combinazione di tre elementi, non uno solo. Primo, il rifiuto del gate riporta silenziosamente l'utente in uno stato di "raccolta contesto da zero" senza dirlo esplicitamente. Secondo, quello stato tratta qualunque testo successivo come una richiesta completamente nuova, sovrascrivendo il contesto precedente invece di offrire un modo per correggere solo il livello o la proposta appena respinta. Terzo, la validazione "esiste un ingrediente in questo testo?" è troppo permissiva (basta una parola lunga) e la chiamata al modello non ha una rete di sicurezza equivalente: di fronte a un contesto ambiguo, il modello ha preferito inventare un ingrediente plausibile piuttosto che astenersi o chiedere chiarimento.

Questo è imparentato con il "Failure osservato — ingrediente ignorato" già registrato in questo file, ma non è lo stesso bug: quello riguardava la primissima raccolta del contesto (un ingrediente esplicito nel messaggio veniva ignorato a favore di una ricetta fissa); questo riguarda invece il percorso di recupero dopo un rifiuto del gate, dove un messaggio che non descrive affatto un nuovo ingrediente viene comunque interpretato come tale, e la sostituzione avviene silenziosamente lato laboratorio generativo, non lato ricetta fissa.

### Ipotesi non verificate

- Se il modello (`gpt-5-mini`) inventi sistematicamente un ingrediente quando `context.raw` è ambiguo, o se "petto di pollo" sia stato un caso isolato di questa chiamata.
- Se lo stesso problema si presenti anche quando il gate rifiuta al primo tentativo su un ingrediente editoriale invece che generativo.
- Quanto sia frequente, in uso reale, che un utente scriva testo libero dopo un rifiuto del gate invece di abbandonare la conversazione.

### Decisione

Non è stata applicata alcuna correzione al codice in questa sessione: il meccanismo è stato accertato tramite lettura diretta del codice sulla VM (SSH via Cloud Shell), ma si tratta di codice di prodotto già live, e la correzione non era esplicitamente richiesta. Il ritrovamento viene segnalato al progettista prima di intervenire, per decidere se e come correggere (es. mantenere un riferimento all'ingrediente/direzione già scelta durante il recupero da un rifiuto del gate, offrire esplicitamente un modo per cambiare solo il livello, o far sì che il laboratorio chieda chiarimento invece di inventare un ingrediente quando il contesto è ambiguo).

### Limite dichiarato di questa verifica

La prova Fase 0 nel simulatore si è interrotta a questo punto: non sono stati ancora completati i passaggi di preparazione guidata, un dubbio imprevisto durante la cucina, la chiusura, né il controllo della dashboard dopo la sessione. Il resto del checklist Fase 0 resta da eseguire.

## Correzione — ingrediente sostituito silenziosamente dopo un rifiuto del gate (26 agosto 2026)

Partecipante e condizione: sessione di sviluppo (D-025) su richiesta esplicita del progettista ("Correggilo ora") in risposta al failure documentato sopra. Intervento diretto sul codice della VM via SSH (Cloud Shell), non tramite il repository clonato localmente in un ambiente Claude/Cowork.

### Decisione e intervento

Corretto `core/tavola.mjs`, funzione `proposeFromLab`: quando il gate editoriale respinge una proposta (`EDITORIAL_GATE_FAILED`) e `user.context.difficultyIdeas` esiste ancora (cioè le tre direzioni gastronomiche di D-019 erano già state generate), lo stato torna a `difficulty_choice` invece che a `collecting_context`, e il messaggio di rifiuto invita esplicitamente a scegliere un'altra delle tre direzioni oppure a scrivere un nuovo ingrediente, mostrando di nuovo i tre pulsanti di livello. Se `difficultyIdeas` non esiste (rifiuto in un punto diverso del flusso), il comportamento precedente resta invariato (torna a `collecting_context`).

Non toccato il resto del percorso di errore (fallimenti generici del laboratorio, non legati al gate) né la logica di `collecting_context` in sé, per mantenere la correzione mirata al meccanismo esatto osservato nel failure.

### Verifica tecnica

- Modifica applicata con un confronto di stringa esatto verificato prima della scrittura (lettura byte-per-byte del file per accertare whitespace e caratteri accentati, dopo un primo tentativo fallito per una divergenza di spazi di indentazione non visibile a schermo): nessuna scrittura alla cieca.
- `node --check` su `core/tavola.mjs` dopo la modifica: sintassi valida.
- Aggiornato il test preesistente in `test/engine.test.mjs` che certificava il comportamento precedente (asseriva `user.state === 'collecting_context'` dopo un doppio rifiuto del gate su una bozza debole con livello "gourmet" già scelto da tre direzioni generate): ora asserisce `user.state === 'difficulty_choice'`, con commento aggiornato.
- Suite completa: 53/53 test superati (`npm test`) dopo la correzione, incluso il test aggiornato che riproduce esattamente il meccanismo del failure (due rifiuti consecutivi del gate su una bozza debole, con `context.difficultyIdeas` già popolato).
- Servizio riavviato (`sudo systemctl restart tavola.service`): attivo, `/api/status` conferma `labConnected:true`, modello `gpt-5-mini`.
- Commit locale sulla VM (`e1f3b13`, branch `main`, un commit avanti a `origin/main`). Il push su GitHub è stato bloccato da un controllo di sicurezza di questa sessione (non un problema di credenziali VM in sé): resta da fare dal progettista o da una sessione con permesso esplicito di push.

### Limite dichiarato di questa verifica

Non è stata ripetuta una conversazione reale con una nuova chiamata al modello che riproduca esattamente lo scenario originale (cavolfiore → Tecnico → rifiuto → "prova un altro livello, semplice curato") end-to-end nel simulatore: la verifica si basa sul test automatico che riproduce il meccanismo esatto (stato dopo un rifiuto del gate con `difficultyIdeas` popolato), non su una nuova osservazione dal vivo. Una verifica end-to-end nel simulatore o su Telegram resta consigliata prima di considerare chiuso il failure, e resta anche da completare il resto del checklist Fase 0 interrotto (preparazione guidata, dubbio imprevisto, dashboard).

## Prova end-to-end completata nel simulatore — 26 agosto 2026 (correzione del 26 agosto verificata dal vivo, due nuovi limiti trovati)

Partecipante e condizione: progettista (identità di test "Tester" nel simulatore web, `density-divinely-flip.ngrok-free.dev`), sessione unica dall'apertura alla chiusura, dichiarata come simulazione dell'interfaccia (non cucina reale). Prosegue e completa il checklist Fase 0 interrotto il 25 agosto.

### Evidenza osservata (percorso completo)

- Apertura senza `/start` (D-021); scelta dell'intenzione "Ho gli ingredienti, cuciniamo"; persone e tempo con i tasti rapidi (D-027: "2", "45 min"); ingrediente libero "melanzane, ne ho tre grandi, vorrei qualcosa di sfizioso".
- Tre direzioni gastronomiche generate, coerenti e distinte (D-019): Semplice curato (steaks alla griglia con yogurt), Tecnico (involtini ripieni di ricotta salata), Gourmet (confit con crema affumicata) — nessuna delle tre è una semplice variazione di guarnizione sulle altre.
- Selezionato "Tecnico": il gate editoriale (D-015) ha accettato la proposta al primo tentativo, con principio tecnico dominante ("par-cottura controllata delle fette di melanzana"), formula termine→meccanismo→gesto→risultato rispettata, e una previsione osservabile esplicita ("Predizione: fette par-cotte e raffreddate rimangono flessibili...").
- Percorso "Guidami" completato per tutti i 7 passaggi mostrati; ogni passaggio include un callout "Osserva" con un segnale concreto e verificabile (es. "il sugo si addensa, diventa lucido e attacca leggermente il cucchiaio"); il passaggio 7/7 è un impiattamento esplicito con disposizione, temperatura di servizio (50–60 °C) e finiture con funzione gustativa (D-020) — nessuna decorazione gratuita.
- Chiusura: alla domanda sull'esito rispetto alla previsione tecnica, selezionata onestamente l'opzione "Non l'ho cucinato: era una simulazione"; il sistema ha risposto correttamente "Questa prova sarà registrata come simulazione dell'interfaccia, non come esperienza culinaria" (D-016) e ha comunque chiesto una riflessione libera.
- Riflessione libera fornita ("forse la quantità di sugo, mi sembra tanta rispetto agli involtini"): risposta strutturata in Plausibile / Rischio-limite / Prova concreta per la prossima volta, non un'archiviazione muta (D-017). Confermato esplicitamente "Sessione registrata come simulazione: non aggiorna la competenza" e "Il D+1 arriverà domattina" (D-017: D+1 realmente differito, non simulato subito dopo la chiusura) — non è stato quindi forzato alcun D+1 immediato in questa prova, per coerenza con la decisione.
- Capitolo chiuso con invito a iniziare una nuova conversazione dai tre pulsanti di intenzione, senza comandi tecnici (D-021).

### Failure osservato — un dubbio libero durante la guida non riceve una risposta reale

Durante il passaggio 1/7, è stato scritto un dubbio imprevisto e genuino in testo libero: "il basilico che ho è secco e un po' vecchio, ha ancora senso usarlo o meglio saltarlo?". Il sistema non lo ha interpretato come una domanda: ha risposto con un messaggio fisso ("Resto sul passaggio corrente. Puoi dirmi 'fatto, avanti', chiedere 'perché?' oppure descrivere un dubbio.") che invita a riformulare, ignorando il contenuto del messaggio.

Ripetuto il test cliccando il pulsante "Ho un dubbio" (stesso passaggio): la risposta è stata "Mantieni 4–5 mm: più sottili si disfano, più spesse rimangono rigide" — un suggerimento fisso legato al passaggio corrente (spessore delle fette), identico indipendentemente dal contenuto del dubbio reale (basilico, non spessore). Il passaggio 4/7 (ricotta e basilico), generato subito dopo, continuava a usare basilico fresco senza alcun adattamento, confermando che la domanda non era stata né letta né incorporata.

### Interpretazione

Il pulsante "Ho un dubbio" e il testo libero durante un passaggio guidato non attivano un'assistenza reale sul contenuto specifico del dubbio: producono un suggerimento statico legato al passaggio (probabilmente precompilato insieme al passaggio stesso, non generato al momento in risposta alla domanda). Questo è distinto e più specifico del limite già noto "vocali e fotografie sono simulati": qui il canale è testo semplice, già disponibile, e il dubbio non viene comunque elaborato. Per un target che deve poter "porre un dubbio imprevisto durante la preparazione" (D-006/checklist Fase 0), questo è un gap sostanziale fra la promessa del prodotto e il comportamento osservato.

### Failure osservato — la dashboard non permette di selezionare quale tester osservare

La pagina `/dashboard` elenca più tester (in questa sessione: "daniele" con 82 eventi in stato `difficulty_choice`, e "Tester" con 69 eventi nello stato `waiting_dplus` appena raggiunto in questa prova). Le card "Competenza osservata", "Sessione" ed "Evidenze del pilot" mostrano però sempre gli stessi dati (quelli di "daniele", una sessione precedente), senza cambiare dopo aver cliccato sulla riga "Tester". Non è stato individuato alcun controllo (selettore, link, parametro) che permetta di scegliere quale tester ispezionare.

### Interpretazione

La dashboard nella sua forma attuale sembra pensata e verificata per un solo utente alla volta (coerente con le prove N=1 fatte finora), non per un pannello multi-tester. Questo è rilevante prima della Fase 2 (2–3 tester) e soprattutto della Fase 3 (5–10 tester): senza un modo per selezionare il tester, la dashboard non può servire al suo scopo dichiarato (D-007: mostrare competenze, evidenze e progressione) per nessuno tranne il primo utente registrato.

### Ipotesi non verificate

- Se il mancato adattamento ai dubbi liberi sia un limite di implementazione (nessuna chiamata al modello collegata al testo del dubbio) o una scelta deliberata non documentata altrove.
- Se la dashboard abbia già un meccanismo di selezione non individuato in questa sessione (es. un parametro URL) oppure ne sia del tutto priva.
- Se "daniele" sia effettivamente l'utente predefinito hardcoded o semplicemente il primo risultato restituito dalla query sugli utenti registrati.

### Decisione

Nessuna correzione al codice applicata in questa sessione: entrambi i failure sono stati osservati durante una prova end-to-end senza richiesta esplicita di intervento immediato, coerente con la pratica già seguita per il rinvenimento del 25 agosto. Entrambi vengono segnalati al progettista prima di un'eventuale correzione, per decidere priorità (probabile: il dubbio libero durante la guida è più urgente della selezione multi-tester in dashboard, dato che quest'ultima non serve finché il pilot resta N=1).

### Verifica successiva

Il fix del 26 agosto sul rifiuto del gate (D-030) non è stato ri-osservato dal vivo in questa prova, perché il gate ha accettato la proposta al primo tentativo (nessun rifiuto generato). La correzione resta quindi verificata solo dal test automatico aggiornato, non da una nuova osservazione end-to-end del percorso di rifiuto — questo limite, già dichiarato nella voce precedente, rimane aperto.

### Limite dichiarato di questa verifica

Checklist Fase 0 ora sostanzialmente completo (percorso dall'apertura alla chiusura, un dubbio imprevisto tentato, dashboard controllata), ma con due nuovi failure aperti (dubbio libero non risposto; dashboard senza selezione del tester) invece di una chiusura pulita. Resta da rifare, in una prova futura, uno scenario che forzi un secondo rifiuto del gate per osservare dal vivo il comportamento corretto di D-030.

## Correzione — dubbio libero durante la guida e selezione del tester in dashboard (26 agosto 2026)

### Evidenza osservata

Su richiesta esplicita del progettista ("risolvi tutti e 3 i problemi prima di procedere oltre"), sono stati corretti nella stessa sessione i due failure descritti sopra, più un tentativo di push su GitHub.

1. **Dubbio libero durante la guida** (D-031): aggiunta la funzione `answerCookingDoubt` in `core/lab.mjs` (stesso pattern di `assessReflection`, chiamata a OpenAI Responses API con fallback) e collegato il ramo finale dello stato `cooking` in `core/tavola.mjs` a questa funzione invece che a un messaggio fisso. Aggiunto un test di regressione con fetch mockato che riproduce lo scenario esatto del failure (dubbio sul basilico vecchio durante un passaggio); verificato che la risposta non contiene più il vecchio messaggio di stallo e contiene la parola chiave del dubbio posto. 54/54 test passano. Applicato sulla VM (`git commit 35bb2e6`), servizio riavviato (`systemctl restart tavola.service`), verificato attivo (`curl localhost:4310/` → 200).
   **Limite dichiarato:** verificato solo con la suite automatica (fetch mockato) e con il riavvio del servizio; non riverificato dal vivo nel simulatore con una chiamata reale al laboratorio generativo.

2. **Dashboard senza selezione del tester** (D-032): causa individuata leggendo `public/dashboard.js` — la funzione `load()`, richiamata ogni 5 secondi da `setInterval`, mostrava sempre incondizionatamente il primo utente della lista, sovrascrivendo qualunque selezione manuale entro pochi secondi. Corretto aggiungendo una variabile di selezione persistente (inizializzata anche dal parametro URL `?user=<id>`), evidenziazione visiva della riga selezionata, e aggiornamento dell'URL al click. 54/54 test passano (la pagina non è coperta dalla suite automatica, che copre solo `core/`). Applicato sulla VM (`git commit 3378c68`), servizio riavviato.
   **Verifica dal vivo:** aperta la dashboard tramite web preview di Cloud Shell con un tunnel SSH verso la VM (porta 4310). Cliccata la riga del tester "Tester" (diverso dal primo, "daniele"): le card "Competenza osservata", "Sessione" ed "Evidenze del pilot" si sono aggiornate correttamente ai dati di quel tester, la riga è rimasta evidenziata e la selezione è rimasta stabile dopo un'attesa di 7 secondi (oltre il ciclo di 5 secondi che prima resettava la vista). Riaperta la pagina direttamente con l'URL `?user=pilot-4x4pzg`: il tester corretto risultava selezionato già al primo caricamento, senza bisogno di cliccare.

3. **Push dei commit pendenti su GitHub** (D-033): tentato `git push origin main` dalla VM (remote già configurato). A differenza del tentativo precedente (bloccato da un controllo di sicurezza della sessione che aveva applicato la correzione, D-030), questa volta il comando ha semplicemente chiesto username e credenziale HTTPS per GitHub ("Username for 'https://github.com'"). La sessione non inserisce credenziali per conto dell'utente in nessun caso: il comando è stato interrotto con Ctrl+C prima di digitare qualsiasi valore. I tre commit (`e1f3b13`, `35bb2e6`, `3378c68`) restano solo sulla VM.

### Interpretazione

Le correzioni 1 e 2 chiudono i due gap di comportamento osservati nella prova Fase 0 precedente, con verifica automatica (test) più, per la dashboard, una verifica visiva diretta nel browser. Il push su GitHub resta bloccato non per una policy di sicurezza della sessione applicata al codice, ma per la mancanza di un metodo di autenticazione configurato sulla VM che non richieda di inserire credenziali per conto del progettista — un limite strutturale, non specifico di questa sessione.

### Decisione

Vedi D-031, D-032, D-033. Il progettista deve configurare un metodo di autenticazione persistente su GitHub (token in un credential helper, o chiave SSH) per completare il push, oppure eseguirlo lui stesso.

## Verifica su Telegram reale — tasti rapidi persone/tempo (27 agosto 2026)

### Evidenza osservata

Il progettista ha riportato, in una conversazione reale con `@tavola_cucina_bot` su Telegram, che i tasti rapidi per persone e tempo (D-027) funzionano. Il resoconto è sintetico ("ho fatto la prova sui tasti rapidi e funziona"), senza un log dettagliato della conversazione allegato.

### Limite dichiarato di questa verifica

Non è confermato esplicitamente in questa prova se il messaggio di attesa ("sto pensando...", D-029) sia comparso durante la stessa conversazione: la verifica copre i tasti rapidi, non necessariamente la combinazione con D-029 richiesta dal checklist di Fase 1. Restano non testati su Telegram reale: fotografie, vocali, gestione di preferenze/consenso, D+1 programmato in una fascia scelta dall'utente.

### Decisione

Il checklist di Fase 1 in NEXT.md viene aggiornato di conseguenza (tasti rapidi segnati come verificati su Telegram reale).

## Sviluppo — consenso Telegram, orario D+1 configurabile e consegna proattiva (27 agosto 2026)

Partecipante e condizione: sessione di sviluppo (D-025), non una sessione di cucina reale. Lavoro richiesto dal progettista per completare i tre punti rimanenti della checklist di Fase 1 ("gestione delle preferenze e consenso", "D+1 in una fascia scelta dall'utente", oltre alla verifica di foto/vocali che richiede il telefono del progettista e non è stata toccata qui).

### Evidenza — scelte di design esplicite del progettista

Data l'ambiguità di design (che tipo di consenso, che granularità di orario, consegna push o pull), è stata posta una domanda diretta al progettista prima di scrivere codice. Risposte ricevute:

- Consenso: messaggio unico iniziale ("Ho capito, iniziamo") prima del primo capitolo, non un comando `/privacy` separato.
- Fascia D+1: orario libero in testo naturale (es. "8:00", "alle 9"), non una manciata di fasce prefissate.
- Consegna D+1: proattiva — il server invia da solo il messaggio all'orario dovuto, invece di aspettare che l'utente riscriva.

### Implementazione (in ambiente di sviluppo, non ancora sulla VM di produzione)

- `core/tavola.mjs`: nuovo campo `user.preferences.dplusTime` (default `'08:30'`), nuovo pulsante "⏰ Cambia orario D+1" nel menu del D+1, nuovo stato `awaiting_dplus_time` con parser `parseClockTime`, funzione `nextDueIso(user)` che sostituisce il precedente `nextMorningIso()` fisso, nuova funzione esportata `isDplusDue(user)`, e `dplus(user,{proactive})` che tagga ogni evento `dplus_delivered` con `delivery:'proactive'|'reactive'`.
- `server.mjs`: gate di consenso sul webhook Telegram (utenti nuovi vedono il messaggio unico prima di procedere; utenti già esistenti prima di questa modifica vengono "grandfathered" automaticamente, senza dover dare consenso retroattivamente) e un nuovo scheduler (`checkProactiveDplus`, eseguito ogni 60 secondi più una chiamata immediata all'avvio) che spinge il D+1 agli utenti Telegram quando è dovuto, senza attendere un loro messaggio.
- Dettaglio completo della decisione in DECISIONS.md, D-034.

### Verifica

60/60 test automatici (`node:test`) superati in ambiente di sviluppo: 54 preesistenti più 5 nuovi test sul motore (orario di default, cambio orario, orario non riconosciuto, `nextDueIso` che rispetta la preferenza, `isDplusDue` vero/falso, tag `delivery` proattivo/reattivo) più l'aggiornamento di 2 test di integrazione preesistenti che assumevano l'assenza del gate di consenso.

### Failure osservato e corretto — corruzione silenziosa di un blocco trasferito

Riprendendo il trasferimento interrotto (vedi voce precedente), è stato scoperto un problema più serio di una semplice interruzione: uno dei blocchi base64 usati per trasferire `core/tavola.mjs` sulla VM era arrivato **corrotto** — stessa lunghezza in byte del blocco originale, ma contenuto diverso. Il controllo fatto in precedenza (solo `wc -c`, cioè il conteggio dei byte) non era sufficiente a rilevarlo: una sostituzione di caratteri a parità di lunghezza passa inosservata se si verifica solo la lunghezza. Il sintomo osservato è stato un errore di sintassi (`SyntaxError: Unexpected token ':'`) al primo tentativo di `node --check core/tavola.mjs` dopo aver applicato la patch, in un punto del file che a un'ispezione visiva sembrava corretto.

### Interpretazione

La causa più probabile è un artefatto della digitazione automatizzata di stringhe molto lunghe (migliaia di caratteri) nel terminale Cloud Shell: il conteggio dei byte non basta a garantire l'integrità del contenuto quando la trascrizione può alterare singoli caratteri senza aggiungerne o rimuoverne. Da qui la decisione operativa, applicata per il resto del trasferimento, di verificare ogni singolo blocco con un checksum crittografico (SHA-256) calcolato sia localmente sia sulla VM, confrontando i due valori prima di procedere — non solo la lunghezza.

### Deploy completato e verificato (27 agosto 2026)

Con la verifica a checksum, il blocco corrotto è stato individuato, corretto e il trasferimento completato:

- `core/tavola.mjs` sulla VM: patch applicata con checksum SHA-256 identico all'originale, sintassi verificata (`node --check`), funzione `isDplusDue` presente ed esportata.
- `test/engine.test.mjs` e `test/server.integration.test.mjs`: trasferiti con lo stesso metodo (blocchi verificati singolarmente via checksum prima di essere uniti), patch applicate senza errori.
- `npm test` sulla VM: **60/60 test superati**.
- `tavola.service` riavviato (`sudo systemctl restart`): nessun crash, log di systemd confermano stop pulito e riavvio regolare (`Stopped` → `Started`), servizio verificato `active` e in ascolto su `http://localhost:4310`; richiesta di prova a `/` risponde `200`.
- Codice committato (`a8e97dc`) e pushato su GitHub (`danieleparavani/tavola`, `main`), usando le credenziali già salvate sulla VM.

Non ancora verificato: una conversazione reale su Telegram che osservi dal vivo il gate di consenso, il cambio di orario D+1 e — richiede di aspettare un orario dovuto reale — la consegna proattiva.

### Decisione

Per ogni futuro trasferimento di codice verso la VM tramite digitazione automatizzata in terminale, verificare l'integrità con un checksum crittografico per blocco (non solo la lunghezza in byte) prima di considerare un trasferimento completo o corretto.

## Versionata la guida storica `deploy-guide.html` e risolta una divergenza fra i repository git

### Evidenza osservata

Un controllo automatico di fine sessione ("Stop hook") ha segnalato un file non tracciato nel repository: `deploy-guide.html`, una guida HTML di 26700 byte già esistente dal 21 agosto ma mai versionata. Il progettista ha chiesto esplicitamente di completare l'operazione ("no fallo tu"). Il file è stato prima committato localmente nel repository di questo container, ma il push verso GitHub da questo container è stato respinto (`403`, "not in this session's authorized repository set") — la stessa restrizione già nota per cui solo la VM ha credenziali di push funzionanti.

Il trasferimento del file verso la VM (compressione gzip, codifica base64, 5 blocchi da 2500 byte digitati in terminale con verifica a checksum SHA-256 per ciascun blocco) ha incontrato la stessa corruzione silenziosa già documentata sopra: il blocco 2 è arrivato con la lunghezza corretta (2500 byte) ma un contenuto diverso, con lo stesso hash errato riprodotto identico su due tentativi di ridigitazione completa del blocco. Una ricerca dicotomica (bisection) sull'intervallo di byte ha isolato la corruzione a un intervallo di soli 312 byte; la correzione mirata di quel solo intervallo (senza ridigitare l'intero blocco una terza volta) ha prodotto un hash finale del file ricostruito identico all'originale (`a948fc0...6e5846`, 26700 byte). File committato e pushato dalla VM (`8366630`).

Nel tentativo di riallineare anche la copia locale di questo container con lo stato ora presente su GitHub, un `git merge` ha prodotto conflitti estesi su quasi tutti i file di codice e sui quattro documenti canonici. L'indagine ha rivelato che il repository locale di questo container proseguiva da tempo su una linea di commit indipendente (dodici commit, dal 22 al 27 agosto, tutti con paternità reale del progettista) che non includeva mai il commit `a8e97dc` della VM: due copie dello stesso progetto erano divergute silenziosamente, ciascuna con lavoro reale non presente nell'altra — la linea del container conteneva l'intera narrazione documentale D-026...D-034, mai pushata; la linea della VM conteneva il codice di D-034 realmente testato e deployato.

### Interpretazione

La corruzione a byte-range isolabile (non distribuita casualmente, ma concentrata in un intervallo preciso e riproducibile identico su ridigitazioni ripetute) suggerisce un problema deterministico nella pipeline di digitazione automatizzata per stringhe molto lunghe, non un rumore casuale — coerente con quanto già osservato per `core/tavola.mjs`. La tecnica della ricerca dicotomica per byte-range si è dimostrata più efficiente della ridigitazione integrale del blocco quando un blocco fallisce ripetutamente con lo stesso esito.

La divergenza fra i due repository locali (container e VM) conferma nella pratica il rischio che la Regola D-013 ("casa operativa unica") intende prevenire: lavorare da più ambienti senza una sincronizzazione esplicita e verificata produce silenziosamente due storie parallele, ciascuna con contenuto reale che l'altra non ha. Il repository GitHub da solo non basta a garantirlo se non tutti gli ambienti fanno effettivamente push/pull ad ogni sessione.

### Decisione

Repository locale di questo container riallineato a `origin/main` (stato testato e verificato della VM) tramite `git reset --hard`, dopo aver messo in sicurezza la linea divergente su un branch di backup locale (`backup-container-locale-2026-08-28`, non pushato, conservato solo come archivio). I quattro documenti canonici della linea divergente — più completi e aggiornati, poiché la linea della VM non li aveva mai toccati — sono stati riportati sopra al codice riallineato della VM, unendo così il codice corretto (VM) alla documentazione più completa (container) senza perdere nessuno dei due.

**Nuova regola di processo:** ad ogni sessione di lavoro che modifica il repository, verificare esplicitamente (`git log`, `git status`, confronto con `origin/main`) che il proprio ambiente locale sia effettivamente allineato al remoto prima di procedere, non solo che il remoto esista e sia raggiungibile.

## Implementato techniqueMapId (D-028) — e trovato un conteggio sbagliato nella bozza della mappa

### Evidenza osservata

Su richiesta esplicita del progettista ("Implementare techniqueMapId (D-028)"), è stato letto `data/technique-map.draft.md` per estrarre l'elenco delle tecniche da usare come enum. Il documento dichiarava nella sua stessa riga di chiusura "Totale: 11 aree, 49 tecniche nominate". Un parser scritto per estrarre le voci (poi diventato parte di `core/lab.mjs`) ne ha contate 54; un conteggio indipendente con `grep -c '^- \`' data/technique-map.draft.md` ha confermato lo stesso numero, 54. Le aree 1-9 e 11 elencano davvero 5 voci ciascuna, l'area 10 ne elenca 4: 5×10+4=54, non 49.

Implementato il campo nello schema del laboratorio (`core/lab.mjs`): `techniqueMapId` (enum sulle voci reali della mappa più `altro`) e `techniqueMapNote` (nota libera obbligatoria quando si usa `altro`), con relative verifiche difensive nel gate editoriale (`qualityIssues`). Aggiunto l'endpoint `GET /api/technique-map` e una nuova sezione della dashboard che mostra tutte le voci della mappa raggruppate per area, evidenziando quelle osservate da ciascun tester. Il conteggio nel documento è stato corretto a 54 e la verifica d'integrità in `core/lab.mjs` ora confronta dinamicamente il numero dichiarato nel documento con le voci trovate, invece di usare un numero fisso nel codice.

Una traccia manuale completa (contesto → tre direzioni → proposta → cottura guidata → chiusura → riflessione), con il laboratorio simulato tramite mock di `fetch`, ha mostrato che `user.techniques` si popola con la voce dichiarata dal piatto proposto; poiché la traccia era scriptata (passaggi completati in millisecondi), la sessione è stata correttamente classificata come simulazione (stesso meccanismo di rilevamento già usato per le competenze, D-016) e la voce è stata registrata come `simulatedOnly`, non come osservazione reale.

Aggiornata anche la copia isolata usata da `test/server.integration.test.mjs` (che avvia il server come processo separato in una directory temporanea) per includere `data/technique-map.draft.md`, ora necessario all'avvio del server: senza questo file quattro test di integrazione fallivano per timeout, perché il server andava in crash silenzioso all'importazione di `core/lab.mjs`.

### Interpretazione

Il conteggio "49" era quasi certamente un errore di conteggio manuale in fase di stesura della bozza (forse un conteggio fatto mentalmente per area, sbagliato in almeno un punto), non un segnale che alcune tecniche fossero state perse o duplicate nel parsing: i 54 id estratti sono tutti distinti e coerenti con le undici aree elencate nel documento stesso.

Il fallimento dei quattro test di integrazione dopo l'aggiunta della lettura sincrona del file all'avvio del modulo è stato un promemoria diretto di una fragilità già nota in astratto ma non ancora incontrata in pratica su questo progetto: qualunque nuova dipendenza a runtime da un file del repository deve essere replicata esplicitamente in ogni ambiente isolato usato dai test, altrimenti il fallimento appare come un timeout generico invece che come l'assenza di un file, rendendo la diagnosi più lenta.

### Decisione

Non assegnare un `techniqueMapId` ai tre piatti editoriali storici (alici, triglia in due varianti) in questa modifica: sono fixture non raggiungibili dal flusso conversazionale attuale (D-014) e nessuna delle 54 voci corrisponde in modo netto ai loro principi dominanti senza una forzatura interpretativa arbitraria. Il codice tollera esplicitamente la loro assenza di `techniqueMapId`.

Vedi D-036 in DECISIONS.md per la decisione formale e i dettagli implementativi.

## Failure osservato — "Altra idea" blocca la conversazione (primo bug da test reale)

### Evidenza osservata

Il progettista ha riportato, durante il suo primo vero test su Telegram (non simulazione): "sto facendo test reali. il primo problema è che se voglio cambiare ricetta e ripartire non ci riesco continua a darmi sempre la stessa risposta". È il primo bug segnalato da un uso reale del prodotto, non trovato dal progettista mentre scriveva il codice né da un test automatico.

Rileggendo `core/tavola.mjs`, il ramo che gestisce "🔄 Altra idea" nello stato `proposal` chiedeva il motivo del rifiuto ma non impostava mai un nuovo `user.state`: restava `proposal`. Il messaggio successivo dell'utente (il motivo stesso, es. "la tecnica è troppo complicata") rientrava quindi nello stesso blocco `if(user.state==='proposal')`; nessuno dei rami esistenti (`fonti`, `lista`, `piace`/`ci sono`, `altra`) corrispondeva, il blocco terminava senza `return`, e l'esecuzione cadeva in successione attraverso tutti i controlli di stato seguenti (nessuno dei quali corrispondeva, dato che lo stato era sempre `proposal`) fino al messaggio di fallback generico in fondo alla funzione — identico per ogni messaggio successivo, esattamente il sintomo descritto. Una ricerca con grep sui test esistenti prima della correzione ha confermato che questo percorso ("Altra idea" seguito da un motivo) non era mai stato esercitato da nessun test automatico.

### Interpretazione

Il difetto è strutturale, non un caso limite: qualunque ramo di uno stato conversazionale che chiede un'informazione successiva ma non predispone uno stato dedicato per riceverla lascia la conversazione priva di un percorso, e il fallback generico finale maschera il problema facendolo sembrare un errore di comprensione del testo piuttosto che un buco nella macchina a stati. Il fatto che sia stato trovato solo al primo uso reale (non nella scrittura del codice, non nei 62 test automatici allora esistenti) conferma che questa classe di difetti — stati raggiungibili ma "senza uscita" — non è coperta a meno di test che esercitino esplicitamente ogni bottone proposto in ogni stato, non solo i percorsi principali.

### Decisione

Introdotto lo stato intermedio `proposal_feedback`: il motivo del rifiuto viene raccolto ed effettivamente usato (incorporato nel contesto passato al laboratorio generativo) per rigenerare tre nuove direzioni, oppure per permettere un cambio di intenzione completo se l'utente preferisce ripartire da capo. Aggiunti due test automatici che riproducono esattamente il bug segnalato e verificano la correzione. Vedi D-037 in DECISIONS.md.

**Regola generale suggerita per il futuro:** ogni nuovo bottone/ramo che chiede un'informazione a testo libero deve avere, nello stesso momento in cui viene scritto, uno stato dedicato pronto a riceverla — mai lasciare che la risposta ricada nello stato originario o nel fallback generico.


## Failure osservato e corretto — bloccato sulla proposta, nessun modo di cambiare percorso (28 agosto 2026)

Partecipante e condizione: progettista, test reale su Telegram (non simulazione).

### Evidenza osservata

Il progettista ha riportato: dopo aver ricevuto una proposta di ricetta sulla seppia, la conversazione risultava bloccata — nessun messaggio successivo permetteva di cambiare percorso o ripartire con un'altra idea.

### Evidenza osservata (lettura del codice)

Negli stati `proposal` (ricetta proposta, prima della scelta di modalità di guida) e `mode` (scelta guidami/leggi tutto/punti critici) non esisteva alcun ramo che riconoscesse un cambio di intenzione (`isIntentChoice`), a differenza di `collecting_people`, `collecting_time`, `collecting_context` e `proposal_feedback`, che lo avevano già tutti (quest'ultimo dal fix D-037). Un messaggio o un tocco su uno dei tre bottoni iniziali, inviato mentre l'utente si trovava in uno di questi due stati, non corrispondeva a nessun ramo previsto in quel blocco e cadeva nella risposta generica di fallback in fondo alla funzione.

### Interpretazione

Stessa classe di difetto già identificata con D-037 (uno stato senza un percorso di uscita esplicito lascia la conversazione apparentemente bloccata), ma in un punto diverso e con una causa diversa: qui non si trattava di un ramo presente ma rotto (come "Altra idea" prima del fix), bensì dell'assenza totale di un ramo per il cambio diretto di intenzione. La regola generale già annotata alla chiusura di D-037 — ogni nuovo stato deve prevedere un modo di uscirne — non era stata applicata retroattivamente agli stati già esistenti `proposal` e `mode`.

### Decisione

Aggiunto lo stesso controllo `isIntentChoice(n)` già in uso altrove come primo ramo di entrambi gli stati `proposal` e `mode`: un cambio di intenzione azzera il contesto (persone, tempo) e riporta la conversazione a `collecting_people`. Vedi DECISIONS.md, D-038.

### Verifica successiva

52/52 → 66/66 test automatici superati (`npm test`), inclusi 2 nuovi test che riproducono esattamente lo scenario per entrambi gli stati. Verificato inoltre **dal vivo** (non solo con mock) tramite l'API del simulatore sulla VM di produzione, riproducendo lo scenario esatto riportato dal progettista con una vera chiamata al laboratorio generativo: contesto raccolto con "seppia" fino a ottenere le tre direzioni gastronomiche, selezionato il livello "Semplice curato" per arrivare allo stato `proposal` (`Ti propongo Seppia scottata, patate novelle...`), poi inviato "Cerco un'idea" — la conversazione è tornata correttamente a `collecting_people` con la domanda "Per quante persone cuciniamo?", invece di restare bloccata. Applicato e committato sulla VM di produzione (`3249350` per il codice, `25a0e6f` per i test), servizio riavviato e verificato attivo.

### Limite dichiarato di questa verifica

La correzione copre solo gli stati `proposal` e `mode`, i due punti in cui il progettista ha effettivamente riscontrato il blocco. Lo stato `cooking` (guida passo-passo già avviata) resta senza questo stesso ramo: interrompere una cottura in corso con un cambio di intenzione immediato è una scelta di design distinta da valutare separatamente, non un'estensione automatica di questa correzione.


## Failure osservato e corretto — "loop" sulla seppia dopo aver chiesto una nuova richiesta (28 agosto 2026)

Partecipante e condizione: progettista, test reale su Telegram (non simulazione), poche ore dopo il deploy di D-038.

### Evidenza osservata

Il progettista ha riportato: "gli ho chiesto di cominciare una nuova richiesta e ancora mi risponde sulle seppie, è in loop."

### Evidenza osservata (lettura del codice)

Due problemi distinti, nessuno dei due coperto da D-038:
1. `isIntentChoice(n)` riconosceva solo le tre frasi esatte dei bottoni ("cerco un...", "facendo la spesa", "ingredienti, cuciniamo"). Una frase scritta liberamente come "voglio cominciare una nuova richiesta" non veniva mai riconosciuta come cambio di intenzione, in nessuno stato — nemmeno in `proposal`/`mode`, già corretti da D-038 ma solo per le frasi esatte.
2. Tre stati non avevano ancora alcun ramo `isIntentChoice`: `cooking`, `lab_clarification`, `difficulty_choice`. In `cooking` in particolare, qualunque testo non riconosciuto come "fatto/avanti/perché/dubbio" veniva inviato al generatore di risposte sul dubbio (`answerCookingDoubt`) insieme al piatto e al passaggio corrente — che restava quindi sempre ancorato alla seppia, producendo l'effetto "loop" descritto.

### Interpretazione

D-038 aveva corretto il sintomo osservato in quel momento (bloccato sulla proposta) ma non la causa generale: il controllo "riconosci un cambio di intenzione" era stato aggiunto stato per stato, con lo stesso set ristretto di frasi esatte dei bottoni. Il progettista, comunicando in linguaggio naturale invece di premere un bottone, ha usato una frase che nessuna versione del controllo riconosceva — e si trovava inoltre in uno stato (`cooking`, quasi certamente, dato che la ricetta era "in corso") che D-038 aveva esplicitamente lasciato fuori.

### Decisione

Vedi DECISIONS.md, D-039: `isIntentChoice` ampliato con frasi generiche di riavvio; stesso ramo di uscita aggiunto a `cooking`, `lab_clarification`, `difficulty_choice`.

### Verifica successiva

66/66 → 69/69 test automatici superati (`npm test`), inclusi 3 nuovi test — uno per ciascuno dei tre stati — che usano deliberatamente una frase generica ("nuova richiesta", "ricominciamo da capo", "voglio ricominciare") invece delle frasi esatte dei bottoni, per non ripetere lo stesso falso senso di sicurezza di D-038. Verificato inoltre **dal vivo, con una vera chiamata al laboratorio generativo** sulla VM di produzione: contesto raccolto con "pasta al pomodoro" (dopo che tre tentativi sulla seppia erano stati respinti dal gate editoriale — comportamento corretto e indipendente, non un problema), livello "semplice" accettato al primo tentativo, "ci sono" → `mode`, "guidami" → `cooking` (passaggio 1/7 mostrato correttamente), poi inviato testualmente "voglio cominciare una nuova richiesta" — la conversazione è tornata a `collecting_people` con "Per quante persone cuciniamo?", esattamente il comportamento atteso, invece di restare ancorata alla ricetta in corso. Applicato e committato sulla VM di produzione (`8d61c2d` per il codice, `398bcee` per i test), servizio riavviato e verificato attivo.

### Limite dichiarato di questa verifica

La verifica dal vivo è stata condotta tramite l'API del simulatore sulla VM (con una vera chiamata al laboratorio, non mockata), non tramite una nuova conversazione reale su Telegram con l'app del progettista. Resta inoltre volutamente fuori da questa correzione un controllo equivalente per gli stati `closure`, `reflection` e `awaiting_dplus_time`, dove il testo libero ha quasi sempre un significato legittimo diverso da un cambio di intenzione.


## Failure osservato e corretto — bloccato sulla seppia per un ciclo di chiarimenti sulle fonti, non per uno stato senza uscita (29 agosto 2026)

Partecipante e condizione: progettista, test reale su Telegram, dopo i fix D-037/D-038/D-039.

### Evidenza osservata

Il progettista ha riportato che la conversazione restava "ferma sulla stessa ricetta di seppie" e non procedeva, nonostante i tre fix precedenti sul cambio di percorso.

### Evidenza osservata (riproduzione dal vivo con una vera chiamata al laboratorio)

Contesto: 2 persone, 30 minuti, "seppia". Selezionato il livello "semplice":
1. Il laboratorio ha restituito `kind=clarification` chiedendo all'utente **come gestire le fonti**: "Usa fonti di scuole/istituzioni culinarie riconosciute", "Usa un testo di riferimento editoriale tecnico", "Procedi senza inserire fonti esterne verificabili".
2. Risposta data alla prima opzione ("Usa fonti di scuole/istituzioni culinarie riconosciute"): il laboratorio ha restituito un **secondo** `kind=clarification`, quasi identico al primo: "Confermi che posso citare esclusivamente risorse di scuole/istituzioni culinarie riconosciute (es. Culinary Institute of America, Le Cordon Bleu)?"
3. Confermato di nuovo: il laboratorio ha finalmente generato una proposta — respinta dal gate editoriale (D-015) per "presenza di fonte editoriale o social non ammessa": lo stesso controllo (`bonappetit|giallozafferano|cookist|facebook|instagram|tiktok|pinterest`) già presente nel codice (cfr. `qualityIssues`), ha intercettato una fonte inserita dal modello nonostante la doppia rassicurazione sulla metodologia. Stato tornato a `difficulty_choice` con le stesse tre direzioni sulla seppia.

### Interpretazione

Non è un problema di stato senza uscita (i tre fix precedenti restano corretti e necessari, ma non erano la causa di questo specifico blocco). Il meccanismo `kind=clarification`, previsto dalle istruzioni del laboratorio per un'informazione decisiva sul piatto (es. forma di un ingrediente), viene usato dal modello anche per una domanda procedurale sulla metodologia delle fonti — una responsabilità che appartiene al sistema, non all'utente. Il fatto che la proposta finale sia comunque stata respinta per una fonte non ammessa, nonostante due giri di rassicurazione sulla fonte "giusta" da usare, mostra che il doppio chiarimento non stava nemmeno risolvendo il problema che si proponeva di risolvere: era un ciclo di conversazione a vuoto.

### Decisione

Vedi DECISIONS.md, D-040: aggiunto un vincolo esplicito alle istruzioni del laboratorio che vieta l'uso di `kind=clarification` per questioni di fonti, imponendo al laboratorio di risolvere la questione da solo (cercare, scegliere le fonti migliori disponibili, o omettere/dichiarare come `interpretation` una singola affermazione non supportata) restituendo comunque una proposta completa.

### Verifica successiva

69/69 test automatici superati (`npm test`), nessuna regressione (modifica solo testuale alle istruzioni, nessun test automatico può verificare in modo significativo il comportamento di un modello generativo). Verificato **dal vivo con una vera chiamata al laboratorio** sulla VM di produzione, riproducendo lo stesso identico scenario (seppia, 2 persone, 30 minuti, livello "semplice"): questa volta il laboratorio è passato direttamente a `kind=proposal` ("Ti propongo Seppia scottata con insalata tiepida di ceci e limone per 2"), senza alcun chiarimento sulle fonti, superando il gate editoriale al primo tentativo. Applicato e committato sulla VM di produzione (`63b18a9`), servizio riavviato e verificato attivo.

### Limite dichiarato di questa verifica

Una singola osservazione riuscita (contro il pattern di fallimento ripetuto osservato prima) è un'evidenza forte ma non una prova statistica che il comportamento sia eliminato in ogni caso: essendo un modello generativo, non è escluso che in altre occasioni — con altri ingredienti a fonti scarse, o per varianza del modello stesso — possa ripresentarsi un chiarimento simile. Non è stato possibile scrivere un test automatico che verifichi realmente questo comportamento (richiederebbe una chiamata reale al modello, non mockabile in modo significativo per questo tipo di deriva). Resta da confermare con un uso reale prolungato su Telegram, con ingredienti diversi, che il problema non si ripresenti.
