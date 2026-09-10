import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TECHNIQUES, CHUNKS, SOURCES, searchChunks, searchTechniques, resolveSources, localTechniqueContext } from '../core/atlante.mjs';

// D-046/D-047: archivio tecnico locale verificato (Atlante Tecnico della Cucina v2, RAG-ready),
// usato per accelerare la generazione della ricetta (evitare la ricerca web quando l'archivio
// copre già la tecnica dominante). Test puri, nessuna rete: verificano solo la logica di ricerca
// e di composizione del contesto.

test('atlante: carica 413 tecniche, 5305 chunk e 270 fonti da data/atlante-rag/', () => {
  assert.equal(TECHNIQUES.length, 413);
  assert.equal(CHUNKS.length, 5305);
  assert.equal(SOURCES.length, 270);
});

test('searchChunks trova chunk pertinenti sulla mantecatura per una richiesta sul risotto', () => {
  const chunks = searchChunks('vorrei fare un risotto alla milanese per 4 persone');
  assert.ok(chunks.some(c => c.tecnica === 'Mantecare risotto'));
});

test('searchChunks restituisce array vuoto per query senza token utili', () => {
  assert.deepEqual(searchChunks('e o di'), []);
});

test('searchChunks restituisce array vuoto per parole inventate (non deve inventare corrispondenze)', () => {
  assert.deepEqual(searchChunks('xyzabc123 qwzyplok wgfhjk nonsensewordzz'), []);
});

test('searchTechniques raggruppa i chunk per tecnica e risolve il record completo', () => {
  const groups = searchTechniques('risotto mantecatura finale');
  assert.ok(groups.length > 0);
  const first = groups[0];
  assert.ok(first.technique.id.startsWith('TC-'));
  assert.ok(first.chunks.length > 0);
  assert.ok(first.chunks.every(c => c.technique_id === first.technique.id));
});

test('resolveSources risolve source_local_ids in oggetti fonte reali con descrizione e url, disambiguando per volume', () => {
  const [group] = searchTechniques('risotto mantecatura');
  const srcs = resolveSources(group.technique);
  assert.ok(srcs.length > 0);
  for (const s of srcs) {
    assert.ok(s.descrizione);
    assert.ok(s.url);
    assert.equal(s.volume, group.technique.volume);
  }
});

test('localTechniqueContext restituisce testo vuoto e nessun match quando l\'archivio non copre la richiesta', () => {
  const { text, matches } = localTechniqueContext('xyzabc123 qwzyplok wgfhjk nonsensewordzz');
  assert.equal(text, '');
  assert.deepEqual(matches, []);
});

test('localTechniqueContext include sezioni etichettate e fonti verificate quando trova una tecnica pertinente', () => {
  const { text, matches } = localTechniqueContext('risotto alla milanese, mantecatura finale');
  assert.ok(matches.length > 0);
  assert.match(text, /ARCHIVIO TECNICO LOCALE VERIFICATO/);
  assert.match(text, /Fonti verificate:/);
  assert.match(text, /\[[A-Za-zÀ-ù].*\]/); // almeno un'etichetta di sezione tra parentesi quadre
});
