import {
  createCanvas, fillCircle, strokeCircle, fillEllipse, drawLine, fillDot, encodePNG,
  fillCircleGradient, fillEllipseGradient, fillEllipseSoft, strokeEllipse, drawNumberBadge,
} from './png.mjs';

// D-048: schema di impiattamento deterministico, basato su regole (D-020), non su generazione
// AI di immagini. Lo stesso oggetto `plating` prodotto dal laboratorio (o dai piatti editoriali)
// viene sia mostrato come testo strutturato sia disegnato qui come schema visivo essenziale del
// piatto: posizione degli elementi sul quadrante dell'orologio, stile della salsa, nient'altro.
// Deterministico e senza rete: stesso input, stessa immagine, nessun costo/latenza aggiuntivi
// (motivazione diretta di D-046/D-047 sulla riduzione della latenza).
//
// D-059: la prima versione era illeggibile — piatto quasi invisibile su sfondo bianco (colori
// quasi identici), elementi tutti uguali e senza volume, nessun modo di collegare una forma
// astratta al nome dell'ingrediente. Questa versione aggiunge profondità (ombre morbide,
// gradienti "a sfera" con una luce fissa in alto a sinistra, piatto in rilievo su un piano di
// appoggio) e numeri sugli elementi che corrispondono uno a uno alla lista numerata restituita
// da platingText, cosi l'immagine si legge anche senza didascalia. Resta uno schema, non una
// fotografia: la forma e la posizione contano, non il colore reale dell'ingrediente (invariato
// da D-048).

const SIZE = 600;
const CENTER = SIZE / 2;
const PLATE_R = 235;
const LAYOUT_R = 128; // raggio a cui vengono posizionati gli elementi rispetto al centro del piatto

const CLOCK_ANGLES = { 12: -90, 1: -60, 2: -30, 3: 0, 4: 30, 5: 60, 6: 90, 7: 120, 8: 150, 9: 180, 10: -150, 11: -120 };

function positionFor(position) {
  if (position === 'centro') return { x: CENTER, y: CENTER };
  const deg = CLOCK_ANGLES[Number(position)];
  if (deg === undefined) return { x: CENTER, y: CENTER };
  const rad = (deg * Math.PI) / 180;
  return { x: CENTER + Math.cos(rad) * LAYOUT_R, y: CENTER + Math.sin(rad) * LAYOUT_R };
}

const TABLE_COLOR = [214, 205, 191, 255]; // piano d'appoggio: contrasta col piatto chiaro, prima era invisibile su sfondo bianco
const PLATE_CENTER = [255, 253, 249, 255];
const PLATE_EDGE = [227, 220, 208, 255];
const PLATE_RIM_SHADOW = [176, 166, 150, 255];
const PLATE_RIM_HIGHLIGHT = [255, 255, 255, 210];
const PLATE_WELL = [205, 197, 185, 255];
const SHADOW_RGB = [45, 34, 22];

// Ogni forma ha una coppia chiaro/scuro per il gradiente "a sfera": non sono colori reali
// dell'ingrediente (D-048 resta valido), solo una palette neutra abbastanza variata da
// distinguere elementi diversi sullo stesso piatto.
const SHAPE_STYLE = {
  quenelle: { light: [204, 172, 132, 255], dark: [140, 104, 68, 255] },
  fetta: { light: [198, 142, 98, 255], dark: [130, 84, 52, 255] },
  ventaglio: { light: [208, 160, 106, 255], dark: [142, 98, 58, 255] },
  linea: { light: [156, 118, 80, 255], dark: [96, 68, 44, 255] },
  mucchio: { light: [180, 142, 100, 255], dark: [116, 84, 54, 255] },
};

function drawShape(canvas, shape, x, y) {
  const style = SHAPE_STYLE[shape] || SHAPE_STYLE.mucchio;
  switch (shape) {
    case 'quenelle':
      fillEllipseSoft(canvas, x + 7, y + 9, 36, 22, SHADOW_RGB, 90, Math.PI / 5);
      fillEllipseGradient(canvas, x, y, 34, 20, style.light, style.dark, Math.PI / 5);
      strokeEllipse(canvas, x, y, 34, 20, 2, [...style.dark.slice(0, 3), 220], Math.PI / 5);
      return;
    case 'fetta':
      fillEllipseSoft(canvas, x + 6, y + 8, 42, 16, SHADOW_RGB, 85, Math.PI / 8);
      fillEllipseGradient(canvas, x, y, 40, 14, style.light, style.dark, Math.PI / 8);
      strokeEllipse(canvas, x, y, 40, 14, 2, [...style.dark.slice(0, 3), 220], Math.PI / 8);
      return;
    case 'ventaglio': {
      const offsets = [-14, 0, 14], rots = [-0.35, 0, 0.35];
      offsets.forEach((ox, i) => fillEllipseSoft(canvas, x + ox + 5, y + 7, 25, 11, SHADOW_RGB, 65, rots[i]));
      offsets.forEach((ox, i) => {
        fillEllipseGradient(canvas, x + ox, y, 24, 10, style.light, style.dark, rots[i]);
        strokeEllipse(canvas, x + ox, y, 24, 10, 1.5, [...style.dark.slice(0, 3), 200], rots[i]);
      });
      return;
    }
    case 'linea':
      fillEllipseSoft(canvas, x + 5, y + 8, 40, 9, SHADOW_RGB, 75, 0);
      drawLine(canvas, x - 36, y, x + 36, y, 14, style.dark);
      drawLine(canvas, x - 36, y - 3, x + 36, y - 3, 7, style.light);
      return;
    case 'mucchio':
    default:
      fillEllipseSoft(canvas, x + 7, y + 9, 28, 22, SHADOW_RGB, 90, 0);
      fillEllipseGradient(canvas, x, y, 26, 24, style.light, style.dark, 0.3);
      strokeEllipse(canvas, x, y, 26, 24, 2, [...style.dark.slice(0, 3), 220], 0.3);
      return;
  }
}

function drawSauce(canvas, style) {
  switch (style) {
    case 'specchio':
      fillCircleGradient(canvas, CENTER, CENTER, PLATE_R * 0.72, [206, 82, 54, 210], [164, 44, 28, 55]);
      return;
    case 'velo':
      fillCircleGradient(canvas, CENTER, CENTER, PLATE_R * 0.85, [206, 82, 54, 65], [180, 55, 35, 8]);
      return;
    case 'virgola': {
      const steps = 30, r0 = 74, x0 = CENTER - 42, y0 = CENTER + 62;
      const pointAt = (i) => {
        const t = i / steps;
        const ang = Math.PI * (0.9 - t * 1.5);
        return { x: CENTER + Math.cos(ang) * r0 * (1 - t * 0.3) - 10, y: CENTER + Math.sin(ang) * r0 * (1 - t * 0.3) + 40, t };
      };
      // ogni passata disegna segmento + un tondino agli snodi (stesso colore/alpha) per
      // smussare le giunture, altrimenti visibili come una riga a "gradini"
      const drawSwoosh = (widthAt, rgba) => {
        let prev = { x: x0, y: y0, t: 0 };
        for (let i = 1; i <= steps; i++) {
          const cur = pointAt(i);
          const w = widthAt(prev.t);
          drawLine(canvas, prev.x, prev.y, cur.x, cur.y, w, rgba);
          fillDot(canvas, prev.x, prev.y, w / 2, rgba);
          prev = cur;
        }
        fillDot(canvas, prev.x, prev.y, widthAt(prev.t) / 2, rgba);
      };
      drawSwoosh((t) => 22 * (1 - t) + 8, [200, 70, 45, 65]); // alone morbido sotto
      drawSwoosh((t) => 14 * (1 - t) + 4, [205, 80, 52, 225]); // corpo della virgola sopra
      return;
    }
    case 'punti':
      [[-70, -50], [-40, 30], [10, -60], [60, 20], [0, 70]].forEach(([dx, dy]) => {
        fillDot(canvas, CENTER + dx, CENTER + dy, 9, [190, 62, 40, 215]);
        fillDot(canvas, CENTER + dx - 2, CENTER + dy - 3, 3, [232, 145, 115, 190]); // piccolo riflesso per un effetto lucido
      });
      return;
    case 'nessuna':
    default: return;
  }
}

// Restituisce un Buffer PNG con lo schema dell'impiattamento del piatto: piano d'appoggio,
// piatto in rilievo (ombra + gradiente + bordo bisellato), base salsa, elementi con volume e
// numerati. `plating` deve rispettare la forma imposta dallo schema del laboratorio (vedi
// core/lab.mjs): { clockLayout:[{element,position,shape}], sauceStyle, ... }.
export function renderPlating(plating) {
  const canvas = createCanvas(SIZE, SIZE, TABLE_COLOR);
  // ombra del piatto sul piano, per staccarlo dallo sfondo e dare l'idea di un oggetto appoggiato
  fillEllipseSoft(canvas, CENTER, CENTER + PLATE_R * 0.1, PLATE_R * 0.94, PLATE_R * 0.3, SHADOW_RGB, 100);
  fillCircleGradient(canvas, CENTER, CENTER, PLATE_R, PLATE_CENTER, PLATE_EDGE);
  strokeCircle(canvas, CENTER, CENTER, PLATE_R, 3, PLATE_RIM_SHADOW);
  strokeCircle(canvas, CENTER, CENTER, PLATE_R - 7, 2, PLATE_RIM_HIGHLIGHT);
  strokeCircle(canvas, CENTER, CENTER, PLATE_R * 0.62, 2, PLATE_WELL); // cerchio interno, riferimento visivo del "piatto fondo/centrale"
  drawSauce(canvas, plating?.sauceStyle);
  (plating?.clockLayout || []).forEach((item, idx) => {
    const { x, y } = positionFor(item.position);
    drawShape(canvas, item.shape, x, y);
    drawNumberBadge(canvas, x + 27, y - 27, idx + 1, { r: 15, scale: 2 });
  });
  return encodePNG(canvas);
}

// Testo strutturato leggibile per il messaggio Telegram (D-048: "entrambi" — immagine e testo).
// D-059: la lista è numerata negli stessi numeri dei cerchietti disegnati sull'immagine, cosi
// le due cose si leggono insieme invece che come due elenchi scollegati.
export function platingText(plating) {
  if (!plating) return '';
  const posLabel = (p) => (p === 'centro' ? 'al centro' : `ore ${p}`);
  const layout = (plating.clockLayout || []).map((i, idx) => `${idx + 1}. ${i.element} — ${posLabel(i.position)} (${i.shape})`).join('\n');
  const sauceLabel = { specchio: 'a specchio alla base', virgola: 'a virgola', punti: 'a punti', velo: 'a velo leggero', nessuna: 'assente' }[plating.sauceStyle] || plating.sauceStyle;
  return `🍽 **Impiattamento** (i numeri corrispondono a quelli nell'immagine)\n${layout}\nSalsa: ${sauceLabel}\nTemperatura: ${plating.temperature}\nConsistenze da proteggere: ${plating.textureNote}\nFinitura: ${plating.finish}`;
}
