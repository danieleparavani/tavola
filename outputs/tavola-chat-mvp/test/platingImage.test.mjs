import { test } from 'node:test';
import assert from 'node:assert/strict';

// Nessuna chiave: i test non devono mai chiamare la rete. Con la chiave assente il modulo deve
// comportarsi come prima di D-065, cioè restituire la scheda deterministica a regole.
delete process.env.OPENAI_API_KEY;

const { platingPrompt, platingPhoto, imageAvailable } = await import('../core/platingImage.mjs');
const { renderPlating } = await import('../core/platingRender.mjs');

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

// D-065, vincolo 1: il modello taglia i titoli grandi e li scrive in carattere tipografico.
// Il prompt deve vietare esplicitamente titoli e testo stampato.
test('il prompt vieta titoli e tipografia dentro l\'immagine', () => {
  const prompt = platingPrompt(plating);
  assert.match(prompt, /No title, no heading, no printed typography/);
  assert.doesNotMatch(prompt, /Filetti di triglia in padella/i);
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

// Le etichette sono scritte a mano: se sono lunghe il modello le sbaglia. Vanno accorciate, ma
// restando parole intere e riconoscibili.
test('le etichette vengono accorciate a parole intere e non superano quattro', () => {
  const prompt = platingPrompt({ ...plating, clockLayout: [
    ...plating.clockLayout,
    { element: 'prezzemolo', position: '9', shape: 'mucchio' },
    { element: 'quinto elemento che non deve comparire', position: '3', shape: 'mucchio' },
  ] });
  const labels = prompt.match(/pointing to its element: ([^.]+)\./)[1].split(', ');
  assert.equal(labels.length, 4);
  assert.ok(labels.every(l => l.length <= 30), 'nessuna etichetta più lunga del limite');
  assert.ok(labels.every(l => !l.endsWith(' ')), 'nessuna etichetta troncata a metà parola');
  assert.ok(labels.includes('prezzemolo'));
  assert.doesNotMatch(prompt, /pointing to its element:[^.]*quinto elemento/);
});

// D-014: nessun catalogo chiuso. Uno schema minimo o con campi mancanti non deve rompere nulla.
test('il prompt regge uno schema minimo senza campi facoltativi', () => {
  const prompt = platingPrompt({ clockLayout: [{ element: 'x', position: 'centro', shape: 'mucchio' }] });
  assert.ok(prompt.length > 100);
  assert.doesNotMatch(prompt, /undefined/);
});

// Vincolo 3 + fallback: senza chiave non si chiama la rete e si torna alla scheda a regole.
test('senza chiave platingPhoto restituisce la scheda deterministica, identica a renderPlating', async () => {
  assert.equal(imageAvailable(), false);
  const meta = { title: 'Filetti di triglia', principle: { term: 'cottura differenziale' } };
  const photo = await platingPhoto(plating, meta);
  assert.ok(Buffer.isBuffer(photo));
  assert.deepEqual(photo, renderPlating(plating, meta));
});
