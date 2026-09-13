import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCHEDE, TECHNIQUE_ENTRIES, searchChefTechniques, chefContext, findChef, isKnownChefName } from '../core/archivioChef.mjs';

// D-067: l'archivio degli chef italiani entra in Tavola come corpus verificato. Questi test
// proteggono le due cose che possono rompersi in silenzio: il caricamento (un trattino diverso
// nell'intestazione faceva sparire un terzo delle schede senza errori) e la pertinenza della
// ricerca, che è ciò che decide se il riferimento arriva davvero al posto giusto.

test('l\'archivio carica tutte e 99 le schede, non una parte', () => {
  assert.equal(SCHEDE.length, 99);
  const senzaTecniche = SCHEDE.filter(s => !s.techniques.length);
  assert.deepEqual(senzaTecniche.map(s => s.chef), [], 'ogni scheda deve avere tecniche distintive');
  const senzaFonti = SCHEDE.filter(s => !s.sources.length);
  assert.deepEqual(senzaFonti.map(s => s.chef), [], 'ogni scheda deve avere fonti');
});

test('ogni scheda ha nome, ristorante e più di una tecnica indicizzata', () => {
  for (const s of SCHEDE) {
    assert.ok(s.chef && !s.chef.startsWith('-'), `nome non letto correttamente: ${JSON.stringify(s.chef)}`);
    assert.ok(s.restaurant, `ristorante mancante per ${s.chef}`);
  }
  assert.ok(TECHNIQUE_ENTRIES.length > 400, 'le tecniche distintive sono l\'unità di recupero: devono essere centinaia');
  assert.ok(TECHNIQUE_ENTRIES.every(e => e.name && e.chef), 'ogni voce indicizzata ha un nome di tecnica e un cuoco');
});

test('le fonti sono link reali, non testo', () => {
  const sources = SCHEDE.flatMap(s => s.sources);
  assert.ok(sources.length > 400);
  assert.ok(sources.every(s => /^https?:\/\//.test(s.url)), 'ogni fonte deve avere un URL');
});

// La prova che conta: una domanda per tecnica deve restituire i cuochi giusti, non i primi della
// lista. "Frollatura del pesce" è la domanda d'esempio del LEGGIMI dell'archivio.
test('la ricerca per tecnica trova i cuochi che la praticano davvero', () => {
  const frollatura = searchChefTechniques('frollatura del pesce', 3);
  assert.ok(frollatura.length >= 2);
  assert.ok(frollatura.every(e => /frollatura|maturazione/i.test(`${e.name} ${e.text}`)));

  const koji = searchChefTechniques('fermentazione koji garum', 3);
  assert.ok(koji.length >= 1);
  assert.ok(koji.some(e => /koji|garum|ferment/i.test(`${e.name} ${e.text}`)));
});

test('la ricerca non restituisce due voci dello stesso cuoco', () => {
  const found = searchChefTechniques('brace fuoco vivo affumicatura', 3);
  assert.equal(new Set(found.map(e => e.chef)).size, found.length);
});

test('una richiesta senza corrispondenze non produce contesto, invece di inventarne uno', () => {
  assert.deepEqual(searchChefTechniques(''), []);
  assert.equal(chefContext('zzzz qqqq wwww').text, '');
});

// Il blocco iniettato nel prompt deve dire al modello anche ciò che NON può fare: è questa frase
// a rendere applicabile il controllo sulle attribuzioni nel gate editoriale.
test('il contesto per il laboratorio porta le fonti e vieta le attribuzioni fuori archivio', () => {
  const { text, matches } = chefContext('frollatura del pesce', 2);
  assert.ok(matches.length >= 1);
  assert.match(text, /ARCHIVIO VERIFICATO DEGLI CHEF ITALIANI/);
  assert.match(text, /Fonte verificata: .*http/);
  assert.match(text, /Non attribuire nulla a cuochi, ristoranti o scuole che non compaiono qui/);
});

test('findChef risponde sia al nome completo sia a una parte del nome', () => {
  assert.equal(findChef('Massimo Bottura')?.n, 1);
  assert.equal(findChef('bottura')?.chef, 'Massimo Bottura');
  assert.equal(findChef('Chef Inesistente'), null);
});

// La base del controllo di D-009: i nomi attribuibili sono soltanto quelli dell'archivio.
test('i nomi dell\'archivio sono riconosciuti, gli altri no', () => {
  assert.equal(isKnownChefName('Bottura'), true);
  assert.equal(isKnownChefName('romito'), true);
  assert.equal(isKnownChefName('Superfinto'), false);
  assert.equal(isKnownChefName(''), false);
});
