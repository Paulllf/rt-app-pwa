// Vorlesung 08: Hurwitz-Kriterium, Zustandsraumdarstellung – Format: tools/inhalte-format.md
// Nur Ergänzungen zu den vorhandenen Einträgen hurwitz-kriterium / stabilitaet-bedingung und den Rechnern hurwitz, zustandsraum.
// Folien-Nummern = Foliennummer unten rechts (ab Folie 30 liegt die PDF-Seite eine Seite davor, die Nummer 29 fehlt).
// Skizzen: nur currentColor, kein Skript, kein Link.

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
// Integrierer: Kasten mit Diagonale
const integrator = (x, y, b, h) =>
  `<rect x="${x}" y="${y}" width="${b}" height="${h}" fill="none" stroke="currentColor" stroke-width="1.5"/>` +
  lin(x, y + h, x + b, y);
const kreis = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
const punkt = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="3" fill="currentColor"/>`;
const kopf = (b, h) => `<svg viewBox="0 0 ${b} ${h}" xmlns="http://www.w3.org/2000/svg">`;

// ---------- Skizze: Zustandsraum SISO (Folie 25) ----------
const svgSiso = kopf(520, 215) +
  txt(4, 104, 'u(t)') + lin(40, 110, 50, 110) + punkt(50, 110) + pfeil(50, 110, 75, 110) +
  kasten(75, 90, 45, 40, 'b') + lin(120, 110, 150, 110) + pfeil(150, 110, 151, 110) + kreis(160, 110) +
  pfeil(169, 110, 190, 110) + integrator(190, 90, 60, 40) + txt(190, 82, 'ẋ(t)', 'start', 12) +
  lin(250, 110, 285, 110) + punkt(285, 110) + txt(262, 102, 'x(t)', 'start', 12) + pfeil(285, 110, 330, 110) +
  kasten(330, 90, 50, 40, 'cᵀ') + lin(380, 110, 431, 110) + kreis(440, 110) + pfeil(449, 110, 495, 110) + txt(470, 102, 'v(t)', 'start', 12) +
  lin(50, 110, 50, 32) + pfeil(50, 32, 180, 32) + kasten(180, 14, 50, 36, 'd') + lin(230, 32, 440, 32) + pfeil(440, 32, 440, 101) +
  lin(285, 110, 285, 175) + pfeil(285, 175, 250, 175) + kasten(190, 155, 60, 40, 'A') + lin(190, 175, 160, 175) + pfeil(160, 175, 160, 119) +
  '</svg>';

// ---------- Skizze: Regelungsnormalform n = 3 (Folie 50) ----------
const svgRnf = `<svg viewBox="0 -10 580 268" xmlns="http://www.w3.org/2000/svg">` +
  txt(4, 104, 'u(t)') + pfeil(40, 110, 51, 110) + kreis(60, 110) + txt(46, 130, '−', 'middle', 14) +
  pfeil(69, 110, 95, 110) + integrator(95, 90, 50, 40) + lin(145, 110, 185, 110) + punkt(185, 110) +
  pfeil(185, 110, 235, 110) + integrator(235, 90, 50, 40) + lin(285, 110, 325, 110) + punkt(325, 110) +
  pfeil(325, 110, 375, 110) + integrator(375, 90, 50, 40) + lin(425, 110, 465, 110) + punkt(465, 110) +
  txt(190, 125, 'x_R3', 'start', 11) + txt(330, 125, 'x_R2', 'start', 11) + txt(470, 125, 'x_R1', 'start', 11) +
  // Rückführung a2, a1, a0 (unten)
  pfeil(185, 110, 185, 150) + kasten(165, 150, 40, 30, 'a₂', 13) +
  pfeil(325, 110, 325, 150) + kasten(305, 150, 40, 30, 'a₁', 13) +
  pfeil(465, 110, 465, 150) + kasten(445, 150, 40, 30, 'a₀', 13) +
  pfeil(185, 180, 185, 217) + pfeil(325, 180, 325, 217) + lin(465, 180, 465, 226) +
  kreis(185, 226) + kreis(325, 226) + pfeil(465, 226, 334, 226) + pfeil(316, 226, 194, 226) +
  lin(176, 226, 60, 226) + pfeil(60, 226, 60, 119) +
  // Ausgang b2, b1, b0 (oben)
  pfeil(185, 110, 185, 75) + kasten(165, 45, 40, 30, 'b₂', 13) +
  pfeil(325, 110, 325, 75) + kasten(305, 45, 40, 30, 'b₁', 13) +
  pfeil(465, 110, 465, 75) + kasten(445, 45, 40, 30, 'b₀', 13) +
  lin(185, 45, 185, 15) + pfeil(185, 15, 316, 15) + kreis(325, 15) + pfeil(325, 45, 325, 24) +
  pfeil(334, 15, 456, 15) + kreis(465, 15) + pfeil(465, 45, 465, 24) + pfeil(474, 15, 545, 15) + txt(520, 8, 'v(t)', 'start', 12) +
  '</svg>';

export const ANTWORTEN = [
  // ============ Hurwitz-Determinante ============
  {
    id: 'v08-hurwitz-determinante',
    bereich: 'vorlesung',
    vorlesung: 'V08',
    titel: 'Hurwitz-Determinante H: Aufbau, nordwestliche Unterdeterminanten, Hₙ = a₀·Hₙ₋₁',
    quellen: 'V08 Folie 4–12, 19',
    stichworte: 'hurwitz determinante hurwitzmatrix nordwestliche unterdeterminanten H_n a0 letzte determinante nennerpolynom koeffizienten allgemein grad n stabilität algebraisches kriterium',
    frage: 'Wie ist die Hurwitz-Determinante für ein Nennerpolynom N(s) vom Grad n aufgebaut? Was bedeutet das Kriterium und wie vereinfacht sich Hₙ?',
    antwort: [
      { t: 'p', text: 'Das Hurwitz-Kriterium ist ein algebraisches Stabilitätskriterium auf Basis der Übertragungsfunktion der Strecke bzw. des offenen/geschlossenen Kreises. Voraussetzung: G(s) in Polynomdarstellung mit Zählergrad m < Nennergrad n.' },
      { t: 'formel', text: 'N(s) = aₙ·sⁿ + aₙ₋₁·sⁿ⁻¹ + … + a₁·s + a₀      ((n+1) Koeffizienten a₀ … aₙ)' },
      { t: 'p', text: 'Das System ist stabil, wenn alle nordwestlichen Unterdeterminanten der Hurwitz-Determinante H positiv sind (Hᵢ > 0 für alle i = 1 … n). Dann liegen alle Nullstellen von N(s) (= Pole von G) in der linken Hälfte der komplexen Ebene. Auf einen Beweis wird verzichtet.' },
      { t: 'zwischen', text: 'Aufbau der Hurwitz-Determinante (Folie 6–7)' },
      { t: 'p', text: 'Erste Zeile: aₙ₋₁, aₙ, 0, 0, … Zweite Zeile: aₙ₋₃, aₙ₋₂, aₙ₋₁, aₙ, … Jede weitere Zeile ist um zwei Koeffizienten nach unten (kleinere Indizes) verschoben; nicht vorhandene Koeffizienten werden 0. Letzte Zeile: 0 … 0, a₀. H₁ ist das Element links oben, H₂ die 2×2-Ecke, H₃ die 3×3-Ecke usw. bis Hₙ = ganze Determinante.' },
      { t: 'formel', text: `n = 3:  H = | a₂ a₃ 0 ; a₀ a₁ a₂ ; 0 0 a₀ |
n = 4:  H = | a₃ a₄ 0 0 ; a₁ a₂ a₃ a₄ ; 0 a₀ a₁ a₂ ; 0 0 0 a₀ |` },
      { t: 'hinweis', text: 'Fehler auf Folie 6: in der ersten Zeile steht „aₙ₋₀“, gemeint ist aₙ.' },
      { t: 'zwischen', text: 'Vereinfachung für die letzte Determinante (Folie 19)' },
      { t: 'p', text: 'In der letzten Zeile steht nur a₀. Entwickelt man nach dieser Zeile (Laplace), gilt immer:' },
      { t: 'formel', text: 'Hₙ = a₀ · Hₙ₋₁    (z. B. n = 3: H₃ = a₀·H₂)' },
      { t: 'zwischen', text: 'Beispiele der Folien' },
      { t: 'formel', text: `Stabil (Folie 11):  G(s) = 1/(40s³ + 38s² + 11s + 1) = 1/((2s+1)(4s+1)(5s+1))
H₁ = a₂ = 38,   H₂ = a₁a₂ − a₃a₀ = 11·38 − 40·1 = 378,   H₃ = a₀·H₂ = 378   ⇒ alle > 0, stabil

Instabil (Folie 12):  G(s) = 1/(40s³ + 18s² − 3s − 1) = 1/((2s+1)(4s−1)(5s+1))
H₁ = 18,   H₂ = (−3)·18 − 40·(−1) = −14,   H₃ = (−1)·(−14) = 14   ⇒ H₂ < 0, instabil` },
      { t: 'hinweis', text: 'Fehler auf Folie 12: dort steht H₁ = 38, richtig ist H₁ = a₂ = 18 (nachgerechnet). Das Ergebnis „instabil, da H₂ < 0“ bleibt richtig. Die Produktdarstellung bestätigt es: der Faktor (4s − 1) hat den Pol bei s = +0,25. Praktisch: Sind schon Koeffizienten negativ oder null, ist das System instabil (notwendige Bedingung aᵢ > 0).' },
      { t: 'link', ziel: 'a/hurwitz-kriterium', text: 'Musterantwort: H₁…Hₙ für n = 3 und n = 4, Bedingung' },
      { t: 'link', ziel: 'hurwitz', text: 'Hurwitz-Rechner (mit Rechenweg und K_R-Bereich)' },
    ],
  },

  // ============ Laplace-Entwicklung ============
  {
    id: 'v08-laplace-entwicklung',
    bereich: 'vorlesung',
    vorlesung: 'V08',
    titel: 'Determinante berechnen: Laplacescher Entwicklungssatz (Schachbrettmuster)',
    quellen: 'V08 Folie 13–19',
    stichworte: 'laplace entwicklungssatz determinante entwickeln zeile schachbrettmuster unterdeterminante 3x3 streichen zeile spalte nullen vorzeichen',
    frage: 'Berechnen Sie die Determinante einer 3×3-Matrix durch Entwicklung nach der ersten Zeile.',
    antwort: [
      { t: 'p', text: 'Die Determinante einer (n×n)-Matrix wird nach der i-ten Zeile „entwickelt“. Die Teildeterminante entsteht durch Streichen der Zeile und der jeweiligen Spalte des Elements. Die Vorzeichen folgen einem Schachbrettmuster (abwechselnd + und −).' },
      { t: 'formel', text: `Vorzeichen:   + − +
              − + −
              + − +` },
      { t: 'formel', text: `Entwicklung nach Zeile 1 (Folie 18):
det A = a₁₁·|a₂₂ a₂₃; a₃₂ a₃₃| − a₁₂·|a₂₁ a₂₃; a₃₁ a₃₃| + a₁₃·|a₂₁ a₂₂; a₃₁ a₃₂|

2×2:  |a b; c d| = a·d − b·c` },
      { t: 'p', text: 'Besonders günstig bei Zeilen (oder Spalten) mit vielen Nullen. Anwendung: letzte Hurwitz-Determinante (nur a₀ in der letzten Zeile) → Hₙ = a₀·Hₙ₋₁.' },
      { t: 'hinweis', text: 'Alternative für 3×3: Regel von Sarrus (V07, Matrizenrechnung). Beide Wege liefern dasselbe Ergebnis; zur Kontrolle beide rechnen.' },
      { t: 'link', ziel: 'a/v07-matrizenrechnung', text: 'Matrizenrechnung: Sarrus, Inverse 2×2' },
      { t: 'link', ziel: 'matrix', text: 'Matrix-Rechner' },
    ],
  },

  // ============ Zustandsraum Begriffe ============
  {
    id: 'v08-zustandsraum-begriffe',
    bereich: 'vorlesung',
    vorlesung: 'V08',
    titel: 'Zustandsraumdarstellung: Gleichungen, Dimensionen, SISO/MIMO, Blockschaltbild',
    quellen: 'V08 Folie 21–28',
    stichworte: 'zustandsraum zustandsraumdarstellung zustandsgleichung ausgangsgleichung systemmatrix A eingangsvektor b ausgangsvektor c durchgangswert d dimension SISO MIMO SIMO MISO innere zustände state space zustandsvektor x',
    frage: 'Geben Sie die Zustandsraumdarstellung eines SISO-Systems an, nennen Sie die Dimensionen aller Größen und zeichnen Sie das Blockschaltbild.',
    antwort: [
      { t: 'p', text: 'Die Übertragungsfunktion G(s) verknüpft nur Eingang und Ausgang; innere Vorgänge und Energiespeicher bleiben unberücksichtigt. Die Zustandsraumdarstellung berücksichtigt die inneren Zustände xᵢ(t) des Systems.' },
      { t: 'formel', text: `ẋ(t) = A·x(t) + b·u(t)      (Zustands-/Systemgleichung)
v(t) = cᵀ·x(t) + d·u(t)     (Ausgangsgleichung)` },
      { t: 'tabelle', kopf: ['Größe', 'Dimension (n = Ordnung)'], zeilen: [
        ['u(t) Eingang', 'Skalar'],
        ['v(t) Ausgang', 'Skalar'],
        ['x(t), ẋ(t) Zustandsvektor', '(n, 1)'],
        ['A Systemmatrix', '(n, n)'],
        ['b Eingangsvektor', '(n, 1)'],
        ['cᵀ Ausgangsvektor (transponiert)', '(1, n)'],
        ['d Durchgangswert', 'Skalar'],
      ] },
      { t: 'svg', svg: svgSiso, unterschrift: 'Blockschaltbild SISO (Folie 25): Integrierer-Block (Kasten mit Diagonale), Rückführung A, Durchgriff d.' },
      { t: 'zwischen', text: 'MIMO (Folie 26–28)' },
      { t: 'formel', text: `ẋ(t) = A·x(t) + B·u(t)
v(t) = C·x(t) + D·u(t)` },
      { t: 'p', text: 'Gleiche Struktur, aber u(t), v(t) sind Vektoren; b wird zur Eingangsmatrix B, cᵀ zur Ausgangsmatrix C, d zur Durchgangsmatrix D (Blockschaltbild Folie 28 wie SISO mit Doppelpfeilen). Dimensionen allgemein bei r Eingängen und m Ausgängen: B (n, r), C (m, n), D (m, r).' },
      { t: 'liste', items: [
        'SISO: Single Input → Single Output (die bisherigen Systeme).',
        'SIMO: Single Input → Multiple Output, MISO: Multiple Input → Single Output, MIMO: Multiple Input → Multiple Output.',
      ] },
      { t: 'hinweis', text: 'Die Dimensionen von B, C, D bei MIMO sind hier aus der Standardregel ergänzt (die Folie 27 zeigt sie als Bild). Durchgangswert d = 0 bei „nicht sprungfähigen“ Systemen (Zählergrad < Nennergrad).' },
      { t: 'link', ziel: 'zustandsraum', text: 'Zustandsraum-Rechner' },
    ],
  },

  // ============ Beispiel PT3 ============
  {
    id: 'v08-zustandsraum-pt3',
    bereich: 'vorlesung',
    vorlesung: 'V08',
    titel: 'Beispiel Standardstrecke: 3 × PT₁ → Zustandsraum (A, b, c, d)',
    quellen: 'V08 Folie 30–37',
    stichworte: 'standardstrecke pt3 reihenschaltung drei pt1 zustandsraum beispiel A b c d zustandsvariablen x1 x2 x3 sprungantwort zustandsgrößen 2s 3s 5s 30s^3 31s^2 10s',
    frage: 'Die Strecke G(s) = 1/((1+2s)(1+3s)(1+5s)) ist in Zustandsraumdarstellung zu bringen (Ausgang jedes PT₁ = Zustand).',
    antwort: [
      { t: 'formel', text: `G(s) = 1/(1+2s) · 1/(1+3s) · 1/(1+5s) = 1/(30s³ + 31s² + 10s + 1)

Zustände = Ausgang jedes PT₁:  x₁, x₂, x₃ = v` },
      { t: 'zwischen', text: 'Laplace-Bereich (Folie 32) → Zeitbereich (Folie 33)' },
      { t: 'formel', text: `X₁ + 2s·X₁ = U      ⇒   2·ẋ₁ + x₁ = u      ⇒   ẋ₁ = −½·x₁ + ½·u
X₂ + 3s·X₂ = X₁     ⇒   3·ẋ₂ + x₂ = x₁     ⇒   ẋ₂ = ⅓·x₁ − ⅓·x₂
X₃ + 5s·X₃ = X₂     ⇒   5·ẋ₃ + x₃ = x₂     ⇒   ẋ₃ = ⅕·x₂ − ⅕·x₃
V = X₃` },
      { t: 'zwischen', text: 'Matrizen (Folie 34–36)' },
      { t: 'formel', text: `        ⎡ −1/2    0     0  ⎤        ⎡ 1/2 ⎤
A  =    ⎢  1/3  −1/3    0  ⎥ ,  b = ⎢  0  ⎥ ,   cᵀ = [0  0  1],   d = 0
        ⎣   0    1/5  −1/5 ⎦        ⎣  0  ⎦

ẋ(t) = A·x(t) + b·u(t),     v(t) = cᵀ·x(t)` },
      { t: 'p', text: 'Folie 37: Die Sprungantwort zeigt alle drei Zustandsgrößen: x₁ (schnellstes PT₁, T = 2 s) steigt am schnellsten auf 1, x₃ = v (Ausgang, nach drei Gliedern, mit Wendepunkt) am langsamsten, ca. 30 s bis zum Endwert 1.' },
      { t: 'hinweis', text: 'Probe (nachgerechnet): cᵀ(sI − A)⁻¹b ergibt wieder 1/((1+2s)(1+3s)(1+5s)). Diese Form (Zustände = Ausgänge der PT₁) ist nicht die Regelungsnormalform; die RNF desselben Systems steht im nächsten Eintrag.' },
      { t: 'link', ziel: 'zustandsraum', text: 'Zustandsraum-Rechner (RNF und weitere Formen)' },
    ],
  },

  // ============ RNF ============
  {
    id: 'v08-rnf',
    bereich: 'vorlesung',
    vorlesung: 'V08',
    titel: 'Regelungsnormalform (RNF): Herleitung, A_R, b, c, Blockschaltbild',
    quellen: 'V08 Folie 42–51',
    stichworte: 'regelungsnormalform RNF steuerungsnormalform x_R A_R companion form begleitmatrix integratoren herleitung koeffizienten a0 a1 b0 b1 standardregelstrecke 30s^3',
    frage: 'Bringen Sie G(s) = Z(s)/N(s) in Regelungsnormalform. Geben Sie A_R, b und cᵀ an und skizzieren Sie das Blockschaltbild.',
    antwort: [
      { t: 'p', text: 'Gegeben: nicht sprungfähige Übertragungsfunktion, Nenner normiert (Koeffizient von sⁿ gleich 1).' },
      { t: 'formel', text: `G(s) = (bₙ₋₁·sⁿ⁻¹ + … + b₁·s + b₀) / (sⁿ + aₙ₋₁·sⁿ⁻¹ + … + a₁·s + a₀) = Z(s)/N(s)
V(s) = G(s)·U(s) = Z(s)/N(s) · U(s)` },
      { t: 'zwischen', text: 'Herleitung (Folie 43–47)' },
      { t: 'liste', items: [
        'Zählerpolynom und Nennerpolynom getrennt betrachten. Zustandsgröße definieren: X_R1(s) = U(s)/N(s), also N(s)·X_R1(s) = U(s).',
        'Weitere Zustände durch Multiplikation mit s (= Ableitung im Zeitbereich): X_R2 = s·X_R1, X_R3 = s²·X_R1, …, X_Rn = sⁿ⁻¹·X_R1. Im Zeitbereich: ẋ_R1 = x_R2, ẋ_R2 = x_R3, …',
        'Letzte Gleichung aus N(s)·X_R1 = U: ẋ_Rn = −a₀·x_R1 − a₁·x_R2 − … − aₙ₋₁·x_Rn + u.',
        'Ausgang: V(s) = Z(s)·X_R1(s) = b₀·X_R1 + b₁·X_R2 + … + bₙ₋₁·X_Rn, zurück: v(t) = b₀·x_R1 + … + bₙ₋₁·x_Rn.',
      ] },
      { t: 'zwischen', text: 'Ergebnis (Folie 48–49)' },
      { t: 'formel', text: `      ⎡  0    1    0   …   0    ⎤       ⎡0⎤
      ⎢  0    0    1   …   ⋮    ⎥       ⎢0⎥
ẋ_R = ⎢  ⋮    ⋮    ⋱   ⋱   0    ⎥·x_R + ⎢⋮⎥·u
      ⎢  0    0    …   0   1    ⎥       ⎢0⎥
      ⎣ −a₀  −a₁   …  −aₙ₋₂ −aₙ₋₁⎦       ⎣1⎦

v = [b₀  b₁  …  bₙ₋₂  bₙ₋₁]·x_R        (d = 0)` },
      { t: 'p', text: 'Merke: Einsen auf der oberen Nebendiagonale, letzte Zeile = −Nennerkoeffizienten von a₀ (links) bis aₙ₋₁ (rechts), b = letzter Einheitsvektor, cᵀ = Zählerkoeffizienten von b₀ bis bₙ₋₁.' },
      { t: 'svg', svg: svgRnf, unterschrift: 'Blockschaltbild RNF für n = 3 (Folie 50): drei Integratoren, Rückführung a₂, a₁, a₀ (negativ), Ausgangsgewichte b₂, b₁, b₀.' },
      { t: 'zwischen', text: 'Beispiel Standardregelstrecke (Folie 51)' },
      { t: 'formel', text: `G(s) = 1/(30s³ + 31s² + 10s + 1) = (1/30) / (s³ + 31/30·s² + 10/30·s + 1/30)

A_R = [0 1 0; 0 0 1; −1/30 −1/3 −31/30],   b = [0; 0; 1],   cᵀ = [1/30  0  0]` },
      { t: 'hinweis', text: 'Vorher durch den Koeffizienten von s³ teilen (hier 30): a₀ = 1/30, a₁ = 10/30 = 1/3, a₂ = 31/30, b₀ = 1/30. Probe (nachgerechnet): cᵀ(sI − A_R)⁻¹b = G(s). Vorsicht bei Aufgabe „mit s im Zähler“ (b₁ ≠ 0): dann steht b₁ in cᵀ an zweiter Stelle.' },
      { t: 'link', ziel: 'zustandsraum', text: 'Zustandsraum-Rechner' },
      { t: 'link', ziel: 'a/v08-bnf-normalformen', text: 'Beobachtungsnormalform und weitere Normalformen' },
    ],
  },

  // ============ BNF / Normalformen ============
  {
    id: 'v08-bnf-normalformen',
    bereich: 'vorlesung',
    vorlesung: 'V08',
    titel: 'Normalformen (RNF, BNF, Steuerbarkeits-, Jordan-Form), BNF aus RNF',
    quellen: 'V08 Folie 41, 52',
    stichworte: 'normalformen beobachtungsnormalform BNF regelungsnormalform RNF steuerbarkeitsnormalform jordansche normalform diagonalform beobachternormalform transponieren dual',
    frage: 'Welche Normalformen der Zustandsraumdarstellung kennen Sie? Geben Sie die Beobachtungsnormalform zu einer RNF an.',
    antwort: [
      { t: 'tabelle', kopf: ['Normalform', 'Abkürzung'], zeilen: [
        ['Regelungsnormalform', 'RNF'],
        ['Beobachtungsnormalform (Beobachternormalform)', 'BNF'],
        ['Steuerbarkeitsnormalform', '–'],
        ['Jordansche Normalform (Diagonalform)', '–'],
      ] },
      { t: 'p', text: 'Nur die RNF wird in der Vorlesung ausgeführt (siehe Eintrag RNF). Die Zusammenfassung (Folie 52) nennt „Normalformen (RNF, BNF)“.' },
      { t: 'zwischen', text: 'BNF aus der RNF (Dualität, nicht auf den Folien ausgeführt)' },
      { t: 'formel', text: `RNF:  (A_R, b_R, c_R)
BNF:  A_B = A_Rᵀ,   b_B = c_R,   c_Bᵀ = b_Rᵀ      (d bleibt gleich)` },
      { t: 'formel', text: `Beispiel n = 3 (G = 1/(30s³ + 31s² + 10s + 1)):

A_B = [0 0 −1/30; 1 0 −1/3; 0 1 −31/30],   b_B = [1/30; 0; 0],   c_Bᵀ = [0  0  1]` },
      { t: 'hinweis', text: 'Nachgerechnet: cᵀ(sI − A)⁻¹b ist für RNF und BNF dieselbe Übertragungsfunktion. Unterschied: Bei der BNF steht die Nennerinformation (−a₀ … −aₙ₋₁) in der letzten Spalte, der Zähler (b₀ …) im Eingangsvektor; Ausgang ist der letzte Zustand. Die Transpositionsregel ist Standardwissen, die Folien enthalten sie nicht. Im Zweifel in der Klausur die RNF angeben, wenn nur „Normalform“ verlangt wird, und die BNF mit dieser Regel ableiten.' },
      { t: 'link', ziel: 'a/v08-rnf', text: 'Regelungsnormalform: Herleitung und Beispiel' },
      { t: 'link', ziel: 'zustandsraum', text: 'Zustandsraum-Rechner' },
    ],
  },
];
