// Gebrochen-rationale Funktionen in s für den Regelkreis-Rechner.
// Ein Bruch wird in Faktoren gehalten, damit der Rechenweg wie in der Musterlösung aussieht:
//   s(1 + 3s)(1 + 5s)(1 + 7s) statt 105s⁴ + 71s³ + 15s² + s.
// Faktorliste F = { c: kpoly (Konstante, darf K enthalten), s: Potenz von s, g: [{ p: bpoly, txt, e, teile? }] }
// Bruch R = { num: F, den: F }

import { K, BP, fmt, frac, sup, kfmt, bfmt } from './poly.js';

const EPS = 1e-9;

// ---------- Faktorlisten ----------

export const eins = () => ({ c: [1], s: 0, g: [] });

function kopie(F) {
  return { c: F.c.slice(), s: F.s, g: F.g.map((x) => ({ ...x })) };
}

export function mulF(a, b) {
  return { c: K.mul(a.c, b.c), s: a.s + b.s, g: [...a.g.map((x) => ({ ...x })), ...b.g.map((x) => ({ ...x }))] };
}

/** Ausmultipliziertes Polynom (bpoly) einer Faktorliste. */
export function polyF(F) {
  let p = [F.c];
  for (let i = 0; i < F.s; i++) p = BP.mul(p, [[0], [1]]);
  for (const g of F.g) for (let i = 0; i < g.e; i++) p = BP.mul(p, g.p);
  return BP.trim(p);
}

/** Wert eines bpoly bei s = 0 als kpoly. */
const bei0 = (p) => BP.trim(p)[0];

/** Zwei bpolys proportional? Liefert r mit a = r·b (nur für Zahlen-Koeffizienten), sonst null. */
function verhaeltnis(a, b) {
  a = BP.trim(a); b = BP.trim(b);
  if (a.length !== b.length) return null;
  if (BP.hasParam(a) || BP.hasParam(b)) {
    const gleich = a.every((k, i) => { const d = K.sub(k, b[i]); return K.isZero(d); });
    return gleich ? 1 : null;
  }
  const n = a.length - 1;
  const r = a[n][0] / b[n][0];
  for (let i = 0; i <= n; i++) {
    if (Math.abs(a[i][0] - r * b[i][0]) > EPS * Math.max(1, Math.abs(a[i][0]))) return null;
  }
  return r;
}

/** Gemeinsame Faktoren (s-Potenzen und gleiche Klammern) in Zähler und Nenner kürzen. Gibt auch zurück, was gekürzt wurde. */
export function kuerzen(R) {
  const num = kopie(R.num), den = kopie(R.den);
  const weg = [];
  const m = Math.min(num.s, den.s);
  if (m > 0) { num.s -= m; den.s -= m; weg.push('s' + (m > 1 ? sup(m) : '')); }
  for (const gz of num.g) {
    for (const gn of den.g) {
      if (!gz.e || !gn.e) continue;
      const r = verhaeltnis(gz.p, gn.p);
      if (r === null) continue;
      const k = Math.min(gz.e, gn.e);
      gz.e -= k; gn.e -= k;
      if (r !== 1) num.c = K.scale(num.c, r ** k);
      weg.push('(' + gz.txt + ')' + (k > 1 ? sup(k) : ''));
    }
  }
  num.g = num.g.filter((g) => g.e > 0);
  den.g = den.g.filter((g) => g.e > 0);
  // Zahlen-Konstanten: gleiche Konstante oben und unten kürzen
  if (K.isConst(num.c) && K.isConst(den.c) && den.c[0] !== 1) {
    const a = num.c[0], b = den.c[0];
    if (Math.abs(a - b) < EPS * Math.abs(b)) { num.c = [1]; den.c = [1]; }
    else if (b < 0) { num.c = [-a]; den.c = [-b]; }
  }
  return { num, den, weg };
}

export function mulR(a, b) {
  return kuerzen({ num: mulF(a.num, b.num), den: mulF(a.den, b.den) });
}
export function divR(a, b) {
  return kuerzen({ num: mulF(a.num, b.den), den: mulF(a.den, b.num) });
}

/** Klammer-Faktor aus Polynom: s-Potenz und reine Zahl herausziehen. */
export function gruppe(p, txt, teile) {
  p = BP.trim(p);
  let k = 0;
  while (k < p.length - 1 && K.isZero(p[k])) k++;
  if (k > 0 && !teile) { p = p.slice(k); txt = null; }
  if (p.length === 1) return { c: p[0], s: k, g: [] };
  return { c: [1], s: k, g: [{ p, txt: txt || bfmt(p, 'K'), e: 1, ...(teile ? { teile } : {}) }] };
}

export function addR(a, b, minus = false) {
  const n1 = polyF(mulF(a.num, b.den));
  let n2 = polyF(mulF(b.num, a.den));
  if (minus) n2 = BP.neg(n2);
  return kuerzen({ num: gruppe(BP.add(n1, n2)), den: mulF(a.den, b.den) });
}

// ---------- Darstellung ----------

const kText = (c) => {
  c = K.trim(c);
  const t = kfmt(c, 'K');
  return c.filter((x) => x !== 0).length > 1 ? '(' + t + ')' : t;
};

/** Faktorliste als Text: "s(1 + 3s)(1 + 5s)", "3", "4s²", "10K(s + 1)". */
export function fmtF(F) {
  const c = K.trim(F.c);
  let t = '';
  const istEins = K.isConst(c) && c[0] === 1;
  const istMinusEins = K.isConst(c) && c[0] === -1;
  if (istMinusEins && (F.s || F.g.length)) t = '−';
  else if (!istEins || (!F.s && !F.g.length)) t = K.isConst(c) ? fmt(c[0]) : kText(c);
  if (F.s) t += (t === '' || /[\d−)]$/.test(t) ? '' : '·') + 's' + (F.s > 1 ? sup(F.s) : '');
  for (const g of F.g) t += '(' + g.txt + ')' + (g.e > 1 ? sup(g.e) : '');
  return t;
}

/** Summe auf oberster Ebene (außerhalb von Klammern)? */
export function hatSumme(t) {
  let tiefe = 0;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (ch === '(' || ch === '[') tiefe++;
    else if (ch === ')' || ch === ']') tiefe--;
    else if (tiefe === 0 && i > 0 && (ch === '+' || ch === '−')) return true;
  }
  return false;
}
export const klammer = (t) => (hatSumme(t) ? '(' + t + ')' : t);

/** Bruch als Text: "1 / (1 + 3s)", "(2s + 1) / 4s", "1 / (1 + 5s)(1 + 7s)" (Nenner = alles hinter /). */
export function fmtR(R, sep = ' / ') {
  const n = fmtF(R.num);
  const denTrivial = K.isConst(R.den.c) && R.den.c[0] === 1 && !R.den.s && !R.den.g.length;
  if (denTrivial) return n;
  return klammer(n) + sep + klammer(fmtF(R.den));
}

/** Ausmultipliziert: "(400s³ + 200s² + 29s + 1) / (81s⁴ + …)" */
export function fmtRExp(R) {
  const n = BP.trim(polyF(R.num)), d = BP.trim(polyF(R.den));
  const nt = bfmt(n, 'K'), dt = bfmt(d, 'K');
  const dEins = d.length === 1 && K.isConst(d[0]) && d[0][0] === 1;
  if (dEins) return nt;
  return klammer(nt) + ' / ' + klammer(dt);
}

/** „s = 0 einsetzen“ für eine Faktorliste, wie in der Musterlösung: s(1+3s)(1+5s) → "0 · 1". */
export function einsetzenF(F) {
  const teile = [];
  if (F.g.length === 1 && F.g[0].teile) {
    return F.g[0].teile.map(einsetzenF).join(' + ');
  }
  const c = K.trim(F.c);
  const cEins = K.isConst(c) && c[0] === 1;
  if (!cEins || (!F.s && !F.g.length)) teile.push(K.isConst(c) ? fmt(c[0]) : kText(c));
  if (F.s) teile.push('0');
  if (F.g.length) {
    let v = [1];
    for (const g of F.g) for (let i = 0; i < g.e; i++) v = K.mul(v, bei0(g.p));
    teile.push(K.isConst(v) ? fmt(v[0]) : kText(v));
  }
  return teile.join(' · ');
}

/** Wert einer Faktorliste bei s = 0 (kpoly). */
export function wertF0(F) {
  if (F.s) return [0];
  if (F.g.length === 1 && F.g[0].teile) return bei0(polyF(F));
  let v = K.trim(F.c);
  for (const g of F.g) for (let i = 0; i < g.e; i++) v = K.mul(v, bei0(g.p));
  return v;
}

// ---------- Eingabe lesen ----------

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';

function tokenize(input) {
  const src = String(input)
    .replace(/[−–]/g, '-')
    .replace(/[·×]/g, '*')
    .replace(/:/g, '/')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => '^' + [...m].map((ch) => SUP.indexOf(ch)).join(''));
  const tokens = [];
  const re = /\s*(?:(\d+(?:[.,]\d+)?|[.,]\d+)|([Kk](?:_?[A-Za-z0-9]+)?)|(s)|([-+*/^()\[\]]))/y;
  let i = 0;
  while (i < src.length) {
    if (/^\s*$/.test(src.slice(i))) break;
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m) {
      const ch = src.slice(i).trim()[0];
      throw new Error(`Unbekanntes Zeichen „${ch}“. Erlaubt: Zahlen, s, K, + − · / ^ ( )`);
    }
    if (m[1] !== undefined) tokens.push({ t: 'num', v: parseFloat(m[1].replace(',', '.')), roh: m[1].replace('.', ',') });
    else if (m[2] !== undefined) tokens.push({ t: 'K', roh: 'K' });
    else if (m[3] !== undefined) tokens.push({ t: 's', roh: 's' });
    else tokens.push({ t: m[4] === '[' ? '(' : m[4] === ']' ? ')' : m[4] });
    i = re.lastIndex;
  }
  return tokens;
}

/** Text einer Klammer so, wie getippt (nur hübscher): "1+3s" → "1 + 3s", "3s+1" bleibt in der Reihenfolge. */
function huebsch(tokens) {
  let out = '';
  tokens.forEach((tk, i) => {
    const vor = tokens[i - 1];
    const unaer = !vor || vor.t === '(' || ['+', '-', '*', '/', '^'].includes(vor.t);
    if (tk.t === 'num') out += vor && vor.t === '^' ? [...String(tk.roh)].map((d) => SUP[+d] ?? d).join('') : tk.roh;
    else if (tk.t === 's' || tk.t === 'K') out += (vor && (vor.t === 's' || vor.t === 'K' || vor.t === ')') ? '·' : '') + tk.roh;
    else if (tk.t === '+') out += unaer ? '+' : ' + ';
    else if (tk.t === '-') out += unaer ? '−' : ' − ';
    else if (tk.t === '*') out += '·';
    else if (tk.t === '^') out += '';
    else out += tk.t;
  });
  return out;
}

/**
 * Liest eine Übertragungsfunktion, z. B. "1/(1+5s)(1+7s)", "1/s(1+2s)", "(2s+1)/4s", "1 + 1/(2s)", "1/(3s+1)^4", "10K".
 * Regel wie auf dem Blatt: Alles, was direkt hinter „/“ steht und ohne Rechenzeichen aneinanderhängt, ist der Nenner.
 * „1/(1+5s)(1+7s)“ = 1 / ((1+5s)(1+7s)). Ein Mal-Punkt beendet den Nenner: „1/(1+5s)·(1+7s)“.
 */
export function parseRat(input) {
  const tokens = tokenize(input);
  if (!tokens.length) throw new Error('Bitte eine Übertragungsfunktion eingeben.');
  let pos = 0;
  const peek = () => tokens[pos];
  const zeig = (t) => (t ? (t.t === 'num' ? t.roh : t.roh || t.t) : '');

  function expr() {
    let r = term();
    while (peek() && (peek().t === '+' || peek().t === '-')) {
      const op = tokens[pos++].t;
      r = addR(r, term(), op === '-');
    }
    return r;
  }
  function term() {
    let neg = false;
    while (peek() && (peek().t === '-' || peek().t === '+')) { if (tokens[pos++].t === '-') neg = !neg; }
    let r = kette();
    for (;;) {
      const p = peek();
      if (!p) break;
      if (p.t === '*') { pos++; r = mulR(r, kette()); }
      else if (p.t === '/') {
        pos++;
        const d = kette();
        if (K.isZero(polyF(d.num)[0]) && polyF(d.num).length === 1) throw new Error('Division durch 0.');
        r = divR(r, d);
      } else break;
    }
    if (neg) r = { num: { ...r.num, c: K.neg(r.num.c) }, den: r.den };
    return r;
  }
  // Aneinanderhängende Faktoren ohne Rechenzeichen: 3s(1+2s)(1+5s)
  function kette() {
    if (!peek()) throw new Error('Ausdruck endet zu früh.');
    let r = potenz();
    while (peek() && ['num', 's', 'K', '('].includes(peek().t)) r = mulR(r, potenz());
    return r;
  }
  function potenz() {
    const start = pos;
    const b = atom();
    if (peek() && peek().t === '^') {
      pos++;
      const e = peek();
      if (!e || e.t !== 'num' || !Number.isInteger(e.v) || e.v < 0 || e.v > 20) throw new Error('Exponent muss eine ganze Zahl 0…20 sein.');
      pos++;
      const n = e.v;
      const hoch = (F) => {
        const c = Array.from({ length: n }).reduce((acc) => K.mul(acc, F.c), [1]);
        return { c, s: F.s * n, g: F.g.map((g) => ({ ...g, e: g.e * n })) };
      };
      return { num: hoch(b.num), den: hoch(b.den) };
    }
    return b;
  }
  function atom() {
    const p = peek();
    if (!p) throw new Error('Ausdruck endet zu früh.');
    if (p.t === 'num') { pos++; return { num: { c: [p.v], s: 0, g: [] }, den: eins() }; }
    if (p.t === 's') { pos++; return { num: { c: [1], s: 1, g: [] }, den: eins() }; }
    if (p.t === 'K') { pos++; return { num: { c: [0, 1], s: 0, g: [] }, den: eins() }; }
    if (p.t === '(') {
      pos++;
      const a = pos;
      const r = expr();
      if (!peek() || peek().t !== ')') throw new Error('Klammer „)“ fehlt.');
      const txt = huebsch(tokens.slice(a, pos));
      pos++;
      // Eine getippte Summe in Klammern behält ihre Schreibweise (1 + 3s)
      const denEins = K.isConst(r.den.c) && r.den.c[0] === 1 && !r.den.s && !r.den.g.length;
      if (denEins && r.num.g.length === 1 && r.num.g[0].e === 1 && !r.num.s && K.isConst(r.num.c) && r.num.c[0] === 1) {
        r.num.g[0].txt = txt;
      }
      return r;
    }
    throw new Error(`Unerwartet: „${zeig(p)}“`);
  }

  const r = expr();
  if (pos < tokens.length) throw new Error(`Unerwartet: „${zeig(tokens[pos])}“`);
  return r;
}

// ---------- Grenzwert s → 0 ----------

/** Niedrigste Potenz mit Koeffizient ≠ 0. */
function ordnung(p) {
  p = BP.trim(p);
  for (let i = 0; i < p.length; i++) if (!K.isZero(p[i])) return i;
  return Infinity;
}

/**
 * lim s→0 von sʰ · P(s)/Q(s) (P, Q bpolys). Liefert { art: 'null'|'endlich'|'unendlich', wert (Zahl oder null), text }.
 */
export function grenzwert(P, Q, h = 0) {
  const p = ordnung(P) + h, q = ordnung(Q);
  if (q === Infinity) throw new Error('Nenner ist 0.');
  if (ordnung(P) === Infinity || p > q) return { art: 'null', wert: 0, text: '0' };
  const a = K.trim(BP.trim(P)[p - h]), b = K.trim(BP.trim(Q)[q]);
  const zahl = K.isConst(a) && K.isConst(b);
  if (p < q) {
    if (zahl) {
      const v = a[0] / b[0] > 0 ? Infinity : -Infinity;
      return { art: 'unendlich', wert: v, text: fmt(v) };
    }
    return { art: 'unendlich', wert: null, text: '∞' };
  }
  if (zahl) {
    const v = a[0] / b[0];
    const f = frac(v), d = fmt(v);
    return { art: Math.abs(v) < 1e-12 ? 'null' : 'endlich', wert: v, text: f === d ? f : `${f} ≈ ${d}` };
  }
  // Mit Parameter: Bruch aus kpolys, Zahl im Zähler herauskürzen
  let A = a, B = b, vz = '';
  if (K.isConst(A) && A[0] !== 0) { B = K.scale(B, 1 / Math.abs(A[0])); vz = A[0] < 0 ? '−' : ''; A = [1]; }
  if (K.isConst(B)) return { art: 'endlich', wert: null, text: kfmt(K.scale(K.scale(A, vz ? -1 : 1), 1 / B[0]), 'K') };
  return { art: 'endlich', wert: null, text: `${vz}${kText(A)}/(${kfmt(B, 'K')})` };
}

// ---------- Polstellen (Gegenprobe Stabilität) ----------

/** Alle komplexen Nullstellen eines Zahlen-Polynoms (Koeffizienten aufsteigend), Durand-Kerner. */
export function nullstellen(c) {
  c = c.slice();
  while (c.length > 1 && Math.abs(c[c.length - 1]) < 1e-15) c.pop();
  const n = c.length - 1;
  if (n < 1) return [];
  const a = c.map((x) => x / c[n]);
  let z = Array.from({ length: n }, (_, k) => {
    const w = (2 * Math.PI * k) / n + 0.4;
    const r = 1 + Math.max(...a.slice(0, n).map(Math.abs));
    return [r * Math.cos(w) * 0.5, r * Math.sin(w) * 0.5];
  });
  const mul = (x, y) => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]];
  const div = (x, y) => { const d = y[0] * y[0] + y[1] * y[1]; return [(x[0] * y[0] + x[1] * y[1]) / d, (x[1] * y[0] - x[0] * y[1]) / d]; };
  const f = (x) => { let r = [1, 0]; for (let i = n - 1; i >= 0; i--) { r = mul(r, x); r[0] += a[i]; } return r; };
  for (let it = 0; it < 2000; it++) {
    let delta = 0;
    z = z.map((zi, i) => {
      let d = [1, 0];
      z.forEach((zj, j) => { if (j !== i) d = mul(d, [zi[0] - zj[0], zi[1] - zj[1]]); });
      const s = div(f(zi), d);
      delta = Math.max(delta, Math.hypot(s[0], s[1]));
      return [zi[0] - s[0], zi[1] - s[1]];
    });
    if (delta < 1e-14) break;
  }
  return z;
}
