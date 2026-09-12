import zlib from 'node:zlib';

// D-048: encoder PNG minimale, solo moduli nativi di Node (zlib per la compressione IDAT,
// CRC32 calcolato a mano). Nessuna dipendenza esterna, coerente con la convenzione del progetto
// (package.json senza "dependencies", cfr. D-047 sulla scelta di non usare node:sqlite).
// Riceve un buffer RGBA già disegnato pixel per pixel e produce un file PNG completo.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// canvas: superficie di disegno RGBA in memoria, origine in alto a sinistra.
export function createCanvas(width, height, bg = [255, 255, 255, 255]) {
  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) pixels.set(bg, i * 4);
  return { width, height, pixels };
}

function setPixel(canvas, x, y, rgba) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
  const i = (y * canvas.width + x) * 4;
  const [r, g, b, a = 255] = rgba;
  if (a >= 255) { canvas.pixels[i] = r; canvas.pixels[i + 1] = g; canvas.pixels[i + 2] = b; canvas.pixels[i + 3] = 255; return; }
  // alpha blending semplice sopra lo sfondo esistente, per bordi anti-aliasati leggeri
  const ia = a / 255;
  canvas.pixels[i] = Math.round(r * ia + canvas.pixels[i] * (1 - ia));
  canvas.pixels[i + 1] = Math.round(g * ia + canvas.pixels[i + 1] * (1 - ia));
  canvas.pixels[i + 2] = Math.round(b * ia + canvas.pixels[i + 2] * (1 - ia));
  canvas.pixels[i + 3] = 255;
}

export function fillCircle(canvas, cx, cy, r, rgba) {
  const r2 = r * r;
  for (let y = Math.floor(cy - r) - 1; y <= Math.ceil(cy + r) + 1; y++) {
    for (let x = Math.floor(cx - r) - 1; x <= Math.ceil(cx + r) + 1; x++) {
      const d2 = (x - cx) ** 2 + (y - cy) ** 2;
      if (d2 <= r2) setPixel(canvas, x, y, rgba);
      else if (d2 <= (r + 1) ** 2) setPixel(canvas, x, y, [...rgba.slice(0, 3), Math.round((rgba[3] ?? 255) * Math.max(0, 1 - (Math.sqrt(d2) - r)))]);
    }
  }
}

export function strokeCircle(canvas, cx, cy, r, width, rgba) {
  const outer = r + width / 2, inner = r - width / 2;
  const o2 = outer * outer, i2 = Math.max(0, inner) ** 2;
  for (let y = Math.floor(cy - outer) - 1; y <= Math.ceil(cy + outer) + 1; y++) {
    for (let x = Math.floor(cx - outer) - 1; x <= Math.ceil(cx + outer) + 1; x++) {
      const d2 = (x - cx) ** 2 + (y - cy) ** 2;
      if (d2 <= o2 && d2 >= i2) setPixel(canvas, x, y, rgba);
    }
  }
}

export function fillEllipse(canvas, cx, cy, rx, ry, rgba, rotationRad = 0) {
  const cos = Math.cos(-rotationRad), sin = Math.sin(-rotationRad);
  const span = Math.max(rx, ry);
  for (let y = Math.floor(cy - span) - 1; y <= Math.ceil(cy + span) + 1; y++) {
    for (let x = Math.floor(cx - span) - 1; x <= Math.ceil(cx + span) + 1; x++) {
      const dx = x - cx, dy = y - cy;
      const rxr = dx * cos - dy * sin, ryr = dx * sin + dy * cos;
      if ((rxr / rx) ** 2 + (ryr / ry) ** 2 <= 1) setPixel(canvas, x, y, rgba);
    }
  }
}

export function drawLine(canvas, x0, y0, x1, y1, width, rgba) {
  const dx = x1 - x0, dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const steps = Math.ceil(len * 2);
  const nx = -dy / len, ny = dx / len; // normale per lo spessore
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const x = x0 + dx * t, y = y0 + dy * t;
    for (let w = -width / 2; w <= width / 2; w += 0.5) setPixel(canvas, x + nx * w, y + ny * w, rgba);
  }
}

export function fillDot(canvas, cx, cy, r, rgba) { fillCircle(canvas, cx, cy, r, rgba); }

// D-059: il rendering precedente era troppo piatto e poco leggibile (piatto quasi invisibile su
// sfondo bianco, elementi tutti dello stesso colore uniforme senza volume). Le funzioni seguenti
// restano puro JS senza dipendenze (stessa convenzione di questo file): gradienti a interpolazione
// lineare, ombre morbide simulate con passate concentriche a alpha decrescente, contorni ellittici
// e un piccolo font bitmap per numerare gli elementi sull'immagine e collegarli alla didascalia.

function lerpColor(a, b, t) {
  return [0, 1, 2, 3].map(i => Math.round((a[i] ?? 255) + ((b[i] ?? 255) - (a[i] ?? 255)) * t));
}

// Gradiente radiale semplice: colorCenter al centro, colorEdge al bordo. Usato per il piatto
// (profondità della ceramica) e per pozze di salsa che sfumano verso i bordi.
export function fillCircleGradient(canvas, cx, cy, r, colorCenter, colorEdge) {
  const r2 = r * r;
  for (let y = Math.floor(cy - r) - 1; y <= Math.ceil(cy + r) + 1; y++) {
    for (let x = Math.floor(cx - r) - 1; x <= Math.ceil(cx + r) + 1; x++) {
      const d2 = (x - cx) ** 2 + (y - cy) ** 2;
      if (d2 > (r + 1) ** 2) continue;
      const d = Math.sqrt(d2);
      const t = Math.min(1, d / r);
      const rgba = lerpColor(colorCenter, colorEdge, t);
      if (d2 <= r2) setPixel(canvas, x, y, rgba);
      else setPixel(canvas, x, y, [...rgba.slice(0, 3), Math.round((rgba[3] ?? 255) * Math.max(0, 1 - (d - r)))]);
    }
  }
}

// Gradiente direzionale dentro un'ellisse, come se una luce arrivasse da lightAngle: simula il
// volume di un elemento appoggiato sul piatto (quenelle, fetta, mucchio...) senza fotorealismo.
export function fillEllipseGradient(canvas, cx, cy, rx, ry, colorLight, colorDark, rotationRad = 0, lightAngle = -Math.PI * 0.75) {
  const cos = Math.cos(-rotationRad), sin = Math.sin(-rotationRad);
  const span = Math.max(rx, ry);
  const lx = Math.cos(lightAngle), ly = Math.sin(lightAngle);
  for (let y = Math.floor(cy - span) - 1; y <= Math.ceil(cy + span) + 1; y++) {
    for (let x = Math.floor(cx - span) - 1; x <= Math.ceil(cx + span) + 1; x++) {
      const dx = x - cx, dy = y - cy;
      const rxr = dx * cos - dy * sin, ryr = dx * sin + dy * cos;
      const nx = rxr / rx, ny = ryr / ry;
      if (nx * nx + ny * ny > 1) continue;
      const proj = (nx * -lx + ny * -ly);
      const t = Math.min(1, Math.max(0, (proj + 1) / 2));
      setPixel(canvas, x, y, lerpColor(colorLight, colorDark, t));
    }
  }
}

// Ombra morbida sotto un elemento: alcune ellissi concentriche crescenti a alpha decrescente,
// per una sfumatura approssimata senza un vero blur (nessuna libreria di image processing).
export function fillEllipseSoft(canvas, cx, cy, rx, ry, rgb, maxAlpha, rotationRad = 0) {
  const layers = 7;
  for (let i = layers; i >= 1; i--) {
    const scale = 1 + (i / layers) * 0.35;
    const alpha = Math.round((maxAlpha / layers) * (layers - i + 1) * 0.42);
    fillEllipse(canvas, cx, cy, rx * scale, ry * scale, [...rgb, alpha], rotationRad);
  }
}

export function strokeEllipse(canvas, cx, cy, rx, ry, width, rgba, rotationRad = 0) {
  const cos = Math.cos(-rotationRad), sin = Math.sin(-rotationRad);
  const span = Math.max(rx, ry) + width;
  const rxo = rx + width / 2, ryo = ry + width / 2;
  const rxi = Math.max(0.01, rx - width / 2), ryi = Math.max(0.01, ry - width / 2);
  for (let y = Math.floor(cy - span) - 1; y <= Math.ceil(cy + span) + 1; y++) {
    for (let x = Math.floor(cx - span) - 1; x <= Math.ceil(cx + span) + 1; x++) {
      const dx = x - cx, dy = y - cy;
      const rxr = dx * cos - dy * sin, ryr = dx * sin + dy * cos;
      const outer = (rxr / rxo) ** 2 + (ryr / ryo) ** 2;
      const inner = (rxr / rxi) ** 2 + (ryr / ryi) ** 2;
      if (outer <= 1 && inner >= 1) setPixel(canvas, x, y, rgba);
    }
  }
}

// Font bitmap 3x5 per le sole cifre 0-9: basta a numerare i 2-5 elementi del piatto (schema
// clockLayout) e a farli corrispondere alla lista numerata nella didascalia (platingText).
const DIGIT_FONT = {
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '001', '001', '001'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
};

export function drawDigit(canvas, x, y, digit, scale, rgba) {
  const glyph = DIGIT_FONT[digit];
  if (!glyph) return;
  for (let row = 0; row < glyph.length; row++) {
    for (let col = 0; col < glyph[row].length; col++) {
      if (glyph[row][col] !== '1') continue;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) setPixel(canvas, x + col * scale + dx, y + row * scale + dy, rgba);
      }
    }
  }
}

// D-060: primitive per un'illustrazione (non più uno schema geometrico): ellissi con
// ombreggiatura sferica e punto luce, poligoni con antialias, rumore deterministico per le
// texture degli ingredienti, vignettatura del piano. Sempre puro JS senza dipendenze.

export { lerpColor };

// Accesso diretto a un pixel con blending alpha: serve alle texture (granelli, venature) che
// disegnano tanti punti minuscoli senza passare da una primitiva geometrica.
export function paint(canvas, x, y, rgba) { setPixel(canvas, x, y, rgba); }

// Generatore pseudocasuale deterministico (mulberry32): le texture devono essere sempre identiche
// per lo stesso piatto — D-048 richiede che la stessa ricetta produca sempre la stessa immagine.
export function makeRng(seed) {
  let a = (seed >>> 0) || 1;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < String(text).length; i++) { h ^= String(text).charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Ellisse con ombreggiatura "sferica": il colore chiaro sta nel punto luce (hx,hy, in coordinate
// normalizzate -1..1 dentro l'ellisse), quello scuro sul lato opposto, con un ulteriore
// scurimento sul bordo che dà l'impressione di curvatura. Bordi antialiasati.
export function fillEllipseShaded(canvas, cx, cy, rx, ry, light, dark, rotationRad = 0, hx = -0.45, hy = -0.5) {
  const cos = Math.cos(-rotationRad), sin = Math.sin(-rotationRad);
  const span = Math.max(rx, ry) + 2;
  const feather = Math.max(1, Math.min(rx, ry));
  for (let y = Math.floor(cy - span); y <= Math.ceil(cy + span); y++) {
    for (let x = Math.floor(cx - span); x <= Math.ceil(cx + span); x++) {
      const dx = x - cx, dy = y - cy;
      const rxr = dx * cos - dy * sin, ryr = dx * sin + dy * cos;
      const nx = rxr / rx, ny = ryr / ry;
      const d = Math.sqrt(nx * nx + ny * ny);
      if (d > 1 + 1.5 / feather) continue;
      const dh = Math.min(1, Math.hypot(nx - hx, ny - hy) / 1.7);
      let color = lerpColor(light, dark, dh);
      if (d > 0.72) { // scurimento di bordo: fa leggere il volume invece di una macchia piatta
        const edge = Math.min(1, (d - 0.72) / 0.28);
        color = lerpColor(color, [Math.round(dark[0] * 0.72), Math.round(dark[1] * 0.72), Math.round(dark[2] * 0.72), color[3]], edge * 0.55);
      }
      const alpha = d <= 1 ? (color[3] ?? 255) : (color[3] ?? 255) * Math.max(0, 1 - (d - 1) * feather);
      setPixel(canvas, x, y, [color[0], color[1], color[2], Math.round(alpha)]);
    }
  }
}

function pointInPolygon(px, py, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Poligono pieno con antialias per supersampling 2x2: serve alle forme che non sono ellissi
// (spicchi di agrume, dadi di pomodoro, gusci).
export function fillPolygon(canvas, pts, rgba) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of pts) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  const offsets = [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]];
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
      let hits = 0;
      for (const [ox, oy] of offsets) if (pointInPolygon(x + ox, y + oy, pts)) hits++;
      if (!hits) continue;
      setPixel(canvas, x, y, [rgba[0], rgba[1], rgba[2], Math.round((rgba[3] ?? 255) * hits / 4)]);
    }
  }
}

// Ombra morbida calcolata per pixel: sostituisce le passate concentriche di fillEllipseSoft, che
// lasciavano anelli visibili (bande) invece di una sfumatura continua.
export function fillEllipseShadowSmooth(canvas, cx, cy, rx, ry, rgb, maxAlpha, softness = 0.55) {
  for (let y = Math.floor(cy - ry) - 1; y <= Math.ceil(cy + ry) + 1; y++) {
    for (let x = Math.floor(cx - rx) - 1; x <= Math.ceil(cx + rx) + 1; x++) {
      const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (d >= 1) continue;
      const t = Math.min(1, (1 - d) / softness);
      setPixel(canvas, x, y, [...rgb, Math.round(maxAlpha * t * t)]);
    }
  }
}

// Ombra interna lungo il bordo di un'ellisse, più marcata dal lato della luce: è ciò che fa
// leggere la conca del piatto come incassata invece che disegnata.
export function fillEllipseInnerShadow(canvas, cx, cy, rx, ry, width, rgb, maxAlpha, dirX = -0.7, dirY = -0.7) {
  for (let y = Math.floor(cy - ry) - 1; y <= Math.ceil(cy + ry) + 1; y++) {
    for (let x = Math.floor(cx - rx) - 1; x <= Math.ceil(cx + rx) + 1; x++) {
      const nx = (x - cx) / rx, ny = (y - cy) / ry;
      const d = Math.hypot(nx, ny);
      if (d >= 1) continue;
      const depth = Math.max(0, 1 - (1 - d) / (width / Math.min(rx, ry)));
      if (depth <= 0) continue;
      const facing = Math.max(0, (nx * dirX + ny * dirY) / (d || 1));
      setPixel(canvas, x, y, [...rgb, Math.round(maxAlpha * depth * depth * (0.35 + 0.65 * facing))]);
    }
  }
}

// Nastro continuo lungo una polilinea, calcolato come campo di distanza: una sola passata di
// alpha per pixel, quindi niente strisce dove i segmenti si sovrappongono (difetto della
// versione a segmenti sovrapposti).
export function fillRibbon(canvas, points, widthAt, colorAt, alpha = 255) {
  if (points.length < 2) return;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, maxW = 0;
  for (let i = 0; i < points.length; i++) {
    const w = widthAt(i / (points.length - 1));
    maxW = Math.max(maxW, w);
    minX = Math.min(minX, points[i].x); maxX = Math.max(maxX, points[i].x);
    minY = Math.min(minY, points[i].y); maxY = Math.max(maxY, points[i].y);
  }
  const pad = maxW / 2 + 2;
  for (let y = Math.floor(minY - pad); y <= Math.ceil(maxY + pad); y++) {
    for (let x = Math.floor(minX - pad); x <= Math.ceil(maxX + pad); x++) {
      let best = Infinity, bestT = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i], b = points[i + 1];
        const vx = b.x - a.x, vy = b.y - a.y;
        const len2 = vx * vx + vy * vy || 1;
        let t = ((x - a.x) * vx + (y - a.y) * vy) / len2;
        t = Math.max(0, Math.min(1, t));
        const dx = x - (a.x + vx * t), dy = y - (a.y + vy * t);
        const d = Math.hypot(dx, dy);
        if (d < best) { best = d; bestT = (i + t) / (points.length - 1); }
      }
      const half = widthAt(bestT) / 2;
      if (best > half + 1) continue;
      const cov = Math.min(1, Math.max(0, half + 0.5 - best));
      const color = colorAt(bestT, best / (half || 1));
      setPixel(canvas, x, y, [color[0], color[1], color[2], Math.round((color[3] ?? alpha) * cov)]);
    }
  }
}

// Poligono pieno con ombreggiatura di volume: il colore chiaro sta verso il punto luce e il
// bordo si scurisce man mano che ci si avvicina al contorno. Serve per le forme organiche
// (tranci, spicchi, dadi, gusci) che un'ellisse non sa rappresentare.
export function fillPolygonShaded(canvas, pts, light, dark, opts = {}) {
  const { hx = -0.45, hy = -0.55, rim = 0.45, alpha = 255 } = opts;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, cx = 0, cy = 0;
  for (const [x, y] of pts) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    cx += x / pts.length; cy += y / pts.length;
  }
  const halfW = (maxX - minX) / 2 || 1, halfH = (maxY - minY) / 2 || 1;
  const edgeScale = Math.min(halfW, halfH);
  const offsets = [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]];
  for (let y = Math.floor(minY) - 1; y <= Math.ceil(maxY) + 1; y++) {
    for (let x = Math.floor(minX) - 1; x <= Math.ceil(maxX) + 1; x++) {
      let hits = 0;
      for (const [ox, oy] of offsets) if (pointInPolygon(x + ox, y + oy, pts)) hits++;
      if (!hits) continue;
      let edgeDist = Infinity;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [ax, ay] = pts[j], [bx, by] = pts[i];
        const vx = bx - ax, vy = by - ay;
        const len2 = vx * vx + vy * vy || 1;
        let t = ((x - ax) * vx + (y - ay) * vy) / len2;
        t = Math.max(0, Math.min(1, t));
        edgeDist = Math.min(edgeDist, Math.hypot(x - (ax + vx * t), y - (ay + vy * t)));
      }
      const nx = (x - cx) / halfW, ny = (y - cy) / halfH;
      const dh = Math.min(1, Math.hypot(nx - hx, ny - hy) / 1.8);
      let color = lerpColor(light, dark, dh);
      const rimT = Math.max(0, 1 - edgeDist / (edgeScale * rim));
      if (rimT > 0) color = lerpColor(color, [Math.round(dark[0] * 0.7), Math.round(dark[1] * 0.7), Math.round(dark[2] * 0.7), color[3]], rimT * rimT * 0.6);
      setPixel(canvas, x, y, [color[0], color[1], color[2], Math.round((color[3] ?? alpha) * hits / 4)]);
    }
  }
}

// Arco luminoso continuo sul bordo del piatto (riflesso della luce sulla ceramica): con i
// pallini sovrapposti si vedeva una linea tratteggiata.
export function fillArcGlow(canvas, cx, cy, rx, ry, thickness, a0, a1, rgb, maxAlpha) {
  for (let y = Math.floor(cy - ry - thickness); y <= Math.ceil(cy + ry + thickness); y++) {
    for (let x = Math.floor(cx - rx - thickness); x <= Math.ceil(cx + rx + thickness); x++) {
      const nx = (x - cx) / rx, ny = (y - cy) / ry;
      const d = Math.hypot(nx, ny);
      const radial = Math.abs(d - 1) * Math.min(rx, ry);
      if (radial > thickness) continue;
      let a = Math.atan2(ny, nx);
      let da = Math.atan2(Math.sin(a - (a0 + a1) / 2), Math.cos(a - (a0 + a1) / 2));
      const halfSpan = Math.abs(Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0))) / 2 || 0.01;
      if (Math.abs(da) > halfSpan) continue;
      const fadeAngle = Math.cos((da / halfSpan) * Math.PI / 2);
      const fadeRadial = 1 - radial / thickness;
      setPixel(canvas, x, y, [...rgb, Math.round(maxAlpha * fadeAngle * fadeRadial * fadeRadial)]);
    }
  }
}

// Vignettatura del piano d'appoggio: scurisce gli angoli e concentra lo sguardo sul piatto,
// come una luce zenitale su un tavolo.
export function applyVignette(canvas, cx, cy, radius, strength, rgb = [40, 28, 16]) {
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const d = Math.hypot((x - cx) / radius, (y - cy) / radius);
      if (d <= 0.55) continue;
      const t = Math.min(1, (d - 0.55) / 0.9);
      setPixel(canvas, x, y, [...rgb, Math.round(strength * t * t)]);
    }
  }
}

// Etichetta numerata rotonda (es. "①") accanto a un elemento del piatto: stesso numero della
// riga corrispondente in platingText, cosi l'immagine si legge da sola senza dover indovinare
// quale forma astratta corrisponda a quale ingrediente.
export function drawNumberBadge(canvas, cx, cy, number, opts = {}) {
  const r = opts.r ?? 15;
  const scale = opts.scale ?? 2;
  fillCircle(canvas, cx, cy, r, opts.fill ?? [45, 38, 30, 255]);
  strokeCircle(canvas, cx, cy, r, 2, opts.stroke ?? [255, 255, 255, 230]);
  const str = String(number);
  const glyphW = 3 * scale, glyphH = 5 * scale, gap = scale;
  const totalW = str.length * glyphW + (str.length - 1) * gap;
  let sx = Math.round(cx - totalW / 2), sy = Math.round(cy - glyphH / 2);
  for (const ch of str) {
    drawDigit(canvas, sx, sy, ch, scale, opts.color ?? [255, 255, 255, 255]);
    sx += glyphW + gap;
  }
}

export function encodePNG(canvas) {
  const { width, height, pixels } = canvas;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filtro "none" per riga
    pixels.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const idat = zlib.deflateSync(raw);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// D-062: primitive per la resa ad acquerello. L'acquerello, a differenza di un rendering
// tridimensionale, è alla portata di un disegno calcolato da regole: vive di bordi irregolari,
// pigmento che si accumula ai margini della macchia, velature trasparenti che si moltiplicano
// dove si sovrappongono e grana della carta. Tutto ciò si ottiene con rumore deterministico e
// una diversa modalità di fusione dei pixel, sempre senza dipendenze esterne.

// Fusione a moltiplicazione: è il comportamento del pigmento trasparente su carta, dove due
// velature sovrapposte danno un colore più scuro. La fusione normale (sopra) invece copre, e
// faceva sembrare ogni elemento un adesivo appoggiato sul foglio.
export function paintMultiply(canvas, x, y, rgb, alpha) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
  const a = Math.max(0, Math.min(1, alpha));
  if (a <= 0) return;
  const i = (y * canvas.width + x) * 4;
  for (let c = 0; c < 3; c++) {
    const base = canvas.pixels[i + c];
    canvas.pixels[i + c] = Math.round(base * (1 - a) + (base * rgb[c]) / 255 * a);
  }
  canvas.pixels[i + 3] = 255;
}

function hash2(x, y, seed) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2246822519);
  h = h ^ (h >>> 13);
  h = Math.imul(h, 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Rumore continuo: serve a rendere irregolare la densità del pigmento e il bordo delle macchie.
// Deterministico a parità di seed, quindi la stessa ricetta produce sempre lo stesso disegno.
export function valueNoise(x, y, seed = 1) {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const n00 = hash2(x0, y0, seed), n10 = hash2(x0 + 1, y0, seed);
  const n01 = hash2(x0, y0 + 1, seed), n11 = hash2(x0 + 1, y0 + 1, seed);
  return (n00 * (1 - sx) + n10 * sx) * (1 - sy) + (n01 * (1 - sx) + n11 * sx) * sy;
}

function pointInPoly(px, py, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function distanceToOutline(px, py, pts) {
  let best = Infinity;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ax, ay] = pts[j], [bx, by] = pts[i];
    const vx = bx - ax, vy = by - ay;
    const len2 = vx * vx + vy * vy || 1;
    let t = ((px - ax) * vx + (py - ay) * vy) / len2;
    t = Math.max(0, Math.min(1, t));
    best = Math.min(best, Math.hypot(px - (ax + vx * t), py - (ay + vy * t)));
  }
  return best;
}

// Contorno irregolare di una forma: un'ellisse disegnata a mano non è mai perfetta. Il rumore è
// campionato lungo la circonferenza, così il profilo si richiude senza gradini.
export function organicEllipse(cx, cy, rx, ry, rotationRad = 0, seed = 1, amount = 0.08, steps = 30) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const n = valueNoise(Math.cos(a) * 2.5 + 4, Math.sin(a) * 2.5 + 4, seed);
    const r = 1 + (n - 0.5) * 2 * amount;
    const lx = Math.cos(a) * rx * r, ly = Math.sin(a) * ry * r;
    pts.push([cx + lx * Math.cos(rotationRad) - ly * Math.sin(rotationRad), cy + lx * Math.sin(rotationRad) + ly * Math.cos(rotationRad)]);
  }
  return pts;
}

// Velatura di colore dentro una forma: densità irregolare, pigmento che si accumula verso il
// bordo (è il tratto più riconoscibile dell'acquerello), piccole sbavature oltre il contorno e
// qualche zona quasi asciutta dove la carta resta scoperta.
export function fillWash(canvas, pts, rgb, opts = {}) {
  const { alpha = 0.5, seed = 1, grain = 0.4, edge = 0.55, bleed = 3.5, scale = 0.07, dry = 0.94 } = opts;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of pts) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const edgeWidth = Math.max(2.5, Math.min(9, Math.min(maxX - minX, maxY - minY) * 0.22));
  // D-063: la distanza esatta dal contorno costa quanto il numero di lati, per ogni pixel, ed e
  // il motivo per cui una scheda con tre piatti e le vignette arrivava a due secondi. Le righe
  // vengono quindi riempite per intervalli (una sola passata sui lati per riga) e la distanza
  // esatta si calcola solo dove serve davvero: vicino ai bordi, dove il pigmento si accumula, e
  // nella fascia di sbavatura appena fuori. All'interno il colore non dipende dalla distanza.
  const band = edgeWidth + bleed + 1;
  const y0 = Math.floor(minY - bleed) - 1, y1 = Math.ceil(maxY + bleed) + 1;
  const crossings = [];
  for (let y = y0; y <= y1; y++) {
    const py = y + 0.5;
    crossings.length = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > py) !== (yj > py)) crossings.push(((xj - xi) * (py - yi)) / (yj - yi) + xi);
    }
    crossings.sort((a, b) => a - b);
    const spanStart = crossings.length ? crossings[0] : null;
    const spanEnd = crossings.length ? crossings[crossings.length - 1] : null;
    const nearTop = py - minY < band || maxY - py < band;
    const from = spanStart === null ? Math.floor(minX - bleed) : Math.floor(spanStart - bleed) - 1;
    const to = spanEnd === null ? Math.ceil(maxX + bleed) : Math.ceil(spanEnd + bleed) + 1;
    for (let x = from; x <= to; x++) {
      const px = x + 0.5;
      let inside = false;
      for (let k = 0; k + 1 < crossings.length; k += 2) {
        if (px >= crossings[k] && px <= crossings[k + 1]) { inside = true; break; }
      }
      const nearEdge = spanStart === null || nearTop
        || px - spanStart < band || spanEnd - px < band;
      let d;
      if (nearEdge) {
        d = distanceToOutline(px, py, pts);
        if (!inside && d > bleed) continue;
      } else {
        if (!inside) continue;
        d = band; // ben dentro la macchia: la distanza esatta non cambierebbe il colore
      }
      const n = valueNoise(x * scale, y * scale, seed);
      const n2 = valueNoise(x * scale * 3.1 + 11, y * scale * 3.1 + 7, seed + 3);
      let a = alpha * ((1 - grain) + grain * 2 * n);
      if (inside) {
        a *= Math.min(1, d + 0.5); // antialias del bordo, ricavato dalla distanza
        const t = Math.max(0, 1 - d / edgeWidth);
        a *= 1 + edge * t * t; // accumulo di pigmento sul bordo della macchia
      } else {
        a *= 0.4 * Math.max(0, 1 - d / bleed) * (0.35 + 0.65 * n2); // sbavatura oltre il contorno
      }
      if (n2 > dry) a *= 0.2; // carta lasciata scoperta, effetto pennello asciutto
      paintMultiply(canvas, x, y, rgb, Math.min(0.9, a));
    }
  }
}

function stampDab(mask, box, cx, cy, r, alpha) {
  for (let y = Math.floor(cy - r) - 1; y <= Math.ceil(cy + r) + 1; y++) {
    for (let x = Math.floor(cx - r) - 1; x <= Math.ceil(cx + r) + 1; x++) {
      if (x < box.minX || y < box.minY || x > box.maxX || y > box.maxY) continue;
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d > r + 0.5) continue;
      const i = (y - box.minY) * box.w + (x - box.minX);
      mask[i] = Math.max(mask[i], alpha * Math.min(1, r + 0.5 - d));
    }
  }
}

// Tratto di matita o penna: spessore e intensità variabili, leggero tremolio, qualche
// interruzione. È la linea di contorno dei disegni fatti a mano, che non coincide mai
// perfettamente con il colore steso sotto.
export function drawInk(canvas, points, rgb, opts = {}) {
  drawInkBatch(canvas, [points], rgb, opts);
}

// D-063: piu tratti composti in una sola passata. La scrittura a mano e fatta di centinaia di
// tratti brevi: comporli uno per uno costerebbe un'allocazione di maschera ciascuno, e nei punti
// in cui due lettere si toccano il segno si annerirebbe. Una maschera sola per l'intera riga
// risolve entrambe le cose.
export function drawInkBatch(canvas, strokes, rgb, opts = {}) {
  const { width = 1.6, alpha = 0.7, seed = 1, wobble = 1.1, breaks = 0.1, closed = false, taper = false } = opts;
  const runs = strokes.map(points => (closed && points.length > 2 ? [...points, points[0]] : points)).filter(p => p && p.length >= 2);
  if (!runs.length) return;
  let gMinX = Infinity, gMaxX = -Infinity, gMinY = Infinity, gMaxY = -Infinity;
  for (const run of runs) for (const [x, y] of run) {
    gMinX = Math.min(gMinX, x); gMaxX = Math.max(gMaxX, x);
    gMinY = Math.min(gMinY, y); gMaxY = Math.max(gMaxY, y);
  }
  const pad = Math.ceil(width + wobble + 2);
  const box = { minX: Math.floor(gMinX) - pad, minY: Math.floor(gMinY) - pad, maxX: Math.ceil(gMaxX) + pad, maxY: Math.ceil(gMaxY) + pad };
  box.w = box.maxX - box.minX + 1; box.h = box.maxY - box.minY + 1;
  const mask = new Float32Array(box.w * box.h);
  runs.forEach((pts, runIndex) => stampRun(mask, box, pts, { width, alpha, seed: seed + runIndex * 13, wobble, breaks, taper }));
  for (let yy = 0; yy < box.h; yy++) {
    for (let xx = 0; xx < box.w; xx++) {
      const a = mask[yy * box.w + xx];
      if (a > 0.002) paintMultiply(canvas, box.minX + xx, box.minY + yy, rgb, a);
    }
  }
}

function stampRun(mask, box, pts, opts) {
  const { width, alpha, seed, wobble, breaks, taper } = opts;
  if (pts.length < 2) return;
  let total = 0;
  const lens = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    lens.push(l); total += l;
  }
  const steps = Math.max(6, Math.round(total / 1.1));
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    let target = t * total, i = 0;
    while (i < lens.length - 1 && target > lens[i]) { target -= lens[i]; i++; }
    const u = lens[i] ? target / lens[i] : 0;
    const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u;
    const y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u;
    if (valueNoise(t * 17, 5, seed + 9) < breaks) continue;
    const ox = (valueNoise(t * 7, 2, seed) - 0.5) * 2 * wobble;
    const oy = (valueNoise(t * 7 + 33, 6, seed) - 0.5) * 2 * wobble;
    const pressure = 0.55 + 0.9 * valueNoise(t * 5 + 2, 8, seed + 1);
    const end = taper ? Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0.001, t))), 0.4) : 1;
    stampDab(mask, box, x + ox, y + oy, (width / 2) * pressure * end, Math.min(0.95, alpha * pressure));
  }
}

// Contorno chiuso di un nastro a partire dalla sua linea mediana: serve a stendere una salsa
// come una macchia con i suoi bordi, non come una linea spessa.
export function ribbonPolygon(points, widthAt) {
  const left = [], right = [];
  for (let i = 0; i < points.length; i++) {
    const prev = points[Math.max(0, i - 1)], next = points[Math.min(points.length - 1, i + 1)];
    const dx = next.x - prev.x, dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const w = widthAt(i / (points.length - 1)) / 2;
    left.push([points[i].x + nx * w, points[i].y + ny * w]);
    right.push([points[i].x - nx * w, points[i].y - ny * w]);
  }
  return [...left, ...right.reverse()];
}
