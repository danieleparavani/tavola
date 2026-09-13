# Tavola — materiali del pilot

Ultimo aggiornamento: 13 settembre 2026

Questo documento serve a una cosa sola: permettere di cominciare a raccogliere evidenze senza doverle inventare al momento. Contiene il messaggio da mandare ai tester, la griglia di osservazione e l'intervista. Nasce dalle regole già fissate in `EVIDENCE.md` («regole per le prossime evidenze») e dalle attività di `NEXT.md`, Fase 0 e Fase 2.

Il vincolo che le attraversa tutte è D-008: **evidenza, interpretazione, ipotesi e decisione restano separate**. Qui si raccolgono evidenze. L'interpretazione si scrive dopo, in `EVIDENCE.md`, e si dichiara come tale.

---

## 1. Prova del progettista (Fase 0)

Una cena vera, dall'apertura della chat al D+1 del mattino dopo. Non una simulazione: D-016 dice che una prova dichiarata o rilevata come simulazione non aggiorna la competenza, e un percorso cliccato in due minuti resta un test dell'interfaccia.

Da annotare **mentre** succede, non a posteriori:

- il momento esatto in cui hai pensato «questo è artificiale»;
- ogni risposta che hai saltato perché troppo lunga;
- il primo dubbio imprevisto, e se la risposta è servita;
- se hai aperto la dashboard di tua iniziativa, e quando;
- se il D+1 del mattino dopo l'hai letto fino in fondo.

---

## 2. Messaggio ai tester (Fase 2)

Da mandare così com'è. Non spiega come usare il sistema: se serve una spiegazione, è un risultato del test, non un suo presupposto.

> Ciao, ti chiedo una mano su una cosa a cui sto lavorando.
>
> È un assistente di cucina su Telegram. Lo apri quando devi decidere cosa cenare, o quando sei già davanti ai fornelli, e ci parli come parleresti a qualcuno. Scrivi, mandi vocali, mandi foto: come ti viene.
>
> Ti chiedo di usarlo per **due cene vere**, a distanza di qualche giorno, con quello che hai in casa o che compreresti comunque. Non cucinare qualcosa di speciale per il test.
>
> Non ti do istruzioni sul funzionamento apposta: mi serve sapere dove ti blocchi. Se ti blocchi, fermati e scrivimelo — è esattamente il dato che cerco.
>
> Il giorno dopo ogni cena ti arriverà un messaggio. Leggilo o ignoralo, come ti viene: anche quello è un dato.
>
> Alla fine ti chiamo dieci minuti. Nient'altro.

Quello che **non** va detto prima: che c'è una dashboard, che il sistema tiene memoria delle competenze, che dietro c'è un protocollo. Se lo scoprono da soli è un'evidenza; se glielo diciamo noi è una domanda suggerita.

---

## 3. Griglia di osservazione

Una riga per sessione. I campi vengono da `EVIDENCE.md`.

| Campo | Come si registra |
|---|---|
| Partecipante e condizione | iniziali, prima o seconda sessione, reale o simulata |
| Contesto reale | quante persone, quanto tempo, dove si trovava, che fretta aveva |
| Utilità per la cena | la cena è riuscita? il sistema è servito o è stato un ostacolo? |
| Invasività | quante volte ha interrotto in un momento sbagliato |
| Soddisfazione gastronomica | giudizio sul piatto, con parole sue |
| Punto di abbandono | dove si è fermato, se si è fermato |
| Approfondimenti aperti volontariamente | quali, e in quale momento |
| Domande e problemi reali | trascritti alla lettera, non riassunti |
| Richiamo post-cena | ha risposto alla chiusura? cosa ha scritto? |
| Lettura del D+1 | letto, ignorato, o letto e commentato |
| Ritorno per una seconda sessione | spontaneo, sollecitato, o assente |

**Regola non negoziabile:** nessuna risposta sollecitata può essere registrata come transfer (D-014 del modello delle competenze). Se gli chiedi «hai riusato la tecnica dell'altra volta?» e risponde di sì, quello non è transfer: è una risposta a una domanda.

---

## 4. Intervista finale (dieci minuti)

Domande aperte, in quest'ordine. Non aggiungerne di nuove durante la chiamata.

1. Raccontami la prima cena, dall'inizio.
2. C'è stato un momento in cui ti sei sentito trattato come un principiante?
3. C'è stato un momento in cui non hai capito perché ti chiedeva una cosa?
4. Se domani dovessi cucinare la stessa cosa, cambieresti qualcosa rispetto a come l'hai fatta?
5. Il messaggio del giorno dopo: te lo ricordi? cosa diceva?
6. Cosa gli toglieresti.

La quarta è l'unica che può far emergere un candidato di autonomia, e va lasciata scoperta: se nomina una tecnica senza che gliel'abbiamo nominata noi, si registra alla lettera e si classifica dopo. La sesta chiude meglio della domanda opposta, perché è più facile rispondere sinceramente.

---

## 5. Cosa fa il pilot con i dati

Ogni sessione aggiorna `EVIDENCE.md` con quattro blocchi distinti — evidenze osservate, interpretazioni plausibili, ipotesi non verificate, decisioni derivate — e nient'altro. Una correzione al prodotto diventa una voce in `DECISIONS.md` solo quando è decisa, non quando è ipotizzata.

Le ipotesi oggi aperte, che il pilot serve a mettere alla prova, sono già elencate in `EVIDENCE.md`: che la strutturazione valga per qualcuno diverso dal progettista, che il valore sia distinguibile da un LLM generalista ben promptato, che la guida regga nella fretta reale, che la memoria longitudinale produca ritorno, che esista transfer, e che l'immagine del piatto serva davvero a qualcosa.
