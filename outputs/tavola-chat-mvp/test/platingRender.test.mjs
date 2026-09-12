import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPlating, platingText } from '../core/platingRender.mjs';
import { styleFor, sauceColorFor, GRAIN_ENUM, COLOR_ENUM } from '../core/foodStyle.mjs';

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

// D-061: il laboratorio dichiara grana e colore scegliendo da elenchi fissi, così un ingrediente
// che la mappa locale non conosce viene comunque disegnato per quello che è, invece di finire in
// una cupola neutra. Dove la mappa riconosce l'ingrediente resta lei a decidere, come verificatore.
test('styleFor usa la grana e il colore dichiarati quando la mappa locale non riconosce l\'ingrediente', () => {
  const style = styleFor('composta di bergamotto fermentato', { grain: 'crema', color: 'giallo agrume' });
  assert.equal(style.grain, 'cream');
  assert.ok(style.base[0] > 200 && style.base[2] < 150, 'deve prendere il giallo dichiarato, non il bruno neutro');
});

test('styleFor ignora una dichiarazione incoerente quando conosce davvero l\'ingrediente', () => {
  const style = styleFor('pomodoro crudo condito', { grain: 'foglie', color: 'verde scuro' });
  assert.equal(style.grain, 'dice', 'un pomodoro resta a dadi anche se dichiarato come foglie');
  assert.ok(style.base[0] > style.base[1], 'e resta rosso');
});

test('styleFor continua a funzionare senza attributi dichiarati (piatti editoriali e sessioni in corso)', () => {
  assert.equal(styleFor('nido di spaghetti').grain, 'strands');
  assert.equal(styleFor('ingrediente mai visto').grain, 'dome');
  assert.equal(styleFor('ingrediente mai visto', {}).grain, 'dome');
});

// D-061: due difetti trovati provando la precedenza su nomi reali, prima del deploy.
test('la mappa non decide sulla base di un complemento del nome', () => {
  // "quinoa soffiata al pepe": l'unica parola nota è "pepe", ma l'elemento non è pepe
  const quinoa = styleFor('quinoa soffiata al pepe di Sichuan', { grain: 'granelli', color: 'bruno chiaro' });
  assert.equal(quinoa.grain, 'granules');
  assert.ok(quinoa.base[0] < 200, 'non deve prendere il rosso delle spezie');
});

test('fra più ingredienti nel nome vince quello che compare per primo', () => {
  assert.equal(styleFor('branzino al limone').grain, 'fillet', 'il limone è il condimento, non l\'elemento');
  assert.equal(styleFor('spicchio di limone').grain, 'wedge');
  assert.equal(styleFor('spaghetti con pomodoro').grain, 'strands');
});

test('le liste dichiarabili restano allineate a ciò che il renderer sa disegnare', () => {
  assert.ok(GRAIN_ENUM.length >= 11);
  for (const grain of GRAIN_ENUM) {
    const style = styleFor('ingrediente mai visto', { grain, color: 'bruno chiaro' });
    const png = renderPlating({ ...samplePlating, clockLayout: [{ element: 'ingrediente mai visto', position: '3', shape: 'mucchio', grain, color: 'bruno chiaro' }, { element: 'altro mai visto', position: '9', shape: 'linea', grain, color: 'verde chiaro' }] });
    assert.ok(style.grain, `la grana "${grain}" deve tradursi in una resa nota`);
    assert.ok(Buffer.isBuffer(png) && png.length > 8, `la grana "${grain}" deve produrre un'immagine`);
  }
  for (const color of COLOR_ENUM) {
    const style = styleFor('ingrediente mai visto', { grain: 'massa', color });
    assert.ok(Array.isArray(style.base) && style.base.length === 3, `il colore "${color}" deve avere una palette`);
  }
});

test('sauceColorFor segue la base della salsa suggerita dagli elementi del piatto', () => {
  const pomodoro = sauceColorFor([{ element: 'passata di pomodoro' }]);
  const pestoSauce = sauceColorFor([{ element: 'pesto di basilico' }]);
  assert.ok(pomodoro.dark[0] > pomodoro.dark[1], 'una salsa di pomodoro deve tendere al rosso');
  assert.ok(pestoSauce.dark[1] > pestoSauce.dark[0], 'un pesto deve tendere al verde');
});
