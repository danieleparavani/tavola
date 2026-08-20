# Tavola — stato canonico del progetto

Ultimo aggiornamento: 19 agosto 2026

## 1. Definizione

Tavola è un sistema conversazionale che accompagna persone già capaci di cucinare nelle decisioni quotidiane — scelta della cena, spesa, preparazione, problemi, chiusura e D+1 — e costruisce nel tempo una memoria verificabile delle loro competenze tecniche e culturali.

Non è un ricettario, un corso tradizionale o una semplice AI culinaria. Il modello linguistico è un motore interno; Tavola è il protocollo che stabilisce cosa il sistema deve sapere, quali obblighi deve rispettare e come deve rispondere nei diversi momenti.

## 2. Target iniziale

Cuochi domestici non principianti, con identità da hobbista e interesse per tecniche, libri, video, attrezzatura e cultura gastronomica. Sanno già portare a termine una cena, ma desiderano maggiore struttura, precisione, autonomia e capacità di collegare tecniche diverse.

## 3. Promessa centrale

> Parli con Tavola mentre vivi e cucini. Apri Tavola quando vuoi capire dove stai andando.

La conversazione accompagna la vita quotidiana; la dashboard rende visibile ciò che è stato costruito nel tempo.

## 4. Architettura dei canali

### Conversazione — canale primario

Primo pilot: Telegram. Possibile estensione successiva: WhatsApp.

La conversazione gestisce:

- contesto in auto, con interazione vocale e nessuna digitazione durante la guida;
- scelta della cena;
- ingredienti e vincoli;
- lista e sostituzioni al supermercato;
- proposta del piatto;
- preparazione completa, guidata o essenziale;
- testo, fotografia e vocale;
- assistenza nei problemi reali;
- finestra progettuale non invasiva;
- chiusura post-cena;
- D+1;
- ritorno alla sessione successiva.

### Dashboard web — canale secondario volontario

La dashboard contiene:

- competenze tecniche e culturali;
- evidenze associate alle sessioni;
- principi introdotti e ripresi;
- decisioni autonome;
- possibili transfer;
- cronologia ragionata, non semplice elenco di ricette;
- approfondimenti e riferimenti verificati;
- impostazioni, privacy ed esportazione dei dati;
- futuri collegamenti con il libro.

### Email — canale amministrativo

Email solo per invito, consenso, recupero dell’accesso, comunicazioni importanti, riepilogo finale e richiesta di intervista. Non viene usata come canale pedagogico quotidiano.

### Libro — struttura profonda futura

Il libro cartaceo organizzerà tecniche, principi causali, cultura gastronomica, errori, confronti e connessioni. Non sarà una raccolta di ricette. QR code e codici brevi potranno collegare i capitoli alla dashboard e a esperienze concrete.

## 5. Obblighi canonici del sistema

1. Target non principiante.
2. Utilità e riuscita della cena prima della pedagogia.
3. Un solo principio tecnico dominante per sessione.
4. Terminologia culinaria tecnica usata con sicurezza e autorevolezza.
5. Ogni termine importante deve nominare un fenomeno reale, guidare un’osservazione o rendere precisa una decisione.
6. Primo momento basato su termine, meccanismo, gesto e risultato.
7. Progressive disclosure: azione, segnale, spiegazione e approfondimento non sono mostrati tutti insieme.
8. Canali diversi applicano modelli diversi allo stesso tema.
9. D+1 leggero, curioso, rapido, sostanzioso e non interrogativo.
10. Finestra progettuale facoltativa, breve e mai in un passaggio urgente.
11. Riferimenti tecnici e culturali solo se affidabili e pertinenti.
12. Separazione tra evidenza, interpretazione, ipotesi e decisione.
13. La memoria longitudinale rappresenta competenze, non soltanto ricette o cronologia.
14. Nessuna attribuzione automatica di acquisizione o transfer.
15. Sicurezza e astensione quando mancano dati sufficienti.

## 6. Modello delle competenze

Stati iniziali:

1. non osservato;
2. introdotto;
3. strutturato;
4. usato autonomamente;
5. trasferito.

Un transfer richiede comportamento non sollecitato, sessione successiva, substrato diverso, principio realmente applicato ed evidenza osservabile.

## 7. Laboratorio di idee

Tavola non usa un catalogo chiuso di ingredienti o ricette. Il laboratorio generativo può progettare a partire da qualunque ingrediente e contesto, mentre il protocollo impone forma, rigore e limiti.

Le esperienze editoriali controllate servono come:

- esempi di qualità;
- casi di test;
- riferimento per le valutazioni;
- fallback temporanei durante lo sviluppo.

Non definiscono il perimetro degli ingredienti “supportati”. Il sistema può chiedere chiarimenti, generare una proposta strutturata o astenersi per una specifica informazione di sicurezza; non può classificare un normale ingrediente come non supportato.

## 8. Prototipi disponibili

- `outputs/mensa-mvp/`: primo prototipo web completo, utile come archivio dell’esperienza iniziale.
- `outputs/tavola-chat-mvp/`: MVP corrente, conversazione primaria, simulatore Telegram, webhook predisposto, memoria locale e dashboard.

Il secondo è il ramo operativo da sviluppare. Il primo non viene eliminato perché documenta l’evoluzione progettuale.

## 9. Fonte operativa

La sessione Claude (Cowork) collegata alla cartella del progetto è l’unica casa operativa per lo sviluppo (D-025, 20 agosto 2026). L’attività Codex **Tavola — sviluppo MVP e pilot**, casa operativa fino al 19 agosto 2026, diventa fonte storica insieme alle conversazioni precedenti e non deve ricevere nuovo lavoro. ChatGPT resta nel progetto esclusivamente come modello di controllo per il confronto A/B previsto in Fase 4 di `NEXT.md`.

I documenti canonici sono:

- `PROJECT.md` — identità e stato;
- `DECISIONS.md` — decisioni e motivazioni;
- `EVIDENCE.md` — osservazioni, interpretazioni e ipotesi;
- `NEXT.md` — attività e priorità.

Quando una discussione cambia il progetto, questi documenti devono essere aggiornati.
