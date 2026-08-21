# Tavola — prossime attività

Ultimo aggiornamento: 21 agosto 2026

## Obiettivo corrente

Portare l’MVP conversazionale da simulatore locale a esperienza Telegram utilizzabile da 2–3 tester, correggerlo e poi allargare il pilot a 5–10 persone.

## Infrastruttura di lavoro (21 agosto 2026)

- [x] Sviluppo consolidato su Claude/Cowork, non più sull’attività Codex (D-025).
- [x] Codice versionato su `github.com/danieleparavani/tavola` (privato), non più legato a un singolo PC (D-026).
- [x] Server pubblicato su una VM e2-micro gratuita di Google Cloud (`tavola-server`, progetto `tavola-prod`, zona us-central1-c), raggiungibile via tunnel HTTPS gratuito ngrok (dominio dev `density-divinely-flip.ngrok-free.dev`) — dominio vero rimandato a dopo il pilot, per scelta esplicita del progettista. Persistenza tramite systemd (`tavola.service`, `tavola-tunnel.service`, entrambi `enabled`, sopravvivono al riavvio). Guida passo passo con stato salvato: https://claude.ai/code/artifact/bbf4e219-7b3e-4b21-9f47-84fcfedb4086 (da aggiornare con i valori reali scoperti in fase di esecuzione).
- [x] Chiave OpenAI collegata sulla VM tramite `/setup.html`; risolve anche il vincolo D-018 (la chiave cifrata ora vive sulla macchina server persistente, non sul laptop del progettista). `/api/status` conferma `labConnected:true`, modello `gpt-5-mini`.
- [ ] Sincronizzare su GitHub il fix del 21 agosto sul `callback_data` Telegram (vedi Fase 1): il commit locale esiste sulla VM ma `git push` richiede credenziali non presenti lì. Da completare dal progettista (token GitHub sulla VM, oppure applicare la stessa patch da un PC già autenticato).
- [x] Implementare D-027 nel codice versionato — in una sessione precedente risultava "già implementato e testato in locale, 46 test passano", ma al clone del repository in questa sessione di sviluppo (21 agosto, Claude/Cowork) il codice non era presente su GitHub: implementato da zero seguendo la specifica già approvata, 52 test passano (`npm test`), committato e pushato. Vedi EVIDENCE.md, "Sessione di sviluppo su Claude/Cowork — 21 agosto 2026".
- [ ] Sincronizzare sulla VM il fix D-027 ora presente su GitHub (`git pull`, verificare con `node --check`, riavviare `tavola.service`) e verificare il nuovo flusso a tasti su Telegram reale.

## Fase 0 — prova del progettista

**Stato:** in corso — audit del codice del 19 agosto 2026 completato; prima conversazione reale su Telegram avvenuta il 21 agosto (vedi Fase 1)

- [ ] Usare il simulatore come utente reale dall’inizio al D+1.
- [ ] Annotare punti artificiali, risposte lunghe e passaggi mancanti.
- [ ] Verificare se la terminologia tecnica comunica autorevolezza.
- [ ] Provare almeno un dubbio imprevisto durante la preparazione.
- [ ] Controllare la dashboard dopo la sessione.
- [x] Consolidare le correzioni nel motore conversazionale — cfr. audit del 19 agosto 2026 (EVIDENCE.md, DECISIONS.md D-023/D-024): corretto il blocco dopo il D+1, la modalità “Fammi leggere tutto”, il denominatore fisso in dashboard, la copy sulla chiave, il logging del pilot e il gate editoriale; aggiunti 40 test automatici (`npm test`).
- [x] Collegare il laboratorio generativo tramite chiave OpenAI API salvata nell’ambiente (via `/setup.html`) — fatto sulla VM il 21 agosto.
- [x] Provare un ingrediente fuori dai casi editoriali con una chiamata reale al modello — fatto il 21 agosto su Telegram reale con “seppia”, 3 persone, 1 ora: le tre direzioni gastronomiche (D-019) sono state generate correttamente. Vedi EVIDENCE.md per il dettaglio (bug dei pulsanti trovato e corretto; gate editoriale che si astiene correttamente sul livello Gourmet).
- [x] Sostituire la domanda combinata persone/tempo/ingrediente con tasti rapidi per le prime due (D-027) — implementazione precedente mai arrivata su GitHub (vedi Infrastruttura di lavoro); reimplementato e testato il 21 agosto in una sessione di sviluppo successiva, ora committato e pushato; sincronizzazione sulla VM ancora da fare.
- [ ] Monitorare, durante questa prova, eventuali astensioni del gate causate da falsi positivi del nuovo controllo generico spesa/passaggi (D-024): se un ingrediente reale viene segnalato come “mai citato nei passaggi” pur essendo usato con un sinonimo generico, annotarlo qui prima di allentare il controllo.
- [x] Indagare il riferimento a “risotto” comparso nel motivo di rifiuto del gate su una proposta di seppia — causa trovata e corretta: il controllo `frusta.*ris` in `core/lab.mjs` non era vincolato al tipo di piatto e scattava su qualunque testo contenente "frusta" seguito, ovunque più avanti, dalla sequenza "ris". Ora si applica solo quando il piatto è davvero un risotto. Vedi EVIDENCE.md, "Sessione di sviluppo su Claude/Cowork — 21 agosto 2026".
- [ ] Valutare se la latenza della generazione completa (dopo la scelta del livello semplice/tecnico/gourmet) meriti un messaggio intermedio (“sto pensando…”) su Telegram: nel primo test reale ha superato il timeout del webhook di Telegram, pur completandosi correttamente in background con qualche decina di secondi di ritardo.

## Fase 1 — Telegram reale

**Stato:** in corso — bot reale creato e funzionante, verifica completa non ancora conclusa

- [x] Creare il bot con BotFather (`@tavola_cucina_bot`).
- [x] Salvare il token fuori dai file del progetto (in `/etc/environment` sulla VM, letto dal servizio via `EnvironmentFile`).
- [x] Pubblicare il server su HTTPS (tunnel ngrok, vedi Infrastruttura di lavoro).
- [x] Collegare il webhook Telegram (verificato con `getWebhookInfo`).
- [x] Verificare messaggi e pulsanti — trovato e corretto un bug reale: `callback_data` usava il testo intero del pulsante, che supera spesso il limite di 64 byte di Telegram, causando un rifiuto silenzioso (`400 BUTTON_DATA_INVALID`) senza alcun errore nei log. Corretto in `server.mjs` con troncamento sicuro a 64 byte e aggiunto logging esplicito degli errori di invio, per evitare che un futuro fallimento resti di nuovo invisibile. Fix verificato sulla VM; da sincronizzare su GitHub (vedi Infrastruttura di lavoro).
- [ ] Verificare su Telegram reale il nuovo flusso a tasti rapidi persone/tempo (D-027) una volta completato il deploy sulla VM.
- [ ] Verificare fotografie e vocali (non ancora testati su Telegram reale).
- [ ] Aggiungere gestione delle preferenze e consenso.
- [ ] Programmare il D+1 in una fascia scelta dall’utente.

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
- [ ] Verificare l’uso volontario della dashboard.
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
- Implementare nello schema del laboratorio generativo il campo `techniqueMapId` deciso in D-028 (enum sulle 49 tecniche di `data/technique-map.draft.md` più il valore di fuga `altro` con nota libera), e collegarlo alla dashboard come territorio fisso delle tecniche osservate. Non ancora iniziato.

## Non fare ora

- Non creare un’app mobile nativa.
- Non costruire manualmente un’enciclopedia finita di ingredienti e ricette: l’ampiezza viene dal laboratorio generativo, il rigore dal protocollo e dal corpus.
- Non ampliare prematuramente il modello delle competenze.
- Non trattare la cultura gastronomica come dodicesima area strutturata della mappa delle tecniche prima delle evidenze del pilot (D-028).
- Non progettare il libro prima delle evidenze del pilot.
- Non aprire nuove attività Codex per singole idee del progetto.

## Regola di lavoro

Ogni nuova sessione di lavoro deve iniziare da `PROJECT.md` e `NEXT.md`. Ogni decisione definitiva aggiorna `DECISIONS.md`; ogni test aggiorna `EVIDENCE.md`.
