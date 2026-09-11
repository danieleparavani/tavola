import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newUser, handle, dplus, publicUser, isDplusDue, willCallLab } from '../core/tavola.mjs';

// Il laboratorio generativo richiede una chiave presente nell'ambiente: per i test la
// impostiamo a un valore fittizio e intercettiamo `fetch` così nessuna chiamata di rete
// reale viene mai effettuata.
process.env.OPENAI_API_KEY = 'sk-test-fixture-not-real';

const originalFetch = globalThis.fetch;
let mockQueue = [];
function queueResponse(obj) {
  mockQueue.push(obj);
}
function installFetchMock() {
  mockQueue = [];
  globalThis.fetch = async () => {
    const next = mockQueue.shift();
    if (!next) throw new Error('mock fetch: nessuna risposta in coda');
    return { ok: true, json: async () => next, text: async () => JSON.stringify(next) };
  };
}
function restoreFetch() {
  globalThis.fetch = originalFetch;
}

function threeIdeas() {
  return {
    output_text: JSON.stringify({
      ideas: [
        { level: 'simple', name: 'Zucca arrosto al rosmarino', description: 'Cottura diretta, poche variabili.', principle: 'Caramellizzazione superficiale', focus: 'Con questa ricetta affrontiamo la caramellizzazione: osserva come il calore diretto scurisce la superficie senza seccare il centro.', ingredients: ['zucca', 'rosmarino', 'olio', 'sale'] },
        { level: 'technical', name: 'Vellutata di zucca con crumble salato', description: 'Doppia consistenza controllata.', principle: 'Consistenza per contrasto', focus: 'Con questa ricetta affrontiamo il controllo di due consistenze nello stesso piatto.', ingredients: ['zucca', 'brodo', 'farina', 'burro', 'nocciole'] },
        { level: 'gourmet', name: 'Zucca in due cotture con salvia fritta', description: 'Concentrazione del sapore in due fasi.', principle: 'Cottura in due tempi', focus: 'Con questa ricetta affrontiamo la cottura in due tempi, già utile su altri ingredienti.', ingredients: ['zucca', 'salvia', 'burro', 'olio'] },
      ],
    }),
  };
}

// D-050: seconda infornata di idee, con nomi diversi dalla prima, per verificare che una
// richiesta di "altre proposte" arrivi davvero a una nuova chiamata del laboratorio invece di
// ripetere le stesse tre direzioni già mostrate.
function threeOtherIdeas() {
  return {
    output_text: JSON.stringify({
      ideas: [
        { level: 'simple', name: 'Zucca al vapore con burro nocciola', description: 'Cottura delicata, condimento veloce.', principle: 'Cottura a vapore', focus: 'Con questa ricetta affrontiamo la cottura a vapore, per la prima volta.', ingredients: ['zucca', 'burro', 'sale'] },
        { level: 'technical', name: 'Gnocchi di zucca al forno', description: 'Impasto e cottura in due fasi.', principle: 'Legatura dell\'impasto', focus: 'Con questa ricetta affrontiamo il controllo dell\'umidità in un impasto.', ingredients: ['zucca', 'farina', 'uovo', 'parmigiano'] },
        { level: 'gourmet', name: 'Zucca fermentata e arrosto', description: 'Fermentazione breve, poi cottura diretta.', principle: 'Fermentazione lattica breve', focus: 'Con questa ricetta affrontiamo un principio di trasformazione mai visto prima.', ingredients: ['zucca', 'sale', 'olio'] },
      ],
    }),
  };
}

function validLabDish(id = 'lab_zucca_test') {
  return {
    output_text: JSON.stringify({
      kind: 'proposal',
      question: '',
      options: [],
      dish: {
        id,
        name: 'Zucca in due cotture con salvia fritta',
        competency: 'concentrazione_sapore',
        competencyName: 'Concentrare il sapore con cotture in due tempi',
        techniqueMapId: 'caramellizzazione',
        techniqueMapNote: '',
        principle: { term: 'Cottura in due tempi', rule: 'Una prima cottura idrata e ammorbidisce, una seconda concentra e rosola.', prediction: 'Se salti la seconda cottura ad alta temperatura, la zucca resterà morbida ma priva di superficie caramellizzata.' },
        shopping: ['zucca', 'salvia', 'burro', 'olio extravergine', 'sale'],
        closure: 'La superficie era caramellizzata mantenendo il centro cremoso?',
        closureButtons: [['Sì', 'Parzialmente'], ['No', 'Non l’ho cucinato: era una simulazione']],
        dplus: 'Curiosità leggera e rapida su una tecnica in due tempi.',
        curiosity: 'La stessa logica vale per molte verdure a polpa acquosa.',
        evidence: [
          { claim: 'la doppia cottura concentra gli zuccheri in superficie', status: 'evidence', sourceTitle: 'Scuola di cucina', sourceUrl: 'https://scuola.example/zucca' },
          { claim: 'la salvia fritta in burro resta croccante se asciutta', status: 'interpretation', sourceTitle: 'Istituto tecnico', sourceUrl: 'https://istituto.example/salvia' },
        ],
        steps: [
          { term: 'Cottura a vapore', title: 'Ammorbidisci la zucca', action: 'Cuoci la zucca a vapore finché è tenera al centro.', observe: 'la forchetta entra senza resistenza', why: 'il vapore idrata senza asciugare la superficie', help: 'allunga qualche minuto se resiste' },
          { term: 'Cottura in due tempi', title: 'Rosola in padella', action: 'Scalda burro e olio, rosola la zucca a fuoco alto su ogni lato.', observe: 'la superficie scurisce e si forma una crosta', why: 'il calore diretto concentra gli zuccheri superficiali', help: 'abbassa il fuoco se annerisce troppo in fretta' },
          { term: 'Frittura rapida', title: 'Friggi la salvia', action: 'Friggi le foglie di salvia in burro chiarificato per pochi secondi.', observe: 'diventano rigide e traslucide', why: 'la breve frittura elimina l’umidità senza bruciare la clorofilla', help: 'toglile subito se scuriscono' },
          { term: 'Impiattamento', title: 'Componi il piatto', action: 'Disponi la zucca al centro del piatto caldo, adagia la salvia fritta sopra e finisci con un filo d’olio.', observe: 'il piatto resta caldo e la salvia rimane croccante in superficie', why: 'la finitura a crudo protegge la croccantezza della salvia', help: 'servi immediatamente' },
        ],
        // D-048: campo strutturato richiesto dal gate editoriale (core/lab.mjs, qualityIssues).
        plating: {
          clockLayout: [
            { element: 'zucca rosolata', position: 'centro', shape: 'mucchio' },
            { element: 'salvia fritta', position: '12', shape: 'linea' },
          ],
          sauceStyle: 'nessuna',
          temperature: 'piatto caldo',
          textureNote: 'la salvia deve restare croccante in superficie',
          finish: 'filo d’olio a crudo, salvia adagiata solo al momento',
        },
      },
    }),
  };
}

// --- apertura automatica -----------------------------------------------------------

test('apertura automatica: il primo messaggio (qualunque testo) avvia il capitolo senza /start', async () => {
  const u = newUser('u1', 'Tester');
  assert.equal(u.state, 'new');
  const out = await handle(u, { text: 'buonasera' });
  assert.equal(u.state, 'locating');
  assert.match(out.text, /Da dove partiamo\?/);
  assert.ok(out.keyboard && out.keyboard.length > 0);
});

test('apertura automatica: nessun comando tecnico compare nel testo iniziale', async () => {
  const u = newUser('u1b', 'Tester');
  const out = await handle(u, { text: 'ciao' });
  assert.doesNotMatch(out.text, /\/start/);
});

// --- tre intenzioni operative -------------------------------------------------------

test('le tre intenzioni operative portano tutte a collecting_people con i tasti rapidi per le persone', async () => {
  for (const [label, expectedIntent] of [
    ['💡 Cerco un’idea', 'idea'],
    ['🛒 Sto facendo la spesa', 'shopping'],
    ['🍳 Ho gli ingredienti, cuciniamo', 'cook'],
  ]) {
    const u = newUser('intent-' + expectedIntent, 'Tester');
    await handle(u, { text: 'ciao' }); // apre il capitolo
    const out = await handle(u, { text: label });
    assert.equal(u.state, 'collecting_people');
    assert.equal(u.context.intent, expectedIntent);
    assert.match(out.text, /persone/i);
    assert.deepEqual(out.keyboard, [['1', '2'], ['3', '4'], ['5+']]);
  }
});

// --- tasti rapidi persone/tempo (D-027) -----------------------------------------------

test('tasti rapidi: persone e tempo si raccolgono in due passaggi separati con tasti dedicati', async () => {
  const u = newUser('quickkeys1', 'Tester');
  await handle(u, { text: 'ciao' });
  await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
  assert.equal(u.state, 'collecting_people');

  const afterPeople = await handle(u, { text: '3' });
  assert.equal(u.context.people, '3');
  assert.equal(u.state, 'collecting_time');
  assert.match(afterPeople.text, /tempo/i);
  assert.deepEqual(afterPeople.keyboard, [['15 min', '30 min'], ['45 min', '1 ora'], ["più di un'ora"]]);

  const afterTime = await handle(u, { text: '45 min' });
  assert.equal(u.context.time, '45');
  assert.equal(u.state, 'collecting_context');
  assert.match(afterTime.text, /ingrediente|piatto/i);
});

test('tasti rapidi: "5+" e "più di un\'ora" vengono riconosciuti con un valore rappresentativo', async () => {
  const u = newUser('quickkeys2', 'Tester');
  await handle(u, { text: 'ciao' });
  await handle(u, { text: '💡 Cerco un’idea' });
  await handle(u, { text: '5+' });
  assert.equal(u.context.people, '5');
  const out = await handle(u, { text: "più di un'ora" });
  assert.equal(u.context.time, '90');
  assert.equal(u.state, 'collecting_context');
  void out;
});

// --- correzione di un dato già raccolto -----------------------------------------------
// Evidenza: un tester ha scritto "ho sbagliato il numero di persone" mentre il sistema
// chiedeva il tempo, e restava bloccato — il messaggio non era né un tasto rapido né un
// intento di riavvio completo, quindi cadeva nel parsing del tempo, falliva, e il sistema
// tornava a chiedere il tempo senza mai lasciare correggere le persone (cfr. DECISIONS.md).

test('correzione: "ho sbagliato il numero di persone" mentre si sta rispondendo al tempo riporta a collecting_people senza perdere il resto', async () => {
  const u = newUser('correction1', 'Tester');
  await handle(u, { text: 'ciao' });
  await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
  await handle(u, { text: '3' });
  assert.equal(u.state, 'collecting_time');

  const out = await handle(u, { text: 'ho sbagliato il numero di persone' });
  assert.equal(u.state, 'collecting_people');
  assert.equal(u.context.people, null);
  assert.match(out.text, /persone/i);
  assert.deepEqual(out.keyboard, [['1', '2'], ['3', '4'], ['5+']]);

  const afterFix = await handle(u, { text: '4' });
  assert.equal(u.context.people, '4');
  assert.equal(u.state, 'collecting_time'); // torna avanti da sola, non ricomincia da capo
});

test('correzione: "voglio correggere il tempo" durante la domanda sull\'ingrediente riporta a collecting_time senza perdere le persone', async () => {
  const u = newUser('correction2', 'Tester');
  await handle(u, { text: 'ciao' });
  await handle(u, { text: '💡 Cerco un’idea' });
  await handle(u, { text: '2' });
  await handle(u, { text: '30 min' });
  assert.equal(u.state, 'collecting_context');

  const out = await handle(u, { text: 'voglio correggere il tempo' });
  assert.equal(u.state, 'collecting_time');
  assert.equal(u.context.time, null);
  assert.equal(u.context.people, '2'); // non toccato
  assert.match(out.text, /tempo/i);
});

test('correzione: una frase di cottura che contiene "cambi" senza riferirsi a persone/tempo non viene trattata come correzione', async () => {
  const u = newUser('correction3', 'Tester');
  await handle(u, { text: 'ciao' });
  await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
  const out = await handle(u, { text: '3' });
  assert.equal(u.state, 'collecting_time');
  void out;

  // "cambia" compare, ma non si riferisce a persone né a tempo: deve restare nel parsing normale del tempo
  const stillTime = await handle(u, { text: 'cambia il condimento se serve' });
  assert.equal(u.state, 'collecting_time');
  assert.equal(u.context.time, null);
});

test('scorciatoia one-shot: un solo messaggio con persone, tempo e ingrediente salta direttamente alle tre direzioni', async () => {
  installFetchMock();
  try {
    const u = newUser('oneshot1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    assert.equal(u.state, 'collecting_people');
    queueResponse(threeIdeas());
    const out = await handle(u, { text: '2 persone, 45 minuti, ho della zucca' });
    assert.equal(u.context.people, '2');
    assert.equal(u.context.time, '45');
    assert.equal(u.state, 'difficulty_choice');
    assert.match(out.text, /Semplice curato/);
  } finally {
    restoreFetch();
  }
});

test('scorciatoia one-shot: funziona anche a metà flusso, quando le persone sono già note e arrivano tempo+ingrediente insieme', async () => {
  installFetchMock();
  try {
    const u = newUser('oneshot2', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🛒 Sto facendo la spesa' });
    await handle(u, { text: '4' }); // solo persone, tasto rapido
    assert.equal(u.state, 'collecting_time');
    queueResponse(threeIdeas());
    const out = await handle(u, { text: '45 minuti, vongole' }); // tempo + ingrediente insieme
    assert.equal(u.context.people, '4'); // conservato dal passaggio precedente
    assert.equal(u.context.time, '45');
    assert.equal(u.state, 'difficulty_choice');
    assert.match(out.text, /Semplice curato/);
  } finally {
    restoreFetch();
  }
});

// --- dati mancanti -------------------------------------------------------------------

test('dati mancanti: non inventa persone/tempo/ingrediente, e in ciascun passaggio chiede solo ciò che manca', async () => {
  const u = newUser('missing1', 'Tester');
  await handle(u, { text: 'ciao' });
  await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
  assert.equal(u.state, 'collecting_people');

  // un messaggio senza un numero di persone riconoscibile non deve far avanzare né inventare nulla
  let out = await handle(u, { text: 'boh' });
  assert.equal(u.state, 'collecting_people');
  assert.equal(u.context.people, null);

  out = await handle(u, { text: '3' });
  assert.equal(u.context.people, '3');
  assert.equal(u.state, 'collecting_time');

  out = await handle(u, { text: 'boh' }); // niente tempo riconoscibile
  assert.equal(u.state, 'collecting_time');
  assert.equal(u.context.time, null);

  out = await handle(u, { text: '45 min' });
  assert.equal(u.context.time, '45');
  assert.equal(u.state, 'collecting_context');

  out = await handle(u, { text: 'voglio fare' }); // nessun ingrediente reale (solo parole filler)
  assert.equal(u.state, 'collecting_context'); // non deve avanzare
  assert.equal(u.context.people, '3'); // conservato, non reinventato
  assert.equal(u.context.time, '45');
  assert.match(out.text, /Mi manca/);
  const missingEvent = u.events.at(-1);
  assert.equal(missingEvent.type, 'context_missing');
  assert.ok(missingEvent.payload.missing.includes('ingrediente o piatto desiderato'));
  assert.equal(missingEvent.payload.missing.includes('per quante persone'), false);
  assert.equal(missingEvent.payload.missing.includes('quanto tempo hai'), false);
});

// D-049: regressione del bug osservato su Telegram — una foto senza didascalia (testo
// '[contenuto multimediale]', segnaposto usato da server.mjs) non deve mai essere trattata come
// una richiesta valida di ingrediente/piatto: prima della correzione superava hasFoodRequest e
// arrivava al laboratorio, che produceva tre "direzioni" fatte in realtà di testo di richiesta
// di chiarimento nel campo principle (mostrato all'utente come "Tecnica: ...").
test('foto senza didascalia: non salta alle tre direzioni, chiede di descrivere a parole', async () => {
  const u = newUser('photo1', 'Tester');
  await handle(u, { text: 'ciao' });
  await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
  await handle(u, { text: '2' });
  await handle(u, { text: '30 min' });
  assert.equal(u.state, 'collecting_context');
  const out = await handle(u, { text: '[contenuto multimediale]', photo: true });
  assert.equal(u.state, 'collecting_context'); // non deve avanzare alle tre direzioni
  assert.match(out.text, /non riesco ancora ad analizzare foto/i);
  assert.match(out.text, /scrivimi a parole/i);
});

// --- D-049: focus pedagogico personalizzato -------------------------------------------

test('proposeDifficultyMenu: senza tecniche osservate, la nota per il laboratorio dice che è una prima esposizione', async () => {
  installFetchMock();
  try {
    const u = newUser('focus1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    const out = await handle(u, { text: '2 persone, 45 minuti, ho della zucca' });
    assert.equal(u.state, 'difficulty_choice');
    // D-052: il focus tecnico appare subito dopo il nome, senza l'etichetta "Focus:", seguito
    // dalla lista ingredienti.
    assert.match(out.text, /Con questa ricetta affrontiamo/i);
    assert.match(out.text, /Ingredienti: zucca/);
  } finally {
    restoreFetch();
  }
});

test('proposeDifficultyMenu: con una tecnica già osservata, la nota per il laboratorio la riporta con il conteggio', async () => {
  installFetchMock();
  try {
    const u = newUser('focus2', 'Tester');
    u.techniques.mantecatura_risotto = { id: 'mantecatura_risotto', note: null, count: 2, firstAt: '2026-01-01T00:00:00Z', lastAt: '2026-02-01T00:00:00Z', simulatedOnly: false };
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    let capturedInput = null;
    globalThis.fetch = async (url, opts) => {
      const body = JSON.parse(opts.body);
      if (!capturedInput) capturedInput = body.input;
      const next = mockQueue.shift();
      return { ok: true, json: async () => next, text: async () => JSON.stringify(next) };
    };
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, ho della zucca' });
    assert.match(capturedInput, /già praticate/);
    assert.match(capturedInput, /2 volta\/e/);
  } finally {
    restoreFetch();
  }
});

// --- tre livelli + selezione del livello ---------------------------------------------

test('tre direzioni gastronomiche: propone sempre semplice/tecnico/gourmet, poi sviluppa solo quella scelta', async () => {
  installFetchMock();
  try {
    const u = newUser('levels1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });

    queueResponse(threeIdeas());
    const menu = await handle(u, { text: '2 persone, 45 minuti, ho della zucca' });
    assert.equal(u.state, 'difficulty_choice');
    assert.equal(u.context.difficultyIdeas.length, 3);
    assert.deepEqual(u.context.difficultyIdeas.map(i => i.level), ['simple', 'technical', 'gourmet']);
    assert.match(menu.text, /Semplice curato/);
    assert.match(menu.text, /Tecnico/);
    assert.match(menu.text, /Gourmet/);
    // Non deve aver ancora sviluppato una ricetta completa (nessuna proposta ancora accettata)
    assert.equal(u.session, null);

    queueResponse(validLabDish());
    const chosen = await handle(u, { text: 'gourmet' });
    assert.equal(u.state, 'proposal');
    assert.equal(u.context.difficulty, 'gourmet');
    assert.ok(u.session);
    assert.equal(u.session.stepsTotal, 4);
    assert.match(chosen.text, /Cottura in due tempi/);
  } finally {
    restoreFetch();
  }
});

// --- "Altra idea" rigenera davvero, non blocca la conversazione (D-037) --------------

test('Altra idea: chiede il motivo, poi rigenera tre nuove direzioni invece di ripetere sempre la stessa risposta', async () => {
  installFetchMock();
  try {
    const u = newUser('altraidea1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, ho della zucca' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    assert.equal(u.state, 'proposal');

    const askReason = await handle(u, { text: '🔄 Altra idea' });
    assert.equal(u.state, 'proposal_feedback');
    assert.match(askReason.text, /cosa non ti convince/i);

    // prima del fix questo secondo messaggio cadeva nel fallback generico e restava lì per
    // sempre: qualunque messaggio successivo produceva la stessa identica risposta.
    queueResponse(threeIdeas());
    const regenerated = await handle(u, { text: 'la tecnica è troppo complicata per stasera' });
    assert.equal(u.state, 'difficulty_choice');
    assert.match(regenerated.text, /Semplice curato/);
    assert.match(u.context.raw, /non mi convince: la tecnica è troppo complicata/);

    const feedbackEvent = [...u.events].reverse().find(e => e.type === 'proposal_feedback_captured');
    assert.ok(feedbackEvent, 'atteso un evento proposal_feedback_captured');

    // la conversazione non deve restare bloccata: un ulteriore messaggio normale continua il flusso
    queueResponse(validLabDish());
    const chosen = await handle(u, { text: 'semplice' });
    assert.equal(u.state, 'proposal');
    assert.ok(u.session);
  } finally {
    restoreFetch();
  }
});

test('Altra idea: si può anche ripartire da capo scegliendo una nuova intenzione (dopo conferma, D-043)', async () => {
  installFetchMock();
  try {
    const u = newUser('altraidea2', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, ho della zucca' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });

    await handle(u, { text: '🔄 Altra idea' });
    const asked = await handle(u, { text: '🛒 Sto facendo la spesa' });
    assert.equal(u.state, 'confirm_restart');
    assert.match(asked.text, /sicuro/i);

    const out = await handle(u, { text: 'sì' });
    assert.equal(u.state, 'collecting_people');
    assert.equal(u.context.intent, 'shopping');
    assert.equal(u.context.people, null);
  } finally {
    restoreFetch();
  }
});

// --- gate editoriale (rifiuto end-to-end) --------------------------------------------

test('gate editoriale: una bozza debole viene respinta e Tavola si astiene invece di mostrarla', async () => {
  installFetchMock();
  try {
    const u = newUser('gatefail1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 40 minuti, vongole' });

    const weakDish = {
      output_text: JSON.stringify({
        kind: 'proposal', question: '', options: [],
        dish: {
          id: 'lab_vongole_debole', name: 'Spaghetti alle vongole', competency: 'intermediate',
          competencyName: 'generico', principle: { term: 'Apertura', rule: 'x', prediction: 'y' },
          shopping: ['spaghetti', 'vongole'], closure: 'ok', closureButtons: [['a', 'b']],
          dplus: 'x', curiosity: 'y',
          evidence: [{ claim: 'lavaggio delle vongole', status: 'evidence', sourceTitle: 'Sicurezza alimentare', sourceUrl: 'https://sicurezza.example' }],
          steps: [{ term: 'Apertura', title: 'Apri', action: 'Apri le vongole.', observe: 'si aprono', why: 'calore', help: 'scarta i gusci chiusi' }],
        },
      }),
    };
    // due tentativi (bozza + una sola revisione): la bozza debole viene riproposta identica,
    // il gate deve respingerla in entrambi i round.
    queueResponse(weakDish);
    queueResponse(weakDish);
    const out = await handle(u, { text: 'gourmet' });
    assert.equal(u.state, 'difficulty_choice'); // dopo il fix del 26 agosto: torna a scegliere un livello (context.difficultyIdeas esiste ancora), non riparte da zero
    assert.match(out.text, /respinto/i);
    const gateEvent = [...u.events].reverse().find(e => e.type === 'editorial_gate_rejected');
    assert.ok(gateEvent, 'atteso un evento editorial_gate_rejected');
    assert.ok(gateEvent.payload.issues.length > 0);
  } finally {
    restoreFetch();
  }
});

// --- impiattamento (attraverso la sessione di cottura reale) -------------------------

test('impiattamento: l’ultimo passaggio compare sempre, anche in modalità "solo punti critici"', async () => {
  installFetchMock();
  try {
    const u = newUser('plating1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, zucca' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    await handle(u, { text: 'ci sono' }); // proposal -> mode
    await handle(u, { text: '⚡ Solo punti critici' }); // mode -> cooking, essential
    // avanza fino all'ultimo passaggio
    let out;
    for (let i = 0; i < 3; i++) {
      out = await handle(u, { text: 'fatto, avanti' });
    }
    assert.match(out.text, /Componi il piatto/);
    assert.match(out.text, /Osserva/); // il passaggio critico/finale mostra sempre il segnale osservabile
  } finally {
    restoreFetch();
  }
});

test('cooking: un dubbio libero non riconosciuto riceve una risposta reale, non il messaggio di stallo generico', async () => {
  installFetchMock();
  try {
    const u = newUser('doubtfree1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: 'Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, zucca' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    await handle(u, { text: 'ci sono' }); // proposal -> mode
    await handle(u, { text: 'Guidami' }); // mode -> cooking
    // D-055: prima di rispondere al dubbio, handle() chiede al laboratorio di distinguere
    // "vuole avanzare" da "ha un dubbio" (il testo non contiene "avanti"/"inizia").
    queueResponse({ output_text: JSON.stringify({ choice: 'dubbio' }) });
    queueResponse({ output_text: 'Il basilico vecchio ma non ammuffito va bene: sostituiscilo solo se ammuffito o troppo secco.' });
    const out = await handle(u, { text: 'questo basilico sembra troppo vecchio, meglio cambiarlo?' });
    assert.doesNotMatch(out.text, /Resto sul passaggio corrente/);
    assert.match(out.text, /basilico/);
    assert.ok(u.events.some(e => e.type === 'doubt_asked'));
    assert.ok(u.events.some(e => e.type === 'doubt_answered'));
  } finally {
    restoreFetch();
  }
});

test('cooking: una richiesta di avanzare formulata senza "avanti"/"inizia" viene comunque riconosciuta, non trattata come un dubbio (D-055)', async () => {
  installFetchMock();
  try {
    const u = newUser('cooking-advance-nlp1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, zucca' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    await handle(u, { text: 'ci sono' }); // proposal -> mode
    await handle(u, { text: 'Guidami' }); // mode -> cooking, step 0
    assert.equal(u.session.step, 0);

    queueResponse({ output_text: JSON.stringify({ choice: 'avanti' }) });
    const out = await handle(u, { text: 'fatto, ho finito, proseguiamo pure' });
    assert.equal(u.session.step, 1);
    assert.match(out.text, /Rosola in padella/);
    assert.ok(u.events.some(e => e.type === 'cooking_intent_classified' && e.payload.choice === 'avanti'));
    assert.ok(!u.events.some(e => e.type === 'doubt_asked'));
  } finally {
    restoreFetch();
  }
});

test('willCallLab in cooking: vero solo quando il messaggio non è una delle risposte lessicali immediate (D-055)', async () => {
  installFetchMock();
  try {
    const u = newUser('willcalllab-cooking1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, zucca' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    await handle(u, { text: 'ci sono' });
    await handle(u, { text: 'Guidami' }); // mode -> cooking
    assert.equal(u.state, 'cooking');

    assert.equal(willCallLab(u, 'fatto, avanti'), false);
    assert.equal(willCallLab(u, 'ho un dubbio'), false);
    assert.equal(willCallLab(u, 'risolto'), false);
    assert.equal(willCallLab(u, 'perché?'), false);
    assert.equal(willCallLab(u, 'continua pure, andiamo'), true); // stesso intento di "avanti", parole diverse
    assert.equal(willCallLab(u, 'questo basilico sembra vecchio'), true);
  } finally {
    restoreFetch();
  }
});

// --- simulazione vs esperienza reale --------------------------------------------------

test('simulazione: passaggi completati in pochi secondi vengono registrati come simulazione, non come competenza acquisita', async () => {
  installFetchMock();
  try {
    const u = newUser('sim1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, zucca' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    await handle(u, { text: 'ci sono' });
    await handle(u, { text: '👣 Guidami' });
    for (let i = 0; i < 4; i++) await handle(u, { text: 'fatto, avanti' }); // tutto in millisecondi
    await handle(u, { text: 'come previsto' }); // closure
    queueResponse({ output_text: 'Osservazione plausibile ma da verificare ancora una volta.' }); // assessReflection
    await handle(u, { text: 'rifarei tutto uguale' }); // reflection

    assert.equal(u.session.isSimulation, true);
    const comp = Object.values(u.competencies)[0];
    assert.equal(comp.status, 'non_osservato'); // non promossa a "introdotto"
    assert.ok(comp.evidence.some(e => e.type === 'interface_simulation'));
  } finally {
    restoreFetch();
  }
});

test('esperienza reale: con tempi plausibili tra i passaggi la competenza viene registrata come "introdotto"', async () => {
  installFetchMock();
  try {
    const u = newUser('real1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, zucca' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    await handle(u, { text: 'ci sono' });
    await handle(u, { text: '👣 Guidami' });
    for (let i = 0; i < 4; i++) {
      // Simula un ritmo di cucina reale retrodatando l'orario dell'ultimo passaggio.
      if (u.session.lastStepAt) u.session.lastStepAt -= 5 * 60 * 1000;
      await handle(u, { text: 'fatto, avanti' });
    }
    await handle(u, { text: 'come previsto' });
    queueResponse({ output_text: 'Osservazione plausibile, verificabile la prossima volta con un confronto diretto.' });
    await handle(u, { text: 'rifarei tutto uguale' });

    assert.equal(u.session.isSimulation, false);
    const comp = Object.values(u.competencies)[0];
    assert.equal(comp.status, 'introdotto');
    assert.ok(comp.evidence.some(e => e.type === 'exposure_and_report'));
    const assessed = [...u.events].reverse().find(e => e.type === 'reflection_assessed');
    assert.ok(assessed, 'la riflessione deve ricevere una valutazione tecnica, non solo essere archiviata');
  } finally {
    restoreFetch();
  }
});

// --- D+1 differito ---------------------------------------------------------------------

test('D+1 differito: non viene consegnato prima del mattino successivo', () => {
  const u = newUser('dplus1', 'Tester');
  u.pendingDplus = { dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), dishId: 'x', text: 'curiosità', curiosity: 'y', sessionId: 's1' };
  const out = dplus(u);
  assert.match(out.text, /domattina/);
  assert.equal(u.pendingDplus !== null, true); // non consumato
});

test('D+1 differito: viene consegnato quando la scadenza è passata, e apre un follow-up leggero', () => {
  const u = newUser('dplus2', 'Tester');
  u.pendingDplus = { dueAt: new Date(Date.now() - 60 * 1000).toISOString(), dishId: 'x', text: 'Curiosità di prova.', curiosity: 'y', sessionId: 's1' };
  const out = dplus(u);
  assert.match(out.text, /Curiosità di prova/);
  assert.equal(u.pendingDplus, null);
  assert.equal(u.state, 'dplus');
  assert.ok(out.keyboard); // le opzioni di follow-up (curiosità extra / percorso) ora sono davvero mostrate
});

// --- fascia oraria del D+1 scelta dall'utente -------------------------------------------

test('un nuovo utente ha come default 08:30 per il D+1, ma può cambiarlo con un orario libero', async () => {
  const u = newUser('dplustime1', 'Tester');
  assert.equal(u.preferences.dplusTime, '08:30');
  u.state = 'dplus';
  const asked = await handle(u, { text: '⏰ Cambia orario D+1' });
  assert.equal(u.state, 'awaiting_dplus_time');
  assert.match(asked.text, /orario/i);
  const changed = await handle(u, { text: 'alle 9' });
  assert.equal(u.preferences.dplusTime, '09:00');
  assert.equal(u.state, 'dplus');
  assert.match(changed.text, /09:00/);
});

test('un orario non riconosciuto durante il cambio non modifica la preferenza e chiede di nuovo', async () => {
  const u = newUser('dplustime2', 'Tester');
  u.state = 'awaiting_dplus_time';
  const out = await handle(u, { text: 'boh, non saprei' });
  assert.equal(u.state, 'awaiting_dplus_time');
  assert.equal(u.preferences.dplusTime, '08:30');
  assert.match(out.text, /orario/i);
});

test('la fascia scelta viene usata per calcolare la prossima scadenza del D+1', async () => {
  installFetchMock();
  try {
    const u = newUser('dplustime3', 'Tester');
    u.preferences.dplusTime = '07:15';
    u.state = 'reflection';
    u.session = { id: 's1', dishId: 'alici', generatedDish: null, principle: 'p', step: 4, mode: 'guided', answers: {}, isSimulation: false };
    queueResponse({ output_text: 'Osservazione plausibile ma da verificare ancora una volta.' }); // assessReflection
    await handle(u, { text: 'rifarei tutto uguale' });
    const due = new Date(u.pendingDplus.dueAt);
    assert.equal(due.getHours(), 7);
    assert.equal(due.getMinutes(), 15);
  } finally {
    restoreFetch();
  }
});

test('isDplusDue riflette correttamente se la scadenza è passata', () => {
  const u = newUser('dplustime4', 'Tester');
  u.pendingDplus = { dueAt: new Date(Date.now() + 1000).toISOString(), dishId: 'x', text: 't', curiosity: 'c', sessionId: 's1' };
  assert.equal(isDplusDue(u), false);
  u.pendingDplus.dueAt = new Date(Date.now() - 1000).toISOString();
  assert.equal(isDplusDue(u), true);
});

test('la consegna proattiva (scheduler) registra delivery:"proactive" nell\'evento, quella reattiva "reactive"', () => {
  const u1 = newUser('dplustime5', 'Tester');
  u1.pendingDplus = { dueAt: new Date(Date.now() - 1000).toISOString(), dishId: 'x', text: 't', curiosity: 'c', sessionId: 's1' };
  dplus(u1, { proactive: true });
  const ev1 = [...u1.events].reverse().find(e => e.type === 'dplus_delivered');
  assert.equal(ev1.payload.delivery, 'proactive');

  const u2 = newUser('dplustime6', 'Tester');
  u2.pendingDplus = { dueAt: new Date(Date.now() - 1000).toISOString(), dishId: 'x', text: 't', curiosity: 'c', sessionId: 's1' };
  dplus(u2);
  const ev2 = [...u2.events].reverse().find(e => e.type === 'dplus_delivered');
  assert.equal(ev2.payload.delivery, 'reactive');
});

// --- il capitolo non resta mai bloccato dopo il D+1 (bug critico corretto) ------------

test('dopo il D+1 la chat non resta bloccata: qualunque messaggio successivo riapre un nuovo capitolo', async () => {
  const u = newUser('unstick1', 'Tester');
  u.state = 'dplus';
  u.session = { id: 's1', dishId: 'x', generatedDish: null, principle: 'p', step: 4, mode: 'guided', answers: {}, isSimulation: false };
  const out = await handle(u, { text: 'vorrei cucinare qualcosa con il pollo stasera' });
  assert.equal(u.state, 'locating');
  assert.match(out.text, /Da dove partiamo\?/);
});

test('dopo il D+1, cliccare direttamente un\'intenzione salta subito alla raccolta del contesto', async () => {
  const u = newUser('unstick2', 'Tester');
  u.state = 'waiting_dplus';
  u.pendingDplus = { dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), dishId: 'x', text: 't', curiosity: 'c', sessionId: 's1' };
  const out = await handle(u, { text: '🛒 Sto facendo la spesa' });
  assert.equal(u.state, 'collecting_people');
  assert.equal(u.context.intent, 'shopping');
  assert.match(out.text, /persone/i);
});

// --- conservazione della memoria (a livello di oggetto utente) -------------------------

test('publicUser conserva competenze, eventi e sessione senza perdita di informazione', async () => {
  const u = newUser('mem1', 'Tester');
  await handle(u, { text: 'ciao' });
  const snap = publicUser(u);
  assert.equal(snap.id, 'mem1');
  assert.equal(snap.state, 'locating');
  assert.ok(Array.isArray(snap.events) && snap.events.length > 0);
});

// --- il percorso si puo' cambiare anche dalla proposta o dalla scelta di modalita' -----
// (bug segnalato dal progettista durante un test reale su Telegram: bloccato sulla
// proposta di seppia senza modo di ripartire, se non passando per "Altra idea")

test('proposal: un cambio di intenzione diretto chiede conferma, poi riavvia il capitolo (D-043)', async () => {
  installFetchMock();
  try {
    const u = newUser('changepath1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    assert.equal(u.state, 'proposal');

    const asked = await handle(u, { text: '💡 Cerco un’idea' });
    assert.equal(u.state, 'confirm_restart');
    assert.match(asked.text, /sicuro/i);

    const out = await handle(u, { text: 'sì' });
    assert.equal(u.state, 'collecting_people');
    assert.equal(u.context.intent, 'idea');
    assert.match(out.text, /persone/i);
  } finally {
    restoreFetch();
  }
});

test('mode: un cambio di intenzione diretto chiede conferma, poi riavvia il capitolo (D-043)', async () => {
  installFetchMock();
  try {
    const u = newUser('changepath2', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    await handle(u, { text: 'ci sono' }); // proposal -> mode
    assert.equal(u.state, 'mode');

    const asked = await handle(u, { text: '🛒 Sto facendo la spesa' });
    assert.equal(u.state, 'confirm_restart');
    assert.match(asked.text, /sicuro/i);

    const out = await handle(u, { text: 'sì' });
    assert.equal(u.state, 'collecting_people');
    assert.equal(u.context.intent, 'shopping');
    assert.match(out.text, /persone/i);
  } finally {
    restoreFetch();
  }
});

test('difficulty_choice: una frase generica di riavvio ("nuova richiesta") chiede conferma, poi riparte (D-043)', async () => {
  installFetchMock();
  try {
    const u = newUser('changepath3', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    assert.equal(u.state, 'difficulty_choice');

    const asked = await handle(u, { text: 'voglio fare una nuova richiesta' });
    assert.equal(u.state, 'confirm_restart');

    const out = await handle(u, { text: 'sì' });
    assert.equal(u.state, 'collecting_people');
    assert.match(out.text, /persone/i);
  } finally {
    restoreFetch();
  }
});

test('cooking: una frase generica di riavvio ("ricominciamo da capo") chiede conferma, poi riavvia invece di restare ancorata al piatto corrente (D-043)', async () => {
  installFetchMock();
  try {
    const u = newUser('changepath4', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    await handle(u, { text: 'ci sono' });
    await handle(u, { text: '👣 Guidami' });
    assert.equal(u.state, 'cooking');

    const asked = await handle(u, { text: 'voglio ricominciare da capo' });
    assert.equal(u.state, 'confirm_restart');

    const out = await handle(u, { text: 'sì' });
    assert.equal(u.state, 'collecting_people');
    assert.match(out.text, /persone/i);
  } finally {
    restoreFetch();
  }
});

test('lab_clarification: un cambio di intenzione diretto chiede conferma, poi riavvia invece di restare in attesa del chiarimento (D-043)', async () => {
  installFetchMock();
  try {
    const u = newUser('changepath5', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    queueResponse({ output_text: JSON.stringify({ kind: 'clarification', question: 'Le seppie sono intere o già pulite?', options: ['Intere', 'Già pulite'], dish: null }) });
    await handle(u, { text: 'gourmet' });
    assert.equal(u.state, 'lab_clarification');

    const asked = await handle(u, { text: 'no aspetta, voglio ricominciare' });
    assert.equal(u.state, 'confirm_restart');

    const out = await handle(u, { text: 'sì' });
    assert.equal(u.state, 'collecting_people');
    assert.match(out.text, /persone/i);
  } finally {
    restoreFetch();
  }
});

// --- rete di sicurezza sul riavvio: conferma prima di ricominciare davvero (D-043) ----
// Richiesto dal progettista: una frase che sembra voler ricominciare non deve mai
// far perdere il piatto in corso senza una conferma esplicita.

test('confirm_restart: rispondendo "no" si torna esattamente allo stato precedente, senza perdere nulla', async () => {
  installFetchMock();
  try {
    const u = newUser('confirmno1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    await handle(u, { text: 'ci sono' });
    await handle(u, { text: '👣 Guidami' });
    assert.equal(u.state, 'cooking');
    const dishIdBefore = u.session.dishId;
    const stepBefore = u.session.step;

    const asked = await handle(u, { text: 'voglio ricominciare da capo' });
    assert.equal(u.state, 'confirm_restart');
    assert.match(asked.text, /sicuro/i);

    const out = await handle(u, { text: 'no, continua' });
    assert.equal(u.state, 'cooking');
    assert.equal(u.session.dishId, dishIdBefore);
    assert.equal(u.session.step, stepBefore);
    assert.equal(u.context.pendingRestart, null);
    assert.match(out.text, /continuiamo/i);
  } finally {
    restoreFetch();
  }
});

test('confirm_restart: una risposta ambigua non decide nulla e richiede di nuovo la conferma', async () => {
  installFetchMock();
  try {
    const u = newUser('confirmambig1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    assert.equal(u.state, 'proposal');

    await handle(u, { text: 'ricominciamo' });
    assert.equal(u.state, 'confirm_restart');

    const out = await handle(u, { text: 'boh non so' });
    assert.equal(u.state, 'confirm_restart');
    assert.match(out.text, /confermi/i);
  } finally {
    restoreFetch();
  }
});

// --- D-050: richiesta di altre proposte in difficulty_choice --------------------------

test('difficulty_choice: "dammi altre proposte" rigenera tre direzioni diverse invece di ripetere le stesse (D-050)', async () => {
  installFetchMock();
  try {
    const u = newUser('otherideas1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    const first = await handle(u, { text: '2 persone, 45 minuti, ho della zucca' });
    assert.equal(u.state, 'difficulty_choice');
    assert.match(first.text, /Zucca arrosto al rosmarino/);

    queueResponse(threeOtherIdeas());
    const second = await handle(u, { text: 'dammi altre proposte' });
    assert.equal(u.state, 'difficulty_choice');
    assert.match(second.text, /Zucca al vapore con burro nocciola/);
    assert.doesNotMatch(second.text, /Zucca arrosto al rosmarino/);
    assert.deepEqual(u.context.difficultyIdeas.map(x => x.name), [
      'Zucca al vapore con burro nocciola',
      'Gnocchi di zucca al forno',
      'Zucca fermentata e arrosto',
    ]);
  } finally {
    restoreFetch();
  }
});

test('difficulty_choice: "non mi convincono" viene riconosciuto come richiesta di altre proposte quanto "dammi altre proposte" (D-050)', async () => {
  installFetchMock();
  try {
    const u = newUser('otherideas2', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, ho della zucca' });
    queueResponse(threeOtherIdeas());
    const out = await handle(u, { text: 'non mi convincono, ne vuoi altre?' });
    assert.equal(u.state, 'difficulty_choice');
    assert.match(out.text, /Zucca al vapore con burro nocciola/);
  } finally {
    restoreFetch();
  }
});

test('difficulty_choice: un testo non riconosciuto lessicalmente passa a classifyIntent (D-051); se anche quello non trova nulla, rimanda ai tre pulsanti (D-050)', async () => {
  installFetchMock();
  try {
    const u = newUser('otherideas3', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, ho della zucca' });
    // D-051: ora un testo non riconosciuto lessicalmente passa comunque dal laboratorio prima di
    // arrendersi — mock di una classificazione "nessuna" (il modello non ha trovato una corrispondenza).
    queueResponse({ output_text: JSON.stringify({ choice: 'nessuna' }) });
    const out = await handle(u, { text: 'boh non saprei' });
    assert.equal(u.state, 'difficulty_choice');
    assert.match(out.text, /altre proposte/i);
    assert.deepEqual(u.context.difficultyIdeas.map(x => x.name), [
      'Zucca arrosto al rosmarino',
      'Vellutata di zucca con crumble salato',
      'Zucca in due cotture con salvia fritta',
    ]);
  } finally {
    restoreFetch();
  }
});

test('difficulty_choice: classifyIntent riconosce una formulazione libera che nessuna regola lessicale prevedeva (D-051)', async () => {
  installFetchMock();
  try {
    const u = newUser('otherideas4', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, ho della zucca' });
    // Nessuna parola lessicale prevista ("semplice"/"tecnico"/"gourmet"/"altre proposte"...), ma
    // il significato è chiaro: vuole la prima direzione. Mock della classificazione AI.
    queueResponse({ output_text: JSON.stringify({ choice: 'simple' }) });
    queueResponse(validLabDish());
    const out = await handle(u, { text: 'la prima mi ispira di più, andiamo con quella' });
    assert.equal(u.context.difficulty, 'simple');
    assert.equal(u.state, 'proposal');
    assert.match(out.text, /Zucca in due cotture con salvia fritta/);
  } finally {
    restoreFetch();
  }
});

// --- D-050: willCallLab, usata da server.mjs per decidere se mostrare "sto pensando" --

test('willCallLab in difficulty_choice: vero per qualunque messaggio tranne un intent di riavvio (D-050/D-051)', async () => {
  installFetchMock();
  try {
    const u = newUser('willcalllab1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, ho della zucca' });
    assert.equal(u.state, 'difficulty_choice');

    assert.equal(willCallLab(u, 'tecnico'), true);
    assert.equal(willCallLab(u, 'dammi altre proposte'), true);
    // D-051: un testo non riconosciuto lessicalmente ora passa comunque da classifyIntent, quindi
    // chiama davvero il laboratorio (prima di D-051 non lo faceva: cfr. EVIDENCE.md).
    assert.equal(willCallLab(u, 'boh non saprei'), true);
    assert.equal(willCallLab(u, 'ricominciamo da capo'), false); // isIntentChoice: va a confirm_restart, non al laboratorio
  } finally {
    restoreFetch();
  }
});

test('willCallLab in proposal/mode/dplus: vero solo quando il messaggio non è riconosciuto lessicalmente (D-051)', async () => {
  installFetchMock();
  try {
    const u = newUser('willcalllab3', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    assert.equal(u.state, 'proposal');

    assert.equal(willCallLab(u, 'mi piace'), false); // lessicale, risposta istantanea
    assert.equal(willCallLab(u, 'perfetto ci sto, andiamo'), true); // stesso intento, parole diverse

    u.state = 'mode';
    assert.equal(willCallLab(u, 'guidami'), false);
    assert.equal(willCallLab(u, 'fammi vedere tutto subito'), true);

    // D-053: una volta scelto mode==='full' (ricetta letta per intero), solo il segnale esplicito
    // di inizio ("inizia") evita la chiamata al laboratorio — qualunque altro testo, prima
    // scartato a prescindere qui, ora corrisponde davvero a una chiamata reale in handle().
    u.session.mode = 'full';
    assert.equal(willCallLab(u, 'Inizia la guida'), false);
    assert.equal(willCallLab(u, 'secondo me al passaggio 2 manca un pezzo'), true);

    u.state = 'dplus';
    assert.equal(willCallLab(u, 'una curiosità'), false);
    assert.equal(willCallLab(u, 'fammi vedere come sto andando'), true);
  } finally {
    restoreFetch();
  }
});

test('willCallLab: sempre falso in uno stato senza alcun fallback di classificazione (D-050)', () => {
  const u = newUser('willcalllab2', 'Tester');
  assert.equal(willCallLab(u, 'tecnico'), false);
});

// --- D-051: interpretazione del linguaggio naturale in proposal/mode/dplus ------------

test('proposal: classifyIntent riconosce "procediamo pure" come accettazione, senza le parole lessicali previste (D-051)', async () => {
  installFetchMock();
  try {
    const u = newUser('nlp-proposal1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    assert.equal(u.state, 'proposal');

    queueResponse({ output_text: JSON.stringify({ choice: 'piace' }) });
    const out = await handle(u, { text: 'mi convince parecchio, procediamo pure' });
    assert.equal(u.state, 'mode');
    assert.match(out.text, /Come vuoi cucinare/i);
  } finally {
    restoreFetch();
  }
});

test('proposal: se classifyIntent non trova nulla, avvisa esplicitamente invece di scivolare nel messaggio generico finale (D-051)', async () => {
  installFetchMock();
  try {
    const u = newUser('nlp-proposal2', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });

    queueResponse({ output_text: JSON.stringify({ choice: 'nessuna' }) });
    const out = await handle(u, { text: 'asdfasdf' });
    assert.equal(u.state, 'proposal'); // resta nella proposta, non nel fallback generico di tutta la chat
    assert.doesNotMatch(out.text, /Dimmi dove sei/i);
  } finally {
    restoreFetch();
  }
});

test('mode: classifyIntent riconosce "fammi vedere tutto subito" come modalità "leggi tutto" (D-051)', async () => {
  installFetchMock();
  try {
    const u = newUser('nlp-mode1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    await handle(u, { text: 'mi piace' }); // -> stato 'mode'
    assert.equal(u.state, 'mode');

    queueResponse({ output_text: JSON.stringify({ choice: 'full' }) });
    const out = await handle(u, { text: 'fammi vedere tutto subito' });
    assert.equal(u.session.mode, 'full');
    assert.equal(u.state, 'mode'); // resta qui finché non conferma di iniziare
    assert.match(out.text, /Ammorbidisci la zucca/); // elenco passaggi già mostrato
  } finally {
    restoreFetch();
  }
});

test('mode (full): un testo diverso da "inizia" dopo aver letto tutta la ricetta chiama davvero il laboratorio, non fa ripartire la guida (D-053)', async () => {
  installFetchMock();
  try {
    const u = newUser('nlp-mode-full1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    await handle(u, { text: 'mi piace' }); // -> stato 'mode'
    await handle(u, { text: 'fammi leggere tutto' }); // -> mode 'full', resta in stato 'mode'
    assert.equal(u.session.mode, 'full');

    // Prima di D-053 questo messaggio veniva ignorato e faceva ripartire la guida dal primo
    // passaggio (user.state='cooking', session.step=0) senza mai consultare il laboratorio.
    // D-054: il testo non contiene "inizia", quindi handle() chiede prima al laboratorio
    // (classifyIntent) di distinguere "vuole iniziare" da "sta facendo una domanda" — qui la
    // seconda coda simula quella classificazione, la terza la risposta strutturata vera e propria
    // (reply/hasCorrection/correction, non più una semplice stringa).
    queueResponse({ output_text: JSON.stringify({ choice: 'domanda' }) });
    queueResponse({ output_text: JSON.stringify({ reply: 'Hai ragione: nel passaggio 2 manca l\'indicazione di scolare bene la zucca prima di frullarla, altrimenti la vellutata risulta troppo liquida.', hasCorrection: false, correction: null }) });
    const out = await handle(u, { text: 'secondo me al passaggio 2 manca un pezzo, avete dimenticato di dire di scolare la zucca' });
    assert.equal(u.state, 'mode'); // non è ripartito dalla ricetta: resta in attesa del segnale di inizio
    assert.equal(u.session.step, 0); // la guida non è avanzata
    assert.match(out.text, /scolare/); // risposta reale del laboratorio, non un testo preconfezionato
    assert.ok(u.events.some(e => e.type === 'recipe_question_asked'));
    assert.ok(u.events.some(e => e.type === 'recipe_question_answered'));

    // Il segnale esplicito di inizio funziona ancora normalmente (regola lessicale rapida, nessuna
    // chiamata al laboratorio necessaria per riconoscerlo).
    const started = await handle(u, { text: 'Inizia la guida' });
    assert.equal(u.state, 'cooking');
    assert.match(started.text, /Ammorbidisci la zucca/);
  } finally {
    restoreFetch();
  }
});

test('mode (full): una correzione reale segnalata dal laboratorio viene applicata al passaggio, non solo spiegata in chat (D-054)', async () => {
  installFetchMock();
  try {
    const u = newUser('nlp-mode-full-correction1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    await handle(u, { text: 'mi piace' }); // -> stato 'mode'
    await handle(u, { text: 'fammi leggere tutto' }); // -> mode 'full'

    queueResponse({ output_text: JSON.stringify({ choice: 'domanda' }) });
    queueResponse({ output_text: JSON.stringify({
      reply: 'Hai ragione: nel primo passaggio manca l\'indicazione di scolare bene la zucca prima di continuare.',
      hasCorrection: true,
      correction: { stepNumber: 1, field: 'action', correctedText: 'Cuoci la zucca a vapore finché è tenera al centro, poi scolala bene prima di procedere.' },
    }) });
    const out = await handle(u, { text: 'secondo me al primo passaggio manca di dire di scolare la zucca' });
    assert.match(out.text, /scolare bene/);
    const correctedEvent = u.events.find(e => e.type === 'recipe_step_corrected');
    assert.ok(correctedEvent);
    assert.equal(correctedEvent.payload.stepNumber, 1);
    assert.equal(correctedEvent.payload.field, 'action');
    assert.equal(u.events.find(e => e.type === 'recipe_question_answered').payload.corrected, true);

    // Riprendendo la guida, il passaggio mostrato riflette davvero la correzione appena fatta,
    // non il testo originale — è questo che il progettista intendeva con "deve recepire la
    // correzione", non solo spiegarla in chat.
    const started = await handle(u, { text: 'Inizia la guida' });
    assert.equal(u.state, 'cooking');
    assert.match(started.text, /scolala bene prima di procedere/);
  } finally {
    restoreFetch();
  }
});

test('mode (full): una richiesta di riprendere la ricetta formulata senza la parola "inizia" viene comunque riconosciuta (D-054)', async () => {
  installFetchMock();
  try {
    const u = newUser('nlp-mode-full-resume1', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    await handle(u, { text: 'mi piace' }); // -> stato 'mode'
    await handle(u, { text: 'fammi leggere tutto' }); // -> mode 'full'

    // "riprendiamo la ricetta passo passo" non contiene "inizia": prima di D-054 sarebbe stato
    // trattato come una domanda e sarebbe rimasto in attesa; ora il laboratorio lo classifica
    // correttamente come richiesta di iniziare.
    queueResponse({ output_text: JSON.stringify({ choice: 'inizia' }) });
    const out = await handle(u, { text: 'va bene, riprendiamo la ricetta passo passo' });
    assert.equal(u.state, 'cooking');
    assert.match(out.text, /Ammorbidisci la zucca/);
    assert.ok(u.events.some(e => e.type === 'full_read_intent_classified' && e.payload.choice === 'inizia'));
  } finally {
    restoreFetch();
  }
});

test('mode: se classifyIntent non trova nulla, il comportamento resta quello prudente di prima (guidato per default) (D-051)', async () => {
  installFetchMock();
  try {
    const u = newUser('nlp-mode2', 'Tester');
    await handle(u, { text: 'ciao' });
    await handle(u, { text: '🍳 Ho gli ingredienti, cuciniamo' });
    queueResponse(threeIdeas());
    await handle(u, { text: '2 persone, 45 minuti, seppia' });
    queueResponse(validLabDish());
    await handle(u, { text: 'gourmet' });
    await handle(u, { text: 'mi piace' });

    queueResponse({ output_text: JSON.stringify({ choice: 'nessuna' }) });
    await handle(u, { text: 'boh fai tu' });
    assert.equal(u.session.mode, 'guided');
    assert.equal(u.state, 'cooking');
  } finally {
    restoreFetch();
  }
});

test('dplus: classifyIntent riconosce "fammi vedere come sto andando" come richiesta del percorso (D-051)', async () => {
  installFetchMock();
  try {
    const u = newUser('nlp-dplus1', 'Tester');
    u.pendingDplus = { dueAt: new Date(Date.now() - 60 * 1000).toISOString(), dishId: 'x', text: 'Curiosità di prova.', curiosity: 'y', sessionId: 's1' };
    dplus(u);
    assert.equal(u.state, 'dplus');

    queueResponse({ output_text: JSON.stringify({ choice: 'percorso' }) });
    const out = await handle(u, { text: 'fammi vedere come sto andando' });
    assert.match(out.text, /dashboard/i);
  } finally {
    restoreFetch();
  }
});
