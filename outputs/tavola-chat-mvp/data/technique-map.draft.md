# Panorama delle tecniche — bozza per la dashboard

Nota d'uso: questa mappa è una tassonomia statica, separata dal laboratorio generativo.
Non limita cosa Tavola può cucinare (resta aperto, D-014) — serve solo a dare alla
dashboard un territorio fisso su cui mostrare dove l'utente è realmente passato.
Ogni voce ha un `id` pensato per diventare un valore enum nello schema JSON del
laboratorio (`techniqueMapId`), così il modello dichiara a quale voce corrisponde
la tecnica dominante di ogni ricetta generata, invece di inventare etichette libere.

Target: cuoco domestico non principiante (D-001) — niente gesti elementari
("come si taglia una cipolla"), solo tecniche che aggiungono struttura, precisione
e capacità di collegare preparazioni diverse.

---

## 1. Cotture a calore diretto (secco)
- `sear_maillard` — Rosolatura e reazione di Maillard
- `grigliatura` — Grigliatura e gestione di fiamma/brace
- `frittura_immersione` — Frittura in olio abbondante e controllo della temperatura
- `arrosto_forno_secco` — Arrosto e cottura al forno a calore secco
- `affumicatura_base` — Affumicatura a freddo e a caldo, uso domestico

## 2. Cotture in umido e a bassa temperatura
- `brasatura` — Brasatura e stufatura
- `sottovuoto_bassa_temp` — Cottura sottovuoto a bassa temperatura
- `pochage` — Pochage (bollitura dolce/affogare)
- `cottura_vapore` — Cottura a vapore
- `cottura_inerzia` — Cottura per inerzia (calore residuo dopo la fonte di calore)

## 3. Emulsioni, legami e salse
- `emulsione_calda` — Emulsione calda (es. beurre blanc, salse montate)
- `emulsione_fredda` — Emulsione a freddo stabile (es. maionese, vinaigrette)
- `mantecatura` — Mantecatura (pasta, risotto)
- `legare_amido` — Legare con amido (roux, fecole, amido di cottura)
- `deglassare` — Deglassare e recuperare i sapori di rosolatura

## 4. Fondi e concentrazione del sapore
- `fondo_bruno_bianco` — Fondo bruno e fondo bianco
- `brodo_chiaro_ristretto` — Brodo chiaro vs brodo ristretto
- `estrazione_nel_grasso` — Estrazione aromatica nel grasso (infusione a bassa temperatura)
- `caramellizzazione` — Caramellizzazione degli zuccheri
- `riduzione_controllata` — Riduzione senza eccesso di sapidità/concentrazione

## 5. Pesce e frutti di mare
- `cottura_differenziale_filetto` — Cottura differenziale di un filetto con pelle
- `cottura_pesce_intero` — Cottura di un pesce intero (per inerzia)
- `molluschi_apertura` — Gestione dei molluschi (apertura, liquido, reinserimento)
- `crudo_marinato` — Crudo e marinature rapide (crudo, ceviche)
- `salatura_breve_pesce` — Salatura/affumicatura breve del pesce

## 6. Carni e altre proteine
- `riposo_carne` — Riposo della carne e migrazione dei succhi
- `cottura_tagli_diversi` — Cottura differenziata per tagli magri vs ricchi di collagene
- `impanatura_doratura` — Impanatura e controllo della doratura
- `marinatura_intenerimento` — Marinatura e intenerimento
- `uova_cotture_precise` — Cotture precise dell'uovo (consistenze intermedie)

## 7. Lievitati e impasti
- `sviluppo_glutine` — Impasto e sviluppo del glutine
- `lievitazione_naturale_vs_lievito` — Lievitazione naturale vs lievito commerciale
- `puntata_appretto` — Puntata e appretto (prima e seconda lievitazione)
- `idratazione_impasto` — Gestione dell'idratazione dell'impasto
- `cottura_pane_domestica` — Cottura del pane in forno domestico (vapore, pietra)

## 8. Verdure e cotture vegetali
- `sbianchitura_shock` — Sbianchitura e shock termico
- `trifolatura` — Trifolatura e salti in padella
- `arrosto_verdure` — Cottura arrosto delle verdure e caramellizzazione
- `osmosi_marinatura_veg` — Marinatura e osmosi (sale, aceto, zucchero)
- `puree_consistenza` — Puree e controllo della consistenza vellutata

## 9. Taglio, mise en place e gestione del calore
- `taglio_uniforme` — Taglio uniforme e sicurezza
- `affilatura_coltelli` — Affilatura e manutenzione dei coltelli
- `mise_en_place` — Organizzazione della mise en place
- `controllo_temperature` — Lettura e controllo delle temperature di cottura
- `gestione_tempi_multipli` — Gestione del tempo su più preparazioni simultanee

## 10. Trasformazioni rapide e conservazioni brevi
- `marinatura_acida` — Marinature acide (ceviche, agrodolce)
- `sottovuoto_conservazione` — Sottovuoto per conservazione breve
- `fermentazione_rapida` — Fermentazioni rapide di base (es. verdure lattofermentate)
- `essiccazione_parziale` — Essiccazione/disidratazione parziale in cucina domestica

## 11. Impiattamento e composizione
- `disposizione_bilanciamento` — Disposizione e bilanciamento visivo del piatto
- `temperatura_servizio` — Temperatura di servizio
- `contrasto_consistenze` — Contrasto di consistenze nel piatto
- `finiture_funzionali` — Finiture con funzione gustativa (non decorative)
- `equilibrio_piatto` — Equilibrio di un piatto (acidità, grasso, sale, dolcezza)

---

Totale: 11 aree, 49 tecniche nominate. Numero volutamente non tondo: non è un
traguardo da completare, è una mappa — si può ampliare in seguito senza fretta.

## Domande aperte da chiudere insieme

1. Vogliamo davvero vincolare lo schema del laboratorio con un `techniqueMapId`
   enum (più affidabile, ma il modello a volte dovrà "forzare" una ricetta dentro
   la voce più vicina) oppure lasciare un margine con un valore `altro` più una
   nota libera, per non snaturare la libertà del laboratorio aperto (D-014)?
2. La cultura gastronomica (scuole, tradizioni, storia di una tecnica) resta fuori
   da questa mappa per ora, o la trattiamo come una dodicesima area trasversale?
   Ho lasciato fuori questa categoria nella bozza per non allargare troppo lo
   scope al primo giro — se la vuoi dentro, è un'aggiunta piccola.
