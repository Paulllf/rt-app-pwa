// Symbolische Algebra für den Signalfluss-Rechner: Polynome in Blocknamen (G1, G2, H, R, K …)
// und Brüche daraus. Kein volles Computeralgebra-System, nur was Signalflussbilder brauchen:
// +, −, ·, ÷, Einsetzen, exakte Polynomdivision zum Kürzen.
//
// MPoly: Map  Monom-Schlüssel → Koeffizient.  Schlüssel z. B. "G1*G2^2", "" = Konstante.
// Rat:   { n: MPoly, f: [MPoly …] }  Wert = n / (f₁·f₂·…)  (Nenner als Liste von Faktoren,
//        damit gleiche Faktoren beim Addieren erkannt und beim Kürzen getestet werden können)

import { fmt } from './poly.js';

const EPS = 1e-9;
const SUB = '₀₁₂₃₄₅₆₇₈₉';

const cmpName = (a, b) => a.localeCompare(b, 'en', { numeric: true });
const rang = (n) => (/^K/.test(n) ? 0 : /^G/.test(n) ? 1 : 2);
/** Reihenfolge der Symbole in einem Produkt, wie in der Musterlösung: K zuerst, dann G…, dann der Rest (A, H, R …). */
const cmpAnzeige = (a, b) => rang(a) - rang(b) || (a === 'G_V' && b === 'G_R' ? -1 : a === 'G_R' && b === 'G_V' ? 1 : cmpName(a, b));

function sauber(c) {
  const r = Math.round(c);
  return Math.abs(c - r) < 1e-9 * Math.max(1, Math.abs(c)) ? r : c;
}

// ---------- Monome ----------

const keyCache = new Map();
function parseKey(k) {
  let m = keyCache.get(k);
  if (m) return m;
  m = {};
  if (k) for (const t of k.split('*')) { const [n, e] = t.split('^'); m[n] = e ? +e : 1; }
  keyCache.set(k, m);
  return m;
}
function makeKey(m) {
  return Object.keys(m).filter((n) => m[n]).sort(cmpName).map((n) => (m[n] === 1 ? n : n + '^' + m[n])).join('*');
}
function monoMul(a, b) {
  if (!a) return b;
  if (!b) return a;
  const m = { ...parseKey(a) };
  for (const [n, e] of Object.entries(parseKey(b))) m[n] = (m[n] || 0) + e;
  return makeKey(m);
}
function monoDiv(a, b) {
  const ma = parseKey(a), mb = parseKey(b), m = { ...ma };
  for (const [n, e] of Object.entries(mb)) {
    if ((ma[n] || 0) < e) return null;
    m[n] = ma[n] - e;
  }
  return makeKey(m);
}
/** Lexikographischer Vergleich (für exakte Division). >0 heißt a ist „größer“. */
function monoCmpLex(a, b) {
  const ma = parseKey(a), mb = parseKey(b);
  const names = [...new Set([...Object.keys(ma), ...Object.keys(mb)])].sort(cmpName);
  for (const n of names) { const d = (ma[n] || 0) - (mb[n] || 0); if (d) return d; }
  return 0;
}
const grad = (k) => Object.values(parseKey(k)).reduce((s, e) => s + e, 0);

// ---------- Polynome in den Blocknamen ----------

export const MP = {
  c(x) { const p = new Map(); if (Math.abs(x) > 1e-14) p.set('', sauber(x)); return p; },
  sym(n) { return new Map([[n, 1]]); },
  isZero: (p) => p.size === 0,
  add(a, b) {
    const r = new Map(a);
    for (const [k, v] of b) {
      const alt = r.get(k) || 0, s = alt + v;
      if (Math.abs(s) <= EPS * Math.max(1, Math.abs(alt), Math.abs(v))) r.delete(k);
      else r.set(k, sauber(s));
    }
    return r;
  },
  neg(a) { return new Map([...a].map(([k, v]) => [k, -v])); },
  sub(a, b) { return MP.add(a, MP.neg(b)); },
  scale(a, c) { return c === 0 ? new Map() : new Map([...a].map(([k, v]) => [k, sauber(v * c)])); },
  mul(a, b) {
    let r = new Map();
    for (const [ka, va] of a) for (const [kb, vb] of b) r = MP.add(r, new Map([[monoMul(ka, kb), va * vb]]));
    return r;
  },
  pow(a, e) { let r = MP.c(1); for (let i = 0; i < e; i++) r = MP.mul(r, a); return r; },
  isConst(p) { return p.size === 0 || (p.size === 1 && p.has('')); },
  constVal(p) { return p.get('') || 0; },
  eq(a, b) { return MP.isZero(MP.sub(a, b)); },
  vars(p) { const s = new Set(); for (const k of p.keys()) for (const n of Object.keys(parseKey(k))) s.add(n); return s; },
  degIn(p, n) { let d = 0; for (const k of p.keys()) d = Math.max(d, parseKey(k)[n] || 0); return d; },
  eval(p, werte) {
    let s = 0;
    for (const [k, c] of p) {
      let t = c;
      for (const [n, e] of Object.entries(parseKey(k))) {
        if (!(n in werte)) throw new Error(`Kein Wert für ${n}`);
        t *= werte[n] ** e;
      }
      s += t;
    }
    return s;
  },
  lead(p) {
    let best = null;
    for (const k of p.keys()) if (best === null || monoCmpLex(k, best) > 0) best = k;
    return [best, p.get(best)];
  },
  /** Exakte Division a / d. Gibt den Quotienten zurück oder null, wenn d kein Teiler ist. */
  divExact(a, d) {
    if (MP.isZero(d)) return null;
    if (MP.isZero(a)) return new Map();
    const [ld, cd] = MP.lead(d);
    let r = new Map(a), q = new Map();
    for (let guard = 0; r.size; guard++) {
      if (guard > 2000) return null;
      const [lr, cr] = MP.lead(r);
      const m = monoDiv(lr, ld);
      if (m === null) return null;
      const t = new Map([[m, cr / cd]]);
      q = MP.add(q, t);
      r = MP.sub(r, MP.mul(t, d));
      if (r.has(lr)) r.delete(lr); // Rundungsrest des führenden Terms
    }
    return q;
  },
  /** Terme sortiert für die Anzeige: Konstante zuerst, dann nach Grad, dann nach Namen. */
  terme(p) {
    return [...p].map(([k, c]) => ({ k, c, m: parseKey(k) })).sort((a, b) => {
      const d = grad(a.k) - grad(b.k);
      if (d) return d;
      if ((a.c < 0) !== (b.c < 0)) return a.c < 0 ? 1 : -1; // gleicher Grad: positive Terme zuerst
      const na = Object.keys(a.m).sort(cmpAnzeige), nb = Object.keys(b.m).sort(cmpAnzeige);
      for (let i = 0; i < Math.min(na.length, nb.length); i++) {
        const c = cmpAnzeige(na[i], nb[i]);
        if (c) return c;
        const e = (a.m[na[i]] || 0) - (b.m[nb[i]] || 0);
        if (e) return -e;
      }
      return 0;
    });
  },
};

// ---------- Anzeige ----------

const subDigits = (d) => [...d].map((x) => SUB[+x]).join('');
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const supDigits = (d) => [...String(d)].map((x) => SUP[+x]).join('');

/** Blockname schön: G11 → G₁₁, K_R bleibt K_R. */
export function symText(n) {
  const m = /^([A-Z])(\d+)$/.exec(n);
  return m ? m[1] + subDigits(m[2]) : n;
}

const braucheKlammer = (t) => /[+\/ ]|−|-/.test(t.replace(/^\((.*)\)$/, (x) => (ausgewogen(x) ? '' : x)));
function ausgewogen(t) { // „(…)“ umschließt den ganzen Ausdruck?
  if (!t.startsWith('(') || !t.endsWith(')')) return false;
  let d = 0;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '(') d++;
    else if (t[i] === ')') { d--; if (d === 0 && i < t.length - 1) return false; }
  }
  return true;
}
/** Klammern um einen Ausdruck, falls er eine Summe oder ein Bruch ist. */
export function klammer(t) { return braucheKlammer(t) ? `(${t})` : t; }

function monoText(m, ersetze) {
  return Object.keys(m).sort(cmpAnzeige).map((n) => {
    let s = ersetze && n in ersetze ? klammer(ersetze[n]) : symText(n);
    if (m[n] > 1) s = (/^[A-Z][₀-₉]*$|^\(.*\)$/.test(s) ? s : `(${s})`) + supDigits(m[n]);
    return s;
  }).reduce((acc, t, i, arr) => acc + (i && (/_/.test(arr[i - 1]) || /_/.test(t)) ? '·' : '') + t, '');
}

/** Polynom als Text: "1 + G₁G₂ − G₁G₃". */
export function fmtPoly(p, opt = {}) {
  if (MP.isZero(p)) return '0';
  return MP.terme(p).map((t, i) => {
    const a = Math.abs(t.c), mono = monoText(t.m, opt.ersetze);
    const body = mono ? (a === 1 ? '' : fmt(a)) + mono : fmt(a);
    const neg = t.c < 0;
    return i === 0 ? (neg ? '−' : '') + body : (neg ? ' − ' : ' + ') + body;
  }).join('');
}

/** Gemeinsamen Faktor ausklammern: KG₁G₂ + KG₁G₄ → KG₁(G₂ + G₄). null, wenn nichts auszuklammern ist. */
export function fmtFaktor(p, opt = {}) {
  if (p.size < 2) return null;
  const ts = [...p];
  const gem = {};
  const erste = parseKey(ts[0][0]);
  for (const n of Object.keys(erste)) {
    gem[n] = Math.min(...ts.map(([k]) => parseKey(k)[n] || 0));
    if (!gem[n]) delete gem[n];
  }
  const ganz = ts.every(([, c]) => Number.isInteger(c));
  let g = 1;
  if (ganz) {
    const ggt = (a, b) => (b ? ggt(b, a % b) : a);
    g = ts.reduce((s, [, c]) => ggt(s, Math.abs(c)), 0) || 1;
  }
  if (!Object.keys(gem).length && g === 1) return null;
  const mk = makeKey(gem);
  let rest = new Map();
  for (const [k, c] of ts) rest.set(monoDiv(k, mk), c / g);
  const vor = (g !== 1 ? fmt(g) : '') + monoText(gem, opt.ersetze);
  return `${vor}(${fmtPoly(rest, opt)})`;
}

// ---------- Brüche ----------

function faktorNorm(f) {
  // Vorzeichen so, dass der erste Term (Konstante zuerst) positiv ist
  const t = MP.terme(f)[0];
  return t && t.c < 0 ? { f: MP.neg(f), s: -1 } : { f, s: 1 };
}

export const R = {
  of(p) { return { n: p, f: [] }; },
  c(x) { return R.of(MP.c(x)); },
  sym(n) { return R.of(MP.sym(n)); },
  den(r) { return r.f.reduce((a, f) => MP.mul(a, f), MP.c(1)); },
  isZero(r) { return MP.isZero(r.n); },
  /** Kürzen: jeden Nennerfaktor testen, ob er den Zähler exakt teilt. Konstante Faktoren einrechnen. */
  simplify(r) {
    let n = r.n;
    if (MP.isZero(n)) return { n, f: [] };
    const f = [];
    for (const fac0 of r.f) {
      if (MP.isConst(fac0)) { n = MP.scale(n, 1 / MP.constVal(fac0)); continue; }
      const { f: fac, s } = faktorNorm(fac0);
      if (s < 0) n = MP.neg(n);
      const q = MP.divExact(n, fac);
      if (q) n = q; else f.push(fac);
    }
    return { n, f };
  },
  neg(a) { return { n: MP.neg(a.n), f: a.f }; },
  mul(a, b) { return R.simplify({ n: MP.mul(a.n, b.n), f: [...a.f, ...b.f] }); },
  add(a, b) {
    if (R.isZero(a)) return b;
    if (R.isZero(b)) return a;
    const used = new Array(a.f.length).fill(false);
    const extraB = [];
    let sign = 1;
    for (const fb of b.f) {
      let hit = -1;
      for (let i = 0; i < a.f.length; i++) {
        if (used[i]) continue;
        if (MP.eq(a.f[i], fb)) { hit = i; break; }
        if (MP.eq(a.f[i], MP.neg(fb))) { hit = i; sign = -sign; break; }
      }
      if (hit >= 0) used[hit] = true; else extraB.push(fb);
    }
    const restA = a.f.filter((_, i) => !used[i]);
    const prod = (l) => l.reduce((x, y) => MP.mul(x, y), MP.c(1));
    const n = MP.add(MP.mul(a.n, prod(extraB)), MP.scale(MP.mul(b.n, prod(restA)), sign));
    return R.simplify({ n, f: [...a.f, ...extraB] });
  },
  sub(a, b) { return R.add(a, R.neg(b)); },
  inv(a) {
    if (MP.isZero(a.n)) throw new Error('Division durch 0: Der Nenner wird 0 (Schleife mit Verstärkung 1?).');
    const d = R.den(a);
    if (MP.isConst(a.n)) return R.simplify({ n: MP.scale(d, 1 / MP.constVal(a.n)), f: [] });
    return R.simplify({ n: d, f: [a.n] });
  },
  div(a, b) { return R.mul(a, R.inv(b)); },
  eval(r, werte) { return MP.eval(r.n, werte) / MP.eval(R.den(r), werte); },
  vars(r) { const s = MP.vars(r.n); for (const f of r.f) for (const v of MP.vars(f)) s.add(v); return s; },
  /** Symbole durch Brüche ersetzen: map Name → Rat. */
  subst(r, map) {
    const ev = (p) => {
      let s = R.c(0);
      for (const [k, c] of p) {
        let t = R.c(c);
        for (const [n, e] of Object.entries(parseKey(k))) {
          const v = n in map ? map[n] : R.sym(n);
          for (let i = 0; i < e; i++) t = R.mul(t, v);
        }
        s = R.add(s, t);
      }
      return s;
    };
    let erg = ev(r.n);
    for (const f of r.f) erg = R.div(erg, ev(f));
    return erg;
  },
  /** Zähler und Nenner als ausmultiplizierte Polynome, Nenner mit positivem ersten Term. */
  zn(r) {
    let n = r.n, d = R.den(r);
    const t = MP.terme(d)[0];
    if (t && t.c < 0) { n = MP.neg(n); d = MP.neg(d); }
    return { n, d };
  },
};

/** Bruch als Text "Z / (N)". faktor: Zähler mit ausgeklammertem gemeinsamen Faktor. */
export function fmtRat(r, opt = {}) {
  const { n, d } = R.zn(r);
  let zs = (opt.faktor && fmtFaktor(n, opt)) || fmtPoly(n, opt);
  if (MP.isConst(d) && MP.constVal(d) === 1) return zs;
  const ds = fmtPoly(d, opt);
  const zk = n.size > 1 && !(opt.faktor && fmtFaktor(n, opt)) ? `(${zs})` : zs;
  return `${zk} / ${/^([A-Z][₀-₉]*|\d+(,\d+)?)$/.test(ds) ? ds : `(${ds})`}`;
}

// ---------- Eingabe lesen ----------

/** Name normalisieren: g1 → G1, G_1 → G1, G₁ → G1, Xe → X_e, k_R → K_R. */
export function normName(t) {
  t = t.replace(/[₀-₉]/g, (c) => String(SUB.indexOf(c))).replace(/_(\d+)$/, '$1');
  t = t[0].toUpperCase() + t.slice(1);
  if (/^[A-Z][a-z]+$/.test(t)) t = t[0] + '_' + t.slice(1);
  return t;
}

/**
 * Ausdruck mit Blocknamen lesen: "K(B+D)", "G1G2·A", "R·(W − X) − A·Z", "1 − G1·G3", "2G1".
 * Mehrere Großbuchstaben hintereinander werden als Produkt gelesen (RW = R·W), Ziffern hängen am Buchstaben (G11),
 * ein Großbuchstabe mit Kleinbuchstaben dahinter ist ein Name mit Index (Xe = X_e, Ga = G_a).
 * "(s)" hinter einem Namen wird ignoriert: G1(s) = G1.
 */
export function parseAusdruck(input) {
  const src = String(input)
    .replace(/\(\s*s\s*\)/g, '')
    .replace(/[₀-₉]/g, (c) => String(SUB.indexOf(c)))
    .replace(/[−–]/g, '-')
    .replace(/[·×∙⋅]/g, '*');
  const tokens = [];
  const re = /\s*(?:(\d+(?:[.,]\d+)?|[.,]\d+)|([A-Z][a-z]+|[A-Za-z](?:_[A-Za-z0-9]+|\d+)?)|([-+*/^()]))/y;
  let i = 0;
  while (i < src.length) {
    if (/^\s*$/.test(src.slice(i))) break;
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m) {
      const ch = src.slice(i).trim()[0];
      throw new Error(`Unbekanntes Zeichen „${ch}“. Erlaubt: Namen wie G1, H, R, Zahlen, + − · / ( )`);
    }
    if (m[1] !== undefined) tokens.push({ t: 'num', v: parseFloat(m[1].replace(',', '.')) });
    else if (m[2] !== undefined) tokens.push({ t: 'id', v: normName(m[2]) });
    else tokens.push({ t: m[3] });
    i = re.lastIndex;
  }
  if (!tokens.length) throw new Error('Leerer Ausdruck.');
  let pos = 0;
  const peek = () => tokens[pos];
  const zeig = (t) => (t.t === 'num' ? t.v : t.t === 'id' ? t.v : t.t);
  function expr() {
    let r = term();
    while (peek() && (peek().t === '+' || peek().t === '-')) {
      const op = tokens[pos++].t;
      const b = term();
      r = op === '+' ? MP.add(r, b) : MP.sub(r, b);
    }
    return r;
  }
  function term() {
    let r = unary();
    for (;;) {
      const p = peek();
      if (!p) break;
      if (p.t === '*') { pos++; r = MP.mul(r, unary()); }
      else if (p.t === '/') {
        pos++;
        const d = unary();
        if (!MP.isConst(d) || MP.constVal(d) === 0) throw new Error('Teilen geht hier nur durch Zahlen ≠ 0. Brüche aus Blöcken als eigene Rückkopplung bauen.');
        r = MP.scale(r, 1 / MP.constVal(d));
      } else if (p.t === 'num' || p.t === 'id' || p.t === '(') r = MP.mul(r, power());
      else break;
    }
    return r;
  }
  function unary() {
    const p = peek();
    if (p && p.t === '-') { pos++; return MP.neg(unary()); }
    if (p && p.t === '+') { pos++; return unary(); }
    return power();
  }
  function power() {
    const b = atom();
    if (peek() && peek().t === '^') {
      pos++;
      const e = atom();
      if (!MP.isConst(e)) throw new Error('Exponent muss eine Zahl sein.');
      const n = MP.constVal(e);
      if (!Number.isInteger(n) || n < 0 || n > 10) throw new Error('Exponent muss eine ganze Zahl 0…10 sein.');
      return MP.pow(b, n);
    }
    return b;
  }
  function atom() {
    const p = peek();
    if (!p) throw new Error('Ausdruck endet zu früh.');
    if (p.t === 'num') { pos++; return MP.c(p.v); }
    if (p.t === 'id') { pos++; return MP.sym(p.v); }
    if (p.t === '(') {
      pos++;
      const r = expr();
      if (!peek() || peek().t !== ')') throw new Error('Klammer „)“ fehlt.');
      pos++;
      return r;
    }
    throw new Error(`Unerwartet: „${zeig(p)}“`);
  }
  const r = expr();
  if (pos < tokens.length) throw new Error(`Unerwartet: „${zeig(tokens[pos])}“`);
  return r;
}
