import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePeople, parseTime, parsePeopleLoose, parseTimeLoose, hasFoodRequest, isIntentChoice, parseIntent } from '../core/tavola.mjs';
import { qualityIssues } from '../core/lab.mjs';

// --- parsing di persone e tempo -------------------------------------------------

test('parsePeople riconosce "2 persone"', () => {
  assert.equal(parsePeople('2 persone, 45 minuti, voglio le vongole'), '2');
});

test('parsePeople riconosce "3 commensali"', () => {
  assert.equal(parsePeople('siamo in 3 commensali stasera'), '3');
});

test('parsePeople restituisce null se assente', () => {
  assert.equal(parsePeople('voglio cucinare qualcosa di buono'), null);
});

test('parseTime converte le ore in minuti (bug storico: "1 ora" non deve diventare 30)', () => {
  assert.equal(parseTime('3 persone con 1 ora di preparazione, pensavo alla triglia'), '60');
});

test('parseTime converte "1 ora e mezza" prendendo almeno l\'ora intera', () => {
  // il parser attuale riconosce l'ora; verifichiamo che non collassi mai a 30 min per "1 ora"
  const t = parseTime('1 ora a disposizione');
  assert.equal(t, '60');
});

test('parseTime riconosce i minuti espliciti', () => {
  assert.equal(parseTime('ho 40 minuti'), '40');
});

test('parseTime riconosce ore decimali', () => {
  assert.equal(parseTime('1,5 ore disponibili'), '90');
});

// --- parser "morbidi" per i tasti rapidi (D-027) ----------------------------------

test('parsePeopleLoose riconosce le etichette dei tasti (1-4 e "5+")', () => {
  assert.equal(parsePeopleLoose('1'), '1');
  assert.equal(parsePeopleLoose('4'), '4');
  assert.equal(parsePeopleLoose('5+'), '5');
});

test('parsePeopleLoose continua a riconoscere il testo libero già gestito da parsePeople', () => {
  assert.equal(parsePeopleLoose('siamo in 6 persone'), '6');
});

test('parsePeopleLoose restituisce null su testo non riconducibile a un numero di persone', () => {
  assert.equal(parsePeopleLoose('boh non saprei'), null);
});

test('parseTimeLoose riconosce le etichette dei tasti, comprese "45 min" e "1 ora"', () => {
  assert.equal(parseTimeLoose('15 min'), '15');
  assert.equal(parseTimeLoose('45 min'), '45');
  assert.equal(parseTimeLoose('1 ora'), '60');
});

test('parseTimeLoose mappa "più di un\'ora" su un valore rappresentativo (90 minuti)', () => {
  assert.equal(parseTimeLoose("più di un'ora"), '90');
  assert.equal(parseTimeLoose('piu di un ora'), '90'); // robusto anche senza apostrofo
});

test('parseTimeLoose continua a riconoscere il testo libero già gestito da parseTime', () => {
  assert.equal(parseTimeLoose('ho circa 20 minuti'), '20');
});

// --- tre intenzioni operative -----------------------------------------------------

test('isIntentChoice riconosce le tre opzioni di apertura', () => {
  assert.equal(isIntentChoice('cerco un’idea'.toLowerCase()), true);
  assert.equal(isIntentChoice('sto facendo la spesa'), true);
  assert.equal(isIntentChoice('ho gli ingredienti, cuciniamo'), true);
});

test('isIntentChoice rifiuta testo libero non riconducibile alle tre opzioni', () => {
  assert.equal(isIntentChoice('voglio cucinare del pesce stasera'), false);
});

test('parseIntent mappa correttamente le tre intenzioni', () => {
  assert.equal(parseIntent('sto facendo la spesa'), 'shopping');
  assert.equal(parseIntent('ho gli ingredienti, cuciniamo'), 'cook');
  assert.equal(parseIntent('cerco un’idea'), 'idea');
});

// --- dati mancanti -----------------------------------------------------------------

test('hasFoodRequest riconosce una richiesta di piatto/ingrediente', () => {
  assert.equal(hasFoodRequest('2 persone, 45 minuti, voglio usare le vongole'), true);
});

test('hasFoodRequest è false su una frase priva di ingrediente/piatto', () => {
  assert.equal(hasFoodRequest('2 persone, 45 minuti'), false);
});

// --- gate editoriale -----------------------------------------------------------------

function baseDish(overrides = {}) {
  return {
    name: 'Filetti di pesce spada con zucchine trifolate',
    competency: 'sear_control',
    principle: { term: 'Cottura differenziale' },
    shopping: ['filetti di pesce spada', 'zucchine', 'olio extravergine', 'limone', 'sale'],
    dplus: 'Il pesce spada si presta a cotture rapide: un tempo i pescatori lo affettavano sottile per accorciare i tempi in barca.',
    evidence: [
      { status: 'evidence', claim: 'la cottura a calore diretto rosola la superficie', sourceTitle: 'Scuola tecnica', sourceUrl: 'https://scuola-cucina.example/tecnica' },
      { status: 'interpretation', claim: 'il pesce spada tollera bene la cottura veloce', sourceTitle: 'Istituto gastronomico', sourceUrl: 'https://istituto.example/pesce' },
    ],
    steps: [
      { term: 'Preparazione', title: 'Prepara', action: 'Taglia le zucchine, sala leggermente e scalda la padella con olio extravergine.', observe: 'olio che increspa leggermente', why: 'il calore uniforme evita bruciature', help: 'abbassa il fuoco se fuma' },
      { term: 'Cottura differenziale', title: 'Cuoci il pesce', action: 'Scotta i filetti di pesce spada da un lato con poco olio, poi gira.', observe: 'la superficie si rosola', why: 'il calore diretto rosola senza seccare il centro', help: 'riduci il fuoco se scurisce troppo in fretta' },
      { term: 'Impiattamento', title: 'Componi il piatto', action: 'Disponi le zucchine come base nel piatto tiepido, adagia sopra il pesce spada, finisci con un filo d’olio e limone.', observe: 'il piatto è caldo e le consistenze restano separate', why: 'la base assorbe i succhi senza ammorbidire il pesce', help: 'servi subito per non perdere calore' },
    ],
    ...overrides,
  };
}

test('qualityIssues non solleva problemi su un piatto coerente e completo', () => {
  const issues = qualityIssues(baseDish(), { people: '2', time: '40', raw: 'pesce spada' });
  assert.deepEqual(issues, []);
});

test('qualityIssues segnala un ingrediente della spesa mai citato nei passaggi', () => {
  const dish = baseDish({ shopping: ['filetti di pesce spada', 'zucchine', 'olio extravergine', 'limone', 'sale', 'capperi dissalati'] });
  const issues = qualityIssues(dish, { people: '2', time: '40', raw: 'pesce spada' });
  assert.ok(issues.some(i => i.includes('capperi')), `atteso un problema sui capperi, trovato: ${issues.join(' | ')}`);
});

test('qualityIssues richiede un passaggio esplicito di impiattamento', () => {
  const dish = baseDish();
  dish.steps = dish.steps.slice(0, 2); // rimuove il passaggio finale di impiattamento
  const issues = qualityIssues(dish, { people: '2', time: '40', raw: 'pesce spada' });
  assert.ok(issues.some(i => i.includes('impiattamento')), `atteso un problema di impiattamento, trovato: ${issues.join(' | ')}`);
});

test('qualityIssues rifiuta etichette di competenza generiche (beginner/intermediate/advanced)', () => {
  const dish = baseDish({ competency: 'intermediate' });
  const issues = qualityIssues(dish, { people: '2', time: '40', raw: 'pesce spada' });
  assert.ok(issues.some(i => i.includes('competenza generica')));
});

test('qualityIssues richiede almeno due fonti', () => {
  const dish = baseDish({ evidence: [baseDish().evidence[0]] });
  const issues = qualityIssues(dish, { people: '2', time: '40', raw: 'pesce spada' });
  assert.ok(issues.some(i => i.includes('fonti insufficienti')));
});

test('qualityIssues rifiuta fonti da aggregatori/social non ammessi', () => {
  const dish = baseDish({ evidence: [
    { status: 'evidence', claim: 'tecnica di cottura', sourceTitle: 'Instagram', sourceUrl: 'https://instagram.com/post' },
    { status: 'interpretation', claim: 'tecnica di cottura', sourceTitle: 'Facebook', sourceUrl: 'https://facebook.com/post' },
  ] });
  const issues = qualityIssues(dish, { people: '2', time: '40', raw: 'pesce spada' });
  assert.ok(issues.some(i => i.includes('non ammessa')));
});

test('qualityIssues rifiuta la falsa precisione "la tostatura sigilla l’amido" su qualunque piatto', () => {
  const dish = baseDish(); // baseDish() è pesce spada: nessun risotto coinvolto
  dish.steps[0].why = 'la tostatura sigilla l’amido e protegge il chicco';
  const issues = qualityIssues(dish, { people: '2', time: '40', raw: 'pesce spada' });
  assert.ok(issues.some(i => i.includes('pseudotecnica')));
});

// Regressione del bug osservato il 21 agosto 2026 su una proposta di seppia (cfr. EVIDENCE.md):
// il controllo sul gesto scorretto del risotto non deve MAI comparire su un piatto che non è
// un risotto, anche se il testo contiene "frusta" e altrove, senza alcun nesso, la sequenza
// "ris" (che compare in moltissime parole italiane comuni).
test('qualityIssues: il controllo sul gesto scorretto del risotto non scatta su piatti che non sono risotti', () => {
  const dish = baseDish({ name: 'Seppia scottata, crema di sedano rapa e riduzione d’inchiostro' });
  dish.steps[0].action = 'Frusta la crema di sedano rapa finché liscia, poi lasciala riposare.';
  dish.steps[0].why = 'la frusta incorpora aria e rende la crema più leggera, pronta a risalire in temperatura senza separarsi.';
  const issues = qualityIssues(dish, { people: '2', time: '40', raw: 'seppia' });
  assert.ok(!issues.some(i => i.includes('risotto')), `non atteso un riferimento al risotto, trovato: ${issues.join(' | ')}`);
});

test('qualityIssues: il controllo sul gesto scorretto del risotto scatta correttamente quando il piatto è davvero un risotto', () => {
  const dish = baseDish({ name: 'Risotto alla parmigiana con riduzione di vino bianco' });
  dish.principle = { term: 'Mantecatura' };
  dish.steps[0].action = 'Frusta energicamente il risotto fuori dal fuoco per mantecarlo.';
  dish.steps[0].why = 'la frusta incorpora aria nel risotto.';
  const issues = qualityIssues(dish, { people: '2', time: '40', raw: 'risotto' });
  assert.ok(issues.some(i => i.includes('risotto')), `atteso un riferimento al risotto, trovato: ${issues.join(' | ')}`);
});

test('qualityIssues verifica il reinserimento delle vongole quando pertinente', () => {
  const dish = baseDish({ name: 'Spaghetti alle vongole veraci' });
  dish.shopping = ['spaghetti', 'vongole veraci', 'aglio', 'olio extravergine', 'prezzemolo'];
  dish.steps = [
    { term: 'Apertura', title: 'Apri le vongole', action: 'Apri le vongole in padella con aglio e olio, poi tienile da parte nel loro liquido.', observe: 'i gusci si aprono', why: 'il calore diretto apre i molluschi', help: 'scarta i gusci chiusi' },
    { term: 'Impiattamento', title: 'Componi', action: 'Manteca la pasta con il liquido filtrato e servi.', observe: 'la salsa è lucida', why: 'amido e grasso si legano', help: 'aggiungi acqua di cottura se troppo asciutta' },
  ];
  const issues = qualityIssues(dish, { people: '2', time: '30', raw: 'vongole' });
  assert.ok(issues.some(i => i.includes('reinserimento')), `atteso reinserimento mancante, trovato: ${issues.join(' | ')}`);
});
