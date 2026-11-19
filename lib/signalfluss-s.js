// Zahlen-/Polynomwerte für die Blöcke einsetzen: symbolisches Ergebnis (in G1, G2 …) → G(s) = Z(s)/N(s).
// Nutzt die Polynome aus poly.js (Koeffizienten dürfen K enthalten).
import { BP, K, parsePoly } from './poly.js';
import { MP, R } from './signalfluss-algebra.js';

/** "1/((1+5s)(1+7s))" → { Z, N } als bpoly. Ohne „/“ ist N = 1. */
export function parseBruchS(text) {
  const t = String(text).trim();
  if (!t) throw new Error('Leerer Wert.');
  let d = 0, cut = -1;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '(') d++;
    else if (c === ')') d--;
    else if (c === '/' && d === 0) { cut = i; break; }
  }
  if (cut < 0) return { Z: parsePoly(t), N: [[1]] };
  const Z = parsePoly(t.slice(0, cut)), N = parsePoly(t.slice(cut + 1));
  if (BP.trim(N).length === 1 && K.isZero(BP.trim(N)[0])) throw new Error('Nenner ist 0.');
  return { Z, N };
}

const bpPow = (p, e) => { let r = [[1]]; for (let i = 0; i < e; i++) r = BP.mul(r, p); return r; };

/** Bruch r (in Blocknamen) mit werte: Name → {Z, N} → { Z, N } in s (ausmultipliziert, noch ungekürzt). */
export function einsetzenS(r, werte) {
  const { n, d } = R.zn(r);
  const namen = [...new Set([...MP.vars(n), ...MP.vars(d)])];
  for (const x of namen) if (!werte[x]) throw new Error(`Für ${x} fehlt ein Wert.`);
  const e = Object.fromEntries(namen.map((x) => [x, Math.max(MP.degIn(n, x), MP.degIn(d, x))]));
  const ev = (p) => {
    let s = [[0]];
    for (const [k, c] of p) {
      let t = [[c]];
      const m = {};
      if (k) for (const tt of k.split('*')) { const [x, ex] = tt.split('^'); m[x] = ex ? +ex : 1; }
      for (const x of namen) {
        const kx = m[x] || 0;
        t = BP.mul(t, BP.mul(bpPow(werte[x].Z, kx), bpPow(werte[x].N, e[x] - kx)));
      }
      s = BP.add(s, t);
    }
    return BP.trim(s);
  };
  return { Z: ev(n), N: ev(d) };
}

// ---------- Kürzen in s (nur ohne Parameter K) ----------

const maxAbs = (a) => Math.max(...a.map(Math.abs), 1e-300);
function trimF(a, tol = 0) {
  const r = a.slice();
  while (r.length > 1 && Math.abs(r[r.length - 1]) <= tol) r.pop();
  return r;
}
function divF(a, b) {
  const r = a.slice(), q = new Array(Math.max(1, a.length - b.length + 1)).fill(0);
  const db = b.length - 1;
  for (let i = a.length - 1; i >= db; i--) {
    const c = r[i] / b[db];
    q[i - db] = c;
    for (let j = 0; j <= db; j++) r[i - db + j] -= c * b[j];
  }
  return { q, r: trimF(r.slice(0, Math.max(1, db))) };
}
function gcdF(a, b) {
  const tolA = 1e-9 * Math.max(maxAbs(a), maxAbs(b));
  a = trimF(a); b = trimF(b);
  for (let k = 0; k < 50; k++) {
    if (b.length === 1 && Math.abs(b[0]) <= tolA) break;
    if (b.length === 1) return [1];
    const { r } = divF(a, b);
    const s = maxAbs(a);
    const rr = trimF(r.map((x) => (Math.abs(x) <= 1e-8 * s ? 0 : x)));
    a = b; b = rr;
  }
  const l = a[a.length - 1];
  return a.map((x) => x / l);
}
const istGanz = (x) => Math.abs(x - Math.round(x)) < 1e-7 * Math.max(1, Math.abs(x));

/**
 * Gemeinsame Faktoren von Z und N (ohne K) kürzen.
 * Rückgabe { Z, N, gekuerzt: bpoly|null }.
 */
export function kuerzenS(Z, N) {
  if (BP.hasParam(Z) || BP.hasParam(N)) return { Z, N, gekuerzt: null };
  const z = Z.map((k) => k[0]), n = N.map((k) => k[0]);
  if (z.every((x) => x === 0)) return { Z, N, gekuerzt: null };
  const g = gcdF(z, n);
  if (g.length < 2) return { Z, N, gekuerzt: null };
  const dz = divF(z, g), dn = divF(n, g);
  const ok = (r, a) => r.every((x) => Math.abs(x) <= 1e-7 * maxAbs(a));
  if (!ok(dz.r, z) || !ok(dn.r, n)) return { Z, N, gekuerzt: null };
  let zq = trimF(dz.q), nq = trimF(dn.q);
  // schöne Zahlen: kleinsten Nennerkoeffizienten ≠ 0 auf 1, dann ganzzahlig machen
  const lo = nq.find((x) => Math.abs(x) > 1e-12) || 1;
  zq = zq.map((x) => x / lo); nq = nq.map((x) => x / lo);
  for (let m = 1; m <= 10000; m++) {
    if ([...zq, ...nq].every((x) => istGanz(x * m))) {
      zq = zq.map((x) => Math.round(x * m)); nq = nq.map((x) => Math.round(x * m));
      break;
    }
  }
  const clean = (a) => a.map((x) => [istGanz(x) ? Math.round(x) : x]);
  return { Z: BP.trim(clean(zq)), N: BP.trim(clean(nq)), gekuerzt: BP.trim(g.map((x) => [istGanz(x) ? Math.round(x) : x])) };
}
