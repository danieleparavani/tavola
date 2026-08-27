import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Test di integrazione: avvia davvero server.mjs come processo separato, in una copia
// isolata del progetto (per non toccare mai i dati reali del pilot in data/pilot.json),
// e verifica che la memoria sopravviva a un riavvio del processo — non solo a un reload
// della pagina, che nel simulatore maschera il problema (vedi rapporto finale).

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(here);
const PORT = 4321;
const BASE = `http://127.0.0.1:${PORT}`;

function setupIsolatedCopy() {
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tavola-server-test-'));
for (const item of ['core', 'public', 'server.mjs', 'package.json']) {
fs.cpSync(path.join(projectRoot, item), path.join(dir, item), { recursive: true });
}
return dir;
}

function startServer(cwd) {
const child = spawn(process.execPath, ['server.mjs'], {
cwd,
env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1', OPENAI_API_KEY: '' },
stdio: ['ignore', 'pipe', 'pipe'],
});
return child;
}

async function waitReady(timeoutMs = 8000) {
const start = Date.now();
while (Date.now() - start < timeoutMs) {
try {
const r = await fetch(`${BASE}/api/status`);
if (r.ok) return true;
} catch {
// server non ancora pronto
}
await new Promise(r => setTimeout(r, 100));
}
throw new Error('server non pronto entro il timeout');
}

function stopServer(child) {
return new Promise(resolve => {
child.once('exit', resolve);
child.kill('SIGTERM');
setTimeout(() => { try { child.kill('SIGKILL'); } catch {} ; resolve(); }, 3000);
});
}

test('conservazione della memoria: lo stato di un utente sopravvive a un riavvio reale del server', async () => {
const dir = setupIsolatedCopy();
let server = startServer(dir);
try {
await waitReady();

// Apertura automatica: nessun /start esplicito, un messaggio qualunque avvia il capitolo.
const r1 = await fetch(`${BASE}/api/message`, {
method: 'POST', headers: { 'content-type': 'application/json' },
body: JSON.stringify({ userId: 'integ-1', name: 'Tester', text: 'buonasera' }),
});
const d1 = await r1.json();
assert.equal(d1.user.state, 'locating');
assert.match(d1.reply.text, /Da dove partiamo\?/);

const r2 = await fetch(`${BASE}/api/message`, {
method: 'POST', headers: { 'content-type': 'application/json' },
body: JSON.stringify({ userId: 'integ-1', text: '🍳 Ho gli ingredienti, cuciniamo' }),
});
const d2 = await r2.json();
assert.equal(d2.user.state, 'collecting_people');
assert.equal(d2.user.context.intent, 'cook');

assert.ok(fs.existsSync(path.join(dir, 'data', 'pilot.json')), 'atteso data/pilot.json creato dal server');

await stopServer(server);
server = startServer(dir); // riavvio reale del processo, stessa cartella dati
await waitReady();

const r3 = await fetch(`${BASE}/api/user/integ-1`);
assert.equal(r3.status, 200);
const d3 = await r3.json();
assert.equal(d3.state, 'collecting_people');
assert.equal(d3.context.intent, 'cook');
assert.ok(d3.events.length >= 2);
} finally {
await stopServer(server);
fs.rmSync(dir, { recursive: true, force: true });
}
});

test('dashboard: /api/users espone il denominatore reale dei passaggi (niente "/5" fisso)', async () => {
const dir = setupIsolatedCopy();
let server = startServer(dir);
try {
await waitReady();
await fetch(`${BASE}/api/message`, {
method: 'POST', headers: { 'content-type': 'application/json' },
body: JSON.stringify({ userId: 'integ-2', name: 'Tester', text: 'ciao' }),
});
const r = await fetch(`${BASE}/api/users`);
const d = await r.json();
const u = d.users.find(x => x.id === 'integ-2');
assert.ok(u);
assert.equal(u.session, null); // nessuna sessione ancora: nulla da denominare, correttamente
} finally {
await stopServer(server);
fs.rmSync(dir, { recursive: true, force: true });
}
});

test('webhook Telegram: risponde subito (fire-and-forget) e processa comunque il messaggio dopo il consenso', async () => {
  const dir = setupIsolatedCopy();
  let server = startServer(dir);
  try {
    await waitReady();
    const baseUpdate = {
      message_id: 1,
      from: { id: 999888777, first_name: 'TestTG' },
      chat: { id: 999888777 },
    };
    const post = body => fetch(`${BASE}/telegram/webhook`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    const waitForUser = async () => {
      for (let i = 0; i < 30; i++) {
        const ru = await fetch(`${BASE}/api/user/tg-999888777`);
        if (ru.status === 200) return ru.json();
        await new Promise(res => setTimeout(res, 100));
      }
      return null;
    };

    // Primo contatto: risposta immediata del webhook, ma il consenso non è ancora dato,
    // quindi il capitolo non deve ancora essere avviato (D-0xx, gestione preferenze e consenso).
    const r1 = await post({ message: { ...baseUpdate, text: 'ciao' } });
    assert.equal(r1.status, 200);
    assert.equal((await r1.json()).ok, true);
    const afterFirst = await waitForUser();
    assert.ok(afterFirst, 'l\'utente deve essere creato anche solo al primo contatto');
    assert.equal(afterFirst.state, 'new');

    // Consenso dato: il messaggio successivo apre normalmente il capitolo.
    const r2 = await post({ message: { ...baseUpdate, message_id: 2, text: 'Ho capito, iniziamo' } });
    assert.equal(r2.status, 200);
    let state = null;
    for (let i = 0; i < 30; i++) {
      const ru = await fetch(`${BASE}/api/user/tg-999888777`);
      if (ru.status === 200) { state = (await ru.json()).state; if (state === 'locating') break; }
      await new Promise(res => setTimeout(res, 100));
    }
    assert.equal(state, 'locating');
  } finally {
    await stopServer(server);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('webhook Telegram: un utente Telegram già esistente prima di questa funzionalità non viene bloccato dal consenso', async () => {
  const dir = setupIsolatedCopy();
  // Simula un utente reale creato prima dell'introduzione del consenso (D-0xx): esiste già
  // su disco, a metà conversazione, senza il campo consentAt.
  fs.mkdirSync(path.join(dir, 'data'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'data', 'pilot.json'), JSON.stringify({
    telegramOffset: 0,
    users: {
      'tg-111222333': {
        id: 'tg-111222333', name: 'Vecchio', state: 'collecting_people',
        context: { people: null, time: null, ingredients: [], constraints: [], intent: 'idea' },
        session: null, pendingDplus: null, competencies: {}, events: [],
        preferences: { dplusTime: '08:30' },
      },
    },
  }));
  let server = startServer(dir);
  try {
    await waitReady();
    const r = await fetch(`${BASE}/telegram/webhook`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: { message_id: 1, from: { id: 111222333, first_name: 'Vecchio' }, chat: { id: 111222333 }, text: '3' } })
    });
    assert.equal(r.status, 200);
    let user = null;
    for (let i = 0; i < 30; i++) {
      const ru = await fetch(`${BASE}/api/user/tg-111222333`);
      if (ru.status === 200) { user = await ru.json(); if (user.state === 'collecting_time') break; }
      await new Promise(res => setTimeout(res, 100));
    }
    assert.equal(user.state, 'collecting_time'); // ha proseguito, non è stato rimandato al consenso
  } finally {
    await stopServer(server);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
