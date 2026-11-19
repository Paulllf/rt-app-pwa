// Musterantworten – Format: tools/inhalte-format.md
// Grundlagen: Steuerung/Regelung, Signalfluss, σ/δ, LTI, Laplace-Regeln, Standardregelkreis.
// Skizzen nach der Musterlösung (Prof. Ruhland, K1 Lösung Folien 5, 8, 37; K3 Lösung Folie 10).

// ---------- kleine SVG-Helfer (nur currentColor, keine externen Verweise) ----------
const T = (x, y, s, extra = '') =>
  `<text x="${x}" y="${y}" font-family="sans-serif" font-size="15" fill="currentColor" ${extra}>${s}</text>`;
const TM = (x, y, s) => T(x, y, s, 'text-anchor="middle"');
// Vorzeichen an der Summierstelle: groß und fett, damit man es sieht (wie Folie 37)
const VZ = (x, y, s = '−') =>
  `<text x="${x}" y="${y}" font-family="sans-serif" font-size="28" font-weight="bold" fill="currentColor" text-anchor="middle">${s}</text>`;
const BOX = (x, y, w, h, s) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="currentColor" stroke-width="2"/>` +
  TM(x + w / 2, y + h / 2 + 5, s);
const LINE = (x1, y1, x2, y2) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="2"/>`;
const ARR = (x1, y1, x2, y2, m) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="2" marker-end="url(#${m})"/>`;
const DEFS = (m) =>
  `<defs><marker id="${m}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">` +
  `<path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>`;
const CIRC = (x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="currentColor" stroke-width="2"/>`;
const DOT = (x, y) => `<circle cx="${x}" cy="${y}" r="3.5" fill="currentColor"/>`;
const SVG = (vb, inner) =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;

// A1: Steuerkette (offener Wirkungsfluss)
const SVG_STEUERUNG = SVG('0 0 560 150',
  DEFS('as1') +
  ARR(10, 80, 150, 80, 'as1') + ARR(270, 80, 370, 80, 'as1') + ARR(490, 80, 550, 80, 'as1') +
  BOX(150, 50, 120, 60, 'Steuerung') + BOX(370, 50, 120, 60, 'Strecke') +
  TM(80, 68, 'w(t)') + TM(320, 68, 'y(t)') + TM(525, 68, 'x(t)'));

// A2: Regelkreis (geschlossener Wirkungskreis, Rückführung)
const SVG_REGELUNG = SVG('0 0 700 260',
  DEFS('as2') +
  `<rect x="75" y="40" width="270" height="150" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 4"/>` +
  T(85, 58, 'Regler', 'font-weight="bold"') +
  ARR(10, 120, 120, 120, 'as2') + CIRC(130, 120) + ARR(140, 120, 220, 120, 'as2') +
  BOX(220, 90, 100, 60, 'Regelglied') +
  ARR(320, 120, 420, 120, 'as2') + BOX(420, 90, 100, 60, 'Strecke') +
  LINE(520, 120, 660, 120) + ARR(660, 120, 690, 120, 'as2') + DOT(630, 120) +
  LINE(630, 120, 630, 225) + LINE(630, 225, 130, 225) + ARR(130, 225, 130, 131, 'as2') +
  ARR(470, 30, 470, 90, 'as2') +
  TM(60, 108, 'w(t)') + TM(185, 108, 'e(t)') + TM(370, 108, 'y(t)') + TM(475, 22, 'z(t)') + TM(670, 108, 'x(t)') +
  VZ(110, 156) + TM(380, 245, 'Rückführung (Rückkopplungszweig)'));

// A9: Standardregelkreis wie Folie 37 der Vorlesung / Musterlösung
const SVG_STANDARD = SVG('0 0 780 400',
  DEFS('as9') +
  // Regleinrichtung / Regler / Stelleinrichtung gestrichelt
  `<rect x="30" y="50" width="400" height="230" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="7 4"/>` +
  T(36, 66, 'Regeleinrichtung', 'font-weight="bold"') +
  `<rect x="60" y="90" width="195" height="100" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>` +
  T(66, 106, 'Regler') +
  `<rect x="300" y="90" width="150" height="100" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>` +
  T(306, 106, 'Stelleinrichtung') +
  // Hauptpfad y = 140
  ARR(10, 140, 100, 140, 'as9') + CIRC(110, 140) + ARR(120, 140, 160, 140, 'as9') +
  BOX(160, 115, 85, 50, 'R(s)') +
  ARR(245, 140, 320, 140, 'as9') + BOX(320, 115, 85, 50, 'Steller') +
  ARR(405, 140, 500, 140, 'as9') + BOX(500, 115, 110, 50, 'G(s)') +
  T(504, 132, 'Stellglied', 'font-size="10"') +
  TM(555, 188, 'Strecke') +
  LINE(610, 140, 700, 140) + ARR(700, 140, 770, 140, 'as9') + DOT(700, 140) +
  // Störgröße
  ARR(560, 60, 560, 115, 'as9') + TM(560, 50, 'z(t)') +
  // Rückführung
  LINE(700, 140, 700, 330) + LINE(700, 330, 640, 330) + BOX(520, 305, 120, 50, 'Messeinrichtung') +
  LINE(520, 330, 110, 330) + ARR(110, 330, 110, 151, 'as9') +
  // Größen
  TM(55, 128, 'w(t)') + TM(135, 128, 'e(t)') + TM(280, 128, 'u(t)') + TM(450, 128, 'y(t)') + TM(745, 128, 'x(t)') +
  TM(360, 322, 'r(t)') + VZ(94, 174));

// A4: σ(t) und δ(t)
const SVG_SIGMA_DIRAC = SVG('0 0 640 220',
  DEFS('as4') +
  // σ
  ARR(20, 160, 280, 160, 'as4') + ARR(100, 190, 100, 20, 'as4') +
  LINE(20, 160, 100, 160) + `<line x1="100" y1="160" x2="100" y2="70" stroke="currentColor" stroke-width="2.5"/>` +
  LINE(100, 70, 270, 70) + TM(85, 74, '1') + T(285, 165, 't') + T(108, 30, 'σ(t)') + TM(190, 205, 'Sprungfunktion') +
  // δ
  ARR(340, 160, 620, 160, 'as4') + ARR(450, 190, 450, 20, 'as4') +
  `<line x1="450" y1="160" x2="450" y2="40" stroke="currentColor" stroke-width="3" marker-end="url(#as4)"/>` +
  T(458, 50, '(1)  Fläche = 1') + T(625, 165, 't', 'text-anchor="end"') + T(458, 30, 'δ(t)') + TM(480, 205, 'Dirac-Impuls (Stoß)'));

// A3': Gegenkopplung
const SVG_GEGEN = SVG('0 0 620 210',
  DEFS('as3') +
  ARR(10, 80, 100, 80, 'as3') + CIRC(110, 80) + ARR(120, 80, 220, 80, 'as3') +
  BOX(220, 50, 110, 60, 'G_V(s)') + LINE(330, 80, 540, 80) + ARR(540, 80, 610, 80, 'as3') + DOT(480, 80) +
  LINE(480, 80, 480, 165) + ARR(480, 165, 420, 165, 'as3') + BOX(300, 140, 120, 50, 'G_R(s)') +
  LINE(300, 165, 110, 165) + ARR(110, 165, 110, 91, 'as3') +
  TM(55, 68, 'w') + TM(175, 68, 'e') + TM(575, 68, 'x') + TM(250, 160, '') + TM(255, 182, 'r') + VZ(94, 114));

// ---------- Antworten ----------
export const ANTWORTEN = [
  {
    id: 'steuerung',
    bereich: 'theorie',
    titel: 'Steuerung (feedforward / open loop control)',
    quellen: 'K1 A1 · K2 A1 · K3 A1',
    punkte: 3,
    stichworte: 'steuerung definition signalflussbild steuerkette offener wirkungsfluss feedforward control open loop control englisch A1',
    frage: 'Was versteht man unter einer Steuerung? Zeichnen Sie einen Signalflussgraphen und erläutern Sie. Wie nennt man eine Steuerung im englischen Sprachraum?',
    antwort: [
      { t: 'p', text: 'Steuerung = Vorgang mit offenem Wirkungsfluss (Steuerkette). Die Führungsgröße w(t) wirkt über die Steuerung als Stellgröße y(t) auf die Strecke. Die Regelgröße x(t) wird nicht zurückgeführt und nicht mit w verglichen.' },
      { t: 'svg', svg: SVG_STEUERUNG, unterschrift: 'Signalflussbild Steuerung: w Führungsgröße · y Stellgröße · x Regelgröße' },
      { t: 'p', text: 'Englisch: „feedforward control“, auch möglich: „open loop control“.' },
      { t: 'zwischen', text: 'Erläuterung' },
      { t: 'liste', items: [
        'Offener Wirkungsfluss: keine Rückführung der Prozessgröße.',
        'Ist die Strecke komplett bekannt, x = S(y), so wählt man die Steuerung als Umkehrung der Strecke:',
      ] },
      { t: 'formel', text: 'y = S⁻¹(w)  ⇒  x = S(S⁻¹(w)) = w' },
      { t: 'p', text: 'Nachteil: Störungen und Abweichungen des Modells werden nicht erkannt und nicht ausgeregelt.' },
    ],
  },
  {
    id: 'regelung',
    bereich: 'theorie',
    titel: 'Regelung (feedback / closed loop control)',
    quellen: 'K1 A2 · K2 A2 · K3 A2',
    punkte: 3,
    stichworte: 'regelung definition signalflussbild regelkreis rückführung rückkopplung geschlossener wirkungskreis feedback control closed loop control englisch A2',
    frage: 'Was versteht man unter einer Regelung? Zeichnen Sie einen Signalflussgraphen und erläutern Sie. Wie nennt man eine Regelung im englischen Sprachraum?',
    antwort: [
      { t: 'p', text: 'Regelung = Vorgang mit geschlossenem Wirkungskreislauf. Die Regelgröße x(t) wird gemessen und an den Eingang zurückgeführt. Dort wird sie mit der Führungsgröße w(t) verglichen („Soll-Istwert-Vergleich“). Der Regler bildet aus der Regeldifferenz e(t) = w(t) − x(t) die Stellgröße y(t), die die Abweichung verkleinert.' },
      { t: 'svg', svg: SVG_REGELUNG, unterschrift: 'Signalflussbild Regelung: w Führungsgröße · e Regeldifferenz · y Stellgröße · z Störgröße · x Regelgröße' },
      { t: 'p', text: 'Englisch: „feedback control“, auch möglich: „closed loop control“.' },
      { t: 'p', text: 'Vorteil gegenüber der Steuerung: Störungen z(t) und Modellfehler werden erkannt und ausgeregelt.' },
      { t: 'link', ziel: 'regelkreis', text: 'Regelkreis-Rechner' },
    ],
  },
  {
    id: 'steuerung-regelung-beispiele',
    bereich: 'theorie',
    titel: 'Beispiele Steuerung/Regelung, Rückführung, Regelung → Steuerung',
    quellen: 'K1 A3 · K2 A3',
    punkte: 4,
    stichworte: 'beispiel steuerung regelung wasserhahn heizungsthermostat fliehkraftregler rückführung rückkopplungszweig soll-istwert-vergleich stellwertbeschränkung treppenhauslicht übergang A3',
    frage: 'Nennen Sie für eine Steuerung und eine Regelung je ein reales Beispiel. Welches grundlegende Element hat eine Regelung, das eine Steuerung nicht hat? Nennen Sie ein Beispiel, bei dem eine Regelung durch ein plötzliches Ereignis in eine Steuerung übergeht.',
    antwort: [
      { t: 'zwischen', text: 'Beispiele' },
      { t: 'liste', items: [
        'Steuerung: Wasserhahn (Hahn auf = Stellgröße, ohne Rückmeldung der Wassertemperatur). Weitere: Ampel mit Zeitschaltung, Waschmaschinenprogramm.',
        'Regelung: Heizungsthermostat (Raumtemperatur wird gemessen und mit dem Sollwert verglichen). Weitere: Fliehkraftregelung (Fliehkraftregler an der Dampfmaschine), Tempomat, Körpertemperatur.',
      ] },
      { t: 'zwischen', text: 'Grundlegendes Element der Regelung' },
      { t: 'p', text: 'Der Rückkopplungszweig (Rückführung der Regelgröße über die Messeinrichtung) mit dem Soll-Istwert-Vergleich (Vergleichsstelle, e = w − x). Eine Steuerung hat beides nicht.' },
      { t: 'zwischen', text: 'Regelung → Steuerung' },
      { t: 'p', text: 'Die Regelung wird zur Steuerung, sobald die Rückführung unwirksam wird. Dann liegt ein offener Wirkungsfluss vor.' },
      { t: 'liste', items: [
        'Treppenhauslicht: Sensor/Lichtmessung fällt aus oder das Licht geht aus. Es gibt keine Rückmeldung mehr.',
        'Regelung läuft in die Stellwertbeschränkung: z. B. Heizung auf 100 %, Ventil ganz offen. Die Stellgröße kann nicht weiter steigen, die Regelgröße ändert die Stellgröße nicht mehr.',
        'Sensorausfall oder aufgetrennter Rückführungszweig.',
      ] },
      { t: 'hinweis', text: 'Musterlösung K1: Beispiel Steuerung „Wasserhahn“; Regelung „Heizungsthermostat“, „Fliehkraftregelung“; Übergang „Treppenhaus Licht geht aus“, „Regelung die in die Stellwertbeschränkung geht“.' },
    ],
  },
  {
    id: 'gegenkopplung-herleitung',
    bereich: 'theorie',
    titel: 'Gegenkopplung herleiten, Vorzeichenwechsel → Mitkopplung',
    quellen: 'K3 A3 · (K1 A8 Gegen-/Mitkopplung)',
    punkte: 4,
    stichworte: 'gegenkopplung herleitung G_V G_R rückführung mitkopplung vorzeichenwechsel formel 1+GVGR A3 A8 signalfluss',
    frage: 'Leiten Sie die Formel der Gegenkopplung her (Vorwärtszweig G_V(s), Rückwärtszweig G_R(s)). Zeichnen Sie zunächst die Struktur. Was passiert bei einem Vorzeichenwechsel im Rückwärtszweig?',
    antwort: [
      { t: 'zwischen', text: 'Zeichnung (1 P)' },
      { t: 'svg', svg: SVG_GEGEN, unterschrift: 'Gegenkopplung: Vorwärtszweig G_V(s), Rückwärtszweig G_R(s), Minus an der Summierstelle' },
      { t: 'zwischen', text: 'Herleitung (2 P)' },
      { t: 'formel', text: 'e = w − r        r = G_R · x        x = G_V · e' },
      { t: 'formel', text: 'x = G_V · (w − r) = G_V · (w − G_R · x)' },
      { t: 'formel', text: 'x = G_V · w − G_V · G_R · x' },
      { t: 'formel', text: 'x + G_V · G_R · x = x · (1 + G_V · G_R) = G_V · w' },
      { t: 'formel', text: 'x = G_V / (1 + G_V · G_R) · w        G(s) = X(s)/W(s) = G_V / (1 + G_V · G_R)' },
      { t: 'zwischen', text: 'Antwort Vorzeichenwechsel (1 P)' },
      { t: 'p', text: 'Aus der Gegenkopplung wird eine Mitkopplung. Die Summierstelle bekommt + statt −:' },
      { t: 'formel', text: 'x = G_V · (w + G_R · x)  ⇒  G(s) = G_V / (1 − G_V · G_R)' },
      { t: 'hinweis', text: 'Merke: Gegenkopplung 1 + G_V·G_R im Nenner, Mitkopplung 1 − G_V·G_R. Mitkopplung kann instabil werden, wenn G_V·G_R → 1.' },
      { t: 'link', ziel: 'signalfluss', text: 'Signalfluss-Rechner' },
    ],
  },
  {
    id: 'sprung-dirac',
    bereich: 'theorie',
    titel: 'Sprungfunktion σ(t) und Dirac-Impuls δ(t)',
    quellen: 'K1 A4 · Vorlesung 02',
    punkte: 5,
    stichworte: 'sprungfunktion sigma einheitssprung dirac impuls stoß delta zusammenhang ableitung rampe laplace 1/s A4',
    frage: 'Geben Sie die Definitionsgleichung für σ(t) an und zeichnen Sie sie. Geben Sie die Definitionsgleichung des Dirac-Impulses δ(t) an und zeichnen Sie ihn. Welcher Zusammenhang besteht zwischen beiden?',
    antwort: [
      { t: 'zwischen', text: 'Sprungfunktion (Einheitssprung)' },
      { t: 'formel', text: 'σ(t) = 0 für t < 0,   σ(t) = 1 für t ≥ 0' },
      { t: 'zwischen', text: 'Dirac-Impuls (Dirac-Stoß)' },
      { t: 'formel', text: 'δ(t) = ∞ für t = 0,   δ(t) = 0 sonst,   mit ∫ δ(t) dt = 1 (Fläche 1)' },
      { t: 'svg', svg: SVG_SIGMA_DIRAC, unterschrift: 'σ(t): Sprung von 0 auf 1 bei t = 0 · δ(t): Pfeil bei t = 0, Gewicht (Fläche) 1' },
      { t: 'zwischen', text: 'Zusammenhang' },
      { t: 'formel', text: 'δ(t) = dσ(t)/dt        σ(t) = ∫ δ(τ) dτ  (von −∞ bis t)' },
      { t: 'p', text: 'Leitet man die Sprungfunktion ab, so erhält man den Dirac-Stoß. Im Übergang von 0 auf 1 hat die Sprungfunktion eine unendlich große Steigung.' },
      { t: 'p', text: 'Herleitung über die Rampe: Ein reales System erreicht die Sprunghöhe erst nach kurzer Zeit ε (Rampe, Steigung 1/ε). Für ε → 0 wird die Rampe immer steiler, ihre Ableitung (Rechteckimpuls der Höhe 1/ε und Breite ε, Fläche 1) wird immer größer: lim 1/ε = ∞.' },
      { t: 'zwischen', text: 'Laplace-Transformierte' },
      { t: 'formel', text: 'ℒ{σ(t)} = 1/s        ℒ{δ(t)} = 1' },
    ],
  },
  {
    id: 'lti-system',
    bereich: 'theorie',
    titel: 'LTI-System: Linearität und Zeitinvarianz',
    quellen: 'K2 A4 · K3 A4 · Vorlesung 01',
    punkte: 5,
    stichworte: 'LTI linear time invariant linearität überlagerungsprinzip superposition verstärkung homogenität zeitinvarianz verschiebungssatz A4',
    frage: 'Wofür steht LTI? Welche zwei bedeutenden Eigenschaften hat ein LTI-System? Stellen Sie diese mit den jeweiligen Gleichungen dar (u_i(t) Eingänge, y_i(t) Ausgänge).',
    antwort: [
      { t: 'p', text: 'LTI = Linear and Time Invariant (linear und zeitinvariant).' },
      { t: 'p', text: 'Das System bildet Eingänge auf Ausgänge ab: φ(u_i(t)) = y_i(t). Konstante Koeffizienten c₁, c₂.' },
      { t: 'zwischen', text: '1. Linearität (Überlagerungsprinzip)' },
      { t: 'formel', text: 'φ(c₁·u₁(t) + c₂·u₂(t)) = c₁·φ(u₁(t)) + c₂·φ(u₂(t)) = c₁·y₁(t) + c₂·y₂(t)' },
      { t: 'liste', items: [
        'Superposition (Additivität): Die Summe der Eingänge ergibt die Summe der Ausgänge (c₁ = c₂ = 1).',
        'Verstärkung (Homogenität): c-facher Eingang ergibt c-fachen Ausgang, φ(c·u) = c·y.',
      ] },
      { t: 'zwischen', text: '2. Zeitinvarianz (Verschiebungssatz)' },
      { t: 'formel', text: 'φ(u_i(t − t₀)) = y_i(t − t₀)' },
      { t: 'p', text: 'Eine zeitliche Verschiebung am Eingang ergibt eine zeitliche Verschiebung des Ausgangs um denselben Betrag. Das Systemverhalten ändert sich nicht mit der Zeit.' },
      { t: 'hinweis', text: 'Nichtlineares Beispiel: f(t) = √t ist nicht linear, also kein LTI-System. Lösung: Linearisierung um den Arbeitspunkt.' },
      { t: 'link', ziel: 'linearisierung', text: 'Linearisierung' },
    ],
  },
  {
    id: 'laplace-rechenregeln',
    bereich: 'theorie',
    titel: 'Laplace-Rechenregeln (Differentiationssatz für DGL)',
    quellen: 'K1 A5 · K2 A5 · K3 A5',
    punkte: 5,
    stichworte: 'laplace rechenregeln linearität verschiebung differentiation integration faltung differentiationsregel dgl bildbereich anfangswerte A5',
    frage: 'Welche grundlegenden Rechenregeln der Laplace-Transformation kennen Sie? Nennen Sie 4 Stück. Welche dieser Regeln erleichtert es, DGL im Bildbereich zu lösen?',
    antwort: [
      { t: 'p', text: 'Mit F(s) = ℒ{f(t)}, G(s) = ℒ{g(t)}:' },
      { t: 'tabelle', kopf: ['Regel', 'Zeitbereich → Bildbereich'], zeilen: [
        ['Linearitätsregel', 'ℒ{a·f(t) + b·g(t)} = a·F(s) + b·G(s)'],
        ['Verschiebungsregel (nach rechts, Totzeit T)', 'ℒ{f(t − T)} = e^(−sT) · F(s)'],
        ['Differentiationsregel', 'ℒ{ḟ(t)} = s·F(s) − f(0);  n-fach: ℒ{f⁽ⁿ⁾} = sⁿ·F(s)  (Anfangswerte 0)'],
        ['Integrationsregel', 'ℒ{∫₀ᵗ f(τ) dτ} = F(s)/s'],
        ['Faltungsregel', 'ℒ{f(t) ∗ g(t)} = F(s) · G(s)'],
      ] },
      { t: 'zwischen', text: 'Welche Regel hilft bei DGL?' },
      { t: 'p', text: 'Die Differentiationsregel. Eine n-fache Ableitung nach der Zeit ergibt eine Multiplikation mit sⁿ im Bildbereich (bei verschwindenden Anfangswerten). Aus der DGL wird eine algebraische Gleichung in s, die man nach Y(s) umstellen kann.' },
      { t: 'formel', text: 'a₂ÿ + a₁ẏ + a₀y = b₀u   ⊶   (a₂s² + a₁s + a₀)·Y(s) = b₀·U(s)   ⇒   G(s) = Y(s)/U(s) = b₀/(a₂s² + a₁s + a₀)' },
      { t: 'hinweis', text: 'Verlangt sind 4 Regeln: Linearität, Verschiebung, Differentiation, Integration (die Faltungsregel ist die fünfte). Zusätzlich gibt es Anfangs- und Endwertsatz.' },
      { t: 'link', ziel: 'dgl', text: 'DGL → G(s) Rechner' },
    ],
  },
  {
    id: 'standardregelkreis',
    bereich: 'theorie',
    titel: 'Standardregelkreis zeichnen und beschriften',
    quellen: 'K1 A9 · K2 A9',
    punkte: 8,
    stichworte: 'standardregelkreis regelkreis zeichnen beschriften führungsgröße rückführungsgröße regeldifferenz reglerausgangsgröße stellgröße störgröße regelgröße regler steller strecke messeinrichtung regeleinrichtung stelleinrichtung A9',
    frage: 'Zeichnen Sie einen Standardregelkreis mit allen relevanten Komponenten, Eingängen, Ausgängen und Parametern und benennen Sie diese. Die Störgröße z(t) wirkt direkt als Eingangsgröße auf die Strecke G(s).',
    antwort: [
      { t: 'svg', svg: SVG_STANDARD, unterschrift: 'Standardregelkreis wie in der Vorlesung (Folie 37). Strichlinien: Regeleinrichtung, Regler, Stelleinrichtung' },
      { t: 'tabelle', kopf: ['Größe', 'Name'], zeilen: [
        ['w(t)', 'Führungsgröße (Eingang)'],
        ['r(t)', 'Rückführungsgröße'],
        ['e(t) = w(t) − r(t)', 'Regeldifferenz'],
        ['u(t)', 'Reglerausgangsgröße'],
        ['y(t)', 'Stellgröße'],
        ['z(t)', 'Störgröße (wirkt auf die Strecke)'],
        ['x(t)', 'Regelgröße (Ausgang)'],
      ] },
      { t: 'tabelle', kopf: ['Komponente', 'Bedeutung'], zeilen: [
        ['R(s)', 'Regler (mit Vergleichsstelle)'],
        ['Steller + Stellglied', 'Stelleinrichtung; das Stellglied gehört zur Strecke'],
        ['G(s)', 'Strecke'],
        ['Messeinrichtung', 'Rückführung: misst x, liefert r'],
        ['Regler + Stelleinrichtung', 'Regeleinrichtung'],
      ] },
      { t: 'hinweis', text: 'Musterlösung K1: „Punktabzug wenn Elemente fehlen“. Verlangt sind alle Komponenten, Eingänge, Ausgänge und Parameter. Bei Messeinrichtung ohne Dynamik gilt r = x.' },
      { t: 'link', ziel: 'regelkreis', text: 'Regelkreis-Rechner' },
    ],
  },
];
