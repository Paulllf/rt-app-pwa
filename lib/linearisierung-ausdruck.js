// Kleiner Ausdrucks-Parser mit symbolischer Ableitung für die Linearisierung.
// Erlaubt: Zahlen (0,5 oder 0.5), Variable t (oder x), + − · * / ^, Hochzahlen ²³, Klammern,
// √ / sqrt, sin, cos, tan, exp, ln, log (= ln), e, π / pi. Implizites Mal: 2t, 3sin(t), t(t+1), 2√t.
// Kein DOM, in Node testbar.
import { frac, sup } from './poly.js';

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const FN = ['sqrt', 'sin', 'cos', 'tan', 'exp', 'ln', 'log', 'wurzel'];

// ---------- Knoten ----------
const num = (v) => ({ k: 'num', v });
const VAR = { k: 'var' };
const E = { k: 'const', name: 'e', v: Math.E };
const PI = { k: 'const', name: 'π', v: Math.PI };
const isNum = (a, v) => a.k === 'num' && (v === undefined || Math.abs(a.v - v) < 1e-15);

export function hatVar(a) {
  if (a.k === 'var') return true;
  return ['a', 'b', 'x'].some((key) => a[key] && hatVar(a[key]));
}

// ---------- Vereinfachen ----------
function add(a, b) {
  if (isNum(a, 0)) return b;
  if (isNum(b, 0)) return a;
  if (isNum(a) && isNum(b)) return num(a.v + b.v);
  if (b.k === 'neg') return sub(a, b.x);
  if (isNum(b) && b.v < 0) return sub(a, num(-b.v));
  return { k: 'add', a, b };
}
function sub(a, b) {
  if (isNum(b, 0)) return a;
  if (isNum(a, 0)) return neg(b);
  if (isNum(a) && isNum(b)) return num(a.v - b.v);
  if (b.k === 'neg') return add(a, b.x);
  if (isNum(b) && b.v < 0) return add(a, num(-b.v));
  return { k: 'sub', a, b };
}
function neg(a) {
  if (isNum(a)) return num(-a.v);
  if (a.k === 'neg') return a.x;
  if (a.k === 'mul' && isNum(a.a)) return mul(num(-a.a.v), a.b);
  return { k: 'neg', x: a };
}
function mul(a, b) {
  if (isNum(a, 0) || isNum(b, 0)) return num(0);
  if (isNum(a, 1)) return b;
  if (isNum(b, 1)) return a;
  if (isNum(a, -1)) return neg(b);
  if (isNum(b, -1)) return neg(a);
  if (isNum(a) && isNum(b)) return num(a.v * b.v);
  if (isNum(b)) return mul(b, a); // Zahl nach vorn
  if (isNum(a) && b.k === 'mul' && isNum(b.a)) return mul(num(a.v * b.a.v), b.b);
  if (isNum(a) && b.k === 'neg') return mul(num(-a.v), b.x);
  if (a.k === 'neg') return neg(mul(a.x, b));
  if (b.k === 'neg') return neg(mul(a, b.x));
  if (isNum(a) && b.k === 'div' && isNum(b.a)) return div(num(a.v * b.a.v), b.b);
  return { k: 'mul', a, b };
}
function div(a, b) {
  if (isNum(b, 0)) throw new Error('Division durch 0.');
  if (isNum(b, 1)) return a;
  if (isNum(a, 0)) return num(0);
  if (isNum(a) && isNum(b)) return num(a.v / b.v);
  if (isNum(b)) return mul(num(1 / b.v), a);
  if (a.k === 'neg') return neg(div(a.x, b));
  return { k: 'div', a, b };
}
function pow(a, b) {
  if (isNum(b, 0)) return num(1);
  if (isNum(b, 1)) return a;
  if (isNum(a) && isNum(b)) return num(a.v ** b.v);
  return { k: 'pow', a, b };
}
const fn = (name, x) => ({ k: 'fn', name, x });

// ---------- Parser ----------
export function parseAusdruck(input) {
  let src = String(input)
    .replace(/[−–]/g, '-').replace(/[·×]/g, '*').replace(/,/g, '.')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => '^' + [...m].map((c) => SUP.indexOf(c)).join(''));
  const hatT = /t/.test(src.replace(/sqrt|tan|wurzel/g, '')), hatX = /x/.test(src.replace(/exp/g, ''));
  if (hatT && hatX) throw new Error('Bitte nur eine Variable verwenden (t oder x).');
  const varName = hatX ? 'x' : 't';

  const tokens = [];
  const re = /\s*(?:(\d+(?:\.\d+)?|\.\d+)|(sqrt|wurzel|sin|cos|tan|exp|ln|log)|(pi|π)|(√)|([tx])|(e)|([-+*/^()]))/y;
  let i = 0;
  while (i < src.length) {
    if (/^\s*$/.test(src.slice(i))) break;
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m) {
      const ch = src.slice(i).trim()[0];
      throw new Error(`Unbekanntes Zeichen „${ch}“. Erlaubt: Zahlen, ${varName}, + − · / ^ ( ), √, sin, cos, tan, e^, ln`);
    }
    if (m[1] !== undefined) tokens.push({ t: 'num', v: parseFloat(m[1]) });
    else if (m[2] !== undefined) tokens.push({ t: 'fn', v: m[2] === 'wurzel' ? 'sqrt' : m[2] === 'log' ? 'ln' : m[2] });
    else if (m[3] !== undefined) tokens.push({ t: 'pi' });
    else if (m[4] !== undefined) tokens.push({ t: 'fn', v: 'sqrt' });
    else if (m[5] !== undefined) {
      if (m[5] !== varName) throw new Error('Bitte nur eine Variable verwenden (t oder x).');
      tokens.push({ t: 'var' });
    } else if (m[6] !== undefined) tokens.push({ t: 'e' });
    else tokens.push({ t: m[7] });
    i = re.lastIndex;
  }
  if (!tokens.length) throw new Error('Bitte eine Funktion eingeben.');

  let pos = 0;
  const peek = () => tokens[pos];
  const zeig = (p) => (p.t === 'num' ? p.v : p.t === 'fn' ? p.v : p.t === 'var' ? varName : p.t);
  const take = (t) => {
    if (peek() && peek().t === t) return tokens[pos++];
    throw new Error(peek() ? `Unerwartet: „${zeig(peek())}“` : 'Ausdruck endet zu früh (Klammer vergessen?).');
  };
  const startAtom = (p) => p && ['num', 'var', 'fn', 'pi', 'e', '('].includes(p.t);

  function expr() {
    let r = term();
    while (peek() && (peek().t === '+' || peek().t === '-')) {
      const op = tokens[pos++].t;
      const b = term();
      r = op === '+' ? { k: 'add', a: r, b } : { k: 'sub', a: r, b };
    }
    return r;
  }
  function term() {
    let r = unary();
    for (;;) {
      const p = peek();
      if (!p) break;
      if (p.t === '*') { pos++; r = { k: 'mul', a: r, b: unary() }; }
      else if (p.t === '/') { pos++; r = { k: 'div', a: r, b: unary() }; }
      else if (startAtom(p)) r = { k: 'mul', a: r, b: power() };
      else break;
    }
    return r;
  }
  function unary() {
    const p = peek();
    if (p && p.t === '-') { pos++; return { k: 'neg', x: unary() }; }
    if (p && p.t === '+') { pos++; return unary(); }
    return power();
  }
  function power() {
    const base = atom();
    if (peek() && peek().t === '^') {
      pos++;
      const ex = peek() && peek().t === '-' ? (pos++, { k: 'neg', x: power() }) : power();
      return { k: 'pow', a: base, b: ex };
    }
    return base;
  }
  function atom() {
    const p = peek();
    if (!p) throw new Error('Ausdruck endet zu früh.');
    if (p.t === 'num') { pos++; return num(p.v); }
    if (p.t === 'var') { pos++; return VAR; }
    if (p.t === 'pi') { pos++; return PI; }
    if (p.t === 'e') { pos++; return E; }
    if (p.t === '(') { pos++; const r = expr(); take(')'); return r; }
    if (p.t === 'fn') {
      pos++;
      // sin(t), sin t, √t, √(t+1); sin²(t) wird nicht unterstützt
      const arg = peek() && peek().t === '(' ? atom() : power();
      return fn(p.v, arg);
    }
    throw new Error(`Unerwartet: „${zeig(p)}“`);
  }
  const roh = expr();
  if (pos < tokens.length) throw new Error(`Unerwartet: „${zeig(tokens[pos])}“`);
  return { baum: vereinfache(roh), varName };
}

/** Baum mit den Vereinfachungsregeln neu aufbauen. */
export function vereinfache(a) {
  switch (a.k) {
    case 'num': case 'var': case 'const': return a;
    case 'add': return add(vereinfache(a.a), vereinfache(a.b));
    case 'sub': return sub(vereinfache(a.a), vereinfache(a.b));
    case 'mul': return mul(vereinfache(a.a), vereinfache(a.b));
    case 'div': return div(vereinfache(a.a), vereinfache(a.b));
    case 'pow': return pow(vereinfache(a.a), vereinfache(a.b));
    case 'neg': return neg(vereinfache(a.x));
    case 'fn': {
      const x = vereinfache(a.x);
      if (a.name === 'exp') return pow(E, x);
      return fn(a.name, x);
    }
  }
  throw new Error('Interner Fehler im Ausdruck.');
}

// ---------- Auswerten ----------
export function wert(a, t) {
  switch (a.k) {
    case 'num': return a.v;
    case 'var': return t;
    case 'const': return a.v;
    case 'add': return wert(a.a, t) + wert(a.b, t);
    case 'sub': return wert(a.a, t) - wert(a.b, t);
    case 'mul': return wert(a.a, t) * wert(a.b, t);
    case 'div': return wert(a.a, t) / wert(a.b, t);
    case 'pow': return wert(a.a, t) ** wert(a.b, t);
    case 'neg': return -wert(a.x, t);
    case 'fn': {
      const x = wert(a.x, t);
      return { sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, ln: Math.log, exp: Math.exp }[a.name](x);
    }
  }
  return NaN;
}

// ---------- Ableiten ----------
export function ableiten(a) {
  if (!hatVar(a)) return num(0);
  switch (a.k) {
    case 'var': return num(1);
    case 'add': return add(ableiten(a.a), ableiten(a.b));
    case 'sub': return sub(ableiten(a.a), ableiten(a.b));
    case 'neg': return neg(ableiten(a.x));
    case 'mul':
      if (!hatVar(a.a)) return mul(a.a, ableiten(a.b));
      if (!hatVar(a.b)) return mul(ableiten(a.a), a.b);
      return add(mul(ableiten(a.a), a.b), mul(a.a, ableiten(a.b)));
    case 'div':
      if (!hatVar(a.b)) return div(ableiten(a.a), a.b);
      if (!hatVar(a.a)) return neg(div(mul(a.a, ableiten(a.b)), pow(a.b, num(2))));
      return div(sub(mul(ableiten(a.a), a.b), mul(a.a, ableiten(a.b))), pow(a.b, num(2)));
    case 'pow': {
      if (!hatVar(a.b)) { // u^n → n·u^(n−1)·u'
        const n = vereinfache(a.b);
        const nm1 = isNum(n) ? num(n.v - 1) : sub(n, num(1));
        return mul(mul(n, pow(a.a, nm1)), ableiten(a.a));
      }
      if (!hatVar(a.a)) { // c^u → c^u·ln(c)·u', e^u → e^u·u'
        const lnC = a.a.k === 'const' && a.a.name === 'e' ? num(1) : fn('ln', a.a);
        return mul(mul(a, lnC), ableiten(a.b));
      }
      throw new Error('Ableitung von u(t)^v(t) wird nicht unterstützt.');
    }
    case 'fn': {
      const u = a.x, du = ableiten(a.x);
      switch (a.name) {
        case 'sqrt': return div(du, mul(num(2), fn('sqrt', u)));
        case 'sin': return mul(fn('cos', u), du);
        case 'cos': return neg(mul(fn('sin', u), du));
        case 'tan': return div(du, pow(fn('cos', u), num(2)));
        case 'ln': return div(du, u);
      }
    }
  }
  throw new Error('Diese Funktion kann nicht abgeleitet werden.');
}

// ---------- Text ----------
const RANG = { add: 1, sub: 1, neg: 2, mul: 3, div: 3, pow: 5, num: 9, var: 9, const: 9, fn: 9 };
export const zahl = (v) => frac(v, 1000);

/** Beginnt der Text mit einem Minus? (−2t, −sin(t), −1/4) */
function negLead(x) {
  return x.k === 'neg' || (x.k === 'num' && x.v < 0) || ((x.k === 'mul' || x.k === 'div') && negLead(x.a));
}

/**
 * Ausdruck als Text. v = Variablenname. ein = true: Variable wird durch einen Wert ersetzt
 * (dann immer mit „·“ multiplizieren, z. B. 2·1 statt 21).
 */
export function text(a, v = 't', ein = false) {
  const T = (x) => text(x, v, ein);
  const kl = (x, min) => {
    const s = T(x);
    let r = RANG[x.k];
    if (negLead(x)) r = 2;
    else if (x.k === 'num' && /\//.test(s)) r = 3; // Bruch wie Produkt behandeln
    return r < min ? `(${s})` : s;
  };
  switch (a.k) {
    case 'num': return zahl(a.v);
    case 'var': return v;
    case 'const': return a.name;
    case 'add': {
      if (negLead(a.b)) return `${T(a.a)} − ${T(neg(a.b))}`;
      return `${T(a.a)} + ${kl(a.b, 2)}`;
    }
    case 'sub': return `${T(a.a)} − ${kl(a.b, 2)}`;
    case 'neg': return `−${kl(a.x, 3)}`;
    case 'mul': {
      if (isNum(a.a) && a.a.v < 0) return '−' + T(mul(num(-a.a.v), a.b));
      const l = kl(a.a, 3), r = kl(a.b, 4);
      // 2t, 3t², 2√t, 2sin(t): Zahl direkt vor Variable/Funktion/Potenz der Variablen
      const kurz = !ein && a.a.k === 'num' && !/[/]/.test(l) && !l.startsWith('(') && (a.b.k === 'var' || a.b.k === 'fn' || (a.b.k === 'pow' && a.b.a.k === 'var') || (a.b.k === 'const'));
      return kurz ? l + r : `${l}·${r}`;
    }
    case 'div': {
      if (negLead(a.a)) return '−' + T(div(neg(a.a), a.b));
      return `${kl(a.a, 4)}/${kl(a.b, 4)}`;
    }
    case 'pow': {
      const b = kl(a.a, 6);
      if (isNum(a.b) && Number.isInteger(a.b.v) && a.b.v > 1 && a.b.v < 100) return b + sup(a.b.v);
      return `${b}^${kl(a.b, 6)}`;
    }
    case 'fn': {
      if (a.name === 'sqrt') {
        const s = T(a.x);
        return (a.x.k === 'var' && !ein) || (a.x.k === 'num' && a.x.v >= 0) || (ein && a.x.k === 'var' && /^[\d,.]+$/.test(v)) ? `√${s}` : `√(${s})`;
      }
      return `${a.name}(${T(a.x)})`;
    }
  }
  return '?';
}

/** Ist der Ausdruck ein Polynom (nur + − · /Zahl ^ganzzahlig)? */
export function istPolynom(a) {
  switch (a.k) {
    case 'num': case 'var': return true;
    case 'const': return true;
    case 'add': case 'sub': case 'mul': return istPolynom(a.a) && istPolynom(a.b);
    case 'neg': return istPolynom(a.x);
    case 'div': return istPolynom(a.a) && !hatVar(a.b);
    case 'pow': return istPolynom(a.a) && isNum(a.b) && Number.isInteger(a.b.v) && a.b.v >= 0;
    default: return false;
  }
}

/** Polynom-Koeffizienten [c0, c1, …] (nur wenn istPolynom). */
export function koeffizienten(a) {
  const padd = (p, q) => Array.from({ length: Math.max(p.length, q.length) }, (_, i) => (p[i] || 0) + (q[i] || 0));
  const pmul = (p, q) => { const r = new Array(p.length + q.length - 1).fill(0); p.forEach((x, i) => q.forEach((y, j) => { r[i + j] += x * y; })); return r; };
  switch (a.k) {
    case 'num': case 'const': return [wert(a, 0)];
    case 'var': return [0, 1];
    case 'add': return padd(koeffizienten(a.a), koeffizienten(a.b));
    case 'sub': return padd(koeffizienten(a.a), koeffizienten(a.b).map((x) => -x));
    case 'neg': return koeffizienten(a.x).map((x) => -x);
    case 'mul': return pmul(koeffizienten(a.a), koeffizienten(a.b));
    case 'div': { const d = wert(a.b, 0); return koeffizienten(a.a).map((x) => x / d); }
    case 'pow': { let r = [1]; const b = koeffizienten(a.a); for (let i = 0; i < a.b.v; i++) r = pmul(r, b); return r; }
  }
  throw new Error('Kein Polynom.');
}

/** Polynom-Text in der Variablen, absteigend: "t² − 2t + 1" */
export function polyText(p, v = 't') {
  const q = p.map((c) => (Math.abs(c) < 1e-12 ? 0 : c));
  while (q.length > 1 && q[q.length - 1] === 0) q.pop();
  const parts = [];
  for (let i = q.length - 1; i >= 0; i--) {
    const c = q[i];
    if (c === 0) continue;
    const vv = i === 0 ? '' : v + (i > 1 ? sup(i) : '');
    const a = Math.abs(c);
    let z = zahl(a);
    if (/\//.test(z) && i > 0) z = `(${z})`;
    parts.push({ neg: c < 0, body: (a === 1 && i > 0 ? '' : z) + vv });
  }
  if (!parts.length) return '0';
  return parts.map((t, i) => (i === 0 ? (t.neg ? '−' : '') + t.body : (t.neg ? ' − ' : ' + ') + t.body)).join('');
}
