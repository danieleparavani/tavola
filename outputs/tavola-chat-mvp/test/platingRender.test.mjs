import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPlating, platingText } from '../core/platingRender.mjs';
import { styleFor, sauceColorFor } from '../core/foodStyle.mjs';

// D-048: schema di impiattamento deterministico (regole fisse, nessuna generazione AI). Questi
// test verificano solo che il rendering sia un PNG valido e deterministico e che il testo
// strutturato rispecchi i campi del piatto: non testano la resa pixel per pixel.

const samplePlating = {
  clockLayout: [
    { element: 'nido di spaghetti', position: 'centro', shape: 'mucchio' },
    { element: 'mollica croccante', position: '12', shape: 'linea' },
    { element: 'filo d’olio', position: '6', shape: 'fetta' },
  ],
  sauceStyle: 'specchio',
  temperature: 'piatto tiepido',
  textureNote: 'la mollica deve restare croccante',
  finish: 'mollica distribuita in superficie',
};

test('renderPlating produce un buffer con la firma PNG valida', () => {
  const png = renderPlating(samplePlating);
  assert.ok(Buffer.isBuffer(png));
  assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
});

test('renderPlating è deterministico: stesso input, stesso output', () => {
  const a = renderPlating(samplePlating);
  const b = renderPlating(samplePlating);
  assert.deepEqual(a, b);
});

test('renderPlating gestisce ciascuno stile di salsa e ciascuna forma senza sollevare errori', () => {
  const sauceStyles = ['specchio', 'virgola', 'punti', 'velo', 'nessuna'];
  const shapes = ['mucchio', 'quenelle', 'fetta', 'ventaglio', 'linea'];
  for (const sauceStyle of sauceStyles) {
    for (const shape of shapes) {
      const png = renderPlating({ ...samplePlating, sauceStyle, clockLayout: [{ element: 'x', position: '3', shape }, { element: 'y', position: '9', shape }] });
      assert.ok(Buffer.isBuffer(png) && png.length > 8);
    }
  }
});

test('renderPlating gestisce una posizione "centro" e posizioni numeriche del quadrante', () => {
  const png = renderPlating({ ...samplePlating, clockLayout: [{ element: 'a', position: 'centro', shape: 'mucchio' }, { element: 'b', position: '9', shape: 'linea' }] });
  assert.ok(Buffer.isBuffer(png) && png.length > 8);
});

test('platingText compone un testo leggibile con elementi, salsa, temperatura, consistenze e finitura', () => {
  const text = platingText(samplePlating);
  assert.match(text, /Impiattamento/);
  assert.match(text, /nido di spaghetti/);
  assert.match(text, /ore 12/);
  assert.match(text, /al centro/);
  assert.match(text, /a specchio alla base/);
  assert.match(text, /piatto tiepido/);
  assert.match(text, /mollica deve restare croccante/);
  assert.match(text, /distribuita in superficie/);
});

test('platingText restituisce stringa vuota se plating è assente', () => {
  assert.equal(platingText(null), '');
  assert.equal(platingText(undefined), '');
});

// D-059: il disegno precedente era illeggibile (piatto quasi invisibile, elementi senza volume,
// nessun modo di collegare una forma astratta al nome dell'ingrediente). La correzione numera gli
// elementi sull'immagine (badge) e nella didascalia, con lo stesso numero in entrambi i posti.
test('platingText numera ogni elemento nello stesso ordine di clockLayout, a partire da 1', () => {
  const text = platingText(samplePlating);
  assert.match(text, /1\. nido di spaghetti/);
  assert.match(text, /2\. mollica croccante/);
  assert.match(text, /3\. filo d’olio/);
});

// D-060: il disegno è diventato un'illustrazione in prospettiva (760x480 in formato orizzontale,
// non più un quadrato con uno schema geometrico).
test('renderPlating produce un\'immagine orizzontale 760x600', () => {
  const png = renderPlating(samplePlating);
  assert.equal(png.readUInt32BE(16), 760);
  assert.equal(png.readUInt32BE(20), 600);
});

// D-060: colore e grana vengono dal nome reale dell'ingrediente. Sono queste corrispondenze a
// rendere il disegno riconoscibile, quindi vanno verificate: non basta che il PNG sia valido.
test('styleFor riconosce la grana dai nomi reali degli ingredienti', () => {
  assert.equal(styleFor('nido di spaghetti').grain, 'strands');
  assert.equal(styleFor('mollica croccante').grain, 'granules');
  assert.equal(styleFor('pomodoro crudo condito').grain, 'dice');
  assert.equal(styleFor('spicchio di limone').grain, 'wedge');
  assert.equal(styleFor('filetti di triglia, pelle in vista').grain, 'fillet');
  assert.equal(styleFor('prezzemolo fresco').grain, 'leaves');
  assert.equal(styleFor('vongole veraci aperte').grain, 'shell');
  assert.equal(styleFor('crema di zucchine').grain, 'cream');
});

test('styleFor distingue le specie di pesce invece di usare un unico colore', () => {
  const triglia = styleFor('filetti di triglia');
  const branzino = styleFor('filetto di branzino');
  assert.notDeepEqual(triglia.skin, branzino.skin);
  assert.ok(triglia.skin[0] > triglia.skin[2], 'la pelle della triglia deve tendere al rosso');
});

// D-014: nessun catalogo chiuso di ingredienti. Un ingrediente mai visto non deve rompere nulla:
// riceve una resa neutra e il disegno viene comunque prodotto.
test('styleFor restituisce una resa neutra per un ingrediente non previsto, senza errori', () => {
  const style = styleFor('composta di bergamotto fermentato');
  assert.equal(style.grain, 'dome');
  const png = renderPlating({ ...samplePlating, clockLayout: [{ element: 'composta di bergamotto fermentato', position: '3', shape: 'mucchio' }, { element: 'quinoa soffiata', position: '9', shape: 'linea' }] });
  assert.ok(Buffer.isBuffer(png) && png.length > 8);
});

test('sauceColorFor segue la base della salsa suggerita dagli elementi del piatto', () => {
  const pomodoro = sauceColorFor([{ element: 'passata di pomodoro' }]);
  const pestoSauce = sauceColorFor([{ element: 'pesto di basilico' }]);
  assert.ok(pomodoro.dark[0] > pomodoro.dark[1], 'una salsa di pomodoro deve tendere al rosso');
  assert.ok(pestoSauce.dark[1] > pestoSauce.dark[0], 'un pesto deve tendere al verde');
});
