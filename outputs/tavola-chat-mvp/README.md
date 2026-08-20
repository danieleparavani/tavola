# Tavola Chat MVP

MVP conversazionale con simulatore Telegram, bot collegabile tramite webhook, memoria persistente e dashboard del percorso.

## Avvio locale

```powershell
$env:PORT=4310
node server.mjs
```

Aprire `http://localhost:4310`. La dashboard è su `http://localhost:4310/dashboard`.

Non richiede pacchetti esterni. I dati del pilot sono salvati in `data/pilot.json`.

## Collegamento Telegram

1. Creare un bot con BotFather.
2. Impostare `TELEGRAM_BOT_TOKEN` nell’ambiente del server.
3. Pubblicare il server su un indirizzo HTTPS.
4. Configurare il webhook Telegram su `https://DOMINIO/telegram/webhook`.

Il simulatore e Telegram usano lo stesso motore `core/tavola.mjs`: non esistono due logiche separate.

## Obblighi già implementati

- stato esplicito del momento quotidiano;
- avvertenza e modalità vocale in auto;
- utilità prima della spiegazione durante un problema;
- un principio tecnico dominante;
- terminologia tecnica collegata a meccanismo, gesto e risultato;
- progressive disclosure tramite “Perché?”;
- proposta editoriale verificata anziché generazione universale;
- evidenze separate dallo stato della competenza;
- nessuna attribuzione automatica di acquisizione o transfer;
- D+1 breve e non interrogativo;
- stesso modello dati per chat e dashboard.

## Laboratorio generativo

Se `OPENAI_API_KEY` è presente nell’ambiente, ogni ingrediente che non usa uno dei casi editoriali viene inviato al laboratorio generativo. La risposta è vincolata a uno schema: chiarimento oppure proposta completa con principio, predizione, passaggi, segnali, assistenza e D+1.

Le esperienze editoriali non rappresentano più ingredienti “supportati”; sono casi di qualità e test.

Per il test locale si può aprire `http://localhost:4310/setup.html`: la chiave viene verificata tramite l'API di OpenAI, poi cifrata con AES-256-GCM e salvata in `data/openai-key.protected` (esclusa dal versionamento, permessi `0600`, chiave di cifratura derivata da utente e host della macchina locale). Sopravvive ai riavvii del server: non va ricollegata a ogni avvio. Non compare mai in chiaro nei log o nei file del progetto.

## Limiti intenzionali

Vocali e fotografie sono registrati come tipo di input, ma trascrizione e analisi visiva richiederanno i rispettivi servizi. I riferimenti tecnici e culturali verificati richiederanno un corpus controllato; il laboratorio non è autorizzato a inventarli.
