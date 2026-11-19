// PBZ, Sprungantwort und inverse Laplace mit Rechenweg. Reine Rechnung, keine Oberfläche.
// Darstellung wie in den Musterlösungen:
//   K3 A15 / Ü05 A1: G(s) = 1/((1+T₁s)(1+T₂s)) = A/(1+T₁s) + B/(1+T₂s), A = T₁/(T₁−T₂), B = T₂/(T₂−T₁),
//     H(s) = G(s)·1/s, jeder Summand A/((1+Ts)s) = (A/T)/((s+1/T)s), Korrespondenz 1/(s(s+a)) ⊶ (1/a)(1−e^(−at))
//     → h(t) = −7(1 − e^(−t/7)) + 8(1 − e^(−t/8))
//   K2/K3 A6: jeden Summanden einzeln, cosh(at) ⊶ s/(s²−a²), sinh(at)/a ⊶ 1/(s²−a²)
//   K1 A6: K/(1+Ts) = K/T · 1/(s+1/T) ⊶ K/T · e^(−t/T)

import { fmt, sup, sub } from '../lib/poly.js';
import {
  R, nice, zf, zfn, kz, wurzelText, polyText, pole, loese, norm, summanden, bruch, faktoren, huebsch, leseZahlenPoly,
} from '../lib/pbz-mathe.js';

const NAMEN = 'ABCDFGHIJLMNPQRUVW'; // ohne E, K, S, T (Verwechslung mit e, K, s, T)
const ROEM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const ganz = (x) => Math.abs(x - Math.round(x)) < 1e-9 * Math.max(1, Math.abs(x));
const fak = (n) => (n <= 1 ? 1 : n * fak(n - 1));
const zn = (x) => { const f = zf(Math.abs(x)); return f.includes('/') ? `(${f})` : f; }; // Zähler-Betrag, Brüche in Klammern
const pk = (t) => (/[ +−]/.test(t.replace(/^−/, '')) ? `(${t})` : t); // Summe in Klammern
const kl = (x) => (nice(x) < 0 || zf(x).includes('/') ? `(${zf(x)})` : zf(x)); // Zahl als Faktor: negative/Brüche in Klammern

// ---------- Zeitfunktionen ----------

/** e^(r·t) als Text: r = −1/7 → "e^(−t/7)", r = −2 → "e^(−2t)". */
export function eText(r) {
  r = nice(r);
  if (r === 0) return '';
  const a = Math.abs(r), sg = r < 0 ? '−' : '';
  let arg;
  if (ganz(a)) arg = Math.round(a) === 1 ? 't' : `${Math.round(a)}t`;
  else if (ganz(1 / a)) arg = `t/${Math.round(1 / a)}`;
  else { const f = zf(a); arg = f.includes('/') ? `${f}·t` : `${f}t`; }
  return `e^(${sg}${arg})`;
}

/** Argument a·t als Text: "t", "2t", "√7·t", "t/2". */
function argText(aStr) {
  if (aStr === '1') return 't';
  if (/^\d+$/.test(aStr)) return aStr + 't';
  const m = /^1\/(\d+)$/.exec(aStr);
  if (m) return 't/' + m[1];
  return aStr + '·t';
}

const tPot = (n) => (n === 0 ? '' : n === 1 ? 't' : 't' + sup(n));

/** Zeitterm: { c, cStr?, body, fn, delta? } */
function zt(c, body, fn, cStr) { return { c: nice(c), body, fn, cStr }; }

/** Ein Zeitterm als Text (ohne Vorzeichen-Logik der Summe): Betrag · body */
function ztBetrag(t) {
  const a = Math.abs(t.c);
  const cs = t.cStr || zf(a);
  if (!t.body) return cs;
  if (!t.cStr && a === 1) return t.body;
  const c2 = cs.includes('/') && !cs.startsWith('(') ? `(${cs})` : cs;
  return c2 + t.body;
}

/** Summe von Zeittermen als Text. */
export function zeitSumme(terme) {
  const ts = terme.filter((t) => t.c !== 0);
  if (!ts.length) return '0';
  return ts.map((t, i) => (i === 0 ? (t.c < 0 ? '−' : '') : t.c < 0 ? ' − ' : ' + ') + ztBetrag(t)).join('');
}

const zeitFn = (terme) => (t) => terme.reduce((s, x) => s + (x.delta ? 0 : x.c * x.fn(t)), 0);

/** Lineare Kombination "8A + 7B" */
function linText(koef, namen) {
  const parts = [];
  koef.forEach((c, j) => {
    c = nice(c);
    if (c === 0) return;
    const a = Math.abs(c);
    const k = a === 1 ? '' : kz(a).includes('/') ? kz(a) + '·' : kz(a);
    parts.push({ neg: c < 0, body: k + namen[j] });
  });
  if (!parts.length) return '0';
  return parts.map((p, i) => (i === 0 ? (p.neg ? '−' : '') : p.neg ? ' − ' : ' + ') + p.body).join('');
}

// ---------- Eingabe ----------

function praefix(text) {
  const m = /^\s*([A-Za-z])\s*\(\s*s\s*\)\s*=\s*/.exec(String(text));
  return m ? { name: m[1].toUpperCase(), rest: String(text).slice(m[0].length) } : { name: null, rest: String(text) };
}

function hatSymbole(text) { return /[A-Za-rt-z]/.test(norm(text)); }

function leseBruch(text) {
  const b = bruch(text);
  const Z = leseZahlenPoly(b.zaehler);
  const N = leseZahlenPoly(b.nenner);
  if (R.deg(N) === 0 && N[0] === 0) throw new Error('Der Nenner ist 0.');
  if (R.deg(Z) === 0 && Z[0] === 0) throw new Error('Der Zähler ist 0.');
  let fakt = null;
  try { fakt = faktoren(b.nennerTeile); } catch { fakt = null; }
  return { Z, N, fakt, b };
}

/** Darstellung der Faktoren: 'T' = (1 + Ts) wie in der Musterlösung, 'p' = (s + a). */
function stilVon(fakt, N, text) {
  const lin = (fakt || []).filter((f) => R.deg(f.poly) === 1 && f.poly[0] !== 0);
  let t = 0, p = 0;
  for (const f of lin) {
    const [c0, c1] = f.poly;
    if (c0 === 1 && c1 !== 1) t++;
    else if (c1 === 1 && c0 !== 1) p++;
  }
  if (t !== p) return t > p ? 'T' : 'p';
  if (lin.length) return /\(1\+/.test(norm(text)) ? 'T' : 'p';
  let k = 0;
  while (N[k] === 0) k++;
  return N[k] === 1 && R.lead(N) !== 1 ? 'T' : 'p';
}

function polListe(fakt, N) {
  let roh = [];
  if (fakt) for (const f of fakt) for (const r of pole(f.poly)) roh.push({ ...r, m: r.m * f.exp });
  else roh = pole(N);
  const out = [];
  for (const r of roh) {
    const g = out.find((o) => Math.abs(o.re - r.re) < 1e-9 * Math.max(1, Math.abs(r.re)) && Math.abs(o.im - r.im) < 1e-9 * Math.max(1, Math.abs(r.im)));
    if (g) g.m += r.m; else out.push({ ...r });
  }
  const grad = out.reduce((s, r) => s + r.m * (r.im ? 2 : 1), 0);
  if (grad !== R.deg(N)) throw new Error('Pole konnten nicht sicher bestimmt werden. Nenner bitte als Produkt eingeben, z. B. (1+7s)(1+8s).');
  if (out.some((r) => r.im && r.m > 1)) throw new Error('Mehrfache komplexe Pole werden nicht unterstützt.');
  // Pol bei 0 zuerst (wie P₀/s in der Vorlesung), sonst Reihenfolge der Eingabe
  return [...out.filter((r) => r.re === 0 && !r.im), ...out.filter((r) => !(r.re === 0 && !r.im))];
}

// ---------- Partialbruchzerlegung ----------

function anzeigeFaktoren(pol, stil) {
  return pol.map((r) => {
    if (r.im) {
      const q = [nice(r.re * r.re + r.im * r.im), nice(-2 * r.re), 1];
      return { art: 'q', r, poly: q, m: r.m, text: `(${polyText(q)})` };
    }
    if (r.re === 0) return { art: 's', r, poly: [0, 1], m: r.m, text: 's' };
    if (stil === 'T') {
      const T = nice(-1 / r.re);
      return { art: 'T', r, T, poly: [1, T], m: r.m, text: `(${polyText([1, T], true)})` };
    }
    const a = nice(-r.re);
    return { art: 'p', r, a, poly: [a, 1], m: r.m, text: `(${polyText([a, 1], false, true)})` };
  });
}

const potText = (f, k) => (k === 1 ? f.text : f.art === 's' ? 's' + sup(k) : f.text + sup(k));

/**
 * Zerlegt Z/N in Partialbrüche. Gibt Ansatz, Gleichungssystem und Werte zurück.
 * fname: "G" oder "H" (für die Texte).
 */
function zerlegen(Z, N, fakt, stil, fname) {
  const zeilen = [];
  const pol = polListe(fakt, N);
  const F = anzeigeFaktoren(pol, stil);
  let Nd = [1];
  F.forEach((f) => { Nd = R.mul(Nd, R.pow(f.poly, f.m)); });
  const lam = nice(R.lead(N) / R.lead(Nd));

  // Zählergrad ≥ Nennergrad → Polynomdivision (nur Konstante)
  let konst = 0;
  let Zr = Z;
  if (R.deg(Z) > R.deg(N)) throw new Error('Zählergrad > Nennergrad: wird nicht unterstützt (kein Element der Korrespondenztabelle).');
  if (R.deg(Z) === R.deg(N)) {
    konst = nice(R.lead(Z) / R.lead(N));
    Zr = R.sub(Z, R.scale(N, konst));
    Zr = R.trim(Zr.slice(0, R.deg(N)).concat([0]));
    zeilen.push({ text: `Zählergrad = Nennergrad → erst Polynomdivision: ${fname}(s) = ${zf(konst)} + (${polyText(Zr)}) / (${polyText(N)})` });
  }

  // Terme des Ansatzes
  const terme = [];
  let ni = 0;
  for (const f of F) {
    for (let k = 1; k <= f.m; k++) {
      if (f.art === 'q') terme.push({ f, k, namen: [NAMEN[ni++], NAMEN[ni++]], zp: [[0, 1], [1]] });
      else terme.push({ f, k, namen: [NAMEN[ni++]], zp: [[1]] });
    }
  }
  const namen = terme.flatMap((t) => t.namen);
  if (namen.some((n) => !n)) throw new Error('Zu viele Pole (höchstens 18 Unbekannte).');

  const termText = (t) => {
    const z = t.f.art === 'q' ? `(${t.namen[0]}s + ${t.namen[1]})` : t.namen[0];
    return `${z}/${potText(t.f, t.k)}`;
  };
  const nennerText = F.map((f) => potText(f, f.m)).join('');
  const lamText = lam === 1 ? '' : kz(lam) + '·';
  const zText = polyText(Zr);
  const nennerGes = F.length === 1 && lam === 1 && F[0].m === 1 ? nennerText : `(${lamText}${nennerText})`;
  zeilen.push({ text: `Ansatz: ${pk(zText)}/${nennerGes} = ${terme.map(termText).join(' + ')}`, strong: true });
  if (lam !== 1) zeilen.push({ text: `Faktor ${kz(lam)} aus dem Nenner zum Zähler: ${zText}/${kz(lam)} = ${polyText(R.scale(Zr, 1 / lam))}`, muted: true });

  // Gleichungssystem: Zr/λ = Σ u · zp · Nd/(f^k)
  const n = R.deg(Nd);
  const spalten = [];
  const restTexte = [];
  for (const t of terme) {
    let rest = [1];
    const rt = [];
    for (const g of F) {
      const e = g === t.f ? g.m - t.k : g.m;
      if (e > 0) { rest = R.mul(rest, R.pow(g.poly, e)); rt.push(potText(g, e)); }
    }
    t.zp.forEach((zp) => spalten.push(R.mul(zp, rest)));
    restTexte.push(rt.join(''));
  }
  const rhsPoly = R.scale(Zr, 1 / lam);
  const A = Array.from({ length: n }, (_, i) => spalten.map((c) => c[i] || 0));
  const b = Array.from({ length: n }, (_, i) => rhsPoly[i] || 0);
  const werte = loese(A, b).map((x) => nice(x));

  // Rechenweg: mit Hauptnenner multiplizieren, Koeffizientenvergleich
  const links = polyText(rhsPoly);
  const rechts = terme.map((t, i) => {
    const z = t.f.art === 'q' ? `(${t.namen[0]}s + ${t.namen[1]})` : t.namen[0];
    return restTexte[i] ? `${z}·${restTexte[i]}` : z;
  }).join(' + ');
  zeilen.push({ text: `Mit dem Hauptnenner ${nennerText} multiplizieren:` });
  zeilen.push({ text: `${links} = ${rechts}`, indent: true });
  const nachPot = [];
  for (let i = 0; i < n; i++) {
    const lt = linText(A[i], namen);
    if (lt === '0') continue;
    const sp = i === 0 ? '' : i === 1 ? 's' : 's' + sup(i);
    nachPot.push(i === 0 ? (lt.includes(' ') ? `(${lt})` : lt) : `${pk(lt)}·${sp}`);
  }
  if (nachPot.join(' + ') !== rechts) zeilen.push({ text: `${links} = ${nachPot.join(' + ')}`, indent: true });
  zeilen.push({ text: 'Koeffizientenvergleich (gleiche Potenzen von s):' });
  for (let i = 0; i < n; i++) {
    zeilen.push({ text: `(${ROEM[i] || i + 1})  s${sup(i)}:  ${linText(A[i], namen)} = ${kz(b[i])}`, indent: true });
  }
  zeilen.push({ text: 'Gleichungssystem lösen: ' + namen.map((nm, i) => `${nm} = ${zfn(werte[i])}`).join(',  '), strong: true });

  // Zuhaltemethode als Kontrolle (einfache reelle Pole)
  const zuh = [];
  let wi = 0;
  terme.forEach((t, i) => {
    const w = werte.slice(wi, wi + t.namen.length); wi += t.namen.length;
    t.werte = w;
    if (t.f.art === 'q' || t.f.m !== 1) return;
    const s0 = t.f.r.re;
    let rest = [1];
    F.forEach((g) => { if (g !== t.f) rest = R.mul(rest, R.pow(g.poly, g.m)); });
    const zv = R.eval(rhsPoly, s0), rv = R.eval(rest, s0);
    const rtx = restTexte[i] || '1';
    zuh.push(`${t.namen[0]} = ${pk(polyText(rhsPoly))}/${rt2(rtx)} bei s = ${zf(s0)}: ${kl(zv)}/${kl(rv)} = ${zf(zv / rv)}`);
  });
  if (zuh.length && terme.length > 1) {
    zeilen.push({ text: 'Kontrolle mit Zuhaltemethode (Faktor zuhalten, Pol einsetzen):', muted: true });
    zuh.forEach((z) => zeilen.push({ text: z, muted: true, indent: true }));
  }

  return { F, terme, werte, namen, konst, lam, pol, zeilen };
}

/** Partialbrüche als Text: "−7/(1 + 7s) + 8/(1 + 8s)" */
function pbzText(z) {
  const parts = [];
  if (z.konst) parts.push({ c: z.konst, t: zf(Math.abs(z.konst)) });
  for (const t of z.terme) {
    const den = potText(t.f, t.k);
    if (t.f.art === 'q') {
      const neg = (t.werte[0] || t.werte[1]) < 0 && t.werte[0] <= 0 && t.werte[1] <= 0;
      const zp = polyText(neg ? [-t.werte[1], -t.werte[0]] : [t.werte[1], t.werte[0]]);
      if (zp === '0') continue;
      parts.push({ c: neg ? -1 : 1, t: `(${zp})/${den}` });
    } else {
      const c = t.werte[0];
      if (c === 0) continue;
      parts.push({ c, t: `${zn(c)}/${den}` });
    }
  }
  if (!parts.length) return '0';
  return parts.map((p, i) => (i === 0 ? (p.c < 0 ? '−' : '') : p.c < 0 ? ' − ' : ' + ') + p.t).join('');
}

// ---------- Rücktransformation eines Partialbruchs ----------

function rueckTerm(t, korr) {
  const f = t.f, k = t.k;
  const den = potText(f, k);
  const zeilen = [];
  const zeit = [];
  if (f.art === 'q') {
    const [X, Y] = t.werte;
    const d = nice(f.poly[1] / 2);
    const w2 = nice(f.poly[0] - d * d);
    const w = Math.sqrt(w2), wS = wurzelText(w2);
    const sd = d === 0 ? 's' : `(s + ${kz(d)})`;
    const nenner2 = `${sd}² + ${w2 === 1 ? '1' : wS === '1' ? '1' : (/^[\d]+$/.test(wS) ? wS + '²' : `(${wS})²`)}`;
    const c2 = nice(Y - X * d);
    const eT = eText(-d);
    const eP = eT ? eT + '·' : '';
    if (d === 0) {
      korr.add('s/(s² + ω²) ⊶ cos(ωt)');
      korr.add('1/(s² + ω²) ⊶ sin(ωt)/ω');
    } else {
      korr.add('(s + δ)/((s + δ)² + ω²) ⊶ e^(−δt)·cos(ωt)');
      korr.add('ω/((s + δ)² + ω²) ⊶ e^(−δt)·sin(ωt)');
    }
    const at = argText(wS);
    zeilen.push({ text: `(${polyText([Y, X])})/${den}: quadratische Ergänzung → Nenner = ${nenner2}, ${d ? `δ = ${zf(d)}, ` : ''}ω = ${wS}` });
    const teile = [];
    if (X) {
      teile.push({ neg: X < 0, t: `${Math.abs(X) === 1 ? '' : zf(Math.abs(X)) + '·'}${d ? sd : 's'}/(${nenner2})` });
      zeit.push(zt(X, `${eP}cos(${at})`, (tt) => Math.exp(-d * tt) * Math.cos(w * tt)));
    }
    if (c2) {
      const irr = wS.includes('√');
      const cw = c2 / w;
      teile.push({ neg: c2 < 0, t: `${irr ? `(${zf(Math.abs(c2))}/${wS})` : zf(Math.abs(cw))}·${wS}/(${nenner2})` });
      zeit.push(zt(cw, `${eP}sin(${at})`, (tt) => Math.exp(-d * tt) * Math.sin(w * tt), irr ? `(${zf(Math.abs(c2))}/${wS})` : undefined));
    }
    zeilen.push({ text: '= ' + teile.map((p, i) => (i === 0 ? (p.neg ? '−' : '') : p.neg ? ' − ' : ' + ') + p.t).join(''), indent: true });
    zeilen.push({ text: `⊶ ${zeitSumme(zeit)}`, indent: true, strong: true });
    return { zeilen, zeit };
  }

  const A = t.werte[0];
  const fk = fak(k - 1);
  if (A === 0) {
    zeilen.push({ text: `${t.namen[0]} = 0 → Summand fällt weg.`, muted: true });
    return { zeilen, zeit };
  }
  if (f.art === 's') {
    if (k === 1) {
      korr.add('1/s ⊶ σ(t) = 1 (für t ≥ 0)');
      zeit.push(zt(A, '', () => 1));
    } else {
      korr.add(k === 2 ? '1/s² ⊶ t' : `1/sⁿ ⊶ tⁿ⁻¹/(n − 1)!`);
      zeit.push(zt(A / fk, tPot(k - 1), (tt) => tt ** (k - 1)));
    }
    zeilen.push({ text: `${A < 0 ? '−' : ''}${zn(A)}/${den} ⊶ ${zeitSumme(zeit)}` });
    return { zeilen, zeit };
  }
  const r = f.r.re;
  const eT = eText(r);
  const tp = tPot(k - 1);
  const body = tp ? `${tp}·${eT}` : eT;
  if (k === 1) korr.add('1/(s + a) ⊶ e^(−at)');
  else korr.add('1/(s + a)ⁿ ⊶ tⁿ⁻¹/(n − 1)! · e^(−at)');
  if (f.art === 'T') {
    const c = A / f.T ** k;
    const sa = `(${polyText([nice(1 / f.T), 1], false, true)})${k > 1 ? sup(k) : ''}`;
    zeit.push(zt(c / fk, body, (tt) => tt ** (k - 1) * Math.exp(r * tt)));
    const umf = `${A < 0 ? '−' : ''}${zn(A)}/${den} = ${kl(A)}/${kl(f.T)}${k > 1 ? sup(k) : ''} · 1/${sa}`;
    zeilen.push({ text: `${umf} = ${zf(c)} · 1/${sa}` });
    zeilen.push({ text: `⊶ ${zf(c)}${fk > 1 ? `/${fk}` : ''} · ${body} = ${zeitSumme(zeit)}`, indent: true });
  } else {
    zeit.push(zt(A / fk, body, (tt) => tt ** (k - 1) * Math.exp(r * tt)));
    zeilen.push({ text: `${A < 0 ? '−' : ''}${zn(A)}/${den} ⊶ ${zeitSumme(zeit)}` });
  }
  return { zeilen, zeit };
}

function rueckAlle(z, korr) {
  const zeilen = [];
  const zeit = [];
  if (z.konst) {
    korr.add('1 ⊶ δ(t)');
    zeilen.push({ text: `${zf(z.konst)} ⊶ ${zf(z.konst)}·δ(t)` });
    zeit.push({ ...zt(z.konst, 'δ(t)', () => 0), delta: true });
  }
  for (const t of z.terme) {
    const r = rueckTerm(t, korr);
    zeilen.push(...r.zeilen);
    zeit.push(...r.zeit);
  }
  return { zeilen, zeit };
}

// ---------- Modus PBZ (+ Sprungantwort) ----------

function pbzModus(text, sprung) {
  const { name, rest } = praefix(text);
  const fn = name || (sprung ? 'G' : 'G');
  if (!rest.trim()) throw new Error('Bitte G(s) eingeben, z. B. 1/((1+7s)(1+8s)).');
  if (hatSymbole(rest)) {
    throw new Error('Bitte Zahlen einsetzen (z. B. T₁ = 7, T₂ = 8 → 1/((1+7s)(1+8s))). Allgemein gilt: A = T₁/(T₁ − T₂), B = T₂/(T₂ − T₁).');
  }
  const { Z, N, fakt } = leseBruch(rest);
  const stil = stilVon(fakt, N, rest);
  const schritte = [];
  const pol = polListe(fakt, N);

  const polText = pol.map((r, i) => {
    const nm = 's' + sub(i + 1);
    const v = r.im ? `${zf(r.re)} ± ${zf(r.im)}j` : zf(r.re);
    return `${nm} = ${v}${r.m > 1 ? ` (${r.m}-fach)` : ''}`;
  }).join(',  ');
  schritte.push({
    titel: 'Übertragungsfunktion',
    zeilen: [
      { text: `${fn}(s) = ${huebsch(rest)}` },
      { text: `Nenner ausmultipliziert: ${polyText(N)}`, muted: true },
      { text: `Pole: ${polText}` },
    ],
  });

  const fl = fn.toLowerCase();
  const musterweg = sprung && R.deg(Z) < R.deg(N) && pol.every((r) => !r.im && r.m === 1 && r.re !== 0);

  if (!sprung || musterweg) {
    // PBZ von G(s)
    const z = zerlegen(Z, N, fakt, stil, fn);
    const pz = schritte.length;
    schritte.push({ titel: 'Partialbruchzerlegung (PBZ)', zeilen: [...zerlegenZeilen(z)] });
    // Formel der Musterlösung für zwei PT1 / zwei einfache Pole
    const formel = formelZweiPole(z, Z);
    if (formel.length) schritte[pz].zeilen.push(...formel);
    const pt = pbzText(z);
    schritte.push({ titel: 'Partialbruchzerlegte Übertragungsfunktion', zeilen: [{ text: `${fn}(s) = ${huebsch(rest)} = ${pt}`, strong: true }] });

    if (!sprung) {
      const korr = new Set();
      const r = rueckAlle(z, korr);
      const ft = zeitSumme(r.zeit);
      schritte.push({
        titel: 'Rücktransformation mit Korrespondenzen',
        zeilen: [{ text: 'Korrespondenzen: ' + [...korr].join(';  '), muted: true }, ...r.zeilen],
      });
      const fazit = `${fl}(t) = ${ft}`;
      schritte.push({ titel: 'Ergebnis', zeilen: [{ text: fazit, strong: true }] });
      return ergebnis(schritte, fazit, z, r.zeit, Z, N, ft);
    }

    // Sprungantwort wie Musterlösung K3 A15
    const ein = z.terme.map((t) => {
      const A = t.werte[0];
      return { t, A };
    }).filter((x) => x.A !== 0);
    const hz = [];
    const zeilen1 = [
      { text: `H(s) = ${fn}(s) · 1/s = (${pt}) · 1/s` },
    ];
    const mitS = ein.map(({ t, A }, i) => `${i === 0 ? (A < 0 ? '−' : '') : A < 0 ? ' − ' : ' + '}${zn(A)}/(${t.f.text}·s)`).join('');
    zeilen1.push({ text: `= ${mitS}`, indent: true });
    const normT = ein.map(({ t, A }, i) => {
      const c = t.f.art === 'T' ? A / t.f.T : A;
      const sa = t.f.art === 'T' ? `(${polyText([nice(1 / t.f.T), 1], false, true)})` : t.f.text;
      return `${i === 0 ? (c < 0 ? '−' : '') : c < 0 ? ' − ' : ' + '}${zn(c)}/(${sa}·s)`;
    }).join('');
    if (z.F.some((f) => f.art === 'T')) zeilen1.push({ text: `= ${normT}`, indent: true, strong: true });
    if (z.lam !== 1 && z.F.every((f) => f.art === 'p')) { /* λ steckt schon in A */ }
    schritte.push({ titel: 'Sprungantwort im Bildbereich', zeilen: zeilen1 });

    const zeilen2 = [{ text: 'Korrespondenz: 1/(s(s + a)) ⊶ (1/a)·(1 − e^(−at)), also K/(s(s + a)) ⊶ (K/a)·(1 − e^(−at))', muted: true }];
    for (const { t, A } of ein) {
      const a = t.f.art === 'T' ? nice(1 / t.f.T) : t.f.a;
      const Kc = t.f.art === 'T' ? nice(A / t.f.T) : A;
      const sa = `(${polyText([a, 1], false, true)})`;
      const term = zt(nice(Kc / a), `(1 − ${eText(-a)})`, (tt) => 1 - Math.exp(-a * tt));
      hz.push(term);
      zeilen2.push({ text: `${Kc < 0 ? '−' : ''}${zn(Kc)}/(${sa}·s): K = ${zf(Kc)}, a = ${zf(a)} ⊶ ${kl(Kc)}/${kl(a)}·(1 − ${eText(-a)}) = ${zeitSumme([term])}` });
    }
    schritte.push({ titel: 'Rücktransformation in den Zeitbereich', zeilen: zeilen2 });

    const ht = zeitSumme(hz);
    // ausmultipliziert
    const konst = nice(hz.reduce((s, x) => s + x.c, 0));
    const aus = [];
    if (konst) aus.push(zt(konst, '', () => 1));
    ein.forEach(({ t }, i) => {
      const a = t.f.art === 'T' ? nice(1 / t.f.T) : t.f.a;
      aus.push(zt(-hz[i].c, eText(-a), (tt) => Math.exp(-a * tt)));
    });
    const h0 = nice(hz.reduce((s, x) => s + x.c * x.fn(0), 0));
    const stabil = ein.every(({ t }) => t.f.r.re < 0);
    const zeilen3 = [
      { text: `h(t) = ${ht}`, strong: true },
      { text: `ausmultipliziert: h(t) = ${zeitSumme(aus)}` },
      { text: `Kontrolle: h(0) = ${zf(h0)}` + (stabil ? `, h(∞) = ${zf(konst)} = ${fn}(0)` : ' (instabil: h(t) wächst über alle Grenzen)'), muted: true },
    ];
    schritte.push({ titel: 'Ergebnis', zeilen: zeilen3 });
    return ergebnis(schritte, `h(t) = ${ht}`, z, hz, Z, R.mul(N, [0, 1]), ht);
  }

  // Allgemeiner Weg: PBZ direkt von H(s) = G(s)/s
  const N2 = R.mul(N, [0, 1]);
  const fakt2 = fakt ? [{ poly: [0, 1], exp: 1 }, ...fakt] : null;
  schritte.push({
    titel: 'Sprungantwort im Bildbereich',
    zeilen: [
      { text: `H(s) = ${fn}(s) · 1/s = ${huebsch(rest)} · 1/s` },
      { text: 'Hier passt keine einzelne Korrespondenz (Pol bei 0, mehrfacher oder komplexer Pol) → PBZ direkt von H(s), wie in der Vorlesung: H(s) = P₀/s + P₁/(s − s₁) + …', muted: true },
    ],
  });
  const z = zerlegen(Z, N2, fakt2, stil, 'H');
  schritte.push({ titel: 'Partialbruchzerlegung von H(s)', zeilen: zerlegenZeilen(z) });
  schritte.push({ titel: 'Partialbruchzerlegte Sprungantwort', zeilen: [{ text: `H(s) = ${pbzText(z)}`, strong: true }] });
  const korr = new Set();
  const r = rueckAlle(z, korr);
  schritte.push({
    titel: 'Rücktransformation mit Korrespondenzen',
    zeilen: [{ text: 'Korrespondenzen: ' + [...korr].join(';  '), muted: true }, ...r.zeilen],
  });
  const ht = zeitSumme(r.zeit);
  schritte.push({ titel: 'Ergebnis', zeilen: [{ text: `h(t) = ${ht}`, strong: true }] });
  return ergebnis(schritte, `h(t) = ${ht}`, z, r.zeit, Z, N2, ht);
}

const zerlegenZeilen = (z) => z.zeilen;
const rt2 = (t) => (/\)\(|\)s|s\(/.test(t) || /^\(.*\)[²³⁴⁵⁶⁷⁸⁹]+$/.test(t) && t.indexOf(')') < t.length - 2 ? `(${t})` : t);

function ergebnis(schritte, fazit, z, zeit, Z, N, ft) {
  const werte = {};
  z.namen.forEach((n, i) => { werte[n] = z.werte[i]; });
  return {
    schritte, fazit, werte, zeitText: ft,
    f: zeitFn(zeit),
    F: (s) => R.eval(Z, s) / R.eval(N, s),
    pole: z.pol,
    hatDelta: zeit.some((x) => x.delta),
  };
}

/** Formel der Musterlösung bei zwei einfachen Polen und konstantem Zähler. */
function formelZweiPole(z, Z) {
  const einf = z.terme.filter((t) => t.f.art !== 'q' && t.f.art !== 's' && t.f.m === 1);
  if (z.terme.length !== 2 || einf.length !== 2 || R.deg(Z) !== 0 || z.konst) return [];
  const Kz = nice(Z[0] / z.lam);
  const kv = Kz === 1 ? '' : `${kl(Kz)}·`;
  const kvs = Kz === 1 ? '' : 'K·';
  const [t1, t2] = einf;
  const out = [{ text: 'Formel aus der Musterlösung (zwei PT1-Glieder):', muted: false }];
  if (t1.f.art === 'T') {
    const T1 = t1.f.T, T2 = t2.f.T;
    if (Kz !== 1) out.push({ text: `K = ${zf(Kz)} (Zähler)`, indent: true });
    out.push({ text: `A = ${kvs}T₁/(T₁ − T₂) = ${kv}${kz(T1)}/(${kz(T1)} − ${kl(T2)}) = ${zfn(t1.werte[0])}`, indent: true, strong: true });
    out.push({ text: `B = ${kvs}T₂/(T₂ − T₁) = ${kv}${kz(T2)}/(${kz(T2)} − ${kl(T1)}) = ${zfn(t2.werte[0])}`, indent: true, strong: true });
  } else {
    const a1 = t1.f.a, a2 = t2.f.a;
    if (Kz !== 1) out.push({ text: `K = ${zf(Kz)} (Zähler)`, indent: true });
    out.push({ text: `A = ${kvs}1/(a₂ − a₁) = ${kv}1/(${kz(a2)} − ${kl(a1)}) = ${zfn(t1.werte[0])}`, indent: true, strong: true });
    out.push({ text: `B = ${kvs}1/(a₁ − a₂) = ${kv}1/(${kz(a1)} − ${kl(a2)}) = ${zfn(t2.werte[0])}`, indent: true, strong: true });
  }
  return out;
}

// ---------- Modus inverse Laplace (Klausur A6) ----------

const SYM = '[A-Za-rt-z](?:_?\\d+)?';
const NUM = `(?:${SYM}|\\d+(?:[.,]\\d+)?)`;
const symT = (x) => x.replace(/_?(\d+)$/, (_, d) => sub(d)).replace('.', ',');

function symbolisch(text) {
  const s = norm(text).replace(/\*/g, '');
  let m;
  const schritte = [];
  // K/(1+Ts) bzw. K/(Ts+1)
  if ((m = new RegExp(`^(${NUM})/\\((?:1\\+(${NUM})s|(${NUM})s\\+1)\\)$`).exec(s))) {
    const K = symT(m[1]), T = symT(m[2] || m[3]);
    const KT = `${K}/${T}`;
    schritte.push({
      titel: 'Umformung der Gleichung',
      zeilen: [
        { text: `F(s) = ${K}/(1 + ${T}s) = ${K}/(1 + ${T}s) · (1/${T})/(1/${T}) = ${KT} · 1/(s + 1/${T})`, strong: true },
        { text: `Zähler und Nenner mit 1/${T} multiplizieren, damit vor s eine 1 steht.`, muted: true },
      ],
    });
    schritte.push({
      titel: 'Anwendung der Korrespondenz',
      zeilen: [
        { text: 'Korrespondenz: 1/(s + α) ⊶ e^(−αt), hier α = 1/' + T },
        { text: `${KT} · 1/(s + 1/${T}) ⊶ ${KT} · e^(−t/${T})` },
      ],
    });
    const fazit = `f(t) = ${KT} · e^(−t/${T})`;
    schritte.push({ titel: 'Lösung', zeilen: [{ text: fazit, strong: true }] });
    return { schritte, fazit, symbolisch: true };
  }
  if ((m = new RegExp(`^(${NUM})/\\(s\\+(${NUM})\\)$`).exec(s))) {
    const K = symT(m[1]), a = symT(m[2]);
    schritte.push({ titel: 'Korrespondenz', zeilen: [{ text: 'Korrespondenz: 1/(s + α) ⊶ e^(−αt)' }, { text: `${K} · 1/(s + ${a}) ⊶ ${K} · e^(−${a}t)` }] });
    const fazit = `f(t) = ${K} · e^(−${a}t)`;
    schritte.push({ titel: 'Lösung', zeilen: [{ text: fazit, strong: true }] });
    return { schritte, fazit, symbolisch: true };
  }
  if ((m = new RegExp(`^(${NUM})/s$`).exec(s))) {
    const K = symT(m[1]);
    schritte.push({ titel: 'Korrespondenz', zeilen: [{ text: 'Korrespondenz: 1/s ⊶ σ(t)' }, { text: `${K} · 1/s ⊶ ${K} · σ(t)` }] });
    const fazit = `f(t) = ${K} · σ(t)`;
    schritte.push({ titel: 'Lösung', zeilen: [{ text: fazit, strong: true }] });
    return { schritte, fazit, symbolisch: true };
  }
  if ((m = new RegExp(`^(${NUM})/\\((?:s\\(1\\+(${NUM})s\\)|\\(1\\+(${NUM})s\\)s)\\)$`).exec(s))) {
    const K = symT(m[1]), T = symT(m[2] || m[3]);
    schritte.push({
      titel: 'Umformung der Gleichung',
      zeilen: [{ text: `F(s) = ${K}/(s(1 + ${T}s)) = ${K}/${T} · 1/(s(s + 1/${T}))`, strong: true }],
    });
    schritte.push({
      titel: 'Anwendung der Korrespondenz',
      zeilen: [
        { text: `Korrespondenz: 1/(s(s + a)) ⊶ (1/a)·(1 − e^(−at)), hier a = 1/${T}` },
        { text: `${K}/${T} · 1/(s(s + 1/${T})) ⊶ ${K}/${T} · ${T} · (1 − e^(−t/${T})) = ${K}·(1 − e^(−t/${T}))` },
      ],
    });
    const fazit = `f(t) = ${K}·(1 − e^(−t/${T}))`;
    schritte.push({ titel: 'Lösung', zeilen: [{ text: fazit, strong: true }] });
    return { schritte, fazit, symbolisch: true };
  }
  throw new Error('Mit Buchstaben gehen nur K/(1+Ts), K/(s+a), K/s und K/(s(1+Ts)). Sonst bitte Zahlen einsetzen.');
}

/** Ein Summand: Zuordnung zur Korrespondenz. */
function summand(txt, nr, korr) {
  const b = bruch(txt);
  const Z = leseZahlenPoly(b.zaehler);
  const N = leseZahlenPoly(b.nenner);
  const zeilen = [];
  const zeit = [];
  const roh = huebsch(txt.replace(/^\+/, ''));
  zeilen.push({ text: `Summand ${nr}: ${roh}`, strong: true });
  const n = R.deg(N), m = R.deg(Z);
  if (n === 0) {
    if (m > 0) throw new Error(`Summand ${nr}: ohne s im Nenner sind nur Zahlen erlaubt (→ δ(t)).`);
    const c = nice(Z[0] / N[0]);
    korr.add('1 ⊶ δ(t)');
    zeit.push({ ...zt(c, 'δ(t)', () => 0), delta: true });
    zeilen.push({ text: `${zf(c)} ⊶ ${zf(c)}·δ(t)`, indent: true });
    return { zeilen, zeit, Z, N };
  }
  const nur = (i) => N.every((c, j) => j === i || c === 0); // N = c·sⁱ

  // c/sⁿ
  if (m === 0 && nur(n)) {
    const c = nice(Z[0] / N[n]);
    if (n === 1) { korr.add('1/s ⊶ σ(t)'); zeit.push(zt(c, 'σ(t)', () => 1)); }
    else { korr.add(n === 2 ? '1/s² ⊶ t' : '1/sⁿ ⊶ tⁿ⁻¹/(n − 1)!'); zeit.push(zt(c / fak(n - 1), tPot(n - 1), (t) => t ** (n - 1))); }
    zeilen.push({ text: `${zf(c)} · 1/s${n > 1 ? sup(n) : ''} ⊶ ${zeitSumme(zeit)}`, indent: true });
    return { zeilen, zeit, Z, N };
  }

  // K/(c₁s + c₀): e-Funktion
  if (m === 0 && n === 1) {
    const [c0, c1] = N;
    const Kc = Z[0];
    korr.add('1/(s + α) ⊶ e^(−αt)');
    const alpha = nice(c0 / c1);
    const vorf = nice(Kc / c1);
    zeit.push(zt(vorf, eText(-alpha), (t) => Math.exp(-alpha * t)));
    if (c0 === 1 && c1 !== 1) {
      // wie K1 A6: K/(1+Ts) = K/T · 1/(s + 1/T)
      const T = c1;
      zeilen.push({ text: `${zf(Kc)}/(1 + ${kz(T)}s) = ${zf(Kc)}/(1 + ${kz(T)}s) · (1/${kz(T)})/(1/${kz(T)}) = ${zf(Kc)}/${kl(T)} · 1/(s + 1/${kz(T)})`, indent: true });
      zeilen.push({ text: `= ${zf(vorf)} · 1/(${polyText([alpha, 1], false, true)}),  α = ${zf(alpha)}`, indent: true });
    } else if (c1 !== 1) {
      zeilen.push({ text: `= ${zf(Kc)}/${kl(c1)} · 1/(${polyText([alpha, 1], false, true)}) = ${zf(vorf)} · 1/(${polyText([alpha, 1], false, true)}),  α = ${zf(alpha)}`, indent: true });
    } else {
      zeilen.push({ text: `α = ${zf(alpha)}`, indent: true });
    }
    zeilen.push({ text: `⊶ ${zeitSumme(zeit)}`, indent: true, strong: true });
    return { zeilen, zeit, Z, N };
  }

  // K/(s(c₁s + c₀)): 1/(s(s+a)) ⊶ (1/a)(1 − e^(−at))
  if (m === 0 && n === 2 && N[0] === 0 && N[1] !== 0) {
    const c2 = N[2], c1 = N[1];
    const a = nice(c1 / c2), Kc = nice(Z[0] / c2);
    korr.add('1/(s(s + a)) ⊶ (1/a)·(1 − e^(−at))');
    const term = zt(nice(Kc / a), `(1 − ${eText(-a)})`, (t) => 1 - Math.exp(-a * t));
    zeit.push(term);
    zeilen.push({ text: `= ${zf(Kc)} · 1/(s(${polyText([a, 1], false, true)})),  a = ${zf(a)}`, indent: true });
    zeilen.push({ text: `⊶ ${kl(Kc)}/${kl(a)} · (1 − ${eText(-a)}) = ${zeitSumme([term])}`, indent: true, strong: true });
    return { zeilen, zeit, Z, N };
  }

  // (b₁s + b₀)/(c₂s² + c₀): cosh/sinh bzw. cos/sin
  if (m <= 1 && n === 2 && N[1] === 0 && N[0] !== 0) {
    const c2 = N[2];
    const q = nice(N[0] / c2);
    const b1 = nice((Z[1] || 0) / c2), b0 = nice(Z[0] / c2);
    const hyp = q < 0;
    const a2 = Math.abs(q), a = Math.sqrt(a2), aS = wurzelText(a2);
    const at = argText(aS);
    const sq = `s² ${hyp ? '−' : '+'} ${kz(a2)}`;
    const fn1 = hyp ? 'cosh' : 'cos', fn2 = hyp ? 'sinh' : 'sin';
    if (hyp) { korr.add('cosh(at) ⊶ s/(s² − a²)'); korr.add('sinh(at)/a ⊶ 1/(s² − a²)'); }
    else { korr.add('cos(ωt) ⊶ s/(s² + ω²)'); korr.add('sin(ωt)/ω ⊶ 1/(s² + ω²)'); }
    const nm = hyp ? 'a' : 'ω';
    if (c2 !== 1) zeilen.push({ text: `Durch ${kz(c2)} teilen: = ${pk(polyText([b0, b1]))}/(${sq})`, indent: true });
    zeilen.push({ text: `${nm}² = ${kz(a2)} → ${nm} = ${aS}${aS.includes('√') ? ` ≈ ${fmt(a)}` : ''}`, indent: true });
    if (b1) {
      zeit.push(zt(b1, `${fn1}(${at})`, hyp ? (t) => Math.cosh(a * t) : (t) => Math.cos(a * t)));
      zeilen.push({ text: `${zf(b1)} · s/(${sq}) ⊶ ${zeitSumme([zeit.at(-1)])}`, indent: true });
    }
    if (b0) {
      const irr = aS.includes('√') || aS.includes(',');
      const cw = b0 / a;
      const tm = zt(cw, `${fn2}(${at})`, hyp ? (t) => Math.sinh(a * t) : (t) => Math.sin(a * t), irr ? `(${zf(Math.abs(b0))}/${aS})` : undefined);
      zeit.push(tm);
      zeilen.push({ text: `${zf(b0)} · 1/(${sq}) ⊶ ${zf(b0)} · ${fn2}(${at})/${aS}`, indent: true });
      zeilen.push({ text: `Faktor anpassen: ${zf(b0)}/(${sq}) = ${irr ? `(${zf(b0)}/${aS})` : zf(cw)} · ${aS}/(${sq}) ⊶ ${zeitSumme([tm])}${irr ? `  (${zf(b0)}/${aS} ≈ ${fmt(cw)})` : ''}`, indent: true });
    }
    zeilen.push({ text: `⊶ ${zeitSumme(zeit)}`, indent: true, strong: true });
    return { zeilen, zeit, Z, N };
  }

  // Sonst: PBZ des Summanden
  let fakt = null;
  try { fakt = faktoren(b.nennerTeile); } catch { fakt = null; }
  const stil = stilVon(fakt, N, txt);
  zeilen.push({ text: 'Keine Korrespondenz passt direkt → erst Partialbruchzerlegung:', muted: true });
  const z = zerlegen(Z, N, fakt, stil, 'F');
  zeilen.push(...z.zeilen.map((l) => ({ ...l, indent: true })));
  zeilen.push({ text: `= ${pbzText(z)}`, indent: true, strong: true });
  const r = rueckAlle(z, korr);
  zeilen.push(...r.zeilen.map((l) => ({ ...l, indent: true })));
  zeit.push(...r.zeit);
  return { zeilen, zeit, Z, N };
}

function inversLaplace(text) {
  const { rest } = praefix(text);
  if (!rest.trim()) throw new Error('Bitte F(s) eingeben, z. B. 2s/(s^2-7)+3/(s^2-7).');
  if (hatSymbole(rest)) return symbolisch(rest);
  const teile = summanden(rest);
  const schritte = [];
  schritte.push({
    titel: 'Aufgabe',
    zeilen: [
      { text: `F(s) = ${huebsch(rest)}` },
      { text: teile.length > 1 ? 'Jeden Summanden einzeln transformieren (Linearität), konstante Faktoren vor den Term ziehen.' : 'Konstante Faktoren vor den Term ziehen, dann Korrespondenz anwenden.', muted: true },
    ],
  });
  const korr = new Set();
  const zeit = [];
  let Fs = [];
  const zl = [];
  teile.forEach((t, i) => {
    const r = summand(t, i + 1, korr);
    zl.push(...r.zeilen);
    zeit.push(...r.zeit);
    Fs.push((s) => R.eval(r.Z, s) / R.eval(r.N, s));
  });
  schritte.push({ titel: 'Korrespondenzen', zeilen: [...korr].map((k) => ({ text: k })) });
  schritte.push({ titel: 'Summanden zuordnen', zeilen: zl });
  const ft = zeitSumme(zeit);
  const fazit = `f(t) = ${ft}`;
  schritte.push({ titel: 'Lösung', zeilen: [{ text: `F(s) ⊶ ${fazit}`, strong: true }] });
  return {
    schritte, fazit, zeitText: ft,
    f: zeitFn(zeit),
    F: (s) => Fs.reduce((a, g) => a + g(s), 0),
    hatDelta: zeit.some((x) => x.delta),
  };
}

// ---------- Einstieg ----------

/**
 * Eingabe:
 *   { modus: 'sprung', g: '1/((1+7s)(1+8s))' }   → PBZ von G, dann h(t)
 *   { modus: 'pbz', g: '...' }                    → PBZ und Rücktransformation von G (bzw. H, wenn so eingegeben)
 *   { modus: 'laplace', ausdruck: '2s/(s^2-7)+3/(s^2-7)' }
 * Ausgabe: { schritte, fazit, werte: {A, B, …}, zeitText, f(t), F(s) }
 */
export function pbz(input) {
  const modus = input.modus || 'sprung';
  if (modus === 'laplace') return inversLaplace(input.ausdruck ?? '');
  return pbzModus(input.g ?? '', modus === 'sprung');
}
