import {
  createCanvas, fillEllipse, drawLine, fillDot, encodePNG,
  fillEllipseGradient, fillEllipseShaded, strokeEllipse, fillPolygon,
  fillEllipseShadowSmooth, fillEllipseInnerShadow, fillRibbon, fillArcGlow, fillPolygonShaded,
  applyVignette, drawNumberBadge, makeRng, hashString, lerpColor, paint,
} from './png.mjs';
import { styleFor, sauceColorFor } from './foodStyle.mjs';

// D-048: schema di impiattamento deterministico, basato su regole (D-020), non su generazione
// AI di immagini. Lo stesso oggetto `plating` prodotto dal laboratorio (o dai piatti editoriali)
// viene sia mostrato come testo strutturato sia disegnato qui. Deterministico e senza rete:
// stesso input, stessa immagine, nessun costo o latenza di rete aggiuntivi (D-046/D-047).
//
// D-059: primo tentativo di renderlo leggibile (contrasto, ombre, numeri).
//
// D-060: il progettista ha giudicato il risultato ancora lontano ("immagine brutta colori brutti
// ... crea un disegno realistico"). Qui lo schema geometrico astratto è sostituito da
// un'illustrazione: il piatto è visto in prospettiva (ellisse, non cerchio), gli elementi sono
// disegnati con il colore e la grana dell'ingrediente vero (core/foodStyle.mjs) — fili per la
// pasta, briciole per la mollica, dadi per il pomodoro, polpa e pelle per il pesce — con ombra di
// contatto, volume e ordine di profondità. Resta un'illustrazione, non una fotografia: il
// disegno è calcolato da regole, quindi è sempre lo stesso per la stessa ricetta e non costa
// nulla in latenza.

const W = 760, H = 600;
const CX = W / 2, CY = 312;
const PLATE_RX = 272, PLATE_RY = 164;
const LAYOUT_RX = 120, LAYOUT_RY = 70;

const CLOCK_ANGLES = { 12: -90, 1: -60, 2: -30, 3: 0, 4: 30, 5: 60, 6: 90, 7: 120, 8: 150, 9: 180, 10: -150, 11: -120 };

function angleFor(position) {
  if (position === 'centro') return null;
  const deg = CLOCK_ANGLES[Number(position)];
  return deg === undefined ? null : (deg * Math.PI) / 180;
}

function positionFor(position) {
  const rad = angleFor(position);
  if (rad === null) return { x: CX, y: CY + 6 };
  return { x: CX + Math.cos(rad) * LAYOUT_RX, y: CY + Math.sin(rad) * LAYOUT_RY };
}

// Impronta dell'elemento sul piatto: la forma dello schema (D-048) decide l'ingombro, la grana
// dell'ingrediente decide come viene riempito. Tutto è schiacciato in verticale perché il piatto
// è visto in prospettiva.
const FOOTPRINT = {
  mucchio: { rx: 94, ry: 51, h: 42 },
  quenelle: { rx: 78, ry: 42, h: 35 },
  fetta: { rx: 96, ry: 42, h: 22 },
  ventaglio: { rx: 106, ry: 48, h: 22 },
  linea: { rx: 100, ry: 25, h: 16 },
};

const SHADOW = [38, 26, 16];

function randomPointInEllipse(rng, rx, ry) {
  const t = 2 * Math.PI * rng();
  const r = Math.sqrt(rng());
  return { x: Math.cos(t) * rx * r, y: Math.sin(t) * ry * r };
}

function jitterColor(color, rng, amount) {
  const d = (rng() - 0.5) * 2 * amount;
  return [
    Math.max(0, Math.min(255, Math.round(color[0] + d))),
    Math.max(0, Math.min(255, Math.round(color[1] + d))),
    Math.max(0, Math.min(255, Math.round(color[2] + d))),
    color[3] ?? 255,
  ];
}

// --- rese per grana dell'ingrediente -----------------------------------------------------

// Fili: nido di pasta lunga. Gli strati più alti vengono disegnati per ultimi e più chiari, così
// il nido ha volume invece di essere un disco uniforme.
function drawStrands(canvas, fp, style, rng) {
  // base piena sotto il nido: senza, tra un filo e l'altro si vedeva il piatto e il nido
  // sembrava un gomitolo rado invece di una porzione
  fillEllipseShaded(canvas, fp.x, fp.y - fp.h * 0.22, fp.rx * 0.92, fp.ry * 0.95,
    lerpColor(style.base, style.dark, 0.35), lerpColor(style.dark, [60, 44, 24], 0.35), 0, -0.4, -0.5);
  const layers = 78;
  const squash = fp.ry / fp.rx;
  for (let i = 0; i < layers; i++) {
    const t = i / (layers - 1);
    const lift = Math.pow(t, 0.75) * fp.h; // i fili in cima sono gli ultimi disegnati
    const radius = fp.rx * (0.94 - t * 0.42) * (0.62 + rng() * 0.38);
    const a0 = rng() * Math.PI * 2;
    const arc = 0.7 + rng() * 1.5;
    const wobble = 0.9 + rng() * 0.25;
    const shade = t * 0.8 + rng() * 0.2;
    const color = jitterColor(lerpColor(lerpColor(style.dark, style.base, 0.55), style.light, shade), rng, 12);
    const steps = 10;
    let px = null, py = null;
    for (let s = 0; s <= steps; s++) {
      const a = a0 + (arc * s) / steps;
      const x = fp.x + Math.cos(a) * radius * wobble;
      const y = fp.y + Math.sin(a) * radius * squash * wobble - lift * 0.62;
      if (px !== null) {
        // ogni filo ha un bordo scuro sotto e un corpo chiaro sopra: senza lo stacco i fili
        // si fondevano in un'unica massa e il nido sembrava caramello, non spaghetti
        drawLine(canvas, px, py, x, y, 5.4, lerpColor(style.dark, [58, 40, 20], 0.35));
        drawLine(canvas, px, py, x, y, 3.1, color);
      }
      px = x; py = y;
    }
    if (rng() > 0.86) fillDot(canvas, px, py, 2.3, lerpColor(color, style.light, 0.4)); // punte dei fili
  }
}

// Granelli e briciole: tanti frammenti irregolari, più fitti al centro, ciascuno con il suo
// piccolo riflesso. Usato per mollica, pangrattato, riso, frutta secca, spezie.
function drawGranules(canvas, fp, style, rng) {
  const [sMin, sMax] = style.size || [2.2, 4.4];
  const count = Math.round((fp.rx * fp.ry) / 26);
  for (let i = 0; i < count; i++) {
    const p = randomPointInEllipse(rng, fp.rx * 0.96, fp.ry * 0.96);
    const centrality = 1 - Math.min(1, Math.hypot(p.x / fp.rx, p.y / fp.ry));
    const lift = centrality * fp.h * 0.55;
    const s = sMin + rng() * (sMax - sMin);
    const color = jitterColor(lerpColor(style.dark, style.light, 0.25 + centrality * 0.5 + rng() * 0.3), rng, 12);
    fillEllipseShaded(canvas, fp.x + p.x, fp.y + p.y - lift, s, s * (0.62 + rng() * 0.3), color, lerpColor(color, style.dark, 0.65), rng() * Math.PI);
    if (s > sMin + (sMax - sMin) * 0.55) paint(canvas, fp.x + p.x - s * 0.3, fp.y + p.y - lift - s * 0.3, [255, 252, 240, 150]);
  }
}

// Dadi: piccoli cubi isometrici (faccia superiore chiara, due facce laterali più scure). È ciò
// che rende riconoscibile un pomodoro a concassé o una patata a cubetti invece di una macchia.
function drawDice(canvas, fp, style, rng) {
  const count = Math.max(5, Math.round((fp.rx * fp.ry) / 155));
  const cubes = [];
  for (let i = 0; i < count; i++) {
    const p = randomPointInEllipse(rng, fp.rx * 0.82, fp.ry * 0.82);
    const centrality = 1 - Math.min(1, Math.hypot(p.x / fp.rx, p.y / fp.ry));
    cubes.push({ x: fp.x + p.x, y: fp.y + p.y - centrality * fp.h * 0.5, s: 6.5 + rng() * 4, r: (rng() - 0.5) * 0.5 });
  }
  cubes.sort((a, b) => a.y - b.y); // i pezzi davanti coprono quelli dietro
  for (const c of cubes) {
    const s = c.s, rot = c.r, cos = Math.cos(rot), sin = Math.sin(rot);
    const pt = (dx, dy) => [c.x + dx * cos - dy * sin, c.y + (dx * sin + dy * cos) * 0.74];
    // silhouette con angoli smussati: un pezzo tagliato al coltello non ha spigoli perfetti
    const k = 0.34;
    const body = [
      pt(-s + s * k, -s), pt(s - s * k, -s), pt(s, -s + s * k), pt(s, s - s * k),
      pt(s - s * k, s), pt(-s + s * k, s), pt(-s, s - s * k), pt(-s, -s + s * k),
    ];
    fillPolygonShaded(canvas, body, jitterColor(style.light, rng, 14), jitterColor(style.dark, rng, 12), { hx: -0.5, hy: -0.6, rim: 0.55 });
    // faccia superiore appena più chiara: dà lo spessore senza l'effetto "cubo di plastica"
    fillPolygon(canvas, [pt(-s + s * k, -s), pt(s - s * k, -s), pt(s * 0.72, -s * 0.34), pt(-s * 0.72, -s * 0.34)], [...lerpColor(style.light, [255, 250, 240], 0.35).slice(0, 3), 90]);
    fillDot(canvas, c.x - s * 0.3, c.y - s * 0.5, s * 0.14, [255, 255, 250, 130]);
  }
}

// Spicchio di agrume: mezzo disco con scorza, albedo chiaro e spicchi raggiati.
function drawWedge(canvas, fp, style, rng) {
  const rx = fp.rx * 0.72, ry = fp.ry * 1.0;
  fillEllipseShaded(canvas, fp.x, fp.y - fp.h * 0.3, rx, ry, style.light, style.dark, 0, -0.4, -0.5);
  strokeEllipse(canvas, fp.x, fp.y - fp.h * 0.3, rx, ry, 3.5, [...style.dark, 230]);
  strokeEllipse(canvas, fp.x, fp.y - fp.h * 0.3, rx - 4, ry - 3, 2, [253, 250, 236, 200]); // albedo
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * 0.92 + (i * Math.PI * 0.84) / 6;
    drawLine(canvas, fp.x, fp.y - fp.h * 0.3, fp.x + Math.cos(a) * (rx - 6), fp.y - fp.h * 0.3 + Math.sin(a) * (ry - 5), 1.6, [253, 248, 228, 190]);
  }
  fillDot(canvas, fp.x - rx * 0.35, fp.y - fp.h * 0.3 - ry * 0.35, 3.2, [255, 255, 250, 140]);
}

// Trancio: sagoma affusolata (non un'ellisse), polpa con venature, pelle lungo un lato e
// riflesso lucido. Usato per pesce e crostacei.
function drawFillet(canvas, fp, style, rng, rot = -0.12) {
  const rx = fp.rx * 0.92, ry = fp.ry * 0.92;
  const cy0 = fp.y - fp.h * 0.45;
  const place = (lx, ly) => [fp.x + lx * Math.cos(rot) - ly * Math.sin(rot), cy0 + lx * Math.sin(rot) + ly * Math.cos(rot)];
  // profilo a lente asimmetrica: una testa più larga e una coda più stretta, come un filetto
  const half = (u) => Math.pow(Math.max(0, 1 - u * u), 0.62) * (0.72 + 0.28 * (1 + u) / 2);
  const outline = [];
  for (let i = 0; i <= 24; i++) { const u = -1 + (2 * i) / 24; outline.push(place(u * rx, -half(u) * ry)); }
  for (let i = 24; i >= 0; i--) { const u = -1 + (2 * i) / 24; outline.push(place(u * rx, half(u) * ry)); }
  fillPolygonShaded(canvas, outline, style.light, style.dark, { hx: -0.4, hy: -0.55, rim: 0.5 });
  for (let i = 0; i < 4; i++) { // scaglie della polpa: archi a V, come le fibre di un filetto cotto
    const off = -0.5 + i * 0.33;
    const pts = [];
    for (let k = 0; k <= 10; k++) {
      const u = -0.72 + (k / 10) * 1.44;
      const lx = rx * off + (1 - Math.abs(u)) * rx * 0.12, ly = ry * u * 0.8;
      pts.push({ x: fp.x + lx * Math.cos(rot) - ly * Math.sin(rot), y: cy0 + lx * Math.sin(rot) + ly * Math.cos(rot) });
    }
    fillRibbon(canvas, pts, () => 2.6, () => [...lerpColor(style.dark, [120, 82, 70], 0.35).slice(0, 3), 85]);
    fillRibbon(canvas, pts.map(q => ({ x: q.x + 2, y: q.y + 1 })), () => 1.8, () => [255, 250, 244, 70]);
  }
  if (style.skin) { // pelle: segue il profilo superiore del trancio, sottile, con lucentezza
    const band = [];
    for (let i = 0; i <= 22; i++) {
      const u = -0.94 + (1.88 * i) / 22;
      band.push({ x: place(u * rx, -half(u) * ry * 0.82)[0], y: place(u * rx, -half(u) * ry * 0.82)[1] });
    }
    fillRibbon(canvas, band, (t) => ry * (0.16 + 0.12 * Math.sin(Math.PI * t)), (t, edge) => {
      const c = lerpColor(style.skin, lerpColor(style.skin, [34, 40, 50], 0.55), Math.min(1, edge * 0.9));
      return [...jitterColor(c, rng, 9).slice(0, 3), 235];
    });
    for (let i = 0; i < 6; i++) { // righe trasversali appena visibili sulla pelle
      const t = 0.12 + i * 0.15, p = band[Math.round(t * (band.length - 1))];
      if (p) fillDot(canvas, p.x, p.y, ry * 0.07, [...lerpColor(style.skin, [24, 30, 40], 0.6).slice(0, 3), 120]);
    }
    fillRibbon(canvas, band.map(p => ({ x: p.x, y: p.y - ry * 0.05 })), () => ry * 0.05, () => [240, 246, 252, 130]);
  }
  fillRibbon(canvas, [
    { x: fp.x - rx * 0.45, y: cy0 - ry * 0.26 },
    { x: fp.x - rx * 0.1, y: cy0 - ry * 0.38 },
    { x: fp.x + rx * 0.22, y: cy0 - ry * 0.3 },
  ], () => ry * 0.16, () => [255, 253, 246, 110]);
}

// Fetta compatta (carne, arrosti): superficie con segni di cottura e bordo rosolato.
function drawSlab(canvas, fp, style, rng, rot = -0.08) {
  const rx = fp.rx * 0.9, ry = fp.ry * 0.88;
  fillEllipseShaded(canvas, fp.x, fp.y - fp.h * 0.45, rx, ry, style.light, style.dark, rot, -0.4, -0.5);
  strokeEllipse(canvas, fp.x, fp.y - fp.h * 0.45, rx, ry, 3, [...lerpColor(style.dark, [50, 28, 18], 0.45).slice(0, 3), 200]);
  for (let i = 0; i < 3; i++) {
    const off = -0.42 + i * 0.42;
    drawLine(canvas, fp.x - rx * 0.6, fp.y - fp.h * 0.45 + ry * off, fp.x + rx * 0.6, fp.y - fp.h * 0.45 + ry * off - rx * 0.06, 2.6, [...lerpColor(style.dark, [42, 24, 14], 0.45).slice(0, 3), 80]);
  }
  fillDot(canvas, fp.x - rx * 0.3, fp.y - fp.h * 0.45 - ry * 0.4, 4, [255, 250, 238, 90]);
}

// Foglie ed erbe: piccole foglie a mandorla con nervatura, orientate a caso ma in modo stabile.
function drawLeaves(canvas, fp, style, rng) {
  const count = Math.max(6, Math.round((fp.rx * fp.ry) / 135));
  for (let i = 0; i < count; i++) {
    const p = randomPointInEllipse(rng, fp.rx * 0.9, fp.ry * 0.9);
    const rot = rng() * Math.PI;
    const lx = 7 + rng() * 5, ly = 3 + rng() * 2.2;
    const light = jitterColor(style.light, rng, 18), dark = jitterColor(style.dark, rng, 14);
    fillEllipseShaded(canvas, fp.x + p.x, fp.y + p.y - fp.h * 0.3, lx, ly, light, dark, rot, -0.35, -0.5);
    drawLine(canvas, fp.x + p.x - Math.cos(rot) * lx * 0.8, fp.y + p.y - fp.h * 0.3 - Math.sin(rot) * lx * 0.8,
      fp.x + p.x + Math.cos(rot) * lx * 0.8, fp.y + p.y - fp.h * 0.3 + Math.sin(rot) * lx * 0.8, 1, [...dark.slice(0, 3), 150]);
  }
}

// Crema o quenelle: superficie liscia e lucida, con la cresta tipica della quenelle.
function drawCream(canvas, fp, style, rng) {
  const rx = fp.rx * 0.86, ry = fp.ry * 0.96, rot = -0.2;
  const cy0 = fp.y - fp.h * 0.42;
  const place = (lx, ly) => [fp.x + lx * Math.cos(rot) - ly * Math.sin(rot), cy0 + lx * Math.sin(rot) + ly * Math.cos(rot)];
  // profilo della quenelle: due punte affusolate, non un uovo
  const half = (u) => Math.pow(Math.max(0, 1 - u * u), 0.68);
  const outline = [];
  for (let i = 0; i <= 22; i++) { const u = -1 + (2 * i) / 22; outline.push(place(u * rx, -half(u) * ry * 0.82)); }
  for (let i = 22; i >= 0; i--) { const u = -1 + (2 * i) / 22; outline.push(place(u * rx, half(u) * ry * 0.95)); }
  fillPolygonShaded(canvas, outline, style.light, style.dark, { hx: -0.4, hy: -0.6, rim: 0.55 });
  // cresta: una fascia chiara continua lungo il dorso, non una fila di pallini
  const ridge = [];
  for (let i = 0; i <= 14; i++) {
    const u = -0.78 + (1.56 * i) / 14;
    ridge.push({ x: place(u * rx, -half(u) * ry * 0.34)[0], y: place(u * rx, -half(u) * ry * 0.34)[1] });
  }
  fillRibbon(canvas, ridge, (t) => ry * 0.3 * Math.sin(Math.PI * Math.min(1, t + 0.08)), (t, edge) =>
    [...lerpColor(style.light, [255, 255, 255], 0.45).slice(0, 3), Math.round(120 * (1 - edge))]);
  fillEllipse(canvas, place(-rx * 0.28, -ry * 0.3)[0], place(-rx * 0.28, -ry * 0.3)[1], rx * 0.2, ry * 0.1, [255, 255, 252, 130], rot);
}

// Molluschi: gusci a ventaglio con costolature.
function drawShell(canvas, fp, style, rng) {
  const count = Math.max(3, Math.round(fp.rx / 16));
  const shells = [];
  for (let i = 0; i < count; i++) {
    const p = randomPointInEllipse(rng, fp.rx * 0.78, fp.ry * 0.78);
    shells.push({ x: fp.x + p.x, y: fp.y + p.y, s: 11 + rng() * 5, rot: (rng() - 0.5) * 1.2 });
  }
  shells.sort((a, b) => a.y - b.y);
  for (const sh of shells) {
    fillEllipseShadowSmooth(canvas, sh.x + 2, sh.y + sh.s * 0.34, sh.s * 1.3, sh.s * 0.45, SHADOW, 80);
    fillEllipseShaded(canvas, sh.x, sh.y - sh.s * 0.2, sh.s, sh.s * 0.62, style.light, style.dark, sh.rot, -0.4, -0.55);
    for (let k = -2; k <= 2; k++) {
      const a = sh.rot + Math.PI / 2 + k * 0.32;
      drawLine(canvas, sh.x, sh.y - sh.s * 0.2, sh.x + Math.cos(a) * sh.s * 0.8, sh.y - sh.s * 0.2 + Math.sin(a) * sh.s * 0.5, 1.2, [...style.dark.slice(0, 3), 150]);
    }
  }
}

// Filo d'olio o riduzione: linea lucida ondulata, non una barra piatta.
function drawDrizzle(canvas, fp, style, rng) {
  const steps = 26;
  let px = null, py = null;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = fp.x + (t - 0.5) * fp.rx * 1.9;
    const y = fp.y - fp.h * 0.3 + Math.sin(t * Math.PI * 2.2) * fp.ry * 0.5;
    if (px !== null) {
      drawLine(canvas, px, py, x, y, 5, [...style.base.slice(0, 3), 150]);
      drawLine(canvas, px, py - 1.4, x, y - 1.4, 2, [...style.light.slice(0, 3), 170]);
    }
    px = x; py = y;
  }
}

function drawDome(canvas, fp, style, rng) {
  fillEllipseShaded(canvas, fp.x, fp.y - fp.h * 0.45, fp.rx * 0.9, fp.ry * 1.05, style.light, style.dark, 0, -0.42, -0.55);
  for (let i = 0; i < 40; i++) {
    const p = randomPointInEllipse(rng, fp.rx * 0.8, fp.ry * 0.85);
    paint(canvas, fp.x + p.x, fp.y + p.y - fp.h * 0.45, [...jitterColor(style.dark, rng, 20).slice(0, 3), 60]);
  }
}

const GRAIN_RENDERERS = {
  strands: drawStrands, granules: drawGranules, dice: drawDice, wedge: drawWedge,
  fillet: drawFillet, slab: drawSlab, leaves: drawLeaves, cream: drawCream,
  shell: drawShell, drizzle: drawDrizzle, dome: drawDome,
};
const SOLID_GRAINS = new Set(['wedge', 'fillet', 'slab', 'cream']);

function drawElement(canvas, item, x, y, scale) {
  // D-061: la grana e il colore dichiarati dal laboratorio valgono dove la mappa locale non
  // riconosce l'ingrediente; dove lo riconosce, vince la mappa (vedi core/foodStyle.mjs).
  const style = styleFor(item.element, { grain: item.grain, color: item.color });
  const rng = makeRng(hashString(`${item.element}|${item.position}|${item.shape}`));
  const base = FOOTPRINT[item.shape] || FOOTPRINT.mucchio;
  const fp = { x, y, rx: base.rx * scale, ry: base.ry * scale, h: base.h * scale };
  const render = GRAIN_RENDERERS[style.grain] || drawDome;

  fillEllipseShadowSmooth(canvas, x + 7 * scale, y + fp.ry * 0.46, fp.rx * 1.12, fp.ry * 0.66, SHADOW, 120, 0.7);

  // "ventaglio" su un ingrediente compatto significa davvero tre pezzi sovrapposti a ventaglio;
  // su un ingrediente granulare resta un'unica impronta, solo più larga.
  if (item.shape === 'ventaglio' && SOLID_GRAINS.has(style.grain)) {
    const piece = { ...fp, rx: fp.rx * 0.44, ry: fp.ry * 0.62 };
    [-1, 0, 1].forEach((k) => {
      render(canvas, { ...piece, x: x + k * fp.rx * 0.34, y: y + k * 4 }, style, rng, -0.18 + k * 0.16);
    });
    return;
  }
  render(canvas, fp, style, rng);
}

// --- piatto e salsa ----------------------------------------------------------------------

// Piano d'appoggio scuro e caldo: un piatto di ceramica chiara ha bisogno di un fondo scuro per
// staccare. Con il fondo chiaro della versione precedente il piatto spariva nello sfondo.
function drawTable(canvas) {
  const rng = makeRng(20260912);
  for (let y = 0; y < H; y++) {
    const t = y / H;
    const color = lerpColor([104, 92, 80, 255], [66, 57, 49, 255], t);
    for (let x = 0; x < W; x++) paint(canvas, x, y, color);
  }
  for (let i = 0; i < 9000; i++) { // grana appena percepibile del piano, non un fondo piatto
    const x = rng() * W, y = rng() * H;
    paint(canvas, x, y, [255, 240, 220, Math.round(rng() * 16)]);
  }
}

function drawPlate(canvas) {
  // ombra di contatto stretta sotto il piatto: quella larga di prima sembrava un alone grigio
  // attaccato al piatto, non un'ombra sul piano
  fillEllipseShadowSmooth(canvas, CX + 12, CY + PLATE_RY * 0.6, PLATE_RX * 1.0, PLATE_RY * 0.62, [18, 12, 8], 150, 0.5);
  // corpo del piatto: ceramica illuminata da sinistra in alto
  fillEllipseShaded(canvas, CX, CY, PLATE_RX, PLATE_RY, [255, 254, 252], [204, 195, 180], 0, -0.45, -0.55);
  strokeEllipse(canvas, CX, CY, PLATE_RX - 1, PLATE_RY - 1, 2, [150, 140, 124, 130]);
  // conca centrale: bordo interno in ombra dal lato della luce, quindi incassata
  fillEllipseShaded(canvas, CX, CY + 7, PLATE_RX * 0.7, PLATE_RY * 0.7, [252, 250, 245], [223, 216, 202], 0, -0.35, -0.45);
  fillEllipseInnerShadow(canvas, CX, CY + 7, PLATE_RX * 0.7, PLATE_RY * 0.7, 16, [120, 110, 94], 90, -0.6, -0.8);
  strokeEllipse(canvas, CX, CY + 9, PLATE_RX * 0.71, PLATE_RY * 0.71, 2, [255, 255, 255, 120]);
  // riflesso continuo sul bordo in alto a sinistra
  fillArcGlow(canvas, CX, CY, PLATE_RX * 0.9, PLATE_RY * 0.9, 9, -Math.PI * 0.95, -Math.PI * 0.5, [255, 255, 255], 120);
  fillArcGlow(canvas, CX, CY, PLATE_RX * 0.98, PLATE_RY * 0.98, 5, Math.PI * 0.15, Math.PI * 0.45, [255, 252, 244], 60);
}

function drawSauce(canvas, style, sauce) {
  switch (style) {
    case 'specchio': {
      // una salsa stesa è una velatura larga e bassa sul fondo del piatto: quella di prima era
      // una cupola opaca al centro e sembrava una massa di cibo, non una salsa
      const rx = PLATE_RX * 0.56, ry = PLATE_RY * 0.4, a = Math.min(200, sauce.alpha ?? 200);
      fillEllipseShaded(canvas, CX, CY + 26, rx, ry, [...sauce.light, a], [...sauce.dark, a], 0, -0.3, -0.35);
      fillEllipse(canvas, CX - rx * 0.22, CY + 26 - ry * 0.42, rx * 0.42, ry * 0.13, [255, 255, 255, 55], -0.08);
      return;
    }
    case 'velo':
      fillEllipseGradient(canvas, CX, CY + 10, PLATE_RX * 0.6, PLATE_RY * 0.6, [...sauce.light, 90], [...sauce.dark, 30]);
      return;
    case 'virgola': {
      // nastro continuo calcolato come campo di distanza: bordi netti, nessuna striscia dove i
      // segmenti si sovrappongono, e un riflesso lungo il lato illuminato
      const pts = [];
      for (let i = 0; i <= 26; i++) {
        const t = i / 26;
        const a = Math.PI * (0.98 - t * 1.5);
        pts.push({ x: CX + Math.cos(a) * PLATE_RX * 0.4 - 10, y: CY + 18 + Math.sin(a) * PLATE_RY * 0.42 });
      }
      // una salsa stesa sul piatto è piatta e lucida: il colore resta pieno al centro e si
      // schiarisce solo nel riflesso, e i bordi sfumano invece di scurirsi come un tubo
      const sa = sauce.alpha ?? 230;
      fillRibbon(canvas, pts, (t) => 34 * (1 - t) + 8, (t, edge) => {
        const gloss = Math.max(0, 1 - Math.abs(edge - 0.45) * 3.4) * 0.5;
        const body = lerpColor([...sauce.dark, sa], [...sauce.light, sa], gloss);
        return [body[0], body[1], body[2], Math.round(sa * (edge > 0.9 ? 1 - (edge - 0.9) * 6 : 1))];
      });
      return;
    }
    case 'punti':
      [[-96, -34], [-52, 30], [16, -46], [86, 16], [4, 58], [-16, -6]].forEach(([dx, dy], i) => {
        const r = 9 + (i % 3) * 2;
        fillEllipseShaded(canvas, CX + dx, CY + 12 + dy, r, r * 0.68, [...sauce.light, 240], [...sauce.dark, 240]);
        fillDot(canvas, CX + dx - r * 0.3, CY + 12 + dy - r * 0.3, r * 0.2, [255, 255, 255, 150]);
      });
      return;
    case 'nessuna':
    default: return;
  }
}

// --- numerazione --------------------------------------------------------------------------

// I numeri stanno fuori dal piatto, collegati all'elemento da una linea sottile: non coprono il
// cibo e si leggono come la legenda di una tavola illustrata. Se due numeri finirebbero troppo
// vicini, il secondo viene spostato lungo il bordo.
function badgePositions(items) {
  const used = [];
  return items.map((it, idx) => {
    let a = angleFor(it.position);
    if (a === null) a = -Math.PI / 2 - 0.5;
    let guard = 0;
    while (used.some(u => Math.abs(Math.atan2(Math.sin(a - u), Math.cos(a - u))) < 0.38) && guard++ < 16) a += 0.4;
    used.push(a);
    return { idx, x: CX + Math.cos(a) * PLATE_RX * 1.06, y: CY + Math.sin(a) * PLATE_RY * 1.15 };
  });
}

// Piano e piatto vuoto non dipendono dalla ricetta: vengono calcolati una volta sola e poi
// ricopiati. È la parte più costosa del disegno (passate per pixel su tutta l'immagine), quindi
// la cache evita di rifarla a ogni ricetta — coerente con D-046/D-047 sulla latenza.
let emptyPlateCache = null;

function buildEmptyPlate() {
  const canvas = createCanvas(W, H, [222, 212, 196, 255]);
  drawTable(canvas);
  applyVignette(canvas, CX, CY, W * 0.72, 90);
  drawPlate(canvas);
  return canvas;
}

export function renderPlating(plating) {
  if (!emptyPlateCache) emptyPlateCache = buildEmptyPlate();
  const canvas = { width: W, height: H, pixels: Buffer.from(emptyPlateCache.pixels) };

  const items = (plating?.clockLayout || []).filter(Boolean);
  drawSauce(canvas, plating?.sauceStyle, sauceColorFor(items));

  // profondità: gli elementi sul fondo del piatto vengono disegnati per primi e leggermente più
  // piccoli, quelli in primo piano per ultimi e più grandi — così le sovrapposizioni sono giuste.
  const placed = items.map((item, idx) => ({ item, idx, ...positionFor(item.position) }));
  placed.sort((a, b) => a.y - b.y);
  for (const p of placed) {
    const depth = (p.y - (CY - LAYOUT_RY)) / (2 * LAYOUT_RY);
    drawElement(canvas, p.item, p.x, p.y, 0.9 + depth * 0.2);
  }

  for (const badge of badgePositions(items)) {
    const target = positionFor(items[badge.idx].position);
    drawLine(canvas, badge.x, badge.y, target.x, target.y, 1.4, [70, 58, 44, 110]);
    drawNumberBadge(canvas, badge.x, badge.y, badge.idx + 1, { r: 16, scale: 2, fill: [52, 42, 32, 245] });
  }
  return encodePNG(canvas);
}

// Testo strutturato leggibile per il messaggio Telegram (D-048: "entrambi" — immagine e testo).
// D-059: la lista è numerata negli stessi numeri dei cerchietti disegnati sull'immagine, così
// le due cose si leggono insieme invece che come due elenchi scollegati.
export function platingText(plating) {
  if (!plating) return '';
  const posLabel = (p) => (p === 'centro' ? 'al centro' : `ore ${p}`);
  const layout = (plating.clockLayout || []).map((i, idx) => `${idx + 1}. ${i.element} — ${posLabel(i.position)} (${i.shape})`).join('\n');
  const sauceLabel = { specchio: 'a specchio alla base', virgola: 'a virgola', punti: 'a punti', velo: 'a velo leggero', nessuna: 'assente' }[plating.sauceStyle] || plating.sauceStyle;
  return `🍽 **Impiattamento** (i numeri corrispondono a quelli nell'immagine)\n${layout}\nSalsa: ${sauceLabel}\nTemperatura: ${plating.temperature}\nConsistenze da proteggere: ${plating.textureNote}\nFinitura: ${plating.finish}`;
}
