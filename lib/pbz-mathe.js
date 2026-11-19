// Helfer für PBZ und inverse Laplace: reelle Polynome (aufsteigend, Zahlen-Arrays),
// Nullstellen, Gleichungssystem, Zerlegung von Eingaben, Darstellung.
import { parsePoly, frac, fmt, sup, K } from './poly.js';

// ---------- Zahlen ----------

/** Rundet auf einen „schönen“ Bruch (Nenner ≤ 1000), wenn x sehr nahe dran liegt. */
export function nice(x, tol = 1e-9) {
  if (!isFinite(x)) return x;
  if (Math.abs(x) < tol) return 0;
  for (let d = 1; d <= 1000; d++) {
    const n = x * d;
    if (Math.abs(n - Math.round(n)) < tol * Math.max(1, Math.abs(n))) return Math.round(n) / d;
  }
  return x;
}

const istGanz = (x) => Math.abs(x - Math.round(x)) < 1e-9 * Math.max(1, Math.abs(x));
const istBruch = (x, maxN = 1000) => !/,/.test(frac(x, maxN)) && isFinite(x);

/** Ergebnis-Zahl wie in der Musterlösung: Bruch (−1/5), sonst Dezimal. */
export const zf = (x) => frac(nice(x), 1000);

/** Zahl mit Näherung, wenn sie ein echter Bruch ist: "1/3 ≈ 0,3333". */
export function zfn(x) {
  const b = zf(x);
  return b.includes('/') ? `${b} ≈ ${fmt(x)}` : b;
}

/** Koeffizient in einem Polynom (z. B. Zeitkonstante): kurze Dezimalzahl, sonst Bruch. */
export function kz(x) {
  x = nice(x);
  const f = fmt(x);
  if (Math.abs(parseFloat(f.replace('−', '-').replace(',', '.')) - x) < 1e-12) return f;
  return frac(x, 1000);
}

/** Wurzel als Text: 9 → "3", 7 → "√7", 1/4 → "1/2". */
export function wurzelText(x) {
  const r = Math.sqrt(x);
  if (istBruch(nice(r, 1e-10), 100) && Math.abs(nice(r, 1e-10) - r) < 1e-12) return frac(r, 100);
  const xn = nice(x);
  if (Math.abs(xn - x) < 1e-12 && istGanz(xn)) return '√' + Math.round(xn);
  if (Math.abs(xn - x) < 1e-12 && istBruch(xn)) return '√(' + frac(xn) + ')';
  return fmt(r);
}

// ---------- Polynome (aufsteigend: p[i] = Koeffizient von sⁱ) ----------

export const R = {
  trim(p) {
    const q = p.map((c) => (Math.abs(c) < 1e-13 ? 0 : c));
    while (q.length > 1 && q[q.length - 1] === 0) q.pop();
    return q.length ? q : [0];
  },
  deg: (p) => R.trim(p).length - 1,
  add(a, b) {
    const r = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) r.push((a[i] || 0) + (b[i] || 0));
    return R.trim(r);
  },
  scale: (a, c) => R.trim(a.map((x) => x * c)),
  sub: (a, b) => R.add(a, R.scale(b, -1)),
  mul(a, b) {
    const r = new Array(a.length + b.length - 1).fill(0);
    a.forEach((x, i) => b.forEach((y, j) => { r[i + j] += x * y; }));
    return R.trim(r);
  },
  pow(a, n) { let r = [1]; for (let i = 0; i < n; i++) r = R.mul(r, a); return r; },
  eval: (p, x) => p.reduceRight((acc, c) => acc * x + c, 0),
  lead: (p) => R.trim(p)[R.deg(p)],
};

/** bpoly aus poly.js → Zahlen-Polynom. Wirft, wenn ein Parameter K drin ist. */
export function zahlenPoly(bp) {
  return R.trim(bp.map((k) => {
    const t = K.trim(k);
    if (t.length > 1) throw new Error('Bitte Zahlen eingeben (Buchstaben außer s gehen nur in einfachen Formen wie K/(1+Ts)).');
    return t[0];
  }));
}

/** Polynom als Text. aufsteigend=true: "1 + 7s", sonst "s² + 2s + 5". */
export function polyText(p, aufsteigend = false, bruchForm = false) {
  const kzz = bruchForm ? zf : kz;
  p = R.trim(p);
  const idx = p.map((_, i) => i).filter((i) => p[i] !== 0);
  if (!aufsteigend) idx.reverse();
  if (!idx.length) return '0';
  return idx.map((i, j) => {
    const c = nice(p[i]);
    const a = Math.abs(c);
    const sp = i === 0 ? '' : 's' + (i > 1 ? sup(i) : '');
    let body;
    if (i === 0) body = kzz(a);
    else if (a === 1) body = sp;
    else { const t = kzz(a); body = t.includes('/') ? t + '·' + sp : t + sp; }
    if (j === 0) return (c < 0 ? '−' : '') + body;
    return (c < 0 ? ' − ' : ' + ') + body;
  }).join('');
}

// ---------- Komplexe Nullstellen (Durand-Kerner) ----------

function nullstellenNumerisch(p) {
  p = R.trim(p);
  const n = p.length - 1;
  const a = p.map((c) => c / p[n]);
  let z = Array.from({ length: n }, (_, k) => {
    const r = Math.pow(1 + Math.max(...a.slice(0, n).map(Math.abs)), 1) * 0.9;
    const ang = (2 * Math.PI * k) / n + 0.4;
    return [r * Math.cos(ang), r * Math.sin(ang)];
  });
  const mul = (x, y) => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]];
  const div = (x, y) => { const d = y[0] * y[0] + y[1] * y[1]; return [(x[0] * y[0] + x[1] * y[1]) / d, (x[1] * y[0] - x[0] * y[1]) / d]; };
  const ev = (x) => { let r = [1, 0]; for (let i = n - 1; i >= 0; i--) r = [mul(r, x)[0] + a[i], mul(r, x)[1]]; return r; };
  for (let it = 0; it < 2000; it++) {
    let maxd = 0;
    z = z.map((zi, i) => {
      let den = [1, 0];
      z.forEach((zj, j) => { if (j !== i) den = mul(den, [zi[0] - zj[0], zi[1] - zj[1]]); });
      if (den[0] === 0 && den[1] === 0) den = [1e-12, 0];
      const d = div(ev(zi), den);
      maxd = Math.max(maxd, Math.hypot(d[0], d[1]));
      return [zi[0] - d[0], zi[1] - d[1]];
    });
    if (maxd < 1e-15) break;
  }
  return z;
}

/**
 * Pole eines Polynoms mit Vielfachheit.
 * Rückgabe: [{ re, im, m }], komplexe Paare nur einmal (im > 0).
 */
export function pole(p) {
  p = R.trim(p);
  const n = p.length - 1;
  if (n < 1) return [];
  let roh;
  if (n === 1) roh = [[-p[0] / p[1], 0]];
  else if (n === 2) {
    const [c, b, a] = p;
    const D = b * b - 4 * a * c;
    const skala = Math.max(b * b, Math.abs(4 * a * c), 1e-300);
    if (Math.abs(D) <= 1e-12 * skala) roh = [[-b / (2 * a), 0], [-b / (2 * a), 0]];
    else if (D > 0) roh = [[(-b + Math.sqrt(D)) / (2 * a), 0], [(-b - Math.sqrt(D)) / (2 * a), 0]];
    else roh = [[-b / (2 * a), Math.sqrt(-D) / (2 * a)], [-b / (2 * a), -Math.sqrt(-D) / (2 * a)]];
  } else {
    // Faktor sᵏ vorher abspalten (exakte Null)
    let k = 0;
    while (p[k] === 0) k++;
    roh = Array.from({ length: k }, () => [0, 0]);
    if (n - k > 2) roh.push(...nullstellenNumerisch(p.slice(k)));
    else if (n - k >= 1) pole(p.slice(k)).forEach((r) => {
      for (let i = 0; i < r.m; i++) { roh.push([r.re, r.im]); if (r.im) roh.push([r.re, -r.im]); }
    });
  }
  return gruppieren(roh);
}

function gruppieren(roh) {
  const tolC = (x) => 1e-5 * Math.max(1, Math.hypot(x[0], x[1]));
  const reell = [], kompl = [];
  for (const [re, im] of roh) {
    if (Math.abs(im) <= 1e-7 * Math.max(1, Math.abs(re))) reell.push(re);
    else if (im > 0) kompl.push([re, im]);
  }
  const out = [];
  reell.sort((a, b) => b - a);
  for (const r of reell) {
    const g = out.find((o) => o.im === 0 && Math.abs(o.summe / o.m - r) <= tolC([r, 0]));
    if (g) { g.summe += r; g.m++; } else out.push({ summe: r, m: 1, im: 0 });
  }
  const res = out.map((o) => ({ re: nice(o.summe / o.m, o.m > 1 ? 1e-6 : 1e-9), im: 0, m: o.m }));
  for (const [re, im] of kompl) {
    const g = res.find((o) => o.im && Math.abs(o.re - re) < tolC([re, im]) && Math.abs(o.im - im) < tolC([re, im]));
    if (g) g.m++; else res.push({ re: nice(re), im: nice(im), m: 1 });
  }
  return res;
}

// ---------- Lineares Gleichungssystem ----------

export function loese(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    if (Math.abs(M[piv][c]) < 1e-14) throw new Error('Gleichungssystem nicht lösbar (Pole doppelt eingegeben?).');
    [M[c], M[piv]] = [M[piv], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

// ---------- Eingabe zerlegen ----------

/** Normalisiert: − → -, · → *, Hochzahlen → ^n, Leerzeichen weg. */
export function norm(s) {
  return String(s)
    .replace(/[−–]/g, '-')
    .replace(/[·×]/g, '*')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => '^' + [...m].map((ch) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(ch)).join(''))
    .replace(/\s+/g, '');
}

/** Teilt auf Tiefe 0 an Zeichen aus `zeichen`. Gibt [{op, text}] zurück. */
function teile(s, istTrenner) {
  const out = [];
  let tiefe = 0, start = 0, op = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(') tiefe++;
    else if (ch === ')') { tiefe--; if (tiefe < 0) throw new Error('Klammer „)“ zu viel.'); }
    else if (tiefe === 0 && istTrenner(ch, i, s)) {
      out.push({ op, text: s.slice(start, i) });
      op = ch; start = i + 1;
    }
  }
  if (tiefe !== 0) throw new Error('Klammer „(“ wird nicht geschlossen.');
  out.push({ op, text: s.slice(start) });
  return out;
}

/** Summanden auf oberster Ebene: "2s/(s^2-7)+3/(s^2-7)" → ["2s/(s^2-7)", "+3/(s^2-7)"]. */
export function summanden(s) {
  s = norm(s);
  const teileL = teile(s, (ch, i, str) => (ch === '+' || ch === '-') && i > 0 && !'^*/('.includes(str[i - 1]));
  return teileL.map((t) => (t.op ? t.op : '') + t.text).filter((t) => t !== '' && t !== '+');
}

/** Bruch zerlegen: Zähler-Text, Nenner-Text (Teile ohne s gehen in den Zähler). */
export function bruch(s) {
  s = norm(s);
  // äußere Klammer um den ganzen Ausdruck entfernen, wenn sie alles umfasst
  while (s.startsWith('(') && s.endsWith(')') && passendeKlammer(s)) s = s.slice(1, -1);
  const t = teile(s, (ch) => ch === '/');
  let z = t[0].text;
  const n = [];
  for (const p of t.slice(1)) {
    if (p.text === '') throw new Error('Nach „/“ fehlt etwas.');
    if (/s/.test(p.text)) n.push('(' + p.text + ')');
    else z = '(' + z + ')/(' + p.text + ')';
  }
  if (z === '' || z === '+') z = '1';
  if (z === '-') z = '-1';
  return { zaehler: z, nenner: n.length ? n.join('*') : '1', nennerTeile: t.slice(1).filter((p) => /s/.test(p.text)).map((p) => p.text) };
}

function passendeKlammer(s) {
  let tiefe = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') tiefe++;
    else if (s[i] === ')') { tiefe--; if (tiefe === 0 && i < s.length - 1) return false; }
  }
  return true;
}

/**
 * Nenner in Faktoren zerlegen, falls er als Produkt geschrieben ist: "s(1+7s)(1+8s)^2".
 * Rückgabe: [{ poly, exp }] oder null (dann ist es kein reines Produkt).
 */
export function faktoren(nennerTeile) {
  const out = [];
  for (let s of nennerTeile) {
    s = norm(s);
    while (s.startsWith('(') && s.endsWith(')') && passendeKlammer(s)) s = s.slice(1, -1);
    let i = 0;
    while (i < s.length) {
      if (s[i] === '*') { i++; continue; }
      const start = i;
      if (s[i] === '(') {
        let t = 0;
        do { if (s[i] === '(') t++; else if (s[i] === ')') t--; i++; } while (i < s.length && t > 0);
      } else if (s[i] === 's') i++;
      else if (/[\d.,]/.test(s[i])) { while (i < s.length && /[\d.,]/.test(s[i])) i++; }
      else if (s[i] === '-' && i === 0) { out.push({ poly: [-1], exp: 1 }); i++; continue; }
      else return null;
      const basis = s.slice(start, i);
      let exp = 1;
      if (s[i] === '^') {
        i++;
        const m = /^\(?(\d+)\)?/.exec(s.slice(i));
        if (!m) return null;
        exp = +m[1]; i += m[0].length;
      }
      out.push({ poly: zahlenPoly(parsePoly(basis)), exp });
    }
  }
  return out;
}

/** Eingabe hübsch: "2s/(s^2-7)" → "2s/(s² − 7)". */
export function huebsch(s) {
  return norm(s)
    .replace(/([^(*/^])([+-])/g, '$1 $2 ')
    .replace(/\^\((\d+)\)|\^(\d+)/g, (_, d1, d2) => sup(d1 || d2))
    .replace(/\*/g, '·')
    .replace(/-/g, '−')
    .replace(/\./g, ',');
}

/** Zahlen-Polynom aus Text (ohne Parameter). */
export function leseZahlenPoly(s) {
  return zahlenPoly(parsePoly(s));
}
