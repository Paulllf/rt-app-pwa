// SPS-Zahlenformate mit Rechenweg: Bitmuster ↔ UINT, INT (Zweierkomplement), BCD. Reine Rechnung.
// Wie K3 SPS A3: 8 Bit, Schreibweise mit Punkt in der Mitte („1001.1011“). 16 Bit geht auch (S7: INT/WORD = 16 Bit).

import { sup } from '../lib/poly.js';

const minus = (n) => (n < 0 ? '−' + Math.abs(n) : String(n));

/** „1001.1011“ / „1001 1011“ / „10011011“ → ['1','0',…]; nur 8 oder 16 Bit. */
export function parseBits(text) {
  const roh = String(text ?? '').replace(/[\s._\-|]/g, '').replace(/^2#/, '');
  if (!roh) throw new Error('Bitfolge eingeben, z. B. 1001.1011');
  if (/[^01]/.test(roh)) throw new Error('Bitfolge darf nur 0 und 1 enthalten (Punkt/Leerzeichen als Trenner erlaubt).');
  if (roh.length !== 8 && roh.length !== 16) {
    throw new Error(`${roh.length} Bit eingegeben. Bitte genau 8 Bit (z. B. 1001.1011) oder 16 Bit eingeben – führende Nullen mitschreiben.`);
  }
  return roh.split('').map(Number);
}

/** Bits in Vierergruppen mit Punkt: 1001.1011 (16 Bit: 0000.0001.0010.0011) */
export const bitText = (bits) => bits.join('').replace(/(\d{4})(?=\d)/g, '$1.');

const wert = (bits) => bits.reduce((s, b) => s * 2 + b, 0);
const invert = (bits) => bits.map((b) => 1 - b);
function plusEins(bits) {
  const r = bits.slice();
  for (let i = r.length - 1; i >= 0; i--) {
    if (r[i] === 0) { r[i] = 1; return r; }
    r[i] = 0;
  }
  return r;
}
const zuBits = (n, breite) => Array.from({ length: breite }, (_, i) => Math.floor(n / 2 ** (breite - 1 - i)) % 2);

/** Summe der Stellenwerte als Rechenweg-Text: „128 + 16 + 8 + 2 + 1 = 155“ */
function stellenSumme(bits) {
  const n = bits.length;
  const teile = bits.map((b, i) => (b ? 2 ** (n - 1 - i) : null)).filter((x) => x !== null);
  const w = wert(bits);
  if (!teile.length) return '0 (kein Bit gesetzt) = 0';
  const pot = bits.map((b, i) => (b ? '2' + sup(n - 1 - i) : null)).filter(Boolean).join(' + ');
  return `${pot} = ${teile.join(' + ')} = ${w}`;
}

function stellenTabelle(bits) {
  const n = bits.length;
  return [
    bits.map((_, i) => '2' + sup(n - 1 - i)),
    bits.map((_, i) => String(2 ** (n - 1 - i))),
    bits.map(String),
  ];
}

const PSEUDO = { 10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F' };

/** Bitmuster → UINT, INT, BCD. */
function ausBits(bits) {
  const n = bits.length;
  const schritte = [];
  const uint = wert(bits);
  const tt = bitText(bits);

  schritte.push({
    titel: 'Bitfolge und Stellenwerte',
    zeilen: [
      { text: `Bitfolge: ${tt} (${n} Bit, links = höchstwertiges Bit 2${sup(n - 1)}, rechts = 2⁰)` },
      { text: '', matrix: stellenTabelle(bits) },
    ],
  });

  // 1) UINT
  schritte.push({
    titel: `UINT ${n} Bit (vorzeichenlos)`,
    zeilen: [
      { text: 'Alle gesetzten Bits (1) mit ihrem Stellenwert addieren:' },
      { text: stellenSumme(bits) },
      { text: `UINT = ${uint}`, strong: true },
      { text: `Wertebereich UINT ${n} Bit: 0 … ${2 ** n - 1}`, muted: true },
    ],
  });

  // 2) INT (Zweierkomplement)
  let int;
  const zInt = [{ text: `Erstes Bit (2${sup(n - 1)}) ist das Vorzeichenbit: ${bits[0]} → ${bits[0] ? 'negative Zahl' : 'positive Zahl'}` }];
  if (!bits[0]) {
    int = uint;
    zInt.push({ text: 'Positiv → Wert wie bei UINT:' });
    zInt.push({ text: `INT = ${int}`, strong: true });
  } else {
    const inv = invert(bits);
    const betragBits = plusEins(inv);
    const betrag = wert(betragBits);
    int = uint - 2 ** n;
    zInt.push({ text: 'Negativ → Zweierkomplement bilden (alle Bits invertieren, dann +1), ergibt den Betrag:' });
    zInt.push({ text: `Bitfolge:     ${tt}`, indent: true });
    zInt.push({ text: `invertiert:   ${bitText(inv)}`, indent: true });
    zInt.push({ text: `+1:           ${bitText(betragBits)}`, indent: true });
    zInt.push({ text: `Betrag: ${stellenSumme(betragBits)}`, indent: true });
    zInt.push({ text: `INT = −${betrag}`, strong: true });
    const rest = uint - 2 ** (n - 1);
    zInt.push({ text: `Probe: −2${sup(n - 1)} + Rest = −${2 ** (n - 1)} + ${rest} = ${minus(int)}  (oder UINT − 2${sup(n)} = ${uint} − ${2 ** n} = ${minus(int)})`, muted: true });
  }
  zInt.push({ text: `Wertebereich INT ${n} Bit: −${2 ** (n - 1)} … ${2 ** (n - 1) - 1}`, muted: true });
  schritte.push({ titel: `INT ${n} Bit (mit Vorzeichen, Zweierkomplement)`, zeilen: zInt });

  // 3) BCD
  const tetraden = [];
  for (let i = 0; i < n; i += 4) tetraden.push(bits.slice(i, i + 4));
  const ziffern = tetraden.map(wert);
  const pseudo = ziffern.map((z, i) => (z > 9 ? i : -1)).filter((i) => i >= 0);
  const zBcd = [{ text: 'BCD: jede Vierergruppe (Tetrade) ist eine Dezimalziffer 0…9 (Stellenwerte 8-4-2-1).' }];
  tetraden.forEach((t, i) => {
    const z = ziffern[i];
    const pos = tetraden.length === 2 ? (i === 0 ? 'Ziffer links (Zehner)' : 'Ziffer rechts (Einer)') : `Tetrade ${i + 1} (10${sup(tetraden.length - 1 - i)})`;
    const summanden = t.map((b, k) => (b ? 2 ** (3 - k) : null)).filter((x) => x !== null);
    const rechnung = summanden.length > 1 ? `${t.join('')} = ${summanden.join(' + ')} = ${z}` : `${t.join('')} = ${z}`;
    zBcd.push({
      text: z > 9
        ? `${pos}: ${rechnung} > 9 → Pseudotetrade (${PSEUDO[z]}), keine gültige BCD-Ziffer!`
        : `${pos}: ${rechnung} → Ziffer ${z}`,
      indent: true,
      strong: z > 9,
    });
  });
  let bcd = null;
  if (pseudo.length) {
    zBcd.push({ text: `Auffällig: ${pseudo.map((i) => tetraden[i].join('')).join(', ')} ist eine Pseudotetrade (Werte 1010…1111 = 10…15 = A…F kommen in BCD nicht vor). → Die Bitfolge ist keine gültige BCD-Zahl.`, strong: true });
    zBcd.push({ text: `Ziffern: ${ziffern.map((z) => (z > 9 ? `Pseudotetrade (${PSEUDO[z]})` : z)).join(' | ')}` });
  } else {
    bcd = Number(ziffern.join(''));
    zBcd.push({ text: `BCD = ${ziffern.join('')}`, strong: true });
    zBcd.push({ text: `Achtung: BCD ≠ UINT. Dieselben Bits als UINT wären ${uint}.`, muted: true });
  }
  zBcd.push({ text: `Wertebereich BCD ${n} Bit: 0 … ${'9'.repeat(n / 4)}`, muted: true });
  schritte.push({ titel: `BCD-Zahl ${n} Bit (vorzeichenlos)`, zeilen: zBcd });

  const hex = ziffern.map((z) => z.toString(16).toUpperCase()).join('');
  schritte.push({
    titel: 'Zusatz: Hexadezimal',
    zeilen: [{ text: `Tetraden als Hex-Ziffern (0…9, A…F): ${tetraden.map((t) => t.join('')).join('.')} = 16#${hex}`, muted: true }],
  });

  const bcdText = bcd === null
    ? `BCD ungültig (${ziffern.map((z) => (z > 9 ? `Pseudotetrade ${PSEUDO[z]}` : z)).join(' | ')})`
    : `BCD ${bcd}`;
  const fazit = `${tt}: UINT ${uint} · INT ${minus(int)} · ${bcdText}`;
  return { schritte, fazit, uint, int, bcd, bcdZiffern: ziffern, pseudotetraden: pseudo.length, hex, bits: bits.join(''), breite: n };
}

/** Dezimalzahl → UINT-, INT-, BCD-Bitmuster (Breite 8 oder 16). */
function ausDezimal(text, breite) {
  const s = String(text ?? '').trim().replace(/−/g, '-').replace(/\s/g, '');
  if (!s) throw new Error('Dezimalzahl eingeben, z. B. 155 oder −101');
  if (!/^[-+]?\d+$/.test(s)) throw new Error('Nur ganze Zahlen (ohne Komma) – SPS-Ganzzahlformate kennen keine Nachkommastellen.');
  const z = Number(s);
  const n = breite === 16 ? 16 : 8;
  const schritte = [];
  const ergebnis = { zahl: z, breite: n, uint: null, int: null, bcd: null };

  // Restdivision für |z|
  function division(a) {
    const zeilen = [];
    if (a === 0) return { zeilen: [{ text: '0 → alle Bits 0', indent: true }] };
    let x = a;
    while (x > 0) {
      zeilen.push({ text: `${x} : 2 = ${Math.floor(x / 2)}  Rest ${x % 2}`, indent: true });
      x = Math.floor(x / 2);
    }
    zeilen.push({ text: 'Reste von unten nach oben lesen, vorne mit 0 auf ' + n + ' Bit auffüllen.', muted: true, indent: true });
    return { zeilen };
  }

  // UINT
  const zU = [];
  if (z < 0 || z > 2 ** n - 1) {
    zU.push({ text: `${minus(z)} liegt nicht im Bereich 0 … ${2 ** n - 1} → als UINT ${n} Bit nicht darstellbar.`, strong: true });
  } else {
    const b = zuBits(z, n);
    zU.push({ text: `${z} fortlaufend durch 2 teilen:` });
    zU.push(...division(z).zeilen);
    zU.push({ text: `Probe: ${stellenSumme(b)}`, muted: true });
    zU.push({ text: `UINT ${z} = ${bitText(b)}`, strong: true });
    ergebnis.uint = bitText(b);
  }
  schritte.push({ titel: `UINT ${n} Bit`, zeilen: zU });

  // INT
  const zI = [];
  if (z < -(2 ** (n - 1)) || z > 2 ** (n - 1) - 1) {
    zI.push({ text: `${minus(z)} liegt nicht im Bereich −${2 ** (n - 1)} … ${2 ** (n - 1) - 1} → als INT ${n} Bit nicht darstellbar.`, strong: true });
  } else if (z >= 0) {
    const b = zuBits(z, n);
    zI.push({ text: `Positiv → wie UINT, Vorzeichenbit (erstes Bit) = 0.` });
    zI.push({ text: `INT ${z} = ${bitText(b)}`, strong: true });
    ergebnis.int = bitText(b);
  } else {
    const a = -z;
    const bb = zuBits(a, n);
    const inv = invert(bb);
    const erg = plusEins(inv);
    zI.push({ text: `Negativ → erst den Betrag ${a} binär, dann Zweierkomplement (invertieren, +1).` });
    if (a === 2 ** (n - 1)) zI.push({ text: `(Sonderfall −${a}: Betrag passt nicht in INT, Rechnung geht trotzdem auf.)`, muted: true });
    zI.push({ text: `Betrag:      ${bitText(bb)}  (${stellenSumme(bb)})`, indent: true });
    zI.push({ text: `invertiert:  ${bitText(inv)}`, indent: true });
    zI.push({ text: `+1:          ${bitText(erg)}`, indent: true });
    zI.push({ text: `Probe: −2${sup(n - 1)} + ${wert(erg) - 2 ** (n - 1)} = ${minus(wert(erg) - 2 ** n)} ✓`, muted: true });
    zI.push({ text: `INT ${minus(z)} = ${bitText(erg)}  (Vorzeichenbit 1)`, strong: true });
    ergebnis.int = bitText(erg);
  }
  schritte.push({ titel: `INT ${n} Bit (Zweierkomplement)`, zeilen: zI });

  // BCD
  const zB = [];
  const maxBcd = 10 ** (n / 4) - 1;
  if (z < 0 || z > maxBcd) {
    zB.push({ text: `${minus(z)} liegt nicht im Bereich 0 … ${maxBcd} → als BCD ${n} Bit (vorzeichenlos) nicht darstellbar.`, strong: true });
  } else {
    const ziff = String(z).padStart(n / 4, '0').split('').map(Number);
    zB.push({ text: 'Jede Dezimalziffer einzeln als 4 Bit (8-4-2-1) schreiben:' });
    ziff.forEach((d) => zB.push({ text: `${d} → ${zuBits(d, 4).join('')}`, indent: true }));
    const b = ziff.flatMap((d) => zuBits(d, 4));
    zB.push({ text: `BCD ${z} = ${bitText(b)}`, strong: true });
    zB.push({ text: `Zum Vergleich als UINT wäre das ${wert(b)}.`, muted: true });
    ergebnis.bcd = bitText(b);
  }
  schritte.push({ titel: `BCD ${n} Bit`, zeilen: zB });

  const teile = [
    `UINT ${ergebnis.uint ?? '–'}`,
    `INT ${ergebnis.int ?? '–'}`,
    `BCD ${ergebnis.bcd ?? '–'}`,
  ];
  return { ...ergebnis, schritte, fazit: `${minus(z)} (${n} Bit): ${teile.join(' · ')}` };
}

/**
 * Eingabe:
 *   { modus: 'bits', bits: '1001.1011' }            → UINT, INT, BCD (8 oder 16 Bit, aus der Länge)
 *   { modus: 'dezimal', zahl: '-101', breite: 8 }   → Bitmuster UINT, INT, BCD
 */
export function spsZahlen(input) {
  if (input.modus === 'dezimal') return ausDezimal(input.zahl, Number(input.breite) || 8);
  return ausBits(parseBits(input.bits));
}
