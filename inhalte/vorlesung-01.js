// Vorlesung 01 – Einführung in die Regelungstechnik (Folien gegen PDF geprüft)
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
const kurve = (pts) => `<polyline points="${pts.map(([x, y]) => `${n1(x)},${n1(y)}`).join(' ')}" fill="none" stroke="currentColor" stroke-width="2"/>`;

// Skizze Linearisierung f(t) = √t um t0 = 4 (Ursprung (40,150), 30 px pro Einheit in t, 40 px pro Einheit in f)
const LX = 40, LY = 150, SX = 30, SY = 40;
const wurzel = [];
for (let i = 0; i <= 120; i++) { const t = i * 0.0667; wurzel.push([LX + t * SX, LY - Math.sqrt(t) * SY]); }
const SVG_LINEARISIERUNG = `<svg viewBox="0 -12 300 190" xmlns="http://www.w3.org/2000/svg">` +
  pfeil(LX, LY, 285, LY) + pfeil(LX, LY, LX, 10) + txt(285, LY + 14, 't', 'end', 12) + txt(LX + 6, 14, 'f(t)', 'start', 12) +
  kurve(wurzel) +
  lin(LX, LY - 1 * SY, LX + 8 * SX, LY - 3 * SY, '', '1.2') +
  gestr(LX + 4 * SX, LY, LX + 4 * SX, LY - 2 * SY) + gestr(LX, LY - 2 * SY, LX + 4 * SX, LY - 2 * SY) +
  `<circle cx="${LX + 4 * SX}" cy="${LY - 2 * SY}" r="3" fill="currentColor"/>` +
  txt(LX + 4 * SX, LY + 14, 't₀ = 4', 'middle', 11) + txt(LX - 4, LY - 2 * SY + 4, '2', 'end', 11) +
  txt(LX + 4 * SX + 6, LY - 2 * SY + 16, 'AP', 'start', 11) +
  txt(LX + 5.2 * SX, LY - 3.6 * SY, 'f(t) = √t', 'start', 11) +
  txt(LX + 5.6 * SX, LY - 1.15 * SY, 'f̃(t) = t/4 + 1', 'start', 11) +
  `</svg>`;

export const ANTWORTEN = [
  {
    id: 'v01-geschichte-fliehkraftregler',
    bereich: 'vorlesung',
    vorlesung: 'V01',
    titel: 'Fliehkraftregler (Watt), Geschichte der Regelungstechnik',
    quellen: 'V01 Folie 9–10',
    stichworte: 'fliehkraftregler fliehkraftregelung watt dampfmaschine drehzahlregelung geschichte motivation industrielle revolution kugeln ventil flyball governor 1788 historie',
    frage: 'Erklären Sie die Funktionsweise eines Fliehkraftreglers an der Dampfmaschine. Warum handelt es sich um eine Regelung?',
    antwort: [
      { t: 'p', text: 'Wurzeln der Regelungstechnik im 18. Jahrhundert: Erfindung der Dampfmaschine durch James Watt (1788). Der Fliehkraftregler war schon aus Getreidemühlen bekannt. Er regelt die Drehzahl n(t) der Dampfmaschine (Beginn der industriellen Revolution).' },
      { t: 'zwischen', text: 'Ablauf der Regelung' },
      { t: 'liste', nummeriert: true, items: [
        'Ruhelage n(t) = 0: Das Dampfventil ist komplett geöffnet.',
        'Als Gegenkraft wirkt die Gewichtskraft der Kugeln.',
        'Mit der Bewegung des Kolbens der Dampfmaschine werden die Kugeln beschleunigt. Sie schließen über einen Hebel das Ventil (negative Rückkopplung, Gegenkopplung).',
        'Ergebnis: stabiler Zustand, n(t) = n∞ = const.',
      ] },
      { t: 'p', text: 'Dieser geschlossene Wirkkreislauf (Rückkopplung) ist das Kennzeichen einer Regelung.' },
      { t: 'zwischen', text: 'Zuordnung (Größen)' },
      { t: 'tabelle', kopf: ['Größe', 'Beim Fliehkraftregler'], zeilen: [
        ['Regelgröße x', 'Drehzahl n der Maschine'],
        ['Messglied / Regler', 'rotierende Kugeln mit Hebel'],
        ['Stellglied', 'Dampfventil'],
        ['Rückführung', 'Kugeln werden von der Drehzahl mitbewegt, Hebel schließt das Ventil'],
      ] },
      { t: 'hinweis', text: 'Die letzte Tabellenzeile ist die Deutung, nicht der Folientext. Die Folie nennt nur die vier Schritte oben.' },
      { t: 'link', ziel: 'a/regelung', text: 'Regelung (feedback control) – Musterantwort' },
    ],
  },
  {
    id: 'v01-steuerung-regelung-unterschied',
    bereich: 'vorlesung',
    vorlesung: 'V01',
    titel: 'Steuerung und Regelung: Unterschied, Inverse S⁻¹',
    quellen: 'V01 Folie 11–14',
    stichworte: 'steuerung regelung unterschied offener wirkungsfluss geschlossener wirkungskreislauf feedforward feedback open loop closed loop inverse strecke mischbatterie dusche störungen durchgereicht soll-istwert-vergleich',
    frage: 'Worin unterscheiden sich Steuerung und Regelung? Skizzieren Sie beide Wirkungspläne. Wie ergibt sich bei bekannter Strecke die Steuerung?',
    antwort: [
      { t: 'tabelle', kopf: ['', 'Steuerung', 'Regelung'], zeilen: [
        ['Wirkungsfluss', 'offen', 'geschlossener Wirkungskreislauf'],
        ['Englisch', '„feedforward control“', '„feedback control“'],
        ['Rückführung', 'keine Rückführung der Prozessgröße', 'Prozessgröße wird zurückgeführt, Soll-Istwert-Vergleich am Eingang'],
        ['Störungen', 'werden durchgereicht', 'werden ausgeregelt'],
      ] },
      { t: 'zwischen', text: 'Steuerung bei bekannter Strecke' },
      { t: 'p', text: 'Ist die Strecke komplett bekannt, x = S{y}, so ergibt sich die Steuerung zu' },
      { t: 'formel', text: 'y = S⁻¹{w}   ⇒   x = S{S⁻¹{w}} = w' },
      { t: 'p', text: 'Wirkungsplan Steuerung: w(t) → Steuerung → y(t) → Strecke → x(t).  Größen: w Führungsgröße, y Stellgröße, x Regelgröße.' },
      { t: 'p', text: 'Wirkungsplan Regelung: w(t) → Summenstelle (e = w − x, Rückführung mit „−“) → Regelglied R(s) → y(t) → Strecke G(s) → x(t). Die Störgröße z(t) greift an der Strecke an. Zusätzlich e(t) Regeldifferenz.' },
      { t: 'zwischen', text: 'Beispiel Steuerung: Mischbatterie' },
      { t: 'p', text: 'Solltemperatur ϑ_Soll wird am Hahn vorgegeben, die Temperatur wird nicht zurückgeführt. Störungen werden durchgereicht: Druckerhöhung oder Druckabfall am Kaltwasser, Warmwassertemperatur niedriger (Boiler leer), jemand schaltet beim Duschen die Waschmaschine ein.' },
      { t: 'link', ziel: 'a/steuerung', text: 'Steuerung – Musterantwort mit Skizze' },
      { t: 'link', ziel: 'a/regelung', text: 'Regelung – Musterantwort mit Skizze' },
      { t: 'link', ziel: 'a/steuerung-regelung-beispiele', text: 'Beispiele für Steuerung und Regelung' },
    ],
  },
  {
    id: 'v01-standardregelkreis-begriffe',
    bereich: 'vorlesung',
    vorlesung: 'V01',
    titel: 'Standardregelkreis: Größen und Einrichtungen (DIN IEC 60050-351)',
    quellen: 'V01 Folie 17–19, 28',
    stichworte: 'standardregelkreis regeleinrichtung stelleinrichtung regler steller stellglied messeinrichtung strecke führungsgröße rückführungsgröße regeldifferenz reglerausgangsgröße stellgröße störgröße regelgröße sollwert DIN IEC 60050-351 formelzeichen w r e u y z x',
    frage: 'Nennen Sie die Größen und Einrichtungen des Standardregelkreises und erklären Sie jede kurz.',
    antwort: [
      { t: 'link', ziel: 'a/standardregelkreis', text: 'Standardregelkreis zeichnen und beschriften (Musterantwort mit Skizze)' },
      { t: 'tabelle', kopf: ['Größe', 'Name', 'Erklärung (Folie)'], zeilen: [
        ['w(t)', 'Führungsgröße', 'wird von außen zugeführt (Eingangsgröße). Die Regelgröße soll ihr in endlicher Zeit folgen. Der vorgegebene Wert heißt Sollwert.'],
        ['r(t)', 'Rückführungsgröße', 'Die Messeinrichtung bildet aus x(t) die Rückführungsgröße.'],
        ['e(t)', 'Regeldifferenz', 'Soll-Istwert-Vergleich: e(t) = w(t) − r(t)'],
        ['u(t)', 'Reglerausgangsgröße', 'bewirkt eine Änderung des Stellers'],
        ['y(t)', 'Stellgröße', 'wirkt auf das zum Prozess gehörende Stellglied'],
        ['z(t)', 'Störgröße', 'wirkt auf den Prozess und verändert die Regelgröße. Störungen sollen durch die Regelung ausgeglichen werden.'],
        ['x(t)', 'Regelgröße', 'zu messende Prozessgröße, wird vom Messglied (Sensor) erfasst. Der Istwert soll dem Sollwert folgen.'],
      ] },
      { t: 'zwischen', text: 'Einrichtungen (Kästen im Bild)' },
      { t: 'liste', items: [
        'Regler: Summenstelle (Soll-Istwert-Vergleich) und R(s)',
        'Steller: erhält u(t), liefert y(t)',
        'Stelleinrichtung: Steller + Stellglied',
        'Strecke: Stellglied + G(s)',
        'Regeleinrichtung: Regler + Steller + Messeinrichtung (alles außer der Strecke)',
        'Messeinrichtung: Sensor in der Rückführung, x(t) → r(t)',
      ] },
      { t: 'hinweis', text: 'Folie V01/17: Die Kästen überlappen: Das Stellglied gehört zur Stelleinrichtung und zugleich zur Strecke. In der Praxis sind Regler und Stelleinrichtung oft ein Gerät. Die Formelzeichen variieren in der Literatur, die Vorlesung orientiert sich an DIN IEC 60050-351.' },
    ],
  },
  {
    id: 'v01-beispiel-heizkoerper',
    bereich: 'vorlesung',
    vorlesung: 'V01',
    titel: 'Regelkreis-Beispiel: Heizkörper mit Thermostat (Zimmer)',
    quellen: 'V01 Folie 20–24',
    stichworte: 'heizkörper heizung thermostat zimmer temperaturregelung raumtemperatur regelventil temperaturfühler komponenten identifizieren fenster sonneneinstrahlung beispiel regelkreis',
    frage: 'Identifizieren Sie die Komponenten des Standardregelkreises am Beispiel eines Heizkörpers mit Thermostat.',
    antwort: [
      { t: 'tabelle', kopf: ['Größe', 'Name', 'Heizkörper im Zimmer'], zeilen: [
        ['w(t)', 'Führungsgröße', 'eingestellte Solltemperatur'],
        ['r(t)', 'Rückführungsgröße', 'gemessene Temperatur'],
        ['e(t)', 'Regeldifferenz', 'Soll-Istwert-Vergleich'],
        ['u(t)', 'Reglerausgangsgröße', 'Signal zum Stellglied (Regelventil)'],
        ['y(t)', 'Stellgröße', 'Öffnungsgrad des Regelventils'],
        ['z(t)', 'Störgröße', 'offenes Fenster, Sonneneinstrahlung'],
        ['x(t)', 'Regelgröße', 'Temperatur des Raumes'],
      ] },
      { t: 'p', text: 'Das Regelventil lässt warmes Wasser in den Heizkörper strömen. Oft ist der Temperaturfühler in das Thermostat am Heizkörper integriert (Regler und Messeinrichtung in einem Gerät).' },
      { t: 'link', ziel: 'a/standardregelkreis', text: 'Standardregelkreis zeichnen' },
    ],
  },
  {
    id: 'v01-beispiel-fuellstand',
    bereich: 'vorlesung',
    vorlesung: 'V01',
    titel: 'Regelkreis-Beispiel: Füllstandsregelung eines Behälters',
    quellen: 'V01 Folie 25–27',
    stichworte: 'füllstand füllstandsregelung behälter tank wasserstand höhe h abfluss V2 punkt regelventil 4..20mA beispiel regelkreis komponenten',
    frage: 'Identifizieren Sie die Komponenten des Standardregelkreises bei einer Füllstandsregelung. Was ist die Regelgröße, was die Störgröße?',
    antwort: [
      { t: 'tabelle', kopf: ['Größe', 'Name', 'Füllstandsregelung'], zeilen: [
        ['w(t)', 'Führungsgröße', 'eingestellte Füllhöhe, z. B. h_w'],
        ['r(t)', 'Rückführungsgröße', 'gemessener Füllstand h'],
        ['e(t)', 'Regeldifferenz', 'Soll-Istwert-Vergleich e = h_w − h'],
        ['u(t)', 'Reglerausgangsgröße', 'Signal zum Stellglied (Regelventil), z. B. 4…20 mA'],
        ['y(t)', 'Stellgröße', 'Öffnungsgrad des Regelventils'],
        ['z(t)', 'Störgröße', 'Abfluss aus dem Tank V̇₂ (Volumenänderung pro Zeit)'],
        ['x(t)', 'Regelgröße', 'Wasserstand h'],
      ] },
      { t: 'link', ziel: 'a/standardregelkreis', text: 'Standardregelkreis zeichnen' },
    ],
  },
  {
    id: 'v01-pid-regler-einfuehrung',
    bereich: 'vorlesung',
    vorlesung: 'V01',
    titel: 'PID-Regler: Gleichung im Zeit- und Bildbereich (K_P, K_I, K_D)',
    quellen: 'V01 Folie 38–39',
    stichworte: 'pid regler gleichung proportional integral differential anteil K_P K_I K_D gesamtgleichung übertragungsfunktion regelglied R(s) y(t) e(t) gegenreaktion',
    frage: 'Geben Sie die Gleichung des PID-Reglers im Zeit- und im Bildbereich an und erklären Sie die drei Anteile.',
    antwort: [
      { t: 'zwischen', text: 'Die drei Anteile' },
      { t: 'tabelle', kopf: ['Anteil', 'Zeitbereich', 'Bildbereich', 'Wirkung'], zeilen: [
        ['P', 'y(t) = K_P·e(t)', 'Y(s) = K_P·E(s)', 'Je größer e(t), desto größer die Gegenreaktion.'],
        ['I', 'y(t) = K_I·∫₀ᵗ e(τ) dτ', 'Y(s) = K_I·(1/s)·E(s)', 'Je länger e(t) anliegt, desto größer die Gegenreaktion.'],
        ['D', 'y(t) = K_D·de(t)/dt', 'Y(s) = K_D·s·E(s)', 'Je schneller sich e(t) ändert, desto größer die Gegenreaktion.'],
      ] },
      { t: 'zwischen', text: 'Gesamtgleichung' },
      { t: 'formel', text: 'y(t) = K_P·e(t) + K_I·∫₀ᵗ e(τ) dτ + K_D·de(t)/dt' },
      { t: 'formel', text: 'Y(s) = K_P·E(s) + K_I·(1/s)·E(s) + K_D·s·E(s)' },
      { t: 'formel', text: 'R(s) = Y(s)/E(s) = K_P + K_I·(1/s) + K_D·s = (K_D·s² + K_P·s + K_I)/s' },
      { t: 'p', text: 'Wirkungsplan: w(t) → Summenstelle (−x) → e(t) → Regelglied R(s) → y(t) → Strecke G(s) → x(t), Störgröße z(t) greift an der Strecke an. Das Regelglied zusammen mit der Summenstelle ist der „Regler“.' },
      { t: 'hinweis', text: 'Die Folie nennt die Übertragungsfunktion des Regelglieds teils G(s) = Y(s)/E(s), im Bild R(s). Gemeint ist R(s). Hier mit K_I, K_D als Verstärkungen. Mit T_n, T_v siehe die ideale/reale PID-Form.' },
      { t: 'link', ziel: 'a/pid-ideal-real', text: 'PID ideal und real (Sprungantwort, Skizze)' },
      { t: 'link', ziel: 'pid', text: 'PID-Einstellregeln Rechner' },
    ],
  },
  {
    id: 'v01-lti-zeitvarianz',
    bereich: 'vorlesung',
    vorlesung: 'V01',
    titel: 'LTI-System: Beispiel zeitvariantes System (R(t))',
    quellen: 'V01 Folie 40–42, 46',
    stichworte: 'lti linear zeitinvariant zeitvariant zeitvariante nichtlinear wurzelfunktion widerstand R(t) induktivität kein lti system verschiebungssatz überlagerungsprinzip',
    frage: 'Wann ist ein System kein LTI-System? Nennen Sie je ein Beispiel für ein nichtlineares und ein zeitvariantes System.',
    antwort: [
      { t: 'link', ziel: 'a/lti-system', text: 'LTI-System: Linearität und Zeitinvarianz (Gleichungen)' },
      { t: 'zwischen', text: 'Nichtlinear: Wurzelfunktion' },
      { t: 'p', text: 'f(t) = √t ist nicht linear, also kein LTI-System. Lösung: Linearisierung um den Arbeitspunkt (siehe nächster Eintrag).' },
      { t: 'zwischen', text: 'Zeitvariant: zeitabhängiger Widerstand' },
      { t: 'formel', text: 'LTI:  u(t) = L·di(t)/dt + R·i(t)' },
      { t: 'formel', text: 'kein LTI (zeitvariant):  u(t) = L·di(t)/dt + R(t)·i(t)' },
      { t: 'p', text: 'Bei einem zeitvarianten System gilt φ{u(t)} = y(t), aber φ{u(t − t₀)} ≠ y(t − t₀).' },
      { t: 'link', ziel: 'linearisierung', text: 'Linearisierung (Rechner)' },
    ],
  },
  {
    id: 'v01-linearisierung-arbeitspunkt',
    bereich: 'vorlesung',
    vorlesung: 'V01',
    titel: 'Linearisierung um den Arbeitspunkt (Taylor, Tangente) mit Beispiel √t',
    quellen: 'V01 Folie 42–45',
    stichworte: 'linearisierung arbeitspunkt taylor tangente f tilde wurzel sqrt t0 ableitung error fehler delta t nichtlinear',
    frage: 'Linearisieren Sie f(t) = √t um den Arbeitspunkt t₀ = 4. Geben Sie die allgemeine Formel an und zeichnen Sie Funktion und Tangente.',
    antwort: [
      { t: 'p', text: 'Methode: Taylorreihenentwicklung und Abbruch nach dem ersten Glied. Tangente im Arbeitspunkt t₀ mit f(t₀) = f₀:' },
      { t: 'formel', text: 'f̃(t) = a·t + b   mit a = ḟ(t₀)  und  b = f(t₀) − a·t₀' },
      { t: 'formel', text: 'f̃(t) = f(t₀) + ḟ(t₀)·(t − t₀)' },
      { t: 'formel', text: 'f̃(t) = f(t₀) + ḟ(t₀)·Δt   mit Δt = t − t₀      (Linearisierte Gleichung um den Arbeitspunkt)' },
      { t: 'zwischen', text: 'Beispiel f(t) = √t, t₀ = 4, f(t₀) = 2' },
      { t: 'formel', text: 'ḟ(t) = d/dt t^(1/2) = ½·t^(−1/2) = 1/(2√t)      a = ḟ(t₀) = 1/(2√4) = 1/4' },
      { t: 'formel', text: 'f̃(t) = 2 + ¼·(t − 4) = 2 + ¼t − 1 = ¼t + 1' },
      { t: 'formel', text: 'Fehler = f(t) − f̃(t) = √t − ¼t − 1      (im Arbeitspunkt: 2 − 2 = 0)' },
      { t: 'svg', svg: SVG_LINEARISIERUNG, unterschrift: 'Wurzelfunktion (Kurve) und Tangente im Arbeitspunkt t₀ = 4, f(t₀) = 2' },
      { t: 'link', ziel: 'linearisierung', text: 'Linearisierung (Rechner mit Rechenweg)' },
    ],
  },
  {
    id: 'v01-gleichstrommotor-drehzahlregelung',
    bereich: 'vorlesung',
    vorlesung: 'V01',
    titel: 'Anhang: Drehzahlregelung Gleichstrommotor (Systemgleichungen, Strukturbild)',
    quellen: 'V01 Folie 48–56 (Anhang)',
    stichworte: 'gleichstrommotor gleichstrommaschine drehzahlregelung anker ankerkreis gegen-emk stromrichter tachogenerator verstärker trägheitsmoment lastmoment systemgleichungen strukturbild laplace K_F K_St T_St K_V K_I R_A L_A',
    frage: 'Stellen Sie für die Drehzahlregelung eines Gleichstrommotors die Systemgleichungen auf und transformieren Sie sie in den Bildbereich.',
    antwort: [
      { t: 'p', text: 'Aufbau (Folie 52): Vergleichsglied → elektrischer Verstärker (Regelglied) → Stromrichter (Steller) → Motor + Last (Strecke) → Tachogenerator (Messeinrichtung), zurück zum Vergleichsglied. Rotierender Anker bei konstanter Erregung Φ_F = const.' },
      { t: 'zwischen', text: 'Größen' },
      { t: 'liste', items: [
        'u_A, i_A Ankerspannung, Ankerstrom · R_A, L_A Ankerwiderstand, Ankerinduktivität',
        'e_M Gegen-EMK · Θ Trägheitsmoment · ω Drehzahl',
        'M_A Antriebsmoment · M_L Lastmoment (Störgröße z(t)) · M_B = M_A − M_L Beschleunigungsmoment',
        'u_I Tachospannung (u_I ~ ω) · u_S Sollwertvorgabe · u_D = u_S − u_I Differenzspannung · u_G Verstärkerausgang · u_A Ankerspannung vom Stromrichter',
      ] },
      { t: 'zwischen', text: 'Systemgleichungen (Zeitbereich)' },
      { t: 'formel', text: 'Ankerkreis (2. Kirchhoff):  u_A − e_M = R_A·i_A + L_A·di_A/dt    oder    (L_A/R_A)·di_A/dt + i_A = (1/R_A)·u_R   mit u_R = u_A − e_M' },
      { t: 'formel', text: 'Gegen-EMK:  e_M = c·Φ_F·ω = K_F·ω   (K_F = c·Φ_F)        Antriebsmoment:  M_A = K_F·i_A' },
      { t: 'formel', text: 'Drehbewegung (2. Newton):  Θ·dω/dt = M_B = M_A − M_L' },
      { t: 'formel', text: 'Stromrichter:  T_St·du_A/dt + u_A = K_St·u_G        Verstärker:  u_G = K_V·u_D        u_D = u_S − u_I,  u_I = K_I·ω' },
      { t: 'zwischen', text: 'Bildbereich (Anfangswerte 0)' },
      { t: 'formel', text: 'i_A(s) = [ (1/R_A) / (1 + (L_A/R_A)·s) ] · u_R(s)' },
      { t: 'formel', text: 'u_A(s) = [ K_St / (1 + T_St·s) ] · u_G(s)' },
      { t: 'formel', text: 'ω(s) = (1/(Θ·s)) · M_B(s)      (durch Integration ω(t) = (1/Θ)∫M_B dτ ⊶ …)' },
      { t: 'hinweis', text: 'Im Folientext kommen die Gleichungen nur als Bild. Die Gleichung L_A/R_A ·s·i_A + i_A = u_R/R_A ist die Laplace-Transformierte der Ankerkreisgleichung. Das gesamte Strukturbild (Folie 55–56) ist Föllinger, nicht abzeichnen.' },
      { t: 'link', ziel: 'dgl', text: 'DGL → G(s) Rechner' },
      { t: 'link', ziel: 'a/laplace-rechenregeln', text: 'Laplace-Rechenregeln' },
    ],
  },
];
