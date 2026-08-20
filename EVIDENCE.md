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
