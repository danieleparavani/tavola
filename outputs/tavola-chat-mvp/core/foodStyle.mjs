// D-060: il disegno dell'impiattamento non usa più un unico colore neutro per qualunque
// componente. Il nome reale dell'ingrediente (campo `element` di clockLayout, scritto dal
// laboratorio) decide colore e "grana": un pomodoro è rosso e a dadi, una mollica è dorata e
// friabile, un filetto di pesce ha polpa chiara e pelle argentata. Resta tutto deterministico e
// locale: nessuna rete, nessuna generazione di immagini, nessuna dipendenza (D-047/D-048).
//
// La corrispondenza parte da inizio parola sul nome normalizzato, con la prima voce che matcha
// che vince: l'elenco è quindi ordinato dal più specifico al più generico. Un ingrediente non
// riconosciuto non è un errore e non blocca nulla — riceve la resa neutra `default`, coerente con
// D-014 (nessun catalogo chiuso di ingredienti).

// grain: come viene disegnato. strands=fili, granules=granelli/briciole, dice=dadi,
// wedge=spicchio di agrume, fillet=trancio con pelle, slab=fetta compatta, leaves=foglie,
// cream=crema/quenelle lucida, shell=guscio di mollusco, drizzle=filo lucido, dome=cupola neutra.
const CLASSES = [
  { keys: ['spaghett', 'linguin', 'tagliatell', 'fettuccin', 'bucatin', 'vermicell', 'tonnarell', 'tagliolin', 'nido', 'pasta', 'maccheron', 'rigaton', 'penne', 'fusill', 'paccher'], grain: 'strands', light: [246, 223, 163], base: [230, 197, 122], dark: [186, 146, 74] },
  { keys: ['risotto', 'riso', 'orzo', 'farro', 'cous'], grain: 'granules', light: [250, 244, 228], base: [235, 226, 203], dark: [193, 180, 150], size: [1.6, 2.8] },
  { keys: ['mollica', 'pangrattat', 'briciol', 'crostin', 'pane', 'crumble', 'pangratt', 'croccant'], grain: 'granules', light: [236, 194, 126], base: [205, 152, 82], dark: [148, 99, 46], size: [1.5, 3.4] },
  { keys: ['pomodorin', 'datterin', 'ciliegin', 'pomodoro', 'pomodor', 'passata', 'concass'], grain: 'dice', light: [226, 96, 72], base: [193, 54, 42], dark: [136, 28, 24] },
  { keys: ['limone', 'lime', 'arancia', 'agrume', 'cedro', 'pompelmo'], grain: 'wedge', light: [252, 232, 150], base: [240, 206, 84], dark: [193, 154, 40] },
  { keys: ['vongol', 'cozz', 'telline', 'lupin', 'mollusc'], grain: 'shell', light: [214, 205, 190], base: [166, 155, 138], dark: [104, 95, 82] },
  { keys: ['gamber', 'scampi', 'mazzancoll', 'astice', 'canocchi'], grain: 'fillet', light: [253, 206, 182], base: [238, 148, 116], dark: [190, 96, 70], skin: [222, 110, 84] },
  { keys: ['trigli', 'scorfan', 'gallinell'], grain: 'fillet', light: [252, 224, 200], base: [242, 186, 156], dark: [196, 120, 96], skin: [198, 78, 62] },
  { keys: ['salmon', 'trota'], grain: 'fillet', light: [253, 198, 158], base: [244, 158, 106], dark: [198, 108, 62], skin: [176, 172, 168] },
  { keys: ['tonn'], grain: 'fillet', light: [228, 112, 96], base: [196, 72, 60], dark: [138, 40, 34], skin: [132, 128, 126] },
  { keys: ['branzin', 'orata', 'merluzz', 'baccal', 'sgombr', 'alic', 'acciug', 'rombo', 'spigola', 'pesce', 'seppia', 'calamar', 'polpo'], grain: 'fillet', light: [253, 247, 238], base: [238, 226, 210], dark: [186, 170, 152], skin: [146, 158, 170] },
  { keys: ['manzo', 'vitell', 'maial', 'agnell', 'pollo', 'tacchin', 'anatra', 'salsicc', 'guancial', 'pancett', 'prosciutt', 'carne', 'costat', 'filetto', 'petto', 'coscia', 'brasat', 'arrost'], grain: 'slab', light: [186, 122, 80], base: [147, 87, 56], dark: [96, 54, 34] },
  { keys: ['pesto'], grain: 'cream', light: [156, 196, 110], base: [110, 158, 72], dark: [70, 110, 50] },
  { keys: ['prezzemol', 'basilic', 'rucol', 'menta', 'timo', 'rosmarin', 'aneto', 'erba cipollin', 'erbe', 'maggiorana', 'origan', 'salvia', 'germogl', 'insalat', 'spinac', 'foglie'], grain: 'leaves', light: [134, 190, 104], base: [86, 150, 68], dark: [46, 100, 44] },
  { keys: ['zucchin', 'broccol', 'asparag', 'fagiolin', 'pisell', 'friarell', 'cim', 'carciof', 'fav', 'edamam'], grain: 'dice', light: [148, 194, 108], base: [104, 155, 72], dark: [62, 106, 48] },
  { keys: ['zafferan', 'curcum', 'zucca', 'carota'], grain: 'cream', light: [251, 206, 118], base: [238, 172, 60], dark: [186, 122, 30] },
  { keys: ['tuorl', 'uovo', 'uova'], grain: 'cream', light: [253, 212, 112], base: [243, 176, 48], dark: [188, 124, 24] },
  { keys: ['ricott', 'burrat', 'stracciatell', 'mozzarell', 'crema', 'purea', 'vellutat', 'besciamell', 'maionese', 'yogurt', 'panna', 'robiol', 'caprin', 'formagg', 'parmigian', 'pecorin', 'grana'], grain: 'cream', light: [253, 250, 242], base: [240, 233, 216], dark: [196, 186, 164] },
  { keys: ['patat', 'topinamb', 'sedano rap'], grain: 'dice', light: [243, 216, 148], base: [223, 188, 112], dark: [172, 138, 70] },
  { keys: ['fungh', 'porcin', 'champignon', 'chiodini', 'cardoncell', 'shiitake'], grain: 'dice', light: [190, 156, 118], base: [150, 116, 82], dark: [100, 74, 50] },
  { keys: ['oliv', 'caper', 'tapenade'], grain: 'dice', light: [116, 116, 76], base: [78, 80, 48], dark: [44, 46, 26] },
  { keys: ['cipoll', 'scalogn', 'porro', 'aglio', 'finocchi'], grain: 'dice', light: [248, 242, 230], base: [231, 220, 200], dark: [178, 166, 146] },
  { keys: ['peperoncin', 'paprik', 'pepe', 'spezie', 'polvere', 'semi di'], grain: 'granules', light: [206, 92, 58], base: [166, 58, 36], dark: [110, 34, 22], size: [1.2, 2.2] },
  { keys: ['olio', 'filo d', 'colatura', 'riduzion', 'glassa', 'aceto'], grain: 'drizzle', light: [226, 196, 96], base: [196, 160, 56], dark: [142, 112, 30] },
  { keys: ['pinol', 'mandorl', 'nocciol', 'noci', 'pistacch'], grain: 'granules', light: [238, 214, 170], base: [212, 182, 132], dark: [160, 132, 88], size: [2.4, 4.2] },
];

const DEFAULT_STYLE = { grain: 'dome', light: [214, 178, 132], base: [178, 140, 96], dark: [124, 94, 62] };

function normalize(text) {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// La corrispondenza parte da inizio parola, non da una sottostringa qualsiasi: altrimenti
// "fermentato" contiene "menta" e un ingrediente qualunque finisce tra le erbe. Resta invece
// valida la corrispondenza per prefisso ("trigli" copre triglia e triglie).
function matches(normalized, key) {
  const index = normalized.indexOf(key);
  if (index < 0) return false;
  return index === 0 || !/[a-z]/.test(normalized[index - 1]);
}

function classFor(normalized) {
  for (const cls of CLASSES) {
    if (cls.keys.some(k => matches(normalized, k))) return cls;
  }
  return null;
}

// "crema di zucchine" è una crema verde, non zucchine a dadi: la preparazione decide la grana,
// l'ingrediente che segue decide il colore.
const PREPARATION = /^(?:.*\b)?(crema|purea|vellutata|mousse|spuma|passata|salsa|coulis|gel)\s+(?:di|al|alla|ai|agli|alle|d')\s+(.+)$/;

// Restituisce { grain, light, base, dark, skin?, size? } per il nome dell'ingrediente.
export function styleFor(elementName) {
  const n = normalize(elementName);
  const prep = n.match(PREPARATION);
  if (prep) {
    const inner = classFor(prep[2]);
    const creamy = classFor('crema');
    return { ...(inner || creamy), grain: 'cream' };
  }
  return classFor(n) || DEFAULT_STYLE;
}

// Colore della salsa: anche qui, quando il nome di un elemento suggerisce la base della salsa
// (pomodoro, pesto, burro, vino, nero di seppia) il colore segue quella, invece di essere sempre
// lo stesso rosso. Senza indizi resta una riduzione scura neutra.
export function sauceColorFor(clockLayout) {
  const all = normalize((clockLayout || []).map(i => i.element).join(' '));
  if (/zafferan|zucca|curcum/.test(all)) return { light: [246, 194, 88], dark: [196, 140, 36] };
  if (/nero di seppia|seppia/.test(all)) return { light: [92, 88, 96], dark: [34, 32, 38] };
  if (/limone|agrume|vino bianco|burro|vongol|pesce|triglia|branzin/.test(all)) return { light: [252, 238, 196], dark: [226, 194, 122], alpha: 195 };
  if (/pesto|basilic|salsa verde/.test(all)) return { light: [146, 190, 104], dark: [78, 124, 60] };
  if (/pomodor|passata|nduja|peperon/.test(all)) return { light: [208, 84, 56], dark: [142, 36, 28] };
  return { light: [148, 106, 70], dark: [82, 54, 34] };
}
