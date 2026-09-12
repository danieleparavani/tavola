import { test } from 'node:test';
import assert from 'node:assert/strict';

// Nessuna chiave: i test non devono mai chiamare la rete. Con la chiave assente il modulo deve
// comportarsi come prima di D-065, cioè restituire la scheda deterministica a regole.
delete process.env.OPENAI_API_KEY;

const { platingPrompt, platingPhoto, composeSheet, imageAvailable } = await import('../core/platingImage.mjs');
const { renderPlating } = await import('../core/platingRender.mjs');
const { decodePNG, createCanvas, encodePNG } = await import('../core/png.mjs');

const plating = {
  clockLayout: [
    { element: 'filetti di triglia, pelle in vista', position: 'centro', shape: 'ventaglio' },
    { element: 'pomodoro crudo condito', position: '2', shape: 'mucchio' },
    { element: 'pane aromatico tostato', position: '6', shape: 'linea' },
  ],
  sauceStyle: 'velo',
  temperature: 'piatto caldo',
  textureNote: 'il pane deve restare croccante',
  finish: 'filo d’olio a crudo',
};

// D-066: il modello non scrive più nessuna parola. Aveva disegnato quattro richiami per tre
// etichette, lasciando una linea che finisce nel nulla: finché decide lui quante parole e quante
// frecce mettere, ogni tanto ne perde una. Il prompt deve vietare ogni testo e ogni freccia.
test('il prompt vieta ogni testo, etichetta e freccia dentro l\'immagine', () => {
  const prompt = platingPrompt(plating);
  assert.match(prompt, /NO TEXT AT ALL/);
  assert.match(prompt, /no arrows and no leader lines/);
  assert.doesNotMatch(prompt, /pointing to its element/);
  assert.doesNotMatch(prompt, /handwritten Italian pencil annotations/);
});

test('il prompt descrive ogni elemento con la sua posizione e la sua forma', () => {
  const prompt = platingPrompt(plating);
  assert.match(prompt, /filetti di triglia, pelle in vista/);
  assert.match(prompt, /fanned out/);
  assert.match(prompt, /in the centre of the plate/);
  assert.match(prompt, /two o'clock/);
  assert.match(prompt, /in a line across the plate/);
  assert.match(prompt, /veil of sauce/);
  assert.match(prompt, /il pane deve restare croccante/);
});

// D-014: nessun catalogo chiuso. Uno schema minimo o con campi mancanti non deve rompere nulla.
test('il prompt regge uno schema minimo senza campi facoltativi', () => {
  const prompt = platingPrompt({ clockLayout: [{ element: 'x', position: 'centro', shape: 'mucchio' }] });
  assert.ok(prompt.length > 100);
  assert.doesNotMatch(prompt, /undefined/);
});

// D-066: per scrivere sopra il dipinto bisogna prima riportarlo in un canvas. Il decodificatore
// deve restituire esattamente i pixel che l'encoder aveva scritto.
test('decodePNG restituisce gli stessi pixel che encodePNG aveva scritto', () => {
  const canvas = createCanvas(7, 5, [200, 150, 100, 255]);
  canvas.pixels.set([10, 20, 30, 255], (2 * 7 + 3) * 4);
  const decoded = decodePNG(encodePNG(canvas));
  assert.equal(decoded.width, 7);
  assert.equal(decoded.height, 5);
  assert.deepEqual(Buffer.from(decoded.pixels), Buffer.from(canvas.pixels));
});

test('decodePNG rifiuta un buffer che non è un PNG, invece di restituire pixel casuali', () => {
  assert.throws(() => decodePNG(Buffer.from('questo non è un png')), /non è un PNG/);
});

// Il cuore di D-066: ogni parola sul foglio viene dallo schema, non dal modello. La prova è che
// la scheda composta è più alta del dipinto (le due fasce di carta) e che cambia se cambiano i
// nomi degli elementi o il titolo — cioè che quelle parole sono davvero state scritte.
test('composeSheet aggiunge le fasce con titolo e legenda scritti dal nostro codice', () => {
  const painted = encodePNG(createCanvas(200, 200, [245, 240, 225, 255]));
  const meta = { title: 'Filetti di triglia' };
  const sheet = decodePNG(composeSheet(painted, plating, meta));
  assert.equal(sheet.width, 200);
  assert.ok(sheet.height > 200, 'la scheda deve essere più alta del dipinto');

  const altriNomi = decodePNG(composeSheet(painted, { ...plating, clockLayout: [{ element: 'branzino' }, { element: 'finocchio' }, { element: 'arancia' }] }, meta));
  assert.notDeepEqual(Buffer.from(sheet.pixels), Buffer.from(altriNomi.pixels), 'i nomi degli elementi devono comparire davvero');

  const altroTitolo = decodePNG(composeSheet(painted, plating, { title: 'Tutt\'altro piatto' }));
  assert.notDeepEqual(Buffer.from(sheet.pixels), Buffer.from(altroTitolo.pixels), 'il titolo deve comparire davvero');
});

test('composeSheet è deterministica e regge un piatto senza titolo', () => {
  const painted = encodePNG(createCanvas(120, 90, [245, 240, 225, 255]));
  assert.deepEqual(composeSheet(painted, plating, { title: 'x' }), composeSheet(painted, plating, { title: 'x' }));
  const senzaTitolo = decodePNG(composeSheet(painted, plating, {}));
  assert.equal(senzaTitolo.width, 120);
  assert.ok(senzaTitolo.height > 90, 'resta la fascia della legenda');
});

// Vincolo 3 + fallback: senza chiave non si chiama la rete e si torna alla scheda a regole.
test('senza chiave platingPhoto restituisce la scheda deterministica, identica a renderPlating', async () => {
  assert.equal(imageAvailable(), false);
  const meta = { title: 'Filetti di triglia', principle: { term: 'cottura differenziale' } };
  const photo = await platingPhoto(plating, meta);
  assert.ok(Buffer.isBuffer(photo));
  assert.deepEqual(photo, renderPlating(plating, meta));
});
