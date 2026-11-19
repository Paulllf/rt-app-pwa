// RC/RL/RLC-Netzwerk (unbelasteter Spannungsteiler) → DGL → G(s) = Uₐ(s)/Uₑ(s), symbolisch in R, L, C.
// Reine Rechnung, keine Oberfläche.
// Schaltung wie in der Klausur (A13): Längsglied Z₁ oben in Reihe, Querglied Z₂ parallel zum Ausgang uₐ, iₐ = 0.
// Rechenweg wie Musterlösung K1–K3 / Übung 01:
//   Methode 1: Bauteilgleichungen → Maschengleichung → DGL (mit ∫) → Laplace → G(s)
//   Methode 2: Spannungsteiler mit Impedanzen Z_R = R, Z_L = sL, Z_C = 1/(sC)
//   danach: normieren (1 + sT), Glied-Typ, DGL ohne Integral (ausmultiplizieren, invers Laplace)

import { fmt, sup } from '../lib/poly.js';
import { E, P, eFmt, pFmt, pTerms, bruchFmt, monoFmt, symName, kuerzen, entbruchen } from '../lib/netzwerk-algebra.js';
import { parseImpedanz, namenVergeben, blaetter } from '../lib/netzwerk-parse.js';

// ---------- Impedanzen ----------

const sym = (x) => E.sym(x.name);

/** Impedanz eines Bauteils als Bruch Z/N in s */
function zBauteil(x) {
  if (x.art === 'R') return { Z: [sym(x)], N: P.one() };
  if (x.art === 'L') return { Z: [[], sym(x)], N: P.one() };
  return { Z: P.one(), N: [[], sym(x)] }; // C: 1/(sC)
}

/** Impedanz eines Baums als Bruch (gekürzt) */
export function zBaum(b) {
  if (b.typ === 'el') return zBauteil(b);
  const t = b.teile.map(zBaum);
  let acc = t[0];
  for (const x of t.slice(1)) {
    const summeZ = P.add(P.mul(acc.Z, x.N), P.mul(x.Z, acc.N));
    acc = b.typ === 'reihe'
      ? kuerzen(summeZ, P.mul(acc.N, x.N))
      : kuerzen(P.mul(acc.Z, x.Z), summeZ);
  }
  return acc;
}

/** Text mit Symbolen: "R + L", "R ‖ C" */
export function baumText(b, oben = true) {
  if (b.typ === 'el') return symName(b.name);
  const t = b.teile.map((x) => baumText(x, false)).join(b.typ === 'reihe' ? ' + ' : ' ‖ ');
  return oben ? t : `(${t})`;
}

const zEl = (x) => (x.art === 'R' ? symName(x.name) : x.art === 'L' ? 's' + symName(x.name) : `1/(s${symName(x.name)})`);

/** Text mit eingesetzten Impedanzen: "R + 1/(sC)", "(R · sL)/(R + sL)" */
function baumEinsetzen(b, oben = true) {
  if (b.typ === 'el') return zEl(b);
  const t = b.teile.map((x) => baumEinsetzen(x, false));
  let s;
  if (b.typ === 'reihe') s = t.join(' + ');
  else if (t.length === 2) s = `(${t[0]} · ${t[1]}) / (${t[0]} + ${t[1]})`;
  else s = `1 / (${t.map((x) => '1/' + (x.includes(' ') || x.includes('/') ? `(${x})` : x)).join(' + ')})`;
  return oben || b.typ === 'parallel' ? s : `(${s})`;
}

// ---------- Zeitbereich: Operator-Terme ----------
// Term { k, c }: c · (k-te Ableitung), k = −1 Integral, k = −2 Doppelintegral

const DOT1 = '̇', DOT2 = '̈';
function op(k, v) {
  // v: 'a' oder 'e' (für uₐ, uₑ) oder 'i'
  const idx = v === 'a' ? 'ₐ' : v === 'e' ? 'ₑ' : '';
  const base = v === 'i' ? 'i' : 'u';
  if (k === 0) return base + idx;
  if (k === 1) return base + DOT1 + idx;
  if (k === 2) return (base + DOT2).normalize('NFC') + idx;
  if (k === -1) return `∫${base}${idx} dτ`;
  if (k === -2) return `∬${base}${idx} dτ`;
  if (k > 0) return `${base}${idx}⁽${sup(k)}⁾`;
  return `${-k}-fach ∫${base}${idx}`;
}

function termText(c, opStr, k) {
  if (c.length > 1) return { neg: false, body: `(${eFmt(c)})·${opStr}` };
  const { neg, body } = monoFmt(c[0]);
  if (body === '1') return { neg, body: opStr };
  if (k === 0 && body.startsWith('1/')) return { neg, body: opStr + body.slice(1) }; // uₐ/R
  return { neg, body: `${body}·${opStr}` };
}

function summe(teile) {
  if (!teile.length) return '0';
  return teile.map((t, i) => (i === 0 ? (t.neg ? '−' : '') + t.body : (t.neg ? ' − ' : ' + ') + t.body)).join('');
}

const zeitSumme = (terms, v) => summe(terms.map((t) => termText(t.c, op(t.k, v), t.k)));

function sammeln(terms) {
  const m = new Map();
  for (const t of terms) m.set(t.k, E.add(m.get(t.k) || [], t.c));
  return [...m.entries()].filter(([, c]) => !E.isZero(c)).sort((a, b) => a[0] - b[0]).map(([k, c]) => ({ k, c }));
}

const sL = (k) => (k === 0 ? '' : k === -1 ? '1/s' : k < 0 ? `1/s${sup(-k)}` : 's' + (k > 1 ? sup(k) : ''));
function laplaceTerm(c, k, U) {
  const sp = sL(k);
  const teile = [];
  const { neg, body } = c.length > 1 ? { neg: false, body: `(${eFmt(c)})` } : monoFmt(c[0]);
  if (body !== '1' || (!sp && !U)) teile.push(body);
  if (sp) teile.push(sp);
  if (U) teile.push(U);
  return { neg, body: teile.join('·') };
}

const ANZAHL = ['', 'einmal', 'zweimal', 'dreimal'];

// ---------- Methode 1 ----------

function methode1(b1, b2) {
  const z1 = b1.typ === 'el' ? [b1] : b1.typ === 'reihe' && b1.teile.every((x) => x.typ === 'el') ? b1.teile : null;
  const z2 = b2.typ === 'el' ? [b2] : b2.typ === 'parallel' && b2.teile.every((x) => x.typ === 'el') ? b2.teile : null;
  if (!z1 || !z2) return null;

  const n = (x) => symName(x.name);
  const zeilen = [];
  // Maschengleichung
  const uZ1 = z1.map((x) => 'u_' + n(x));
  const ausgang = z2.length === 1 ? `uₐ = u_${n(z2[0])} (Ausgang liegt an ${n(z2[0])})` : `uₐ = ${z2.map((x) => 'u_' + n(x)).join(' = ')} (parallel)`;
  zeilen.push({ text: `Maschengleichung (2. Kirchhoffsches Gesetz): uₑ = ${uZ1.join(' + ')} + uₐ`, strong: true });
  zeilen.push({ text: `mit ${ausgang}; iₐ = 0 → durch ${z1.map(n).join(', ')} fließt derselbe Strom i`, muted: true });

  // Strom i aus uₐ
  const yTerm = (x) => (x.art === 'R' ? { k: 0, c: E.inv(sym(x)) } : x.art === 'L' ? { k: -1, c: E.inv(sym(x)) } : { k: 1, c: sym(x) });
  const iLaw = (x, lhs) => (x.art === 'R'
    ? `uₐ = ${n(x)}·${lhs} ⇒ ${lhs} = uₐ/${n(x)}`
    : x.art === 'L'
      ? `uₐ = ${n(x)}·d${lhs}/dt ⇔ ${lhs} = 1/${n(x)}·∫uₐ dτ`
      : `${lhs} = ${n(x)}·u${DOT1}ₐ (Kondensator-Spannung = uₐ)`);
  const iTerms = sammeln(z2.map(yTerm));
  if (z2.length === 1) {
    zeilen.push({ text: `Strom aus uₐ: ${iLaw(z2[0], 'i')}` });
  } else {
    zeilen.push({ text: `Knotenregel (1. Kirchhoffsches Gesetz): i = ${z2.map((x) => 'i_' + n(x)).join(' + ')}` });
    z2.forEach((x) => zeilen.push({ text: iLaw(x, 'i_' + n(x)), indent: true }));
    zeilen.push({ text: `i = ${zeitSumme(iTerms, 'a')}` });
  }

  // Einsetzen
  const zop = (x) => (x.art === 'R' ? { d: 0, c: sym(x), law: `${n(x)}·i` }
    : x.art === 'L' ? { d: 1, c: sym(x), law: `${n(x)}·i${DOT1}` }
      : { d: -1, c: E.inv(sym(x)), law: `1/${n(x)}·∫i dτ` });
  let alle = [{ k: 0, c: E.one() }];
  z1.forEach((x) => {
    const o = zop(x);
    const t = sammeln(iTerms.map((it) => ({ k: it.k + o.d, c: E.mul(it.c, o.c) })));
    zeilen.push({ text: `u_${n(x)} = ${o.law} = ${zeitSumme(t, 'a')}`, indent: true });
    alle = alle.concat(t);
  });
  const dgl = sammeln(alle);
  zeilen.push({ text: `Einsetzen in die Maschengleichung (DGL): uₑ = ${zeitSumme(dgl, 'a')}`, strong: true });

  const kmin = dgl[0].k;
  const schritte = [{ titel: 'Methode 1: Systemgleichung (DGL) aufstellen', zeilen }];

  // Laplace
  const lz = [];
  lz.push({ text: 'Laplace-Transformation, Anfangswerte = 0: Ableitung → ·s, Integral → ·1/s' });
  lz.push({ text: `uₑ = ${zeitSumme(dgl, 'a')}  ⊶  Uₑ = ${summe(dgl.map((t) => laplaceTerm(t.c, t.k, 'Uₐ')))}` });
  const klammer = summe(dgl.map((t) => laplaceTerm(t.c, t.k, '')));
  lz.push({ text: `Uₑ = Uₐ·(${klammer})` });
  // G als Polynom: Nenner Σ c_k s^(k−kmin), Zähler s^(−kmin)
  let N = [];
  dgl.forEach((t) => { N[t.k - kmin] = t.c; });
  N = P.trim(Array.from({ length: N.length }, (_, i) => N[i] || []));
  const Z = P.shift(P.one(), Math.max(0, -kmin));
  const kette = [`G(s) = Uₐ/Uₑ = 1 / (${klammer})`];
  if (kmin < 0) kette.push(bruchFmt(Z, N));
  const g = entbruchen(Z, N);
  kette.push(bruchFmt(g.Z, g.N));
  lz.push({ text: dedupe(kette).join(' = '), strong: true });
  if (kmin < 0) lz.push({ text: `(mit ${kmin === -1 ? 's' : 's' + sup(-kmin)} erweitert, Doppelbrüche aufgelöst)`, muted: true });
  schritte.push({ titel: 'Methode 1: Laplace-Transformation der DGL', zeilen: lz });

  return { schritte, G: g, dgl, kmin };
}

function dedupe(arr) {
  return arr.filter((x, i) => i === 0 || x.replace(/\s/g, '') !== arr[i - 1].replace(/^G\(s\) = Uₐ\/Uₑ = /, '').replace(/\s/g, ''));
}

// ---------- Werte ----------

const PREFIX = { p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, 'μ': 1e-6, m: 1e-3, k: 1e3, M: 1e6 };
/** "4,7k" → 4700, "100µ" → 1e-4, "1/3" → 0,333…; leer → null */
export function parseWert(s) {
  s = String(s ?? '').trim().replace(/\s+/g, '').replace(',', '.').replace(/[ΩFH]$/, '');
  if (!s) return null;
  let m = /^(-?\d*\.?\d+(?:e-?\d+)?)\/(\d*\.?\d+)$/i.exec(s);
  if (m) return +m[1] / +m[2];
  m = /^(-?\d*\.?\d+(?:e-?\d+)?)([pnuµμmkM]?)$/.exec(s);
  if (!m) throw new Error(`Zahl „${s}“ nicht verstanden. Beispiele: 100, 4,7k, 10µ, 0,5, 1/3`);
  const v = +m[1] * (m[2] ? PREFIX[m[2]] : 1);
  if (!(v > 0)) throw new Error('Bauteilwerte müssen größer als 0 sein.');
  return v;
}

function npFmt(k) {
  const parts = [];
  k.forEach((c, i) => {
    if (Math.abs(c) < 1e-15) return;
    const sp = i === 0 ? '' : 's' + (i > 1 ? sup(i) : '');
    const a = Math.abs(c);
    const body = i === 0 ? fmt(a) : (Math.abs(a - 1) < 1e-12 ? sp : fmtG(a) + sp);
    parts.push({ neg: c < 0, body });
  });
  return summe(parts);
}
/** Zahl mit 4 gültigen Stellen (auch sehr kleine, z. B. 1e-6) */
function fmtG(x) {
  if (x !== 0 && (Math.abs(x) < 1e-3 || Math.abs(x) >= 1e6)) {
    const [m, e] = x.toExponential(3).split('e');
    return `${fmt(+m)}·10${sup(Math.abs(+e)).replace(/^/, +e < 0 ? '⁻' : '')}`;
  }
  return fmt(+x.toPrecision(4));
}

// ---------- Hauptfunktion ----------

/**
 * Eingabe: { z1: 'C', z2: 'R', werte?: { R: '100', C: '10µ' } }
 * Ausgabe: { schritte, fazit, typ, G: {Z, N} (bruchfrei), gText, normText, T, d, … }
 */
export function netzwerk(input) {
  const b1 = parseImpedanz(input.z1);
  const b2 = parseImpedanz(input.z2);
  namenVergeben([b1, b2]);
  const els = [...blaetter(b1), ...blaetter(b2)];
  const schritte = [];

  // 1. Schaltung
  schritte.push({
    titel: 'Schaltung: unbelasteter Spannungsteiler',
    zeilen: [
      { text: `Längsglied Z₁ (oben, in Reihe): ${baumText(b1)}` },
      { text: `Querglied Z₂ (parallel zum Ausgang uₐ): ${baumText(b2)}` },
      { text: 'iₐ = 0 → durch Z₁ und Z₂ fließt derselbe Strom i', muted: true },
      { text: 'Gesucht: G(s) = Uₐ(s)/Uₑ(s) = ℒ{uₐ(t)}/ℒ{uₑ(t)}' },
    ],
  });

  // 2. Bauteilgleichungen
  const arten = [...new Set(els.map((x) => x.art))].sort((a, b) => 'RLC'.indexOf(a) - 'RLC'.indexOf(b));
  const gz = [];
  if (arten.includes('R')) gz.push({ text: "Ohm'sches Gesetz: u_R = R·i   →   Z_R = R" });
  if (arten.includes('L')) gz.push({ text: `Spule: u_L = L·di/dt = L·i${DOT1}(t)   →   Z_L = sL` });
  if (arten.includes('C')) {
    gz.push({ text: `Kondensator: Q = C·u_C, dQ/dt = i = C·du_C/dt = C·u${DOT1}_C(t)   →   Z_C = 1/(sC)` });
    gz.push({ text: 'u_C(t) = 1/C·∫₀ᵗ i(τ) dτ', indent: true });
  }
  schritte.push({ titel: 'Grundlagen Elektrotechnik (Bauteilgleichungen)', zeilen: gz });

  // 3. Methode 1
  const m1 = methode1(b1, b2);
  if (m1) schritte.push(...m1.schritte);

  // 4. Methode 2: Spannungsteiler
  const z1 = zBaum(b1), z2 = zBaum(b2);
  const sz = [];
  const zeigeZ = (b, z, label) => {
    if (b.typ === 'el') return;
    const teile = [`${label} = ${baumText(b)}`, baumEinsetzen(b), bruchFmt(z.Z, z.N)];
    sz.push({ text: teile.filter((t, i) => i === 0 || t !== teile[i - 1]).join(' = ') });
  };
  zeigeZ(b1, z1, 'Z₁');
  zeigeZ(b2, z2, 'Z₂');
  const kl = (z) => { const t = bruchFmt(z.Z, z.N); return /[ +−]/.test(t) ? `(${t})` : t; };
  const z1t = b1.typ === 'el' ? zEl(b1) : kl(z1);
  const z2t = b2.typ === 'el' ? zEl(b2) : kl(z2);
  // G = Z₂/(Z₁+Z₂) = Z2·N1 / (Z1·N2 + Z2·N1)
  const gZ = P.mul(z2.Z, z1.N);
  const gN = P.add(P.mul(z1.Z, z2.N), P.mul(z2.Z, z1.N));
  const G = entbruchen(...Object.values(kuerzen(gZ, gN)));
  const einges = `${z2t.includes('/') && !z2t.startsWith('(') ? '(' + z2t + ')' : z2t} / (${z1t} + ${z2t})`;
  const erg = bruchFmt(G.Z, G.N);
  sz.push({
    text: `G(s) = Uₐ(s)/Uₑ(s) = Z₂/(Z₁ + Z₂) = ${einges}${einges.replace(/[()\s]/g, '') === erg.replace(/[()\s]/g, '') ? '' : ' = ' + erg}`,
    strong: true,
  });
  sz.push({ text: '(Doppelbrüche aufgelöst: Zähler und Nenner mit denselben Faktoren erweitert, gekürzt)', muted: true });
  schritte.push({ titel: m1 ? 'Methode 2: Spannungsteiler (Kontrolle)' : 'Spannungsteiler mit Impedanzen', zeilen: sz });
  if (!m1) {
    sz.unshift({ text: 'Z₁ oder Z₂ ist verschachtelt → am schnellsten über den Spannungsteiler; DGL danach durch Rücktransformation.', muted: true });
  }

  // Gegenprobe Methode 1 = Methode 2
  if (m1 && !P.isZero(P.add(P.mul(m1.G.Z, G.N), P.mul(P.scale(G.Z, E.num(-1)), m1.G.N)))) {
    sz.push({ text: '⚠ Methode 1 und 2 stimmen nicht überein – bitte Eingabe prüfen.', strong: true });
  }

  // 5. Normieren + Typ
  const B = G.Z, A = G.N;
  const norm = normieren(B, A);
  schritte.push({ titel: 'Normieren und Glied bestimmen', zeilen: norm.zeilen });

  // 6. DGL ohne Integral aus G(s)
  const dz = [];
  const toTerms = (p) => p.map((c, k) => ({ k, c })).filter((t) => !E.isZero(t.c));
  dz.push({ text: `G(s) = Uₐ/Uₑ = ${bruchFmt(B, A)}  →  Uₐ·(${pFmt(A)}) = Uₑ${P.isOne(B) ? '' : '·' + (pTerms(B) > 1 ? '(' + pFmt(B) + ')' : pFmt(B))}` });
  dz.push({ text: `⊶  ${zeitSumme(toTerms(A), 'a')} = ${zeitSumme(toTerms(B), 'e')}`, strong: true });
  dz.push({ text: 'Rücktransformation: sᵏ·U ⊶ k-te Ableitung (Anfangswerte 0)', muted: true });
  schritte.push({ titel: 'DGL ohne Integral (ausmultiplizieren, invers Laplace)', zeilen: dz });

  // 7. Zahlenwerte
  const syms = [...new Set(els.map((x) => x.name))];
  let numerisch = null;
  const werte = {};
  if (input.werte) {
    for (const s of syms) {
      const v = parseWert(input.werte[s]);
      if (v != null) werte[s] = v;
    }
  }
  if (syms.length && syms.every((s) => s in werte)) {
    const bk = P.evalNum(B, werte), ak = P.evalNum(A, werte);
    const a0 = ak[0] || 1;
    const bn = bk.map((x) => x / a0), an = ak.map((x) => x / a0);
    const nz = [{ text: syms.map((s) => `${symName(s)} = ${fmtG(werte[s])}`).join(', ') }];
    nz.push({ text: `G(s) = ${klN(npFmt(bn), bn)} / ${klN(npFmt(an), an)}`, strong: true });
    numerisch = { Z: bn, N: an };
    const n = an.length - 1;
    if (n === 1 && ak[0]) { numerisch.T = an[1]; nz.push({ text: `T₁ = ${eFmtT(norm.T)} = ${fmtG(an[1])} s` }); }
    if (n === 2 && ak[0]) {
      const T = Math.sqrt(an[2]), d = an[1] / (2 * T);
      numerisch.T = T; numerisch.d = d;
      nz.push({ text: `T = √(${fmtG(an[2])}) = ${fmtG(T)} s,  ω₀ = 1/T = ${fmtG(1 / T)} 1/s` });
      nz.push({ text: `d = ${fmtG(an[1])}/(2·${fmtG(T)}) = ${fmtG(d)} → ${d > 1 + 1e-9 ? 'aperiodisch (d > 1, zwei reelle Pole)' : d > 1 - 1e-9 ? 'aperiodischer Grenzfall (d = 1)' : 'schwingfähig (0 < d < 1)'}` });
    }
    if (bk.length === 1 && ak[0]) nz.push({ text: `Verstärkung K = G(0) = ${fmtG(bn[0])}` });
    schritte.push({ titel: 'Mit Zahlenwerten', zeilen: nz });
  }

  const gText = bruchFmt(B, A);
  const fazit = `G(s) = ${gText}${norm.formText && norm.formText !== gText ? ' = ' + norm.formText : ''}${norm.defs.length ? ', ' + norm.defs.join(', ') : ''} → ${norm.typ}`;
  return {
    schritte, fazit, typ: norm.typ, G, gText, normText: norm.normText, formText: norm.formText,
    T: norm.T ? eFmtT(norm.T) : null, d: norm.dText || null, methode1: !!m1, m1G: m1 ? m1.G : null,
    dgl: m1 ? m1.dgl : null, numerisch, symbole: syms,
  };
}

const klN = (t, arr) => (arr.filter((x) => Math.abs(x) > 1e-15).length > 1 ? `(${t})` : t);
const eFmtT = (T) => (typeof T === 'string' ? T : eFmt(T));

/** Normieren auf Konstante 1 im Nenner, Glied-Typ, Zeitkonstanten */
function normieren(B, A) {
  const zeilen = [];
  const n = P.deg(A);
  const pot = B.map((c, k) => (E.isZero(c) ? -1 : k)).filter((k) => k >= 0);
  const a0 = A[0] || [];
  let typ;
  if (E.isZero(a0)) typ = 'Glied mit I-Anteil (Nenner ohne Konstante)';
  else if (n === 0 && pot.length === 1 && pot[0] === 0) typ = 'P-Glied (reiner Spannungsteiler)';
  else if (pot.length === 1 && pot[0] === 0) typ = n === 1 ? 'PT1-Glied' : n === 2 ? 'PT2-Glied' : `PT${n}-Glied`;
  else if (pot.length === 1 && pot[0] === 1 && n === 1) typ = 'DT1-Glied';
  else if (pot.length === 1 && pot[0] === 1 && n === 2) typ = 'DT2-Glied (D-Glied mit PT2-Nenner)';
  else if (pot.length === 1 && pot[0] === 2 && n === 2) typ = 'Hochpass 2. Ordnung (s² im Zähler, PT2-Nenner)';
  else if (pot.length === 2 && pot[0] === 0 && pot[1] === 1 && n === 1) typ = 'PD-T1-Glied (Lead-Lag)';
  else typ = `Übertragungsglied: Zählergrad ${P.deg(B)}, Nennergrad ${n}`;

  const out = { zeilen, typ, defs: [], formText: null, normText: null, T: null, dText: null };
  if (E.isZero(a0)) {
    zeilen.push({ text: `Nenner ohne Konstante → nicht auf 1 + sT normierbar. ${typ}`, strong: true });
    return out;
  }

  let Bn, An, mono = E.isMono(a0);
  if (mono) {
    Bn = P.trim(B.map((c) => E.div(c, a0)));
    An = P.trim(A.map((c) => E.div(c, a0)));
    if (!E.isOne(a0)) {
      zeilen.push({ text: `Zähler und Nenner durch ${eFmt(a0)} teilen (Konstante im Nenner = 1):` });
      zeilen.push({ text: `G(s) = ${bruchFmt(Bn, An)}` });
    } else {
      zeilen.push({ text: `Konstante im Nenner ist schon 1: G(s) = ${bruchFmt(Bn, An)}` });
    }
    out.normText = bruchFmt(Bn, An);
  } else {
    zeilen.push({ text: `Konstante im Nenner ist ${eFmt(a0)} (Summe) → Koeffizienten durch (${eFmt(a0)}) teilen:` });
  }
  // Koeffizient X / a0 als Expr (Monom) oder Text (Summe)
  const q = (X) => (mono ? E.div(X, a0) : `${X.length > 1 ? '(' + eFmt(X) + ')' : eFmt(X)}/(${eFmt(a0)})`);
  const qt = (X) => (typeof X === 'string' ? X : eFmt(X));
  const qk = (X) => { const t = qt(X); return /[ /]/.test(t) ? `(${t})` : t; };

  if (n === 1) {
    const T = q(A[1]);
    out.T = T;
    out.defs.push(`T₁ = ${qt(T)}`);
    zeilen.push({ text: `Zeitkonstante: T₁ = ${qt(T)}`, strong: true });
    // Verhältnisse direkt aus den bruchfreien Koeffizienten (a₀ kürzt sich heraus)
    const ratio = (X0, Y0) => {
      const g = kuerzen([X0], [Y0]);
      const X = g.Z[0] || [], Y = g.N[0] || [];
      return E.isMono(Y) ? eFmt(E.div(X, Y)) : `${qk(X)}/${qk(Y)}`;
    };
    const istEins = (X, Y) => E.equal(X, Y);
    if (pot.length === 1 && pot[0] === 0) {
      const eins = istEins(B[0], a0);
      out.formText = eins ? '1/(1 + sT₁)' : 'K/(1 + sT₁)';
      if (!eins) { const K = ratio(B[0], a0); out.defs.push(`K = ${K}`); zeilen.push({ text: `Verstärkung K = G(0) = ${K}` }); }
    } else if (pot.length === 1 && pot[0] === 1) {
      if (istEins(B[1], A[1])) out.formText = 'sT₁/(1 + sT₁)';
      else {
        out.formText = 'K·sT₁/(1 + sT₁)';
        const K = ratio(B[1], A[1]);
        out.defs.push(`K = ${K}`);
        zeilen.push({ text: `Zähler = K·sT₁ mit K = ${K}` });
      }
    } else if (pot.length === 2 && pot[0] === 0) {
      const eins = istEins(B[0], a0);
      const K = ratio(B[0], a0), aT = ratio(B[1], B[0]);
      out.formText = eins ? '(1 + s·aT₁)/(1 + sT₁)' : 'K·(1 + s·aT₁)/(1 + sT₁)';
      if (!eins) out.defs.push(`K = ${K}`);
      out.defs.push(`aT₁ = ${aT}`);
      zeilen.push({ text: `${eins ? '' : `Verstärkung K = ${K}, `}Vorhalt aT₁ = ${aT} (Lead für a > 1, Lag für a < 1)` });
    }
    zeilen.push({ text: `G(s) = ${out.formText}  →  ${typ}`, strong: true });
  } else if (n === 2) {
    const a2 = q(A[2]), a1 = q(A[1]);
    let Tt, dt;
    const s2 = typeof a2 !== 'string' ? E.sqrtMono(a2) : null;
    Tt = s2 ? wurzelText(s2) : `√(${qt(a2)})`;
    if (E.isZero(A[1])) dt = '0 (ungedämpft: Dauerschwingung)';
    else if (s2 && typeof a1 !== 'string' && E.isMono(a1)) {
      const d2 = E.div(E.mul(a1, a1), E.mul(E.num(4), a2));
      dt = wurzelText(E.sqrtMono(d2));
    } else dt = `${qk(a1)}/(2·${Tt})`;
    out.T = Tt; out.dText = dt;
    zeilen.push({ text: `Vergleich mit PT2-Nenner T²s² + 2dTs + 1:` });
    zeilen.push({ text: `T² = ${qt(a2)} → T = ${Tt},  ω₀ = 1/T`, strong: true });
    zeilen.push({ text: E.isZero(A[1]) ? `kein s-Glied im Nenner → d = ${dt}` : `2dT = ${qt(a1)} → d = ${qk(a1)}/(2T) = ${dt}`, strong: true });
    const zaehler = pot.length === 1 && pot[0] === 0 ? (typeof q(B[0]) !== 'string' && E.isOne(q(B[0])) ? '1' : 'K')
      : pot.length === 1 && pot[0] === 1 ? 'K·s' : pot.length === 1 && pot[0] === 2 ? 'K·s²' : null;
    if (zaehler) {
      const K = q(B[pot[0]]);
      out.formText = `${zaehler}/(T²s² + 2dTs + 1)`;
      if (zaehler !== '1') { out.defs.push(`K = ${qt(K)}`); zeilen.push({ text: `Zähler-Faktor K = ${qt(K)}` }); }
    }
    out.defs.push(`T = ${Tt}`, `d = ${dt}`);
    zeilen.push({ text: 'd > 1: aperiodisch · d = 1: Grenzfall · 0 < d < 1: schwingfähig', muted: true });
    zeilen.push({ text: `→ ${typ}`, strong: true });
  } else {
    zeilen.push({ text: `→ ${typ}`, strong: true });
  }
  return out;
}

function wurzelText({ aussen, innen }) {
  const a = monoFmt(aussen[0]).body;
  const i = monoFmt(innen[0]).body;
  if (i === '1') return a;
  return (a === '1' ? '' : a + '·') + `√(${i})`;
}

/** Komplexe Gegenprobe-Hilfe: G-Bruch bei s = jω auswerten */
export function gAuswerten(G, werte, w) {
  const z = P.evalC(G.Z, werte, [0, w]);
  const n = P.evalC(G.N, werte, [0, w]);
  const d = n[0] * n[0] + n[1] * n[1];
  return [(z[0] * n[0] + z[1] * n[1]) / d, (z[1] * n[0] - z[0] * n[1]) / d];
}
