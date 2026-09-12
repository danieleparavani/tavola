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
