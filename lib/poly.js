// Polynome in s, deren Koeffizienten selbst Polynome im Parameter K sein dürfen.
// kpoly: Array [c0, c1, c2, …] = c0 + c1·K + c2·K² …
// bpoly: Array über die s-Potenz, jeder Eintrag ein kpoly: bp[i] = Koeffizient von sⁱ

const EPS = 1e-12;

// ---------- Darstellung ----------

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const SUB = '₀₁₂₃₄₅₆₇₈₉';
export const sup = (n) => String(n).split('').map((d) => SUP[+d]).join('');
export const sub = (n) => String(n).split('').map((d) => SUB[+d]).join('');

/** Zahl deutsch formatiert: Komma, echtes Minuszeichen, ganze Zahlen ohne Nachkommastellen. */
export function fmt(x, digits = 4) {
  if (x === Infinity) return '∞';
  if (x === -Infinity) return '−∞';
  if (Math.abs(x) < EPS) x = 0;
  const r = Math.round(x);
  let s;
  if (Math.abs(x - r) < 1e-9 * Math.max(1, Math.abs(x))) {
    s = String(Math.abs(r));
  } else {
    s = String(+Math.abs(x).toFixed(digits));
    if (s === '0') s = String(+Math.abs(x).toPrecision(3));
  }
  return (x < 0 ? '−' : '') + s.replace('.', ',');
}

/** Zahl als gekürzter Bruch, wenn der Nenner ≤ maxNenner ist: −0,2 → "−1/5". Sonst Dezimalzahl. */
export function frac(x, maxNenner = 1000) {
  if (!isFinite(x)) return fmt(x);
  for (let d = 1; d <= maxNenner; d++) {
    const n = x * d;
    if (Math.abs(n - Math.round(n)) < 1e-9 * Math.max(1, Math.abs(n))) {
      const z = Math.round(n);
      return d === 1 ? fmt(z) : (z < 0 ? '−' : '') + Math.abs(z) + '/' + d;
    }
  }
  return fmt(x);
}

// ---------- Polynome in K ----------

export const K = {
  trim(p) {
    const q = p.map((c) => (Math.abs(c) < EPS ? 0 : c));
    while (q.length > 1 && q[q.length - 1] === 0) q.pop();
    if (!q.length) q.push(0);
    return q;
  },
  c: (x) => [x],
  add(a, b) {
    const r = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) r.push((a[i] || 0) + (b[i] || 0));
    return K.trim(r);
  },
  neg: (a) => a.map((x) => -x),
  sub: (a, b) => K.add(a, K.neg(b)),
  mul(a, b) {
    const r = new Array(a.length + b.length - 1).fill(0);
    a.forEach((x, i) => b.forEach((y, j) => { r[i + j] += x * y; }));
    return K.trim(r);
  },
  scale: (a, c) => K.trim(a.map((x) => x * c)),
  deg: (a) => K.trim(a).length - 1,
  isConst: (a) => K.trim(a).length === 1,
  isZero: (a) => { const t = K.trim(a); return t.length === 1 && t[0] === 0; },
  eval: (a, x) => a.reduceRight((acc, c) => acc * x + c, 0),
};

/** kpoly als Text, aufsteigend: "2 + 10K_R" */
export function kfmt(p, name = 'K') {
  p = K.trim(p);
  const parts = [];
  p.forEach((c, i) => {
    if (c === 0) return;
    let body;
    if (i === 0) body = fmt(Math.abs(c));
    else body = (Math.abs(c) === 1 ? '' : fmt(Math.abs(c))) + name + (i > 1 ? sup(i) : '');
    parts.push({ neg: c < 0, body });
  });
  if (!parts.length) return '0';
  return parts.map((t, i) => (i === 0 ? (t.neg ? '−' : '') + t.body : (t.neg ? ' − ' : ' + ') + t.body)).join('');
}

/** kpoly als Faktor in einem Produkt: negative Zahlen und Summen in Klammern. */
export function kfac(p, name = 'K') {
  p = K.trim(p);
  const t = kfmt(p, name);
  if (p.length === 1) return p[0] < 0 ? '(' + t + ')' : t;
  const terms = p.filter((c) => c !== 0).length;
  return terms > 1 ? '(' + t + ')' : t;
}

// ---------- Polynome in s (Koeffizienten in K) ----------

export const BP = {
  trim(p) {
    const q = p.map(K.trim);
    while (q.length > 1 && K.isZero(q[q.length - 1])) q.pop();
    if (!q.length) q.push([0]);
    return q;
  },
  const: (kp) => [kp],
  add(a, b) {
    const r = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) r.push(K.add(a[i] || [0], b[i] || [0]));
    return BP.trim(r);
  },
  neg: (a) => a.map(K.neg),
  sub: (a, b) => BP.add(a, BP.neg(b)),
  mul(a, b) {
    const r = Array.from({ length: a.length + b.length - 1 }, () => [0]);
    a.forEach((x, i) => b.forEach((y, j) => { r[i + j] = K.add(r[i + j], K.mul(x, y)); }));
    return BP.trim(r);
  },
  scale: (a, c) => BP.trim(a.map((k) => K.scale(k, c))),
  deg: (a) => BP.trim(a).length - 1,
  hasParam: (a) => a.some((k) => !K.isConst(k)),
};

/** Polynom in s als Text, absteigend: "s² + 3s + (2 + 10K_R)" */
export function bfmt(p, name = 'K') {
  p = BP.trim(p);
  const parts = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i];
    if (K.isZero(c)) continue;
    const sp = i === 0 ? '' : 's' + (i > 1 ? sup(i) : '');
    if (K.isConst(c)) {
      const v = c[0];
      const a = Math.abs(v);
      const body = (a === 1 && i > 0 ? '' : fmt(a)) + sp;
      parts.push({ neg: v < 0, body });
    } else if (i === 0) {
      // Absolutglied ohne Klammern, wie in der Musterlösung: s² + 3s + 2 + 10K_R
      const t = kfmt(c, name);
      parts.push(t.startsWith('−') ? { neg: true, body: t.slice(1) } : { neg: false, body: t });
    } else if (c.filter((x) => x !== 0).length === 1) {
      const t = kfmt(c, name); // ein Summand: 3K_R·s
      parts.push(t.startsWith('−') ? { neg: true, body: t.slice(1) + '·' + sp } : { neg: false, body: t + '·' + sp });
    } else {
      parts.push({ neg: false, body: '(' + kfmt(c, name) + ')·' + sp });
    }
  }
  if (!parts.length) return '0';
  return parts.map((t, i) => (i === 0 ? (t.neg ? '−' : '') + t.body : (t.neg ? ' − ' : ' + ') + t.body)).join('');
}

// ---------- Eingabe lesen ----------

/**
 * Liest z. B. "s^3 + 9s^2 + 23s + 15", "(s+1)(s+2) + 10K_R", "24s⁴−2s−1", "0,5s + 1/3".
 * Gibt ein bpoly zurück oder wirft einen Fehler mit deutscher Meldung.
 */
export function parsePoly(input) {
  const src = String(input)
    .replace(/[−–]/g, '-')
    .replace(/[·×]/g, '*')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => '^' + [...m].map((ch) => SUP.indexOf(ch)).join(''));

  const tokens = [];
  const re = /\s*(?:(\d+(?:[.,]\d+)?|[.,]\d+)|([Kk](?:_?[Rr])?)|(s)|([-+*/^()]))/y;
  let i = 0;
  while (i < src.length) {
    if (/^\s*$/.test(src.slice(i))) break;
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m) {
      const ch = src.slice(i).trim()[0];
      throw new Error(`Unbekanntes Zeichen „${ch}“. Erlaubt: Zahlen, s, K, + − · / ^ ( )`);
    }
    if (m[1] !== undefined) tokens.push({ t: 'num', v: parseFloat(m[1].replace(',', '.')) });
    else if (m[2] !== undefined) tokens.push({ t: 'K' });
    else if (m[3] !== undefined) tokens.push({ t: 's' });
    else tokens.push({ t: m[4] });
    i = re.lastIndex;
  }
  if (!tokens.length) throw new Error('Bitte ein Polynom eingeben.');

  let pos = 0;
  const peek = () => tokens[pos];
  const take = (t) => {
    if (peek() && peek().t === t) return tokens[pos++];
    throw new Error(peek() ? `Unerwartet: „${peek().t === 'num' ? peek().v : peek().t}“` : 'Ausdruck endet zu früh.');
  };

  function expr() {
    let r = term();
    while (peek() && (peek().t === '+' || peek().t === '-')) {
      const op = tokens[pos++].t;
      const b = term();
      r = op === '+' ? BP.add(r, b) : BP.sub(r, b);
    }
    return r;
  }
  function term() {
    let r = unary();
    for (;;) {
      const p = peek();
      if (!p) break;
      if (p.t === '*') { pos++; r = BP.mul(r, unary()); }
      else if (p.t === '/') {
        pos++;
        const d = unary();
        if (BP.deg(d) > 0 || !K.isConst(d[0])) throw new Error('Teilen geht nur durch Zahlen.');
        if (d[0][0] === 0) throw new Error('Division durch 0.');
        r = BP.scale(r, 1 / d[0][0]);
      } else if (p.t === 'num' || p.t === 's' || p.t === 'K' || p.t === '(') {
        r = BP.mul(r, power()); // 10K, 3s, (s+1)(s+2)
      } else break;
    }
    return r;
  }
  function unary() {
    const p = peek();
    if (p && p.t === '-') { pos++; return BP.neg(unary()); }
    if (p && p.t === '+') { pos++; return unary(); }
    return power();
  }
  function power() {
    const base = atom();
    if (peek() && peek().t === '^') {
      pos++;
      const e = atom();
      if (BP.deg(e) > 0 || !K.isConst(e[0])) throw new Error('Exponent muss eine Zahl sein.');
      const n = e[0][0];
      if (!Number.isInteger(n) || n < 0 || n > 20) throw new Error('Exponent muss eine ganze Zahl 0…20 sein.');
      let r = [[1]];
      for (let k = 0; k < n; k++) r = BP.mul(r, base);
      return r;
    }
    return base;
  }
  function atom() {
    const p = peek();
    if (!p) throw new Error('Ausdruck endet zu früh.');
    if (p.t === 'num') { pos++; return [[p.v]]; }
    if (p.t === 's') { pos++; return [[0], [1]]; }
    if (p.t === 'K') { pos++; return [[0, 1]]; }
    if (p.t === '(') { pos++; const r = expr(); take(')'); return r; }
    throw new Error(`Unerwartet: „${p.t}“`);
  }

  const result = expr();
  if (pos < tokens.length) throw new Error(`Unerwartet: „${tokens[pos].t === 'num' ? tokens[pos].v : tokens[pos].t}“`);
  return result;
}

// ---------- Ungleichungen im Parameter K ----------

/** Reelle Nullstellen eines kpoly (numerisch, über die Extremstellen eingegrenzt). */
export function realRoots(p) {
  p = K.trim(p);
  const d = p.length - 1;
  if (d < 1) return [];
  if (d === 1) return [-p[0] / p[1]];
  const dp = p.slice(1).map((c, i) => c * (i + 1));
  const crit = realRoots(dp).sort((a, b) => a - b);
  const B = 1 + Math.max(...p.slice(0, -1).map((c) => Math.abs(c / p[d])));
  const pts = [-B, ...crit.filter((x) => x > -B && x < B), B];
  const f = (x) => K.eval(p, x);
  const tol = (x) => 1e-9 * Math.max(1, ...p.map((c, i) => Math.abs(c * x ** i)));
  const roots = [];
  for (let i = 0; i < pts.length; i++) {
    if (Math.abs(f(pts[i])) <= tol(pts[i])) roots.push(pts[i]);
    if (i === pts.length - 1) break;
    let a = pts[i], b = pts[i + 1];
    let fa = f(a), fb = f(b);
    if (fa * fb < 0) {
      for (let k = 0; k < 200; k++) {
        const m = (a + b) / 2, fm = f(m);
        if (fa * fm <= 0) { b = m; fb = fm; } else { a = m; fa = fm; }
      }
      roots.push((a + b) / 2);
    }
  }
  roots.sort((a, b) => a - b);
  return roots.filter((r, i) => i === 0 || Math.abs(r - roots[i - 1]) > 1e-9);
}

/** Bereich der K, für die alle kpolys > 0 sind. Liste offener Intervalle [lo, hi]. */
export function solvePositive(conds) {
  const roots = [...new Set(conds.flatMap(realRoots))].sort((a, b) => a - b);
  const edges = [-Infinity, ...roots, Infinity];
  const ok = (x) => conds.every((c) => K.eval(c, x) > 1e-12);
  const out = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const lo = edges[i], hi = edges[i + 1];
    const mid = lo === -Infinity && hi === Infinity ? 0
      : lo === -Infinity ? hi - 1
      : hi === Infinity ? lo + 1
      : (lo + hi) / 2;
    if (!ok(mid)) continue;
    const last = out[out.length - 1];
    if (last && last[1] === lo && ok(lo)) last[1] = hi;
    else out.push([lo, hi]);
  }
  return out;
}

/** Intervalle als Text: "K_R > −0,2", "0 < K_R < 3,5", "für alle K_R" */
export function fmtIntervals(iv, name = 'K') {
  if (!iv.length) return `für kein ${name}`;
  return iv.map(([lo, hi]) => {
    if (lo === -Infinity && hi === Infinity) return `für alle ${name}`;
    const z = (x) => frac(x, 20); // kleine Brüche wie in der Musterlösung (−1/5), sonst Dezimal
    if (lo === -Infinity) return `${name} < ${z(hi)}`;
    if (hi === Infinity) return `${name} > ${z(lo)}`;
    return `${z(lo)} < ${name} < ${z(hi)}`;
  }).join(' oder ');
}
