// Exakte Brüche für den Zustandsraum-Rechner (z. B. 247/210 statt 1,176).
// Ein Bruch ist { z, n } mit ganzen Zahlen, n > 0, gekürzt. Geht das nicht exakt
// (sehr krumme Kommazahlen), wird mit { z: Zahl, n: 1, ungenau: true } weitergerechnet.

import { fmt } from './poly.js';

const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const sicher = (x) => Number.isSafeInteger(x);

export function bruch(z, n = 1) {
  if (n === 0) throw new Error('Division durch 0.');
  if (!sicher(z) || !sicher(n)) return { z: z / n, n: 1, ungenau: true };
  if (n < 0) { z = -z; n = -n; }
  const g = ggT(z, n);
  return { z: z / g, n: n / g };
}

/** Zahl → Bruch. Erkennt ganze Zahlen, Kommazahlen und Brüche wie 1/3 (Nenner ≤ 100000). */
export function ausZahl(x) {
  if (Number.isInteger(x)) return bruch(x, 1);
  for (let d = 2; d <= 100000; d++) {
    const z = x * d;
    if (Math.abs(z - Math.round(z)) < 1e-9 * Math.max(1, Math.abs(z))) return bruch(Math.round(z), d);
  }
  return { z: x, n: 1, ungenau: true };
}

const ung = (...q) => q.some((b) => b.ungenau);
const wert = (b) => b.z / b.n;
export const Q = {
  wert,
  add: (a, b) => (ung(a, b) ? { z: wert(a) + wert(b), n: 1, ungenau: true } : bruch(a.z * b.n + b.z * a.n, a.n * b.n)),
  sub: (a, b) => Q.add(a, Q.neg(b)),
  neg: (a) => ({ ...a, z: -a.z }),
  mul: (a, b) => (ung(a, b) ? { z: wert(a) * wert(b), n: 1, ungenau: true } : bruch(a.z * b.z, a.n * b.n)),
  div: (a, b) => {
    if (b.z === 0) throw new Error('Division durch 0.');
    return ung(a, b) ? { z: wert(a) / wert(b), n: 1, ungenau: true } : bruch(a.z * b.n, a.n * b.z);
  },
  istNull: (a) => Math.abs(wert(a)) < 1e-12,
  istEins: (a) => Math.abs(wert(a) - 1) < 1e-12,
  istGanz: (a) => !a.ungenau && a.n === 1,
};

/** Bruch als Text: "−247/210", "3", bei ungenau Dezimalzahl. */
export function btext(b) {
  if (b.ungenau || b.n === 1) return fmt(b.z);
  return (b.z < 0 ? '−' : '') + Math.abs(b.z) + '/' + b.n;
}

/** Ungekürzter Quotient zweier ganzer Zahlen wie in der Musterlösung: "10/30". Sonst gekürzt. */
export function roh(z, n) {
  if (Q.istGanz(z) && Q.istGanz(n) && n.z !== 1 && n.z !== -1) {
    const neg = (z.z < 0) !== (n.z < 0);
    return (neg && z.z !== 0 ? '−' : '') + Math.abs(z.z) + '/' + Math.abs(n.z);
  }
  return btext(Q.div(z, n));
}
