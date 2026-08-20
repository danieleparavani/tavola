# Tavola — prossime attività

Ultimo aggiornamento: 19 agosto 2026

## Obiettivo corrente

Portare l’MVP conversazionale da simulatore locale a esperienza Telegram utilizzabile da 2–3 tester, correggerlo e poi allargare il pilot a 5–10 persone.

## Fase 0 — prova del progettista

**Stato:** in corso — audit del codice del 19 agosto 2026 completato, prova umana ancora da fare

- [ ] Usare il simulatore come utente reale dall’inizio al D+1.
- [ ] Annotare punti artificiali, risposte lunghe e passaggi mancanti.
- [ ] Verificare se la terminologia tecnica comunica autorevolezza.
- [ ] Provare almeno un dubbio imprevisto durante la preparazione.
- [ ] Controllare la dashboard dopo la sessione.
- [x] Consolidare le correzioni nel motore conversazionale — cfr. audit del 19 agosto 2026 (EVIDENCE.md, DECISIONS.md D-023/D-024): corretto il blocco dopo il D+1, la modalità “Fammi leggere tutto”, il denominatore fisso in dashboard, la copy sulla chiave, il logging del pilot e il gate editoriale; aggiunti 40 test automatici (`npm test`).
- [ ] Collegare il laboratorio generativo tramite chiave OpenAI API salvata nell’ambiente (via `/setup.html`).
- [ ] Provare ingredienti e vincoli molto diversi, verificando che non vengano sostituiti o ignorati — **non ancora eseguita con una chiamata reale al modello** (l’audit ha verificato la stessa logica con risposte simulate deterministiche; la chiave cifrata già salvata è vincolata alla macchina del progettista e non è utilizzabile dall’ambiente cloud dell’audit). Suggerimento concreto: dalla chat, provare un ingrediente fuori dai casi editoriali (es. “seppia”, “quinoa”, “cavolo nero”) con persone/tempo dichiarati in un’unica frase, verificare le tre direzioni, sviluppare quella scelta e controllare che il gate la accetti o si astenga spiegando perché.
- [ ] Monitorare, durante questa prova, eventuali astensioni del gate causate da falsi positivi del nuovo controllo generico spesa/passaggi (D-024): se un ingrediente reale viene segnalato come “mai citato nei passaggi” pur essendo usato con un sinonimo generico, annotarlo qui prima di allentare il controllo.

## Fase 1 — Telegram reale

**Stato:** non iniziata

- [ ] Creare il bot con BotFather.
- [ ] Salvare il token fuori dai file del progetto.
- [ ] Pubblicare il server su HTTPS.
- [ ] Collegare il webhook Telegram.
- [ ] Verificare messaggi, pulsanti, fotografie e vocali.
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
- Valutare pulsanti rapidi per persone/tempo nella raccolta contesto, oggi solo testuale (previsto ma non obbligatorio dal protocollo).

## Non fare ora

- Non creare un’app mobile nativa.
- Non costruire manualmente un’enciclopedia finita di ingredienti e ricette: l’ampiezza viene dal laboratorio generativo, il rigore dal protocollo e dal corpus.
- Non ampliare prematuramente il modello delle competenze.
- Non progettare il libro prima delle evidenze del pilot.
- Non aprire nuove attività Codex per singole idee del progetto.

## Regola di lavoro

Ogni nuova sessione di lavoro deve iniziare da `PROJECT.md` e `NEXT.md`. Ogni decisione definitiva aggiorna `DECISIONS.md`; ogni test aggiorna `EVIDENCE.md`.
