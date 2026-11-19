// Kleiner symbolischer Kern für RC/RL/RLC-Netzwerke.
// Expr  = Summe von Monomen in Bauteil-Symbolen (R, L, C, R1, C2 …), Exponenten dürfen negativ sein (L/R).
//         Darstellung: Array von Termen { c: Zahl, e: { Symbol: Exponent } }.
// SPoly = Polynom in s, Koeffizienten sind Expr: p[k] = Koeffizient von sᵏ.
// Kein Computeralgebra-System: nur das, was Spannungsteiler mit Impedanzen brauchen.

import { fmt, sup } from './poly.js';

const EPS = 1e-12;
const SUBS = '₀₁₂₃₄₅₆₇₈₉';

/** Symbolname für die Anzeige: R1 → R₁ */
export const symName = (n) => n.replace(/\d+/g, (d) => d.split('').map((x) => SUBS[+x]).join(''));

const ORDNUNG = { R: 0, L: 1, C: 2 };
export function symCmp(a, b) {
  const d = (ORDNUNG[a[0]] ?? 9) - (ORDNUNG[b[0]] ?? 9);
  if (d) return d;
  return a.localeCompare(b, 'de', { numeric: true });
}

function clean(e) {
  const r = {};
  for (const k of Object.keys(e)) if (e[k]) r[k] = e[k];
  return r;
}
const key = (e) => Object.keys(e).sort(symCmp).map((k) => k + '^' + e[k]).join('*');

// ---------- Expr ----------

export const E = {
  num: (c) => (Math.abs(c) > EPS ? [{ c, e: {} }] : []),
  sym: (name) => [{ c: 1, e: { [name]: 1 } }],
  one: () => [{ c: 1, e: {} }],
  norm(terms) {
    const m = new Map();
    for (const t of terms) {
      const e = clean(t.e);
      const k = key(e);
      const o = m.get(k);
      if (o) o.c += t.c; else m.set(k, { c: t.c, e });
    }
    return [...m.entries()]
      .filter(([, t]) => Math.abs(t.c) > EPS * Math.max(1, Math.abs(t.c)) && Math.abs(t.c) > 1e-14)
      .sort((x, y) => x[0].localeCompare(y[0], 'de', { numeric: true }))
      .map(([, t]) => t);
  },
  add: (a, b) => E.norm([...a, ...b]),
  neg: (a) => a.map((t) => ({ c: -t.c, e: t.e })),
  sub: (a, b) => E.add(a, E.neg(b)),
  mul(a, b) {
    const r = [];
    for (const x of a) for (const y of b) {
      const e = { ...x.e };
      for (const k of Object.keys(y.e)) e[k] = (e[k] || 0) + y.e[k];
      r.push({ c: x.c * y.c, e });
    }
    return E.norm(r);
  },
  isZero: (a) => a.length === 0,
  isMono: (a) => a.length === 1,
  isOne: (a) => a.length === 1 && Object.keys(a[0].e).length === 0 && Math.abs(a[0].c - 1) < 1e-12,
  isNum: (a) => a.length === 0 || (a.length === 1 && Object.keys(a[0].e).length === 0),
  /** Kehrwert eines Monoms */
  inv(a) {
    if (a.length !== 1) throw new Error('Kehrwert nur für ein einzelnes Produkt möglich.');
    const e = {};
    for (const k of Object.keys(a[0].e)) e[k] = -a[0].e[k];
    return [{ c: 1 / a[0].c, e }];
  },
  /** a / m, m muss ein Monom sein */
  div: (a, m) => E.mul(a, E.inv(m)),
  equal: (a, b) => {
    const d = E.sub(a, b);
    const scale = Math.max(1, ...a.map((t) => Math.abs(t.c)), ...b.map((t) => Math.abs(t.c)));
    return d.every((t) => Math.abs(t.c) < 1e-9 * scale);
  },
  symbols(a, set = new Set()) {
    for (const t of a) for (const k of Object.keys(t.e)) set.add(k);
    return set;
  },
  eval(a, werte) {
    let s = 0;
    for (const t of a) {
      let v = t.c;
      for (const k of Object.keys(t.e)) {
        if (!(k in werte)) throw new Error(`Wert für ${symName(k)} fehlt.`);
        v *= werte[k] ** t.e[k];
      }
      s += v;
    }
    return s;
  },
  /** Wurzel eines Monoms: { aussen, innen } mit Monom = aussen² · innen, innen nur Exponenten ±1 */
  sqrtMono(a) {
    if (a.length !== 1 || a[0].c <= 0) return null;
    const t = a[0];
    const aus = {}, inn = {};
    for (const k of Object.keys(t.e)) {
      const x = t.e[k];
      const h = Math.trunc(x / 2);
      if (h) aus[k] = h;
      if (x - 2 * h) inn[k] = x - 2 * h;
    }
    // Zahl: Quadrat ausziehen, wenn sie ein Quadrat einer rationalen Zahl ist
    const r = Math.sqrt(t.c);
    const rq = rat(r);
    let cAus = 1, cIn = t.c;
    if (rq) { cAus = r; cIn = 1; }
    return { aussen: [{ c: cAus, e: aus }], innen: [{ c: cIn, e: inn }] };
  },
};

/** Zahl als Bruch p/q (q ≤ 1000) oder null */
export function rat(x) {
  if (!isFinite(x)) return null;
  for (let q = 1; q <= 1000; q++) {
    const p = x * q;
    if (Math.abs(p - Math.round(p)) < 1e-9 * Math.max(1, Math.abs(p))) return [Math.round(p), q];
  }
  return null;
}

// ---------- Darstellung ----------

/** Ein Monom (Betrag) als Text, z. B. "RC", "1/(RC)", "R/L", "R²C/(4L)". Liefert { neg, body } */
export function monoFmt(t) {
  const neg = t.c < 0;
  const c = Math.abs(t.c);
  const syms = Object.keys(t.e).sort(symCmp);
  const pos = syms.filter((k) => t.e[k] > 0).map((k) => symName(k) + (t.e[k] > 1 ? sup(t.e[k]) : '')).join('');
  const negS = syms.filter((k) => t.e[k] < 0);
  const den = negS.map((k) => symName(k) + (t.e[k] < -1 ? sup(-t.e[k]) : '')).join('');
  const r = rat(c);
  let zahlZ, zahlN = '';
  if (r) { zahlZ = r[0] === 1 && pos ? '' : String(r[0]); if (r[1] !== 1) zahlN = String(r[1]); }
  else zahlZ = c === 1 && pos ? '' : fmt(c);
  const z = zahlZ + pos || '1';
  const nFaktoren = (zahlN ? 1 : 0) + negS.length;
  const n = zahlN + den;
  const body = n ? `${z}/${nFaktoren > 1 ? '(' + n + ')' : n}` : z;
  return { neg, body };
}

/** Expr als Text: "R + sL" usw. */
export function eFmt(a) {
  if (!a.length) return '0';
  return a.map((t, i) => {
    const { neg, body } = monoFmt(t);
    return i === 0 ? (neg ? '−' : '') + body : (neg ? ' − ' : ' + ') + body;
  }).join('');
}

/** Expr als Faktor: Summen in Klammern, Bruch-Monome in Klammern, wenn danach noch etwas folgt */
export function eFak(a) {
  const t = eFmt(a);
  return a.length > 1 ? `(${t})` : t;
}

const sPot = (k) => (k === 0 ? '' : 's' + (k > 1 ? sup(k) : ''));

/** Ein Summand X·sᵏ als { neg, body } */
function sTerm(X, k) {
  if (k === 0) {
    if (X.length === 1) return monoFmt(X[0]);
    return { neg: false, body: eFmt(X), summe: true };
  }
  if (X.length > 1) return { neg: false, body: `(${eFmt(X)})·${sPot(k)}` };
  const { neg, body } = monoFmt(X[0]);
  if (body === '1') return { neg, body: sPot(k) };
  if (/^[\d,]+$/.test(body)) return { neg, body: body + sPot(k) };
  if (body.includes('/') || /^\d/.test(body)) return { neg, body: sPot(k) + '·' + body };
  return { neg, body: sPot(k) + body };
}

/** Polynom in s aufsteigend: "1 + sRC + s²LC" */
export function pFmt(p) {
  const parts = [];
  p.forEach((X, k) => {
    if (!X || E.isZero(X)) return;
    if (k === 0 && X.length > 1) {
      X.forEach((t) => { const m = monoFmt(t); parts.push(m); });
      return;
    }
    parts.push(sTerm(X, k));
  });
  if (!parts.length) return '0';
  return parts.map((t, i) => (i === 0 ? (t.neg ? '−' : '') + t.body : (t.neg ? ' − ' : ' + ') + t.body)).join('');
}

/** Anzahl der Summanden (für Klammern) */
export function pTerms(p) {
  let n = 0;
  p.forEach((X, k) => { if (X && !E.isZero(X)) n += k === 0 ? X.length : 1; });
  return n;
}

const klammer = (s, n) => (n > 1 || s.includes('/') ? `(${s})` : s);

/** Bruch Z/N als Text, N = 1 → nur Z */
export function bruchFmt(Z, N) {
  if (P.isOne(N)) return pFmt(Z);
  return `${klammer(pFmt(Z), pTerms(Z))} / ${klammer(pFmt(N), pTerms(N))}`;
}

// ---------- SPoly ----------

export const P = {
  trim(p) {
    const q = p.map((x) => x || []);
    while (q.length > 1 && E.isZero(q[q.length - 1])) q.pop();
    if (!q.length) q.push([]);
    return q;
  },
  c: (X) => [X],
  one: () => [E.one()],
  add(a, b) {
    const r = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) r.push(E.add(a[i] || [], b[i] || []));
    return P.trim(r);
  },
  mul(a, b) {
    const r = Array.from({ length: a.length + b.length - 1 }, () => []);
    a.forEach((x, i) => b.forEach((y, j) => { r[i + j] = E.add(r[i + j], E.mul(x, y)); }));
    return P.trim(r);
  },
  scale: (a, X) => P.trim(a.map((k) => E.mul(k, X))),
  deg: (a) => P.trim(a).length - 1,
  isZero: (a) => P.trim(a).every(E.isZero),
  isOne: (a) => { const t = P.trim(a); return t.length === 1 && E.isOne(t[0]); },
  /** niedrigste s-Potenz mit Koeffizient ≠ 0 */
  low: (a) => a.findIndex((X) => X && !E.isZero(X)),
  shift: (a, k) => (k >= 0 ? P.trim([...Array.from({ length: k }, () => []), ...a]) : P.trim(a.slice(-k))),
  symbols(a) { const s = new Set(); a.forEach((X) => E.symbols(X, s)); return s; },
  evalNum: (a, werte) => a.map((X) => E.eval(X, werte)),
  /** Komplex auswerten bei s = (re, im), Koeffizienten numerisch */
  evalC(a, werte, s) {
    const k = P.evalNum(a, werte);
    let re = 0, im = 0;
    for (let i = k.length - 1; i >= 0; i--) {
      const nr = re * s[0] - im * s[1] + k[i];
      im = re * s[1] + im * s[0];
      re = nr;
    }
    return [re, im];
  },
};

/** Alle Monome eines Bruchs Z/N: gemeinsame s-Potenz und gemeinsamen Monom-Faktor kürzen. */
export function kuerzen(Z, N) {
  const lz = P.low(Z), ln = P.low(N);
  const k = Math.min(lz < 0 ? Infinity : lz, ln);
  if (k > 0 && k !== Infinity) { Z = P.shift(Z, -k); N = P.shift(N, -k); }
  // gemeinsamer Monom-Faktor (kleinster Exponent je Symbol über alle Terme)
  const alle = [...Z, ...N].flat();
  if (!alle.length) return { Z, N };
  const syms = new Set(alle.flatMap((t) => Object.keys(t.e)));
  const g = {};
  for (const s of syms) {
    const m = Math.min(...alle.map((t) => t.e[s] || 0));
    if (m) g[s] = m;
  }
  // nur positive Faktoren herausziehen (negative Exponenten löst `entbruchen` auf)
  for (const s of Object.keys(g)) if (g[s] < 0) delete g[s];
  if (Object.keys(g).length) {
    const m = [{ c: 1, e: g }];
    Z = P.trim(Z.map((X) => E.div(X, m)));
    N = P.trim(N.map((X) => E.div(X, m)));
  }
  return { Z, N };
}

/** Brüche in den Koeffizienten wegmultiplizieren (z. B. 1/(RC) → mit RC erweitern), danach kürzen. */
export function entbruchen(Z, N) {
  const alle = [...Z, ...N].flat();
  const f = {};
  for (const t of alle) for (const k of Object.keys(t.e)) if (t.e[k] < 0) f[k] = Math.max(f[k] || 0, -t.e[k]);
  // Zahlen-Nenner (1/2 …) ebenfalls
  let q = 1;
  for (const t of alle) { const r = rat(Math.abs(t.c)); if (r) q = lcm(q, r[1]); }
  if (Object.keys(f).length || q !== 1) {
    const m = [{ c: q, e: f }];
    Z = P.scale(Z, m); N = P.scale(N, m);
  }
  return kuerzen(Z, N);
}

function gcd(a, b) { while (b) [a, b] = [b, a % b]; return a; }
function lcm(a, b) { return (a / gcd(a, b)) * b; }
