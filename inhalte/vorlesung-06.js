// Vorlesung 06: Reglerentwurf, Entwurfsverfahren für PID-Regler – Format: tools/inhalte-format.md
// Foliennummer = PDF-Seite (geprüft). Tabellenwerte der Einstellregeln exakt wie auf den Folien (V06 S. 31, 36, 39, 40).
// Skizzen aus kleinen Hilfsfunktionen (nur currentColor, kein Skript, kein Link).

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
const flaeche = (pts) => `<polygon points="${pts.map(([x, y]) => `${n1(x)},${n1(y)}`).join(' ')}" fill="currentColor" fill-opacity="0.18" stroke="none"/>`;
const kopf = (b, h) => `<svg viewBox="0 0 ${b} ${h}" xmlns="http://www.w3.org/2000/svg">`;

const OX = 35, OY = 115;
function diagramm(inhalt, breite = 225, hoehe = 135, ylab = 'h(t)') {
  return `<svg viewBox="0 0 ${breite} ${hoehe}" xmlns="http://www.w3.org/2000/svg">` +
    pfeil(OX, OY, breite - 12, OY) + pfeil(OX, OY, OX, 8) +
    txt(breite - 10, OY + 4, 't') + txt(OX + 6, 14, ylab) + inhalt + '</svg>';
}

// ---------- PT3 (Beispielstrecke 1/((1+2s)(1+3s)(1+5s))) numerisch ----------
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
const pxy = ([t, h]) => [OX + t * sx3, OY - h * sy3];
const tU3 = P3.best.t - P3.best.h / P3.best.s, tE3 = P3.best.t + (1 - P3.best.h) / P3.best.s;
const dünn = P3.pts.filter((_, i) => i % 40 === 0);

// Wendetangente (CHR)
const svgWende = diagramm(
  gestr(OX, OY - sy3, 250, OY - sy3) + txt(OX - 5, OY - sy3 + 4, 'K_S', 'end', 12) +
  kurve(dünn.map(pxy)) +
  lin(OX + tU3 * sx3, OY, OX + tE3 * sx3, OY - sy3, 'stroke-dasharray="5 3" stroke-width="1.2"') +
  punkt(...pxy([P3.best.t, P3.best.h])) +
  gestr(OX + tE3 * sx3, OY - sy3, OX + tE3 * sx3, OY + 18) +
  lin(OX, OY + 12, OX + tU3 * sx3, OY + 12, 'stroke-width="1"') + txt(OX + tU3 * sx3 / 2, OY + 25, 'T_U', 'middle', 11) +
  lin(OX + tU3 * sx3, OY + 12, OX + tE3 * sx3, OY + 12, 'stroke-width="1"') + txt(OX + (tU3 + tE3) * sx3 / 2, OY + 25, 'T_G', 'middle', 11) +
  txt(OX + 90, OY - 30, 'Wendetangente', 'start', 10),
  270, 145);

// T-Summe: A1 = Fläche unter h(t) links von T_Σ, A2 = Fläche zwischen K_S und h(t) rechts von T_Σ
const TS = 10;
const links = P3.pts.filter(([t]) => t <= TS).filter((_, i) => i % 20 === 0);
const rechts = P3.pts.filter(([t]) => t >= TS).filter((_, i) => i % 20 === 0);
const svgTSumme = diagramm(
  flaeche([pxy([0, 0]), ...links.map(pxy), pxy([TS, 0])]) +
  flaeche([pxy([TS, 1]), ...rechts.map(pxy), pxy([45, 1])]) +
  gestr(OX, OY - sy3, 250, OY - sy3) + txt(OX - 5, OY - sy3 + 4, 'K_S', 'end', 12) +
  kurve(dünn.map(pxy)) +
  lin(OX + TS * sx3, OY - sy3, OX + TS * sx3, OY + 8, 'stroke-width="1.5"') + txt(OX + TS * sx3, OY + 22, 'T_Σ', 'middle', 12) +
  txt(OX + 22, OY - 14, 'A₁', 'middle', 12) + txt(OX + TS * sx3 + 30, OY - sy3 + 24, 'A₂', 'middle', 12) +
  txt(150, OY - 30, 'T_Σ so, dass A₁ = A₂', 'start', 10),
  270, 145);

// ---------- Kompensationsregler: Wirkungsplan (Mitkopplungsstruktur G_W, davor inverse Strecke) ----------
const svgKomp = kopf(380, 130) +
  txt(4, 59, 'W(s)') + pfeil(34, 55, 71, 55) + kreis(80, 55) + txt(66, 47, '+', 'start', 11) + txt(90, 80, '+', 'start', 11) +
  pfeil(89, 55, 120, 55) + kasten(120, 38, 70, 34, 'G_W(s)') + lin(190, 55, 230, 55) + punkt(210, 55) + pfeil(230, 55, 250, 55) +
  kasten(250, 38, 70, 34, '1/G(s)') + pfeil(320, 55, 360, 55) + txt(364, 59, 'Y', 'start', 12) +
  lin(210, 55, 210, 105) + lin(210, 105, 80, 105) + pfeil(80, 105, 80, 64) +
  txt(150, 122, 'Mitkopplung → G_W/(1 − G_W)', 'middle', 11) + '</svg>';

// ---------- Kenngrößen im geschlossenen Regelkreis ----------
const wK = 110, aK = 95;
const osz = (t) => 1 - Math.exp(-0.3 * t) * (Math.cos(1.2 * t) + 0.25 * Math.sin(1.2 * t));
const bandK = 12 / (wK * 0.6);                                   // Bandbreite ±bandK (normiert)
let tAn = 0, tAus = 0;
for (let i = 0; i < 900; i++) { const t = i * 0.01; if (!tAn && osz(t) >= 1 - bandK) tAn = t; if (Math.abs(osz(t) - 1) > bandK) tAus = t; }
const tUe = Math.PI / 1.2;                                        // Lage des ersten Maximums (grob)
const svgKenn = diagramm(
  gestr(OX, OY - wK * 0.6, 230, OY - wK * 0.6) + txt(OX - 5, OY - wK * 0.6 + 4, 'w', 'end', 12) +
  gestr(OX, OY - wK * 0.6 - 12, 230, OY - wK * 0.6 - 12) + gestr(OX, OY - wK * 0.6 + 12, 230, OY - wK * 0.6 + 12) +
  txt(232, OY - wK * 0.6 - 10, 'w + Δw/2', 'start', 9) + txt(232, OY - wK * 0.6 + 22, 'w − Δw/2', 'start', 9) +
  kurve(Array.from({ length: 90 }, (_, i) => { const t = i * 0.1; return [OX + t * 22, OY - 0.6 * wK * osz(t)]; })) +
  gestr(OX + tAn * 22, OY - wK * 0.6 + 12, OX + tAn * 22, OY + 14) + txt(OX + tAn * 11, OY + 26, 'T_an', 'middle', 11) +
  gestr(OX + tAus * 22, OY - wK * 0.6 + 12, OX + tAus * 22, OY + 30) + txt(OX + tAus * 11, OY + 44, 'T_aus', 'middle', 11) +
  lin(OX, OY + 30, OX + tAus * 22, OY + 30, 'stroke-width="1"') +
  gestr(OX + tUe * 22 * 0.97, OY - 0.6 * wK * osz(tUe * 0.97), 300, OY - 0.6 * wK * osz(tUe * 0.97)) + lin(300, OY - wK * 0.6, 300, OY - 0.6 * wK * osz(tUe * 0.97), 'stroke-width="1.5"') + txt(304, OY - wK * 0.6 - 24, 'x_ü', 'start', 11),
  330, 170, 'x(t)');

export const ANTWORTEN = [
  // ================= Regelfaktor =================
  {
    id: 'v06-regelfaktor',
    bereich: 'vorlesung',
    vorlesung: 'V06',
    titel: 'Regelfaktor R_F und Empfindlichkeitsfunktion S(s) (Störunterdrückung)',
    quellen: 'V06 Folie 3–7',
    stichworte: 'regelfaktor R_F empfindlichkeitsfunktion S(s) störunterdrückung W=0 statischer regelfaktor störung am ausgang standardregelstrecke PI-Regler K_r dämpfung niedrige frequenzen',
    frage: 'Leiten Sie die Empfindlichkeitsfunktion S(s) für Störung am Ausgang her (W = 0). Was sagt der statische Regelfaktor R_F aus?',
    antwort: [
      { t: 'p', text: 'Grundregelkreis mit Störeinkopplung am Ausgang der Strecke, Führungsgröße W(s) = 0.' },
      { t: 'formel', text: 'X(s) = Z(s) − G(s)·R(s)·X(s)' },
      { t: 'formel', text: 'X(s)·(1 + G(s)·R(s)) = Z(s)' },
      { t: 'formel', text: 'S(s) = X(s)/Z(s) = 1 / (1 + G(s)·R(s))        (Empfindlichkeitsfunktion)' },
      { t: 'zwischen', text: 'Statischer Regelfaktor' },
      { t: 'formel', text: 'R_F = S(0) = 1 / (1 + G(0)·R(0))        (für s → 0)' },
      { t: 'p', text: 'R_F ist ein Maß für die Störunterdrückung. Ist R_F klein, haben Störungen nur eine kleine Auswirkung auf die Regelgröße x(t) bzw. X(s).' },
      { t: 'hinweis', text: 'Folie 6 (Standardregelstrecke + PI-Regler, K_r = 1, T_n = 5): Ein höheres K_r bewirkt eine größere Dämpfung bei niedrigen Frequenzen. |S(jω)| liegt bei niedrigen Frequenzen weit unter 0 dB (bei 10⁻³ rad/s ≈ −46 dB), hat eine leichte Überhöhung bei etwa 0,2 rad/s und geht bei hohen Frequenzen auf 0 dB. Folie 7: nur „Skalierung beachten“ (Achsen der Diagramme).' },
      { t: 'p', text: 'Mit I-Anteil im Regler (R(0) → ∞) ist R_F = 0: Sprungförmige Störungen werden stationär vollständig ausgeregelt.' },
      { t: 'link', ziel: 'a/standardregelkreis', text: 'Standardregelkreis' },
      { t: 'link', ziel: 'a/v04-regelkreis-stoerung', text: 'Regelkreis mit Störeinkopplung (V04)' },
    ],
  },

  // ================= Kompensationsreglerentwurf =================
  {
    id: 'v06-kompensationsregler',
    bereich: 'vorlesung',
    vorlesung: 'V06',
    titel: 'Kompensationsreglerentwurf: R(s) = 1/G(s) · G_W/(1 − G_W), Polüberschuss, Praxisprobleme',
    quellen: 'V06 Folie 8–15',
    stichworte: 'kompensationsregler kompensationsreglerentwurf R(s) inverse strecke wunschverhalten G_W polüberschuss mitkopplungsstruktur dominante zeitkonstante modellfehler stellgrößenbeschränkung pol-nullstellen-kürzung',
    frage: 'Leiten Sie die Reglerübertragungsfunktion für ein gewünschtes Führungsverhalten G_W(s) her (Kompensationsregler). Welche Bedingungen und Probleme gibt es in der Praxis?',
    antwort: [
      { t: 'p', text: 'Gewünschtes Führungsverhalten G_W(s) vorgeben und den Regler daraus berechnen:' },
      { t: 'formel', text: 'G_W(s) = G₀/(1 + G₀) = R(s)·G(s) / (1 + R(s)·G(s))' },
      { t: 'formel', text: 'G_W·(1 + R·G) = R·G' },
      { t: 'formel', text: 'G_W = R·G − R·G·G_W' },
      { t: 'formel', text: 'G_W = R·( G − G·G_W )   ⇒   R(s) = G_W / ( G·(1 − G_W) )' },
      { t: 'formel', text: 'R(s) = 1/G(s) · G_W(s) / (1 − G_W(s))' },
      { t: 'p', text: 'Im Regler stecken die inverse Strecke 1/G(s) und das gewünschte Führungsübertragungsverhalten G_W(s) (in Mitkopplungsstruktur).' },
      { t: 'svg', svg: svgKomp, unterschrift: 'Wirkungsplan des Kompensationsreglers: G_W in Mitkopplungsstruktur, dahinter die inverse Strecke 1/G(s).' },
      { t: 'zwischen', text: 'Polüberschuss' },
      { t: 'p', text: 'Ein System hat m Nullstellen (Zählerpolynom) und n Polstellen (Nennerpolynom), m < n. Die Zahl n − m > 0 heißt Polüberschuss.' },
      { t: 'p', text: 'In der Praxis gilt: Der Polüberschuss von G_W(s) muss gleich dem Polüberschuss der Strecke G(s) sein (sonst wäre R(s) nicht realisierbar).' },
      { t: 'zwischen', text: 'Grenzen und Probleme' },
      { t: 'liste', items: [
        'Wunschverhalten G_W(s) ist limitiert durch Anforderungen an die Schnelligkeit und Stellgrößenbeschränkungen (y(t) bzw. Y(s)).',
        'Modellfehler (von G(s)).',
        'Nichtlinearitäten (z. B. Stellgrößenbeschränkungen).',
        'Zeitvariantes Verhalten (kein LTI-System).',
      ] },
      { t: 'p', text: 'In der Praxis reicht es oft, die dominante, d. h. langsamste Zeitkonstante der Strecke zu kompensieren (größtes T_i). Das Verfahren ist oft eine gute Ausgangsbasis für weitere Einstellung mittels Frequenzkennlinienverfahren. Annäherung eines Kompensationsreglers durch einen einfachen (praktischen) PID-Regler.' },
      { t: 'zwischen', text: 'Mini-Beispiel (eigene Rechnung)' },
      { t: 'p', text: 'Strecke G = K_S/(1 + T·s), Wunsch G_W = 1/(1 + T_W·s) (Polüberschuss 1 = 1, passt).' },
      { t: 'formel', text: 'R(s) = (1 + T·s)/K_S · [ 1/(1 + T_W s) ] / [ T_W s/(1 + T_W s) ] = (1 + T·s) / (K_S·T_W·s)' },
      { t: 'p', text: 'Das ist ein PI-Regler mit K_P = T/(K_S·T_W) und T_n = T (der Regler kürzt die Streckenzeitkonstante).' },
      { t: 'link', ziel: 'regelkreis', text: 'Regelkreis-Rechner' },
    ],
  },

  // ================= PID-Kompensationsregler =================
  {
    id: 'v06-pid-kompensationsregler',
    bereich: 'vorlesung',
    vorlesung: 'V06',
    titel: 'PID-Kompensationsregler: T_n und T_v aus den zwei größten Streckenzeitkonstanten',
    quellen: 'V06 Folie 16–23',
    stichworte: 'PID kompensationsregler nachstellzeit vorhaltzeit T_R1 T_R2 T_S1 T_S2 nullstellenberechnung koeffizientenvergleich produktform polynomform streckenzeitkonstanten kompensiert K_P nebenbedingungen',
    frage: 'Wie legt man T_n und T_v eines PID-Kompensationsreglers für eine Strecke in Produktform fest? Leiten Sie die Formeln her.',
    antwort: [
      { t: 'p', text: 'Allgemeine Kompensationsregler können je nach Strecke G(s) eine sehr hohe Ordnung haben (hoher programmiertechnischer Aufwand). Daher setzt man parametrierbare PID-Regler als PID-Kompensationsregler ein.' },
      { t: 'formel', text: 'Stabile Strecke in Produktform:  G(s) = K_S / ( (1 + T_S1·s)(1 + T_S2·s)···(1 + T_Sn·s) )' },
      { t: 'formel', text: 'Regler gewählt:  R(s) = (1 + T_R1·s)(1 + T_R2·s) / Nenner,   T_R1 = T_S1,  T_R2 = T_S2  (die 2 größten Streckenzeitkonstanten)' },
      { t: 'zwischen', text: 'PID-Regler in zwei Darstellungen' },
      { t: 'formel', text: 'Produktdarstellung:  R(s) = K_P′ · (1 + T_R1·s)(1 + T_R2·s) / (T′·s)' },
      { t: 'formel', text: 'Polynomdarstellung:  R(s) = K_P · (T_v·T_n·s² + T_n·s + 1) / (T_n·s)' },
      { t: 'zwischen', text: 'Nullstellenberechnung und Zeitkonstanten (Folie 20)' },
      { t: 'formel', text: 'T_v·T_n·s² + T_n·s + 1 = 0 = s² + (1/T_v)·s + 1/(T_v·T_n)' },
      { t: 'formel', text: 's₁/₂ = −1/(2T_v) ± 1/(2T_v)·√(1 − 4·T_v/T_n)' },
      { t: 'formel', text: 'mit T_R1 = −1/s₁:   T_R1 = 2T_v / ( 1 − √(1 − 4T_v/T_n) )' },
      { t: 'formel', text: 'T_R1 = T_n/2·( 1 + √(1 − 4T_v/T_n) )        T_R2 = T_n/2·( 1 − √(1 − 4T_v/T_n) )' },
      { t: 'zwischen', text: 'Koeffizientenvergleich (Folie 22): Nachstell- und Vorhaltezeit' },
      { t: 'formel', text: 'T_v·T_n·s² + T_n·s + 1 = (1 + T_R1 s)(1 + T_R2 s) = T_R1·T_R2·s² + (T_R1 + T_R2)·s + 1' },
      { t: 'formel', text: 'T_n = T_R1 + T_R2   (Nachstellzeit)' },
      { t: 'formel', text: 'T_v = T_R1·T_R2 / (T_R1 + T_R2)   (Vorhaltezeit)' },
      { t: 'p', text: 'Kompensiert werden die beiden langsamsten (größten) Zeitkonstanten der Strecke. Der PID-Regler kann auch einen schwingfähigen Streckenanteil kompensieren.' },
      { t: 'zwischen', text: 'Reglerverstärkung K_P (Folie 23)' },
      { t: 'p', text: 'K_P wird über Nebenbedingungen bestimmt: gewünschte Schnelligkeit, Stabilität des Regelkreises, Verlauf der Stellgröße. Die Stellgrößenbeschränkung eines realen Reglers beachten: Ein Kompensationsregler kann sehr große Stellgrößenwerte erzeugen.' },
      { t: 'zwischen', text: 'Zahlenbeispiel (eigene Rechnung)' },
      { t: 'p', text: 'Strecke G(s) = 2/((1 + 5s)(1 + 3s)): T_R1 = 5 s, T_R2 = 3 s.' },
      { t: 'formel', text: 'T_n = 5 + 3 = 8 s        T_v = (5·3)/(5 + 3) = 1,875 s' },
      { t: 'p', text: 'Probe mit den Wurzelformeln: T_v/T_n = 0,234; √(1 − 4·0,234) = √0,0625 = 0,25; T_R1 = 4·1,25 = 5 s, T_R2 = 4·0,75 = 3 s. ✓' },
      { t: 'p', text: 'Der offene Kreis ist dann G₀ = K_P·K_S/(T_n·s) (Integrator), der geschlossene Kreis ein PT1 mit Zeitkonstante T_n/(K_P·K_S). K_P wählt man so, dass dies schnell genug ist, ohne die Stellgröße zu überfordern.' },
      { t: 'link', ziel: 'pid', text: 'PID-Rechner (Einstellregeln)' },
      { t: 'link', ziel: 'a/pid-ideal-real', text: 'PID ideal und real' },
    ],
  },

  // ================= Betragsoptimum =================
  {
    id: 'v06-betragsoptimum',
    bereich: 'vorlesung',
    vorlesung: 'V06',
    titel: 'Betragsoptimum: PI-Regler (K_R, T_n) und PID-Regler (r₀, r₁, r₂ mit Determinanten)',
    quellen: 'V06 Folie 24–29',
    stichworte: 'betragsoptimum betragsoptimum PID determinanten D r0 r1 r2 K_R T_n T_v streckenkoeffizienten a_i polynomdarstellung |G_W(jω)|≈1 kein mathematisches optimum PTn näherung vergleich kompensationsregler',
    frage: 'Erklären Sie das Betragsoptimum. Geben Sie die Reglerparameter für PI- und PID-Regler in Abhängigkeit der Streckenkoeffizienten a_i an und vergleichen Sie mit dem Kompensationsregler.',
    antwort: [
      { t: 'p', text: 'Das Betragsoptimum ist kein mathematisches Optimum, sondern ein Optimum für den Betrag des Frequenzganges für einen möglichst großen Bereich:' },
      { t: 'formel', text: '|G_W(jω)| ≈ 1' },
      { t: 'liste', items: [
        'Strecke in Polynomdarstellung, Streckenkoeffizienten a_i bekannt: G(s) = 1/(a₀ + a₁s + a₂s² + a₃s³ + …) (Zähler 1, K_S = 1).',
        'Schnelleres Reglerverhalten als beim Kompensationsregler.',
        'Keine Berechnung von Nullstellen des Nennerpolynoms nötig.',
        'Gutes Führungs- G_W(s) und Störverhalten G_Z(s).',
        'Strecke P-Tn, näherbar durch n-mal P-T₁: G(s) ≈ 1/(1 + T·s)ⁿ.',
      ] },
      { t: 'zwischen', text: 'PI-Regler (näherungsweise erfüllt)' },
      { t: 'formel', text: 'K_R = a₁/2 · (a₁² − a₀·a₂)/(a₁·a₂ − a₀·a₃) − a₀/2' },
      { t: 'formel', text: 'T_n = a₁/a₀ − (a₁·a₂ − a₀·a₃)/(a₁² − a₀·a₂)' },
      { t: 'zwischen', text: 'PID-Regler (Determinanten, Folie 26)' },
      { t: 'formel', text: 'D = det [ a₁  −a₀  0 ;  a₃  −a₂  a₁ ;  a₅  −a₄  a₃ ]' },
      { t: 'p', text: 'Die Spalten der Matrix sind (a₁, a₃, a₅), (−a₀, −a₂, −a₄) und (0, a₁, a₃). Für r₀, r₁, r₂ ersetzt man der Reihe nach die 1., 2., 3. Spalte durch die rechte Seite c = ( a₀² ;  −a₁² + 2a₀a₂ ;  a₂² + 2a₀a₄ − 2a₁a₃ ):' },
      { t: 'formel', text: 'r₀ = 1/D · det [ c | Sp.2 | Sp.3 ]    r₁ = 1/D · det [ Sp.1 | c | Sp.3 ]    r₂ = 1/D · det [ Sp.1 | Sp.2 | c ]' },
      { t: 'p', text: 'Ausgeschrieben, Folie 26: r₀ = 1/D·det [ a₀²  −a₀  0 ;  −a₁²+2a₀a₂  −a₂  a₁ ;  a₂²+2a₀a₄−2a₁a₃  −a₄  a₃ ];  r₁ = 1/D·det [ a₁  a₀²  0 ;  a₃  −a₁²+2a₀a₂  a₁ ;  a₅  a₂²+2a₀a₄−2a₁a₃  a₃ ];  r₂ = 1/D·det [ a₁  −a₀  a₀² ;  a₃  −a₂  −a₁²+2a₀a₂ ;  a₅  −a₄  a₂²+2a₀a₄−2a₁a₃ ].' },
      { t: 'zwischen', text: 'Regler (Folie 27)' },
      { t: 'formel', text: 'R(s) = ( r₀ + r₁·s + r₂·s² ) / (2s)' },
      { t: 'formel', text: 'K_r = r₁/2        T_n = r₁/r₀        T_v = r₂/r₁' },
      { t: 'p', text: 'Herkunft: R(s) = r₀/(2s) + r₁/2 + r₂·s/2, also K_P = r₁/2, K_I = r₀/2 (T_n = K_P/K_I = r₁/r₀), K_D = r₂/2 (T_v = K_D/K_P = r₂/r₁).' },
      { t: 'zwischen', text: 'Rechenbeispiel (eigene Rechnung, nachgeprüft)' },
      { t: 'p', text: 'Strecke G(s) = 1/((1 + 2s)(1 + 3s)(1 + 5s)) = 1/(1 + 10s + 31s² + 30s³): a₀ = 1, a₁ = 10, a₂ = 31, a₃ = 30, a₄ = a₅ = 0.' },
      { t: 'tabelle', kopf: ['Regler', 'Ergebnis'], zeilen: [
        ['PI', 'K_R = 5·(100 − 31)/(310 − 30) − 0,5 = 0,732;   T_n = 10 − 280/69 = 5,94'],
        ['PID', 'D = −8400;  r₀ = 71/105 = 0,676;  r₁ = 121/21 = 5,762;  r₂ = 361/30 = 12,033'],
        ['PID umgerechnet', 'K_r = 2,881;   T_n = 8,52;   T_v = 2,09'],
      ] },
      { t: 'p', text: 'Gegenprobe: Mit dem PID-Regler ist |G_W(jω)| für ω = 0,02 … 0,1 auf 5 Stellen gleich 1 (0,99997 bei ω = 0,1), erst bei ω ≈ 0,4 fällt er auf 0,86.' },
      { t: 'hinweis', text: 'Die Folie gibt keine Aussage zu K_S ≠ 1. Dann gilt (eigene Folgerung): Der Regler wirkt über K_R·K_S; also K_R durch K_S teilen (a_i auf K_S = 1 normieren). T_n und T_v bleiben.' },
      { t: 'zwischen', text: 'Vergleich Kompensationsregler und Betragsoptimum (Folie 28–29)' },
      { t: 'liste', items: [
        'Amplitudengang in dB: Das Betragsoptimum verläuft für einen großen Frequenzbereich auf der Null-dB-Linie.',
        'Betragsoptimum: schnellerer Einschwingvorgang, geringerer Überschwinger.',
        'Kompensationsregler (Polkompensation): Betrag fällt früher ab.',
      ] },
      { t: 'link', ziel: 'matrix', text: 'Matrix-Rechner (Determinante 3×3)' },
      { t: 'link', ziel: 'a/v06-pid-kompensationsregler', text: 'PID-Kompensationsregler' },
    ],
  },

  // ================= Ziegler-Nichols =================
  {
    id: 'v06-ziegler-nichols',
    bereich: 'vorlesung',
    vorlesung: 'V06',
    titel: 'Einstellregel nach Ziegler und Nichols (Schwingversuch, K_Pkr, T_kr)',
    quellen: 'V06 Folie 30–32',
    stichworte: 'ziegler nichols schwingversuch kritische verstärkung K_Pkr kritische periodendauer T_kr stabilitätsgrenze dauerschwingung P PI PID einstellregel standardregelstrecke überschwinger',
    frage: 'Beschreiben Sie das Vorgehen nach Ziegler und Nichols und geben Sie die Reglerparameter für P-, PI- und PID-Regler an.',
    antwort: [
      { t: 'zwischen', text: 'Vorgehen' },
      { t: 'liste', items: [
        'Strecke und Regler sind aufgebaut, die Strecke darf ungedämpfte Schwingungen ausführen.',
        'Schwingversuch im geschlossenen Regelkreis.',
        'Start mit einem P-Regler mit minimalem K_P.',
        'Bei PID-Regler: T_n auf maximalen Wert (maximale Nachstellzeit), T_v auf minimalen Wert (minimale Vorhaltezeit).',
        'K_P erhöhen, bis das System dauerhaft schwingt ⇒ K_Pkr und T_kr.',
        'Das ist die Stabilitätsgrenze mit kritischer Verstärkung und Schwingungsdauer.',
      ] },
      { t: 'zwischen', text: 'Einstellung gemäß Ziegler und Nichols (Folie 31)' },
      { t: 'tabelle', kopf: ['Regler', 'Parameter'], zeilen: [
        ['P-Regler', 'K_p = 0,5·K_Pkr'],
        ['PI-Regler', 'K_p = 0,45·K_Pkr,   T_n = 0,85·T_kr'],
        ['PID-Regler', 'K_p = 0,6·K_Pkr,   T_n = 0,5·T_kr,   T_v = 0,12·T_kr'],
      ] },
      { t: 'hinweis', text: 'Folie 31 schreibt beim PID-T_n „T_krs“ – gemeint ist T_kr. Fachliteratur nennt für T_v oft 0,125·T_kr; hier gilt der Wert der Folie (0,12).' },
      { t: 'zwischen', text: 'Bewertung (Folie 32)' },
      { t: 'liste', items: [
        'Wurde in den 70er Jahren entwickelt.',
        'Sehr gefährlich durch den Schwingversuch (Anlage an der Stabilitätsgrenze).',
        'Besser: Aufzeichnung der Sprungantwort.',
        'In der Praxis weniger von Bedeutung.',
        'Im Beispiel (Standardregelstrecke) ergibt sich ein deutlicher Überschwinger.',
      ] },
      { t: 'p', text: 'Beispiel Folie 32: K_p = 5,64, T_n = 5,4, T_v = 1,296. Daraus rückgerechnet K_Pkr = 5,64/0,6 = 9,4 und T_kr = 5,4/0,5 = 10,8 s (T_v = 0,12·10,8 = 1,296 ✓).' },
      { t: 'link', ziel: 'pid', text: 'PID-Rechner: Ziegler-Nichols' },
    ],
  },

  // ================= Kenngrößen =================
  {
    id: 'v06-kenngroessen-regelkreis',
    bereich: 'vorlesung',
    vorlesung: 'V06',
    titel: 'Kenngrößen im geschlossenen Regelkreis: Anregelzeit, Ausregelzeit, Überschwingweite, Toleranzband',
    quellen: 'V06 Folie 33',
    stichworte: 'kenngrößen geschlossener regelkreis anregelzeit T_an anschwingzeit ausregelzeit T_aus einschwingzeit überschwingweite x_ü toleranzband Δw prozent',
    frage: 'Definieren Sie T_an, T_aus und x_ü und zeichnen Sie sie in eine Sprungantwort des geschlossenen Regelkreises ein.',
    antwort: [
      { t: 'liste', items: [
        'T_an = Anregelzeit (Anschwingzeit)',
        'T_aus = Ausregelzeit (Einschwingzeit)',
        'x_ü = Überschwingweite',
      ] },
      { t: 'p', text: 'Toleranzband Δw um den Sollwert w festlegen: Grenzen w + Δw/2 und w − Δw/2. Oft in Prozent (von z. B. K_P) angegeben.' },
      { t: 'svg', svg: svgKenn, unterschrift: 'Sprungantwort x(t) mit Sollwert w und Toleranzband Δw. T_an: erstes Erreichen des Toleranzbandes; T_aus: ab hier bleibt x(t) dauerhaft im Band; x_ü: maximale Überschreitung von w.' },
      { t: 'p', text: 'So ist es in der Skizze der Folie 33 eingezeichnet: T_an = Zeit bis die Kurve erstmals das Toleranzband erreicht, T_aus = Zeit, ab der die Kurve dauerhaft im Toleranzband bleibt, x_ü = Abstand des größten Maximums zum Sollwert w.' },
      { t: 'link', ziel: 'a/kennwerte-sprungantwort', text: 'Kennwerte der Sprungantwort' },
      { t: 'link', ziel: 'a/guetefunktionen', text: 'Gütefunktionen' },
    ],
  },

  // ================= T-Summen =================
  {
    id: 'v06-t-summe',
    bereich: 'vorlesung',
    vorlesung: 'V06',
    titel: 'T-Summen-Einstellregel: Steuerfläche A, Summenzeitkonstante T_Σ = A/K_S',
    quellen: 'V06 Folie 34–36',
    stichworte: 'T-summen T_Σ summenzeitkonstante steuerfläche A fläche A1 gleich A2 K_S PTn einstellregel normale schnelle einstellung PD PI PID',
    frage: 'Wie bestimmt man die Summenzeitkonstante T_Σ aus der Sprungantwort und wie stellt man damit P-, PD-, PI- und PID-Regler ein?',
    antwort: [
      { t: 'p', text: 'Ausgehend von der Steuerfläche A einer P-Tn-Strecke kann die Summenzeitkonstante berechnet oder abgeschätzt werden. Die Regel kann nur auf P-Tn-Strecken angewendet werden.' },
      { t: 'p', text: 'T_Σ ist auf der Zeitachse ablesbar, wenn die Fläche A₁ gleich A₂ ist. Die Fläche lässt sich programmtechnisch bestimmen. Der Endwert von h(t) ist h(∞) = K_S (Folie: K_P).' },
      { t: 'formel', text: 'T_Σ = A / K_S' },
      { t: 'svg', svg: svgTSumme, unterschrift: 'Sprungantwort einer P-Tn-Strecke: T_Σ liegt dort, wo die Fläche A₁ (unter der Kurve, links) gleich A₂ (zwischen K_S und Kurve, rechts) ist.' },
      { t: 'p', text: 'Für eine Reihenschaltung von PT1-Gliedern ist T_Σ die Summe der Zeitkonstanten (eigene Ergänzung, passt zur Beispielstrecke 1/((1+2s)(1+3s)(1+5s)): T_Σ = 2 + 3 + 5 = 10 s).' },
      { t: 'zwischen', text: 'Reglereinstellung gemäß T_Σ-Regel (Folie 36)' },
      { t: 'tabelle', kopf: ['Regler', 'Führungsverhalten normale Einstellung', 'Führungsverhalten schnelle Einstellung'], zeilen: [
        ['P-Regler', 'K_p = 1/K_S', ''],
        ['PD-Regler', 'K_p = 1/K_S,  T_v = 0,33·T_Σ', ''],
        ['PI-Regler', 'K_p = 0,5/K_S,  T_n = 0,5·T_Σ', 'K_p = 1/K_S,  T_n = 0,7·T_Σ'],
        ['PID-Regler', 'K_p = 1/K_S,  T_n = 0,66·T_Σ,  T_v = 0,167·T_Σ', 'K_p = 2/K_S,  T_n = 0,8·T_Σ,  T_v = 0,194·T_Σ'],
      ] },
      { t: 'p', text: 'Beispiel (eigene Zahlen): K_S = 1, T_Σ = 10 s, PID normal: K_p = 1, T_n = 6,6 s, T_v = 1,67 s.' },
      { t: 'link', ziel: 'pid', text: 'PID-Rechner: T-Summe' },
    ],
  },

  // ================= CHR =================
  {
    id: 'v06-chr',
    bereich: 'vorlesung',
    vorlesung: 'V06',
    titel: 'Einstellregel von Chien, Hrones und Reswick (CHR): Wendetangente, T_U, T_G, Führung und Störung',
    quellen: 'V06 Folie 37–41',
    stichworte: 'chien hrones reswick CHR wendetangentenmethode verzugszeit T_U ausgleichszeit T_G streckenverstärkung K_S führungsverhalten störverhalten stark gedämpft aperiodisch 20 prozent überschwingen nachteile verrauscht',
    frage: 'Wie bestimmt man T_U, T_G und K_S mit der Wendetangentenmethode? Geben Sie die CHR-Reglereinstellung für Führungsverhalten und Störverhalten an. Welche Nachteile hat das Verfahren?',
    antwort: [
      { t: 'p', text: 'CHR benötigt eine experimentell aufgenommene Sprungantwort von G(s). Bestimmung mit der Wendetangentenmethode (grafisch). Nur anwendbar auf P-Tn-Strecken. Einstellung für Führungs- und Störverhalten.' },
      { t: 'liste', items: [
        'Verzugszeit T_U',
        'Ausgleichszeit T_G',
        'Übertragungsbeiwert bzw. Verstärkung der Strecke K_S',
      ] },
      { t: 'svg', svg: svgWende, unterschrift: 'Wendetangente: Schnitt mit der t-Achse ergibt T_U, Zeit bis zum Schnitt mit dem Endwert K_S ergibt T_G (Beispielstrecke, K_S = 1; Folie 38 hat K_S = 3, T_U ≈ 2, T_G ≈ 11).' },
      { t: 'zwischen', text: 'Gutes Führungsverhalten (Folie 39)' },
      { t: 'tabelle', kopf: ['', 'Führungsverhalten stark gedämpft', 'Führungsverhalten 20 % Überschwingen'], zeilen: [
        ['P-Regler', 'K_p = 0,3 · T_G/(T_U·K_S)', 'K_p = 0,7 · T_G/(T_U·K_S)'],
        ['PI-Regler', 'K_p = 0,35 · T_G/(T_U·K_S),  T_n = 1,2·T_G', 'K_p = 0,6 · T_G/(T_U·K_S),  T_n = 1,0·T_G'],
        ['PID-Regler', 'K_p = 0,6 · T_G/(T_U·K_S),  T_n = 1,0·T_G,  T_v = 0,5·T_U', 'K_p = 0,95 · T_G/(T_U·K_S),  T_n = 1,35·T_G,  T_v = 0,47·T_U'],
      ] },
      { t: 'zwischen', text: 'Gutes Störverhalten (Folie 40)' },
      { t: 'tabelle', kopf: ['', 'Störungsverhalten stark gedämpft', 'Störungsverhalten 20 % Überschwingen'], zeilen: [
        ['P-Regler', 'K_p = 0,3 · T_G/(T_U·K_S)', 'K_p = 0,7 · T_G/(T_U·K_S)'],
        ['PI-Regler', 'K_p = 0,6 · T_G/(T_U·K_S),  T_n = 4·T_G', 'K_p = 0,7 · T_G/(T_U·K_S),  T_n = 2,3·T_G'],
        ['PID-Regler', 'K_p = 0,95 · T_G/(T_U·K_S),  T_n = 2,4·T_G,  T_v = 0,42·T_U', 'K_p = 1,2 · T_G/(T_U·K_S),  T_n = 2·T_G,  T_v = 0,42·T_U'],
      ] },
      { t: 'hinweis', text: 'So steht es auf Folie 40: T_n mit T_G. In der Fachliteratur steht bei den Störungs-Regeln T_n mit T_U (z. B. PI 4·T_U). Paul rechnet nach Folie; die App zeigt den Literaturwert nur als Hinweis.' },
      { t: 'zwischen', text: 'Rechenbeispiel (eigene Zahlen: K_S = 3, T_U = 2 s, T_G = 11 s)' },
      { t: 'p', text: 'k = T_G/(K_S·T_U) = 11/6 = 1,83. PID Führung stark gedämpft: K_p = 0,6·1,83 = 1,1;  T_n = 1,0·T_G = 11 s;  T_v = 0,5·T_U = 1 s.' },
      { t: 'zwischen', text: 'Nachteile (Folie 41)' },
      { t: 'liste', items: [
        'Wendetangentenmethode problematisch bei „verrauschten“ Sprungantworten ⇒ falsche Bestimmung der Reglerverstärkung.',
        'Nicht geeignet für P-T₁-Strecken, da diese keine Verzugszeit besitzen.',
        'Nicht geeignet für schwingfähige Strecken.',
        'Nicht geeignet für Strecken mit großer Totzeit.',
      ] },
      { t: 'link', ziel: 'pid', text: 'PID-Rechner: Chien-Hrones-Reswick' },
      { t: 'link', ziel: 'a/v04-ptn', text: 'T_U und T_G aus der Sprungantwort ablesen (V04)' },
    ],
  },

  // ================= Übersicht =================
  {
    id: 'v06-einstellregeln-uebersicht',
    bereich: 'vorlesung',
    vorlesung: 'V06',
    titel: 'Welche Einstellregel wann? Übersicht PID-Entwurfsverfahren und Praxis-Hinweise',
    quellen: 'V06 Folie 16, 29–31, 34–42',
    stichworte: 'einstellregeln übersicht vergleich PID entwurfsverfahren zusammenfassung praxis statische kennlinie störungen untersuchen von hand optimieren P-Tn kleine totzeit welches verfahren',
    frage: 'Nennen Sie die Entwurfsverfahren für PID-Regler und sagen Sie, was man jeweils braucht und wo sie nicht passen.',
    antwort: [
      { t: 'tabelle', kopf: ['Verfahren', 'Benötigt', 'Folie'], zeilen: [
        ['PID-Kompensationsregler', 'Strecke in Produktform (Zeitkonstanten T_S1, T_S2, …, K_S)', '16–23'],
        ['Betragsoptimum', 'Streckenkoeffizienten a_i (Polynomform)', '24–29'],
        ['Ziegler und Nichols', 'Versuch an der Anlage: K_Pkr, T_kr (Schwingversuch, gefährlich)', '30–32'],
        ['T-Summen-Regel', 'Sprungantwort: Fläche A, K_S, nur P-Tn-Strecken', '34–36'],
        ['Chien, Hrones, Reswick', 'Sprungantwort: T_U, T_G, K_S (Wendetangente), nur P-Tn-Strecken', '37–41'],
      ] },
      { t: 'zwischen', text: 'Zusammenfassung (Folie 42)' },
      { t: 'liste', items: [
        'Einstellregeln für die industrielle Praxis: T_Σ-Regel und Wendetangentenmethode.',
        'Aber: weitere Optimierung „von Hand“.',
        'Nur möglich für P-Tn-Strecken und Strecken mit kleiner oder keiner Totzeit.',
        'Stets sollte erfolgen: Aufnahme einer statischen Kennlinie, Untersuchung von Störungen.',
      ] },
      { t: 'link', ziel: 'pid', text: 'PID-Rechner (alle Einstellregeln)' },
      { t: 'link', ziel: 'a/v06-pid-kompensationsregler', text: 'PID-Kompensationsregler' },
      { t: 'link', ziel: 'a/v06-betragsoptimum', text: 'Betragsoptimum' },
      { t: 'link', ziel: 'a/v06-ziegler-nichols', text: 'Ziegler und Nichols' },
      { t: 'link', ziel: 'a/v06-t-summe', text: 'T-Summen-Regel' },
      { t: 'link', ziel: 'a/v06-chr', text: 'Chien, Hrones, Reswick' },
    ],
  },
];
