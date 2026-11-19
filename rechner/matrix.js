// Matrizen mit Rechenweg: Produkt A·B und B·A, Determinante (2×2, Sarrus, Laplace-Entwicklung), Inverse.
// Exakt mit Brüchen. Reine Rechnung, keine Oberfläche.
// Darstellung wie Musterlösung K3 A14 / Ü07 A2–A4 / Ü08 A3.

import { sub, fmt } from '../lib/poly.js';
import { Q, parseMatrix, dimText, matText } from '../lib/matrix-bruch.js';

const idx = (i, j) => sub(i + 1) + sub(j + 1);
const minor = (M, r, c) => M.filter((_, i) => i !== r).map((row) => row.filter((_, j) => j !== c));
const summe = (arr) => arr.reduce((a, b) => a.add(b), new Q(0));

/** Summen-Text "6 + 63" bzw. "−43 − 0": Vorzeichen sauber. */
function plusKette(werte) {
  return werte.map((w, k) => {
    const neg = w.z < 0;
    const abs = neg ? w.neg() : w;
    return k === 0 ? String(w) : (neg ? ' − ' : ' + ') + abs;
  }).join('');
}

// ---------- Produkt ----------

export function matMul(A, B) {
  return A.map((r) => B[0].map((_, j) => summe(r.map((a, k) => a.mul(B[k][j])))));
}

function produktSchritt(A, B, nA, nB) {
  const n = A.length, m = A[0].length, m2 = B.length, p = B[0].length;
  const titel = `${nA} · ${nB}`;
  if (m !== m2) {
    return {
      schritt: {
        titel: `${titel}: nicht definiert`,
        zeilen: [
          { text: `${nA} ${dimText(A)} · ${nB} ${dimText(B)}` },
          { text: `Spaltenzahl von ${nA} (${m}) ≠ Zeilenzahl von ${nB} (${m2}) → ${titel} ist nicht definiert.`, strong: true },
          { text: 'Regel: (n × m) · (m × p) = (n × p). Die inneren Zahlen müssen gleich sein.', muted: true },
        ],
      },
      C: null,
    };
  }
  const C = matMul(A, B);
  const zeilen = [
    { text: `${nA} ${dimText(A)} · ${nB} ${dimText(B)} = ${dimText(C)}   (innere Zahlen ${m} = ${m2} ✓)` },
    { text: `Element cᵢⱼ = Zeile i von ${nA} mal Spalte j von ${nB}: cᵢⱼ = Σₖ aᵢₖ · bₖⱼ`, muted: true },
  ];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      const prod = A[i].map((a, k) => `${a.fak()}·${B[k][j].fak()}`).join(' + ');
      const werte = A[i].map((a, k) => a.mul(B[k][j]));
      zeilen.push({ text: `c${idx(i, j)} = ${prod} = ${plusKette(werte)} = ${C[i][j]}`, indent: true });
    }
  }
  zeilen.push({ text: `${titel} =`, matrix: matText(C), strong: true });
  zeilen.push({ text: `Dimension: ${dimText(C)}  (${C.length} Zeilen, ${C[0].length} Spalten)`, strong: true });
  return { schritt: { titel: `${titel} berechnen`, zeilen }, C };
}

// ---------- Determinante ----------

export function detWert(M) {
  const n = M.length;
  if (n === 1) return M[0][0];
  if (n === 2) return M[0][0].mul(M[1][1]).sub(M[0][1].mul(M[1][0]));
  let r = new Q(0);
  for (let j = 0; j < n; j++) {
    if (M[0][j].isZero()) continue;
    const t = M[0][j].mul(detWert(minor(M, 0, j)));
    r = j % 2 ? r.sub(t) : r.add(t);
  }
  return r;
}

/** Zeile/Spalte mit den meisten Nullen (bei Gleichstand: Zeile vor Spalte, kleinerer Index). */
export function besteEntwicklung(M) {
  const n = M.length;
  let best = { art: 'zeile', k: 0, nullen: -1 };
  for (let k = 0; k < n; k++) {
    const z = M[k].filter((x) => x.isZero()).length;
    if (z > best.nullen) best = { art: 'zeile', k, nullen: z };
  }
  for (let k = 0; k < n; k++) {
    const z = M.filter((r) => r[k].isZero()).length;
    if (z > best.nullen) best = { art: 'spalte', k, nullen: z };
  }
  return best;
}

function det2Zeilen(M, label) {
  const [[a, b], [c, d]] = M;
  const v = detWert(M);
  return [{ text: `${label} = ${a.fak()}·${d.fak()} − ${c.fak()}·${b.fak()} = ${a.mul(d)} − ${c.mul(b).fak()} = ${v}` }];
}

function sarrusZeilen(M, label) {
  const [[a1, b1, c1], [a2, b2, c2], [a3, b3, c3]] = M;
  const plus = [[a1, b2, c3], [a2, b3, c1], [a3, b1, c2]];
  const minus = [[c1, b2, a3], [c2, b3, a1], [c3, b1, a2]];
  const pr = (t) => t.map((x) => x.fak()).join('·');
  const val = (t) => t[0].mul(t[1]).mul(t[2]);
  const pv = plus.map(val), mv = minus.map(val);
  const v = detWert(M);
  return [
    { text: 'Regel von Sarrus: die ersten beiden Zeilen unter die Determinante schreiben, die drei Dreierprodukte längs der Hauptdiagonalen (↘) addieren, die drei längs der Nebendiagonalen (↙) subtrahieren.', muted: true },
    { text: `${label} = a₁b₂c₃ + a₂b₃c₁ + a₃b₁c₂ − c₁b₂a₃ − c₂b₃a₁ − c₃b₁a₂`, muted: true },
    { text: 'Schema (Spalten a, b, c; Zeilen 1, 2 unten wiederholt):', matrix: [...M, M[0], M[1]].map((r) => r.map(String)) },
    { text: `${label} = ${plus.map(pr).join(' + ')} − ${minus.map(pr).join(' − ')}` },
    { text: `${label} = ${plusKette(pv)} − (${plusKette(mv)})` },
    { text: `${label} = ${summe(pv)} − ${summe(mv).fak()} = ${v}`, strong: true },
  ];
}

/**
 * Laplace-Entwicklung mit Rechenweg. wahl: {art:'zeile'|'spalte', k} oder null (= automatisch, meiste Nullen).
 * Unterdeterminanten 2×2 direkt, größere wieder per Laplace (automatisch).
 */
function laplaceZeilen(M, label, wahl, tiefe = 0) {
  const n = M.length;
  const w = wahl || besteEntwicklung(M);
  const nr = w.k + 1;
  const zeilen = [];
  const pos = (t) => (w.art === 'zeile' ? [w.k, t] : [t, w.k]);
  zeilen.push({
    text: `${label}: Entwicklung nach der ${nr}. ${w.art === 'zeile' ? 'Zeile' : 'Spalte'}${wahl ? '' : ' (dort sind die meisten Nullen)'}`,
    strong: tiefe === 0,
  });
  zeilen.push({ text: 'Vorzeichen nach Schachbrett (−1)^(i+j):', muted: true, matrix: Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => ((i + j) % 2 ? '−' : '+'))) });
  const terme = [];
  for (let t = 0; t < n; t++) {
    const [i, j] = pos(t);
    const a = M[i][j];
    const vz = (i + j) % 2 ? -1 : 1;
    if (a.isZero()) { terme.push({ i, j, a, vz, null: true }); continue; }
    const U = minor(M, i, j);
    terme.push({ i, j, a, vz, U, d: detWert(U), name: 'D' + idx(i, j) });
  }
  const s = (vz, k) => (vz < 0 ? (k === 0 ? '−' : ' − ') : (k === 0 ? '' : ' + '));
  const nz = terme.filter((t) => !t.null);
  zeilen.push({
    text: `${label} = ` + terme.map((t, k) => `${s(t.vz, k)}${t.a.fak()}·D${idx(t.i, t.j)}`).join(''),
  });
  if (nz.length < n) zeilen.push({ text: `Einträge = 0 fallen weg: ${label} = ` + (nz.length ? nz.map((t, k) => `${s(t.vz, k)}${t.a.fak()}·${t.name}`).join('') : '0'), indent: true });
  for (const t of nz) {
    zeilen.push({ text: `${t.name}: Zeile ${t.i + 1} und Spalte ${t.j + 1} streichen`, matrix: matText(t.U), indent: true });
    if (t.U.length === 1) zeilen.push({ text: `${t.name} = ${t.d}`, indent: true });
    else if (t.U.length === 2) zeilen.push(...det2Zeilen(t.U, t.name).map((z) => ({ ...z, indent: true })));
    else zeilen.push(...laplaceZeilen(t.U, t.name, null, tiefe + 1).map((z) => ({ ...z, indent: true })));
  }
  const v = detWert(M);
  const prod = nz.map((t) => t.a.mul(t.d).mul(t.vz));
  zeilen.push({
    text: `${label} = ` + (nz.length ? nz.map((t, k) => `${s(t.vz, k)}${t.a.fak()}·${t.d.fak()}`).join('') + (nz.length > 1 ? ` = ${plusKette(prod)}` : '') : '0') + ` = ${v}`,
    strong: true,
  });
  return zeilen;
}

function detSchritte(M, name, methode) {
  const n = M.length, m = M[0].length;
  if (n !== m) throw new Error(`Determinante gibt es nur für quadratische Matrizen. ${name} ist ${dimText(M)}.`);
  const label = `det(${name})`;
  let zeilen, titel;
  if (n === 1) { zeilen = [{ text: `${label} = ${M[0][0]}`, strong: true }]; titel = 'Determinante'; }
  else if (n === 2) {
    titel = 'Determinante (2×2): Hauptdiagonale minus Nebendiagonale';
    zeilen = [{ text: `${label} = |a b; c d| = a·d − c·b`, muted: true }, ...det2Zeilen(M, label)];
    zeilen[zeilen.length - 1].strong = true;
  } else if (methode === 'sarrus') {
    if (n !== 3) throw new Error('Sarrus gilt nur für 3×3-Matrizen. Für größere: Laplace-Entwicklung.');
    titel = 'Determinante nach Sarrus';
    zeilen = sarrusZeilen(M, label);
  } else {
    let wahl = null;
    const mm = /^(zeile|spalte)(\d+)$/.exec(methode || '');
    if (mm) {
      const k = +mm[2] - 1;
      if (k >= n) throw new Error(`Die Matrix hat nur ${n} ${mm[1] === 'zeile' ? 'Zeilen' : 'Spalten'}.`);
      wahl = { art: mm[1], k };
    }
    titel = 'Determinante mit Laplace-Entwicklung';
    zeilen = laplaceZeilen(M, label, wahl);
  }
  return { schritt: { titel, zeilen }, det: detWert(M) };
}

// ---------- Inverse ----------

export function inverse(M) {
  const n = M.length;
  const d = detWert(M);
  if (d.isZero()) return null;
  if (n === 1) return [[new Q(1).div(M[0][0])]];
  if (n === 2) {
    const [[a, b], [c, dd]] = M;
    return [[dd, b.neg()], [c.neg(), a]].map((r) => r.map((x) => x.div(d)));
  }
  // Adjunkte: Kofaktoren, transponiert
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => {
    const k = detWert(minor(M, j, i));
    return ((i + j) % 2 ? k.neg() : k).div(d);
  }));
}

function inverseSchritte(M, name) {
  const n = M.length;
  if (n !== M[0].length) throw new Error(`Inverse gibt es nur für quadratische Matrizen. ${name} ist ${dimText(M)}.`);
  if (n > 3) throw new Error('Inverse hier nur für 2×2 und 3×3.');
  const schritte = [];
  const ds = detSchritte(M, name, n === 3 ? 'sarrus' : null);
  ds.schritt.titel = `Zuerst die Determinante (ohne det ≠ 0 keine Inverse)`;
  schritte.push(ds.schritt);
  const d = ds.det;
  if (d.isZero()) {
    schritte.push({ titel: 'Ergebnis', zeilen: [{ text: `det(${name}) = 0 → ${name} ist nicht invertierbar (singulär).`, strong: true }] });
    return { schritte, inv: null, det: d };
  }
  const inv = inverse(M);
  const zeilen = [];
  if (n === 2) {
    const [[a, b], [c, dd]] = M;
    zeilen.push({ text: `Formel: (a b; c d)⁻¹ = 1/det · ( d  −b ; −c  a )   (Hauptdiagonale tauschen, Nebendiagonale Vorzeichen wechseln)`, muted: true });
    const adj = [[dd, b.neg()], [c.neg(), a]];
    zeilen.push({ text: `${name}⁻¹ = 1/${d.fak()} ·`, matrix: matText(adj) });
    if (!d.isInt() || Math.abs(d.z) !== 1) {
      // Jeden Eintrag durch det teilen, erst ungekürzt (wie Musterlösung Ü07 A3: −12/27), dann gekürzt
      const roh = adj.map((r) => r.map((x) => {
        const q = x.div(d);
        if (!x.isInt() || !d.isInt() || x.isZero()) return String(q);
        const neg = q.z < 0;
        return (neg ? '−' : '') + Math.abs(x.z) + '/' + Math.abs(d.z);
      }));
      zeilen.push({ text: `Jeden Eintrag durch ${d} teilen (Vorzeichen beachten):`, matrix: roh });
    }
  } else {
    zeilen.push({ text: `Formel: ${name}⁻¹ = 1/det(${name}) · adj(${name}),  adj = transponierte Matrix der Kofaktoren Kᵢⱼ = (−1)^(i+j)·Dᵢⱼ`, muted: true });
    const K = Array.from({ length: n }, () => []);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const U = minor(M, i, j);
      const du = detWert(U);
      const k = (i + j) % 2 ? du.neg() : du;
      K[i][j] = k;
      const [[p, q], [r, s]] = U;
      zeilen.push({ text: `K${idx(i, j)} = ${(i + j) % 2 ? '−' : '+'}(${p.fak()}·${s.fak()} − ${r.fak()}·${q.fak()}) = ${k}`, indent: true });
    }
    zeilen.push({ text: 'Kofaktor-Matrix K =', matrix: matText(K) });
    const adj = K[0].map((_, j) => K.map((r) => r[j]));
    zeilen.push({ text: `adj(${name}) = Kᵀ (Zeilen und Spalten tauschen) =`, matrix: matText(adj) });
    zeilen.push({ text: `${name}⁻¹ = 1/${d.fak()} · adj(${name})` });
  }
  zeilen.push({ text: `${name}⁻¹ =`, matrix: matText(inv), strong: true });
  if (inv.flat().some((x) => !x.isInt())) zeilen.push({ text: 'als Dezimalzahl:', matrix: inv.map((r) => r.map((x) => fmt(x.wert, 4))) });
  schritte.push({ titel: n === 2 ? 'Inverse (2×2): 1/det · adj' : 'Inverse (3×3): 1/det · Adjunkte', zeilen });
  const E = matMul(M, inv);
  schritte.push({
    titel: 'Probe',
    zeilen: [{ text: `${name} · ${name}⁻¹ =`, matrix: matText(E) }, { text: E.every((r, i) => r.every((x, j) => x.wert === (i === j ? 1 : 0))) ? '= E (Einheitsmatrix) ✓' : 'Probe stimmt nicht!', strong: true }],
  });
  return { schritte, inv, det: d };
}

// ---------- Einstieg ----------

const zahlen = (M) => M && M.map((r) => r.map((x) => x.wert));

/**
 * Eingabe:
 *   { modus: 'produkt', A: '3 7; 5 9; 4 5', B: '2 3 5; 9 3 7' }
 *   { modus: 'det', M: '3 7 19; 0 0 2; 4 5 12', methode: 'auto'|'sarrus'|'zeile2'|'spalte3', name?: 'C' }
 *   { modus: 'inverse', M: '3 1; 5 2', name?: 'D' }
 */
export function matrix(input) {
  const schritte = [];
  if (input.modus === 'produkt') {
    const A = parseMatrix(input.A), B = parseMatrix(input.B);
    schritte.push({
      titel: 'Matrizen und Dimensionen (Zeilen × Spalten)',
      zeilen: [{ text: `A ${dimText(A)} =`, matrix: matText(A) }, { text: `B ${dimText(B)} =`, matrix: matText(B) }],
    });
    const ab = produktSchritt(A, B, 'A', 'B');
    const ba = produktSchritt(B, A, 'B', 'A');
    schritte.push(ab.schritt, ba.schritt);
    const t = (C, n) => (C ? `${n} ${dimText(C)}` : `${n} nicht definiert`);
    const fazit = `${t(ab.C, 'A·B')} · ${t(ba.C, 'B·A')}`;
    schritte.push({ titel: 'Ergebnis', zeilen: [{ text: fazit, strong: true }, { text: 'Allgemein gilt A·B ≠ B·A (Matrixprodukt ist nicht kommutativ).', muted: true }] });
    return { schritte, fazit, AB: zahlen(ab.C), BA: zahlen(ba.C) };
  }
  const name = input.name || 'A';
  const M = parseMatrix(input.M);
  schritte.push({ titel: 'Matrix', zeilen: [{ text: `${name} ${dimText(M)} =`, matrix: matText(M) }] });
  if (input.modus === 'det') {
    const ds = detSchritte(M, name, input.methode === 'auto' ? null : input.methode);
    schritte.push(ds.schritt);
    const fazit = `det(${name}) = ${ds.det.mitDez()}`;
    return { schritte, fazit, det: ds.det.wert };
  }
  if (input.modus === 'inverse') {
    const r = inverseSchritte(M, name);
    schritte.push(...r.schritte);
    const fazit = r.inv ? `det(${name}) = ${r.det},  ${name}⁻¹ = ( ${matText(r.inv).map((z) => z.join('  ')).join(' ; ')} )` : `det(${name}) = 0 → keine Inverse`;
    return { schritte, fazit, det: r.det.wert, inv: zahlen(r.inv), invText: r.inv && matText(r.inv) };
  }
  throw new Error('Unbekannter Modus.');
}
