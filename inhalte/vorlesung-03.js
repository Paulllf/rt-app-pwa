// Vorlesung 03 – Signalflussplan, Frequenzbereichsdarstellung, Grundlegende Übertragungsglieder
// (Folien gegen PDF geprüft; Frequenzgang/Ortskurve/Bode kamen in keiner Altklausur)
// Format: tools/inhalte-format.md

const n1 = (x) => (Math.round(x * 10) / 10).toString();
const txt = (x, y, s, anker = 'start', gr = 12) =>
  `<text x="${x}" y="${y}" font-family="sans-serif" font-size="${gr}" text-anchor="${anker}" fill="currentColor">${s}</text>`;
const lin = (x1, y1, x2, y2, extra = '', sw = '1.5') =>
  `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" stroke="currentColor" stroke-width="${sw}" ${extra}/>`;
const gestr = (x1, y1, x2, y2) => lin(x1, y1, x2, y2, 'stroke-dasharray="4 3"', '1');
const pfeil = (x1, y1, x2, y2) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - 7 * Math.cos(a), by = y2 - 7 * Math.sin(a);
  const px = -Math.sin(a) * 3, py = Math.cos(a) * 3;
  return lin(x1, y1, bx, by) +
    `<polygon points="${n1(x2)},${n1(y2)} ${n1(bx + px)},${n1(by + py)} ${n1(bx - px)},${n1(by - py)}" fill="currentColor"/>`;
};
const kurve = (pts, extra = '') => `<polyline points="${pts.map(([x, y]) => `${n1(x)},${n1(y)}`).join(' ')}" fill="none" stroke="currentColor" stroke-width="2" ${extra}/>`;
const kasten = (x, y, b, h, s) =>
  `<rect x="${x}" y="${y}" width="${b}" height="${h}" fill="none" stroke="currentColor" stroke-width="1.5"/>` +
  txt(x + b / 2, y + h / 2 + 5, s, 'middle', 14);
const kreis = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>`;

// ---------- Skizze: Gegenkopplung (Folie 6) und Regelkreis G_W (Folie 10) ----------
const SVG_GEGENKOPPLUNG = `<svg viewBox="0 0 330 150" xmlns="http://www.w3.org/2000/svg">` +
  pfeil(10, 50, 61, 50) + txt(12, 42, 'X_e', 'start', 12) + kreis(70, 50) + txt(60, 70, '−', 'end', 14) +
  pfeil(79, 50, 120, 50) + txt(92, 42, 'X_e1', 'start', 11) +
  kasten(120, 30, 70, 40, 'G₁(s)') + pfeil(190, 50, 310, 50) + txt(300, 42, 'X_a', 'end', 12) +
  lin(250, 50, 250, 115) + `<circle cx="250" cy="50" r="2.5" fill="currentColor"/>` +
  pfeil(250, 115, 195, 115) + kasten(125, 95, 70, 40, 'G₂(s)') + lin(125, 115, 70, 115) + pfeil(70, 115, 70, 59) +
  txt(255, 105, 'X_e2', 'start', 11) + txt(110, 90, 'X_a2', 'end', 11) +
  `</svg>`;

const SVG_REGELKREIS_GW = `<svg viewBox="0 0 330 150" xmlns="http://www.w3.org/2000/svg">` +
  pfeil(10, 50, 61, 50) + txt(12, 42, 'W(s)', 'start', 12) + kreis(70, 50) + txt(60, 70, '−', 'end', 14) +
  pfeil(79, 50, 110, 50) + kasten(110, 30, 60, 40, 'R(s)') + pfeil(170, 50, 200, 50) +
  kasten(200, 30, 60, 40, 'G(s)') + pfeil(260, 50, 315, 50) + txt(305, 42, 'X(s)', 'end', 12) +
  lin(285, 50, 285, 115) + `<circle cx="285" cy="50" r="2.5" fill="currentColor"/>` +
  pfeil(285, 115, 225, 115) + kasten(165, 95, 60, 40, 'S(s)') + lin(165, 115, 70, 115) + pfeil(70, 115, 70, 59) +
  `</svg>`;

// ---------- Skizze: Sinus rein, Sinus raus (Folie 14) ----------
const sinRein = [], sinRaus = [];
for (let i = 0; i <= 80; i++) {
  const x = 40 + i * 2.5; const w = (i / 80) * 2 * 2 * Math.PI; // zwei Perioden
  sinRein.push([x, 45 - 22 * Math.sin(w)]);
  sinRaus.push([x, 120 - 18 * Math.sin(w - 0.9)]);
}
const SVG_SINUS = `<svg viewBox="0 0 330 185" xmlns="http://www.w3.org/2000/svg">` +
  pfeil(35, 45, 255, 45) + pfeil(40, 80, 40, 8) + txt(255, 59, 't', 'end', 12) + txt(46, 14, 'u_e(t)', 'start', 12) +
  kurve(sinRein) + txt(200, 11, 'u_e = sin(ωt), Amplitude 1', 'middle', 11) +
  pfeil(35, 120, 255, 120) + pfeil(40, 148, 40, 88) + txt(255, 134, 't', 'end', 12) + txt(46, 94, 'u_a(t)', 'start', 12) +
  kurve(sinRaus) + txt(150, 160, 'u_a = û·sin(ωt + φ)', 'middle', 11) + txt(150, 175, 'skaliert (û) und phasenverschoben (φ)', 'middle', 11) +
  `</svg>`;

// ---------- Skizze: Ortskurve G(jω) = 1/(jω + 3) ----------
// Re 0 … 1/3 -> x = 50 + Re*600 ; Im -> y = 25 - Im*600 (Im ≤ 0 nach unten)
const ox = 75, oy = 35, ksk = 600;
const ort = [];
for (const w of [0, 0.3, 0.6, 1, 1.4, 1.8, 2.3, 3, 3.8, 5, 6.5, 9, 13, 20, 35, 70, 200, 1000]) {
  const d = 9 + w * w; ort.push([ox + (3 / d) * ksk, oy + (w / d) * ksk]);
}
const SVG_ORTSKURVE = `<svg viewBox="0 -6 340 200" xmlns="http://www.w3.org/2000/svg">` +
  pfeil(30, oy, 325, oy) + pfeil(ox, 10, ox, 160) + txt(325, oy - 8, 'Re', 'end', 12) + txt(ox + 6, 14, 'Im', 'start', 12) +
  kurve(ort) +
  `<circle cx="${ox}" cy="${oy}" r="2.5" fill="currentColor"/><circle cx="${ox + 200}" cy="${oy}" r="2.5" fill="currentColor"/>` +
  txt(ox + 215, oy - 24, 'ω = 0: G = 1/3', 'end', 11) + txt(ox - 6, oy + 18, 'ω → ∞', 'end', 11) +
  pfeil(ox + 150, oy + 110, ox + 125, oy + 112) + txt(ox + 130, oy + 128, 'ω steigt', 'middle', 11) +
  txt(ox + 200, oy + 14, '0,333', 'middle', 10) + txt(ox + 100, oy + 14, '1/6', 'middle', 10) + txt(ox + 100, oy + 150, '−1/6 (ω = 3)', 'middle', 10) +
  `</svg>`;

// ---------- Skizze: Bode-Diagramm G(jω) = 1/(jω + 3), asymptotisch + exakt ----------
// x: log10(ω) von -1 … 2 -> 50 … 260 ; Betrag oben (dB), Phase unten (Grad)
const bx = (w) => 50 + (Math.log10(w) + 1) * 70;
const dbY = (db) => 25 + (-db - 9.5) * 2.6;       // -9,5 dB -> y 25, -40 dB -> y ~ 104
const phY = (ph) => 150 + (-ph) * 0.9;            // 0° -> 150, -90° -> 231
const bodeB = [], bodeP = [];
for (let i = 0; i <= 60; i++) {
  const w = Math.pow(10, -1 + i * 0.05);
  const g = 20 * Math.log10(1 / Math.sqrt(9 + w * w));
  const p = -Math.atan2(w, 3) * 180 / Math.PI;
  bodeB.push([bx(w), dbY(g)]); bodeP.push([bx(w), phY(p)]);
}
const SVG_BODE = `<svg viewBox="0 0 290 270" xmlns="http://www.w3.org/2000/svg">` +
  pfeil(50, 115, 270, 115) + pfeil(50, 115, 50, 8) + txt(54, 14, '|G| in dB', 'start', 11) +
  txt(272, 98, 'ω (log)', 'end', 11) +
  gestr(50, dbY(-9.54), 260, dbY(-9.54)) + txt(46, dbY(-9.54) + 4, '−9,5', 'end', 10) +
  txt(46, dbY(-20) + 4, '−20', 'end', 10) + txt(46, dbY(-40) + 4, '−40', 'end', 10) +
  kurve(bodeB) + gestr(bx(3), 20, bx(3), 262) + txt(bx(3), 132, '3', 'middle', 11) +
  txt(bx(0.1), 132, '0,1', 'middle', 10) + txt(bx(1), 132, '1', 'middle', 10) + txt(bx(10), 132, '10', 'middle', 10) + txt(bx(100), 132, '100', 'middle', 10) +
  pfeil(50, 150, 270, 150) + lin(50, 150, 50, 240) + txt(54, 146, 'φ in °', 'start', 11) +
  txt(46, phY(0) + 4, '0', 'end', 10) + txt(46, phY(-45) + 4, '−45', 'end', 10) + txt(46, phY(-90) + 4, '−90', 'end', 10) +
  gestr(50, phY(-45), 260, phY(-45)) + gestr(50, phY(-90), 260, phY(-90)) +
  kurve(bodeP) + txt(bx(3), 254, 'ω = 3', 'middle', 11) + txt(bx(0.1), 254, '0,1', 'middle', 10) + txt(bx(10), 254, '10', 'middle', 10) + txt(bx(100), 254, '100', 'middle', 10) +
  `</svg>`;

export const ANTWORTEN = [
  {
    id: 'v03-signalflussplan-uebertragungsfunktion',
    bereich: 'vorlesung',
    vorlesung: 'V03',
    titel: 'Signalflussplan: G(s) = X_a/X_e, Reihe, Parallel, Rückführung, Beispiel G_W',
    quellen: 'V03 Folie 3–10',
    stichworte: 'signalflussplan signalflussbild übertragungsfunktion G(s) xa xe reihenschaltung parallelschaltung rückführung gegenkopplung mitkopplung produkt summe control.series control.parallel control.feedback sign=-1 G_W gesamtübertragungsfunktion regelkreis R G S',
    frage: 'Leiten Sie die Gesamtübertragungsfunktion der Gegenkopplung her und wenden Sie sie auf den Regelkreis mit R(s), G(s) und Rückführung S(s) an.',
    antwort: [
      { t: 'link', ziel: 'a/signalfluss-grundregeln', text: 'Reihe, Parallel, Gegen-/Mitkopplung mit Skizzen (Musterantwort)' },
      { t: 'p', text: 'Übertragungsfunktion G(s) = X_a(s)/X_e(s), also X_a(s) = G(s)·X_e(s). Eingangsgrößen mit Index „e“, Ausgangsgrößen mit Index „a“. Zeitfunktion klein, Bildfunktion groß geschrieben.' },
      { t: 'tabelle', kopf: ['Schaltung', 'Gesamtübertragungsfunktion', 'Python control'], zeilen: [
        ['Reihe (n Systeme)', 'G(s) = ∏ Gᵢ(s) (Produkt); n = 2: G₁(s)·G₂(s)', 'control.series(sys1, sys2)'],
        ['Parallel (n Systeme)', 'G(s) = ∑ Gᵢ(s) (Summe); n = 2: G₁(s) + G₂(s)', 'control.parallel(sys1, sys2)'],
        ['Rückführung Gegenkopplung', 'G(s) = G₁(s)/(1 + G₁(s)·G₂(s))  („positives Vorzeichen“ im Nenner)', 'control.feedback(sys1, sys2, sign=−1)'],
        ['Rückführung Mitkopplung', 'G(s) = G₁(s)/(1 − G₁(s)·G₂(s))  („negatives Vorzeichen“ im Nenner)', 'control.feedback(sys1, sys2, sign=+1)'],
      ] },
      { t: 'p', text: 'Folie 4–5: In der Reihenschaltung ist X_a1 = X_e2 (Ausgang von G₁ ist Eingang von G₂). In der Parallelschaltung addieren sich die Ausgänge X_a1 und X_a2 an der Summenstelle (beide „+“).' },
      { t: 'zwischen', text: 'Gegenkopplung, Herleitung (Folie 7)' },
      { t: 'svg', svg: SVG_GEGENKOPPLUNG, unterschrift: 'Gegenkopplung: G₁(s) vorwärts, G₂(s) in der Rückführung, Summenstelle mit „−“' },
      { t: 'formel', text: 'X_e1 = X_e − X_a2 = X_e − G₂(s)·X_a\nX_a = G₁(s)·X_e1 = G₁(s)·X_e − G₁(s)·G₂(s)·X_a\nX_a + G₁(s)·G₂(s)·X_a = G₁(s)·X_e\nX_a·(1 + G₁(s)·G₂(s)) = G₁(s)·X_e\n⇒ G(s) = X_a/X_e = G₁(s)/(1 + G₁(s)·G₂(s))' },
      { t: 'zwischen', text: 'Mitkopplung (instabil), Folie 9' },
      { t: 'formel', text: 'X_e1 = X_e + G₂(s)·X_a,  X_a = G₁(s)·X_e1 = G₁(s)·X_e + G₁(s)·G₂(s)·X_a\nX_a − G₁(s)·G₂(s)·X_a = G₁(s)·X_e   ⇒   G(s) = G₁(s)/(1 − G₁(s)·G₂(s))' },
      { t: 'hinweis', text: 'Folie 9 hat einen Tippfehler: Die vorletzte Zeile steht dort als X_a·(1 − (s)) = G₁(s)·X_e. Richtig ist X_a·(1 − G₁(s)·G₂(s)) = G₁(s)·X_e. Das Endergebnis auf der Folie stimmt.' },
      { t: 'zwischen', text: 'Beispiel: Gesamtübertragungsfunktion G_W (Folie 10)' },
      { t: 'svg', svg: SVG_REGELKREIS_GW, unterschrift: 'W(s) → Σ(−) → R(s) → G(s) → X(s); Rückführung S(s) (Messglied)' },
      { t: 'p', text: 'Einsetzen in die Formel der Gegenkopplung mit G₁ = R·G und G₂ = S:' },
      { t: 'formel', text: 'G_W(s) = R(s)·G(s) / (1 + R(s)·G(s)·S(s))' },
      { t: 'hinweis', text: 'Merken: Im Nenner steht immer „1 + offener Kreis“. Mit S(s) = 1 (ideale Messung) folgt G_W = R·G/(1 + R·G), wie im Standardregelkreis.' },
      { t: 'link', ziel: 'a/gegenkopplung-herleitung', text: 'Gegenkopplung: Herleitung (Musterantwort)' },
      { t: 'link', ziel: 'signalfluss', text: 'Signalfluss-Rechner' },
      { t: 'link', ziel: 'regelkreis', text: 'Regelkreis-Rechner (G_W, G_Z)' },
    ],
  },
  {
    id: 'v03-grundglieder-symbole',
    bereich: 'vorlesung',
    vorlesung: 'V03',
    titel: 'Grundlegende Übertragungsglieder: P, I, D, PT₁, PT₂, Totzeit (Parameter)',
    quellen: 'V03 Folie 11–12',
    stichworte: 'grundglieder übertragungsglieder P-Glied I-Glied D-Glied PT1 PT2 totzeit T_t K_P K_I K_D K T d sprungantwort parameter dämpfung zeitkonstante',
    frage: 'Nennen Sie die grundlegenden Übertragungsglieder mit ihren Parametern und skizzieren Sie die Sprungantworten.',
    antwort: [
      { t: 'p', text: 'Die Folie 12 zeigt die sechs Glieder mit Sprungantwort-Symbol und diesen Parametern:' },
      { t: 'tabelle', kopf: ['Glied', 'Parameter (Folie)', 'Sprungantwort'], zeilen: [
        ['P-Glied', 'K_P', 'Sprung auf K_P, bleibt'],
        ['I-Glied', 'K_I', 'Rampe (Gerade durch 0) mit Steigung K_I'],
        ['D-Glied', 'K_D', 'Impuls bei t = 0, danach 0'],
        ['Totzeit-Glied', 'T_t', 'Sprung um T_t verzögert'],
        ['PT₁-Glied', 'K, T', 'e-Funktion gegen K, Zeitkonstante T'],
        ['PT₂-Glied', 'K, d, T', 'mit d < 1 Überschwingen, schwingt auf K ein'],
      ] },
      { t: 'formel', text: 'Totzeit:  G(s) = e^(−T_t·s)   (Verschiebungsregel)      h(t) = σ(t − T_t)' },
      { t: 'p', text: 'Die Übertragungsfunktionen und Skizzen (P, I, D, PT₁, PT₂, zusätzlich PI, PD, DT₁, Totzeit) stehen in der Musterantwort. Folie 11 verweist für die Herleitung auf das Jupyter-Notebook bzw. die PDF-Datei und ergänzt das PT₂-Glied.' },
      { t: 'link', ziel: 'a/grundglieder', text: 'Grundglieder: G(s) und Sprungantwort mit Skizzen' },
      { t: 'link', ziel: 'a/zuordnung-glieder', text: 'Zuordnung Glied ↔ G(s) ↔ Sprungantwort' },
      { t: 'link', ziel: 'a/pid-ideal-real', text: 'PID ideal und real' },
    ],
  },
  {
    id: 'v03-rationale-uebertragungsfunktion',
    bereich: 'vorlesung',
    vorlesung: 'V03',
    titel: 'Allgemeine rationale Übertragungsfunktion Z(s)/N(s), Python tf(num, den)',
    quellen: 'V03 Folie 13',
    stichworte: 'rationale übertragungsfunktion zähler nenner Z(s) N(s) grad n koeffizienten b_n a_n numerator denominator tf control.matlab.tf strecke num den polynom',
    frage: 'Wie ist die allgemeine rationale Übertragungsfunktion definiert? Wie legt man sie in Python Control an?',
    antwort: [
      { t: 'p', text: 'Die rationale Übertragungsfunktion vom Grad n ist definiert als' },
      { t: 'formel', text: 'G(s) = (b_n·sⁿ + b_(n−1)·sⁿ⁻¹ + … + b₂·s² + b₁·s + b₀) / (a_n·sⁿ + a_(n−1)·sⁿ⁻¹ + … + a₂·s² + a₁·s + a₀) = Z(s)/N(s)' },
      { t: 'p', text: 'G(s) ist also durch den Zähler Z(s) und den Nenner N(s) bestimmt.' },
      { t: 'zwischen', text: 'In Python Control' },
      { t: 'formel', text: 'strecke = control.matlab.tf(num, den)' },
      { t: 'p', text: 'num = Zähler (numerator), den = Nenner (denominator). Die Koeffizienten werden als Liste mit der höchsten s-Potenz zuerst angegeben, z. B. G(s) = 1/(s + 3) → tf([1], [1, 3]).' },
      { t: 'hinweis', text: 'Die Koeffizientenreihenfolge (höchste Potenz zuerst) steht nicht auf der Folie, ist aber die Konvention von control.tf.' },
      { t: 'link', ziel: 'polynom', text: 'Polynom-Rechner (Nullstellen, Pole)' },
      { t: 'link', ziel: 'a/pol-nullstellen-diagramm', text: 'Pol-Nullstellen-Diagramm' },
      { t: 'link', ziel: 'a/python-spickzettel', text: 'Python-Spickzettel' },
    ],
  },
  {
    id: 'v03-frequenzgang-definition',
    bereich: 'vorlesung',
    vorlesung: 'V03',
    titel: 'Frequenzgang G(jω): Definition (DIN 19226), Testsignal Sinus',
    quellen: 'V03 Folie 14–16',
    stichworte: 'frequenzgang G(jω) definition din 19226 imaginäre achse s = jω harmonisches signal sinus testsignal amplitude phasenverschiebung ortskurve bode nyquist stabilität dynamisches verhalten',
    frage: 'Wie ist der Frequenzgang eines LTI-Systems definiert? Wie erhält man ihn aus G(s)? Welche Darstellungsformen gibt es?',
    antwort: [
      { t: 'zwischen', text: 'Prinzip' },
      { t: 'p', text: 'Ein harmonisches Eingangssignal ergibt bei einem LTI-System ein harmonisches Ausgangssignal gleicher Frequenz. Sinusförmige Größen dienen als Testsignal. Das Ausgangssignal ist skaliert und/oder phasenverschoben.' },
      { t: 'svg', svg: SVG_SINUS, unterschrift: 'u_e(t) = sin(ωt) → System → u_a(t) = û·sin(ωt + φ)' },
      { t: 'zwischen', text: 'Definition' },
      { t: 'formel', text: 'G(jω) = X_a/X_e = (b_n(jω)ⁿ + b_(n−1)(jω)ⁿ⁻¹ + … + b₂(jω)² + b₁(jω) + b₀) / (a_n(jω)ⁿ + a_(n−1)(jω)ⁿ⁻¹ + … + a₂(jω)² + a₁(jω) + a₀)' },
      { t: 'p', text: 'Nach DIN 19226: „Die Übertragungsfunktion G(s) auf der Geraden s = jω (der imaginären Achse) der komplexen s-Ebene heißt Frequenzgang G(jω).“' },
      { t: 'p', text: 'Praktisch: in G(s) überall s durch jω ersetzen.  Betrag |G(jω)| = û/1 (Verstärkung), Phase ∠G(jω) = φ.' },
      { t: 'zwischen', text: 'Darstellungsformen' },
      { t: 'liste', items: [
        'Ortskurve (auch Nyquist-Kurve): Aussage über das Stabilitätsverhalten des Systems (LTI), Vorhersage des dynamischen Verhaltens.',
        'Bode-Diagramm: Aufteilung in Betrag und Phase. Stabilitätsuntersuchungen in Abhängigkeit der Frequenz. Auskunft über die Ordnung des Systems (Anzahl der Energiespeicher). Empfindlichkeit gegenüber sinusartigen Störungen.',
      ] },
      { t: 'link', ziel: 'a/lti-system', text: 'LTI-System' },
    ],
  },
  {
    id: 'v03-ortskurve-nyquist',
    bereich: 'vorlesung',
    vorlesung: 'V03',
    titel: 'Ortskurve (Nyquist-Kurve) zeichnen, Beispiel G(jω) = 1/(jω + 3)',
    quellen: 'V03 Folie 17',
    stichworte: 'ortskurve nyquist nyquist-kurve komplexe ebene realteil imaginärteil ω=0 ω=∞ halbkreis 1/(jω+3) PT1 frequenzgang zeichnen skizzieren',
    frage: 'Was ist die Ortskurve? Berechnen und skizzieren Sie die Ortskurve von G(jω) = 1/(jω + 3).',
    antwort: [
      { t: 'p', text: 'Die Ortskurve ist die Darstellung des Frequenzganges in der komplexen Ebene (Realteil waagrecht, Imaginärteil senkrecht) in Abhängigkeit von ω. Sie beginnt bei ω = 0 und endet bei ω = ∞.' },
      { t: 'zwischen', text: 'Rechnung für G(jω) = 1/(jω + 3)' },
      { t: 'formel', text: 'G(jω) = 1/(3 + jω) = (3 − jω)/((3 + jω)(3 − jω)) = (3 − jω)/(9 + ω²)' },
      { t: 'formel', text: 'Re = 3/(9 + ω²)        Im = −ω/(9 + ω²)' },
      { t: 'tabelle', kopf: ['ω', 'Re', 'Im', 'Punkt'], zeilen: [
        ['0', '1/3 ≈ 0,333', '0', 'Start (rechts auf der reellen Achse)'],
        ['3', '1/6 ≈ 0,167', '−1/6 ≈ −0,167', 'tiefster Punkt, Phase −45°'],
        ['→ ∞', '→ 0', '→ 0 (von unten)', 'Ende im Ursprung, Phase → −90°'],
      ] },
      { t: 'svg', svg: SVG_ORTSKURVE, unterschrift: 'Ortskurve von 1/(jω + 3): Halbkreis unterhalb der reellen Achse, Durchmesser 1/3, von ω = 0 (Re = 1/3) bis ω → ∞ (Ursprung)' },
      { t: 'p', text: 'Probe: (Re − 1/6)² + Im² = (1/6)². Die Ortskurve ist ein Halbkreis mit Mittelpunkt 1/6 und Radius 1/6 (das gilt für jedes PT₁-Glied K/(1 + Ts), mit Durchmesser K).' },
      { t: 'hinweis', text: 'Die Folie zeigt nur den Plot (Achsen Realteil −0,15 … 0 bis 0,33; Pfeile für wachsendes ω) und nennt keine Rechnung. Die Rechnung oben ist ergänzt und stimmt mit dem Plot überein: Start bei 0,333, tiefster Punkt bei etwa −0,167.' },
    ],
  },
  {
    id: 'v03-bode-diagramm',
    bereich: 'vorlesung',
    vorlesung: 'V03',
    titel: 'Bode-Diagramm: Amplitudengang (dB) und Phasengang, Beispiel 1/(jω + 3)',
    quellen: 'V03 Folie 18–20',
    stichworte: 'bode bodediagramm bode-diagramm amplitudengang phasengang betrag phase dezibel dB 20 log arctan logarithmisch frequenz ω eckfrequenz −20 dB pro dekade 1/(jω+3) magnitude python control bode',
    frage: 'Wie berechnet man Amplitudengang und Phasengang aus dem Frequenzgang? Skizzieren Sie das Bode-Diagramm von G(jω) = 1/(jω + 3).',
    antwort: [
      { t: 'p', text: 'Der Frequenzgang wird aufgeteilt in Betrag |G(jω)| und Phase ∠G(jω) = arg G(jω):' },
      { t: 'formel', text: 'G(jω) = |G(jω)|·e^(j∠G(jω))' },
      { t: 'p', text: 'Betrag und Phase heißen auch Amplitudengang und Phasengang. Der Amplitudengang wird meist logarithmisch aufgetragen:' },
      { t: 'formel', text: '|G(jω)|_dB = 20·log( X_a(jω)/X_e(jω) ) = 20·log |G(jω)|      (log = Zehnerlogarithmus)' },
      { t: 'formel', text: '|G(jω)| = √(Re² + Im²)        ∠G(jω) = arctan(Im/Re)' },
      { t: 'p', text: 'Vorgehen: Zuerst den Amplitudengang bestimmen, dann den Phasengang berechnen. Leichter geht es mit Python control (bode).' },
      { t: 'zwischen', text: 'Beispiel G(jω) = 1/(jω + 3)' },
      { t: 'formel', text: '|G| = 1/√(9 + ω²)        ∠G = −arctan(ω/3)' },
      { t: 'tabelle', kopf: ['ω in rad/s', '|G|', '|G| in dB', 'Phase'], zeilen: [
        ['0 (klein)', '1/3 = 0,333', '−9,5 dB', '0°'],
        ['1', '0,316', '−10,0 dB', '−18,4°'],
        ['3 (Eckfrequenz)', '1/(3√2) = 0,236', '−12,5 dB (3 dB unter −9,5)', '−45°'],
        ['10', '0,096', '−20,4 dB', '−73,3°'],
        ['100', '0,0100', '−40,0 dB', '−88,3°'],
        ['→ ∞', '→ 0', 'fällt mit −20 dB pro Dekade', '→ −90°'],
      ] },
      { t: 'svg', svg: SVG_BODE, unterschrift: 'Bode-Diagramm von 1/(jω + 3): oben Betrag in dB über log ω (Start −9,5 dB, Knick bei ω = 3, danach −20 dB/Dekade), unten Phase 0° → −45° bei ω = 3 → −90°' },
      { t: 'hinweis', text: 'Die Formel arctan(Im/Re) auf Folie 20 gilt nur für Re > 0. Bei Re < 0 (z. B. Glieder höherer Ordnung) muss man 180° beachten (atan2). Hier ist Re = 3/(9+ω²) > 0, also passt es. Das Folienbild stimmt mit den Werten überein (−10 dB bei ω = 1, −40 dB bei ω = 100, Phase −45° bei ω ≈ 3).' },
      { t: 'p', text: 'Python: from control.matlab import *; strecke = tf([1], [1, 3]); bode(strecke).' },
      { t: 'link', ziel: 'a/python-spickzettel', text: 'Python-Spickzettel' },
    ],
  },
];
