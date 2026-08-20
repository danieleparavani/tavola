# Tavola — rapporto di audit e correzione, 19 agosto 2026

Ambito: `outputs/tavola-chat-mvp/`. Metodo: lettura integrale di `README.md`, `PROJECT.md`, `DECISIONS.md`, `EVIDENCE.md`, `NEXT.md` e di tutto il codice del prodotto corrente; ricostruzione della macchina a stati; correzione dei difetti trovati; 40 test automatici nuovi; verifica contro i dati reali del pilot già raccolti (mai modificati). Tutti i dettagli evidenza/interpretazione/decisione sono anche registrati in `EVIDENCE.md` e `DECISIONS.md` (D-023, D-024).

## Mappa dello stato prima della correzione

`new → locating → collecting_context → difficulty_choice → (lab_clarification) → proposal → mode → cooking → closure → reflection → waiting_dplus → dplus`

Il difetto più grave stava proprio nell'ultimo tratto: da `waiting_dplus`/`dplus` non esisteva un modo affidabile di tornare a `locating` senza un `/start` esplicito, che il prodotto vieta di richiedere.

## Modifiche implementate, in ordine di gravità

1. **Blocco permanente dopo il D+1 (critico).** Lo stato `dplus` non veniva mai impostato da `dplus()`, e da `waiting_dplus` solo un clic esatto su uno dei tre pulsanti di intenzione riapriva un capitolo. Qualunque altro messaggio — il caso normale su Telegram, dove non c'è un evento "apertura chat" distinto dall'invio di un messaggio — restava intrappolato in "Perfetto. Nessun compito per oggi." Il simulatore mascherava il problema perché il client web invia un `/start` automatico a ogni reload. **Corretto**: qualunque messaggio in stato dormiente riapre ora un nuovo capitolo, salvo risposte esplicitamente legate al D+1.
2. **Modalità "Fammi leggere tutto" corrotta da un secondo clic.** Cliccare "Inizia la guida" dopo aver scelto la lettura integrale veniva ri-analizzato dalla stessa logica di scelta modalità e la sovrascriveva silenziosamente con "guidata". **Corretto.**
3. **"Solo punti critici" senza alcun effetto.** Nessun ramo del codice leggeva la modalità durante la cucina. **Corretto**: ora nasconde i segnali osservabili nei passaggi non dominanti, mostrandoli sempre nel passaggio del principio tecnico centrale e in quello finale di impiattamento.
4. **Dashboard con denominatore fisso "/5".** Violava esplicitamente l'obbligo di usare il numero reale di passaggi. **Corretto**, con fallback pulito per le sessioni storiche che non hanno il nuovo campo.
5. **Copy sulla chiave OpenAI non veritiera.** `setup.html` e il `README.md` del prodotto dichiaravano che la chiave restasse solo in memoria; il codice la cifra e la scrive su disco (comportamento corretto e voluto, cfr. D-018), ma la descrizione era falsa. **Corretta la copy**, non il comportamento.
6. **Eventi di logging del pilot mancanti.** Aggiunti: `context_missing`, `proposal_rejected`, `step_shown`, `reflection_assessed`, `dashboard_opened`, `editorial_gate_rejected` (ora con elenco strutturato dei motivi).
7. **Gate editoriale troppo stretto sui soli casi hardcoded.** La coerenza spesa/passaggi era verificata solo per risotto e vongole. Aggiunto un controllo generico (con tolleranza per plurali/declinazioni e voci facoltative) che si applica a qualunque piatto generato. Rischio noto e documentato in D-024: un iperonimo generico nei passaggi potrebbe generare un raro falso positivo, che nel peggiore dei casi porta a un'astensione onesta, non a una ricetta scorretta mostrata.
8. **`.env.example` con modello diverso da quello effettivamente usato** (`gpt-5` vs `gpt-5-mini`). Corretto per coerenza con NEXT.md.
9. **Codice morto documentato, non rimosso.** I tre piatti editoriali storici e lo stato `clarify_triglia` sono irraggiungibili dal motore da quando ogni richiesta passa dal laboratorio generativo (D-014). Non li ho rimossi senza discuterne: li ho commentati come tali e li uso ora come fixture nei test del gate. Decisione su un loro eventuale riutilizzo come fallback offline lasciata aperta in NEXT.md.

Nessuna decisione o funzionalità è stata rimossa; nessun dato del pilot (`data/pilot.json`, la chiave cifrata) è stato toccato.

## Test automatici (40/40 superati, `npm test`)

- **Apertura automatica**: primo messaggio qualunque avvia il capitolo, nessun `/start` nel testo.
- **Tre intenzioni operative**: idea / spesa / cucina, tutte portano a `collecting_context` con il prompt corretto.
- **Parsing di persone e tempo**: incluso il bug storico "1 ora → 30 minuti", verificato non reintrodotto; minuti espliciti; ore decimali.
- **Dati mancanti**: mai inventati, richiesta mirata, evento registrato.
- **Tre livelli**: generazione delle tre direzioni, sviluppo della sola direzione scelta.
- **Selezione del livello**: transizione a `proposal` con `stepsTotal` corretto.
- **Gate editoriale**: accetta un piatto coerente; respinge ingredienti mai citati nei passaggi, competenze generiche, impiattamento mancante, fonti insufficienti o non ammesse, la falsa precisione da risotto, il mancato reinserimento delle vongole; verificato un rifiuto end-to-end con astensione esplicita.
- **Impiattamento**: sempre presente, anche in modalità essenziale.
- **Simulazione**: passaggi rapidissimi → registrata come simulazione, competenza non promossa; ritmo plausibile → competenza "introdotto" con evidenza corretta.
- **D+1 differito**: negato prima della scadenza, consegnato dopo, con follow-up ora davvero raggiungibile.
- **Persistenza della chiave**: round-trip cifra/decifra, nessuna chiave in chiaro su disco, sopravvive a una nuova lettura, gestisce file assente/corrotto.
- **Conservazione della memoria**: test di integrazione che avvia davvero `server.mjs` come processo separato, scrive stato, lo riavvia e verifica che lo stato dell'utente sia sopravvissuto.
- Tutti i piatti reali già generati nel pilot (`qa-credit-live`, `qa-credit-live-2`) sono stati ripassati contro il nuovo controllo di coerenza spesa/passaggi senza falsi positivi.

## Problemi ancora aperti

- **Nessuna chiamata reale al modello è stata eseguita da questo ambiente.** La chiave cifrata già salvata sul tuo computer è vincolata a quella macchina (derivazione da utente e host locali, D-018) e non è decifrabile da questo ambiente cloud; non ho incollato né richiesto una chiave in chiaro qui, coerentemente con "non incollarla nella chat". La verifica del gate con `qualityIssues` e della logica di stato è stata fatta con risposte del modello simulate ma deterministiche — copre la logica, non la qualità reale delle proposte di `gpt-5-mini`.
- I tre piatti editoriali storici restano irraggiungibili in produzione: decisione su un loro riutilizzo come fallback offline non presa, lasciata in NEXT.md.
- Persone e tempo restano raccolti solo per testo libero (i pulsanti rapidi sono permessi ma non obbligatori dal protocollo): non implementati in questo giro, per contenere lo scope.
- Il nuovo controllo generico di coerenza spesa/passaggi può in rari casi generare un falso positivo con iperonimi generici ("spaghetti" in spesa, "la pasta" nei passaggi): da monitorare nella Fase 0, non ancora osservato nei dati reali disponibili.

## Rischi prima del pilot

1. **Priorità alta**: eseguire davvero la prova end-to-end con la tua chiave collegata (`/setup.html`) e un ingrediente fuori dai casi editoriali (es. seppia, quinoa, cavolo nero), fino in fondo al D+1, per validare la qualità reale delle proposte del modello e la tenuta del gate con traffico vero — non solo la logica.
2. Il simulatore maschera bug legati alla persistenza dello stato tra sessioni (per via del `/start` automatico a ogni reload): tienilo presente se in Fase 0 sembra tutto perfetto — il test di integrazione aggiunto copre questo caso, ma vale la pena rifarlo anche a mano, magari da telefono su Telegram appena collegato.
3. Nessun pilot precedente ha mai attraversato lo stato `dplus` con follow-up reale: la prima volta che qualcuno clicca "Una curiosità in più" dopo il D+1 sarà, di fatto, la prima verifica in condizioni reali di quel percorso.

## Prossimo passo consigliato

Fase 0 del tuo `NEXT.md`: collega la chiave OpenAI via `/setup.html` e fai tu stesso, da persona, l'intero percorso con un ingrediente non editoriale fino al D+1 del giorno dopo — è l'unica verifica che questo audit non poteva fare per te.
