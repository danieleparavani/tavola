import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TECHNIQUES, SOURCES, searchTechniques, sourcesFor, localTechniqueContext } from '../core/atlante.mjs';

// D-044: archivio tecnico locale verificato, usato per accelerare la generazione della ricetta
// (evitare la ricerca web quando l'archivio copre già la tecnica dominante). Test puri, nessuna
// rete: verificano solo la logica di ricerca e di composizione del contesto.

test('atlante: carica le 413 tecniche e le 30 fonti dei file data/atlante-tecniche', () => {
  assert.equal(TECHNIQUES.length, 413);
  assert.equal(SOURCES.length, 30);
});

test('searchTechniques trova "Mantecare risotto" per una richiesta sul risotto', () => {
  const matches = searchTechniques('vorrei fare un risotto alla milanese per 4 persone');
  assert.ok(matches.some(t => t.nome === 'Mantecare risotto'));
});

test('searchTechniques restituisce array vuoto per query senza token utili', () => {
  assert.deepEqual(searchTechniques('e o di'), []);
});

test('searchTechniques restituisce array vuoto per un ingrediente non coperto dall\'archivio (non deve inventare corrispondenze)', () => {
  const matches = searchTechniques('xyzabc123 ingrediente inventato che non esiste');
  assert.deepEqual(matches, []);
});

test('sourcesFor risolve fonte_id in oggetti fonte reali con titolo e url', () => {
  const [t] = searchTechniques('risotto mantecare');
  const srcs = sourcesFor(t);
  assert.ok(srcs.length > 0);
  for (const s of srcs) {
    assert.ok(s.titolo);
    assert.ok(s.url);
  }
});

test('localTechniqueContext restituisce testo vuoto e nessun match quando l\'archivio non copre la richiesta', () => {
  const { text, matches } = localTechniqueContext('xyzabc123 qwzyplok wgfhjk nonsensewordzz');
  assert.equal(text, '');
  assert.deepEqual(matches, []);
});

test('localTechniqueContext include le fonti verificate nel blocco quando trova una tecnica pertinente', () => {
  const { text, matches } = localTechniqueContext('risotto alla milanese, mantecatura finale');
  assert.ok(matches.length > 0);
  assert.match(text, /ARCHIVIO TECNICO LOCALE VERIFICATO/);
  assert.match(text, /Fonti verificate:/);
});
