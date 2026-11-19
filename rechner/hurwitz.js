// Hurwitz-Kriterium mit Rechenweg. Reine Rechnung, keine Oberfläche.
// Konvention (wie Vorlesung): N(s) = aₙsⁿ + … + a₀, Matrix beginnt oben links mit aₙ₋₁,
// Hₙ = a₀ · Hₙ₋₁. Stabil ⇔ aₙ > 0 und alle Hᵢ > 0.

import { K, BP, fmt, frac, sub, kfmt, kfac, bfmt, parsePoly, realRoots, solvePositive, fmtIntervals } from '../lib/poly.js';

const a = (i) => 'a' + sub(i);
const H = (i) => 'H' + sub(i);

/** Hurwitz-Matrix n×n: Eintrag (i, j) (1-basiert) = a_{n−2j+i}, sonst 0. */
export function hurwitzMatrix(coef, n) {
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => {
      const idx = n - 2 * (c + 1) + (r + 1);
      return idx >= 0 && idx <= n ? coef[idx] : [0];
    })
  );
}

const sub1 = (M, k) => M.slice(0, k).map((row) => row.slice(0, k));
const minor = (M, r, c) => M.filter((_, i) => i !== r).map((row) => row.filter((_, j) => j !== c));

/** Determinante (kpoly-Einträge) per Entwicklung nach der 1. Spalte. */
export function det(M) {
  const n = M.length;
  if (n === 1) return M[0][0];
  if (n === 2) return K.sub(K.mul(M[0][0], M[1][1]), K.mul(M[0][1], M[1][0]));
  let r = [0];
  for (let i = 0; i < n; i++) {
    if (K.isZero(M[i][0])) continue;
    const t = K.mul(M[i][0], det(minor(M, i, 0)));
    r = i % 2 ? K.sub(r, t) : K.add(r, t);
  }
  return r;
}

/** Rechenweg-Zeilen für eine Determinante. label z. B. "H₃" oder "D₁". */
function detLines(M, label, name) {
  const f = (x) => kfac(x, name);
  const n = M.length;
  const val = det(M);
  if (n === 1) return [{ text: `${label} = ${kfmt(val, name)}` }];
  if (n === 2) {
    return [{
      text: `${label} = ${f(M[0][0])} · ${f(M[1][1])} − ${f(M[0][1])} · ${f(M[1][0])} = ${kfmt(val, name)}`,
    }];
  }
  const lines = [{ text: `${label}: Entwicklung nach der 1. Spalte (Einträge = 0 fallen weg)` }];
  const terms = [];
  const subLines = [];
  let k = 0;
  for (let i = 0; i < n; i++) {
    if (K.isZero(M[i][0])) continue;
    k++;
    const dl = 'D' + sub(k);
    const m = minor(M, i, 0);
    terms.push({ sign: i % 2 ? '−' : '+', fac: f(M[i][0]), dl, val: det(m) });
    subLines.push({ text: `${dl}: Zeile ${i + 1} und Spalte 1 streichen`, matrix: m.map((r) => r.map((x) => kfmt(x, name))) });
    subLines.push(...detLines(m, dl, name).map((l) => ({ ...l, indent: true })));
  }
  const join = (parts) => parts.map((p, j) => (j === 0 ? (p.sign === '−' ? '−' : '') : ` ${p.sign} `) + p.body).join('');
  lines.push({ text: `${label} = ` + join(terms.map((t) => ({ sign: t.sign, body: `${t.fac} · ${t.dl}` }))) });
  lines.push(...subLines);
  lines.push({
    text: `${label} = ` + join(terms.map((t) => ({ sign: t.sign, body: `${t.fac} · ${kfac(t.val, name)}` }))) + ` = ${kfmt(val, name)}`,
    strong: true,
  });
  return lines;
}

/**
 * Eingabe:
 *   { modus: 'polynom', polynom: 's^3+9s^2+23s+15' }
 *   { modus: 'regelkreis', zaehler: '10', nenner: '(s+1)(s+2)' }   → N(s) + K_R·Z(s)
 * Ausgabe: { schritte: [{titel, zeilen:[{text, matrix?, strong?, indent?}]}], fazit, stabil, bereich, H }
 */
export function hurwitz(input) {
  const name = 'K_R';
  const schritte = [];
  let N;

  if (input.modus === 'regelkreis') {
    const Z = parsePoly(input.zaehler);
    const Nn = parsePoly(input.nenner);
    if (BP.hasParam(Z) || BP.hasParam(Nn)) throw new Error('Z(s) und N(s) der Strecke ohne K eingeben. K_R kommt vom Regler.');
    N = BP.add(Nn, BP.mul(Z, [[0, 1]]));
    // Klammern nur, wenn mehrere Summanden
    const summen = (p) => p.filter((k) => !K.isZero(k)).length > 1;
    const kl = (t, mehr) => (mehr ? `(${t})` : t);
    const zs = kl(bfmt(Z), summen(Z)), ns = kl(bfmt(Nn), summen(Nn));
    // Eingabe so zeigen, wie sie in der Aufgabe steht, falls sie anders aussieht (z. B. (s+1)(s+2))
    const roh = (s) => String(s).trim().replace(/\s+/g, '');
    const rohKl = (s) => (/[-+−]/.test(s) ? `(${s})` : s);
    const gleich = (s, p) => roh(s).replace(/[−-]/g, '-') === bfmt(p).replace(/\s+/g, '').replace(/[−]/g, '-');
    const gsRoh = gleich(input.zaehler, Z) && gleich(input.nenner, Nn) ? '' : `${rohKl(roh(input.zaehler))} / ${rohKl(roh(input.nenner))} = `;
    // Z₀ = K_R · Z: bei einem Summanden ausmultipliziert (10K_R), sonst K_R(s + 2)
    const z0 = summen(Z) ? `K_R${zs}` : bfmt(BP.mul(Z, [[0, 1]]), name);
    schritte.push({
      titel: 'Geschlossener Kreis aufstellen',
      zeilen: [
        { text: `Strecke: G_S(s) = ${gsRoh}${zs} / ${ns}` },
        { text: `Regler: R(s) = K_R (P-Regler)` },
        { text: `Offener Kreis: G₀(s) = R(s)·G_S(s) = ${z0} / ${ns} = Z₀ / N₀` },
        { text: `Geschlossener Kreis: G(s) = G₀ / (1 + G₀) = Z₀ / (N₀ + Z₀)` },
        { text: `G(s) = ${z0} / (${bfmt(N, name)})`, strong: true },
        { text: `Hurwitz wird auf den Nenner N₀ + Z₀ angewendet:` },
        { text: `N(s) = ${bfmt(N, name)}`, strong: true },
      ],
    });
  } else {
    N = parsePoly(input.polynom);
  }

  N = BP.trim(N);
  const n = N.length - 1;
  if (n < 1) throw new Error('Das Polynom braucht mindestens Grad 1 (ein s).');
  const hasParam = BP.hasParam(N);

  // aₙ < 0 (ohne Parameter): mit −1 multiplizieren, ändert die Nullstellen nicht
  if (!hasParam && N[n][0] < 0) {
    N = BP.neg(N);
    schritte.push({
      titel: 'Vorzeichen anpassen',
      zeilen: [{ text: `aₙ < 0 → Polynom mit −1 multipliziert (Nullstellen bleiben gleich): N(s) = ${bfmt(N, name)}` }],
    });
  }

  // Koeffizienten
  const kz = [];
  for (let i = n; i >= 0; i--) kz.push(`${a(i)} = ${kfmt(N[i], name)}`);
  schritte.push({
    titel: 'Koeffizienten ablesen',
    zeilen: [
      { text: `N(s) = ${bfmt(N, name)}` },
      { text: `Grad n = ${n} → ${H(1)} bis ${H(n)} berechnen` },
      { text: kz.join('   ') },
    ],
  });

  // Notwendige Bedingung
  if (!hasParam) {
    const bad = [];
    for (let i = n; i >= 0; i--) if (N[i][0] <= 0) bad.push(`${a(i)} = ${fmt(N[i][0])}`);
    schritte.push({
      titel: 'Notwendige Bedingung: alle aᵢ > 0',
      zeilen: [{
        text: bad.length
          ? `Verletzt: ${bad.join(', ')} → schon deshalb nicht stabil.`
          : 'Erfüllt: alle Koeffizienten sind positiv. (Reicht ab n = 3 allein nicht, deshalb Hurwitz.)',
      }],
    });
  }

  // Matrix
  const M = hurwitzMatrix(N, n);
  schritte.push({
    titel: 'Hurwitz-Matrix aufstellen',
    zeilen: [
      { text: `Oben links ${a(n - 1)}, nach rechts der Index −2, nach unten +1; außerhalb 0…${n} → 0.` },
      { text: '', matrix: M.map((r) => r.map((x) => kfmt(x, name))) },
    ],
  });

  // H1 … Hn
  const Hs = [];
  for (let k = 1; k <= n; k++) {
    let zeilen;
    let val;
    if (k === n && n >= 2) {
      val = K.mul(N[0], Hs[n - 2]);
      zeilen = [{
        text: `${H(n)} = ${a(0)} · ${H(n - 1)} = ${kfac(N[0], name)} · ${kfac(Hs[n - 2], name)} = ${kfmt(val, name)}`,
        strong: true,
      }, { text: '(Letzte Spalte hat nur a₀ unten rechts, deshalb Hₙ = a₀ · Hₙ₋₁.)', muted: true }];
    } else if (k === 1) {
      val = M[0][0];
      zeilen = [{ text: `${H(1)} = ${a(n - 1)} = ${kfmt(val, name)}`, strong: true }];
    } else {
      const S = sub1(M, k);
      val = det(S);
      zeilen = [{ text: '', matrix: S.map((r) => r.map((x) => kfmt(x, name))) }, ...detLines(S, H(k), name)];
      zeilen[zeilen.length - 1].strong = true;
    }
    Hs.push(val);
    schritte.push({ titel: `${H(k)} berechnen`, zeilen });
  }

  // Fazit
  if (!hasParam) {
    const vals = Hs.map((h) => h[0]);
    const badIdx = vals.findIndex((v) => v <= 1e-12);
    const liste = vals.map((v, i) => `${H(i + 1)} = ${fmt(v)}`).join(', ');
    let fazit;
    if (badIdx < 0) fazit = `Alle Hᵢ > 0 (${liste}) → System ist stabil.`;
    else if (Math.abs(vals[badIdx]) <= 1e-12) fazit = `${H(badIdx + 1)} = 0 → nicht asymptotisch stabil (Grenzfall). (${liste})`;
    else fazit = `${H(badIdx + 1)} = ${fmt(vals[badIdx])} < 0 → System ist instabil. (${liste})`;
    schritte.push({ titel: 'Ergebnis', zeilen: [{ text: fazit, strong: true }] });
    return { schritte, fazit, stabil: badIdx < 0, H: vals, n };
  }

  // Mit Parameter: jede Bedingung einzeln, dann Schnittmenge
  const conds = [];
  const zeilen = [];
  const kterm = (c) => (c === 1 ? name : c === -1 ? '−' + name : fmt(c) + name);
  // Eine Bedingung „label = h > 0“ mit Rechenweg wie in der Musterlösung
  function bedingung(label, h) {
    h = K.trim(h);
    if (h.length === 1) {
      zeilen.push({ text: `${label} = ${fmt(h[0])} ${h[0] > 0 ? '> 0 ✓ (immer erfüllt)' : '≤ 0 ✗ (nie erfüllt → für kein K_R stabil)'}` });
      return;
    }
    zeilen.push({ text: `${label} = ${kfmt(h, name)} > 0`, strong: true });
    if (h.length === 2) {
      const [c0, c1] = h;
      const g = -c0 / c1;
      const rel = c1 > 0 ? '>' : '<';
      if (c0 !== 0) zeilen.push({ text: `${kterm(c1)} > ${fmt(-c0)}`, indent: true });
      if (c1 < 0) zeilen.push({ text: `Durch ${fmt(c1)} teilen: negative Zahl → Ungleichung dreht sich um`, muted: true, indent: true });
      if (Math.abs(c1) !== 1) {
        const roh = `${fmt(-c0)}/${c1 < 0 ? '(' + fmt(c1) + ')' : fmt(c1)}`;
        const teile = [roh, frac(g), fmt(g)].filter((t, i, arr) => arr.indexOf(t) === i);
        zeilen.push({ text: `${name} ${rel} ${teile.join(' = ')}`, indent: true });
      } else {
        zeilen.push({ text: `${name} ${rel} ${fmt(g)}`, indent: true });
      }
    } else {
      const nst = realRoots(h).map((r) => frac(r, 20)).join('; ');
      zeilen.push({ text: `Nullstellen in K_R: ${nst || 'keine'} → ${fmtIntervals(solvePositive([h]), name)}`, indent: true });
    }
  }
  if (!K.isConst(N[n])) { conds.push(N[n]); bedingung(a(n), N[n]); }
  Hs.forEach((h, i) => { conds.push(h); bedingung(H(i + 1), h); });
  const iv = solvePositive(conds);
  const bereich = fmtIntervals(iv, name);
  zeilen.push({ text: `Alle Bedingungen zusammen: stabil für ${bereich}`, strong: true });
  schritte.push({ titel: 'Bedingungen Hᵢ > 0 nach K_R auflösen', zeilen });
  return { schritte, fazit: `Stabil für ${bereich}`, stabil: iv.length > 0 ? null : false, bereich, intervalle: iv, H: Hs, n };
}
