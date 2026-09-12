import {
  createCanvas, encodePNG, fillEllipse, fillDot,
  paintMultiply, valueNoise, organicEllipse, fillWash, drawInk, ribbonPolygon,
  drawNumberBadge, makeRng, hashString, lerpColor,
} from './png.mjs';
import { styleFor, sauceColorFor } from './foodStyle.mjs';

// D-048: schema di impiattamento deterministico, basato su regole (D-020), non su generazione
// AI di immagini. Lo stesso oggetto `plating` prodotto dal laboratorio (o dai piatti editoriali)
// viene sia mostrato come testo strutturato sia disegnato qui. Deterministico e senza rete:
// stesso input, stessa immagine, nessun costo o latenza di rete aggiuntivi (D-046/D-047).
//
// D-059: primo tentativo di renderlo leggibile (contrasto, ombre, numeri).
// D-060: colore e grana presi dall'ingrediente reale, piatto in prospettiva, volume e profondita.
// D-061: grana e colore dichiarati dal laboratorio, mappa locale come verificatore.
//
// D-062: la resa passa dall'imitazione di un oggetto tridimensionale all'acquerello, sullo stile
// dei disegni con cui si presenta l'idea di un piatto prima di realizzarlo. E una scelta tecnica
// oltre che estetica: un finto 3D calcolato da regole compete con una fotografia e perde sempre,
// mentre un acquerello vive proprio di cio che le regole sanno produrre - contorni irregolari,
// pigmento che si accumula ai bordi, velature trasparenti che si moltiplicano dove si
// sovrappongono, grana della carta, linea di matita che non coincide con il colore. Lo schema
// dei dati non cambia: stessi elementi, stesse posizioni sul quadrante, stessa numerazione.

const W = 760, H = 600;
const CX = W / 2, CY = 312;
const PLATE_RX = 268, PLATE_RY = 158;
const LAYOUT_RX = 120, LAYOUT_RY = 70;

const PAPER = [252, 249, 241];
const INK = [78, 70, 64];        // matita morbida, non nero pieno
const PENCIL = [126, 118, 110];  // tratto piu leggero, per i richiami dei numeri
const PLATE_WASH = [206, 214, 219];
const SHADOW_WASH = [178, 174, 168];

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
// dell'ingrediente decide come viene dipinto.
const FOOTPRINT = {
  mucchio: { rx: 92, ry: 50, h: 30 },
  quenelle: { rx: 76, ry: 40, h: 26 },
  fetta: { rx: 94, ry: 40, h: 16 },
  ventaglio: { rx: 104, ry: 46, h: 16 },
  linea: { rx: 98, ry: 24, h: 12 },
};

function randomPointInEllipse(rng, rx, ry) {
  const t = 2 * Math.PI * rng();
  const r = Math.sqrt(rng());
  return { x: Math.cos(t) * rx * r, y: Math.sin(t) * ry * r };
}

// Il pigmento di un acquerello e piu chiaro e trasparente del colore pieno: la carta traspare.
function pigment(style) { return style.base; }
function pigmentDeep(style) { return lerpColor(style.base, style.dark, 0.7).slice(0, 3); }

// --- rese per grana dell'ingrediente, in acquerello -----------------------------------------

// Fili: una macchia di colore e sopra i fili, tirati a penna con tratto sottile e irregolare.
function drawStrands(canvas, fp, style, rng, seed) {
  fillWash(canvas, organicEllipse(fp.x, fp.y - fp.h * 0.25, fp.rx * 0.86, fp.ry * 0.92, 0, seed, 0.1), pigment(style), { alpha: 0.42, seed, edge: 0.6 });
  const squash = fp.ry / fp.rx;
  for (let i = 0; i < 22; i++) {
    const radius = fp.rx * (0.34 + rng() * 0.5);
    const a0 = rng() * Math.PI * 2;
    const arc = 1.1 + rng() * 2.2;
    const lift = rng() * fp.h * 0.5;
    const pts = [];
    for (let s = 0; s <= 9; s++) {
      const a = a0 + (arc * s) / 9;
      pts.push([fp.x + Math.cos(a) * radius, fp.y + Math.sin(a) * radius * squash - lift]);
    }
    drawInk(canvas, pts, i % 4 === 0 ? INK : pigmentDeep(style), { width: 1.3, alpha: 0.45, seed: seed + i, wobble: 0.9, breaks: 0.2 });
  }
}

// Granelli: tanti tocchi minuti di pennello, piu fitti al centro, con qualche punto di penna.
function drawGranules(canvas, fp, style, rng, seed) {
  const [sMin, sMax] = style.size || [2.2, 4.4];
  const count = Math.round((fp.rx * fp.ry) / 42);
  for (let i = 0; i < count; i++) {
    const p = randomPointInEllipse(rng, fp.rx * 0.94, fp.ry * 0.94);
    const s = (sMin + rng() * (sMax - sMin)) * 1.25;
    fillWash(canvas, organicEllipse(fp.x + p.x, fp.y + p.y, s, s * (0.7 + rng() * 0.4), rng() * 3, seed + i, 0.2, 10),
      rng() > 0.75 ? pigmentDeep(style) : pigment(style), { alpha: 0.5, seed: seed + i, bleed: 1.6, edge: 0.5 });
    if (rng() > 0.78) fillDot(canvas, fp.x + p.x, fp.y + p.y, 0.8, [...INK, 150]);
  }
}

// Dadi: quadrilateri disegnati a mano, colore steso dentro e contorno di penna che sborda.
function drawDice(canvas, fp, style, rng, seed) {
  const count = Math.max(5, Math.round((fp.rx * fp.ry) / 190));
  const pieces = [];
  for (let i = 0; i < count; i++) {
    const p = randomPointInEllipse(rng, fp.rx * 0.8, fp.ry * 0.8);
    pieces.push({ x: fp.x + p.x, y: fp.y + p.y, s: 6.5 + rng() * 7.5, rot: (rng() - 0.5) * 1.5 });
  }
  pieces.sort((a, b) => a.y - b.y);
  pieces.forEach((c, i) => {
    const cos = Math.cos(c.rot), sin = Math.sin(c.rot);
    const corner = (dx, dy) => {
      const jx = dx * (0.82 + valueNoise(dx + i, dy, seed) * 0.36), jy = dy * (0.82 + valueNoise(dy + i, dx, seed + 5) * 0.36);
      return [c.x + jx * cos - jy * sin, c.y + (jx * sin + jy * cos) * 0.8];
    };
    const quad = [corner(-c.s, -c.s), corner(c.s, -c.s * 0.9), corner(c.s, c.s), corner(-c.s * 0.9, c.s)];
    fillWash(canvas, quad, pigment(style), { alpha: 0.5, seed: seed + i, edge: 0.7, bleed: 2.2 });
    drawInk(canvas, quad, INK, { width: 1, alpha: 0.32, seed: seed + i, closed: true, breaks: 0.34, wobble: 1 });
  });
}

// Spicchio di agrume: mezzo disco, spicchi tirati a penna, bordo della scorza piu carico.
function drawWedge(canvas, fp, style, rng, seed) {
  const rx = fp.rx * 0.62, ry = fp.ry * 0.92;
  const cy0 = fp.y - fp.h * 0.2;
  const arc = [];
  for (let i = 0; i <= 18; i++) {
    const a = Math.PI * (1 + i / 18);
    const n = 1 + (valueNoise(i, 3, seed) - 0.5) * 0.1;
    arc.push([fp.x + Math.cos(a) * rx * n, cy0 + Math.sin(a) * ry * n]);
  }
  const shape = [...arc, [fp.x + rx * 0.96, cy0 + 2], [fp.x - rx * 0.96, cy0 + 1]];
  fillWash(canvas, shape, pigment(style), { alpha: 0.44, seed, edge: 0.75 });
  drawInk(canvas, shape, INK, { width: 1.4, alpha: 0.6, seed, closed: true, breaks: 0.14 });
  for (let i = 1; i < 7; i++) { // spicchi
    const a = Math.PI * (1 + i / 7);
    drawInk(canvas, [[fp.x + Math.cos(a) * rx * 0.12, cy0 + Math.sin(a) * ry * 0.12], [fp.x + Math.cos(a) * rx * 0.86, cy0 + Math.sin(a) * ry * 0.86]],
      INK, { width: 1, alpha: 0.4, seed: seed + i, breaks: 0.2 });
  }
  drawInk(canvas, arc.map(([x, y]) => [x, y + 1.5]), pigmentDeep(style), { width: 2.4, alpha: 0.42, seed: seed + 2, breaks: 0.1 }); // scorza
}

// Trancio: sagoma affusolata, velatura, pelle come seconda velatura piu carica su un lato.
function drawFillet(canvas, fp, style, rng, seed, rot = -0.12) {
  const rx = fp.rx * 0.86, ry = fp.ry * 0.88, cy0 = fp.y - fp.h * 0.25;
  const place = (lx, ly) => [fp.x + lx * Math.cos(rot) - ly * Math.sin(rot), cy0 + lx * Math.sin(rot) + ly * Math.cos(rot)];
  const half = (u) => Math.pow(Math.max(0, 1 - u * u), 0.6) * (0.72 + 0.28 * (1 + u) / 2);
  const top = [], bottom = [];
  for (let i = 0; i <= 18; i++) {
    const u = -1 + (2 * i) / 18;
    const n = 1 + (valueNoise(i, 7, seed) - 0.5) * 0.12;
    top.push(place(u * rx, -half(u) * ry * n));
    bottom.push(place(u * rx, half(u) * ry * n));
  }
  const shape = [...top, ...bottom.slice().reverse()];
  fillWash(canvas, shape, pigment(style), { alpha: 0.42, seed, edge: 0.7 });
  drawInk(canvas, shape, INK, { width: 1.5, alpha: 0.6, seed, closed: true, breaks: 0.16 });
  if (style.skin) { // pelle: velatura piu densa lungo il dorso
    const band = ribbonPolygon(top.map(([x, y]) => ({ x, y: y + ry * 0.1 })), () => ry * 0.3);
    fillWash(canvas, band, style.skin.slice(0, 3), { alpha: 0.55, seed: seed + 4, edge: 0.6, bleed: 2.5 });
  }
  for (let i = 1; i < 4; i++) { // fibre della polpa
    const u = -0.55 + i * 0.35;
    drawInk(canvas, [place(u * rx, -half(u) * ry * 0.6), place(u * rx + rx * 0.06, 0), place(u * rx, half(u) * ry * 0.6)],
      INK, { width: 1, alpha: 0.32, seed: seed + i * 3, breaks: 0.28 });
  }
}

// Fetta compatta: velatura piena, contorno e due segni di cottura.
function drawSlab(canvas, fp, style, rng, seed, rot = -0.08) {
  const shape = organicEllipse(fp.x, fp.y - fp.h * 0.3, fp.rx * 0.84, fp.ry * 0.8, rot, seed, 0.09);
  fillWash(canvas, shape, pigment(style), { alpha: 0.46, seed, edge: 0.7 });
  drawInk(canvas, shape, INK, { width: 1.5, alpha: 0.58, seed, closed: true, breaks: 0.18 });
  for (let i = 0; i < 2; i++) {
    const off = -0.25 + i * 0.5;
    drawInk(canvas, [[fp.x - fp.rx * 0.5, fp.y - fp.h * 0.3 + fp.ry * off], [fp.x + fp.rx * 0.5, fp.y - fp.h * 0.3 + fp.ry * off - 4]],
      pigmentDeep(style), { width: 2.6, alpha: 0.4, seed: seed + i, breaks: 0.22 });
  }
}

// Foglie: piccole macchie a mandorla con la nervatura a penna.
function drawLeaves(canvas, fp, style, rng, seed) {
  const count = Math.max(6, Math.round((fp.rx * fp.ry) / 190));
  for (let i = 0; i < count; i++) {
    const p = randomPointInEllipse(rng, fp.rx * 0.88, fp.ry * 0.88);
    const rot = rng() * Math.PI, lx = 9 + rng() * 6, ly = 3.6 + rng() * 2.4;
    const leaf = organicEllipse(fp.x + p.x, fp.y + p.y, lx, ly, rot, seed + i, 0.16, 14);
    fillWash(canvas, leaf, rng() > 0.6 ? pigmentDeep(style) : pigment(style), { alpha: 0.5, seed: seed + i, bleed: 2, edge: 0.6 });
    drawInk(canvas, [[fp.x + p.x - Math.cos(rot) * lx * 0.8, fp.y + p.y - Math.sin(rot) * lx * 0.8], [fp.x + p.x + Math.cos(rot) * lx * 0.8, fp.y + p.y + Math.sin(rot) * lx * 0.8]],
      INK, { width: 0.9, alpha: 0.4, seed: seed + i, breaks: 0.2 });
  }
}

// Crema o quenelle: velatura morbida con la carta lasciata bianca sul colmo, contorno solo dove
// serve - e cosi che si dipinge un volume lucido ad acquerello, per sottrazione.
function drawCream(canvas, fp, style, rng, seed) {
  const rot = -0.18, rx = fp.rx * 0.76, ry = fp.ry * 0.82, cy0 = fp.y - fp.h * 0.3;
  const place = (lx, ly) => [fp.x + lx * Math.cos(rot) - ly * Math.sin(rot), cy0 + lx * Math.sin(rot) + ly * Math.cos(rot)];
  const half = (u) => Math.pow(Math.max(0, 1 - u * u), 0.66);
  const top = [], bottom = [];
  for (let i = 0; i <= 18; i++) {
    const u = -1 + (2 * i) / 18;
    const n = 1 + (valueNoise(i, 11, seed) - 0.5) * 0.1;
    top.push(place(u * rx, -half(u) * ry * 0.8 * n));
    bottom.push(place(u * rx, half(u) * ry * n));
  }
  const shape = [...top, ...bottom.slice().reverse()];
  fillWash(canvas, shape, pigment(style), { alpha: 0.44, seed, edge: 0.75 });
  const hl = place(-rx * 0.24, -ry * 0.26);
  fillEllipse(canvas, hl[0], hl[1], rx * 0.26, ry * 0.16, [...PAPER, 130], rot); // colmo lasciato chiaro
  drawInk(canvas, bottom, INK, { width: 1.4, alpha: 0.5, seed, breaks: 0.3 });
  drawInk(canvas, top, INK, { width: 1.1, alpha: 0.32, seed: seed + 1, breaks: 0.45 });
}

// Molluschi: gusci a ventaglio, velatura e costolature a penna.
function drawShell(canvas, fp, style, rng, seed) {
  const count = Math.max(3, Math.round(fp.rx / 22));
  const shells = [];
  for (let i = 0; i < count; i++) {
    const p = randomPointInEllipse(rng, fp.rx * 0.72, fp.ry * 0.72);
    shells.push({ x: fp.x + p.x, y: fp.y + p.y, s: 13 + rng() * 6, rot: (rng() - 0.5) * 1.1 });
  }
  shells.sort((a, b) => a.y - b.y);
  shells.forEach((sh, i) => {
    const shape = organicEllipse(sh.x, sh.y, sh.s, sh.s * 0.66, sh.rot, seed + i, 0.12, 16);
    fillWash(canvas, shape, pigment(style), { alpha: 0.45, seed: seed + i, edge: 0.7 });
    drawInk(canvas, shape, INK, { width: 1.3, alpha: 0.55, seed: seed + i, closed: true, breaks: 0.2 });
    for (let k = -2; k <= 2; k++) {
      const a = sh.rot + Math.PI / 2 + k * 0.34;
      drawInk(canvas, [[sh.x, sh.y], [sh.x + Math.cos(a) * sh.s * 0.82, sh.y + Math.sin(a) * sh.s * 0.55]], INK, { width: 0.9, alpha: 0.35, seed: seed + i + k, breaks: 0.25 });
    }
  });
}

// Filo d'olio o riduzione: un tratto sottile e ondulato, appena carico di colore.
function drawDrizzle(canvas, fp, style, rng, seed) {
  const pts = [];
  for (let i = 0; i <= 22; i++) {
    const t = i / 22;
    pts.push({ x: fp.x + (t - 0.5) * fp.rx * 1.8, y: fp.y - fp.h * 0.2 + Math.sin(t * Math.PI * 2.2) * fp.ry * 0.5 });
  }
  fillWash(canvas, ribbonPolygon(pts, () => 6), pigment(style), { alpha: 0.42, seed, edge: 0.6, bleed: 2.5 });
}

// Resa neutra: una macchia morbida con il contorno appena accennato.
function drawBlob(canvas, fp, style, rng, seed) {
  const shape = organicEllipse(fp.x, fp.y - fp.h * 0.25, fp.rx * 0.8, fp.ry * 0.86, 0, seed, 0.12);
  fillWash(canvas, shape, pigment(style), { alpha: 0.45, seed, edge: 0.7 });
  drawInk(canvas, shape, INK, { width: 1.3, alpha: 0.45, seed, closed: true, breaks: 0.3 });
}

const GRAIN_RENDERERS = {
  strands: drawStrands, granules: drawGranules, dice: drawDice, wedge: drawWedge,
  fillet: drawFillet, slab: drawSlab, leaves: drawLeaves, cream: drawCream,
  shell: drawShell, drizzle: drawDrizzle, dome: drawBlob,
};
const SOLID_GRAINS = new Set(['wedge', 'fillet', 'slab', 'cream']);

function drawElement(canvas, item, x, y, scale) {
  // D-061: la grana e il colore dichiarati dal laboratorio valgono dove la mappa locale non
  // riconosce l'ingrediente; dove lo riconosce, vince la mappa (vedi core/foodStyle.mjs).
  const style = styleFor(item.element, { grain: item.grain, color: item.color });
  const seed = hashString(`${item.element}|${item.position}|${item.shape}`) % 100000;
  const rng = makeRng(seed);
  const base = FOOTPRINT[item.shape] || FOOTPRINT.mucchio;
  const fp = { x, y, rx: base.rx * scale, ry: base.ry * scale, h: base.h * scale };
  const render = GRAIN_RENDERERS[style.grain] || drawBlob;

  // ombra portata: una velatura grigia appena accennata sotto l'elemento, come in un disegno
  fillWash(canvas, organicEllipse(x + 6, y + fp.ry * 0.42, fp.rx * 0.78, fp.ry * 0.3, 0, seed + 77, 0.2, 18),
    SHADOW_WASH, { alpha: 0.11, seed: seed + 77, edge: 0.2, bleed: 6 });

  if (item.shape === 'ventaglio' && SOLID_GRAINS.has(style.grain)) {
    const piece = { ...fp, rx: fp.rx * 0.44, ry: fp.ry * 0.66 };
    [-1, 0, 1].forEach((k) => render(canvas, { ...piece, x: x + k * fp.rx * 0.34, y: y + k * 4 }, style, rng, seed + k * 17, -0.18 + k * 0.16));
    return;
  }
  render(canvas, fp, style, rng, seed);
}

// --- carta, piatto, salsa -------------------------------------------------------------------

// Carta da acquerello: tinta calda, grana fine e qualche zona appena piu assorbente.
function drawPaper(canvas) {
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      const fibre = valueNoise(x * 0.55, y * 0.55, 31);
      const shade = Math.round(247 + fibre * 9);
      const tint = [shade, shade - 2, shade - 6];
      paintMultiply(canvas, x, y, tint, 0.5);
      paintMultiply(canvas, x + 1, y, tint, 0.5);
      paintMultiply(canvas, x, y + 1, tint, 0.5);
      paintMultiply(canvas, x + 1, y + 1, tint, 0.5);
    }
  }
}

function drawPlate(canvas) {
  const outer = organicEllipse(CX, CY, PLATE_RX, PLATE_RY, 0, 12, 0.02, 46);
  const inner = organicEllipse(CX, CY + 6, PLATE_RX * 0.72, PLATE_RY * 0.72, 0, 19, 0.03, 40);
  // ombra del piatto sul foglio: una velatura, non un gradiente scuro
  fillWash(canvas, organicEllipse(CX + 14, CY + PLATE_RY * 0.34, PLATE_RX * 0.92, PLATE_RY * 0.66, 0, 23, 0.05, 34),
    SHADOW_WASH, { alpha: 0.09, seed: 23, edge: 0.15, bleed: 14 });
  fillWash(canvas, outer, PLATE_WASH, { alpha: 0.09, seed: 41, edge: 0.9, bleed: 4 });
  fillWash(canvas, inner, PLATE_WASH, { alpha: 0.05, seed: 47, edge: 0.7, bleed: 3 });
  drawInk(canvas, outer, INK, { width: 1.5, alpha: 0.42, seed: 12, closed: true, breaks: 0.1, wobble: 1.3 });
  drawInk(canvas, inner, INK, { width: 1.1, alpha: 0.3, seed: 19, closed: true, breaks: 0.3, wobble: 1.2 });
}

function drawSauce(canvas, style, sauce) {
  const color = sauce.dark;
  switch (style) {
    case 'specchio': {
      const pool = organicEllipse(CX, CY + 22, PLATE_RX * 0.5, PLATE_RY * 0.38, 0, 61, 0.12, 34);
      fillWash(canvas, pool, color, { alpha: 0.2, seed: 61, edge: 0.95, bleed: 6, dry: 0.995, grain: 0.3 });
      return;
    }
    case 'velo':
      fillWash(canvas, organicEllipse(CX, CY + 18, PLATE_RX * 0.58, PLATE_RY * 0.46, 0, 67, 0.14, 34), color, { alpha: 0.12, seed: 67, edge: 0.5, bleed: 7, dry: 0.995, grain: 0.3 });
      return;
    case 'virgola': {
      const pts = [];
      for (let i = 0; i <= 22; i++) {
        const t = i / 22;
        const a = Math.PI * (0.95 - t * 1.45);
        pts.push({ x: CX + Math.cos(a) * PLATE_RX * 0.36 - 10, y: CY + 20 + Math.sin(a) * PLATE_RY * 0.38 });
      }
      fillWash(canvas, ribbonPolygon(pts, (t) => 32 * (1 - t) + 7), color, { alpha: 0.26, seed: 71, edge: 0.9, bleed: 4, dry: 0.99, grain: 0.3 });
      return;
    }
    case 'punti':
      [[-96, -30], [-50, 30], [16, -44], [86, 18], [4, 56], [-18, -4]].forEach(([dx, dy], i) => {
        const r = 8 + (i % 3) * 2.5;
        fillWash(canvas, organicEllipse(CX + dx, CY + 14 + dy, r, r * 0.78, 0, 80 + i, 0.18, 14), color, { alpha: 0.42, seed: 80 + i, edge: 0.9, bleed: 2.5 });
      });
      return;
    case 'nessuna':
    default: return;
  }
}


// Cifre scritte a mano: tratti, non una matrice di pixel. Lo schema ammette al massimo cinque
// elementi (clockLayout, minItems 2 / maxItems 5), quindi bastano le prime cifre; per qualunque
// altro numero resta il font a matrice come ripiego.
const HAND_DIGITS = {
  1: [[[0.32, 0.26], [0.52, 0.08], [0.52, 0.94]]],
  2: [[[0.18, 0.3], [0.32, 0.08], [0.64, 0.12], [0.7, 0.4], [0.24, 0.9], [0.8, 0.88]]],
  3: [[[0.2, 0.16], [0.58, 0.07], [0.74, 0.3], [0.44, 0.5], [0.76, 0.64], [0.6, 0.92], [0.22, 0.86]]],
  4: [[[0.66, 0.06], [0.16, 0.64], [0.86, 0.62]], [[0.62, 0.36], [0.64, 0.94]]],
  5: [[[0.74, 0.1], [0.3, 0.12], [0.26, 0.46], [0.56, 0.4], [0.76, 0.6], [0.6, 0.9], [0.24, 0.86]]],
  6: [[[0.7, 0.1], [0.36, 0.24], [0.26, 0.66], [0.5, 0.9], [0.72, 0.7], [0.5, 0.5], [0.28, 0.6]]],
  7: [[[0.2, 0.12], [0.78, 0.1], [0.44, 0.94]]],
  8: [[[0.5, 0.5], [0.26, 0.34], [0.44, 0.08], [0.7, 0.26], [0.5, 0.5], [0.28, 0.7], [0.48, 0.92], [0.74, 0.72], [0.5, 0.5]]],
  9: [[[0.7, 0.4], [0.42, 0.5], [0.3, 0.26], [0.56, 0.08], [0.72, 0.3], [0.64, 0.7], [0.36, 0.9]]],
};

function drawHandNumber(canvas, cx, cy, value, size, seed) {
  const strokes = HAND_DIGITS[value];
  if (!strokes) { drawNumberBadge(canvas, cx, cy, value, { r: 12.5, scale: 2, fill: [...PAPER, 235], stroke: [...PAPER, 0], color: [...INK, 235] }); return; }
  strokes.forEach((stroke, i) => {
    const pts = stroke.map(([x, y]) => [cx + (x - 0.5) * size * 0.62, cy + (y - 0.5) * size]);
    drawInk(canvas, pts, INK, { width: 1.9, alpha: 0.72, seed: seed + i * 7, wobble: 0.7, breaks: 0.04 });
  });
}

// --- numerazione ----------------------------------------------------------------------------

// I numeri stanno fuori dal piatto, collegati all'elemento da un tratto leggero di matita: sono
// le annotazioni a margine di un disegno, non etichette stampate sopra al cibo.
function badgePositions(items) {
  const used = [];
  return items.map((it, idx) => {
    let a = angleFor(it.position);
    if (a === null) a = -Math.PI / 2 - 0.5;
    let guard = 0;
    while (used.some(u => Math.abs(Math.atan2(Math.sin(a - u), Math.cos(a - u))) < 0.38) && guard++ < 16) a += 0.4;
    used.push(a);
    return { idx, x: CX + Math.cos(a) * PLATE_RX * 1.07, y: CY + Math.sin(a) * PLATE_RY * 1.17 };
  });
}

// Carta e piatto vuoto non dipendono dalla ricetta: si calcolano una volta sola e si ricopiano.
let emptyPlateCache = null;

function buildEmptyPlate() {
  const canvas = createCanvas(W, H, [...PAPER, 255]);
  drawPaper(canvas);
  drawPlate(canvas);
  return canvas;
}

export function renderPlating(plating) {
  if (!emptyPlateCache) emptyPlateCache = buildEmptyPlate();
  const canvas = { width: W, height: H, pixels: Buffer.from(emptyPlateCache.pixels) };

  const items = (plating?.clockLayout || []).filter(Boolean);
  drawSauce(canvas, plating?.sauceStyle, sauceColorFor(items));

  // gli elementi sul fondo del piatto vengono dipinti per primi e leggermente piu piccoli,
  // quelli in primo piano per ultimi: le velature si sovrappongono nell'ordine giusto
  const placed = items.map((item, idx) => ({ item, idx, ...positionFor(item.position) }));
  placed.sort((a, b) => a.y - b.y);
  for (const p of placed) {
    const depth = (p.y - (CY - LAYOUT_RY)) / (2 * LAYOUT_RY);
    drawElement(canvas, p.item, p.x, p.y, 0.9 + depth * 0.2);
  }

  for (const badge of badgePositions(items)) {
    const target = positionFor(items[badge.idx].position);
    drawInk(canvas, [[badge.x, badge.y], [target.x, target.y]], PENCIL, { width: 1, alpha: 0.42, seed: 300 + badge.idx, breaks: 0.2, wobble: 1.4 });
    fillEllipse(canvas, badge.x, badge.y, 15, 15, [...PAPER, 225]);
    drawInk(canvas, organicEllipse(badge.x, badge.y, 15, 15, 0, 400 + badge.idx, 0.09, 20), INK, { width: 1.3, alpha: 0.5, seed: 400 + badge.idx, closed: true, breaks: 0.14 });
    drawHandNumber(canvas, badge.x, badge.y, badge.idx + 1, 17, 400 + badge.idx);
  }
  return encodePNG(canvas);
}

// Testo strutturato leggibile per il messaggio Telegram (D-048: "entrambi" - immagine e testo).
// D-059: la lista e numerata negli stessi numeri annotati sul disegno, cosi le due cose si
// leggono insieme invece che come due elenchi scollegati.
export function platingText(plating) {
  if (!plating) return '';
  const posLabel = (p) => (p === 'centro' ? 'al centro' : `ore ${p}`);
  const layout = (plating.clockLayout || []).map((i, idx) => `${idx + 1}. ${i.element} — ${posLabel(i.position)} (${i.shape})`).join('\n');
  const sauceLabel = { specchio: 'a specchio alla base', virgola: 'a virgola', punti: 'a punti', velo: 'a velo leggero', nessuna: 'assente' }[plating.sauceStyle] || plating.sauceStyle;
  return `🍽 **Impiattamento** (i numeri corrispondono a quelli nell'immagine)\n${layout}\nSalsa: ${sauceLabel}\nTemperatura: ${plating.temperature}\nConsistenze da proteggere: ${plating.textureNote}\nFinitura: ${plating.finish}`;
}
