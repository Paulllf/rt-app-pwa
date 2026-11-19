// Exakte Brüche für den Matrix-Rechner (z/n, n > 0, gekürzt) und Matrix-Eingabe.
// Kein DOM, in Node testbar.
import { fmt } from './poly.js';

const ggt = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };

export class Q {
  constructor(z, n = 1) {
    if (n === 0) throw new Error('Division durch 0.');
    if (n < 0) { z = -z; n = -n; }
    const g = ggt(z, n);
    this.z = z / g; this.n = n / g;
    if (!Number.isSafeInteger(this.z) || !Number.isSafeInteger(this.n)) throw new Error('Zahlen zu groß für exakte Rechnung.');
  }
  static of(x) { return x instanceof Q ? x : Q.dez(x); }
  /** Dezimalzahl → Bruch (bis 9 Nachkommastellen exakt). */
  static dez(x) {
    if (Number.isInteger(x)) return new Q(x, 1);
    let n = 1;
    while (n < 1e9 && Math.abs(Math.round(x * n) - x * n) > 1e-9 * Math.max(1, Math.abs(x * n))) n *= 10;
    return new Q(Math.round(x * n), n);
  }
  add(b) { b = Q.of(b); return new Q(this.z * b.n + b.z * this.n, this.n * b.n); }
  sub(b) { b = Q.of(b); return new Q(this.z * b.n - b.z * this.n, this.n * b.n); }
  mul(b) { b = Q.of(b); return new Q(this.z * b.z, this.n * b.n); }
  div(b) { b = Q.of(b); if (b.z === 0) throw new Error('Division durch 0.'); return new Q(this.z * b.n, this.n * b.z); }
  neg() { return new Q(-this.z, this.n); }
  isZero() { return this.z === 0; }
  isInt() { return this.n === 1; }
  get wert() { return this.z / this.n; }
  /** "−12/27"-Stil gekürzt: "−4/9". Ganze Zahlen ohne Nenner. */
  toString() { return this.n === 1 ? fmt(this.z) : (this.z < 0 ? '−' : '') + Math.abs(this.z) + '/' + this.n; }
  /** Als Faktor: negative Zahlen und Brüche in Klammern. */
  fak() { return this.z < 0 || this.n !== 1 ? `(${this})` : String(this); }
  /** Bruch und Dezimalwert: "−4/9 ≈ −0,4444" */
  mitDez() { return this.n === 1 ? String(this) : `${this} ≈ ${fmt(this.wert)}`; }
}

/** Eine Zahl lesen: "3", "−7", "0,5", "1/3", "-2/3", "2.5" */
export function parseZahl(s) {
  const t = String(s).trim().replace(/[−–]/g, '-').replace(',', '.');
  let m = t.match(/^([+-]?)(\d+(?:\.\d+)?|\.\d+)(?:\/(\d+(?:\.\d+)?))?$/);
  if (!m) throw new Error(`„${s}“ ist keine Zahl. Erlaubt: 3  −7  0,5  1/3`);
  let q = Q.dez(parseFloat(m[2]));
  if (m[3] !== undefined) q = q.div(Q.dez(parseFloat(m[3])));
  return m[1] === '-' ? q.neg() : q;
}

/**
 * Matrix lesen. Regel (eindeutig, auch mit deutschem Komma):
 *   Zeilen mit „;“ oder Zeilenumbruch trennen, Werte mit Leerzeichen trennen. Komma = Dezimalkomma.
 *   „3 7; 5 9; 4 5“   „0,5 −1/3; 2 4“
 * Zusätzlich Python/numpy-Schreibweise mit eckigen Klammern: „[[3,7],[5,9]]“ (dort Komma = Trenner, Punkt = Dezimal).
 */
export function parseMatrix(input) {
  let src = String(input).replace(/␣/g, ' ').trim();
  if (!src) throw new Error('Bitte eine Matrix eingeben.');
  let zeilen;
  if (src.includes('[')) {
    const inner = src.replace(/^\s*(np\.)?(array|matrix)?\(?\s*\[/, '[').replace(/\)\s*$/, '');
    const rows = inner.match(/\[[^\[\]]*\]/g);
    if (!rows) throw new Error('Klammer-Schreibweise nicht erkannt. Beispiel: [[3,7],[5,9]]');
    zeilen = rows.map((r) => r.slice(1, -1).split(',').map((x) => x.trim()).filter((x) => x !== ''));
  } else {
    zeilen = src.split(/[;\n]+/).map((r) => r.trim()).filter(Boolean).map((r) => r.split(/\s+/));
  }
  if (!zeilen.length) throw new Error('Bitte eine Matrix eingeben.');
  const M = zeilen.map((r) => r.map(parseZahl));
  const m = M[0].length;
  M.forEach((r, i) => {
    if (r.length !== m) throw new Error(`Zeile ${i + 1} hat ${r.length} Werte, Zeile 1 hat ${m}. Alle Zeilen brauchen gleich viele Werte (mit Leerzeichen trennen, Zeilen mit ;).`);
  });
  return M;
}

export const dimText = (M) => `(${M.length} × ${M[0].length})`;
export const matText = (M) => M.map((r) => r.map(String));
