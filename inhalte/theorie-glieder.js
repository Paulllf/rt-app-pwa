// Musterantworten – Format: tools/inhalte-format.md
// Grundglieder, PID, Signalfluss, Hurwitz, Stabilität, stationäre Genauigkeit, PBZ, Kennwerte, Güte, Pol-Nullstellen.
// Die Skizzen werden unten aus kleinen Hilfsfunktionen zusammengesetzt (nur currentColor, kein Skript, kein Link).

// ---------- Hilfsfunktionen für Skizzen ----------
const n1 = (x) => (Math.round(x * 10) / 10).toString();
const txt = (x, y, s, anker = 'start', gr = 12) =>
  `<text x="${x}" y="${y}" font-family="sans-serif" font-size="${gr}" text-anchor="${anker}" fill="currentColor">${s}</text>`;
const lin = (x1, y1, x2, y2, extra = '') =>
  `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" stroke="currentColor" stroke-width="1.5" ${extra}/>`;
const gestr = (x1, y1, x2, y2) => lin(x1, y1, x2, y2, 'stroke-dasharray="4 3" stroke-width="1"');
const pfeil = (x1, y1, x2, y2) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - 7 * Math.cos(a), by = y2 - 7 * Math.sin(a);
  const px = -Math.sin(a) * 3, py = Math.cos(a) * 3;
  return lin(x1, y1, bx, by) +
    `<polygon points="${n1(x2)},${n1(y2)} ${n1(bx + px)},${n1(by + py)} ${n1(bx - px)},${n1(by - py)}" fill="currentColor"/>`;
};
const kasten = (x, y, b, h, s) =>
  `<rect x="${x}" y="${y}" width="${b}" height="${h}" fill="none" stroke="currentColor" stroke-width="1.5"/>` +
  txt(x + b / 2, y + h / 2 + 4, s, 'middle', 14);
const kreis = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
const punkt = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="2.5" fill="currentColor"/>`;
const kurve = (pts) => `<polyline points="${pts.map(([x, y]) => `${n1(x)},${n1(y)}`).join(' ')}" fill="none" stroke="currentColor" stroke-width="2"/>`;

// Diagramm h(t): Ursprung (35,115), x-Achse bis 210, y-Achse bis 10
const OX = 35, OY = 115;
function diagramm(inhalt, breite = 225) {
  return `<svg viewBox="0 0 ${breite} 135" xmlns="http://www.w3.org/2000/svg">` +
    pfeil(OX, OY, breite - 12, OY) + pfeil(OX, OY, OX, 8) +
    txt(breite - 10, OY + 4, 't') + txt(OX + 6, 14, 'h(t)') + inhalt + '</svg>';
}
const verlauf = (f, t0, t1, sx, sy, schritte = 60) => {
  const p = [];
  for (let i = 0; i <= schritte; i++) { const t = t0 + (t1 - t0) * i / schritte; p.push([OX + t * sx, OY - f(t) * sy]); }
  return kurve(p);
};

// ---------- Grundglieder ----------
const svgP = diagramm(
  gestr(OX, 85, 205, 85) + txt(208, 82, '1', 'start', 11) + txt(150, 78, 'σ(t) = 1', 'middle', 11) +
  kurve([[OX, OY], [OX, 50], [205, 50]]) + gestr(OX, 50, 205, 50) + txt(OX - 5, 54, 'K', 'end', 13) +
  txt(150, 43, 'h(t) = K·σ(t)', 'middle', 11));

const svgI = diagramm(
  gestr(OX, 85, 205, 85) + txt(208, 82, '1', 'start', 11) +
  kurve([[OX, OY], [200, 35]]) + gestr(93, 85, 93, OY) + txt(93, OY + 13, '1/K_I', 'middle', 11) +
  txt(52, 30, 'h(t) = K_I·t', 'start', 11) + txt(112, 106, 'Steigung K_I', 'start', 11));

const svgD = diagramm(
  pfeil(OX + 5, OY, OX + 5, 20) + txt(OX + 14, 28, 'h(t) = K_D·δ(t)', 'start', 11) +
  txt(OX + 14, 44, '(Impuls bei t = 0, danach 0)', 'start', 10));

const svgPT1 = diagramm(
  gestr(OX, 40, 205, 40) + txt(OX - 5, 44, 'K', 'end', 13) +
  verlauf((t) => 1 - Math.exp(-t), 0, 5.6, 30, 75) +
  gestr(OX, OY, OX + 30, 40) + gestr(OX + 30, 40, OX + 30, OY) + txt(OX + 30, OY + 13, 'T', 'middle', 12) +
  gestr(OX, 115 - 0.632 * 75, OX + 30, 115 - 0.632 * 75) + txt(OX + 34, 115 - 0.632 * 75 + 18, '0,63·K', 'start', 10) +
  txt(135, 100, 'h(t) = K·(1 − e^(−t/T))', 'middle', 11));

const dd = 0.4, ww = Math.sqrt(1 - dd * dd);
const svgPT2 = diagramm(
  gestr(OX, 40, 205, 40) + txt(OX - 5, 44, 'K', 'end', 13) +
  verlauf((t) => 1 - Math.exp(-dd * t) * (Math.cos(ww * t) + dd / ww * Math.sin(ww * t)), 0, 6.2, 27, 75, 90) +
  txt(150, 82, 'PT₂, d < 1', 'middle', 11) + txt(150, 96, '(schwingend)', 'middle', 11));

// ---------- PID ----------
const svgPIDideal = diagramm(
  gestr(OX, 85, 205, 85) + txt(OX - 5, 89, 'K_P', 'end', 12) +
  pfeil(OX + 3, 85, OX + 3, 15) + kurve([[OX + 3, 85], [205, 42]]) +
  txt(OX + 14, 34, 'D: Impuls K_P·T_V·δ(t)', 'start', 10) + txt(100, 100, 'I: Rampe, Steigung', 'start', 10) + txt(100, 112, 'K_P/T_N', 'start', 10),
  260);

const svgPIDreal = diagramm(
  gestr(OX, 85, 205, 85) + txt(OX - 5, 89, 'K_P', 'end', 12) +
  (() => {
    const p = [];
    for (let i = 0; i <= 80; i++) { const x = i * 2; p.push([OX + x, 85 - 0.27 * x - 62 * Math.exp(-x / 9)]); }
    return kurve(p.map(([x, y]) => [x, y]));
  })() +
  txt(OX + 22, 34, 'Start K_P·(1 + T_V/T_P)', 'start', 10) + txt(100, 100, 'danach I-Rampe', 'start', 10),
  260);

// ---------- Signalfluss ----------
const kopf = (b, h) => `<svg viewBox="0 0 ${b} ${h}" xmlns="http://www.w3.org/2000/svg">`;
const svgReihe = kopf(320, 70) +
  txt(4, 39, 'X_e(s)') + pfeil(42, 35, 75, 35) + kasten(75, 20, 50, 30, 'G₁') +
  pfeil(125, 35, 165, 35) + kasten(165, 20, 50, 30, 'G₂') + pfeil(215, 35, 262, 35) + txt(266, 39, 'X_a(s)') + '</svg>';

const svgParallel = kopf(330, 110) +
  txt(4, 59, 'X_e(s)') + lin(42, 55, 70, 55) + punkt(70, 55) +
  lin(70, 55, 70, 25) + pfeil(70, 25, 100, 25) + kasten(100, 10, 50, 30, 'G₁') + lin(150, 25, 230, 25) + pfeil(230, 25, 230, 46) +
  lin(70, 55, 70, 85) + pfeil(70, 85, 100, 85) + kasten(100, 70, 50, 30, 'G₂') + lin(150, 85, 230, 85) + pfeil(230, 85, 230, 64) +
  kreis(230, 55) + txt(240, 36, '+') + txt(240, 82, '+') + pfeil(239, 55, 280, 55) + txt(284, 59, 'X_a(s)') + '</svg>';

const rueck = (vz) => kopf(340, 120) +
  txt(4, 44, 'X_e(s)') + pfeil(42, 40, 81, 40) + kreis(90, 40) + txt(76, 32, '+') + txt(98, 66, vz) +
  pfeil(99, 40, 140, 40) + txt(110, 33, 'E', 'middle', 11) + kasten(140, 25, 50, 30, 'G₁') +
  lin(190, 40, 298, 40) + punkt(240, 40) + pfeil(290, 40, 300, 40) + txt(304, 44, 'X_a(s)') +
  lin(240, 40, 240, 95) + pfeil(240, 95, 205, 95) + kasten(155, 80, 50, 30, 'G₂') + lin(155, 95, 90, 95) + pfeil(90, 95, 90, 49) + '</svg>';

// ---------- Kennwerte aus der Sprungantwort (Wendetangente, PT3 mit T = 1 als Beispielkurve) ----------
const h3 = (t) => 1 - Math.exp(-t) * (1 + t + t * t / 2);
const tW = 2, hW = h3(tW), sW = tW * tW * Math.exp(-tW) / 2;       // Wendepunkt
const TU = tW - hW / sW, TE = tW + (1 - hW) / sW;                  // Schnitt mit 0 und mit K_S
const sxk = 32, syk = 85;
const svgKennwerte = diagramm(
  gestr(OX, OY - syk, 225, OY - syk) + txt(OX - 5, OY - syk + 4, 'K_S', 'end', 12) +
  verlauf(h3, 0, 6.2, sxk, syk, 90) +
  lin(OX + TU * sxk, OY, OX + TE * sxk, OY - syk, 'stroke-dasharray="5 3" stroke-width="1.2"') +
  punkt(OX + tW * sxk, OY - hW * syk) + txt(OX + tW * sxk + 6, OY - hW * syk + 14, 'Wendepunkt', 'start', 10) +
  gestr(OX + TE * sxk, OY - syk, OX + TE * sxk, OY + 18) +
  lin(OX, OY + 12, OX + TU * sxk, OY + 12, 'stroke-width="1"') + txt(OX + TU * sxk / 2, OY + 24, 'T_U', 'middle', 11) +
  lin(OX + TU * sxk, OY + 12, OX + TE * sxk, OY + 12, 'stroke-width="1"') + txt(OX + (TU + TE) * sxk / 2, OY + 24, 'T_G', 'middle', 11) +
  txt(OX + 8, OY - 55, 'Wendetangente', 'start', 10),
  250).replace('viewBox="0 0 250 135"', 'viewBox="0 0 250 145"');

// ---------- Pol-Nullstellen-Diagramm ----------
const px = (re) => 190 + re * 120;               // Re = 0 bei x = 190
const kreuz = (x, y) => lin(x - 5, y - 5, x + 5, y + 5) + lin(x - 5, y + 5, x + 5, y - 5);
const nullk = (x, y) => `<circle cx="${n1(x)}" cy="${y}" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/>`;
const svgPN = `<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">` +
  pfeil(10, 75, 292, 75) + pfeil(190, 140, 190, 8) + txt(290, 68, 'Re', 'end') + txt(196, 16, 'Im') +
  kreuz(px(-0.5), 75) + kreuz(px(-1 / 3), 75) + kreuz(px(-0.2), 75) +
  nullk(px(-1), 75) + nullk(px(0.25), 75) +
  txt(px(-1), 98, '−1', 'middle', 10) + txt(px(-0.5), 98, '−0,5', 'middle', 10) + txt(px(-1 / 3) + 6, 60, '−1/3', 'middle', 10) +
  txt(px(-0.2) + 4, 98, '−0,2', 'middle', 10) + txt(px(0.25), 98, '0,25', 'middle', 10) +
  txt(20, 30, 'linke Halbebene: stabil', 'start', 11) + txt(205, 40, 'rechte: instabil', 'start', 11) +
  txt(20, 140, '× Pol   ○ Nullstelle', 'start', 11) + '</svg>';

export const ANTWORTEN = [
  // ================= A7 Grundglieder =================
  {
    id: 'grundglieder',
    bereich: 'theorie',
    titel: 'Grundglieder: G(s) und Sprungantwort (P, I, D, PT1, PT2)',
    quellen: 'K1 A7 · K2 A7 · V03/V04 (Grundglieder)',
    punkte: 8,
    stichworte: 'grundglieder übertragungsglieder P-Glied I-Glied D-Glied PT1 PT2 sprungantwort h(t) übertragungsfunktion verzögerung 63 prozent tangente verstärkung zeitkonstante dämpfung A7',
    frage: 'Nennen Sie 5 grundlegende Übertragungsglieder und geben Sie jeweils die Übertragungsfunktion im Bildbereich an. Zeichnen Sie für jedes die schematische Sprungantwort h(t) (Einheitssprung σ(t), Höhe 1).',
    antwort: [
      { t: 'p', text: 'Fünf Grundglieder: P-Glied, I-Glied, D-Glied, PT₁-Glied, PT₂-Glied. Jeweils Name, G(s) und h(t) angeben. Eingang ist der Einheitssprung σ(t) mit Höhe 1.' },
      { t: 'tabelle',
        kopf: ['Glied', 'G(s)', 'Sprungantwort h(t)', 'Kennwerte'],
        zeilen: [
          ['P-Glied', 'G(s) = K_P', 'h(t) = K_P·σ(t)', 'K_P Verstärkung'],
          ['I-Glied', 'G(s) = K_I / s', 'h(t) = K_I·t', 'K_I Integrierbeiwert (Steigung)'],
          ['D-Glied', 'G(s) = K_D·s', 'h(t) = K_D·δ(t)', 'K_D Differenzierbeiwert'],
          ['PT₁-Glied', 'G(s) = K / (1 + T·s)', 'h(t) = K·(1 − e^(−t/T))', 'K Verstärkung, T Zeitkonstante'],
          ['PT₂-Glied', 'G(s) = K / (T²s² + 2dT·s + 1)', 'd < 1: h(t) = K·[1 − e^(−d·t/T)·(cos ωt + d/√(1−d²)·sin ωt)], ω = √(1−d²)/T', 'K Verstärkung, T Eigenzeit, d Dämpfung'],
        ] },
      { t: 'zwischen', text: 'Skizzen der Sprungantworten' },
      { t: 'svg', svg: svgP, unterschrift: 'P-Glied: springt sofort auf K und bleibt dort.' },
      { t: 'svg', svg: svgI, unterschrift: 'I-Glied: Gerade durch den Ursprung mit Steigung K_I, wächst unbegrenzt.' },
      { t: 'svg', svg: svgD, unterschrift: 'D-Glied: Impuls (Dirac) bei t = 0, danach null.' },
      { t: 'svg', svg: svgPT1, unterschrift: 'PT₁-Glied: Start bei 0, Tangente im Ursprung erreicht K bei t = T, nach t = T sind 63 % von K erreicht (95 % bei 3T), Endwert K.' },
      { t: 'svg', svg: svgPT2, unterschrift: 'PT₂-Glied mit d < 1: S-förmiger Start (Steigung null bei t = 0), Überschwingen, Einschwingen auf K.' },
      { t: 'zwischen', text: 'Kennwerte kurz' },
      { t: 'liste', items: [
        'PT₁: Endwert h(∞) = K. Zeitkonstante T: bei t = T sind 63,2 % von K erreicht. Die Tangente im Ursprung schneidet die Endwertlinie bei t = T.',
        'PT₂: d < 1 schwingend (Pole komplex), d = 1 Grenzfall, d > 1 aperiodisch, ohne Überschwingen (zwei reelle Pole, wie zwei PT₁ in Reihe). Überschwingen bei d < 1: e^(−π·d/√(1−d²)).',
        'I-Glied: Eingang konstant ergibt Ausgang rampenförmig. Es hat keinen Endwert (nicht BIBO-stabil).',
      ] },
      { t: 'zwischen', text: 'Weitere Glieder (falls der Prof sie zählt)' },
      { t: 'tabelle',
        kopf: ['Glied', 'G(s)', 'Sprungantwort h(t)'],
        zeilen: [
          ['PI-Glied', 'K_P·(1 + 1/(T_n·s))', 'K_P·(1 + t/T_n): Sprung auf K_P, dann Rampe'],
          ['PD-Glied', 'K_P·(1 + T_v·s)', 'K_P·σ(t) + K_P·T_v·δ(t): Impuls und Sprung auf K_P'],
          ['DT₁-Glied', 'K·T_v·s / (1 + T₁·s)', 'K·(T_v/T₁)·e^(−t/T₁): springt hoch, klingt ab'],
          ['Totzeit', 'e^(−T_t·s)', 'σ(t − T_t): Sprung um T_t verschoben'],
        ] },
      { t: 'hinweis', text: 'Bewertung laut Musterlösung (8 P): pro Glied Name, G(s) und schematisches h(t). 1 Punkt Abzug pro Fehler, auch bei falscher Beschriftung im Diagramm (Achsen h(t) und t, Werte K, T, K_I). Die Musterlösung nennt als zulässig auch PI, PD, PTₙ (K1/K2). Sicher sind P, I, D, PT₁, PT₂.' },
      { t: 'hinweis', text: 'PID-Regler und Zuordnung Glied ↔ G(s) ↔ Sprungantwort: eigene Antworten, siehe „PID-Regler ideal und real“ und „Zuordnung Glied ↔ G(s) ↔ Sprungantwort“.' },
      { t: 'link', ziel: 'pbz', text: 'PBZ & Sprungantwort berechnen' },
    ],
  },

  // ================= A7' PID =================
  {
    id: 'pid-ideal-real',
    bereich: 'theorie',
    titel: 'PID-Regler ideal und real: G(s), Sprungantwort, D-Anteil',
    quellen: 'K3 A7 · V04 (PID, PI-D-T1-Regler)',
    punkte: 8,
    stichworte: 'pid regler ideal real DT1 d-anteil rauschen empfindlich sprungantwort übertragungsfunktion nachstellzeit vorhaltzeit A7 PID-T1 nachgebend',
    frage: 'Zeichnen Sie die Sprungantwort eines idealen und eines realen PID-Reglers und geben Sie jeweils die Übertragungsfunktion an. Erläutern Sie, wie P-, I- und D-Anteil auf e(t) reagieren. Welcher Anteil reagiert sehr empfindlich auf eine sprungartige Änderung der Führungsgröße w(t) und warum?',
    antwort: [
      { t: 'zwischen', text: 'Übertragungsfunktionen (je 1 P)' },
      { t: 'p', text: 'Ideal (mit D-Glied):' },
      { t: 'formel', text: 'G_R,i(s) = K_PID · (1 + 1/(T_N·s) + T_V·s)' },
      { t: 'p', text: 'Real (mit DT₁-Glied statt D-Glied):' },
      { t: 'formel', text: 'G_R,r(s) = K_PID · (1 + 1/(T_N·s) + T_V·s/(T_P·s + 1))' },
      { t: 'p', text: 'Gleichwertig als Parallelschaltung: G = K_P + K_I/s + K_D·s mit K_I = K_P/T_N und K_D = K_P·T_V. T_N Nachstellzeit, T_V Vorhaltzeit, T_P (oder T₁) kleine Verzögerungszeitkonstante des DT₁.' },
      { t: 'zwischen', text: 'Sprungantworten (je 1 P)' },
      { t: 'svg', svg: svgPIDideal, unterschrift: 'Ideal: Impuls bei t = 0 (D), Sprung auf K_P, dann Rampe (I). h(t) = K_P·(1 + t/T_N) + K_P·T_V·δ(t).' },
      { t: 'svg', svg: svgPIDreal, unterschrift: 'Real: Statt Impuls ein hoher, endlicher Sprung K_P·(1 + T_V/T_P), der mit T_P abklingt, danach I-Rampe. h(t) = K_P·(1 + t/T_N + (T_V/T_P)·e^(−t/T_P)).' },
      { t: 'zwischen', text: 'Wirkung der Anteile (je 1 P)' },
      { t: 'liste', items: [
        'P-Anteil: wirkt proportional zum Eingangssignal. Je größer e(t), desto größer der Ausgang.',
        'I-Anteil: wirkt summierend (integrierend) auf das Eingangssignal. Je länger e(t) ≠ 0 anliegt, desto größer der Ausgang.',
        'D-Anteil: wirkt differenzierend auf das Eingangssignal. Je schneller sich e(t) ändert, desto größer der Ausgang.',
      ] },
      { t: 'zwischen', text: 'Welcher Anteil ist empfindlich? (1 P)' },
      { t: 'p', text: 'Der D-Anteil. Er reagiert sehr stark auf eine sprunghafte Änderung am Eingang: Eine Änderung in sehr kurzer Zeit ergibt einen sehr großen Wert der Ableitung (beim idealen Sprung theoretisch unendlich).' },
      { t: 'hinweis', text: 'Zusatz (falls mehr gefragt): Aus demselben Grund verstärkt der D-Anteil auch Messrauschen (schnelle, kleine Schwankungen haben eine große Ableitung). Ein ideales D-Glied ist technisch nicht realisierbar. Deshalb baut man den realen Regler mit DT₁: Die Verstärkung bei hohen Frequenzen ist auf K_P·T_V/T_P begrenzt, der Impuls wird zu einem endlichen, abklingenden Sprung.' },
      { t: 'link', ziel: 'pid', text: 'PID-Einstellregeln (K_P, T_n, T_v berechnen)' },
    ],
  },

  // ================= A8 Signalfluss =================
  {
    id: 'signalfluss-grundregeln',
    bereich: 'theorie',
    titel: 'Signalfluss-Grundregeln: Reihe, Parallel, Gegenkopplung, Mitkopplung',
    quellen: 'K1 A8 · V03 (Signalflussplan)',
    punkte: 8,
    stichworte: 'signalfluss signalflussbild reihenschaltung parallelschaltung gegenkopplung mitkopplung rückführung rückkopplung summationsstelle umformung A8 formel',
    frage: 'Zeigen Sie in einer kurzen Rechnung mit Zeichnung die Zusammenschaltung von G₁(s) und G₂(s) zu einer Gesamtübertragungsfunktion G(s) = X_a(s)/X_e(s) für Reihenschaltung, Parallelschaltung, Gegenkopplung (G₁ vorwärts, G₂ rückwärts) und Mitkopplung.',
    antwort: [
      { t: 'p', text: 'Erwartet pro Fall: Zeichnung, Rechnung, Formel als Ergebnis. Eingang X_e (Index e), Ausgang X_a (Index a). Zeitfunktion klein, Bildfunktion groß geschrieben: X_a(s) = G(s)·X_e(s).' },
      { t: 'zwischen', text: '1. Reihenschaltung' },
      { t: 'svg', svg: svgReihe },
      { t: 'formel', text: 'X₁ = G₁·X_e,   X_a = G₂·X₁ = G₂·G₁·X_e\nG(s) = G₁(s) · G₂(s)' },
      { t: 'zwischen', text: '2. Parallelschaltung' },
      { t: 'svg', svg: svgParallel },
      { t: 'formel', text: 'X_a = G₁·X_e + G₂·X_e = (G₁ + G₂)·X_e\nG(s) = G₁(s) + G₂(s)' },
      { t: 'zwischen', text: '3. Gegenkopplung (G₁ vorwärts, G₂ rückwärts, Rückführung subtrahiert)' },
      { t: 'svg', svg: rueck('−') },
      { t: 'formel', text: 'E = X_e − G₂·X_a\nX_a = G₁·E = G₁·X_e − G₁·G₂·X_a\nX_a·(1 + G₁·G₂) = G₁·X_e\nG(s) = G₁ / (1 + G₁·G₂)' },
      { t: 'zwischen', text: '4. Mitkopplung (Rückführung addiert)' },
      { t: 'svg', svg: rueck('+') },
      { t: 'formel', text: 'E = X_e + G₂·X_a\nX_a = G₁·E = G₁·X_e + G₁·G₂·X_a\nX_a·(1 − G₁·G₂) = G₁·X_e\nG(s) = G₁ / (1 − G₁·G₂)' },
      { t: 'hinweis', text: 'Merken: Gegenkopplung → im Nenner „1 +“ (so steht es auf der Folie), Mitkopplung → „1 −“. Im Nenner steht immer der offene Kreis G₁·G₂. Die Regelung (Standardregelkreis) ist eine Gegenkopplung mit G₂ = 1: G_W = G₀/(1 + G₀).' },
      { t: 'link', ziel: 'signalfluss', text: 'Signalfluss-Rechner (Bausteine zusammenklicken)' },
    ],
  },

  // ================= A8'' Zuordnung =================
  {
    id: 'zuordnung-glieder',
    bereich: 'theorie',
    titel: 'Zuordnung Glied ↔ G(s) ↔ Sprungantwort (P, I, PT1, PT2)',
    quellen: 'K3 A8',
    punkte: 8,
    stichworte: 'zuordnung glied übertragungsfunktion sprungantwort P-Glied I-Glied PT1 PT2 erkennen merkmale zuordnen A8 kurve',
    frage: 'Ordnen Sie P-, I-, PT₁- und PT₂-Glied jeweils der passenden Übertragungsfunktion (1. bis 4.) und der passenden Sprungantwort (A bis D) zu. Es genügt: Glied, Zahl und Buchstabe.',
    antwort: [
      { t: 'p', text: 'Pro Glied 1 P für die Übertragungsfunktion und 1 P für die Sprungantwort. So erkennt man sie:' },
      { t: 'tabelle',
        kopf: ['Glied', 'G(s)', 'Sprungantwort', 'Erkennungsmerkmal'],
        zeilen: [
          ['P-Glied', 'K_P', 'Waagrechte Linie: springt sofort auf K_P und bleibt', 'Kein s in G(s). Ausgang folgt dem Eingang sofort.'],
          ['I-Glied', 'K_I / s', 'Gerade ab 0 mit Steigung K_I, wächst unbegrenzt', 'Genau ein s im Nenner (ohne weitere Terme). Kein Endwert.'],
          ['PT₁-Glied', 'K / (1 + T·s)', 'e-Kurve ab 0, endet waagrecht bei K, kein Überschwingen', 'Nenner 1. Ordnung (1 + Ts). Steilster Punkt am Anfang.'],
          ['PT₂-Glied', 'K / (T²s² + 2dT·s + 1)', 'Überschwingen (d < 1) und Einschwingen auf K; Start waagrecht', 'Nenner 2. Ordnung (s²). Start mit Steigung null, S-Form.'],
        ] },
      { t: 'zwischen', text: 'Merkregeln' },
      { t: 'liste', items: [
        'Erst den Nenner von G(s) ansehen: kein s → P. Nur s → I. 1 + Ts → PT₁. s² im Nenner → PT₂.',
        'Dann die Kurve: konstant → P. Gerade → I. Langsam ansteigend, ohne Überschwingen, steilster Anstieg bei t = 0 → PT₁. Überschwingen oder S-Form → PT₂.',
        'Endwert: P, PT₁, PT₂ laufen auf K (stabil). Nur I wächst über alle Grenzen.',
        'Der Wert der Kurve nach t = T liegt bei 63 % von K (PT₁).',
      ] },
      { t: 'hinweis', text: 'Lösung in K3: P-Glied 3. C · I-Glied 1. B · PT₁-Glied 4. D · PT₂-Glied 2. A. Die Nummern und Buchstaben gelten nur für K3. Bei einer neuen Klausur nach den Merkmalen oben zuordnen. In der Musterlösung zu K3 zeigt A–D: C waagrecht, B Gerade, D e-Kurve, A mit Überschwingen.' },
      { t: 'hinweis', text: 'Skizzen der Kurven: Antwort „Grundglieder“.' },
    ],
  },

  // ================= A9' Hurwitz =================
  {
    id: 'hurwitz-kriterium',
    bereich: 'theorie',
    titel: 'Hurwitz-Kriterium: wofür, H₁…Hₙ für n = 3 und n = 4, Bedingung',
    quellen: 'K3 A9 · V05/V08 · Ü08',
    punkte: 8,
    stichworte: 'hurwitz kriterium determinanten unterdeterminanten H1 H2 H3 H4 nennergrad stabilität algebraisch nordwestliche A9 matrix a0 a1 a2 a3 a4',
    frage: 'Wofür benötigt man das Hurwitz-Kriterium in der Regelungstechnik? Geben Sie für den Nennergrad n = 3 und n = 4 jeweils die Unterdeterminanten H₁ bis Hₙ an (Koeffizienten a₀ bis aₙ). Was muss für die Erfüllung des Kriteriums gegeben sein?',
    antwort: [
      { t: 'zwischen', text: 'Wofür? (1 P)' },
      { t: 'p', text: 'Das Hurwitz-Kriterium ist ein algebraisches Stabilitätskriterium. Man braucht es für die rechnerische Stabilitätsprüfung einer gegebenen Strecke G(s) in Polynomdarstellung, ohne die Polstellen auszurechnen. Man wendet es an, wenn die Berechnung der Polstellen der Übertragungsfunktion zu kompliziert ist.' },
      { t: 'p', text: 'Nennerpolynom (aus N(s) = 0):' },
      { t: 'formel', text: 'N(s) = aₙ·sⁿ + aₙ₋₁·sⁿ⁻¹ + … + a₁·s + a₀' },
      { t: 'zwischen', text: 'n = 3 (Koeffizienten a₀ … a₃), H₁ bis H₃' },
      { t: 'formel', text: 'H₁ = |a₂|                  = a₂ > 0\n\nH₂ = | a₂  a₃ |\n     | a₀  a₁ |            = a₁·a₂ − a₃·a₀ > 0\n\n     | a₂  a₃  0  |\nH₃ = | a₀  a₁  a₂ |        = a₀·H₂ > 0\n     | 0   0   a₀ |' },
      { t: 'zwischen', text: 'n = 4 (Koeffizienten a₀ … a₄), H₁ bis H₄' },
      { t: 'formel', text: 'H₁ = |a₃|                  = a₃ > 0\n\nH₂ = | a₃  a₄ |\n     | a₁  a₂ |            = a₂·a₃ − a₁·a₄ > 0\n\n     | a₃  a₄  0  |\nH₃ = | a₁  a₂  a₃ |        = −a₀·a₃² + a₁·a₂·a₃ − a₁²·a₄ > 0\n     | 0   a₀  a₁ |\n\n     | a₃  a₄  0   0  |\nH₄ = | a₁  a₂  a₃  a₄ |    = a₀·H₃ > 0\n     | 0   a₀  a₁  a₂ |\n     | 0   0   0   a₀ |' },
      { t: 'p', text: 'Aufbau der Matrix: Oben links steht aₙ₋₁. Die erste Zeile enthält aₙ₋₁, aₙ, 0, … Die zweite Zeile enthält aₙ₋₃, aₙ₋₂, aₙ₋₁, aₙ, … Jede weitere Zeile ist um eine Spalte verschoben. H₁ bis Hₙ sind die nordwestlichen Unterdeterminanten (links oben beginnend).' },
      { t: 'zwischen', text: 'Bedingung für Stabilität (1 P)' },
      { t: 'p', text: 'Alle nordwestlichen Unterdeterminanten der Hurwitz-Determinante müssen positiv sein: Hᵢ > 0 für alle i = 1 … n, mit n = Nennergrad. Zusätzlich muss aₙ > 0 sein (Nenner so normieren, dass aₙ positiv ist). Ist ein Hᵢ ≤ 0, ist das System instabil.' },
      { t: 'hinweis', text: 'Kurzer Check: Hₙ = a₀·Hₙ₋₁. Notwendig (aber nicht hinreichend) ist: alle Koeffizienten aᵢ > 0. Ist einer ≤ 0, ist das System schon instabil. Beispiel Ü08: s³ + 9s² + 23s + 15 ergibt H₁ = 9, H₂ = 23·9 − 1·15 = 192, H₃ = 15·192 = 2880, also stabil.' },
      { t: 'link', ziel: 'hurwitz', text: 'Hurwitz-Rechner (mit Rechenweg und K_R-Bereich)' },
    ],
  },

  // ================= A10 Stabilität =================
  {
    id: 'stabilitaet-bedingung',
    bereich: 'theorie',
    titel: 'Stabilität: Was muss erfüllt sein? Wie weiter vorgehen? (A10)',
    quellen: 'K1 A10 · K2 A10 · K3 A10 · V05',
    punkte: 10,
    stichworte: 'stabilität stabil pole linke halbebene realteil negativ polstellen nullstellen nenner N(s) Z(s) merksatz dgl übertragungsfunktion laplace A10 weiter vorgehen',
    frage: 'DGL gegeben. Laplace-Transformierte, Übertragungsfunktion G(s) = Z(s)/N(s), Nullstellen von Z(s) berechnen. Wie müssten Sie weiter vorgehen, um die Stabilität des Systems zu gewährleisten? Was muss generell erfüllt sein, damit ein durch die Übertragungsfunktion beschriebenes System stabil ist (Merksatz)?',
    antwort: [
      { t: 'zwischen', text: 'Merksatz (Stabilität)' },
      { t: 'p', text: 'Ein System ist stabil, wenn alle Pole der Übertragungsfunktion in der linken Halbebene der komplexen Ebene liegen, d. h. wenn alle Polstellen einen negativen Realteil haben: Re{sᵢ} < 0.' },
      { t: 'zwischen', text: 'Wie weiter vorgehen?' },
      { t: 'liste', nummeriert: true, items: [
        'Die Polstellen berechnen: das sind die Nullstellen des Nennerpolynoms, N(s) = 0. Bei Grad 3 mit einer bekannten Polstelle: Polynomdivision, dann pq-Formel.',
        'Prüfen, ob alle Pole in der linken Halbebene liegen (Re < 0).',
        'Alternativ ohne Berechnung der Pole: Hurwitz-Kriterium auf N(s) anwenden (alle Hᵢ > 0).',
      ] },
      { t: 'hinweis', text: 'Falle: Die Nullstellen von Z(s) (Zähler) sagen nichts über die Stabilität. Gefragt war Z(s) = 0 nur als Rechenschritt. Entscheidend sind die Pole, also N(s) = 0.' },
      { t: 'zwischen', text: 'Einordnung nach Lage der Pole' },
      { t: 'tabelle',
        kopf: ['Lage der Pole', 'Verhalten', 'Aussage'],
        zeilen: [
          ['alle Re{sᵢ} < 0', 'Sprungantwort klingt ab, Endwert existiert', 'stabil'],
          ['ein Pol mit Re{sᵢ} = 0 (z. B. Integrator oder ±jω)', 'wächst linear bzw. Dauerschwingung', 'grenzstabil (nicht BIBO-stabil)'],
          ['mindestens ein Pol mit Re{sᵢ} > 0', 'wächst über alle Grenzen', 'instabil'],
        ] },
      { t: 'p', text: 'BIBO-Stabilität: begrenztes Eingangssignal ergibt begrenztes Ausgangssignal.' },
      { t: 'zwischen', text: 'Vorarbeit aus der Aufgabe (so rechnet man es)' },
      { t: 'p', text: 'Die DGL wird mit dem Differentiationssatz transformiert (Anfangswerte 0): n-te Ableitung ↔ sⁿ. Dann ausklammern und teilen:' },
      { t: 'formel', text: 'aₙ·x_a⁽ⁿ⁾ + … + a₀·x_a = bₘ·x_e⁽ᵐ⁾ + … + b₀·x_e\n⊶ (aₙsⁿ + … + a₀)·X_a(s) = (bₘsᵐ + … + b₀)·X_e(s)\nG(s) = X_a/X_e = Z(s)/N(s)' },
      { t: 'p', text: 'Beispiel K3: 1638·x_a‴ + 451·x_a″ + 38·x_a′ + x_a = 17·x_e″ + 86·x_e′ + 5·x_e' },
      { t: 'formel', text: 'G(s) = (17s² + 86s + 5) / (1638s³ + 451s² + 38s + 1)\nZ(s) = 0:  s = (−86 ± √(86² − 4·17·5)) / 34 = (−86 ± 84)/34\n⇒ s = −1/17 und s = −5' },
      { t: 'p', text: 'Gleiche Rechnung K2 (960, 332, 33, 1 | 15, 46, 3): Z(s) = 15s² + 46s + 3, Nullstellen −1/15 und −3. K1 (96, 68, 15, 1 | 7, 8, 1): Z(s) = 7s² + 8s + 1, Nullstellen −1/7 und −1.' },
      { t: 'hinweis', text: 'Die Aufgabe sagt: allgemein beantworten, die Stabilität des Systems muss nicht nachgewiesen werden. Die Antwort „Pole von N(s) berechnen, alle in der linken Halbebene“ plus der Merksatz geben die Punkte.' },
      { t: 'link', ziel: 'dgl', text: 'DGL → G(s) Rechner' },
      { t: 'link', ziel: 'polynom', text: 'Polynom-Werkzeug (Nullstellen, Polynomdivision)' },
      { t: 'link', ziel: 'hurwitz', text: 'Hurwitz-Rechner' },
    ],
  },

  // ================= A15 stationäre Genauigkeit =================
  {
    id: 'stationaere-genauigkeit',
    bereich: 'theorie',
    titel: 'Stationäre Genauigkeit: e∞, Integratoren im offenen Kreis (A15)',
    quellen: 'K1 A15 · K2 A15 · V04/V05 · Ü04 A3',
    punkte: 10,
    stichworte: 'stationäre genauigkeit bleibende regelabweichung endwertsatz e unendlich integratoren offener kreis typ sprung rampe parabel störgröße modell führungssignal A15 stationär genau',
    frage: 'Regelabweichung e(t) = w(t) − x(t) für t → ∞ mit Endwertsatz bestimmen (Sprung, Rampe, Parabel als Führungsgröße; sprungförmige Störgröße). Was bedeutet das Ergebnis für die stationäre Genauigkeit? Was fällt auf?',
    antwort: [
      { t: 'zwischen', text: 'Vorgehen' },
      { t: 'formel', text: 'G₀ = R·G₁·G₂ (offener Kreis)\nE(s) = W(s) − X(s) = 1/(1 + G₀)·W(s) − G₂/(1 + G₀)·Z(s)\ne∞ = lim(t→∞) e(t) = lim(s→0) s·E(s)   (Endwertsatz)\nW(s): Sprung 1/s · Rampe 1/s² · Parabel 1/s³' },
      { t: 'p', text: 'Der Endwertsatz gilt nur, wenn der geschlossene Kreis stabil ist.' },
      { t: 'zwischen', text: 'Was bedeutet e∞?' },
      { t: 'liste', items: [
        'e∞ = 0: stationär genau. Die Regelgröße erreicht den Sollwert exakt.',
        'e∞ = konstant (≠ 0): bleibende Regelabweichung. Der Kreis ist nicht stationär genau, der Fehler bleibt aber begrenzt.',
        'e∞ = ∞: die Regelabweichung wächst über alle Grenzen. Der Kreis kann dem Signal nicht folgen.',
      ] },
      { t: 'zwischen', text: 'Zusammenhang mit Integratoren im offenen Kreis (Typ)' },
      { t: 'p', text: 'Im offenen Kreis muss ein Modell des Führungssignals enthalten sein, um stationäre Genauigkeit herzustellen. Sprung 1/s braucht 1 Integrator, Rampe 1/s² braucht 2, Parabel 1/s³ braucht 3 (für e∞ = 0). Mit einem Integrator weniger bleibt eine konstante Abweichung 1/K. Mit noch weniger wächst sie über alle Grenzen.' },
      { t: 'zwischen', text: 'Führungsgröße: e∞ nach Zahl der Integratoren in G₀(s)' },
      { t: 'tabelle',
        kopf: ['Führungsgröße', '0 Integratoren', '1', '2', '≥ 3'],
        zeilen: [
          ['Sprung σ(t)  (1/s)', '1/(1 + K)', '0', '0', '0'],
          ['Rampe t·σ(t)  (1/s²)', '∞', '1/K', '0', '0'],
          ['Parabel t²/2·σ(t)  (1/s³)', '∞', '∞', '1/K', '0'],
        ] },
      { t: 'p', text: 'K = Verstärkung des offenen Kreises (G₀ ohne die Integratoren, bei s → 0).' },
      { t: 'zwischen', text: 'Störgröße: e∞ nach Zahl der Integratoren in G₁(s) und R(s) (vor der Einkopplung)' },
      { t: 'tabelle',
        kopf: ['Störgröße', '0 Integratoren', '1', '2', '≥ 3'],
        zeilen: [
          ['Sprung σ(t)', '−K₂/(1 + K)  (bzw. −K₂/K *)', '0', '0', '0'],
          ['Rampe t·σ(t)', '−∞', '−K₂/K', '0', '0'],
          ['Parabel t²/2·σ(t)', '−∞', '−∞', '−K₂/K', '0'],
        ] },
      { t: 'p', text: '* wenn G₂(s) einen Integrierer aufweist. K₂ = Verstärkung von G₂. Für die Störgröße zählen nur die Integratoren vor der Einkopplungsstelle.' },
      { t: 'zwischen', text: 'Ergebnisse der Klausuren (I-Regler R = 1/s, w − x)' },
      { t: 'tabelle',
        kopf: ['Klausur', 'G₁, G₂', 'Sprung', 'Rampe', 'Parabel', 'Störsprung'],
        zeilen: [
          ['K1', 'G₁ = 1/(1+3s), G₂ = 1/((1+5s)(1+7s)); 1 Integrator', 'e∞ = 0', 'e∞ = 1 (nicht stationär genau)', '–', 'e∞ = 0 (I-Regler vor Störung)'],
          ['K2', 'G₁ = 1/(s(1+2s)), G₂ = 1/((1+5s)(1+8s)); 2 Integratoren', 'e∞ = 0', 'e∞ = 0 (stationär genau)', 'e∞ = 1 (bleibt Abweichung)', '–'],
        ] },
      { t: 'zwischen', text: 'Antworten zu den „Was bedeutet das?“-Fragen' },
      { t: 'liste', items: [
        'K1 Rampe: Das System ist nicht stationär genau, es bleibt eine Regelabweichung (e∞ = 1). Der offene Kreis hat nur einen Integrator, für die Rampe (1/s²) wären zwei nötig.',
        'K1 Störsprung: e∞ = 0. Es fällt auf: stationär genau für sprungförmige Störgrößen, weil der Integrator des Reglers vor der Einkopplungsstelle der Störung liegt.',
        'K2 Parabel: Es bleibt eine Regelabweichung (e∞ = 1). Im offenen Kreis gibt es 2 Integratoren, die Rampe (1/s²) wird noch ausgeregelt, die Parabel (1/s³) nicht. Das Modell des Führungssignals muss im offenen Kreis enthalten sein.',
      ] },
      { t: 'link', ziel: 'regelkreis', text: 'Regelkreis-Rechner (G₀, G_W, G_Z, Endwertsatz)' },
    ],
  },

  // ================= A15' Warum PBZ =================
  {
    id: 'warum-pbz',
    bereich: 'theorie',
    titel: 'Warum Partialbruchzerlegung (PBZ) bei PT₁-Reihenschaltung?',
    quellen: 'K3 A15 (Wissensteil) · Ü05 A1',
    punkte: 2,
    stichworte: 'partialbruchzerlegung pbz warum reihenschaltung pt1 korrespondenz rücktransformation zeitbereich summanden sprungantwort A15',
    frage: 'Warum ist es geschickt, bei einer Reihenschaltung von mehreren PT₁-Gliedern eine Partialbruchzerlegung (PBZ) durchzuführen?',
    antwort: [
      { t: 'p', text: 'Durch die PBZ können die Summanden einzeln zurück in den Zeitbereich transformiert werden. Ohne die PBZ hat man ein System ohne passende Transformationskorrespondenz.' },
      { t: 'zwischen', text: 'Kurz zur Rechnung (falls verlangt)' },
      { t: 'formel', text: 'G(s) = 1/((1+T₁s)(1+T₂s)) = A/(1+T₁s) + B/(1+T₂s)\nA = T₁/(T₁ − T₂),   B = T₂/(T₂ − T₁)\nH(s) = G(s)·1/s  ⇒  h(t) = A·(1 − e^(−t/T₁)) + B·(1 − e^(−t/T₂))' },
      { t: 'p', text: 'Jeder Summand A/(s(1 + Ts)) ist ein PT₁ mit Sprung und hat die Korrespondenz 1/(s(1+Ts)) ⊶ 1 − e^(−t/T).' },
      { t: 'hinweis', text: 'Beispiel K3 (T₁ = 7, T₂ = 8): G = −7/(1+7s) + 8/(1+8s), h(t) = −7·(1 − e^(−t/7)) + 8·(1 − e^(−t/8)).' },
      { t: 'link', ziel: 'pbz', text: 'PBZ & Sprungantwort Rechner' },
    ],
  },

  // ================= Ü06 Kennwerte =================
  {
    id: 'kennwerte-sprungantwort',
    bereich: 'theorie',
    titel: 'Kennwerte aus der Sprungantwort: K_S, T_U, T_G, T_Σ',
    quellen: 'Ü06 A2 · V06 (T-Summe, Chien-Hrones-Reswick)',
    stichworte: 'kennwerte sprungantwort verstärkung K_S verzugszeit T_U ausgleichszeit T_G summenzeitkonstante T_Sigma wendetangente wendepunkt steuerfläche flächenmethode ablesen tangentenmethode',
    frage: 'Gegeben ist die Sprungantwort einer Strecke (Eingangssprung z. B. von 6 auf 9). Bestimmen Sie Verstärkung K_S, Verzugszeit T_U, Ausgleichszeit T_G und Summenzeitkonstante T_Σ.',
    antwort: [
      { t: 'zwischen', text: 'Verstärkung K_S' },
      { t: 'formel', text: 'K_S = Δx_a / Δx_e = (Endwert − Anfangswert) / Sprunghöhe\nBeispiel Ü06: K_S = (3,5 − 2,5)/(9 − 6) = 1/3' },
      { t: 'zwischen', text: 'T_U und T_G mit der Wendetangente' },
      { t: 'liste', nummeriert: true, items: [
        'Wendepunkt der Sprungantwort suchen (steilste Stelle).',
        'Dort die Tangente anlegen (Wendetangente).',
        'T_U (Verzugszeit): Zeit vom Sprungbeginn bis zum Schnittpunkt der Tangente mit dem Anfangswert (Zeitachse).',
        'T_G (Ausgleichszeit): Zeit zwischen den Schnittpunkten der Tangente mit dem Anfangswert und mit dem Endwert (K_S-Niveau).',
      ] },
      { t: 'svg', svg: svgKennwerte, unterschrift: 'Wendetangente: T_U bis zum Schnitt mit der Zeitachse, T_G bis zum Schnitt mit dem Endwert K_S.' },
      { t: 'zwischen', text: 'Summenzeitkonstante T_Σ (Flächenmethode)' },
      { t: 'p', text: 'Die Steuerfläche A ist die Fläche zwischen Endwert und Sprungantwort (für den Einheitssprung gerechnet, bei anderer Sprunghöhe durch diese teilen). T_Σ ist die Zeit, bei der die Fläche A₁ links der Linie gleich der Fläche A₂ rechts davon ist. Der Endwert von h(t) ist K_S.' },
      { t: 'formel', text: 'T_Σ = A / K_S' },
      { t: 'p', text: 'Ergebnis in Ü06: K_S = 1/3, T_U ≈ 7, T_G ≈ 20, T_Σ ≈ 19. (Alternativ abgelesen: T_U ≈ 6, T_G ≈ 28.)' },
      { t: 'hinweis', text: 'Nur für P-Tₙ-Strecken ohne oder mit kleiner Totzeit. Die Wendetangentenmethode ist ungenau bei verrauschten Sprungantworten, und für PT₁-Strecken nicht geeignet (keine Verzugszeit). Nicht für schwingfähige Strecken.' },
      { t: 'link', ziel: 'pid', text: 'PID-Einstellregeln (T-Summe, CHR, Ziegler-Nichols)' },
    ],
  },

  // ================= Ü05 Gütefunktionen =================
  {
    id: 'guetefunktionen',
    bereich: 'theorie',
    titel: 'Gütefunktionen (Regelflächen)',
    quellen: 'Ü05 A3 · V05 (Gütekriterien)',
    stichworte: 'gütefunktion güte kriterium regelfläche integralkriterium ITAE quadratische regelfläche stellaufwand betragslinear optimierung J minimieren',
    frage: 'Welche der gezeigten Gütefunktionen betrachtet auch die Energie der Stellgröße? Warum ist das sinnvoll? Wie berechnet man die Gütefunktionen in der Praxis?',
    antwort: [
      { t: 'p', text: 'Gütefunktionen (Integralkriterien) bewerten den Regelfehler e(t). Man legt J fest und minimiert J → min. Der Regelfehler soll klein werden, der Stellgrößenaufwand kann mitberücksichtigt werden.' },
      { t: 'tabelle',
        kopf: ['Kriterium', 'Formel'],
        zeilen: [
          ['Betragslineare Regelfläche', 'J = ∫₀^∞ |e(t)| dt'],
          ['Quadratische Regelfläche', 'J = ∫₀^∞ e²(t) dt'],
          ['Zeitbewertete betragslineare Regelfläche (ITAE)', 'J = ∫₀^∞ t·|e(t)| dt'],
          ['Quadratische Regelfläche mit Bewertung des Stellaufwands', 'J = ∫₀^∞ (e²(t) + K_y·y²(t)) dt'],
        ] },
      { t: 'zwischen', text: 'Antworten Ü05 A3' },
      { t: 'liste', items: [
        'Die Energie der Stellgröße berücksichtigt die „quadratische Regelfläche mit Bewertung des Stellaufwands“ (Term K_y·y²).',
        'Sinnvoll, weil damit die Stellgröße beschränkt wird. Sonst ist eine sehr hohe Stellenergie möglich.',
        'In der Praxis berechnet man die Gütefunktionen numerisch, z. B. mit MATLAB, WinFACT oder Python.',
      ] },
      { t: 'hinweis', text: 'ITAE = integral of time multiplied absolute value of error. Späte Fehler zählen stärker, deshalb klingt der Fehler schnell ab.' },
    ],
  },

  // ================= Ü04 Pol-Nullstellen-Diagramm =================
  {
    id: 'pol-nullstellen-diagramm',
    bereich: 'theorie',
    titel: 'Pol-Nullstellen-Diagramm zeichnen und lesen',
    quellen: 'Ü05 A2 · Ü04 A1',
    stichworte: 'pol nullstellen diagramm polstellen nullstellen komplexe ebene kreuz kreis stabilität zeichnen lesen produktdarstellung pzmap',
    frage: 'Gegeben G(s) = (−4s² − 3s + 1)/(30s³ + 31s² + 10s + 1). Berechnen Sie Pol- und Nullstellen, zeichnen Sie das Pol-Nullstellen-Diagramm. Ist die Strecke stabil?',
    antwort: [
      { t: 'p', text: 'Pole = Nullstellen des Nenners (Kreuz ×), Nullstellen = Nullstellen des Zählers (Kreis ○). Gezeichnet in der komplexen Ebene: waagrecht Re, senkrecht Im. Reelle Pole und Nullstellen liegen auf der Re-Achse.' },
      { t: 'formel', text: 'Zähler: −4s² − 3s + 1 = 0 ⇒ 4s² + 3s − 1 = 0 ⇒ s = (−3 ± 5)/8 ⇒ s = 0,25 und s = −1\nNenner: 30s³ + 31s² + 10s + 1 = 0 ⇒ s = −1/2, −1/3, −1/5' },
      { t: 'svg', svg: svgPN, unterschrift: 'Pole bei −1/2, −1/3, −1/5. Nullstellen bei −1 und +0,25.' },
      { t: 'p', text: 'Stabil: ja, denn alle Pole liegen links der imaginären Achse (Re < 0). Die Nullstelle bei +0,25 in der rechten Halbebene beeinflusst die Stabilität nicht, nur den Verlauf.' },
      { t: 'hinweis', text: 'Lesen: Komplexe Pole treten als konjugiert komplexes Paar auf (spiegelbildlich zur Re-Achse) und bedeuten Schwingen. Pole auf der imaginären Achse: grenzstabil. Pole rechts: instabil. Produktdarstellung: G(s) = K·Π(s − nullstelle)/Π(s − pol).' },
      { t: 'link', ziel: 'polynom', text: 'Polynom-Werkzeug (Pole, Nullstellen)' },
      { t: 'link', ziel: 'pid', text: 'PID-Regler (Ü04: PI-DT1)' },
    ],
  },
];
