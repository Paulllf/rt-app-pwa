// Regelkreis mit Störung zwischen G₁ und G₂: G₀, G_W, G_Z, E(s), Endwertsatz.
// Darstellung wie in der Musterlösung K1/K2 Aufgabe 15 (Ruhland). Zweiter Modus: Vorfilter/Vorsteuerung (Ü07 A1).
// Reine Rechnung, keine Oberfläche.

import { K, BP, fmt, sup, bfmt } from '../lib/poly.js';
import {
  parseRat, mulR, divR, kuerzen, mulF, polyF, gruppe, fmtF, fmtR, fmtRExp, klammer,
  einsetzenF, wertF0, grenzwert, nullstellen,
} from '../lib/regelkreis-rational.js';

const LIM = 'lim(s→0)';

function lies(text, name) {
  if (!String(text ?? '').trim()) throw new Error(`Bitte ${name} eingeben.`);
  try { return parseRat(text); }
  catch (e) { throw new Error(`${name}: ${e.message}`); }
}

const bruch = (num, den) => klammer(fmtF(num)) + ' / ' + klammer(fmtF(den));

/** Deutung eines Grenzwerts für den Rechenweg. */
function deutung(g) {
  if (g.art === 'null') return 'stationär genau';
  if (g.art === 'endlich') return 'bleibende Regelabweichung → nicht stationär genau';
  return 'e(t) wächst über alle Grenzen → nicht stationär genau';
}

/**
 * Rechenweg-Zeilen für lim s→0 von s · (vz · num/den) · 1/sᵐ.
 * label: "G_E(s)" · wTxt: "1/s²" · den ist der Faktor (N₀ + Z₀).
 */
function grenzZeilen(label, wTxt, m, vz, num, den) {
  const h = 1 - m; // Potenz von s nach dem Multiplizieren mit s
  const z = [];
  const minus = vz < 0 ? '−' : '';
  const sPot = (k) => 's' + (k > 1 ? sup(k) : '');
  const vor = h === 0 ? '' : h > 0 ? sPot(h) + ' · ' : '1/' + sPot(-h) + ' · ';
  z.push({ text: `${LIM} s · ${label} · ${wTxt} = ${LIM} ${vor}${minus}${bruch(num, den)}` });

  let n2 = num, d2 = den, sUnten = 0;
  if (h !== 0) {
    const neu = num.s + h;
    if (neu >= 0) n2 = { ...num, s: neu };
    else { n2 = { ...num, s: 0 }; sUnten = -neu; }
    if (h < 0) {
      const gek = Math.min(num.s, -h);
      if (gek > 0) z.push({ text: `${sPot(gek)} kürzen: = ${LIM} ${sUnten ? '1/' + sPot(sUnten) + ' · ' : ''}${minus}${bruch(n2, d2)}` });
    } else {
      z.push({ text: `= ${LIM} ${minus}${bruch(n2, d2)}` });
    }
  }

  const P = BP.scale(polyF(n2), vz);
  const Q = polyF(d2);
  const g = grenzwert(P, Q, -sUnten);
  const nenner0 = wertF0(d2);
  if (K.isZero(nenner0)) {
    z.push({ text: 'Nenner wird bei s = 0 zu 0 → niedrigste s-Potenzen von Zähler und Nenner vergleichen.', muted: true });
    z.push({ text: `= ${g.text}`, strong: true });
  } else if (sUnten) {
    z.push({ text: `s = 0 einsetzen: ${minus}${klammer(einsetzenF(n2))} / (0 · ${klammer(einsetzenF(d2))}) → ${minus}${einsetzenF(n2)}/0 → e∞ = ${g.text}`, strong: true });
  } else {
    z.push({ text: `s = 0 einsetzen: = ${minus}${klammer(einsetzenF(n2))} / ${klammer(einsetzenF(d2))} = ${g.text}`, strong: true });
  }
  z.push({ text: `→ ${deutung(g)}` });
  return { zeilen: z, g };
}

/** Pole des geschlossenen Kreises als Text. */
function polText(p) {
  const r = Math.abs(p[0]) < 1e-9 ? 0 : p[0];
  if (Math.abs(p[1]) < 1e-7) return fmt(r, 4);
  return `${fmt(r, 4)} ${p[1] < 0 ? '−' : '+'} ${fmt(Math.abs(p[1]), 4)}j`;
}

export function regelkreis(input) {
  if (input.modus === 'vorfilter') return vorfilter(input);

  const R = lies(input.R, 'R(s)');
  const G1 = lies(input.G1, 'G₁(s)');
  const G2 = lies(input.G2, 'G₂(s)');
  const schritte = [];

  // 1. Gegebenes System
  schritte.push({
    titel: 'Gegebenes System',
    zeilen: [
      { text: 'Störung Z(s) greift zwischen G₁ und G₂ an, Rückführung −X auf den Eingang (Standardregelkreis).', muted: true },
      { text: `R(s) = ${fmtR(R)}    G₁(s) = ${fmtR(G1)}    G₂(s) = ${fmtR(G2)}` },
      { text: 'X = R·G₁·G₂ / (1 + R·G₁·G₂) · W + G₂ / (1 + R·G₁·G₂) · Z' },
      { text: 'G_W = R·G₁·G₂ / (1 + R·G₁·G₂)    Führungsübertragungsfunktion', strong: true },
      { text: 'G_Z = G₂ / (1 + R·G₁·G₂)    Störübertragungsfunktion', strong: true },
    ],
  });

  // 2. Offener Kreis und G_W, G_Z einsetzen
  const roh = { num: mulF(mulF(R.num, G1.num), G2.num), den: mulF(mulF(R.den, G1.den), G2.den) };
  const G0 = kuerzen(roh);
  const Z0 = G0.num, N0 = G0.den;
  const sumP = BP.add(polyF(N0), polyF(Z0));
  if (BP.trim(sumP).length === 1 && K.isZero(BP.trim(sumP)[0])) throw new Error('N₀ + Z₀ = 0: kein sinnvoller Regelkreis.');
  const summe = gruppe(sumP, `${fmtF(N0)} + ${fmtF(Z0)}`, [N0, Z0]);
  // gruppe() zieht bei Teilen nichts heraus → Faktorliste mit genau einer Klammer
  const D = summe.g.length ? { c: [1], s: 0, g: summe.g } : summe;

  const z2 = [
    { text: `G₀(s) = R·G₁·G₂ = ${fmtR(R, '/')} · ${fmtR(G1, '/')} · ${fmtR(G2, '/')} = ${bruch(roh.num, roh.den)}` },
  ];
  if (G0.weg.length) z2.push({ text: `Kürzen (${G0.weg.join(', ')}): G₀(s) = ${bruch(Z0, N0)}` });
  z2.push({ text: `G₀ = Z₀/N₀ mit Z₀ = ${fmtF(Z0)},  N₀ = ${fmtF(N0)}` });

  const GW = { num: Z0, den: D };
  z2.push({ text: `G_W(s) = G₀/(1 + G₀) = Z₀/(N₀ + Z₀) = ${bruch(Z0, D)}`, strong: true });
  if (fmtRExp(GW) !== bruch(Z0, D)) z2.push({ text: `= ${fmtRExp(GW)}`, indent: true });

  const GZroh = { num: mulF(G2.num, N0), den: mulF(G2.den, D) };
  const GZ = kuerzen(GZroh);
  z2.push({ text: `G_Z(s) = G₂/(1 + G₀) = G₂·N₀/(N₀ + Z₀) = ${fmtR(G2, '/')} · ${klammer(fmtF(N0))} / ${klammer(fmtF(D))}` });
  if (GZ.weg.length) z2.push({ text: `Kürzen (${GZ.weg.join(', ')}): G_Z(s) = ${bruch(GZ.num, GZ.den)}`, strong: true });
  else z2.push({ text: `G_Z(s) = ${bruch(GZ.num, GZ.den)}`, strong: true });
  if (fmtRExp(GZ) !== bruch(GZ.num, GZ.den)) z2.push({ text: `= ${fmtRExp(GZ)}`, indent: true });
  schritte.push({ titel: 'Übertragungsfunktionen einsetzen', zeilen: z2 });

  // 3. Regelabweichung im Bildbereich
  schritte.push({
    titel: 'Regelabweichung (Bildbereich) – Störung Null',
    zeilen: [
      { text: 'G(s) = G₁(s)·G₂(s)', muted: true },
      { text: 'E = W − X = W · (1 − RG/(1 + RG)) = W · 1/(1 + RG)' },
      { text: 'mit G₀ = R·G = Z₀/N₀' },
      { text: 'E = 1/(1 + RG) · W = 1/(1 + G₀) · W = N₀/(N₀ + Z₀) · W', strong: true },
    ],
  });

  // 4. Einsetzen, Endwertsatz
  const GE = kuerzen({ num: N0, den: D });
  schritte.push({
    titel: 'Einsetzen der Übertragungsfunktionen (Z = 0)',
    zeilen: [
      { text: `E(s) = N₀/(N₀ + Z₀) · W(s) = ${bruch(GE.num, GE.den)} · W(s)`, strong: true },
      { text: `G_E(s) = ${bruch(GE.num, GE.den)}  (= ${fmtRExp(GE)})`, indent: true },
      { text: 'Endwertsatz der Laplace-Transformation:' },
      { text: `lim(t→∞) e(t) = ${LIM} s·E(s) = ${LIM} s·G_E(s)·W(s)`, strong: true },
    ],
  });

  // 5.–7. Führungsgrößen
  const fuehrung = [
    ['sprung', 'W(s) = Sprungfunktion', 'w(t) = σ(t) ○—● W(s) = 1/s', 1, '1/s'],
    ['rampe', 'W(s) = Rampe', 'w(t) = t ○—● W(s) = 1/s²', 2, '1/s²'],
    ['parabel', 'W(s) = Parabel', 'w(t) = t²/2 ○—● W(s) = 1/s³', 3, '1/s³'],
  ];
  const e = {};
  for (const [key, titel, korr, m, wTxt] of fuehrung) {
    const { zeilen, g } = grenzZeilen('G_E(s)', wTxt, m, 1, GE.num, GE.den);
    e[key] = g;
    const extra = key === 'parabel'
      ? [{ text: 'Steht in der Aufgabe w(t) = t² (ohne /2): W(s) = 2/s³ → Ergebnis × 2.', muted: true }]
      : [];
    schritte.push({ titel, zeilen: [{ text: korr }, ...zeilen, ...extra] });
  }

  // 8. Störgröße
  const GeZ = kuerzen({ num: mulF(G2.num, N0), den: mulF(G2.den, D) });
  const zStoer = [
    { text: 'E(s) = W(s) − X(s) = W(s) − [G_W(s)W(s) + G_Z(s)Z(s)]' },
    { text: 'E(s) = W(s)[1 − G_W(s)] − G_Z(s)Z(s),  mit W = 0 fällt der erste Teil weg (= 0)' },
    { text: 'E(s) = −G_Z(s)Z(s) = −G₂(s) / (1 + R(s)G₁(s)G₂(s)) · Z(s)', strong: true },
    { text: `E(s)/Z(s) = G_e,Z(s) = −G₂/(1 + R·G₁·G₂) = −${bruch(GeZ.num, GeZ.den)}` },
    { text: 'Z(s) = 1/s  (z(t) = σ(t))' },
  ];
  const st = grenzZeilen('G_e,Z(s)', '1/s', 1, -1, GeZ.num, GeZ.den);
  e.stoerSprung = st.g;
  zStoer.push(...st.zeilen);
  if (st.g.art === 'null') zStoer.push({ text: 'Stationär genau für sprungförmige Störgrößen.', strong: true });
  schritte.push({ titel: 'Führungsgröße w(t) = 0, Störgröße → Einheitssprung', zeilen: zStoer });

  const sr = grenzZeilen('G_e,Z(s)', '1/s²', 2, -1, GeZ.num, GeZ.den);
  e.stoerRampe = sr.g;
  schritte.push({ titel: 'Zusatz: Störgröße als Rampe z(t) = t', zeilen: [{ text: 'Z(s) = 1/s²', muted: true }, ...sr.zeilen] });

  // 9. Wissen: Typ des Regelkreises
  const typ = N0.s - Z0.s;
  const ohneS = (F) => ({ ...F, s: 0 });
  const k0 = (() => {
    const a = wertF0(ohneS(Z0)), b = wertF0(ohneS(N0));
    return K.isConst(a) && K.isConst(b) ? fmt(a[0] / b[0]) : null;
  })();
  const RG1 = kuerzen({ num: mulF(R.num, G1.num), den: mulF(R.den, G1.den) });
  const typZ = RG1.den.s - RG1.num.s;
  const tabelle = typ <= 0
    ? 'Sprung → 1/(1+K) (bleibt), Rampe → ∞, Parabel → ∞'
    : typ === 1 ? 'Sprung → 0, Rampe → 1/K, Parabel → ∞'
    : typ === 2 ? 'Sprung → 0, Rampe → 0, Parabel → 1/K'
    : 'Sprung, Rampe und Parabel → 0';
  schritte.push({
    titel: 'Stationäre Genauigkeit (Wissen)',
    zeilen: [
      { text: typ <= 0
        ? `Im offenen Kreis G₀ gibt es keinen Integrator (kein Faktor 1/s) → Regelkreis Typ 0.`
        : `Im offenen Kreis G₀ gibt es ${typ === 1 ? '1 Integrator' : typ + ' Integratoren'} (Faktor 1/s${typ > 1 ? sup(typ) : ''} in G₀) → Regelkreis Typ ${typ}.` },
      ...(k0 !== null ? [{ text: `K = Verstärkung des offenen Kreises = ${k0}`, muted: true }] : []),
      { text: `Laut Tabelle (Führung): ${tabelle}.` },
      { text: 'Das Modell des Führungssignals muss im offenen Kreis enthalten sein: Sprung 1/s braucht ≥ 1 Integrator, Rampe 1/s² ≥ 2, Parabel 1/s³ ≥ 3.' },
      { text: `Störung (greift hinter R·G₁ an): Integratoren in R·G₁ = ${Math.max(typZ, 0)} → Störsprung ${typZ >= 1 ? 'wird ausgeregelt (e∞ = 0)' : 'bleibt als Regelabweichung'}.` },
      { text: 'Allgemein: Ein I-Anteil im Regler macht den Kreis stationär genau für Sprünge (Führung und Störung).', muted: true },
    ],
  });

  // 10. Gegenprobe Stabilität
  let stabil = null, pole = null;
  if (!BP.hasParam(sumP)) {
    pole = nullstellen(BP.trim(sumP).map((k) => k[0])).sort((a, b) => b[0] - a[0] || b[1] - a[1]);
    stabil = pole.every((p) => p[0] < -1e-9);
    const grenz = !stabil && pole.every((p) => p[0] < 1e-7);
    schritte.push({
      titel: 'Gegenprobe: Darf man den Endwertsatz anwenden?',
      zeilen: [
        { text: `Charakteristisches Polynom N₀ + Z₀ = ${bfmt(sumP, 'K')}` },
        { text: `Pole des geschlossenen Kreises: ${pole.map(polText).join(';  ')}` },
        stabil
          ? { text: 'Alle Pole links → geschlossener Kreis stabil, Endwertsatz gilt.' }
          : grenz
          ? { text: 'Pole auf der imaginären Achse → geschlossener Kreis grenzstabil (Dauerschwingung). Streng genommen gilt der Endwertsatz dann nicht. Die Musterlösung prüft das nicht; für die Klausur die Werte oben übernehmen.', muted: true }
          : { text: 'Nicht alle Pole links → geschlossener Kreis instabil. Streng genommen gilt der Endwertsatz dann nicht. Die Musterlösung (K1/K2 A15) prüft das nicht; für die Klausur die Werte oben übernehmen.', muted: true },
      ],
    });
  }

  const kurz = (g) => g.text.replace(/ ≈ .*/, '');
  const fazit = `e∞: Sprung ${kurz(e.sprung)} · Rampe ${kurz(e.rampe)} · Parabel ${kurz(e.parabel)} · Störsprung ${kurz(e.stoerSprung)}`;

  return {
    schritte, fazit, e, typ, typZ, stabil, pole,
    G0: { num: polyF(Z0), den: polyF(N0) },
    GW: { num: polyF(GW.num), den: polyF(GW.den) },
    GZ: { num: polyF(GZ.num), den: polyF(GZ.den) },
    GE: { num: polyF(GE.num), den: polyF(GE.den) },
    GeZ: { num: BP.neg(polyF(GeZ.num)), den: polyF(GeZ.den) },
  };
}

function vorfilter(input) {
  const G = lies(input.G, 'G(s)');
  const W = lies(input.Gwun, 'G_wun(s)');
  const S2 = divR(W, G);
  const schritte = [
    {
      titel: 'Formel für Vorfilter S₁(s) und Vorsteuerung S₂(s)',
      zeilen: [
        { text: 'S₁(s) = G_wun(s)', strong: true },
        { text: 'S₂(s) = G_wun(s) / G(s)', strong: true },
      ],
    },
    {
      titel: 'Einsetzen',
      zeilen: [
        { text: `G(s) = ${fmtR(G)}    G_wun(s) = ${fmtR(W)}` },
        { text: `S₁(s) = ${fmtR(W)}` },
        { text: `= ${fmtRExp(W)}`, strong: true, indent: true },
        { text: `S₂(s) = G_wun/G = ${fmtR(W, '/')} · ${klammer(fmtR({ num: G.den, den: G.num }, '/'))} = ${fmtR(S2)}` },
        { text: `= ${fmtRExp(S2)}`, strong: true, indent: true },
      ],
    },
  ];
  const gz = BP.deg(polyF(S2.num)), gn = BP.deg(polyF(S2.den));
  schritte.push({
    titel: 'Realisierbarkeit',
    zeilen: [{
      text: gz <= gn
        ? `S₂: Zählergrad ${gz} ≤ Nennergrad ${gn} → realisierbar.`
        : `S₂: Zählergrad ${gz} > Nennergrad ${gn} → so nicht realisierbar (G_wun muss mindestens so stark verzögern wie G).`,
      muted: gz <= gn,
    }],
  });
  return {
    schritte,
    fazit: `S₁ = ${fmtRExp(W)} · S₂ = ${fmtRExp(S2)}`,
    S1: { num: polyF(W.num), den: polyF(W.den) },
    S2: { num: polyF(S2.num), den: polyF(S2.den) },
  };
}
