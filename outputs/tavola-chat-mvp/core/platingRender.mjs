import { createCanvas, fillCircle, strokeCircle, fillEllipse, drawLine, fillDot, encodePNG } from './png.mjs';

// D-048: schema di impiattamento deterministico, basato su regole (D-020), non su generazione
// AI di immagini. Lo stesso oggetto `plating` prodotto dal laboratorio (o dai piatti editoriali)
// viene sia mostrato come testo strutturato sia disegnato qui come schema visivo essenziale del
// piatto: posizione degli elementi sul quadrante dell'orologio, stile della salsa, nient'altro.
// Deterministico e senza rete: stesso input, stessa immagine, nessun costo/latenza aggiuntivi
// (motivazione diretta di D-046/D-047 sulla riduzione della latenza).

const SIZE = 480;
const CENTER = SIZE / 2;
const PLATE_R = 190;
const LAYOUT_R = 105; // raggio a cui vengono posizionati gli elementi rispetto al centro del piatto

const CLOCK_ANGLES = { 12: -90, 1: -60, 2: -30, 3: 0, 4: 30, 5: 60, 6: 90, 7: 120, 8: 150, 9: 180, 10: -150, 11: -120 };

function positionFor(position) {
  if (position === 'centro') return { x: CENTER, y: CENTER };
  const deg = CLOCK_ANGLES[Number(position)];
  if (deg === undefined) return { x: CENTER, y: CENTER };
  const rad = (deg * Math.PI) / 180;
  return { x: CENTER + Math.cos(rad) * LAYOUT_R, y: CENTER + Math.sin(rad) * LAYOUT_R };
}

const ELEMENT_COLOR = [120, 90, 60, 255]; // tono neutro "componente": lo schema non distingue colori di ingredienti reali, solo forma e posizione
const SAUCE_COLOR = [190, 60, 40, 160];
const PLATE_FILL = [250, 248, 244, 255];
const PLATE_RIM = [205, 200, 190, 255];

function drawShape(canvas, shape, x, y) {
  switch (shape) {
    case 'quenelle': fillEllipse(canvas, x, y, 34, 20, ELEMENT_COLOR, Math.PI / 5); return;
    case 'fetta': fillEllipse(canvas, x, y, 40, 14, ELEMENT_COLOR, Math.PI / 8); return;
    case 'ventaglio':
      fillEllipse(canvas, x - 14, y, 24, 10, ELEMENT_COLOR, -0.35);
      fillEllipse(canvas, x, y, 24, 10, ELEMENT_COLOR, 0);
      fillEllipse(canvas, x + 14, y, 24, 10, ELEMENT_COLOR, 0.35);
      return;
    case 'linea': drawLine(canvas, x - 36, y, x + 36, y, 14, ELEMENT_COLOR); return;
    case 'mucchio':
    default: fillCircle(canvas, x, y, 26, ELEMENT_COLOR); return;
  }
}

function drawSauce(canvas, style) {
  switch (style) {
    case 'specchio': fillEllipse(canvas, CENTER, CENTER, PLATE_R * 0.72, PLATE_R * 0.72, SAUCE_COLOR); return;
    case 'velo': fillEllipse(canvas, CENTER, CENTER, PLATE_R * 0.85, PLATE_R * 0.85, [SAUCE_COLOR[0], SAUCE_COLOR[1], SAUCE_COLOR[2], 60]); return;
    case 'virgola': {
      // curva approssimata con segmenti corti a raggio e spessore decrescenti
      const steps = 24, r0 = 70, x0 = CENTER - 40, y0 = CENTER + 60;
      let px = x0, py = y0;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const ang = Math.PI * (0.9 - t * 1.5);
        const x = CENTER + Math.cos(ang) * r0 * (1 - t * 0.3) - 10;
        const y = CENTER + Math.sin(ang) * r0 * (1 - t * 0.3) + 40;
        drawLine(canvas, px, py, x, y, 16 * (1 - t) + 4, SAUCE_COLOR);
        px = x; py = y;
      }
      return;
    }
    case 'punti':
      [[-70, -50], [-40, 30], [10, -60], [60, 20], [0, 70]].forEach(([dx, dy]) => fillDot(canvas, CENTER + dx, CENTER + dy, 9, SAUCE_COLOR));
      return;
    case 'nessuna':
    default: return;
  }
}

// Restituisce un Buffer PNG con lo schema dell'impiattamento del piatto (bordo, base salsa,
// elementi posizionati sul quadrante). `plating` deve rispettare la forma imposta dallo schema
// del laboratorio (vedi core/lab.mjs): { clockLayout:[{element,position,shape}], sauceStyle, ... }.
export function renderPlating(plating) {
  const canvas = createCanvas(SIZE, SIZE, [255, 255, 255, 255]);
  fillCircle(canvas, CENTER, CENTER, PLATE_R, PLATE_FILL);
  strokeCircle(canvas, CENTER, CENTER, PLATE_R, 6, PLATE_RIM);
  strokeCircle(canvas, CENTER, CENTER, PLATE_R * 0.62, 2, [225, 221, 213, 255]); // cerchio interno, solo riferimento visivo del "piatto fondo/centrale"
  drawSauce(canvas, plating?.sauceStyle);
  for (const item of plating?.clockLayout || []) {
    const { x, y } = positionFor(item.position);
    drawShape(canvas, item.shape, x, y);
  }
  return encodePNG(canvas);
}

// Testo strutturato leggibile per il messaggio Telegram (D-048: "entrambi" — immagine e testo).
export function platingText(plating) {
  if (!plating) return '';
  const posLabel = (p) => (p === 'centro' ? 'al centro' : `ore ${p}`);
  const layout = (plating.clockLayout || []).map(i => `${i.element} — ${posLabel(i.position)} (${i.shape})`).join('\n');
  const sauceLabel = { specchio: 'a specchio alla base', virgola: 'a virgola', punti: 'a punti', velo: 'a velo leggero', nessuna: 'assente' }[plating.sauceStyle] || plating.sauceStyle;
  return `🍽 **Impiattamento**\n${layout}\nSalsa: ${sauceLabel}\nTemperatura: ${plating.temperature}\nConsistenze da proteggere: ${plating.textureNote}\nFinitura: ${plating.finish}`;
}
