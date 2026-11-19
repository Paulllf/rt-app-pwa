// Vorlesung 04: Regelstrecken, Regler, Reglerentwurf – Format: tools/inhalte-format.md
// Foliennummer = PDF-Seite (geprüft). Skizzen aus kleinen Hilfsfunktionen (nur currentColor, kein Skript, kein Link).

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
const kasten = (x, y, b, h, s, gr = 14) =>
  `<rect x="${x}" y="${y}" width="${b}" height="${h}" fill="none" stroke="currentColor" stroke-width="1.5"/>` +
  txt(x + b / 2, y + h / 2 + 4, s, 'middle', gr);
const kreis = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
const punkt = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="2.5" fill="currentColor"/>`;
const kurve = (pts) => `<polyline points="${pts.map(([x, y]) => `${n1(x)},${n1(y)}`).join(' ')}" fill="none" stroke="currentColor" stroke-width="2"/>`;
const kopf = (b, h) => `<svg viewBox="0 0 ${b} ${h}" xmlns="http://www.w3.org/2000/svg">`;

// Diagramm h(t): Ursprung (35,115), x-Achse bis breite-12, y-Achse bis 8
const OX = 35, OY = 115;
function diagramm(inhalt, breite = 225, hoehe = 135, ylab = 'h(t)') {
  return `<svg viewBox="-12 -4 ${breite + 12} ${hoehe + 12}" xmlns="http://www.w3.org/2000/svg">` +
    pfeil(OX, OY, breite - 12, OY) + pfeil(OX, OY, OX, 8) +
    txt(breite - 10, OY + 4, 't') + txt(OX + 6, 14, ylab) + inhalt + '</svg>';
}
const verlauf = (f, t0, t1, sx, sy, schritte = 60) => {
  const p = [];
  for (let i = 0; i <= schritte; i++) { const t = t0 + (t1 - t0) * i / schritte; p.push([OX + t * sx, OY - f(t) * sy]); }
  return kurve(p);
};

// ---------- PT1 ----------
const svgPT1 = diagramm(
  gestr(OX, 40, 205, 40) + txt(OX - 5, 44, 'K', 'end', 13) +
  verlauf((t) => 1 - Math.exp(-t), 0, 5.6, 30, 75) +
  gestr(OX, OY, OX + 30, 40) + gestr(OX + 30, 40, OX + 30, OY) + txt(OX + 30, OY + 13, 'T', 'middle', 12) +
  txt(135, 100, 'h(t) = K·(1 − e^(−t/T))', 'middle', 11) + txt(OX + 40, 62, 'Tangente bei t = 0', 'start', 10));

// ---------- PT3 mit Wendetangente (numerisch aus G(s) = 1/((1+2s)(1+3s)(1+5s))) ----------
function pt3() {
  const T = [2, 3, 5], dt = 0.01, x = [0, 0, 0], pts = [];
  let best = { s: 0 };
  for (let t = 0; t <= 45; t += dt) {
    const d0 = (1 - x[0]) / T[0], d1 = (x[0] - x[1]) / T[1], d2 = (x[1] - x[2]) / T[2];
    x[0] += d0 * dt; x[1] += d1 * dt; x[2] += d2 * dt;
    pts.push([t, x[2]]);
    if (d2 > best.s) best = { s: d2, t, h: x[2] };
  }
  return { pts, best };
}
const P3 = pt3();
const sx3 = 4.6, sy3 = 85;
const tU3 = P3.best.t - P3.best.h / P3.best.s, tE3 = P3.best.t + (1 - P3.best.h) / P3.best.s;
const svgPT3 = diagramm(
  gestr(OX, OY - sy3, 250, OY - sy3) + txt(OX - 5, OY - sy3 + 4, 'K_S', 'end', 12) +
  kurve(P3.pts.filter((_, i) => i % 40 === 0).map(([t, h]) => [OX + t * sx3, OY - h * sy3])) +
  lin(OX + tU3 * sx3, OY, OX + tE3 * sx3, OY - sy3, 'stroke-dasharray="5 3" stroke-width="1.2"') +
  punkt(OX + P3.best.t * sx3, OY - P3.best.h * sy3) + txt(OX + P3.best.t * sx3 + 8, OY - P3.best.h * sy3 + 14, 'Wendepunkt', 'start', 10) +
  gestr(OX + tE3 * sx3, OY - sy3, OX + tE3 * sx3, OY + 18) +
  lin(OX, OY + 12, OX + tU3 * sx3, OY + 12, 'stroke-width="1"') + txt(OX + tU3 * sx3 / 2, OY + 25, 'T_U', 'middle', 11) +
  lin(OX + tU3 * sx3, OY + 12, OX + tE3 * sx3, OY + 12, 'stroke-width="1"') + txt(OX + (tU3 + tE3) * sx3 / 2, OY + 25, 'T_G', 'middle', 11),
  270, 145);

// ---------- PT2: Pole in der s-Ebene (0 < d < 1) ----------
const svgPT2pole = kopf(300, 170) +
  pfeil(10, 85, 290, 85) + pfeil(190, 165, 190, 8) + txt(288, 78, 'Re', 'end') + txt(196, 16, 'Im') +
  `<path d="M190 8 A 80 80 0 0 0 190 162" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>` +
  lin(190, 85, 118, 50, 'stroke-width="1"') + lin(190, 85, 118, 120, 'stroke-width="1"') +
  lin(113, 45, 123, 55) + lin(113, 55, 123, 45) + lin(113, 115, 123, 125) + lin(113, 125, 123, 115) +
  lin(118, 85, 118, 50, 'stroke-dasharray="2 3" stroke-width="1"') +
  txt(118, 100, '−d·ω₀', 'middle', 11) + txt(196, 52, 'ω₀·√(1−d²)', 'start', 11) + txt(196, 126, '−ω₀·√(1−d²)', 'start', 11) +
  txt(6, 22, 'Pole auf Kreis mit Radius ω₀', 'start', 11) + txt(30, 160, '0 < d < 1: konjugiert komplex', 'start', 11) + '</svg>';

// ---------- Totzeitstrecke und I-T1 ----------
const svgTotzeit = diagramm(
  gestr(OX, 40, 205, 40) + txt(OX - 5, 44, 'K', 'end', 13) +
  kurve([[OX, OY], [OX + 30, OY], ...Array.from({ length: 50 }, (_, i) => { const t = i * 0.1; return [OX + 30 + t * 30, OY - 75 * (1 - Math.exp(-t))]; })]) +
  gestr(OX + 30, OY, OX + 30, OY + 14) + txt(OX + 30, OY + 25, 'T_t', 'middle', 12) +
  txt(OX + 40, 28, 'G(s) = K/(Ts+1) · e^(−s·T_t)', 'start', 11), 225, 145);
const svgIT1 = diagramm(
  verlauf((t) => 0.28 * (t - 1 + Math.exp(-t)) , 0, 5.4, 32, 75, 70) +
  gestr(OX + 32, OY, OX + 5.4 * 32, OY - 0.28 * 4.4 * 75) + gestr(OX + 32, OY, OX + 32, OY + 14) + txt(OX + 32, OY + 25, 'T', 'middle', 12) +
  txt(OX + 8, 30, 'K = Steigung der Tangente', 'start', 11) + txt(OX + 8, 44, 'G(s) = K/(s·(Ts+1))', 'start', 11),
  235, 145);

// ---------- Lead-Lag und PD-T1: Sprungantwort fällt von Startwert auf Endwert ----------
const fall = (start, ende, tText, startText, endeText) => diagramm(
  kurve(Array.from({ length: 60 }, (_, i) => { const t = i * 0.1; return [OX + t * 30, OY - 16 * (ende + (start - ende) * Math.exp(-t))]; })) +
  gestr(OX, OY - 16 * ende, 205, OY - 16 * ende) + txt(209, OY - 16 * ende + 4, endeText, 'start', 11) +
  txt(OX + 6, OY - 16 * start + 4, startText, 'start', 11) +
  gestr(OX + 30, OY - 16 * ende, OX + 30, OY + 14) + txt(OX + 30, OY + 25, tText, 'middle', 12),
  255, 140);
const svgLead = fall(5, 1, 'T', 'a', '1');
const svgPDT1 = fall(5, 1, 'T_1', 'K_P·(1+T_v/T_1)', 'K_P');

// ---------- PI-Regler: Sprungantwort ----------
const svgPI = diagramm(
  gestr(OX, 80, 215, 80) + txt(OX - 5, 84, 'K_P', 'end', 12) +
  kurve([[OX, OY], [OX, 80], [215, 80 - 75 * 0.55]]) +
  gestr(OX - 28, OY, OX, 80) +
  txt(OX - 28, OY + 14, '−T_n', 'middle', 11) + txt(OX + 10, 70 - 30, 'P-Sprung K_P', 'start', 11) +
  txt(112, 52, 'I-Rampe, Steigung K_P/T_n', 'start', 10) + txt(OX + 6, 100, 'tan α = K_P/T_n', 'start', 11),
  250, 135, 'y(t)');

// ---------- Anti-Windup ----------
const svgAntiWindup = kopf(440, 200) +
  txt(4, 79, 'e(t)') + lin(30, 75, 48, 75) + punkt(48, 75) +
  lin(48, 75, 48, 35) + pfeil(48, 35, 68, 35) + kasten(68, 20, 44, 30, 'K_P') + lin(112, 35, 270, 35) + pfeil(270, 35, 270, 66) +
  lin(48, 75, 48, 118) + pfeil(48, 118, 68, 118) + kasten(68, 103, 44, 30, 'K_I') +
  pfeil(112, 118, 151, 118) + kreis(160, 118) + pfeil(169, 118, 190, 118) + kasten(190, 103, 44, 30, '∫') +
  lin(234, 118, 270, 118) + pfeil(270, 118, 270, 84) + kreis(270, 75) + txt(280, 62, '+', 'start', 11) + txt(280, 98, '+', 'start', 11) +
  pfeil(279, 75, 310, 75) + kasten(306, 55, 64, 40, 'Begrenzung', 10) + lin(370, 75, 420, 75) + punkt(385, 75) + pfeil(410, 75, 422, 75) + txt(424, 66, 'y(t)', 'end', 12) +
  lin(292, 75, 292, 160) + punkt(292, 75) + pfeil(292, 160, 262, 160) + kreis(253, 160) + txt(262, 150, '+', 'start', 11) +
  lin(385, 75, 385, 175) + lin(385, 175, 253, 175) + pfeil(253, 175, 253, 169) + txt(325, 190, '− (y nach Begrenzung)', 'middle', 10) +
  pfeil(244, 160, 215, 160) + kasten(165, 145, 50, 30, '1/T_ikorr', 11) + lin(165, 160, 151, 160) + pfeil(151, 160, 151, 127) + txt(137, 140, '−', 'start', 12) +
  txt(155, 112, '+', 'start', 11) + '</svg>';

// ---------- Regelkreis mit Störeinkopplung ----------
const svgStoerkreis = kopf(440, 170) +
  txt(4, 59, 'W(s)') + pfeil(36, 55, 71, 55) + kreis(80, 55) + txt(64, 47, '+', 'start', 11) + txt(88, 78, '−', 'start', 12) +
  pfeil(89, 55, 120, 55) + txt(104, 46, 'E', 'middle', 11) + kasten(120, 40, 50, 30, 'R(s)') +
  pfeil(170, 55, 200, 55) + txt(185, 46, 'Y', 'middle', 11) + kasten(200, 40, 50, 30, 'G₁(s)') +
  pfeil(250, 55, 283, 55) + kreis(292, 55) + pfeil(301, 55, 330, 55) + kasten(330, 40, 50, 30, 'G₂(s)') +
  pfeil(292, 12, 292, 46) + txt(300, 20, 'Z(s)', 'start', 12) + txt(299, 47, '+', 'start', 11) +
  lin(380, 55, 425, 55) + punkt(400, 55) + pfeil(425, 55, 436, 55) + txt(422, 44, 'X(s)', 'end', 12) +
  lin(400, 55, 400, 130) + pfeil(400, 130, 250, 130) + kasten(200, 115, 50, 30, 'G_M(s)', 13) + lin(200, 130, 80, 130) + pfeil(80, 130, 80, 64) +
  txt(145, 100, 'Regler', 'middle', 10) + txt(290, 100, 'Strecke G₁G₂', 'middle', 10) + '</svg>';

export const ANTWORTEN = [
  // ================= PT1 =================
  {
    id: 'v04-pt1',
    bereich: 'vorlesung',
    vorlesung: 'V04',
    titel: 'PT1-Glied: Verzögerungsglied 1. Ordnung, Strecke mit Ausgleich',
    quellen: 'V04 Folie 4–6',
    stichworte: 'PT1 P-T1 verzögerung erster ordnung zeitkonstante T verstärkung K ausgleich ohne ausgleich BIBO stabil RC-Schaltung tiefpass sprungantwort tangente 63 prozent',
    frage: 'Was versteht man unter einer Strecke mit und ohne Ausgleich? Geben Sie G(s) und die Sprungantwort eines PT1-Glieds an und lesen Sie K und T aus der Kurve ab.',
    antwort: [
      { t: 'p', text: 'PT1-Glied = Verzögerungsglied 1. Ordnung (Beispiel: RC-Schaltung).' },
      { t: 'formel', text: 'G(s) = K / (T·s + 1)        h(t) = K·(1 − e^(−t/T))' },
      { t: 'svg', svg: svgPT1, unterschrift: 'Sprungantwort PT1: Tangente durch t = 0 schneidet den Endwert K bei t = T.' },
      { t: 'liste', items: [
        'Strecke mit Ausgleich: begrenzter Eingang → begrenzter Ausgang. Stabil (BIBO-Stabilität = Bounded Input, Bounded Output). Beispiel: PT1.',
        'Strecke ohne Ausgleich: unbegrenzter Ausgang → instabil im BIBO-Sinn. Beispiel: I-Glied.',
      ] },
      { t: 'zwischen', text: 'Ablesen (Beispiel der Folie)' },
      { t: 'p', text: 'Endwert K = 2,2. Tangente durch t = 0 schneidet den Endwert bei t = 5 s, also T = 5 s.' },
      { t: 'link', ziel: 'a/grundglieder', text: 'Alle Grundglieder mit G(s) und Skizzen' },
    ],
  },

  // ================= PTn, Ersatzmodell =================
  {
    id: 'v04-ptn',
    bereich: 'vorlesung',
    vorlesung: 'V04',
    titel: 'PTn-Glied: Reihenschaltung, Ersatzmodell T_U und T_G aus der Sprungantwort',
    quellen: 'V04 Folie 7–11',
    stichworte: 'PTn P-Tn reihenschaltung PT1 verzugszeit ausgleichszeit T_U T_G wendetangente totzeit ersatzmodell signalflussplan störgröße z1 z2 3. ordnung',
    frage: 'Berechnen Sie G(s) für drei in Reihe geschaltete PT1-Glieder (T = 2 s, 3 s, 5 s) in Polynomform. Wie bestimmt man aus der Sprungantwort ein Ersatzmodell aus Totzeit und PT1-Glied?',
    antwort: [
      { t: 'p', text: 'PTn-Glied = Reihenschaltung von n PT1-Gliedern. Die Übertragungsfunktionen werden multipliziert.' },
      { t: 'formel', text: 'G(s) = 1/(1+2s) · 1/(1+3s) · 1/(1+5s) = 1 / (30s³ + 31s² + 10s + 1)' },
      { t: 'p', text: 'Nachrechnen: (1+2s)(1+3s) = 1 + 5s + 6s²;  mal (1+5s) = 1 + 10s + 31s² + 30s³.' },
      { t: 'p', text: 'Signalflussplan: drei PT1-Kästen hintereinander, Störgrößen z₁ und z₂ greifen zwischen den Gliedern an (Summationsstellen).' },
      { t: 'zwischen', text: 'Ersatzmodell: Totzeit + PT1' },
      { t: 'p', text: 'Wendetangente an die Sprungantwort legen. Verzugszeit T_U = Schnitt der Tangente mit der Zeitachse. Ausgleichszeit T_G = Zeit zwischen Schnitt mit der t-Achse und Schnitt mit dem Endwert K_S.' },
      { t: 'svg', svg: svgPT3, unterschrift: 'Sprungantwort von 1/((1+2s)(1+3s)(1+5s)) mit Wendetangente, T_U und T_G.' },
      { t: 'p', text: 'Folie: T_U ≈ 2 s, T_G ≈ 11 s (aus der Kurve abgelesen).' },
      { t: 'hinweis', text: 'Rechnerisch (Simulation) liegen T_U ≈ 2,5 s und T_G ≈ 12 s. Die Folienwerte sind Ablesewerte, „≈“ so hinschreiben. Die Kurve auf Folie 11 hat Endwert 3, die G(s) oben hat K = 1: Zeitwerte T_U, T_G sind davon unabhängig.' },
      { t: 'link', ziel: 'a/kennwerte-sprungantwort', text: 'Kennwerte der Sprungantwort' },
      { t: 'link', ziel: 'polynom', text: 'Polynom-Rechner (Ausmultiplizieren)' },
    ],
  },

  // ================= PT2 =================
  {
    id: 'v04-pt2',
    bereich: 'vorlesung',
    vorlesung: 'V04',
    titel: 'PT2-Glied: Dämpfung d, Kennkreisfrequenz ω₀, Pole, Feder-Masse-Dämpfer',
    quellen: 'V04 Folie 12–16',
    stichworte: 'PT2 P-T2 verzögerung zweiter ordnung dämpfung d kennkreisfrequenz omega0 zeitkonstante feder masse dämpfer schwinger aperiodisch grenzfall schwingend ungedämpft pole halbebene',
    frage: 'Stellen Sie die DGL und G(s) für das Feder-Masse-Dämpfer-System auf. Geben Sie beide Darstellungen des PT2-Glieds an, ordnen Sie den Dämpfungswerten den Verlauf zu und berechnen Sie die Pole.',
    antwort: [
      { t: 'zwischen', text: 'Feder-Masse-Dämpfung (Rad)' },
      { t: 'p', text: 'Kräftesumme am Rad: F = F_m + F_r + F_c. Eingang F = x_e (Kraft von unten), Ausgang w = x_a (Weg).' },
      { t: 'formel', text: 'x_e = m·ẍ_a + r·ẋ_a + c·x_a        G(s) = 1 / (m·s² + r·s + c)' },
      { t: 'zwischen', text: 'Zwei Standarddarstellungen' },
      { t: 'formel', text: 'Darstellung 1:  G(s) = K / (T²s² + 2dT·s + 1)' },
      { t: 'formel', text: 'Darstellung 2:  G(s) = K·ω₀² / (s² + 2dω₀·s + ω₀²)' },
      { t: 'p', text: 'T = Zeitkonstante, d = Dämpfung, ω₀ = 1/T = Kennkreisfrequenz.' },
      { t: 'tabelle', kopf: ['Fall', 'Dämpfung', 'Verlauf von h(t)', 'Stabilität'], zeilen: [
        ['1', 'd > 1', 'aperiodisch', 'stabil'],
        ['2', 'd = 1', 'aperiodischer Grenzfall', 'stabil'],
        ['3', '1 > d > 0', 'periodisch gedämpft', 'stabil'],
        ['4', 'd = 0', 'periodisch ungedämpft', 'grenzstabil'],
        ['5', 'd < 0', 'periodisch aufklingend', 'instabil'],
      ] },
      { t: 'zwischen', text: 'Pole (Nullstellen des Nenners)' },
      { t: 'formel', text: 's₁,₂ = −d·ω₀ ± √(d²ω₀² − ω₀²) = −d·ω₀ ± ω₀·√(d² − 1)' },
      { t: 'formel', text: 'Fall 3 (0 < d < 1):  s₁,₂ = −d·ω₀ ± j·ω₀·√(1 − d²)' },
      { t: 'svg', svg: svgPT2pole, unterschrift: 'Pole für 0 < d < 1 liegen auf dem Kreis mit Radius ω₀. Mit kleiner werdendem d wandern sie zur imaginären Achse.' },
      { t: 'hinweis', text: 'Koeffizientenvergleich Feder-Masse (eigene Nebenrechnung, steht so nicht auf der Folie): K = 1/c, T² = m/c, 2dT = r/c, also ω₀ = √(c/m) und d = r/(2·√(m·c)).' },
      { t: 'link', ziel: 'a/pol-nullstellen-diagramm', text: 'Pol-Nullstellen-Diagramm und Stabilität' },
    ],
  },

  // ================= Totzeit und IT1 =================
  {
    id: 'v04-totzeit-it1',
    bereich: 'vorlesung',
    vorlesung: 'V04',
    titel: 'Totzeitstrecke mit Verzögerung und I-T1-Glied (integrale Strecke)',
    quellen: 'V04 Folie 17–18',
    stichworte: 'totzeit T_t e hoch minus s T_t PT1 totzeitglied integrale strecke I-T1 integrator verzögerung steigung tangente ohne ausgleich',
    frage: 'Geben Sie G(s) und die Sprungantwort einer Totzeitstrecke mit Verzögerung sowie einer integralen Strecke mit Verzögerung an.',
    antwort: [
      { t: 'zwischen', text: 'Totzeitstrecke mit Verzögerung' },
      { t: 'p', text: 'Reihenschaltung von Totzeitglied (T_t) und PT1-Glied (T).' },
      { t: 'formel', text: 'G(s) = K / (T·s + 1) · e^(−s·T_t)' },
      { t: 'svg', svg: svgTotzeit, unterschrift: 'Sprungantwort: nichts passiert bis T_t, danach PT1-Verlauf gegen K.' },
      { t: 'zwischen', text: 'Integrale Strecke mit Verzögerung (I-T1-Glied)' },
      { t: 'p', text: 'Reihenschaltung von Integrator und PT1-Glied. Strecke ohne Ausgleich: h(t) wächst am Ende linear.' },
      { t: 'formel', text: 'G(s) = K / ( s·(T·s + 1) )' },
      { t: 'svg', svg: svgIT1, unterschrift: 'Sprungantwort I-T1 (Folie: K = 0,5, T = 1). Die Asymptote schneidet die t-Achse bei t = T.' },
      { t: 'p', text: 'K = Steigung der Tangente (der Asymptote). Die „Totzeit“ im Bild der Folie ist der Schnittpunkt dieser Tangente mit der Zeitachse (t = T).' },
    ],
  },

  // ================= Lead-Lag =================
  {
    id: 'v04-lead-lag',
    bereich: 'vorlesung',
    vorlesung: 'V04',
    titel: 'Lead-Lag-Glied (PD-T1-Glied): phasenanhebend a > 1, phasenabsenkend a < 1',
    quellen: 'V04 Folie 19–21',
    stichworte: 'lead lag lead-lag PD-T1 phasenanhebend phasenabsenkend phasenreserve a T frequenzgang vorhalt nachgebend',
    frage: 'Geben Sie G(s) und G(jω) des Lead-Lag-Glieds an. Wann ist es phasenanhebend, wann phasenabsenkend? Wie sieht die Sprungantwort aus?',
    antwort: [
      { t: 'formel', text: 'G(s) = (a·T·s + 1) / (T·s + 1)        G(jω) = (a·T·jω + 1) / (T·jω + 1)' },
      { t: 'liste', items: [
        'Lead-Lag-Glied beeinflusst die Phase.',
        'Lead = phasenanhebendes Verhalten: a > 1.',
        'Lag = phasenabsenkendes Verhalten: a < 1.',
      ] },
      { t: 'zwischen', text: 'Sprungantwort (eigene Herleitung, passt zur Folie mit a = 10, T = 1)' },
      { t: 'formel', text: 'G(s) = a + (1 − a)/(T·s + 1)   →   h(t) = 1 + (a − 1)·e^(−t/T)' },
      { t: 'p', text: 'Start h(0) = a, Endwert h(∞) = 1. Für a = 10, T = 1 fällt die Kurve von 10 auf 1 (so zeigt es die Folie).' },
      { t: 'svg', svg: svgLead, unterschrift: 'Sprungantwort Lead (a > 1): Start bei a, Endwert 1, Zeitkonstante T.' },
      { t: 'zwischen', text: 'Maximale Phasenanhebung (Standardformel, nicht auf der Folie)' },
      { t: 'formel', text: 'φ_max = arcsin( (a − 1)/(a + 1) )  bei  ω = 1/(T·√a)' },
      { t: 'p', text: 'Für a = 10: φ_max ≈ 55° bei ω ≈ 0,32 rad/s; der Betrag steigt von 0 dB auf 20·log(a) = 20 dB.' },
      { t: 'hinweis', text: 'Im Bode-Bild der Folie 20 steht die Phase zwischen −315° und −360°. Das ist nur die Darstellung der Software (Phase um 360° verschoben). Tatsächlich ist die Phase positiv, 0° … +55°.' },
      { t: 'p', text: 'Der PD-T1-Regler ist ein Lead-Lag-Glied (siehe PD-T1-Regler).' },
    ],
  },

  // ================= Allgemeines rationales Übertragungsglied =================
  {
    id: 'v04-rationales-uebertragungsglied',
    bereich: 'vorlesung',
    vorlesung: 'V04',
    titel: 'Allgemeines rationales Übertragungsglied: Polynom-/Produktdarstellung, Pole, Nullstellen, DGL',
    quellen: 'V04 Folie 22–26',
    stichworte: 'rationales übertragungsglied zählerpolynom nennerpolynom polynomdarstellung produktdarstellung polynomdivision pq-formel ausmultiplizieren nullstellen polstellen minimalphasig wurzeln eigenwerte DGL aus übertragungsfunktion zählergrad nennergrad',
    frage: 'Wie erhält man aus der Übertragungsfunktion G(s) die Differentialgleichung? Erklären Sie Polynom- und Produktdarstellung, wie man umwandelt, und was Pole und Nullstellen bedeuten.',
    antwort: [
      { t: 'formel', text: 'G(s) = X_a(s)/X_e(s) = Z(s)/N(s) = (b_m·sᵐ + … + b₁s + b₀) / (a_n·sⁿ + … + a₁s + a₀),   m < n' },
      { t: 'p', text: 'Zählergrad kleiner Nennergrad (m < n).' },
      { t: 'zwischen', text: 'DGL aus G(s)' },
      { t: 'formel', text: 'X_a(s)·N(s) = X_e(s)·Z(s)' },
      { t: 'formel', text: 'Bildbereich:  X_a·(aₙsⁿ + … + a₁s + a₀) = X_e·(bₘsᵐ + … + b₁s + b₀)' },
      { t: 'formel', text: 'Zeitbereich:  aₙ·xₐ⁽ⁿ⁾ + … + a₁·ẋₐ + a₀·xₐ = bₘ·xₑ⁽ᵐ⁾ + … + b₁·ẋₑ + b₀·xₑ' },
      { t: 'p', text: 'Regel: s^k ↔ k-te Ableitung (Anfangswerte 0).' },
      { t: 'zwischen', text: 'Zwei Darstellungen' },
      { t: 'formel', text: 'Polynomdarstellung:  G(s) = Z(s) / Σᵢ aᵢ·sⁱ' },
      { t: 'formel', text: 'Produktdarstellung:  G(s) = Z(s) / ( (1 + T₁s)(1 + T₂s)···(1 + Tₙs) )' },
      { t: 'tabelle', kopf: ['Von → nach', 'Verfahren'], zeilen: [
        ['Polynom → Produkt', 'Polynomdivision, pq-Formel (Nullstellen des Nenners bestimmen)'],
        ['Produkt → Polynom', 'Ausmultiplizieren'],
      ] },
      { t: 'zwischen', text: 'Nullstellen und Pole' },
      { t: 'liste', items: [
        'Nullstellen: Z(s) = 0 (Nullstellen des Zählerpolynoms). Benötigt für Minimalphasigkeit, bestimmen das dynamische Verhalten.',
        'Polstellen: N(s) = 0 (Nullstellen des Nennerpolynoms). Benötigt für die Stabilitätsbetrachtung. Heißen auch Wurzeln, Eigenwerte des Nennerpolynoms.',
      ] },
      { t: 'formel', text: 's_i = −1/T_i = −1/λ_i' },
      { t: 'link', ziel: 'dgl', text: 'DGL-Rechner' },
      { t: 'link', ziel: 'polynom', text: 'Polynom-Rechner (Pole, Produktform)' },
      { t: 'link', ziel: 'a/lti-system', text: 'LTI-System' },
    ],
  },

  // ================= P, I, PI =================
  {
    id: 'v04-p-i-pi-regler',
    bereich: 'vorlesung',
    vorlesung: 'V04',
    titel: 'P-, I- und PI-Regler: Aufbau, Sprungantwort, K_P und T_n grafisch',
    quellen: 'V04 Folie 27–32',
    stichworte: 'P-Regler I-Regler PI-Regler regelabweichung e(t) stellgröße y(t) nachstellzeit T_n proportionalbeiwert K_P tan alpha parallelschaltung bode regler grundtypen',
    frage: 'Beschreiben Sie P-, I- und PI-Regler. Skizzieren Sie die Sprungantwort des PI-Reglers und zeigen Sie, wie man K_P und T_n grafisch ermittelt.',
    antwort: [
      { t: 'liste', items: [
        'P-Regler: Stellgröße proportional zur Regelabweichung e(t). Je größer die Regelabweichung, desto größer die Stellgröße.',
        'I-Regler: integriert die Regelabweichung e(t). Je länger die Regelabweichung anhält, desto größer die Stellgröße.',
        'PI-Regler: Parallelschaltung von P- und I-Glied. Regelabweichung e(t) rein, Stellgröße y(t) raus (beide Zweige addiert).',
      ] },
      { t: 'formel', text: 'y(t) = K_P·e(t) + K_I·∫e(t)dt = K_P·( e(t) + 1/T_n · ∫e(t)dt )' },
      { t: 'formel', text: 'R(s) = K_P + K_I/s = K_P·(1 + 1/(T_n·s)),   K_I = K_P/T_n' },
      { t: 'svg', svg: svgPI, unterschrift: 'PI-Regler, Sprungantwort: P-Sprung auf K_P, danach Rampe. Die Rückverlängerung der Rampe schneidet die t-Achse bei −T_n.' },
      { t: 'zwischen', text: 'Grafische Ermittlung (Folie 31)' },
      { t: 'formel', text: 'tan α = K_P / T_n' },
      { t: 'p', text: 'K_P = Sprunghöhe bei t = 0. T_n = Zeit, in der die I-Rampe den P-Anteil nochmal aufbringt (T_n = „Nachstellzeit“).' },
      { t: 'p', text: 'Bode-Diagramm der Folie 32: K_P = 1, T_n = 2 (Nachstellzeit).' },
      { t: 'link', ziel: 'a/pid-ideal-real', text: 'PID ideal und real (mit Skizzen)' },
      { t: 'link', ziel: 'a/grundglieder', text: 'P- und I-Glied als Grundglieder' },
    ],
  },

  // ================= Anti-Windup =================
  {
    id: 'v04-anti-windup',
    bereich: 'vorlesung',
    vorlesung: 'V04',
    titel: 'Praktischer PI-Regler mit Anti-Windup (Stellgrößenbeschränkung)',
    quellen: 'V04 Folie 33',
    stichworte: 'anti-windup anti windup stellgrößenbeschränkung begrenzung integrator sättigung T_ikorr gegenkopplung auf den integrator windup',
    frage: 'Was passiert bei einem PI-Regler mit beschränkter Stellgröße? Wie verhindert man das (Anti-Windup)? Skizzieren Sie das Blockschaltbild.',
    antwort: [
      { t: 'p', text: 'Bei beschränkter Stellgröße wird die Strecke nicht geregelt, sondern gesteuert. Der Integrator läuft weiter („windup“), obwohl die Stellgröße schon in der Begrenzung steht.' },
      { t: 'p', text: 'Lösung Anti-Windup: Gegenkopplung auf den Integrator, wenn die Stellgröße in der Beschränkung ist. Die Differenz Stellgröße vor/nach Begrenzung wird über 1/T_ikorr auf den Integratoreingang zurückgeführt.' },
      { t: 'formel', text: 'T_ikorr ≈ T_n        K_I = K_P/T_n' },
      { t: 'svg', svg: svgAntiWindup, unterschrift: 'PI-Regler mit Begrenzung: Rückführung (y vor Begrenzung − y nach Begrenzung) · 1/T_ikorr auf den Integrator.' },
    ],
  },

  // ================= PD und PD-T1 =================
  {
    id: 'v04-pd-regler',
    bereich: 'vorlesung',
    vorlesung: 'V04',
    titel: 'PD- und PD-T1-Regler (nachgebender PD-Regler), Vorverstärkung VV',
    quellen: 'V04 Folie 34–38',
    stichworte: 'PD-Regler PD-T1 nachgebender regler vorhaltzeit T_v vorverstärkung VV D-T1-Glied rampenantwort dirac impuls K_D lead-lag T_d IEC',
    frage: 'Geben Sie Zeitgleichung, Übertragungsfunktion, Frequenzgang und Sprungantwort des PD-Reglers an. Wie entsteht daraus der reale PD-T1-Regler?',
    antwort: [
      { t: 'zwischen', text: 'Idealer PD-Regler' },
      { t: 'formel', text: 'y(t) = K_P·e(t) + K_D·de/dt = K_P·[ e(t) + T_v·de/dt ]' },
      { t: 'formel', text: 'Vorhaltzeit T_v = K_D/K_P  (entspricht T_d der IEC-Norm)' },
      { t: 'formel', text: 'R(s) = K_P·(1 + T_v·s)        R(jω) = K_P·(1 + jω·T_v)' },
      { t: 'formel', text: 'h(t) = K_P·σ(t) + K_P·T_v·δ(t)       (δ(t) = Dirac-Impuls: ∞ für t = 0, 0 für t ≠ 0)' },
      { t: 'hinweis', text: 'Auf Folie 34 fehlt im Term mit δ(t) der Vorfaktor (leere Stelle). Richtig ist K_D = K_P·T_v. Die Rampenantwort startet bei K_P·T_v = K_D, die Rückverlängerung schneidet die t-Achse bei −T_v.' },
      { t: 'p', text: 'Blockschaltbild: P-Zweig K_P und D-Zweig (Vorhaltzeit T_v) parallel, Ausgänge addiert.' },
      { t: 'zwischen', text: 'Realer PD-Regler = PD-T1-Regler („nachgebender PD-Regler“)' },
      { t: 'p', text: 'D-T1-Glied = Reihenschaltung von D-Glied und PT1-Glied („-“ steht für Reihenschaltung). PD-T1-Glied = Parallelschaltung von P-Glied und D-T1-Glied.' },
      { t: 'formel', text: 'R(s) = K_P·( 1 + T_v·s / (1 + T₁·s) ) = K_P·( 1 + (T_v + T₁)·s ) / ( 1 + T₁·s )' },
      { t: 'formel', text: 'Für T₁ ≪ T_v:  R(s) ≈ K_P·(1 + T_v·s)/(1 + T₁·s),   R(jω) ≈ K_P·(1 + jωT_v)/(1 + jωT₁)' },
      { t: 'formel', text: 'h(t) = K_P·[ 1 + T_v/T₁ · e^(−t/T₁) ]·σ(t)' },
      { t: 'svg', svg: svgPDT1, unterschrift: 'Sprungantwort PD-T1: Start K_P·(1 + T_v/T₁), Endwert K_P, Zeitkonstante T₁.' },
      { t: 'zwischen', text: 'Vorverstärkung' },
      { t: 'formel', text: 'T₁ = T_v / VV  ⇔  VV = T_v / T₁      R(s) = K_P·( 1 + T_v·s / (1 + (T_v/VV)·s) )' },
      { t: 'p', text: 'VV = Vorverstärkung. PD-T1-Regler entspricht dem Lead-Lag-Glied. Beispiel der Folie 38: K_p = 1, T_v = 1,8, T₁ = 0,2, also VV = 9. Betrag steigt um 20·log(1 + VV) = 20 dB, Phasenanhebung maximal ≈ 55°.' },
      { t: 'link', ziel: 'a/pid-ideal-real', text: 'PID ideal und real' },
    ],
  },

  // ================= PID und PI-D-T1 =================
  {
    id: 'v04-pid-regler',
    bereich: 'vorlesung',
    vorlesung: 'V04',
    titel: 'PID-Regler und PI-D-T1-Regler (nachgebender PID), Zusammenfassung Regler',
    quellen: 'V04 Folie 39–46',
    stichworte: 'PID-Regler PI-D-T1 PID-T1 nachgebender PID parallelschaltung K_P K_I K_D T_v T_1 nachstellzeit vorhaltzeit nicht nachgebend praxis',
    frage: 'Beschreiben Sie den idealen PID-Regler und warum man in der Praxis den PI-D-T1-Regler einsetzt. Geben Sie die Übertragungsfunktion an.',
    antwort: [
      { t: 'zwischen', text: 'Idealer PID-Regler' },
      { t: 'p', text: 'Parallelschaltung von P-, I- und D-Glied.' },
      { t: 'formel', text: 'R(s) = K_P + K_I/s + K_D·s = K_P·( 1 + 1/(T_n·s) + T_v·s )' },
      { t: 'p', text: 'Bode-Beispiel der Folie 41: K_p = 1, T_n = 2 (Nachstellzeit), T_v = 0,5 (Vorhaltzeit).' },
      { t: 'zwischen', text: 'Realer PID = PI-D-T1-Regler („nachgebender PID-Regler“, PID-T1)' },
      { t: 'p', text: 'Der D-Anteil ist in der Praxis nicht realisierbar (⇒ D-T1-Glied). Parallelschaltung aus P-Glied, I-Glied und D-T1-Glied.' },
      { t: 'formel', text: 'R(s) = K_P·( 1 + 1/(T_n·s) + T_v·s/(1 + T₁·s) )' },
      { t: 'p', text: 'Folie 43: Zweige K_P, K_I und D-T1 mit dem Block T_v·s/(1 + T₁·s) (Parameter K_D, T_v, T₁). Bode-Beispiel Folie 45: T₁ ≪ T_v, K_p = 1, T_n = 2, T_v = 0,5, T₁ = 0,1.' },
      { t: 'zwischen', text: 'Zusammenfassung (Folie 46)' },
      { t: 'tabelle', kopf: ['Typ', 'Regler'], zeilen: [
        ['Nachgebender Regler (Praxis)', 'PD-T1-Regler, PID-T1-Regler'],
        ['Nicht nachgebender Regler', 'PD-Regler, PID-Regler'],
      ] },
      { t: 'link', ziel: 'a/pid-ideal-real', text: 'PID ideal und real (Skizzen der Sprungantworten)' },
      { t: 'link', ziel: 'pid', text: 'PID-Einstellregeln berechnen' },
    ],
  },

  // ================= Regelkreis mit Störeinkopplung =================
  {
    id: 'v04-regelkreis-stoerung',
    bereich: 'vorlesung',
    vorlesung: 'V04',
    titel: 'Regelkreis mit Störeinkopplung: G_W, G_Z, offener Kreis G_O, Regelfehler E(s), Regelfaktor S(s)',
    quellen: 'V04 Folie 47–53',
    stichworte: 'regelkreis störeinkopplung störung mitte der strecke messglied G_M G_0 offener kreis führungsübertragungsfunktion störübertragungsfunktion regelfehler dynamischer regelfaktor S(s) herleitung G_W G_Z',
    frage: 'Leiten Sie für den Regelkreis mit Störung Z(s) zwischen G₁ und G₂ (Messglied G_M) die Regelgröße X(s), die Führungs- und die Störübertragungsfunktion sowie den Regelfehler her.',
    antwort: [
      { t: 'svg', svg: svgStoerkreis, unterschrift: 'Regler R(s), Strecke G₁(s)·G₂(s) mit Störung Z(s) dazwischen, Messglied G_M(s) im Rückkopplungszweig.' },
      { t: 'formel', text: 'Offener Kreis (am Soll-Ist-Vergleich geöffnet):  G_O(s) = R(s)·G₁(s)·G₂(s)' },
      { t: 'formel', text: 'Regelfehler:  E(s) = W(s) − G_M(s)·X(s)' },
      { t: 'zwischen', text: 'Auflösen nach X(s)' },
      { t: 'formel', text: 'X = G₀·(W − G_M·X) + G₂·Z' },
      { t: 'formel', text: 'X = G₀·W − G₀·G_M·X + G₂·Z' },
      { t: 'formel', text: 'X·(1 + G₀·G_M) = G₀·W + G₂·Z' },
      { t: 'formel', text: 'X = G₀/(1 + G₀G_M)·W + G₂/(1 + G₀G_M)·Z' },
      { t: 'formel', text: 'Führung:  G_W(s) = G₀(s) / (1 + G₀(s)·G_M(s))' },
      { t: 'formel', text: 'Störung:  G_Z(s) = G₂(s) / (1 + G₀(s)·G_M(s))' },
      { t: 'zwischen', text: 'Mit G_M = 1' },
      { t: 'formel', text: 'E(s) = W − X = 1/(1 + G₀)·W − G₂/(1 + G₀)·Z' },
      { t: 'formel', text: 'Dynamischer Regelfaktor  S(s) = 1/(1 + G₀(s))     E(s) = S(s)·( W(s) − G₂(s)·Z(s) )' },
      { t: 'p', text: 'Gutes Führungsverhalten heißt X(s) = W(s).' },
      { t: 'link', ziel: 'a/standardregelkreis', text: 'Standardregelkreis (Musterantwort)' },
      { t: 'link', ziel: 'a/gegenkopplung-herleitung', text: 'Herleitung der Gegenkopplung' },
      { t: 'link', ziel: 'regelkreis', text: 'Regelkreis-Rechner (G_W, G_Z)' },
    ],
  },

  // ================= Stationäre Genauigkeit =================
  {
    id: 'v04-stationaere-genauigkeit',
    bereich: 'vorlesung',
    vorlesung: 'V04',
    titel: 'Stationärer Regelfehler: Endwertsatz, Tabelle Führungs- und Störgröße (Anzahl Integratoren)',
    quellen: 'V04 Folie 54–56',
    stichworte: 'stationäre genauigkeit regelfehler endwertsatz integratoren sprung rampe parabel führungsgröße störgröße K_2 modell des führungssignals innere modell prinzip',
    frage: 'Bestimmen Sie den bleibenden Regelfehler für Sprung-, Rampen- und Parabelführung bzw. -störung in Abhängigkeit der Zahl der Integratoren im offenen Kreis.',
    antwort: [
      { t: 'formel', text: 'lim(t→∞) e(t) = lim(s→0) s·E(s)     (Endwertsatz der Laplace-Transformation)' },
      { t: 'p', text: 'Der Regelfehler hängt ab von: Wahl der Eingangsfunktion (Sprung, Rampe, …), Wahl des Reglers R(s), Eigenschaften der Strecke G(s).' },
      { t: 'p', text: 'Eingangssignale im Bildbereich: Sprung σ(t) ↔ 1/s, Rampe t·σ(t) ↔ 1/s², Parabel t²/2·σ(t) ↔ 1/s³.' },
      { t: 'zwischen', text: 'Führungsgröße (Zahl der Integratoren in G₀(s))' },
      { t: 'tabelle', kopf: ['Führungsgröße', '0', '1', '2', '≥ 3'], zeilen: [
        ['Sprung σ(t)', '1/(1+K)', '0', '0', '0'],
        ['Rampe t·σ(t)', '∞', '1/K', '0', '0'],
        ['Parabel t²/2·σ(t)', '∞', '∞', '1/K', '0'],
      ] },
      { t: 'zwischen', text: 'Störgröße (Zahl der Integratoren in G₁(s) und R(s))' },
      { t: 'tabelle', kopf: ['Störgröße', '0', '1', '2', '≥ 3'], zeilen: [
        ['Sprung σ(t)', '−K₂/(1+K)  bzw. −K₂/K *', '0', '0', '0'],
        ['Rampe t·σ(t)', '−∞', '−K₂/K', '0', '0'],
        ['Parabel t²/2·σ(t)', '−∞', '−∞', '−K₂/K', '0'],
      ] },
      { t: 'p', text: '* −K₂/K, wenn G₂(s) einen Integrierer aufweist. K = Verstärkung des offenen Kreises.' },
      { t: 'hinweis', text: 'Merksatz der Folie: Im offenen Kreis muss ein Modell des Führungssignals enthalten sein, um stationäre Genauigkeit herzustellen (Sprung: 1 Integrator, Rampe: 2, Parabel: 3).' },
      { t: 'link', ziel: 'a/stationaere-genauigkeit', text: 'Stationäre Genauigkeit (Musterantwort)' },
    ],
  },
];
