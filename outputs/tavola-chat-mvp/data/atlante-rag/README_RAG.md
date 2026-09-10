# ATLANTE TECNICO DELLA CUCINA v2 — RAG READY

Pacchetto derivato dal master v2 finale senza modificare le 413 monografie canoniche.

## Contenuto
- `tecniche.jsonl`: 413 record, uno per tecnica.
- `chunks_sezioni.jsonl`: 5305 chunk semantici, uno per sezione utile della monografia.
- `fonti.jsonl`: 270 fonti normalizzate.
- `tecnica_fonte.csv`: 1838 relazioni tecnica–fonte.
- `atlante_rag.sqlite`: database SQLite con tabelle normalizzate e indice FTS5 full-text.
- `schema_rag.json`: definizione dei campi.
- `PROMPT_SISTEMA_CHATBOT.md`: prompt di base per una chatbot che interroga l’Atlante.
- `MANIFEST_SHA256.txt`: hash dei file.

## Conteggi verificati
- Tecniche: 413
- Chunk di sezione: 5305
- Fonti: 270
- Relazioni tecnica–fonte: 1838

## Strategia RAG consigliata
1. Recuperare prima i chunk per similarità semantica o full-text.
2. Raggruppare i risultati per `technique_id`.
3. Recuperare dal record completo della tecnica il contesto mancante.
4. Recuperare le fonti collegate tramite `technique_source`.
5. Nella risposta distinguere sempre contenuto documentato, analisi tecnica e limiti/controversie.
6. Non trasformare intervalli di letteratura in regole universali.

## Ricerca SQLite
Esempio:
```sql
SELECT technique_id, tecnica, section_label, text
FROM chunks_fts
WHERE chunks_fts MATCH 'emulsione'
LIMIT 10;
```

## Nota
Questo pacchetto è pronto per indicizzazione con un sistema di embedding esterno, ma non contiene embedding proprietari o dipendenti da un provider.
