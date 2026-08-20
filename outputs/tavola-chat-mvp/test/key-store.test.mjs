import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// key-store.mjs legge TAVOLA_KEY_FILE una sola volta, al momento dell'import: la impostiamo
// prima di importare per isolare completamente il test dalla vera chiave del progetto.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tavola-keytest-'));
const keyFile = path.join(tmpDir, 'openai-key.protected');
process.env.TAVOLA_KEY_FILE = keyFile;

const { saveProtectedKey, loadProtectedKey } = await import('../core/key-store.mjs');

test('persistenza della chiave: round-trip cifra/decifra correttamente', () => {
  const plain = 'sk-test-1234567890abcdefTEST';
  saveProtectedKey(plain);
  assert.ok(fs.existsSync(keyFile));
  const loaded = loadProtectedKey();
  assert.equal(loaded, plain);
});

test('persistenza della chiave: il file su disco non contiene mai la chiave in chiaro', () => {
  const plain = 'sk-another-secret-value-should-not-leak';
  saveProtectedKey(plain);
  const raw = fs.readFileSync(keyFile, 'utf8');
  assert.ok(!raw.includes(plain), 'la chiave in chiaro non deve comparire nel file su disco');
  const payload = JSON.parse(raw);
  assert.ok(payload.data && payload.iv && payload.salt && payload.tag, 'atteso un payload cifrato AES-GCM completo');
});

test('persistenza della chiave: sopravvive a una nuova lettura (simula il riavvio del server)', () => {
  const plain = 'sk-survive-restart-check-0001';
  saveProtectedKey(plain);
  // Rilettura indipendente, come farebbe server.mjs a ogni avvio del processo.
  const loadedAgain = loadProtectedKey();
  assert.equal(loadedAgain, plain);
});

test('persistenza della chiave: un file assente o corrotto restituisce stringa vuota, non un errore', () => {
  fs.writeFileSync(keyFile, 'non è json valido');
  assert.equal(loadProtectedKey(), '');
  fs.rmSync(keyFile, { force: true });
  assert.equal(loadProtectedKey(), '');
});
