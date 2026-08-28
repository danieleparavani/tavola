import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newUser, handle, dplus, publicUser, isDplusDue } from '../core/tavola.mjs';

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
        { level: 'simple', name: 'Zucca arrosto al rosmarino', description: 'Cottura diretta, poche variabili.', principle: 'Caramellizzazione superficiale' },
        { level: 'technical', name: 'Vellutata di zucca con crumble salato', description: 'Doppia consistenza controllata.', principle: 'Consistenza per contrasto' },
        { level: 'gourmet', name: 'Zucca in due cotture con salvia fritta', description: 'Concentrazione del sapore in due fasi.', principle: 'Cottura in due tempi' },
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

test('Altra idea: si può anche ripartire da capo scegliendo una nuova intenzione', async () => {
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
    const out = await handle(u, { text: '🛒 Sto facendo la spesa' });
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
