# Tavola — prossime attività

Ultimo aggiornamento: 29 agosto 2026 (D-040: corretto un quarto bug segnalato dal progettista — la conversazione restava ferma sulla stessa ricetta di seppia; causa diversa dai tre fix precedenti: il laboratorio chiedeva all'utente come gestire le fonti tramite kind=clarification (due giri di conferma quasi identici), per poi comunque farsi respingere la proposta dal gate per una fonte non ammessa. Vincolo aggiunto alle istruzioni del laboratorio: la questione delle fonti e' responsabilita' del laboratorio, mai dell'utente. 69/69 test, verificato dal vivo con una vera chiamata al laboratorio (nessun chiarimento, proposta accettata al primo tentativo), deployato sulla VM. D-036, D-037, D-038 e D-039 confermati deployati sulla VM in una sessione precedente. Restano da verificare dal vivo su Telegram reale: D-034 (consenso, orario D+1, consegna proattiva), D-036 (techniqueMapId), D-037 (fix "Altra idea"), D-038, D-039 (cambio di percorso da qualunque stato) e D-040 (chiarimento sulle fonti).)

## Obiettivo corrente

Portare l'MVP conversazionale da simulatore locale a esperienza Telegram utilizzabile da 2–3 tester, correggerlo e poi allargare il pilot a 5–10 persone.

## Infrastruttura di lavoro

- [x] Sviluppo consolidato su Claude/Cowork, non più sull'attività Codex (D-025).
- [x] Codice versionato su `github.com/danieleparavani/tavola` (privato), non più legato a un singolo PC (D-026).
- [x] Server pubblicato su una VM e2-micro gratuita di Google Cloud (`tavola-server`, progetto `tavola-prod`, zona us-central1-c), raggiungibile via tunnel HTTPS gratuito ngrok (dominio dev `density-divinely-flip.ngrok-free.dev`) — dominio vero rimandato a dopo il pilot, per scelta esplicita del progettista. Persistenza tramite systemd (`tavola.service`, `tavola-tunnel.service`, entrambi `enabled`, sopravvivono al riavvio).
- [x] Chiave OpenAI collegata sulla VM tramite `/setup.html`; risolve anche il vincolo D-018 (la chiave cifrata ora vive sulla macchina server persistente, non sul laptop del progettista). `/api/status` conferma `labConnected:true`, modello `gpt-5-mini`.
- [x] Sincronizzare su GitHub il fix del 21 agosto sul `callback_data` Telegram — la VM non ha mai avuto credenziali git, quindi il fix è stato applicato direttamente su GitHub (commit `d72ca78`) replicando esattamente la patch già in produzione sulla VM; la VM è stata poi riallineata con `git reset --hard origin/main` e riavviata.
- [x] Sincronizzare su GitHub e sulla VM il fix del 21 agosto sui tasti rapidi persone/tempo (D-027) — una prima implementazione locale non era mai arrivata su GitHub; reimplementata da zero in una sessione di sviluppo successiva (Claude/Cowork, 21 agosto), committata e pushata (commit `d819418`, che ha anche corretto il gate del risotto, vedi sotto). VM riallineata con `git reset --hard origin/main` e riavviata; 53/53 test passano, `/api/status` attivo, verificato via `/api/message` che un nuovo utente arriva a `collecting_people` con i tasti attesi. **Confermato di nuovo il 25 agosto** (sessione di riconciliazione): servizio `tavola.service` attivo dal 22 agosto, `origin/main` allineato, suite di test 53/53 rieseguita con successo sulla VM.
- [x] Indagare e correggere il riferimento a "risotto" nel motivo di rifiuto del gate su una proposta di seppia — causa trovata e corretta nella stessa sessione del 21 agosto (D-027/commit `d819418`): il controllo `frusta.*ris` in `core/lab.mjs` non era vincolato al tipo di piatto. Vedi EVIDENCE.md.
- [x] Messaggio di attesa ("sto pensando...") e risposta fire-and-forget al webhook Telegram durante la generazione della ricetta (D-029) — implementato e deployato direttamente sulla VM dal progettista il 22 agosto (commit `16df30c`, `c8624f4`), con test di regressione dedicati. Documentato nei registri canonici il 25 agosto (era rimasto fuori da DECISIONS.md/EVIDENCE.md fino a questa sessione di riconciliazione).
- [ ] Verificare su una conversazione reale con `@tavola_cucina_bot` su Telegram il flusso completo a tasti rapidi (D-027) e il nuovo messaggio di attesa (D-029) insieme: il deploy è confermato tecnicamente (test automatici + `/api/status` + servizio attivo), ma manca ancora una verifica end-to-end con un utente reale su Telegram dopo questi ultimi cambi.
- [x] Pushare su GitHub i commit pendenti `e1f3b13`, `35bb2e6`, `3378c68` (fix del 26 agosto: ingrediente sostituito dopo rifiuto gate; dubbio libero durante la guida; selezione tester in dashboard) — completato il 27 agosto 2026. Il progettista ha creato un fine-grained Personal Access Token su GitHub (scope limitato al repo, permesso Contents: Read and write) guidato passo passo; un primo token non ha funzionato ("Invalid username or token"), rigenerato un secondo token che ha funzionato. Il push è stato inizialmente respinto per uno storico divergente (`origin/main` aveva un commit su NEXT.md mai scaricato dalla VM); risolto con un merge pulito (nessun conflitto) seguito da un nuovo push, accettato. `credential.helper store` configurato sulla VM per i push futuri. Verificato con `git status` pulito e 54/54 test superati subito dopo. Vedi DECISIONS.md, D-033.
- [x] Versionare `deploy-guide.html` (guida storica di setup della VM, esistente dal 21 agosto ma mai tracciata) — completato il 28 agosto 2026, trasferito e pushato dalla VM (commit `8366630`).
- [x] Risolvere una divergenza silenziosa fra il repository locale di un container di sviluppo e `origin/main` (dodici commit di documentazione mai pushati) — completato il 28 agosto 2026: linea divergente conservata su branch di backup locale, codice riallineato a `origin/main` (VM), documentazione più completa del container riapplicata sopra. Vedi DECISIONS.md D-035 ed EVIDENCE.md.

## Fase 0 — prova del progettista

**Stato:** checklist sostanzialmente completato il 26 agosto 2026 (percorso intero dall'apertura alla chiusura eseguito nel simulatore); i due failure trovati da questa prova (dubbio libero non risposto durante la guida; dashboard senza selezione del tester) sono stati corretti e verificati nella stessa giornata — vedi EVIDENCE.md, sezioni "Prova end-to-end completata nel simulatore — 26 agosto 2026" e "Correzione — dubbio libero durante la guida e selezione del tester in dashboard (26 agosto 2026)"

- [x] Riprendere e completare la prova end-to-end del simulatore dall'inizio alla chiusura — fatto il 26 agosto con ingrediente "melanzane", livello Tecnico, gate accettato al primo tentativo, guida completa (7/7 passaggi con impiattamento), chiusura con simulazione dichiarata (D-016) e riflessione valutata (D-017). D+1 non forzato, coerente con D-017 (arriva domattina). Vedi EVIDENCE.md per il dettaglio completo.
- [x] Correggere il failure "ingrediente sostituito silenziosamente dopo un rifiuto del gate": dopo un rifiuto del gate editoriale (D-015), un messaggio libero dell'utente non legato a un nuovo ingrediente veniva interpretato come una richiesta interamente nuova, sostituendo silenziosamente l'ingrediente in corso (osservato: cavolfiore → petto di pollo mai richiesto). Corretto il 26 agosto 2026 su richiesta esplicita del progettista: dopo un rifiuto, se le tre direzioni gastronomiche esistono ancora, lo stato torna a sceglierne un'altra invece di ripartire da zero. 53/53 test superati, servizio riavviato e verificato attivo. Commit locale `e1f3b13` sulla VM, push su GitHub ancora da fare (vedi voce in Infrastruttura di lavoro). Verificato solo dal test automatico: la prova del 26 agosto non ha rigenerato un rifiuto del gate dal vivo (il gate ha accettato al primo tentativo), quindi resta da osservare di nuovo dal vivo. Vedi EVIDENCE.md per il dettaglio tecnico completo.
- [x] Failure trovato il 26 agosto — **dubbio libero non risposto durante la guida**: corretto nella stessa giornata su richiesta esplicita del progettista. Un testo libero durante un passaggio guidato ora riceve una risposta generativa reale sul suo contenuto (nuova funzione `answerCookingDoubt`), invece del vecchio messaggio di stallo o del suggerimento fisso del passaggio. 54/54 test superati, commit `35bb2e6`, servizio riavviato e verificato attivo. Verificato solo con test automatico (fetch mockato), non ancora dal vivo nel simulatore con una chiamata reale al laboratorio. Vedi EVIDENCE.md e DECISIONS.md D-031.
- [x] Failure trovato il 26 agosto — **dashboard senza selezione del tester**: corretto nella stessa giornata. La dashboard ora ricorda quale tester è selezionato (persistente oltre il ciclo di aggiornamento automatico di 5 secondi) e supporta anche la selezione diretta via parametro URL (`?user=<id>`), con evidenziazione visiva della riga attiva. Commit `3378c68`, servizio riavviato. Verificato dal vivo nel browser (web preview di Cloud Shell con tunnel SSH verso la VM): selezione stabile oltre i 5 secondi, URL diretto funzionante. Vedi EVIDENCE.md e DECISIONS.md D-032.
- [ ] Annotare punti artificiali, risposte lunghe e passaggi mancanti.
- [ ] Verificare se la terminologia tecnica comunica autorevolezza.
- [x] Provare almeno un dubbio imprevisto durante la preparazione — fatto il 26 agosto; ha rivelato il failure "dubbio libero non risposto" sopra, non una semplice conferma di funzionamento.
- [x] Controllare la dashboard dopo la sessione — fatto il 26 agosto; ha rivelato il failure "dashboard senza selezione del tester" sopra.
- [x] Consolidare le correzioni nel motore conversazionale — cfr. audit del 19 agosto 2026 (EVIDENCE.md, DECISIONS.md D-023/D-024): corretto il blocco dopo il D+1, la modalità "Fammi leggere tutto", il denominatore fisso in dashboard, la copy sulla chiave, il logging del pilot e il gate editoriale; aggiunti 40 test automatici (`npm test`).
- [x] Collegare il laboratorio generativo tramite chiave OpenAI API salvata nell'ambiente (via `/setup.html`) — fatto sulla VM il 21 agosto.
- [x] Provare un ingrediente fuori dai casi editoriali con una chiamata reale al modello — fatto il 21 agosto su Telegram reale con "seppia", 3 persone, 1 ora: le tre direzioni gastronomiche (D-019) sono state generate correttamente. Vedi EVIDENCE.md per il dettaglio (bug dei pulsanti trovato e corretto; gate editoriale che si astiene correttamente sul livello Gourmet).
- [x] Sostituire la domanda combinata persone/tempo/ingrediente con tasti rapidi per le prime due (D-027) — implementato, testato e deployato in produzione. Vedi Infrastruttura di lavoro ed EVIDENCE.md.
- [ ] Monitorare, durante questa prova, eventuali astensioni del gate causate da falsi positivi del nuovo controllo generico spesa/passaggi (D-024): se un ingrediente reale viene segnalato come "mai citato nei passaggi" pur essendo usato con un sinonimo generico, annotarlo qui prima di allentare il controllo.
- [x] Indagare il riferimento a "risotto" comparso nel motivo di rifiuto del gate su una proposta di seppia — causa trovata e corretta (vedi Infrastruttura di lavoro).
- [x] Valutare se la latenza della generazione completa meriti un messaggio intermedio ("sto pensando...") — implementato come D-029, vedi Infrastruttura di lavoro.

## Fase 1 — Telegram reale

**Stato:** in corso — bot reale creato e funzionante; tasti rapidi verificati su Telegram reale il 27 agosto 2026; consenso, orario D+1 e consegna proattiva (D-034) implementati, testati e deployati sulla VM lo stesso giorno (servizio riavviato, `npm test` 60/60, `/` risponde 200, commit `a8e97dc` pushato su GitHub) — manca ancora la verifica dal vivo su Telegram reale

- [x] Creare il bot con BotFather (`@tavola_cucina_bot`).
- [x] Salvare il token fuori dai file del progetto (in `/etc/environment` sulla VM, letto dal servizio via `EnvironmentFile`).
- [x] Pubblicare il server su HTTPS (tunnel ngrok, vedi Infrastruttura di lavoro).
- [x] Collegare il webhook Telegram (verificato con `getWebhookInfo`).
- [x] Verificare messaggi e pulsanti — trovato e corretto un bug reale: `callback_data` usava il testo intero del pulsante, che supera spesso il limite di 64 byte di Telegram, causando un rifiuto silenzioso (`400 BUTTON_DATA_INVALID`) senza alcun errore nei log. Corretto in `server.mjs` con troncamento sicuro a 64 byte e aggiunto logging esplicito degli errori di invio. Fix verificato sulla VM e sincronizzato su GitHub (commit `d72ca78`).
- [x] Verificare su Telegram reale il flusso completo a tasti rapidi persone/tempo (D-027) — confermato dal progettista il 27 agosto 2026 su una conversazione reale con `@tavola_cucina_bot`: i tasti funzionano. Verifica riportata sinteticamente dal progettista ("ho fatto la prova sui tasti rapidi e funziona"), non accompagnata da un log dettagliato della conversazione; non risulta ancora osservato esplicitamente il nuovo messaggio di attesa (D-029) nella stessa prova.
- [ ] Verificare fotografie e vocali (non ancora testati su Telegram reale; richiede il telefono del progettista).
- [x] Aggiungere gestione delle preferenze e consenso — **implementato, testato e deployato il 27 agosto 2026** (D-034): messaggio di consenso unico ("Ho capito, iniziamo") prima del primo capitolo per i nuovi utenti Telegram; gli utenti già esistenti prima di questa modifica vengono grandfathered automaticamente. 60/60 test superati (locale e VM), servizio riavviato e verificato attivo sulla VM. Manca ancora una verifica dal vivo su Telegram reale.
- [x] Programmare il D+1 in una fascia scelta dall'utente — **implementato, testato e deployato il 27 agosto 2026** (D-034): orario libero configurabile per utente (default 08:30, cambiabile con "⏰ Cambia orario D+1"), consegna proattiva lato server (scheduler ogni 60 secondi) invece di aspettare che l'utente riscriva. 60/60 test superati (locale e VM), servizio riavviato e verificato attivo sulla VM. Non ancora osservato dal vivo su Telegram reale.
- [x] Primo bug trovato durante i test reali del progettista su Telegram (28 agosto 2026): "Altra idea" chiedeva il motivo del rifiuto ma restava bloccato nello stesso stato, facendo cadere ogni messaggio successivo sulla stessa risposta generica di fallback. Diagnosticato e corretto lo stesso giorno (D-037): nuovo stato `proposal_feedback` che raccoglie davvero il motivo e rigenera tre nuove direzioni, oppure permette un cambio di intenzione completo. 64/64 test superati, inclusi due test che riproducono il bug segnalato. Deploy sulla VM confermato in una sessione successiva (`git log`, `npm test` 64/64, servizi `active`): resta da riprovare dal vivo su Telegram reale.
- [x] Secondo bug trovato durante i test reali del progettista su Telegram (28 agosto 2026): bloccato sulla proposta di seppia, senza modo di cambiare percorso. Diagnosticato e corretto lo stesso giorno (D-038): gli stati `proposal` e `mode` non riconoscevano un cambio di intenzione, a differenza degli altri stati del flusso. Aggiunto lo stesso controllo gia' in uso altrove. 66/66 test superati, inclusi 2 nuovi test di regressione. Verificato anche dal vivo (non solo con mock) tramite l'API del simulatore sulla VM, riproducendo lo scenario esatto con una vera chiamata al laboratorio: seppia -> stato proposal -> "Cerco un'idea" -> torna correttamente a collecting_people. Applicato e committato sulla VM di produzione (`3249350` codice, `25a0e6f` test), servizio riavviato e verificato attivo. Vedi DECISIONS.md D-038 ed EVIDENCE.md.
- [x] Terzo bug trovato poche ore dopo D-038: il progettista ha chiesto di iniziare una nuova richiesta e il bot e' rimasto "in loop" sulla ricetta di seppia in corso. Diagnosticato e corretto lo stesso giorno (D-039): `isIntentChoice` riconosceva solo le tre frasi esatte dei bottoni (non frasi libere come "nuova richiesta"), e tre stati (`cooking`, `lab_clarification`, `difficulty_choice`) non avevano ancora nessun ramo di uscita — in `cooking` in particolare, qualunque testo non riconosciuto andava al generatore di risposte sul dubbio insieme al piatto corrente, da cui il loop. Ampliato `isIntentChoice` con frasi generiche ("nuova richiesta", "ricominc*", "da capo", "altra richiesta", "resett*") e aggiunto lo stesso ramo ai tre stati. 66/66 -> 69/69 test superati, inclusi 3 nuovi test di regressione che usano deliberatamente frasi generiche (non le frasi esatte dei bottoni). Verificato dal vivo con una vera chiamata al laboratorio sulla VM: contesto con "pasta al pomodoro", livello "semplice" accettato, `mode` -> `cooking` (passaggio 1/7), poi "voglio cominciare una nuova richiesta" -> torna correttamente a `collecting_people`. Applicato e committato sulla VM di produzione (`8d61c2d` codice, `398bcee` test), servizio riavviato e verificato attivo. Vedi DECISIONS.md D-039 ed EVIDENCE.md.
- [x] Quarto bug trovato dopo D-039 (29 agosto 2026): il progettista ha riportato che la conversazione restava ferma sulla stessa ricetta di seppia. Diagnosi diversa dalle precedenti: non uno stato senza uscita, ma il laboratorio che usa kind=clarification per chiedere all'utente come gestire le fonti (due giri di conferma quasi identici), per poi comunque generare una proposta respinta dal gate per una fonte non ammessa (D-040). Corretto aggiungendo un vincolo alle istruzioni del laboratorio (core/lab.mjs): il chiarimento riguarda solo fatti sul piatto, mai la metodologia delle fonti, che resta responsabilita' del laboratorio. 69/69 test superati (nessuna regressione, modifica solo testuale). Verificato dal vivo con una vera chiamata al laboratorio sulla VM, riproducendo lo stesso scenario: la seppia e' passata direttamente a una proposta accettata al primo tentativo, senza alcun chiarimento sulle fonti. Applicato e committato sulla VM di produzione (`63b18a9`), servizio riavviato e verificato attivo. Vedi DECISIONS.md D-040 ed EVIDENCE.md. Confermato dal progettista su Telegram reale il 29 agosto 2026 ("ora funziona"): la seppia procede senza il ciclo di chiarimenti sulle fonti anche in una conversazione reale, non solo nella verifica via API sulla VM.

## Fase 2 — micro-pilot con 2–3 tester

**Stato:** non iniziata

- [ ] Selezionare tester non principianti.
- [ ] Consegnare istruzioni minime.
- [ ] Osservare senza guidare il comportamento.
- [ ] Raccogliere log e intervista breve.
- [ ] Separare evidenze, interpretazioni, ipotesi e decisioni.
- [ ] Correggere gli attriti principali.

## Fase 3 — pilot con 5–10 tester

**Stato:** non iniziata

- [ ] Congelare versione, contenuti e criteri.
- [ ] Ampliare a poche esperienze editoriali affidabili.
- [ ] Misurare completamento, utilità, invasività, soddisfazione e ritorno.
- [ ] Verificare il valore del D+1.
- [ ] Verificare l'uso volontario della dashboard.
- [ ] Registrare candidati di autonomia senza sovrainterpretarli.

## Fase 4 — confronto A/B

**Stato:** progettato, non attivo

- [ ] Tavola contro LLM generalista ben promptato.
- [ ] Stessi ingredienti, vincoli, tempo, lunghezza e questionario.
- [ ] Prompt e versione del modello congelati.
- [ ] Controllo aggiuntivo della sostanza causale sotto la terminologia.
- [ ] Nessun depotenziamento artificiale del controllo generalista.

## Backlog successivo

- Trascrizione dei vocali.
- Analisi prudente delle fotografie.
- Corpus tecnico e culturale verificato.
- Motore AI con output strutturati e verificatore.
- Memoria longitudinale multi-sessione.
- WhatsApp come possibile canale produttivo.
- Dashboard estesa.
- Architettura editoriale del libro.
- Decidere se i tre piatti editoriali storici (alici, triglia intera, triglia a filetti) vadano riattivati come fallback esplicito quando il laboratorio non è collegato — oggi sono raggiungibili solo come fixture nei test del gate, non dal motore conversazionale (cfr. EVIDENCE.md, audit 19 agosto 2026).
- ~~Implementare nello schema del laboratorio generativo il campo `techniqueMapId`...~~ **Fatto il 28 agosto 2026 (D-036).** Implementato l'enum sulle 54 tecniche reali di `data/technique-map.draft.md` (il documento dichiarava erroneamente "49"; corretto) più il valore di fuga `altro` con nota libera obbligatoria; collegato alla dashboard come territorio fisso delle tecniche osservate (nuova sezione, nuovo endpoint `GET /api/technique-map`). 62/62 test superati (64/64 dopo il successivo D-037). Deploy sulla VM confermato in una sessione successiva. Non ancora verificato dal vivo su Telegram né con una vera chiamata al modello. I tre piatti editoriali storici in `core/tavola.mjs` restano senza `techniqueMapId` (fixture non raggiungibili dal flusso attuale, D-014): assegnarne uno avrebbe richiesto una scelta interpretativa arbitraria estranea a questa attività.

## Non fare ora

- Non creare un'app mobile nativa.
- Non costruire manualmente un'enciclopedia finita di ingredienti e ricette: l'ampiezza viene dal laboratorio generativo, il rigore dal protocollo e dal corpus.
- Non ampliare prematuramente il modello delle competenze.
- Non trattare la cultura gastronomica come dodicesima area strutturata della mappa delle tecniche prima delle evidenze del pilot (D-028).
- Non progettare il libro prima delle evidenze del pilot.
- Non aprire nuove attività Codex per singole idee del progetto.

## Regola di lavoro

Ogni nuova sessione di lavoro deve iniziare da `PROJECT.md` e `NEXT.md`. Ogni decisione definitiva aggiorna `DECISIONS.md`; ogni test aggiorna `EVIDENCE.md`.

**Promemoria emerso il 25 agosto:** il repository GitHub (D-026) è la fonte canonica del codice, e può evolvere per mano del progettista direttamente sulla VM/repository senza passare da una sessione Claude/Cowork. Ogni sessione che riprende il lavoro dovrebbe verificare `git log` sulla VM/repository prima di assumere che i documenti canonici di questo progetto Claude siano già allineati al codice effettivamente live.
