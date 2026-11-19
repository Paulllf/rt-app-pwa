// G(s) → Zustandsraumdarstellung in Regelungsnormalform (RNF) mit Rechenweg.
// Konvention wie Vorlesung V08 (Folien 42–51) und Musterlösung K2 A14:
//   G(s) = (bₙ₋₁sⁿ⁻¹ + … + b₁s + b₀) / (sⁿ + aₙ₋₁sⁿ⁻¹ + … + a₁s + a₀)   (Nenner normiert, aₙ = 1)
//   ẋ_R = A·x_R + b·u,  v = cᵀ·x_R + d·u
//   A: Einsen auf der oberen Nebendiagonale, letzte Zeile −a₀ … −aₙ₋₁; b = [0 … 0 1]ᵀ; cᵀ = [b₀ b₁ … bₙ₋₁]
// Zustände: x_R1 = U/N, x_R2 = ẋ_R1, …  (x_R1 ist die „unterste“ Ableitung).
// Reine Rechnung, keine Oberfläche.

import { parsePoly, BP, K, fmt, sub, sup } from '../lib/poly.js';
import { Q, ausZahl, btext, roh } from '../lib/zustandsraum-bruch.js';

const a = (i) => 'a' + sub(i);
/** "b₀ b₁ … bₙ₋₁" bzw. alle bei kleinem n. */
const liste = (f, n, vz = '') => (n <= 4 ? Array.from({ length: n }, (_, i) => vz + f(i)) : [vz + f(0), vz + f(1), '…', vz + f(n - 1)]).join(' ');
const bb = (i) => 'b' + sub(i);
const xR = (i) => 'x_R' + sub(i);
const sp = (i) => (i === 0 ? '' : 's' + (i > 1 ? sup(i) : ''));

/** Polynom (Brüche, Index = s-Potenz) als Text, absteigend. txt(i) liefert optional den Betrag als Text. */
function ptext(koef, txt) {
  const teile = [];
  for (let i = koef.length - 1; i >= 0; i--) {
    const q = koef[i];
    if (Q.istNull(q)) continue;
    const neg = Q.wert(q) < 0;
    let betrag = txt ? txt(i) : btext(q);
    betrag = betrag.replace(/^−/, '');
    let body;
    if (i === 0) body = betrag;
    else if (betrag === '1') body = sp(i);
    else body = betrag + (betrag.includes('/') || betrag.includes(',') ? '·' : '') + sp(i);
    teile.push({ neg, body });
  }
  if (!teile.length) return '0';
  return teile.map((t, k) => (k === 0 ? (t.neg ? '−' : '') + t.body : (t.neg ? ' − ' : ' + ') + t.body)).join('');
}
const kl = (t) => (/[ /]/.test(t) || t.startsWith('−') ? `(${t})` : t);
const bruchG = (z, n) => `${kl(z)} / ${kl(n)}`;

/** Eingabe lesen: Polynom ohne K, Koeffizienten als exakte Brüche (Index = s-Potenz). */
function lies(text, wer) {
  if (!String(text || '').trim()) throw new Error(`Bitte ${wer} eingeben.`);
  let p;
  try { p = BP.trim(parsePoly(text)); } catch (e) { throw new Error(`${wer}: ${e.message}`); }
  if (BP.hasParam(p)) throw new Error(`${wer}: Bitte nur Zahlen und s eingeben (kein K).`);
  return p.map((k) => ausZahl(K.trim(k)[0]));
}

/** Lineares Gleichungssystem M·x = r (Zahlen), Gauß mit Pivotsuche. Für die Probe. */
export function loese(M, r) {
  const n = M.length;
  const E = M.map((z, i) => [...z, r[i]]);
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(E[i][k]) > Math.abs(E[p][k])) p = i;
    if (Math.abs(E[p][k]) < 1e-14) return null;
    [E[k], E[p]] = [E[p], E[k]];
    for (let i = k + 1; i < n; i++) {
      const f = E[i][k] / E[k][k];
      for (let j = k; j <= n; j++) E[i][j] -= f * E[k][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = E[i][n];
    for (let j = i + 1; j < n; j++) s -= E[i][j] * x[j];
    x[i] = s / E[i][i];
  }
  return x;
}

/** cᵀ(sI − A)⁻¹b + d an der Stelle s (Zahlen). */
export function ssWert(A, b, c, d, s) {
  const n = A.length;
  const M = A.map((z, i) => z.map((v, j) => (i === j ? s : 0) - v));
  const x = loese(M, b);
  if (!x) return NaN;
  return x.reduce((acc, xi, i) => acc + c[i] * xi, d);
}

const dez = (x) => {
  // Python-Darstellung: 3 gültige Stellen, wie in Ü08 (−1.68, −0.819, −0.00952)
  if (Math.abs(x) < 1e-12) return '0';
  const t = Number(x.toPrecision(3));
  return fmt(t, 8);
};

/**
 * Eingabe: { zaehler: '1', nenner: '210s^4+247s^3+101s^2+17s+1', extras?: true }
 * Ausgabe: { schritte, fazit, n, m, A, b, c, d (Zahlen), Atext, btext, ctext, dtext, sprungfaehig, python, bnf }
 */
export function zustandsraum(input) {
  const Z = lies(input.zaehler, 'Zähler Z(s)');
  const N = lies(input.nenner, 'Nenner N(s)');
  const n = N.length - 1;
  let m = Z.length - 1;
  if (Z.length === 1 && Q.istNull(Z[0])) throw new Error('Der Zähler ist 0, dann ist G(s) = 0. Bitte Zähler prüfen.');
  if (n < 1) throw new Error('Der Nenner braucht mindestens ein s (Grad n ≥ 1), sonst gibt es keinen Zustand.');
  if (m > n) throw new Error(`Zählergrad m = ${m} > Nennergrad n = ${n}: G(s) ist nicht realisierbar (nicht kausal). Dafür gibt es keine Zustandsraumdarstellung.`);

  const schritte = [];
  const an = N[n];

  // 1. Gegeben
  const roheEingabe = (t) => String(t).trim().replace(/\s+/g, '');
  const zt = ptext(Z), nt = ptext(N);
  const gegeben = [{ text: `G(s) = ${bruchG(zt, nt)}`, strong: true }];
  const norm = (t) => String(t).replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/[·*^]/g, '')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (ch) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(ch)).replace(/,/g, '.');
  const anders = (t, p) => norm(t) !== norm(p);
  if (anders(input.zaehler, zt) || anders(input.nenner, nt)) {
    const rk = (t) => (/[-+−]/.test(t.slice(1)) ? `(${t})` : t);
    gegeben.unshift({ text: `Eingabe: G(s) = ${rk(roheEingabe(input.zaehler))} / ${rk(roheEingabe(input.nenner))} → ausmultipliziert:`, muted: true });
  }
  gegeben.push({ text: `Nennergrad n = ${n} (→ ${n} ${n === 1 ? 'Zustand' : 'Zustände'}), Zählergrad m = ${m}` });
  schritte.push({ titel: 'Übertragungsfunktion', zeilen: gegeben });

  // 2. Sprungfähig? → Polynomdivision, d abspalten
  let d = Q.div(Z[n] || ausZahl(0), an);
  let R = Z; // Rest-Zähler (unnormiert)
  const sprungfaehig = m === n;
  if (sprungfaehig) {
    R = Z.map((q, i) => Q.sub(q, Q.mul(d, N[i]))).slice(0, n);
    while (R.length > 1 && Q.istNull(R[R.length - 1])) R.pop();
    schritte.push({
      titel: 'Zählergrad = Nennergrad → sprungfähig: Polynomdivision',
      zeilen: [
        { text: 'Die RNF der Vorlesung gilt für nicht sprungfähige G(s) (Zählergrad < Nennergrad). Deshalb erst den Durchgang d abspalten:', muted: true },
        { text: `d = ${bb(n)}/${a(n)} = ${roh(Z[n], an)}${roh(Z[n], an) !== btext(d) ? ' = ' + btext(d) : ''}` },
        { text: `Z(s) − d·N(s) = ${ptext(Z)} − ${kl(btext(d))}·(${ptext(N)}) = ${ptext(R)}` },
        { text: `G(s) = ${btext(d)} + ${bruchG(ptext(R), ptext(N))}`, strong: true },
        { text: `Der Rest ${bruchG(ptext(R), ptext(N))} wird in RNF gebracht, d geht direkt in die Ausgangsgleichung.`, muted: true },
      ],
    });
  } else {
    d = ausZahl(0);
  }

  // 3. Normieren
  const A_ = N.map((q) => Q.div(q, an)); // aᵢ normiert, A_[n] = 1
  const B_ = Array.from({ length: n }, (_, i) => Q.div(R[i] || ausZahl(0), an)); // bᵢ normiert
  const zRohTxt = (i) => roh(R[i] || ausZahl(0), an);
  const nRohTxt = (i) => (i === n ? '1' : roh(N[i], an));
  const zNorm = ptext(B_, zRohTxt);
  const nNorm = ptext(A_, nRohTxt);
  const restText = sprungfaehig ? 'G_Rest(s)' : 'G(s)';
  if (!Q.istEins(an)) {
    schritte.push({
      titel: 'In die passende Form bringen: Nenner normieren (aₙ = 1)',
      zeilen: [
        { text: `Zähler und Nenner durch ${a(n)} = ${btext(an)} teilen:` },
        { text: `${restText} = ${bruchG(zNorm, nNorm)}`, strong: true },
      ],
    });
  } else {
    schritte.push({
      titel: 'Passende Form prüfen',
      zeilen: [{ text: `${a(n)} = 1 → Nenner ist schon normiert, nichts zu teilen.` },
        { text: `${restText} = ${bruchG(zNorm, nNorm)}`, strong: true }],
    });
  }

  // 4. Koeffizienten ablesen
  const zeigen = (q, rohTxt) => (rohTxt !== btext(q) && !Q.istNull(q) ? `${rohTxt} = ${btext(q)}` : btext(q));
  const az = [], bz = [];
  for (let i = 0; i < n; i++) az.push(`${a(i)} = ${zeigen(A_[i], nRohTxt(i))}`);
  for (let i = 0; i < n; i++) bz.push(`${bb(i)} = ${zeigen(B_[i], zRohTxt(i))}`);
  schritte.push({
    titel: 'Koeffizienten ablesen',
    zeilen: [
      { text: `Form: G(s) = (bₙ₋₁sⁿ⁻¹ + … + b₁s + b₀) / (sⁿ + aₙ₋₁sⁿ⁻¹ + … + a₁s + a₀), hier n = ${n}`, muted: true },
      { text: az.join('   ') },
      { text: bz.join('   ') },
    ],
  });

  // 5. Herleitung der Zustände (wie Vorlesung)
  const AT = A_.map(btext), BT = B_.map(btext);
  const summe = (glieder) => {
    const t = glieder.filter((g) => g.k !== '0');
    if (!t.length) return '0';
    return t.map((g, j) => {
      const neg = g.k.startsWith('−');
      const betrag = neg ? g.k.slice(1) : g.k;
      const body = (betrag === '1' ? '' : betrag + '·') + g.x;
      return j === 0 ? (neg ? '−' : '') + body : (neg ? ' − ' : ' + ') + body;
    }).join('');
  };
  const her = [
    { text: `X_R₁(s) = U(s)/N(s)  (Eingangsgröße / Nennerpolynom)` },
  ];
  for (let i = 1; i < n; i++) her.push({ text: `ẋ_R${sub(i)}(t) = ${xR(i + 1)}(t)`, indent: true });
  const letzte = summe(Array.from({ length: n }, (_, i) => ({ k: btext(Q.neg(A_[i])), x: xR(i + 1) })));
  her.push({ text: `ẋ_R${sub(n)}(t) = ${letzte} + u(t)`, indent: true });
  her.push({ text: `v(t) = ${summe(Array.from({ length: n }, (_, i) => ({ k: BT[i], x: xR(i + 1) })))}${Q.istNull(d) ? '' : ` + ${kl(btext(d))}·u(t)`}`, indent: true });
  schritte.push({ titel: 'Zustandsgrößen festlegen (Herleitung wie Vorlesung)', zeilen: her });

  // 6. Matrizen
  const A = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i < n - 1 ? (j === i + 1 ? 1 : 0) : -Q.wert(A_[j]))));
  const Atext = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i < n - 1 ? (j === i + 1 ? '1' : '0') : btext(Q.neg(A_[j])))));
  const b = Array.from({ length: n }, (_, i) => (i === n - 1 ? 1 : 0));
  const c = B_.map(Q.wert);
  const ctext = BT;
  const dtext = btext(d);
  schritte.push({
    titel: 'Eingangsgleichung (Systemgleichung) in RNF',
    zeilen: [
      { text: 'ẋ_R(t) = A·x_R(t) + b·u(t)', strong: true },
      { text: n === 1 ? 'Systemmatrix A (1×1): nur −a₀' : `Systemmatrix A (${n}×${n}): Einsen über der Diagonale, letzte Zeile ${liste(a, n, '−')}`, muted: true },
      { text: 'A =', matrix: Atext },
      { text: 'Eingangsvektor b:', matrix: b.map((x) => [String(x)]) },
    ],
  });
  schritte.push({
    titel: 'Ausgangsgleichung',
    zeilen: [
      { text: Q.istNull(d) ? 'v(t) = cᵀ·x_R(t)' : 'v(t) = cᵀ·x_R(t) + d·u(t)', strong: true },
      { text: `Ausgangsvektor cᵀ = [${liste(bb, n)}]:`, matrix: [ctext] },
      { text: Q.istNull(d) ? 'd = 0 (nicht sprungfähig, kein Durchgang)' : `Durchgang d = ${dtext}`, strong: !Q.istNull(d) },
    ],
  });

  // 7. Dimensionen
  schritte.push({
    titel: 'Dimensionen (hier)',
    zeilen: [
      { text: `A (${n},${n}) oder (${n}×${n})` },
      { text: `B = b (${n},1) oder (${n}×1)` },
      { text: `C = cᵀ (1,${n}) oder (1×${n})` },
      { text: Q.istNull(d)
        ? 'D n.v. (D = 0) → die Matrix D heißt Durchgangsmatrix (auch Durchgriffsmatrix)'
        : `D = d = ${dtext}, (1,1) oder (1×1) → die Matrix D heißt Durchgangsmatrix (auch Durchgriffsmatrix)` },
    ],
  });

  // 8. SISO
  schritte.push({
    titel: 'Art des Systems',
    zeilen: [
      { text: 'Ein Eingang u(t) (p = 1) und ein Ausgang v(t) (q = 1) → SISO-System (Single Input und Single Output)', strong: true },
      { text: 'Weitere Arten: SIMO (Single Input → Multiple Output), MISO (Multiple Input → Single Output), MIMO (Multiple Input → Multiple Output).', muted: true },
    ],
  });

  // 9. Theorie MIMO (wird in K2 mit abgefragt)
  schritte.push({
    titel: 'Theorie: Zustandsraumdarstellung für MIMO-Systeme',
    zeilen: [
      { text: 'ẋ(t) = A·x(t) + B·u(t)', strong: true },
      { text: 'v(t) = C·x(t) + D·u(t)', strong: true },
      { text: 'u(t) Eingangsvektor (p,1) · v(t) Ausgangsvektor (q,1) · x(t), ẋ(t) Zustandsvektor und Ableitung (n,1)' },
      { text: 'A Systemmatrix/Dynamikmatrix (n,n) · B Eingangsmatrix (n,p) · C Ausgangsmatrix (q,n) · D Durchgangsmatrix/Durchgriffsmatrix (q,p)' },
      { text: 'Signalflussbild: u → [B] → (+) → ẋ → [∫] → x → [C] → (+) → v. Von x zurück über [A] auf den ersten Summenpunkt. Von u über [D] direkt auf den zweiten Summenpunkt. (Doppelpfeile = Vektoren)', muted: true },
      { text: 'SISO-Sonderfall: B = b (Spaltenvektor), C = cᵀ (Zeilenvektor), D = d (Skalar).', muted: true },
    ],
  });

  // Python tf2ss-Form (Ü08 A4) und BNF
  const python = {
    A: Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === 0 ? -Q.wert(A_[n - 1 - j]) : j === i - 1 ? 1 : 0))),
    B: Array.from({ length: n }, (_, i) => (i === 0 ? 1 : 0)),
    C: Array.from({ length: n }, (_, j) => c[n - 1 - j]),
    D: Q.wert(d),
  };
  const bnf = { A: A[0].map((_, j) => A.map((z) => z[j])), b: [...c], c: [...b], d: Q.wert(d) };
  if (input.extras) {
    schritte.push({
      titel: 'Zusatz: Beobachtungsnormalform (BNF)',
      zeilen: [
        { text: 'BNF = „transponierte“ RNF: A_B = A_Rᵀ, b_B = c, c_Bᵀ = bᵀ, d gleich', muted: true },
        { text: 'A_B =', matrix: Atext[0].map((_, j) => Atext.map((z) => z[j])) },
        { text: 'b_B:', matrix: ctext.map((x) => [x]) },
        { text: 'c_Bᵀ:', matrix: [b.map(String)] },
      ],
    });
    schritte.push({
      titel: 'Zusatz: Python control.tf2ss (Ü08 A4)',
      zeilen: [
        { text: 'Python nummeriert die Zustände umgekehrt: Koeffizienten in der ersten Zeile, Einsen unter der Diagonale. Gleiches System, andere Reihenfolge.', muted: true },
        { text: 'A (Python) =', matrix: python.A.map((z) => z.map(dez)) },
        { text: 'B (Python):', matrix: python.B.map((x) => [dez(x)]) },
        { text: 'C (Python):', matrix: [python.C.map(dez)] },
        { text: `Durchgang (Python) = ${dez(python.D)}` },
      ],
    });
  }

  // Probe: cᵀ(sI − A)⁻¹b + d = G(s) an einer Stelle
  const sProbe = 1;
  const Gwert = (s) => {
    const ev = (p) => p.reduceRight((acc, q) => acc * s + Q.wert(q), 0);
    return ev(Z) / ev(N);
  };
  let probeS = sProbe;
  while (!isFinite(Gwert(probeS)) || Math.abs(N.reduceRight((acc, q) => acc * probeS + Q.wert(q), 0)) < 1e-9) probeS += 1;
  const g1 = Gwert(probeS), s1 = ssWert(A, b, c, Q.wert(d), probeS);
  const ok = Math.abs(g1 - s1) <= 1e-9 * Math.max(1, Math.abs(g1));
  schritte.push({
    titel: 'Probe',
    zeilen: [{ text: `cᵀ(sI − A)⁻¹b + d bei s = ${probeS}: ${fmt(s1, 6)} · G(${probeS}) = ${fmt(g1, 6)} → ${ok ? 'stimmt ✓' : 'stimmt NICHT ✗'}`, muted: true }],
  });

  const fazit = `RNF mit n = ${n} ${n === 1 ? 'Zustand' : 'Zuständen'}: A (${n}×${n}), b (${n}×1), cᵀ (1×${n}), ${Q.istNull(d) ? 'D n.v. (d = 0)' : `d = ${dtext}`} → SISO`;
  return { schritte, fazit, n, m, A, b, c, d: Q.wert(d), Atext, btext: b.map(String), ctext, dtext, sprungfaehig, python, bnf, probeOk: ok };
}
