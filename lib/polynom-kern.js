// Kernfunktionen für Polynome mit Zahlen-Koeffizienten (ohne Parameter K):
// exakte Brüche, Polynomdivision mit Rechenweg, pq-/abc-Formel mit Rechenweg,
// alle Nullstellen (exakt rational, wo möglich, sonst numerisch), Produktdarstellung.
// Wird vom Polynom-Rechner und vom DGL-Rechner benutzt. Keine Oberfläche.

import { BP, K, fmt, sup, sub, parsePoly } from './poly.js';

// ---------- Brüche (BigInt, immer gekürzt, Nenner > 0) ----------

const babs = (x) => (x < 0n ? -x : x);
function bgcd(a, b) { a = babs(a); b = babs(b); while (b) [a, b] = [b, a % b]; return a; }

export class Q {
  constructor(n, d = 1n) {
    n = BigInt(n); d = BigInt(d);
    if (d === 0n) throw new Error('Division durch 0.');
    if (d < 0n) { n = -n; d = -d; }
    const g = bgcd(n, d) || 1n;
    this.n = n / g; this.d = d / g;
  }
  static of(x) {
    if (x instanceof Q) return x;
    if (typeof x === 'bigint') return new Q(x);
    if (Number.isInteger(x)) return new Q(BigInt(x));
    // Kettenbruch: Dezimalzahl → Bruch (0,333… → 1/3)
    const sgn = x < 0 ? -1n : 1n;
    let v = Math.abs(x);
    let [h0, h1, k0, k1] = [0n, 1n, 1n, 0n];
    let r = v;
    for (let i = 0; i < 40; i++) {
      const a = Math.floor(r);
      const ab = BigInt(a);
      [h0, h1] = [h1, ab * h1 + h0];
      [k0, k1] = [k1, ab * k1 + k0];
      const approx = Number(h1) / Number(k1);
      if (Math.abs(approx - v) <= 1e-12 * Math.max(1, v) || k1 > 10n ** 12n) break;
      const f = r - a;
      if (f < 1e-15) break;
      r = 1 / f;
    }
    return new Q(sgn * h1, k1);
  }
  add(o) { o = Q.of(o); return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = Q.of(o); return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = Q.of(o); return new Q(this.n * o.n, this.d * o.d); }
  div(o) { o = Q.of(o); return new Q(this.n * o.d, this.d * o.n); }
  neg() { return new Q(-this.n, this.d); }
  isZero() { return this.n === 0n; }
  isInt() { return this.d === 1n; }
  sign() { return this.n > 0n ? 1 : this.n < 0n ? -1 : 0; }
  num() { return Number(this.n) / Number(this.d); }
  abs() { return new Q(babs(this.n), this.d); }
  /** Exakte Wurzel, falls Zähler und Nenner Quadratzahlen sind, sonst null. */
  sqrt() {
    if (this.n < 0n) return null;
    const r = (x) => { const s = BigInt(Math.round(Math.sqrt(Number(x)))); for (const c of [s - 1n, s, s + 1n]) if (c >= 0n && c * c === x) return c; return null; };
    const a = r(this.n), b = r(this.d);
    return a !== null && b !== null ? new Q(a, b) : null;
  }
  /** Text: "−1/32", "5", "46/15" */
  toString() {
    const s = this.n < 0n ? '−' : '';
    return s + babs(this.n) + (this.d === 1n ? '' : '/' + this.d);
  }
}

/** Nur 2er/5er im Nenner → endliche Dezimalzahl */
const dezimalEndlich = (q) => { let d = q.d; while (d % 2n === 0n) d /= 2n; while (d % 5n === 0n) d /= 5n; return d === 1n; };

/** Koeffizient für die Anzeige: ganze Zahl, Komma-Zahl (0,35) oder Bruch (1/3). */
export function cfmt(q) {
  q = Q.of(q);
  if (q.isInt()) return q.toString();
  if (dezimalEndlich(q) && q.d <= 10000n) return fmt(q.num(), 6);
  if (q.d <= 100000n) return q.toString();
  return fmt(q.num());
}

/** Bruch mit Dezimalwert: "−1/32 ≈ −0,03125" (ganze Zahlen ohne ≈). */
export function qfmtLang(q) {
  q = Q.of(q);
  if (q.isInt()) return q.toString();
  return `${q} ≈ ${dez(q.num())}`;
}

/** Dezimalzahl mit 4 gültigen Stellen: −0,03125, −0,06667, 0,4142 */
export function dez(x) {
  const a = Math.abs(x);
  const d = a >= 1 || a === 0 ? 4 : Math.min(10, 3 - Math.floor(Math.log10(a)));
  return fmt(x, d);
}

// ---------- Polynome: Array von Q, aufsteigend (p[i] = Koeffizient von sⁱ) ----------

export function qtrim(p) {
  const q = p.map(Q.of);
  while (q.length > 1 && q[q.length - 1].isZero()) q.pop();
  return q.length ? q : [new Q(0)];
}
export const qdeg = (p) => qtrim(p).length - 1;

/** Liest ein Polynom (parsePoly) und macht exakte Brüche daraus. Kein K erlaubt. */
export function leseQPoly(text, wasFuer = 'Polynom') {
  if (!String(text ?? '').trim()) throw new Error(`Bitte ${wasFuer} eingeben.`);
  const bp = BP.trim(parsePoly(text));
  if (BP.hasParam(bp)) throw new Error(`${wasFuer}: hier bitte ohne K, nur Zahlen und s.`);
  return qtrim(bp.map((k) => Q.of(K.trim(k)[0])));
}

/** Liest eine Zahl wie "−1/3", "-0,5", "5" als Bruch. */
export function leseZahl(text, wasFuer = 'Zahl') {
  const bp = BP.trim(parsePoly(text));
  if (bp.length > 1 || BP.hasParam(bp)) throw new Error(`${wasFuer}: bitte eine Zahl eingeben, z. B. −1/3 oder −5.`);
  return Q.of(K.trim(bp[0])[0]);
}

/** Polynom als Text, absteigend: "30s³ + s² − 6s − 1" (Brüche als 1/3·s). */
export function pfmt(p, v = 's') {
  p = qtrim(p);
  const parts = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i];
    if (c.isZero()) continue;
    parts.push(term(c, i, v));
  }
  if (!parts.length) return '0';
  return parts.map((t, i) => (i === 0 ? (t.neg ? '−' : '') + t.body : (t.neg ? ' − ' : ' + ') + t.body)).join('');
}

/** Ein Summand: {neg, body}, z. B. c = −9, i = 2 → {neg: true, body: "9s²"} */
function term(c, i, v = 's') {
  const a = c.abs();
  const sp = i === 0 ? '' : v + (i > 1 ? sup(i) : '');
  let body;
  if (i > 0 && a.n === 1n && a.d === 1n) body = sp;
  else {
    const t = cfmt(a);
    body = i > 0 && t.includes('/') ? t + '·' + sp : t + sp;
  }
  return { neg: c.sign() < 0, body };
}

export function qeval(p, x) { // exakt
  x = Q.of(x);
  return qtrim(p).reduceRight((acc, c) => acc.mul(x).add(c), new Q(0));
}
export function qmul(a, b) {
  const r = Array.from({ length: a.length + b.length - 1 }, () => new Q(0));
  a.forEach((x, i) => b.forEach((y, j) => { r[i + j] = r[i + j].add(Q.of(x).mul(y)); }));
  return qtrim(r);
}

// ---------- Polynomdivision durch (s − r) mit Rechenweg wie in der Musterlösung ----------

/** Linearfaktor als Text: r = −5 → "s + 5", r = −1/3 → "s + 1/3", r = 0 → "s" */
export function linfak(r) {
  r = Q.of(r);
  if (r.isZero()) return 's';
  return r.sign() < 0 ? `s + ${r.abs()}` : `s − ${r}`;
}

/**
 * Schriftliche Polynomdivision p(s) : (s − r).
 * Rückgabe: { quotient, rest, zeilen: [Textzeilen, spaltengerecht ausgerichtet] }
 */
export function polynomdivision(p, r) {
  p = qtrim(p); r = Q.of(r);
  const n = p.length - 1;
  if (n < 1) throw new Error('Polynomdivision braucht mindestens Grad 1.');
  const cur = p.slice();
  const quot = new Array(n).fill(null).map(() => new Q(0));
  // Zeilen als Liste von {cells: {potenz: text}, art: 'start'|'minus'|'rest'|'linie'}
  const rows = [];
  // Zelle für einen Summanden: erster Summand der Zeile ohne Leerzeichen-Vorzeichen
  const zelle = (c, i, erster) => {
    const t = term(c, i);
    return erster ? (t.neg ? '−' : '') + t.body : (t.neg ? ' − ' : ' + ') + t.body;
  };
  const zeile = (terms, auf, zu) => { // terms: [[potenz, Q]]
    const cells = {};
    const sichtbar = terms.filter(([, c]) => !c.isZero());
    const liste = sichtbar.length ? sichtbar : [terms[terms.length - 1]];
    liste.forEach(([i, c], k) => {
      let t = zelle(c, i, k === 0);
      if (k === 0) t = auf + t;
      if (k === liste.length - 1) t += zu;
      cells[i] = t;
    });
    return cells;
  };

  rows.push({ cells: zeile(p.map((c, i) => [i, c]).reverse(), '(', ')'), art: 'start' });
  for (let k = n; k >= 1; k--) {
    const q = cur[k];
    quot[k - 1] = q;
    const subHi = q, subLo = q.mul(r).neg(); // q·s^(k−1)·(s − r) = q·s^k − q·r·s^(k−1)
    rows.push({ cells: zeile([[k, subHi], [k - 1, subLo]], '−(', ')'), art: 'minus' });
    cur[k] = new Q(0);
    cur[k - 1] = cur[k - 1].sub(subLo);
    rows.push({ art: 'linie', von: k, bis: k - 1 });
    const rest = [[k - 1, cur[k - 1]]];
    if (k - 2 >= 0) rest.push([k - 2, cur[k - 2]]); // nächsten Summanden herunterholen
    if (k === 1) rows.push({ cells: { 0: cur[0].isZero() ? '0' : zelle(cur[0], 0, true) }, art: 'rest' });
    else rows.push({ cells: zeile(rest, '', ''), art: 'rest' });
  }
  const rest = cur[0];
  const quotient = qtrim(quot);

  // Spaltenbreiten (rechtsbündig je Potenz)
  const breite = {};
  for (const row of rows) if (row.cells) for (const [i, t] of Object.entries(row.cells)) breite[i] = Math.max(breite[i] || 0, [...t].length);
  for (let i = 0; i <= n; i++) breite[i] = breite[i] || 0;
  const spalten = Array.from({ length: n + 1 }, (_, j) => n - j); // n … 0
  const zeilen = [];
  rows.forEach((row, idx) => {
    if (row.art === 'linie') {
      let start = 0, len = 0;
      for (const i of spalten) { if (i > row.von) start += breite[i]; else if (i >= row.bis) len += breite[i]; }
      zeilen.push(' '.repeat(start) + '─'.repeat(len));
      return;
    }
    let t = spalten.map((i) => (row.cells[i] ?? '').padStart(breite[i])).join('');
    if (idx === 0) t += ` : (${linfak(r)}) = ${pfmt(quotient)}`;
    zeilen.push(t.replace(/\s+$/, ''));
  });
  return { quotient, rest, zeilen };
}

// ---------- pq- und abc-Formel mit Rechenweg ----------

const nm = (i) => 's' + sub(i);

/**
 * Löst a s² + b s + c = 0 mit Rechenweg (pq-Formel wie in der Musterlösung, dazu abc-Formel).
 * idx: Index der ersten Lösung (s₂ bei bekannter s₁). Rückgabe { zeilen, wurzeln: [Wurzel, Wurzel] }
 */
export function quadratisch(p, idx = 1, lab = nm) {
  p = qtrim(p);
  if (p.length !== 3) throw new Error('quadratisch: Grad 2 erwartet');
  const [c, b, a] = p;
  const zeilen = [];
  const A = lab(idx), B = lab(idx + 1), AB = lab(idx) + ',' + sub(idx + 1);
  zeilen.push({ text: `${pfmt(p)} = 0`, strong: true });

  // Normieren
  const P = b.div(a), Qq = c.div(a);
  const roh = (x, y) => (Q.of(y).n === 1n && Q.of(y).d === 1n ? cfmt(x) : x.div(y).isInt() ? x.div(y).toString() : `${cfmt(x)}/${cfmt(y)}`);
  if (!(a.n === 1n && a.d === 1n)) {
    zeilen.push({ text: `durch ${cfmt(a)} teilen (Normalform s² + p·s + q = 0):`, muted: true });
    // wie Musterlösung: ungekürzt "s² + 46/15·s + 3/15 = 0"
    const sgn = (x) => (x.sign() < 0 ? ' − ' : ' + ');
    let t = 's²';
    if (!b.isZero()) t += sgn(b) + roh(b.abs(), a) + (roh(b.abs(), a) === '1' ? 's' : roh(b.abs(), a).includes('/') ? '·s' : 's');
    if (!c.isZero()) t += sgn(c) + roh(c.abs(), a);
    zeilen.push({ text: t + ' = 0' });
  }
  const pT = P.toString(), qT = Qq.toString();
  zeilen.push({ text: `p = ${roh(b, a)}${roh(b, a) !== pT ? ' = ' + pT : ''},   q = ${roh(c, a)}${roh(c, a) !== qT ? ' = ' + qT : ''}` });
  zeilen.push({ text: `pq-Formel: ${AB} = −p/2 ± √((p/2)² − q)`, muted: true });

  const h = P.div(2).neg(); // −p/2
  const p2 = P.div(2);
  const p2q = p2.mul(p2);
  const D = p2q.sub(Qq); // Diskriminante (p/2)² − q
  // gemeinsamer Nenner für die Anzeige
  const lcm = (x, y) => (x / bgcd(x, y)) * y;
  const L = lcm(p2q.d, Qq.d);
  const erw = (x) => (x.d === L ? x.toString() : `${x.n * (L / x.d) < 0n ? '−' : ''}${babs(x.n * (L / x.d))}/${L}`);
  const klam = (x) => (x.sign() < 0 || !x.isInt() ? `(${x})` : x.toString());
  let dZeile = `${AB} = ${h} ± √(${klam(p2)}² − ${klam(Qq)})`;
  const erwK = (x) => (x.sign() < 0 ? `(${erw(x)})` : erw(x));
  if (L !== 1n) dZeile += ` = ${h} ± √(${erw(p2q)} − ${erwK(Qq)})`;
  else dZeile += ` = ${h} ± √(${p2q} − ${klam(Qq)})`;
  dZeile += ` = ${h} ± √(${D})`;
  zeilen.push({ text: dZeile });

  let wurzeln;
  if (D.sign() >= 0) {
    const w = D.sqrt();
    if (w) {
      const r1 = h.add(w), r2 = h.sub(w);
      zeilen.push({ text: `${AB} = ${h} ± ${w}` });
      zeilen.push({ text: `${A} = ${h} + ${w} = ${qfmtLang(r1)}`, strong: true });
      zeilen.push({ text: `${B} = ${h} − ${w} = ${qfmtLang(r2)}`, strong: true });
      wurzeln = [wq(r1), wq(r2)];
    } else {
      const wn = Math.sqrt(D.num());
      const r1 = h.num() + wn, r2 = h.num() - wn;
      zeilen.push({ text: `${AB} = ${dez(h.num())} ± ${dez(wn)}   (√${D} ≈ ${dez(wn)}, keine glatte Wurzel)` });
      zeilen.push({ text: `${A} ≈ ${dez(r1)}`, strong: true });
      zeilen.push({ text: `${B} ≈ ${dez(r2)}`, strong: true });
      wurzeln = [wn === 0 ? wq(h) : wz(r1, 0), wn === 0 ? wq(h) : wz(r2, 0)];
    }
    if (D.isZero()) zeilen.push({ text: 'Wurzel = 0 → doppelte Nullstelle.', muted: true });
  } else {
    const wq2 = D.neg().sqrt();
    const im = wq2 ? wq2.num() : Math.sqrt(-D.num());
    const imT = wq2 ? wq2.toString() : fmt(im);
    zeilen.push({ text: `Unter der Wurzel negativ (${D} < 0) → konjugiert komplexe Nullstellen:`, muted: true });
    zeilen.push({ text: `${AB} = ${h} ± j·√(${D.neg()}) = ${h} ± ${imT}j` });
    zeilen.push({ text: `${A} = ${h} + ${imT}j,   ${B} = ${h} − ${imT}j`, strong: true });
    wurzeln = [{ re: h.num(), im, exakt: null, reQ: h }, { re: h.num(), im: -im, exakt: null, reQ: h }];
  }

  // abc-Formel als Alternative (ganzzahlig, gut zum Abschreiben)
  const Dabc = b.mul(b).sub(a.mul(c).mul(4));
  const kl = (x) => (x.sign() < 0 ? `(${x})` : x.toString());
  let abc = `abc-Formel: ${AB} = (−b ± √(b² − 4ac)) / 2a = (${b.neg()} ± √(${kl(b)}² − 4·${kl(a)}·${kl(c)})) / ${a.mul(2)}`;
  abc += ` = (${b.neg()} ± √(${Dabc})) / ${a.mul(2)}`;
  const wabc = Dabc.sign() >= 0 ? Dabc.sqrt() : null;
  if (wabc) {
    const z1 = b.neg().add(wabc), z2 = b.neg().sub(wabc), n2 = a.mul(2);
    const q1 = z1.div(n2), q2 = z2.div(n2);
    const bruch = (z) => (n2.isInt() && z.isInt() ? `${z}/${n2}` : `(${z})/(${n2})`);
    abc += ` = (${b.neg()} ± ${wabc}) / ${n2} → ${bruch(z1)} = ${q1};  ${bruch(z2)} = ${q2}`;
  }
  zeilen.push({ text: abc, muted: true });
  return { zeilen, wurzeln };
}

// ---------- Nullstellen allgemein ----------

/** Wurzel-Objekt: {re, im, exakt: Q|null} */
const wq = (q) => ({ re: q.num(), im: 0, exakt: q });
const wz = (re, im) => ({ re, im, exakt: null });

/** Wurzel als Text: "−1/32", "−0,4142", "−0,5 + 1,32j" */
export function wfmt(w, lang = false) {
  if (w.exakt) return lang ? qfmtLang(w.exakt) : w.exakt.toString();
  if (Math.abs(w.im) < 1e-12) return dez(w.re);
  const re = Math.abs(w.re) < 1e-12 ? '' : dez(w.re) + ' ';
  return `${re}${w.im < 0 ? '−' : re ? '+' : ''}${re ? ' ' : ''}${dez(Math.abs(w.im))}j`;
}

// komplexe Hilfen
const cmul = (p, q) => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]];
const cdiv = (p, q) => { const d = q[0] ** 2 + q[1] ** 2; return [(p[0] * q[0] + p[1] * q[1]) / d, (p[1] * q[0] - p[0] * q[1]) / d]; };

/** Numerische Nullstellen (Durand-Kerner + Newton-Politur). koef: Zahlen, aufsteigend. */
export function numWurzeln(koef) {
  const n = koef.length - 1;
  if (n < 1) return [];
  if (n === 1) return [[-koef[0] / koef[1], 0]];
  const a = koef.map((c) => c / koef[n]);
  if (n === 2) {
    const [c, b] = a, D = b * b / 4 - c;
    if (D >= 0) { const w = Math.sqrt(D); const r1 = -b / 2 - Math.sign(b || 1) * w; const r2 = r1 !== 0 ? c / r1 : -b / 2 + w; return [[r1, 0], [r2, 0]]; }
    return [[-b / 2, Math.sqrt(-D)], [-b / 2, -Math.sqrt(-D)]];
  }
  const R = 1 + Math.max(...a.slice(0, -1).map(Math.abs));
  const rad = Math.min(R, Math.max(...a.slice(0, -1).map((c, i) => Math.abs(c) ** (1 / (n - i)))) || 1);
  let z = Array.from({ length: n }, (_, k) => [rad * Math.cos(0.4 + 2 * Math.PI * k / n), rad * Math.sin(0.4 + 2 * Math.PI * k / n)]);
  const f = (x) => a.reduceRight((acc, c) => { const m = cmul(acc, x); return [m[0] + c, m[1]]; }, [0, 0]);
  for (let it = 0; it < 3000; it++) {
    let maxd = 0;
    z = z.map((zi, i) => {
      let den = [1, 0];
      z.forEach((zj, j) => { if (i !== j) den = cmul(den, [zi[0] - zj[0], zi[1] - zj[1]]); });
      const d = cdiv(f(zi), den);
      maxd = Math.max(maxd, Math.hypot(d[0], d[1]) / Math.max(1e-300, Math.hypot(zi[0], zi[1])));
      return [zi[0] - d[0], zi[1] - d[1]];
    });
    if (maxd < 1e-15 && it > 20) break;
  }
  return z;
}

function teiler(x) {
  x = babs(x);
  const out = [];
  if (x === 0n) return out;
  if (x > 10n ** 14n) return [1n]; // zu groß, nur triviale Teiler
  const lim = BigInt(Math.floor(Math.sqrt(Number(x))));
  for (let i = 1n; i <= lim; i++) if (x % i === 0n) { out.push(i); if (i * i !== x) out.push(x / i); }
  return out;
}

/** Ganzzahliges Polynom (BigInt, aufsteigend) aus Q-Polynom (mit Hauptnenner multipliziert). */
function ganzzahlig(p) {
  let L = 1n;
  for (const c of p) L = (L / bgcd(L, c.d)) * c.d;
  return p.map((c) => c.n * (L / c.d));
}
function bigEval(z, num, den) { // Σ z_i num^i den^(n−i)
  const n = z.length - 1;
  let s = 0n;
  for (let i = 0; i <= n; i++) s += z[i] * num ** BigInt(i) * den ** BigInt(n - i);
  return s;
}
function bigDefl(z, num, den) { // z(s) / (den·s − num), exakt ganzzahlig
  const n = z.length - 1;
  const out = new Array(n).fill(0n);
  let r = z.slice();
  for (let k = n; k >= 1; k--) {
    const q = r[k] / den;
    out[k - 1] = q;
    r[k] -= q * den; r[k - 1] += q * num;
  }
  return out;
}

/**
 * Alle Nullstellen eines Q-Polynoms. Rationale Nullstellen werden exakt gefunden
 * (Satz über rationale Nullstellen, Probe mit ganzen Zahlen), der Rest numerisch.
 * Sortiert nach Realteil aufsteigend.
 */
export function nullstellen(p) {
  p = qtrim(p);
  if (p.length < 2) return [];
  let z = ganzzahlig(p);
  const out = [];
  // Nullstelle 0 abspalten
  while (z.length > 1 && z[0] === 0n) { out.push(wq(new Q(0))); z = z.slice(1); }
  for (let runde = 0; runde < 50 && z.length > 1; runde++) {
    const num = numWurzeln(z.map(Number));
    let gefunden = false;
    for (const [re, im] of num) {
      if (Math.abs(im) > 1e-4 * Math.max(1, Math.abs(re))) continue;
      for (const q of teiler(z[z.length - 1])) {
        const pn = BigInt(Math.round(re * Number(q)));
        if (pn === 0n || bgcd(pn, q) !== 1n) continue; // nur gekürzte Brüche (sonst geht die Division nicht ganzzahlig auf)
        if (Math.abs(Number(pn) / Number(q) - re) > 1e-4 * Math.max(1e-3, Math.abs(re))) continue;
        if (bigEval(z, pn, q) === 0n) {
          out.push(wq(new Q(pn, q)));
          z = bigDefl(z, pn, q);
          gefunden = true;
          break;
        }
      }
      if (gefunden) break;
    }
    if (!gefunden) break;
  }
  if (z.length > 1) {
    for (const [re, im] of numWurzeln(z.map(Number))) {
      const reell = Math.abs(im) < 1e-9 * Math.max(1, Math.abs(re));
      out.push(wz(re, reell ? 0 : im));
    }
  }
  return sortiere(out);
}

export function sortiere(ws) {
  return ws.slice().sort((x, y) => x.re - y.re || y.im - x.im);
}

// ---------- Stabilität ----------

/** Urteil über Polstellen: {stabil: true|false|'grenz', text} */
export function stabilitaet(pole, namen) {
  const tol = 1e-12;
  const name = (i) => (namen ? namen[i] : nm(i + 1));
  const pos = pole.map((w, i) => [w, i]).filter(([w]) => w.re > tol);
  const null0 = pole.map((w, i) => [w, i]).filter(([w]) => Math.abs(w.re) <= tol);
  if (pos.length) {
    const t = pos.map(([w, i]) => `Re{${name(i)}} = ${wfmt({ ...w, im: 0, exakt: w.exakt || w.reQ || null })} > 0`).join(', ');
    return { stabil: false, text: `System nicht stabil (positiver Realteil): ${t}` };
  }
  if (null0.length) {
    const t = null0.map(([, i]) => name(i)).join(', ');
    return { stabil: 'grenz', text: `Pol auf der imaginären Achse (${t}: Re = 0) → nicht asymptotisch stabil (Grenzfall)` };
  }
  return { stabil: true, text: 'Alle Pole links der imaginären Achse (Re < 0) → System ist stabil' };
}

// ---------- Produktdarstellung ----------

/** Fasst gleiche Wurzeln und konjugiert komplexe Paare zusammen. */
function gruppiere(ws) {
  const out = [];
  // Wurzel 0 (Faktor s) nach vorne: s(4s + 1)… wie in der Vorlesung
  ws = [...ws.filter((w) => w.re === 0 && w.im === 0), ...ws.filter((w) => !(w.re === 0 && w.im === 0))];
  const rest = ws.slice();
  while (rest.length) {
    const w = rest.shift();
    if (Math.abs(w.im) > 0) {
      const j = rest.findIndex((u) => Math.abs(u.re - w.re) < 1e-7 * Math.max(1, Math.abs(w.re)) && Math.abs(u.im + w.im) < 1e-7 * Math.max(1, Math.abs(w.im)));
      if (j >= 0) rest.splice(j, 1);
      out.push({ art: 'paar', re: w.re, im: Math.abs(w.im), reQ: w.reQ, mult: 1 });
      continue;
    }
    const gleich = (u) => (w.exakt && u.exakt ? u.exakt.sub(w.exakt).isZero() : Math.abs(u.re - w.re) < 1e-7 * Math.max(1, Math.abs(w.re)) && u.im === 0);
    let mult = 1;
    for (let j = rest.length - 1; j >= 0; j--) if (gleich(rest[j])) { rest.splice(j, 1); mult++; }
    out.push({ art: 'reell', w, mult });
  }
  return out;
}
const hoch = (t, m) => (m > 1 ? `${t}${sup(m)}` : t);

/** Faktor (s − sᵢ) */
function faktorS(g) {
  if (g.art === 'paar') {
    const p = -2 * g.re, q = g.re ** 2 + g.im ** 2;
    return hoch(`(s² ${p < 0 ? '−' : '+'} ${fmt(Math.abs(p))}s + ${fmt(q)})`, g.mult);
  }
  const w = g.w;
  if (w.exakt) return w.exakt.isZero() ? hoch('s', g.mult) : hoch(`(${linfak(w.exakt)})`, g.mult);
  return hoch(`(s ${w.re < 0 ? '+' : '−'} ${fmt(Math.abs(w.re))})`, g.mult);
}
/** Faktor (T·s + 1) und Beitrag zur Verstärkung (−sᵢ bzw. q) */
function faktorT(g) {
  if (g.art === 'paar') {
    const p = -2 * g.re, q = g.re ** 2 + g.im ** 2;
    return { t: hoch(`(${fmt(1 / q)}s² ${p < 0 ? '−' : '+'} ${fmt(Math.abs(p / q))}s + 1)`, g.mult), k: Q.of(q), kNum: q ** g.mult };
  }
  const w = g.w;
  if (w.exakt) {
    if (w.exakt.isZero()) return { t: hoch('s', g.mult), k: new Q(1), kNum: 1 };
    const T = new Q(-1n).div(w.exakt); // T = −1/sᵢ
    const Tt = T.abs().n === 1n && T.abs().d === 1n ? '' : cfmt(T.abs()) + (cfmt(T.abs()).includes('/') ? '·' : '');
    return { t: hoch(`(${T.sign() < 0 ? '−' : ''}${Tt}s + 1)`, g.mult), k: w.exakt.neg(), kNum: (-w.re) ** g.mult, exakt: true, mult: g.mult };
  }
  const T = -1 / w.re;
  return { t: hoch(`(${T < 0 ? '−' : ''}${fmt(Math.abs(T))}s + 1)`, g.mult), k: null, kNum: (-w.re) ** g.mult };
}

/** Verstärkungsfaktor als Text: exakt, wenn möglich */
function vfmt(v) { return v.q ? cfmt(v.q) : fmt(v.n); }
function vMul(v, f) { // f: {k: Q|null, kNum, mult}
  if (v.q && f.k && f.exakt) { let q = v.q; for (let i = 0; i < (f.mult || 1); i++) q = q.mul(f.k); return { q, n: q.num() }; }
  if (v.q && f.k && !f.exakt && f.kNum === 1) return v;
  return { q: null, n: v.n * f.kNum };
}

/**
 * Produktdarstellung eines Polynoms mit Leitkoeffizient a und Wurzeln.
 * Rückgabe { s: "480·(s + 5)(s + 1/32)(s + 1/15)", t: "(s + 5)… → V·(Ts+1)…", V }
 */
export function produkt(a, wurzeln, bekannt = []) {
  a = Q.of(a);
  const grp = gruppiere(wurzeln);
  const sFak = grp.map(faktorS).join('');
  let V = { q: a, n: a.num() };
  const tFak = grp.map((g) => { const f = faktorT(g); V = vMul(V, f); return f.t; }).join('');
  // gemischt (wie Musterlösung K2/K3 A11): bekannte Wurzeln als (s − s₁), Rest als (Ts + 1)
  let gemischt = null;
  if (bekannt.length) {
    const restW = [], bekW = [];
    const verbraucht = bekannt.map(() => false);
    for (const w of wurzeln) {
      const j = bekannt.findIndex((b, k) => !verbraucht[k] && w.exakt && w.exakt.sub(b).isZero());
      if (j >= 0) { verbraucht[j] = true; bekW.push(w); } else restW.push(w);
    }
    let Vg = { q: a, n: a.num() };
    const tr = gruppiere(restW).map((g) => { const f = faktorT(g); Vg = vMul(Vg, f); return f.t; });
    gemischt = vorfaktor(Vg, [...gruppiere(bekW).map(faktorS), ...tr].join(''));
  }
  return {
    s: vorfaktor({ q: a, n: a.num() }, sFak), t: vorfaktor(V, tFak), sFak, tFak,
    V: V.q ? V.q.num() : V.n, Vq: V.q, Vtext: vfmt(V), gemischt,
  };
}

/** "480·" vor die Faktoren; 1 weglassen, −1 als "−"; ohne Faktoren nur die Zahl. */
export function vorfaktor(v, fak) {
  const t = v.q ? cfmt(v.q) : fmt(v.n);
  if (fak === '') return t;
  if (t === '1') return fak;
  if (t === '−1') return '−' + fak;
  return t + '·' + fak;
}

/** Aus Wurzeln und Leitkoeffizient wieder ausmultiplizieren (für die Probe, numerisch). */
export function ausmultiplizieren(a, wurzeln) {
  let p = [[Q.of(a).num(), 0]];
  for (const w of wurzeln) {
    const neu = Array.from({ length: p.length + 1 }, () => [0, 0]);
    p.forEach((c, i) => {
      neu[i + 1][0] += c[0]; neu[i + 1][1] += c[1];
      const m = cmul(c, [-w.re, -w.im]);
      neu[i][0] += m[0]; neu[i][1] += m[1];
    });
    p = neu;
  }
  return p.map((c) => c[0]);
}

/**
 * Nullstellen eines Polynoms mit Rechenweg.
 * bekannt: Liste bekannter Nullstellen (Q) → Polynomdivision.
 * name: z. B. "N(s)" oder "Z(s)".
 * Rückgabe { schritte, wurzeln (in Reihenfolge s₁, s₂, …), namen }
 */
export function nullstellenMitWeg(p, { bekannt = [], name = 'N(s)', titelArt = 'Nullstellen', lab = nm } = {}) {
  p = qtrim(p);
  const n = p.length - 1;
  const schritte = [];
  const wurzeln = [];
  if (n < 1) {
    schritte.push({ titel: `${titelArt} von ${name}`, zeilen: [{ text: `${name} = ${pfmt(p)} ist konstant → keine ${titelArt}.` }] });
    return { schritte, wurzeln };
  }
  let cur = p;
  // Nullstelle s = 0 direkt (a₀ = 0) – nur ohne bekannte Wurzeln automatisch
  bekannt.forEach((r, k) => {
    const label = lab(wurzeln.length + 1);
    if (qdeg(cur) < 1) throw new Error('Mehr bekannte Nullstellen als der Grad des Polynoms.');
    const d = polynomdivision(cur, r);
    if (!d.rest.isZero()) {
      throw new Error(`${label} = ${r} ist keine Nullstelle von ${pfmt(cur)}: Die Division geht nicht auf (Rest ${d.rest}). Vorzeichen und Zahlen prüfen.`);
    }
    schritte.push({
      titel: `Polynomdivision durch (${linfak(r)})`,
      zeilen: [
        { text: `Gegebene ${titelArt === 'Polstellen' ? 'Polstelle' : 'Nullstelle'}: ${label} = ${r} → Linearfaktor (s − ${label}) = (${linfak(r)})` },
        { text: `Probe: ${name.replace('(s)', '')}(${r}) = 0 ✓`, muted: true },
        ...d.zeilen.map((t) => ({ text: t })),
        { text: `Verbleibender Term: ${pfmt(d.quotient)}`, strong: true },
      ],
    });
    wurzeln.push(wq(r));
    cur = d.quotient;
    void k;
  });

  const m = qdeg(cur);
  if (m === 0) return { schritte, wurzeln };
  const ab = wurzeln.length + 1;
  if (m === 1) {
    const r = cur[0].neg().div(cur[1]);
    schritte.push({
      titel: bekannt.length ? 'Verbleibenden Term lösen' : `${titelArt} von ${name}`,
      zeilen: [
        { text: `${pfmt(cur)} = 0` },
        { text: `${lab(ab)} = ${cur[0].neg()}/${cur[1].sign() < 0 ? '(' + cur[1] + ')' : cur[1]} = ${qfmtLang(r)}`, strong: true },
      ],
    });
    wurzeln.push(wq(r));
  } else if (m === 2) {
    const qd = quadratisch(cur, ab, lab);
    schritte.push({ titel: bekannt.length ? 'Verbleibenden Term mit pq-Formel lösen' : `${titelArt} mit pq-Formel`, zeilen: qd.zeilen });
    wurzeln.push(...qd.wurzeln);
  } else {
    const ws = nullstellen(cur);
    const zeilen = [
      { text: `${pfmt(cur)} = 0   (Grad ${m})` },
      { text: `Grad ≥ 3 ohne bekannte Nullstelle: Lösung numerisch (wie pole()/zero() in Python).`, muted: true },
    ];
    ws.forEach((w, i) => zeilen.push({ text: `${lab(ab + i)} = ${wfmt(w, true)}`, strong: true }));
    const exakt = ws.filter((w) => w.exakt);
    if (exakt.length) {
      zeilen.push({
        text: `Von Hand zeigen: eine Nullstelle einsetzen (Probe, z. B. ${name.replace('(s)', '')}(${exakt[0].exakt}) = 0), dann Polynomdivision durch (${linfak(exakt[0].exakt)}) und pq-Formel für den Rest. Tipp: Wert ins Feld „bekannte Nullstelle“ eintragen.`,
        muted: true,
      });
    } else {
      zeilen.push({ text: 'Keine glatte (rationale) Nullstelle → von Hand nur mit bekannter Nullstelle oder numerisch.', muted: true });
    }
    schritte.push({ titel: bekannt.length ? 'Verbleibenden Term lösen (numerisch)' : `${titelArt} von ${name} (numerisch)`, zeilen });
    wurzeln.push(...ws);
  }
  return { schritte, wurzeln };
}

export { fmt };

/** Polynom in Klammern, wenn es mehrere Summanden hat: "2" bzw. "(s² + 3s + 2)" */
export function pkl(p) {
  const t = pfmt(p);
  return qtrim(p).filter((c) => !c.isZero()).length > 1 ? `(${t})` : t;
}
