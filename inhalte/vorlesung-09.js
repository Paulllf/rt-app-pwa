// Vorlesung 09: Zustandsregelung (entfällt 2026), Speicherprogrammierbare Steuerung – Format: tools/inhalte-format.md
// SPS: nur Ergänzungen zu den vorhandenen sps-* Musterantworten (Zyklus, Gatter, Sprachen, Adressen, Pegel, Selbsthaltung, Zahlen).
// Skizzen: nur currentColor, kein Skript, kein Link.

// ---------- Hilfsfunktionen für Skizzen ----------
const n1 = (x) => (Math.round(x * 10) / 10).toString();
const txt = (x, y, s, anker = 'start', gr = 12) =>
  `<text x="${x}" y="${y}" font-family="sans-serif" font-size="${gr}" text-anchor="${anker}" fill="currentColor">${s}</text>`;
const lin = (x1, y1, x2, y2, extra = '') =>
  `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" stroke="currentColor" stroke-width="1.5" ${extra}/>`;
const gestr = (x1, y1, x2, y2) =>
  `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" stroke="currentColor" stroke-width="1" stroke-dasharray="4 3"/>`;
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
// Wandler: Kasten mit Diagonale, D links unten, A rechts oben (Folie 23)
const wandler = (x, y) =>
  `<rect x="${x}" y="${y}" width="50" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>` +
  lin(x, y, x + 50, y + 40) + txt(x + 4, y + 34, 'D', 'start', 12) + txt(x + 46, y + 14, 'A', 'end', 12);
const kreis = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
const punkt = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="3" fill="currentColor"/>`;
const kopf = (b, h) => `<svg viewBox="0 0 ${b} ${h}" xmlns="http://www.w3.org/2000/svg">`;

// ---------- Skizze: Regelkreis mit digitalem Regler (Folie 23) ----------
const svgDigital = kopf(520, 215) +
  txt(4, 104, 'w(k)') + pfeil(40, 110, 51, 110) + kreis(60, 110) + txt(46, 130, '−', 'middle', 14) +
  pfeil(69, 110, 100, 110) + kasten(100, 90, 70, 40, 'Regler') + lin(170, 110, 200, 110) +
  wandler(200, 90) + pfeil(250, 110, 290, 110) + txt(270, 102, 'y(t)', 'start', 12) +
  kasten(290, 90, 70, 40, 'G(s)') + lin(360, 110, 410, 110) + punkt(410, 110) + pfeil(410, 110, 450, 110) + txt(420, 102, 'x(t)', 'start', 12) +
  txt(335, 48, 'z(t)') + pfeil(325, 55, 325, 90) +
  lin(410, 110, 410, 175) + pfeil(410, 175, 255, 175) + wandler(205, 155) + lin(205, 175, 60, 175) + pfeil(60, 175, 60, 119) +
  `<rect x="30" y="68" width="235" height="140" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="5 4"/>` +
  txt(147, 62, 'digitaler Regler', 'middle', 11) + txt(325, 150, 'Strecke', 'middle', 11) + '</svg>';

// ---------- Skizze: Quantisierungskennlinie (Folie 30) ----------
const stufen = (() => {
  let p = '';
  for (let k = -3; k <= 3; k++) {
    const y = 120 - 24 * k, x0 = 150 + 24 * k - 12, x1 = 150 + 24 * k + 12;
    p += lin(x0, y, x1, y);
    if (k < 3) p += lin(x1, y, x1, y - 24);
  }
  return p;
})();
const svgQuant = kopf(330, 235) +
  pfeil(40, 120, 270, 120) + txt(272, 124, 'Eingang', 'start', 11) + pfeil(150, 215, 150, 12) + txt(156, 14, 'Ausgang', 'start', 11) +
  gestr(66, 192, 234, 24) + stufen +
  lin(222, 132, 246, 132) + lin(222, 128, 222, 136) + lin(246, 128, 246, 136) + txt(234, 146, 'q', 'middle', 12) +
  txt(20, 228, 'Treppe = quantisiert, gestrichelt = ideal', 'start', 10) + '</svg>';

export const ANTWORTEN = [
  // ============ Zustandsregelung (entfällt) ============
  {
    id: 'v09-zustandsregelung-entfaellt',
    bereich: 'vorlesung',
    vorlesung: 'V09',
    titel: 'Zustandsregelung, Ähnlichkeitstransformation, Polvorgabe: entfällt 2026',
    quellen: 'V09 Folie 2–20 (Folie 3: „Entfällt 2026“)',
    stichworte: 'zustandsregelung zustandsregler ähnlichkeitstransformation polvorgabe polzuweisung zustandsrückführung vorfilter q steuerbarkeitsmatrix entfällt klausurstoff',
    frage: 'Was versteht man unter einer Zustandsregelung (Polvorgabe)? (nicht Klausurstoff 2026)',
    antwort: [
      { t: 'hinweis', text: 'Laut Folie 2 und 3 (V09) entfällt die Zustandsregelung 2025 und 2026. Sie ist nicht Klausurstoff. Die Zustandsraumdarstellung selbst (V08) bleibt Stoff.' },
      { t: 'p', text: 'Nur zur Einordnung, falls ein Begriff fällt: Bei der Zustandsregelung werden alle Zustände x_R (in Regelungsnormalform) mit Faktoren rᵢ auf den Eingang zurückgeführt (u = −rᵀ·x_R + q·w). Dadurch lassen sich die Pole des Systems beliebig verschieben (Polvorgabe, Polzuweisung); das Vorfilter q stellt die stationäre Verstärkung ein.' },
      { t: 'p', text: 'Die Ähnlichkeitstransformation wandelt Darstellungen ineinander um (z. B. P-Tₙ-Modell mit Matrix A ↔ RNF mit A_R) mit einer regulären Transformationsmatrix T, x = T·x_R. Die Steuerbarkeitsmatrix S muss dafür invertierbar sein, d. h. alle Zustände steuerbar.' },
      { t: 'link', ziel: 'a/v08-rnf', text: 'Stoff dazu: Regelungsnormalform (V08)' },
    ],
  },

  // ============ Digitaler Regelkreis ============
  {
    id: 'v09-sps-digitaler-regler',
    bereich: 'vorlesung',
    vorlesung: 'V09',
    titel: 'SPS als Steuerung und digitaler Regler, Regelkreis mit A/D- und D/A-Wandler',
    quellen: 'V09 Folie 22–24',
    stichworte: 'sps plc programmable logic controller digitaler regler regelkreis A/D D/A wandler abtastung w(k) steuerung regler controller digital regelung',
    frage: 'Eine SPS kann als Steuerung und als Regler eingesetzt werden. Skizzieren Sie den Regelkreis mit digitalem Regler.',
    antwort: [
      { t: 'p', text: 'Speicherprogrammierbare Steuerung (SPS), englisch Programmable Logic Controller (PLC). Das deutsche Wort „Steuerung“ ist irreführend: Im Englischen heißt sie „Controller“. Wegen ihrer Modularität und Konfigurierbarkeit kann eine SPS als Steuerung und als (digitaler) Regler eingesetzt werden.' },
      { t: 'svg', svg: svgDigital, unterschrift: 'Standardregelkreis mit digitalem Regler (Folie 23): Sollwert w(k) digital, Stellgröße y(t) und Regelgröße x(t) analog, deshalb D/A-Wandler im Vorwärtszweig und A/D-Wandler in der Rückführung.' },
      { t: 'liste', items: [
        'Der Regler ist digital (zeitdiskret, Index k statt t).',
        'D/A-Wandler: digitale Stellgröße → analoges y(t) für die Strecke G(s).',
        'A/D-Wandler: analoge Regelgröße x(t) → digitaler Wert für den Vergleich mit w(k).',
        'Störgröße z(t) wirkt analog auf die Strecke.',
      ] },
      { t: 'p', text: 'Beispiel Folie 24: Eingabe, Verarbeitung, Ausgabe mit 2 digitalen Eingängen und 1 digitalen Ausgang (Eingänge lesen → Programm → Ausgang schreiben).' },
      { t: 'link', ziel: 'a/sps-zyklus', text: 'Zyklische Arbeitsweise (PAE, Programm, PAA)' },
      { t: 'link', ziel: 'a/v09-ad-wandlung', text: 'Abtastung und Quantisierung (A/D-Wandlung)' },
    ],
  },

  // ============ A/D-Wandlung ============
  {
    id: 'v09-ad-wandlung',
    bereich: 'vorlesung',
    vorlesung: 'V09',
    titel: 'A/D-Wandlung: Abtastung und Quantisierung, q = 1/2^db, q_S = q·U_E',
    quellen: 'V09 Folie 29–30',
    stichworte: 'analog digital wandlung A/D abtastung abtastzeit T0 quantisierung quantisierungseinheit quantisierungsstufe datenbreite db bit 8 bit 12 bit quantisierungsfehler kennlinie eingangssignalbereich U_E auflösung',
    frage: 'Beschreiben Sie die zwei Schritte der A/D-Wandlung. Wie groß ist die kleinste Quantisierungsstufe eines 12-Bit-Wandlers für 0 … 10 V?',
    antwort: [
      { t: 'zwischen', text: '1. Schritt: Abtastung (Folie 29)' },
      { t: 'p', text: 'Das kontinuierliche Signal wird nur zu festen Zeitpunkten mit der Abtastzeit T₀ erfasst; dazwischen bleibt der Wert (Treppenkurve). Beispiel: PT₁-Sprungantwort mit T₀ = 1 s: h(0) = 0; h(T) = 0,2835; h(2T) = 0,4866; h(3T) = 0,6322; … h(10T) = 0,9643.' },
      { t: 'zwischen', text: '2. Schritt: Quantisierung (Folie 30)' },
      { t: 'p', text: 'Der Wert wird auf endlich viele Stufen gerundet. Datenbreite des Wandlers: db (z. B. 8 bit oder 12 bit).' },
      { t: 'formel', text: `Quantisierungseinheit:        q = 1 / 2^db
kleinste Quantisierungsstufe: q_S = q · U_E     (U_E = Eingangssignalbereich)
Quantisierungsfehler:         ± 0,5 · q_S      (im Bild ±0,5q)` },
      { t: 'svg', svg: svgQuant, unterschrift: 'Quantisierungskennlinie (Folie 30): Treppe um die ideale Gerade, Stufenbreite = Stufenhöhe = q.' },
      { t: 'zwischen', text: 'Beispiel' },
      { t: 'formel', text: `db = 12 bit, U_E = 10 V:   q = 1/4096,   q_S = 10 V/4096 ≈ 2,44 mV,   Fehler ≤ ±1,22 mV
db = 8 bit,  U_E = 10 V:   q = 1/256,    q_S = 10 V/256  ≈ 39,1 mV` },
      { t: 'hinweis', text: 'Die Folie hat die Formel q = 1/2^db; im Text der Folie ist der Exponent kaputt dargestellt, im Bild steht db als Exponent. Die Beispielwerte sind nachgerechnet, nicht von der Folie. Der Fehler ±0,5 gilt bei Rundung auf die nächste Stufe (so zeigt es das Bild).' },
    ],
  },

  // ============ Modulare Bauweise ============
  {
    id: 'v09-sps-aufbau-module',
    bereich: 'vorlesung',
    vorlesung: 'V09',
    titel: 'SPS Aufbau: Baugruppen PSU, CPU, CP, DI, AI, DO, AO (Siemens S7-1500, ABB Freelance)',
    quellen: 'V09 Folie 31–34, 44–47',
    stichworte: 'sps aufbau modular baugruppen PSU CPU CP DI DO AI AO spannungsversorgung kommunikationsbaugruppe eingangsbaugruppe ausgangsbaugruppe siemens s7-1500 abb freelance ac700f tia portal',
    frage: 'Nennen Sie die Baugruppen einer modular aufgebauten SPS und ihre Aufgabe.',
    antwort: [
      { t: 'tabelle', kopf: ['Baugruppe', 'Abkürzung', 'Aufgabe'], zeilen: [
        ['Spannungsversorgung', 'PSU', 'versorgt die SPS (typisch 24 V)'],
        ['CPU-Baugruppe', 'CPU', 'zentrale Recheneinheit, führt das Programm aus'],
        ['Kommunikationsbaugruppen', 'CP', 'Netzwerk/Bus-Anbindung'],
        ['Eingangsbaugruppen digital / analog', 'DI / AI', 'Signale der Sensoren einlesen'],
        ['Ausgangsbaugruppen digital / analog', 'DO / AO', 'Aktoren ansteuern'],
      ] },
      { t: 'p', text: 'Modulare Bauweise = große Modulvielfalt, die Steuerung wird je nach Aufgabe aus Baugruppen zusammengesetzt. Beispiele der Vorlesung: Siemens SIMATIC S7-1500 (aktuelles Modell, CPU mit LED-Anzeigen für Betriebszustand und Diagnose, Display und Bedientasten) und die Einsteigersteuerung ABB Freelance AC700F.' },
      { t: 'zwischen', text: 'Projektierung (Demonstration, Folie 44–47)' },
      { t: 'liste', items: [
        'TIA-Portal (Siemens): Hardwarekonfiguration (CPU, Eingangs- und Ausgangskarten wählen, Adressen konfigurieren), Funktionsbaustein in FUP anlegen, in OB1 ziehen, Simulation starten.',
        'ABB Freelance: Aufteilung in Controller (Hardware oder Softcontroller auf PC) und Bedienstation (Software auf Windows-Rechner); Programm herunterladen (ganze Station oder nur geänderte Objekte).',
      ] },
      { t: 'link', ziel: 'a/sps-zyklus', text: 'Zyklische Arbeitsweise' },
      { t: 'link', ziel: 'a/sps-adressen', text: 'Adressierung %E, %A, %M' },
    ],
  },

  // ============ Bits, Bytes, Operanden ============
  {
    id: 'v09-sps-bits-operanden',
    bereich: 'vorlesung',
    vorlesung: 'V09',
    titel: 'Bit, Byte, Word, DWord und Operandentabelle (%EBy, %AWy, %MDy …)',
    quellen: 'V09 Folie 35–36',
    stichworte: 'bit byte word dword doppelwort 8 bit 16 bit 32 bit nummerierung rechts links operandentabelle operandenbereich eingang ausgang merker datenbaustein lokaldaten peripherie absolutadresse %eby %ewy %edy %aby %awy %mdy %db %ly',
    frage: 'Wie viele Bit hat ein Byte, Word, DWord? Wie wird nummeriert? Wie lautet die Adresse von Eingangs-Byte 4, Ausgangs-Wort 2, Merker-Bit 1.3?',
    antwort: [
      { t: 'tabelle', kopf: ['Einheit', 'Größe', 'Aufbau'], zeilen: [
        ['1 Bit', '1 Bit', 'kleinste Einheit (0 oder 1)'],
        ['1 Byte', '8 Bit', 'Bits 7 6 5 4 3 2 1 0'],
        ['1 Word', '2 Byte = 16 Bit', 'Byte n, Byte n+1'],
        ['1 DWord', '4 Byte = 32 Bit', 'Byte n … Byte n+3'],
      ] },
      { t: 'hinweis', text: 'Vorsicht (Folie 35): Bit-Nummerierung rechts → links (Bit 7 links, Bit 0 rechts), Byte-Nummerierung links → rechts (Byte n, dann n+1 …).' },
      { t: 'zwischen', text: 'Operandentabelle (Folie 36)' },
      { t: 'p', text: 'Eine Absolutadresse wird mit vorangestelltem %-Zeichen angezeigt. 1. Zeichen: %, 2. Zeichen: E, A, M, 3. Zeichen: X (Bit; bei E, A, M wird es weggelassen: %Ey.x), B, W, DW.' },
      { t: 'tabelle', kopf: ['Operandenbereich', 'Kennzeichen', 'Bit', 'Byte', 'Wort', 'Doppelwort'], zeilen: [
        ['Eingang', 'E', '%Ey.x', '%EBy', '%EWy', '%EDy'],
        ['Peripherie-Eingang', 'E:P', '–', '%EBy:P', '%EWy:P', '%EDy:P'],
        ['Ausgang', 'A', '%Ay.x', '%ABy', '%AWy', '%ADy'],
        ['Peripherie-Ausgang', 'A:P', '–', '%ABy:P', '%AWy:P', '%ADy:P'],
        ['Merker', 'M', '%My.x', '%MBy', '%MWy', '%MDy'],
        ['Daten', 'DB', '%DBz.DBXy.x', '%DBz.DBBy', '%DBz.DBWy', '%DBz.DBDy'],
        ['temporäre Lokaldaten', 'L', '%Ly.x', '%LBy', '%LWy', '%LDy'],
      ] },
      { t: 'p', text: 'z = Datenbausteinnummer, y = Byteadresse, x = Bitadresse. Beispiele: %EB4 = Eingangsbyte 4, %AW2 = Ausgangswort 2 (belegt Byte 2 und 3), %M1.3 = Merker, Byte 1, Bit 3.' },
      { t: 'link', ziel: 'a/sps-adressen', text: 'Musterantwort Adressierung %A5.3' },
      { t: 'link', ziel: 'a/sps-signalpegel', text: 'Binäre Signale, Logikpegel 24 V' },
    ],
  },

  // ============ SR / RS Flipflop ============
  {
    id: 'v09-sps-flipflop-dominanz',
    bereich: 'vorlesung',
    vorlesung: 'V09',
    titel: 'SR- und RS-Flipflop: Setzen/Rücksetzen dominant, Wahrheitstabelle',
    quellen: 'V09 Folie 42–43',
    stichworte: 'sr flipflop rs flipflop setzen rücksetzen dominant 1-bit speicher wahrheitstabelle q S R R1 S1 abb freelance umgekehrt flip flop speicherglied',
    frage: 'Erläutern Sie das SR- und das RS-Flipflop. Welches Signal ist dominant? Geben Sie die Wahrheitstabelle an.',
    antwort: [
      { t: 'p', text: 'Das Flipflop ist ein 1-Bit-Speicher. S = Setzen, R = Rücksetzen. Unterschied der beiden Typen ist nur, welcher Eingang gewinnt, wenn beide gleichzeitig 1 sind.' },
      { t: 'tabelle', kopf: ['S', 'R', 'Q neu (SR, Rücksetzen dominant)', 'Q neu (RS, Setzen dominant)'], zeilen: [
        ['0', '0', 'Q alt (speichert)', 'Q alt (speichert)'],
        ['1', '0', '1', '1'],
        ['0', '1', '0', '0'],
        ['1', '1', '0', '1'],
      ] },
      { t: 'liste', items: [
        'SR-FF (Folie 42, TIA-Baustein „SR“ mit Eingängen S und R1): Rücksetzen dominant.',
        'RS-FF (Folie 43, Baustein „RS“ mit Eingängen R und S1): Setzen dominant.',
        'Bei ABB Freelance ist es genau umgekehrt (SR: Setzen dominant, RS: Rücksetzen dominant).',
      ] },
      { t: 'hinweis', text: 'Die Folien zeigen im Bild je einen Baustein mit Eingang_0 (%E0.0) und Eingang_1 (%E0.1) und Ausgang (%A0.4 bzw. %A0.5). Die Wahrheitstabelle ist aus der Dominanzregel der Folie abgeleitet. Das dominante Signal trägt in der Baustein-Beschriftung die „1“ (R1 beim SR, S1 beim RS).' },
      { t: 'link', ziel: 'a/sps-selbsthaltung', text: 'Selbsthaltung, „Aus vor Ein“' },
      { t: 'link', ziel: 'a/sps-gatter', text: 'Logikgatter UND, ODER, NICHT, XOR' },
    ],
  },
];
