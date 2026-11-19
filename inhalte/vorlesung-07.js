// Vorlesung 07: Besondere Strukturen in der Regelungstechnik – Format: tools/inhalte-format.md
// Störgrößenaufschaltung, Kaskade, Vorfilter/Vorsteuerung, Regler in der Rückführung, Zweipunktregler, Matrizen, Entkopplung.
// Alle Blockschaltbilder gegen die Folien (PDF V07) geprüft. Skizzen: nur currentColor, kein Skript, kein Link.

// ---------- Hilfsfunktionen für Skizzen ----------
const n1 = (x) => (Math.round(x * 10) / 10).toString();
const txt = (x, y, s, anker = 'start', gr = 12) =>
  `<text x="${x}" y="${y}" font-family="sans-serif" font-size="${gr}" text-anchor="${anker}" fill="currentColor">${s}</text>`;
const lin = (x1, y1, x2, y2, extra = '') =>
  `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" stroke="currentColor" stroke-width="1.5" ${extra}/>`;
const pfeil = (x1, y1, x2, y2) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - 7 * Math.cos(a), by = y2 - 7 * Math.sin(a);
  const px = -Math.sin(a) * 3, py = Math.cos(a) * 3;
  return lin(x1, y1, bx, by) +
    `<polygon points="${n1(x2)},${n1(y2)} ${n1(bx + px)},${n1(by + py)} ${n1(bx - px)},${n1(by - py)}" fill="currentColor"/>`;
};
const kasten = (x, y, b, h, s, gr = 14) =>
  `<rect x="${x}" y="${y}" width="${b}" height="${h}" fill="none" stroke="currentColor" stroke-width="1.5"/>` +
  txt(x + b / 2, y + h / 2 + 5, s, 'middle', gr);
const kreis = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
const punkt = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="3" fill="currentColor"/>`;
const kopf = (b, h) => `<svg viewBox="0 0 ${b} ${h}" xmlns="http://www.w3.org/2000/svg">`;

// ---------- Skizze: Störgrößenaufschaltung (Folie 4) ----------
const svgAufschaltung = kopf(520, 215) +
  txt(4, 124, 'W(s)') + pfeil(40, 120, 51, 120) + kreis(60, 120) + txt(46, 142, '−', 'middle', 14) +
  pfeil(69, 120, 90, 120) + kasten(90, 100, 60, 40, 'R(s)') +
  lin(150, 120, 191, 120) + txt(153, 112, 'Y_R(s)', 'start', 10) + kreis(200, 120) + txt(186, 100, '−', 'middle', 14) +
  pfeil(209, 120, 230, 120) + txt(196, 140, 'Y(s)', 'start', 10) + kasten(230, 100, 60, 40, 'G₁(s)') +
  lin(290, 120, 326, 120) + txt(296, 114, 'X₁(s)', 'start', 11) + kreis(335, 120) +
  pfeil(344, 120, 365, 120) + kasten(365, 100, 60, 40, 'G₂(s)') +
  lin(425, 120, 480, 120) + punkt(465, 120) + pfeil(465, 120, 505, 120) + txt(470, 112, 'X(s)', 'start', 12) +
  lin(465, 120, 465, 195) + lin(465, 195, 60, 195) + pfeil(60, 195, 60, 129) +
  lin(335, 10, 335, 38) + txt(345, 20, 'Z(s)') + punkt(335, 38) + pfeil(335, 38, 335, 111) +
  pfeil(335, 38, 290, 38) + kasten(230, 20, 60, 36, 'A(s)') +
  lin(230, 38, 200, 38) + pfeil(200, 38, 200, 111) +
  `<rect x="224" y="90" width="216" height="62" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="5 4"/>` +
  txt(327, 168, 'Strecke', 'middle', 11) + '</svg>';

// ---------- Skizze: Kaskadenregler (Folie 13) ----------
const svgKaskade = kopf(560, 215) +
  txt(4, 124, 'W(s)') + pfeil(40, 120, 51, 120) + kreis(60, 120) + txt(46, 142, '−', 'middle', 14) +
  pfeil(69, 120, 85, 120) + kasten(85, 100, 55, 40, 'R₂(s)') + txt(112, 90, 'Führungsregler', 'middle', 10) +
  lin(140, 120, 171, 120) + txt(142, 112, 'Y_R(s)', 'start', 10) + kreis(180, 120) + txt(166, 142, '−', 'middle', 14) +
  pfeil(189, 120, 215, 120) + txt(190, 154, 'W_H(s)', 'start', 10) + kasten(215, 100, 55, 40, 'R₁(s)') + txt(242, 90, 'Folgeregler', 'middle', 10) +
  pfeil(270, 120, 315, 120) + txt(278, 114, 'Y(s)', 'start', 10) + kasten(315, 100, 55, 40, 'G₁(s)') +
  lin(370, 120, 412, 120) + punkt(398, 120) + pfeil(398, 120, 425, 120) + txt(378, 112, 'X_H(s)', 'start', 10) +
  kasten(425, 100, 55, 40, 'G₂(s)') + lin(480, 120, 510, 120) + punkt(500, 120) + pfeil(500, 120, 545, 120) + txt(505, 112, 'X(s)', 'start', 12) +
  txt(352, 55, 'Z(s)') + pfeil(342, 50, 342, 100) +
  lin(398, 120, 398, 165) + lin(398, 165, 180, 165) + pfeil(180, 165, 180, 129) +
  lin(500, 120, 500, 195) + lin(500, 195, 60, 195) + pfeil(60, 195, 60, 129) +
  txt(290, 182, 'innerer Kreis', 'middle', 10) + txt(280, 210, 'äußerer Kreis', 'middle', 10) + '</svg>';

// ---------- Skizze: Vorfilter und Vorsteuerung (Folie 29) ----------
const svgVorfilter = kopf(480, 205) +
  txt(4, 124, 'W(s)') + lin(40, 120, 52, 120) + punkt(52, 120) + pfeil(52, 120, 75, 120) + kasten(75, 100, 60, 40, 'S₁(s)') + txt(105, 92, 'Vorfilter', 'middle', 11) +
  lin(135, 120, 151, 120) + kreis(160, 120) + txt(148, 142, '−', 'middle', 14) + pfeil(169, 120, 190, 120) +
  kasten(190, 100, 55, 40, 'R(s)') + lin(245, 120, 277, 120) + kreis(286, 120) + pfeil(295, 120, 320, 120) +
  kasten(320, 100, 55, 40, 'G(s)') + lin(375, 120, 405, 120) + punkt(405, 120) + pfeil(405, 120, 455, 120) + txt(430, 112, 'X(s)', 'start', 12) +
  txt(357, 62, 'Z(s)') + pfeil(347, 50, 347, 100) +
  lin(405, 120, 405, 175) + lin(405, 175, 160, 175) + pfeil(160, 175, 160, 129) +
  lin(52, 120, 52, 40) + pfeil(52, 40, 160, 40) + kasten(160, 22, 70, 36, 'S₂(s)') + txt(195, 16, 'Vorsteuerung', 'middle', 11) +
  lin(230, 40, 286, 40) + pfeil(286, 40, 286, 111) + '</svg>';

// ---------- Skizze: Regler in der Rückführung (Folie 34) ----------
const svgRueckfuehrung = kopf(430, 225) +
  txt(4, 104, 'W(s)') + pfeil(40, 100, 51, 100) + kreis(60, 100) + txt(46, 122, '−', 'middle', 14) +
  pfeil(69, 100, 90, 100) + kasten(90, 80, 50, 40, 'I') + txt(115, 72, 'Regler', 'middle', 11) +
  pfeil(140, 100, 171, 100) + kreis(180, 100) + txt(166, 122, '−', 'middle', 14) +
  pfeil(189, 100, 215, 100) + kasten(215, 80, 55, 40, 'G(s)') + lin(270, 100, 301, 100) + kreis(310, 100) +
  txt(320, 45, 'Z(s)') + pfeil(310, 40, 310, 91) +
  lin(319, 100, 350, 100) + punkt(350, 100) + pfeil(350, 100, 400, 100) + txt(372, 92, 'X(s)', 'start', 12) +
  lin(350, 100, 350, 205) + lin(350, 205, 60, 205) + pfeil(60, 205, 60, 109) +
  punkt(60, 160) + pfeil(60, 160, 90, 160) + kasten(90, 140, 50, 40, 'PD') + lin(140, 160, 180, 160) + pfeil(180, 160, 180, 109) + '</svg>';

// ---------- Skizze: Zweipunktregler mit Hysterese (Folie 38) ----------
const svgZweipunkt = `<svg viewBox="0 -4 310 182" xmlns="http://www.w3.org/2000/svg">` +
  pfeil(20, 130, 280, 130) + txt(284, 134, 'e(t)', 'start', 12) + pfeil(150, 140, 150, 10) + txt(156, 14, 'y(t)', 'start', 12) +
  lin(95, 45, 250, 45) + txt(256, 49, 'a', 'start', 13) +
  pfeil(95, 45, 95, 100) + lin(95, 100, 95, 130) +
  lin(195, 130, 195, 90) + pfeil(195, 130, 195, 45) +
  txt(95, 150, '−e_S', 'middle', 12) + txt(195, 150, '+e_S', 'middle', 12) + txt(144, 146, '0', 'end', 10) + '</svg>';

// ---------- Skizze: Zweigrößensystem (Folie 53) ----------
const svgMimo = kopf(420, 215) +
  txt(4, 44, 'Y₁(s)') + lin(46, 40, 70, 40) + punkt(70, 40) + pfeil(70, 40, 130, 40) + kasten(130, 22, 70, 36, 'G₁₁(s)', 13) +
  lin(70, 40, 70, 90) + pfeil(70, 90, 130, 90) + kasten(130, 72, 70, 36, 'G₂₁(s)', 13) +
  txt(4, 184, 'Y₂(s)') + lin(46, 180, 80, 180) + punkt(80, 180) + pfeil(80, 180, 130, 180) + kasten(130, 162, 70, 36, 'G₂₂(s)', 13) +
  lin(80, 180, 80, 130) + pfeil(80, 130, 130, 130) + kasten(130, 112, 70, 36, 'G₁₂(s)', 13) +
  lin(200, 40, 301, 40) + lin(200, 180, 301, 180) +
  lin(200, 90, 255, 90) + pfeil(255, 90, 310, 171) +
  lin(200, 130, 255, 130) + pfeil(255, 130, 310, 49) +
  kreis(310, 40) + kreis(310, 180) +
  pfeil(319, 40, 370, 40) + txt(374, 44, 'X₁(s)') + pfeil(319, 180, 370, 180) + txt(374, 184, 'X₂(s)') +
  txt(255, 207, 'Querkopplung', 'middle', 11) + '</svg>';

export const ANTWORTEN = [
  // ============ Störgrößenaufschaltung: Prinzip ============
  {
    id: 'v07-stoergroessenaufschaltung',
    bereich: 'vorlesung',
    vorlesung: 'V07',
    titel: 'Störgrößenaufschaltung: Prinzip, A(s) = 1/G₁(s)',
    quellen: 'V07 Folie 3–7 · Ü03 A5',
    stichworte: 'störgrößenaufschaltung stoergroessenaufschaltung störgröße aufschalten messung kompensation feedforward disturbance feedforward A(s) G_Z G_W Störübertragungsfunktion Führungsübertragungsfunktion Teilstrecke',
    frage: 'Erläutern Sie das Prinzip der Störgrößenaufschaltung. Skizzieren Sie den Wirkungsplan, geben Sie G_W(s) und G_Z(s) an und bestimmen Sie A(s), sodass die Störung vollständig kompensiert wird.',
    antwort: [
      { t: 'p', text: 'Idee (Folie 3): Die Störgröße Z(s) ist messbar (Beispiel: Brenner schaltet ein → Druckabfall im Gasnetz). Weil die Information vorliegt, wird sie gemessen und über ein Glied A(s) in den Regelkreis zurückgeführt (aufgeschaltet), bevor die Regelung die Störung am Ausgang bemerkt.' },
      { t: 'svg', svg: svgAufschaltung, unterschrift: 'Wirkungsplan nach Folie 4: Strecke = G₁(s) und G₂(s), Z(s) greift zwischen G₁ und G₂ an, A(s) schaltet Z(s) vor G₁ auf (negatives Vorzeichen).' },
      { t: 'zwischen', text: 'Gesamtübertragungsfunktion (Ü03 A5)' },
      { t: 'formel', text: 'X(s) = G₁G₂R/(1 + G₁G₂R) · W(s) + (G₂ − G₁G₂A)/(1 + G₁G₂R) · Z(s)' },
      { t: 'formel', text: 'X(s) = G_W(s)·W(s) + G_Z(s)·Z(s)' },
      { t: 'formel', text: 'G_W(s) = G₁(s)G₂(s)R(s) / (1 + G₁(s)G₂(s)R(s))' },
      { t: 'formel', text: 'G_Z(s) = (G₂(s) − G₁(s)G₂(s)A(s)) / (1 + G₁(s)G₂(s)R(s)) = G₂(s)·(1 − G₁(s)A(s)) / (1 + G₁(s)G₂(s)R(s))' },
      { t: 'p', text: 'G_Z(s) muss klein oder 0 werden. Der Nenner ist der Regelkreis (nicht änderbar), also muss der Zähler-Term verschwinden.' },
      { t: 'zwischen', text: 'Herleitung am Ausschnitt (Teilstrecke, Folie 7)' },
      { t: 'formel', text: `X₁(s) = Z(s) + G₁(s)·Y(s)
X₁(s) = Z(s) + G₁(s)·(Y_R(s) − A(s)·Z(s))
X₁(s) = (1 − G₁(s)A(s))·Z(s) + G₁(s)·Y_R(s)` },
      { t: 'formel', text: `Bedingung:  1 − G₁(s)A(s) = 0   ⇒   A(s) = 1/G₁(s)` },
      { t: 'hinweis', text: 'Die Führung bleibt unverändert (G_W enthält A nicht). A(s) = 1/G₁(s) ist meist nicht exakt realisierbar (Zählergrad > Nennergrad) → siehe statische und dynamische Aufschaltung.' },
      { t: 'link', ziel: 'a/standardregelkreis', text: 'Standardregelkreis (G_W, G_Z)' },
      { t: 'link', ziel: 'a/v07-statisch-dynamisch', text: 'Statische / dynamische Störgrößenaufschaltung (nächster Eintrag)' },
    ],
  },

  // ============ Statisch / dynamisch ============
  {
    id: 'v07-statisch-dynamisch',
    bereich: 'vorlesung',
    vorlesung: 'V07',
    titel: 'Statische und dynamische Störgrößenaufschaltung (Vorverstärkung VV)',
    quellen: 'V07 Folie 8–12',
    stichworte: 'statische störgrößenaufschaltung dynamische störgrößenaufschaltung A(s)=1/K1 PD-T1 Vorverstärkung VV G_Z1 ausgeregelt 3T1 realisierbar PDT1',
    frage: 'Die Teilstrecke sei G₁(s) = K₁/(T₁s + 1). Geben Sie die statische und die dynamische Störgrößenaufschaltung an und vergleichen Sie das Störverhalten.',
    antwort: [
      { t: 'formel', text: 'Teilstrecke:  G₁(s) = K₁ / (T₁s + 1)' },
      { t: 'zwischen', text: 'Statische Aufschaltung (Folie 8)' },
      { t: 'formel', text: `A(s) = 1/K₁   (reiner P-Anteil, trifft nur den stationären Wert)

1 − G₁(s)A(s) = 1 − 1/(T₁s + 1) = T₁s / (T₁s + 1)` },
      { t: 'p', text: 'Verhalten bei Störgrößensprung (Folie 9, T₁ = 0,2): G_Z1(s) = 0,2s/(0,2s + 1). Die Störung klingt wie e^(−t/T₁) ab: nach etwa 3·T₁ ausgeregelt. Endwert = 0 (stationär vollständig kompensiert), aber es bleibt eine Abweichung während des Einschwingens.' },
      { t: 'zwischen', text: 'Dynamische Aufschaltung, idealer Fall (Folie 10)' },
      { t: 'formel', text: `A(s) = (T₁s + 1)/K₁   ⇒   1 − G₁(s)A(s) = 1 − 1 = 0` },
      { t: 'p', text: 'Ideal, aber nicht realisierbar (reiner Differenzierer, Zählergrad > Nennergrad).' },
      { t: 'zwischen', text: 'Technisch realisierbar mit P-D-T₁-Glied (Folie 11)' },
      { t: 'formel', text: `A(s) = (1/K₁) · (T₁s + 1) / ((T₁/VV)·s + 1)

1 − G₁(s)A(s) = 1 − 1/((T₁/VV)s + 1) = ((T₁/VV)·s) / ((T₁/VV)·s + 1)` },
      { t: 'p', text: 'VV = Vorverstärkung. Die Zeitkonstante der Restabweichung wird T₁/VV: je größer VV, desto schneller wird die Störung ausgeregelt (Folie 12, VV = 1; 2; 4; 5; 10). VV = 1 entspricht der statischen Aufschaltung.' },
      { t: 'tabelle', kopf: ['VV', 'Zeitkonstante T₁/VV bei T₁ = 0,2 s', 'ausgeregelt nach ≈ 3·T₁/VV'], zeilen: [
        ['1', '0,2 s', '0,6 s'],
        ['2', '0,1 s', '0,3 s'],
        ['4', '0,05 s', '0,15 s'],
        ['10', '0,02 s', '0,06 s'],
      ] },
      { t: 'hinweis', text: 'Die Werte der Tabelle sind aus T₁/VV gerechnet (Folie 12 zeigt nur das Diagramm). Zu beachten: großes VV macht A(s) empfindlicher auf Messrauschen.' },
      { t: 'link', ziel: 'a/v07-stoergroessenaufschaltung', text: 'Prinzip und Herleitung A(s) = 1/G₁(s)' },
    ],
  },

  // ============ Kaskadenregler ============
  {
    id: 'v07-kaskadenregler',
    bereich: 'vorlesung',
    vorlesung: 'V07',
    titel: 'Kaskadenregler: Struktur, Voraussetzung, Aufgaben der Regler',
    quellen: 'V07 Folie 13–16, 25',
    stichworte: 'kaskadenregler kaskadenregelung führungsregler folgeregler hilfsregelgröße X_H W_H innerer äußerer regelkreis unterlagert cascade control störgröße nicht messbar',
    frage: 'Wann setzt man einen Kaskadenregler ein? Skizzieren Sie die Struktur, benennen Sie Führungs- und Folgeregler und nennen Sie die Voraussetzung.',
    antwort: [
      { t: 'p', text: 'Wenn die Störgröße Z(s) nicht messbar ist, geht keine Störgrößenaufschaltung. Dann kann eine Kaskadenregelung eingesetzt werden. Voraussetzung: Die innere Hilfsregelgröße X_H(s) muss messbar sein.' },
      { t: 'svg', svg: svgKaskade, unterschrift: 'Struktur nach Folie 13. W_H(s) = Führungsgröße des Folgereglers, X_H(s) = Hilfsregelgröße.' },
      { t: 'tabelle', kopf: ['', 'Innerer Kreis', 'Äußerer Kreis'], zeilen: [
        ['Regler', 'Folgeregler R₁(s)', 'Führungsregler R₂(s)'],
        ['Strecke', 'Teilstrecke G₁(s), mit Störung Z(s) behaftet', 'Teilstrecke G₂(s), ohne Störung'],
        ['Regelgröße', 'Hilfsregelgröße X_H(s)', 'Regelgröße X(s)'],
        ['Aufgabe', 'Störgröße ausregeln, gutes Störverhalten, Nichtlinearitäten (z. B. Stellgrößenbeschränkung) kompensieren', 'gutes Führungsverhalten'],
      ] },
      { t: 'p', text: 'Der Ausgang des Führungsreglers R₂(s) ist die Führungsgröße W_H(s) des Folgereglers. Einstellung der Regelkreise von innen nach außen.' },
      { t: 'liste', items: [
        'Führungsregler: erzeugt die Führungsgröße für den Folgeregler, ausgelegt für gutes Führungsverhalten.',
        'Folgeregler: verwendet eine Hilfsregelgröße, regelt Störungen im inneren Kreis aus, ausgelegt für gutes Störverhalten.',
      ] },
      { t: 'hinweis', text: 'Praxisbeispiel Folie 26–27: Behälter mit Kühler (Soletemperatur im Wärmetauscher als Hilfsgröße innen, Behältertemperatur außen). Mit Kaskade bleibt die Behältertemperatur unter der erlaubten Maximaltemperatur, ohne Kaskade überschreitet sie sie.' },
      { t: 'link', ziel: 'a/v07-kaskade-gleichstrommotor', text: 'Beispiel Gleichstrommotor (3-stufige Kaskade)' },
    ],
  },

  // ============ Kaskade Gleichstrommotor ============
  {
    id: 'v07-kaskade-gleichstrommotor',
    bereich: 'vorlesung',
    vorlesung: 'V07',
    titel: 'Kaskade am Gleichstrommotor: Strom, Drehzahl, Lage; G_W der Drehzahlregelung',
    quellen: 'V07 Folie 17–24',
    stichworte: 'kaskade gleichstrommotor dreifachkaskade stromregelung drehzahlregelung lageregelung ankerstrom I_A PI-Regler P-Regler Ersatzmodell Momentenregelkreis T_E Kp Tn K 2πJ führungsübertragungsfunktion',
    frage: 'Beschreiben Sie die Kaskadenregelung eines Gleichstrommotors und berechnen Sie die Führungsübertragungsfunktion der Drehzahlregelung mit unterlagertem Momentenregelkreis.',
    antwort: [
      { t: 'p', text: 'Dreifachkaskade (Folie 17): (1) Stromregelung (Ankerstrom I_A, innen), (2) Drehzahlregelung N(s) (Mitte), (3) Lageregelung X(s) (außen). Der Führungsregler gibt jeweils den Sollwert für den Folgeregler vor: Lageregler → Soll-Drehzahl, Drehzahlregler → Soll-Ankerstrom.' },
      { t: 'zwischen', text: 'Drehzahlregelung mit unterlagertem Momentenregelkreis (Folie 21)' },
      { t: 'p', text: 'Der unterlagerte Strom-/Momentenregelkreis wird als PT₁ (Ersatzmodell, Zeitkonstante T_E) ersetzt, dahinter folgt die Mechanik 1/(2πJ·s) (Last M_L als Störgröße).' },
      { t: 'formel', text: `Strecke:  G(s) = K / ((T_E·s + 1)·s)   mit K = 1/(2πJ)
Regler:   R(s) = K_p · (T_n·s + 1) / (T_n·s)   (PI)` },
      { t: 'formel', text: 'Offener Kreis:  G₀(s) = R(s)·G(s) = K_p·(T_n·s + 1)·K / (T_n·s²·(T_E·s + 1)) = Z₀(s)/N₀(s)' },
      { t: 'formel', text: `G_W(s) = G₀/(1 + G₀) = Z₀/(N₀ + Z₀)
       = K_p(T_n s + 1)K / ( T_n s²(T_E s + 1) + K_p(T_n s + 1)K )` },
      { t: 'formel', text: 'G_W(s) = (K_p·K·T_n·s + K_p·K) / (T_n·T_E·s³ + T_n·s² + K_p·K·T_n·s + K_p·K)' },
      { t: 'hinweis', text: 'Nachgerechnet: Nenner T_n·s²·(T_E·s + 1) = T_n·T_E·s³ + T_n·s²; dazu K_p·K·(T_n·s + 1). Das ergibt genau den Nenner oben, Ordnung 3. Stabilität z. B. mit dem Hurwitz-Rechner prüfen.' },
      { t: 'link', ziel: 'hurwitz', text: 'Hurwitz-Rechner (Stabilität des Nenners)' },
      { t: 'zwischen', text: 'Lageregelung (Folie 24)' },
      { t: 'p', text: 'Zusätzlich außen: P-Regler (Lage-Soll − X → N-Soll), dahinter der PI-Drehzahlregler, der Momenten-/Stromkreis (Ersatz-PT₁), die Mechanik 1/(2πJs) mit Ausgang N(s) und ein Integrierer K_L/s von der Drehzahl zur Lage X(s).' },
    ],
  },

  // ============ Vorfilter / Vorsteuerung ============
  {
    id: 'v07-vorfilter-vorsteuerung',
    bereich: 'vorlesung',
    vorlesung: 'V07',
    titel: 'Vorfilter S₁(s) und Vorsteuerung S₂(s): Entwurf mit G_wün',
    quellen: 'V07 Folie 28–33 · Ü07 A1',
    stichworte: 'vorfilter vorsteuerung S1 S2 G_wun G_wün wunschübertragungsfunktion führungsverhalten störverhalten entkopplung überschwingen vorfilter PT1 Führungsübertragungsfunktion two degrees of freedom',
    frage: 'Ein Regelkreis hat Vorfilter S₁(s) und Vorsteuerung S₂(s). Bestimmen Sie S₁ und S₂ so, dass der Kreis das Wunschverhalten G_wün(s) zeigt.',
    antwort: [
      { t: 'svg', svg: svgVorfilter, unterschrift: 'Regelkreis mit Vorfilter und Vorsteuerung (Folie 29). Ohne Vorsteuerung (Folie 28) gibt es nur das Vorfilter S(s).' },
      { t: 'p', text: 'Reglerentwurf ist oft ein Kompromiss zwischen gutem Führungsverhalten und gutem Störverhalten. Lösung: Regler auf das Störverhalten auslegen, das Führungsverhalten mit Vorfilter/Vorsteuerung getrennt einstellen.' },
      { t: 'liste', items: [
        'Vorfilter (z. B. PT₁-Glied): Regelkreis ist auf gutes Störverhalten eingestellt, das Vorfilter vermeidet Überschwinger der Führungssprungantwort.',
        'Vorsteuerung: theoretische Entkopplung von Führungs- und Störverhalten, der Regler wird nur für das Störverhalten optimiert.',
      ] },
      { t: 'zwischen', text: 'Führungsübertragungsfunktion (Folie 31)' },
      { t: 'formel', text: 'X(s) = (G(s)·S₂(s) + R(s)·S₁(s)) / (1 + G(s)·R(s)) · W(s)  =  G_wün(s)·W(s)' },
      { t: 'zwischen', text: 'Vorgabe (Folie 32)' },
      { t: 'formel', text: `Vorfilter:      S₁(s) = G_wün(s)
Vorsteuerung:  S₂(s) = G_wün(s) / G(s)` },
      { t: 'zwischen', text: 'Probe (Folie 33)' },
      { t: 'formel', text: `(G·G_wün/G + R·G_wün)/(1 + G·R) = G_wün·(1 + R·G)/(1 + G·R) = G_wün` },
      { t: 'zwischen', text: 'Beispiel Ü07 A1' },
      { t: 'formel', text: `G(s) = 1/((4s+1)(5s+1)(20s+1)),   G_wün(s) = 1/(3s+1)⁴

S₁(s) = 1/(3s+1)⁴
S₂(s) = G_wün/G = (4s+1)(5s+1)(20s+1)/(3s+1)⁴
      = (400s³ + 200s² + 29s + 1) / (81s⁴ + 108s³ + 54s² + 12s + 1)` },
      { t: 'hinweis', text: 'S₂ ist realisierbar, weil der Nennergrad (4) größer ist als der Zählergrad (3). Wäre G_wün „schneller“ (Nennergrad zu klein), wäre S₂ nicht realisierbar. Die Vorsteuerung hilft nur gegen Führungs-, nicht gegen Störgrößen Z(s): die muss weiter der Regler ausgleichen. Außerdem ist S₂ = G_wün/G nur bei stabilem G(s) sinnvoll (sonst werden Pole gekürzt).' },
    ],
  },

  // ============ Regler in der Rückführung ============
  {
    id: 'v07-regler-rueckfuehrung',
    bereich: 'vorlesung',
    vorlesung: 'V07',
    titel: 'Regler in der Rückführung (I-Regler vorwärts, PD in der Rückführung)',
    quellen: 'V07 Folie 34–36',
    stichworte: 'regler in der rückführung rückkopplungszweig PD I aufgespalten separater entwurf führungsverhalten störverhalten anregelzeit überschwingen stellgröße feedback controller',
    frage: 'Skizzieren Sie die Struktur „Regler in der Rückführung“ und nennen Sie Vor- und Nachteile gegenüber dem PID-Regler.',
    antwort: [
      { t: 'p', text: 'PD- und I-Anteil sind aufgespalten: Der I-Anteil liegt im Vorwärtszweig (hinter dem Soll-Ist-Vergleich), der PD-Anteil wird direkt aus der Regelgröße X(s) gebildet und negativ vor der Strecke aufgeschaltet.' },
      { t: 'svg', svg: svgRueckfuehrung, unterschrift: 'Struktur nach Folie 34: I-Regler vorwärts, PD im Rückführungszweig, Z(s) greift am Ausgang der Strecke an.' },
      { t: 'zwischen', text: 'Vorteile' },
      { t: 'liste', items: [
        'Separater Entwurf von Führungs- und Störverhalten ist in Grenzen möglich.',
        'Störungen werden durch die direkte Rückführung schneller ausgeglichen.',
        'Schnelle Bedieneingriffe (Sollwertsprünge) führen nicht mehr zu großen Stellgrößenänderungen y(t) und/oder zu Überschwingern der Regelgröße x(t), da der Sollwert nicht durch den D-Anteil läuft.',
      ] },
      { t: 'zwischen', text: 'Nachteil' },
      { t: 'p', text: 'Die Anregelzeit wird durch den fehlenden PD-Anteil im Vorwärtszweig deutlich länger (Vergleich der Führungssprungantworten auf Folie 36: PID-Regler schneller, Regler in der Rückführung ohne Überschwingen).' },
    ],
  },

  // ============ Zweipunktregler ============
  {
    id: 'v07-zweipunktregler',
    bereich: 'vorlesung',
    vorlesung: 'V07',
    titel: 'Zweipunktregler und Dreipunktregler, Schalthysterese',
    quellen: 'V07 Folie 37–43',
    stichworte: 'zweipunktregler dreipunktregler schaltender regler hysterese schaltdifferenz e_S tastverhältnis T_Ein T_Aus PWM tiefsetzer brenner an aus bang-bang on-off',
    frage: 'Erläutern Sie den Zweipunktregler. Warum führt man eine Hysterese ein? Zeichnen Sie die Kennlinie.',
    antwort: [
      { t: 'p', text: 'Schaltender Regler: Die Stellgröße kann nur zwei Werte annehmen (0 und a), z. B. Brenner AN / Brenner AUS.' },
      { t: 'formel', text: `y(t) = a   für e(t) > 0
y(t) = 0   für e(t) ≤ 0` },
      { t: 'p', text: 'Harte Schaltbedingung führt zu Schwingungen (ständiges Schalten um den Sollwert). Lösung: Einführung einer (Schalt-)Hysterese mit den Schaltgrenzen −e_S und +e_S, Schaltdifferenz Δe = [−e_S, +e_S].' },
      { t: 'svg', svg: svgZweipunkt, unterschrift: 'Kennlinie mit Hysterese (Folie 38). Die Pfeile geben die Laufrichtung an: bei +e_S springt y auf a, bei −e_S zurück auf 0.' },
      { t: 'p', text: 'Signalflussbild (Folie 39): Soll-Ist-Vergleich E(s) = W(s) − X(s) → Zweipunktregler → Y(s) → Strecke G(s) (mit Z(s)) → X(s) zurück auf den Vergleich.' },
      { t: 'zwischen', text: 'Verhalten (Folie 40–41)' },
      { t: 'liste', items: [
        'Beispiel PT₁-Strecke G(s) = 2/(4s + 1), Sprung als Führungsgröße, Schaltdifferenz ±0,1: Einregelvorgang ca. 4 s, danach schwingt x(t) um den Sollwert mit konstantem Tastverhältnis.',
        'w = 1: T_Ein = T_Aus = 50 %. Bei w = 1,5 wird T_Ein größer als T_Aus (Schaltdifferenz unverändert). Das Tastverhältnis stellt also den Mittelwert ein.',
        'Dreipunktregler: drei Stellwerte, z. B. Heizen, Kühlen, Aus.',
        'Anwendung (Folie 42–43): Tiefsetzsteller – Spannung u₁(t) wird mit PWM (Pulsweitenmodulation) auf eine niedrigere Spannung u₂(t) heruntergesetzt; die Spannung bleibt bei Last 100 Ω und 20 Ω nahezu konstant.',
      ] },
    ],
  },

  // ============ Matrizenrechnung ============
  {
    id: 'v07-matrizenrechnung',
    bereich: 'vorlesung',
    vorlesung: 'V07',
    titel: 'Exkurs Matrizenrechnung: Produkt, Determinante (Sarrus), Inverse 2×2',
    quellen: 'V07 Folie 44–50 · Ü07',
    stichworte: 'matrix matrizen matrizenrechnung multiplikation skalarprodukt determinante sarrus 2x2 3x3 inverse inverse matrix numpy laplace entwicklung determinant',
    frage: 'Berechnen Sie die Determinante und die Inverse einer 2×2-Matrix. Welche Dimension hat A·B für A (2×3) und B (3×2)?',
    antwort: [
      { t: 'zwischen', text: 'Multiplikation (Folie 46)' },
      { t: 'formel', text: `(n×m)·(m×p) ⇒ (n×p)
A (2×3)·B (3×2) ⇒ (2×2)      B·A (3×2)·(2×3) ⇒ (3×3)` },
      { t: 'p', text: 'Zeile mal Spalte (Skalarprodukt): c_ij = Σ_k a_ik·b_kj. Die Reihenfolge ist nicht vertauschbar: A·B ≠ B·A.' },
      { t: 'zwischen', text: 'Determinante (Folie 48–49)' },
      { t: 'formel', text: `2×2:  det [a b; c d] = a·d − b·c

3×3 (Regel von Sarrus, Zeilen a, b, c):
det = a₁b₂c₃ + a₂b₃c₁ + a₃b₁c₂ − c₁b₂a₃ − c₂b₃a₁ − c₃b₁a₂` },
      { t: 'p', text: 'Merkregel Sarrus: Die ersten beiden Zeilen unter die Determinante schreiben, die drei Produkte längs der durchgezogenen Diagonalen addieren, die drei längs der gestrichelten subtrahieren. Größere Matrizen: Laplace-Entwicklung nach einer Zeile mit vielen Nullen (siehe V08, Hurwitz).' },
      { t: 'zwischen', text: 'Inverse (Folie 47)' },
      { t: 'formel', text: `2×2:  A = [a b; c d]  ⇒  A⁻¹ = 1/(a·d − b·c) · [d −b; −c a]
Voraussetzung: det A ≠ 0` },
      { t: 'p', text: 'Allgemein: A⁻¹ = (1/det A)·adj(A) (adj = transponierte Kofaktormatrix). Probe: A·A⁻¹ = E.' },
      { t: 'hinweis', text: 'Die Folien 45 und 47 enthalten Formeln nur als Bild; die Inverse 2×2 ist hier als Standardformel angegeben und nachgerechnet. Mit Computer: Python import numpy as np, np.linalg.det(A), np.linalg.inv(A).' },
      { t: 'link', ziel: 'matrix', text: 'Matrix-Rechner' },
    ],
  },

  // ============ Entkopplung ============
  {
    id: 'v07-entkopplung',
    bereich: 'vorlesung',
    vorlesung: 'V07',
    titel: 'Entkopplung von Mehrgrößensystemen: Entkopplungsfilter F(s), F(0)',
    quellen: 'V07 Folie 51–59',
    stichworte: 'entkopplung mehrgrößensystem zweigrößensystem MIMO übertragungsmatrix querkopplung hauptübertragungsfunktion entkopplungsfilter filtermatrix F(s) statisch dynamisch inverse G^-1 G_Ent',
    frage: 'Ein Zweigrößensystem X(s) = G(s)·Y(s) soll entkoppelt werden. Geben Sie das Entkopplungsfilter F(s) an (dynamisch und statisch).',
    antwort: [
      { t: 'svg', svg: svgMimo, unterschrift: 'Wirkungsplan des Zweigrößensystems (Folie 53): G₂₁ koppelt Y₁ auf X₂, G₁₂ koppelt Y₂ auf X₁.' },
      { t: 'liste', items: [
        'Hauptübertragungsfunktionen: G₁₁(s), G₂₂(s).',
        'Querkopplungsfunktionen: G₂₁(s) koppelt X₂ mit Y₁ (Eingang 1 wirkt auf Ausgang 2), G₁₂(s) koppelt X₁ mit Y₂.',
        'Ziel: Entkopplung von X₁(s) und X₂(s), d. h. G₂₁(s) = G₁₂(s) = 0.',
      ] },
      { t: 'p', text: 'Ohne Berücksichtigung der Verkopplung (Folie 52) regeln zwei Einzelregler R₁, R₂ die beiden Kreise; die Querkopplung stört sie gegenseitig.' },
      { t: 'zwischen', text: 'Entwurf des Filters (Folie 55–57)' },
      { t: 'formel', text: `X(s) = G(s)·F(s)·Y(s),   gewünscht:  G_Ent(s) = G(s)·F(s) = [G₁₁ 0; 0 G₂₂]
Multiplikation von links mit G⁻¹(s):
F(s) = G⁻¹(s)·G_Ent(s)` },
      { t: 'zwischen', text: 'Dynamisches Entkopplungsfilter (Folie 58)' },
      { t: 'formel', text: `F(s) = 1/(1 − G₂₁G₁₂/(G₁₁G₂₂)) · [ 1       −G₁₂/G₁₁ ;
                                  −G₂₁/G₂₂    1   ]` },
      { t: 'zwischen', text: 'Statisches Entkopplungsfilter (Folie 59, Grenzfall t → ∞, s → 0)' },
      { t: 'formel', text: `F(0) = 1/(1 − G₂₁(0)G₁₂(0)/(G₁₁(0)G₂₂(0))) · [ 1  −G₁₂(0)/G₁₁(0) ;
                                          −G₂₁(0)/G₂₂(0)  1 ]` },
      { t: 'hinweis', text: 'Nachgerechnet: G⁻¹ = 1/(G₁₁G₂₂ − G₁₂G₂₁)·[G₂₂ −G₁₂; −G₂₁ G₁₁]; mal diag(G₁₁, G₂₂) und Kürzen mit G₁₁G₂₂ ergibt die Formel von Folie 58. Fehler auf Folie 59: Die Überschrift sagt F(0), die Formel ist dort noch mit „F(s) =“ beschriftet – gemeint ist F(0). Das statische Filter ist nur aus Konstanten (Verstärkungen) aufgebaut und deshalb leicht zu realisieren, entkoppelt aber nur im Beharrungszustand.' },
      { t: 'link', ziel: 'matrix', text: 'Matrix-Rechner (Inverse, Produkt)' },
    ],
  },
];
