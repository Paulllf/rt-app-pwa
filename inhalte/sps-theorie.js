// Musterantworten SPS (S1, S2, S3, Ü09, Vorlesung 09) – Format: tools/inhalte-format.md
// Vorlesung 10/11 (Flanken, Zeitglieder, Zähler, GRAFCET) gibt es noch nicht – nichts dazu erfunden.

const SVG_ZYKLUS = `<svg viewBox="-24 0 466 290" font-family="sans-serif" font-size="14" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="110" y="20" width="190" height="44" rx="4"/>
  <text x="205" y="47" text-anchor="middle" fill="currentColor" stroke="none">1. PAE lesen</text>
  <rect x="110" y="110" width="190" height="44" rx="4"/>
  <text x="205" y="137" text-anchor="middle" fill="currentColor" stroke="none">2. Programm abarbeiten</text>
  <rect x="110" y="200" width="190" height="44" rx="4"/>
  <text x="205" y="227" text-anchor="middle" fill="currentColor" stroke="none">3. PAA schreiben</text>
  <path d="M205 64 V108 M199 100 L205 110 L211 100"/>
  <path d="M205 154 V198 M199 190 L205 200 L211 190"/>
  <path d="M205 244 V270 H60 V42 H108 M98 36 L108 42 L98 48"/>
  <text x="48" y="160" text-anchor="middle" fill="currentColor" stroke="none" transform="rotate(-90 48 160)">Zyklus wiederholt sich</text>
  <path d="M318 20 Q332 20 332 34 V122 Q332 132 342 132 Q332 132 332 142 V230 Q332 244 318 244" stroke-width="1.5"/>
  <text x="348" y="128" fill="currentColor" stroke="none">Zykluszeit</text>
  <text x="348" y="146" fill="currentColor" stroke="none" font-size="12">(ein Durchlauf)</text>
</svg>`;

const SVG_GATTER = `<svg viewBox="0 0 530 230" font-family="sans-serif" font-size="15" fill="none" stroke="currentColor" stroke-width="2">
  <!-- UND -->
  <rect x="30" y="40" width="60" height="70"/>
  <path d="M10 60 H30 M10 90 H30 M90 75 H115"/>
  <text x="60" y="82" text-anchor="middle" fill="currentColor" stroke="none" font-size="20">&amp;</text>
  <text x="60" y="140" text-anchor="middle" fill="currentColor" stroke="none">UND (AND)</text>
  <!-- ODER -->
  <rect x="170" y="40" width="60" height="70"/>
  <path d="M150 60 H170 M150 90 H170 M230 75 H255"/>
  <text x="200" y="82" text-anchor="middle" fill="currentColor" stroke="none" font-size="18">≥1</text>
  <text x="200" y="140" text-anchor="middle" fill="currentColor" stroke="none">ODER (OR)</text>
  <!-- XOR -->
  <rect x="310" y="40" width="60" height="70"/>
  <path d="M290 60 H310 M290 90 H310 M370 75 H395"/>
  <text x="340" y="82" text-anchor="middle" fill="currentColor" stroke="none" font-size="18">=1</text>
  <text x="340" y="140" text-anchor="middle" fill="currentColor" stroke="none">XOR</text>
  <!-- NICHT -->
  <rect x="450" y="55" width="50" height="40"/>
  <path d="M430 75 H442 M500 75 H515"/>
  <circle cx="446" cy="75" r="4" fill="currentColor"/>
  <text x="475" y="82" text-anchor="middle" fill="currentColor" stroke="none" font-size="18">1</text>
  <text x="475" y="140" text-anchor="middle" fill="currentColor" stroke="none">NICHT (NOT)</text>
  <text x="260" y="190" text-anchor="middle" fill="currentColor" stroke="none" font-size="13">Negation = ausgefüllter Punkt (oder Kreis) am Eingang bzw. Ausgang</text>
  <text x="260" y="212" text-anchor="middle" fill="currentColor" stroke="none" font-size="13">Eingänge links, Ausgang rechts</text>
</svg>`;

const SVG_SR = `<svg viewBox="0 0 460 190" font-family="sans-serif" font-size="14" fill="none" stroke="currentColor" stroke-width="2">
  <text x="170" y="18" text-anchor="middle" fill="currentColor" stroke="none" font-size="12">%M0.0 „Steuerung_Ein“</text>
  <rect x="130" y="26" width="80" height="110"/>
  <line x1="130" y1="52" x2="210" y2="52"/>
  <text x="170" y="44" text-anchor="middle" fill="currentColor" stroke="none">SR</text>
  <path d="M60 80 H130"/>
  <text x="138" y="85" fill="currentColor" stroke="none">S</text>
  <text x="2" y="74" fill="currentColor" stroke="none" font-size="12">%E0.2 Knopf_EIN</text>
  <path d="M60 120 H122"/>
  <circle cx="126" cy="120" r="4"/>
  <text x="138" y="125" fill="currentColor" stroke="none">R1</text>
  <text x="2" y="114" fill="currentColor" stroke="none" font-size="12">%E0.3 Knopf_AUS</text>
  <text x="195" y="125" text-anchor="end" fill="currentColor" stroke="none">Q</text>
  <path d="M210 120 H260"/>
  <rect x="260" y="95" width="70" height="40"/>
  <text x="295" y="120" text-anchor="middle" fill="currentColor" stroke="none">=</text>
  <path d="M330 120 H350"/>
  <text x="262" y="86" fill="currentColor" stroke="none" font-size="12">%A0.4 Meldeleuchte</text>
  <text x="230" y="170" text-anchor="middle" fill="currentColor" stroke="none" font-size="12">R1 dominant: AUS gewinnt (Aus vor Ein). Kreis = Eingang negiert.</text>
</svg>`;

const SVG_HOCH = `<svg viewBox="-14 0 458 250" font-family="sans-serif" font-size="13" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="190" y="15" width="60" height="195"/>
  <text x="220" y="36" text-anchor="middle" fill="currentColor" stroke="none" font-size="18">&amp;</text>
  <path d="M140 55 H190 M140 85 H190 M140 115 H190 M140 145 H182 M140 185 H182 M250 112 H300"/>
  <circle cx="186" cy="145" r="4"/>
  <circle cx="186" cy="185" r="4"/>
  <text x="136" y="59" text-anchor="end" fill="currentColor" stroke="none">%M0.0 Steuerung_Ein</text>
  <text x="136" y="89" text-anchor="end" fill="currentColor" stroke="none">%E0.4 Knopf_HOCH</text>
  <text x="136" y="119" text-anchor="end" fill="currentColor" stroke="none">%E0.0 ES_oben</text>
  <text x="136" y="149" text-anchor="end" fill="currentColor" stroke="none">%A0.1 Motor_RUNTER</text>
  <text x="136" y="189" text-anchor="end" fill="currentColor" stroke="none">%E0.5 Knopf_RUNTER</text>
  <rect x="300" y="92" width="60" height="40"/>
  <text x="330" y="117" text-anchor="middle" fill="currentColor" stroke="none">=</text>
  <text x="330" y="82" text-anchor="middle" fill="currentColor" stroke="none">%A0.0 Motor_HOCH</text>
  <path d="M360 112 H380"/>
  <text x="215" y="238" text-anchor="middle" fill="currentColor" stroke="none" font-size="12">Kreis = Eingang negiert. RUNTER: genauso, Rollen von HOCH/RUNTER tauschen.</text>
</svg>`;

const SVG_GRUEN = `<svg viewBox="0 0 480 270" font-family="sans-serif" font-size="13" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="110" y="15" width="50" height="50"/><text x="135" y="46" text-anchor="middle" fill="currentColor" stroke="none" font-size="18">&amp;</text>
  <path d="M70 28 H110 M70 52 H110 M160 40 H215 V108 H235"/>
  <text x="66" y="32" text-anchor="end" fill="currentColor" stroke="none">L1</text>
  <text x="66" y="56" text-anchor="end" fill="currentColor" stroke="none">L2</text>
  <rect x="110" y="85" width="50" height="50"/><text x="135" y="116" text-anchor="middle" fill="currentColor" stroke="none" font-size="18">&amp;</text>
  <path d="M70 98 H110 M70 122 H110 M160 110 H235"/>
  <text x="66" y="102" text-anchor="end" fill="currentColor" stroke="none">L1</text>
  <text x="66" y="126" text-anchor="end" fill="currentColor" stroke="none">L3</text>
  <rect x="110" y="155" width="50" height="50"/><text x="135" y="186" text-anchor="middle" fill="currentColor" stroke="none" font-size="18">&amp;</text>
  <path d="M70 168 H110 M70 192 H110 M160 180 H215 V128 H235"/>
  <text x="66" y="172" text-anchor="end" fill="currentColor" stroke="none">L2</text>
  <text x="66" y="196" text-anchor="end" fill="currentColor" stroke="none">L3</text>
  <rect x="235" y="90" width="50" height="50"/><text x="260" y="120" text-anchor="middle" fill="currentColor" stroke="none" font-size="16">≥1</text>
  <path d="M285 115 H320"/>
  <rect x="320" y="95" width="60" height="40"/><text x="350" y="120" text-anchor="middle" fill="currentColor" stroke="none">=</text>
  <text x="350" y="88" text-anchor="middle" fill="currentColor" stroke="none">AMPEL_Gruen</text>
  <path d="M380 115 H400"/>
  <path d="M300 115 V240 H320"/>
  <rect x="332" y="222" width="40" height="36"/>
  <circle cx="328" cy="240" r="4" fill="currentColor"/>
  <text x="352" y="245" text-anchor="middle" fill="currentColor" stroke="none">=</text>
  <path d="M372 240 H392"/>
  <text x="352" y="216" text-anchor="middle" fill="currentColor" stroke="none">AMPEL_Rot = NICHT Grün</text>
</svg>`;

export const ANTWORTEN = [
  {
    id: 'sps-zyklus',
    bereich: 'sps',
    titel: 'SPS: zyklische Arbeitsweise, Zykluszeit',
    quellen: 'K1 S1 · K2 S1 · K3 S1 · Ü09 A1',
    punkte: 2,
    stichworte: 'sps zyklus zyklische arbeitsweise pae paa prozessabbild eingänge ausgänge zykluszeit programmablauf reaktionszeit speicherprogrammierbare steuerung',
    frage: 'Erläutern Sie die Arbeitsweise einer Speicherprogrammierbaren Steuerung (SPS). Wie nennt man die Zeitspanne, die das SPS-Programm für einen Durchlauf benötigt? (Ü09: Zeichnen Sie den Ablauf.)',
    antwort: [
      { t: 'p', text: 'Eine SPS arbeitet zyklisch, immer wieder in dieser Reihenfolge:' },
      { t: 'liste', nummeriert: true, items: [
        'Prozessabbild der Eingänge (PAE) lesen: Die Signalzustände der Eingangsbaugruppen werden in den Speicher (PAE) kopiert.',
        'Programmabarbeitung: Das Programm (OB1) rechnet nur mit dem PAE und schreibt Ergebnisse ins PAA.',
        'Prozessabbild der Ausgänge (PAA) schreiben: Das PAA wird an die Ausgabebaugruppen ausgegeben.',
        'Dann beginnt der Zyklus von vorn.',
      ] },
      { t: 'p', text: 'Die Dauer eines Durchlaufs heißt Zykluszeit.' },
      { t: 'svg', svg: SVG_ZYKLUS, unterschrift: 'Zyklische Arbeitsweise einer SPS' },
      { t: 'zwischen', text: 'Zusatz (nur wenn Platz/Zeit)' },
      { t: 'liste', items: [
        'Zu Beginn jedes Zyklus startet die Zyklus-Überwachungszeit (Folie der Musterlösung). Wird sie überschritten, geht die CPU in Stopp.',
        'Folge: Während des Programmdurchlaufs sieht die SPS Eingangsänderungen nicht. Ein Signal wirkt frühestens im nächsten Zyklus und am Ausgang erst am Zyklusende. Die Reaktionszeit hängt also von der Zykluszeit ab (im ungünstigen Fall etwa zwei Zyklen).',
      ] },
      { t: 'hinweis', text: 'Musterlösung: pro Antwort 1 Punkt (Ablauf PAE/Programm/PAA + Zykluszeit). Der Zusatz mit der Reaktionszeit ist eigene Folgerung, nicht aus der Musterlösung.' },
    ],
  },
  {
    id: 'sps-gatter',
    bereich: 'sps',
    titel: 'Logikgatter UND, ODER, NICHT, XOR: Symbol und Wahrheitstabelle',
    quellen: 'K1 S2 · Ü09 A2',
    punkte: 2,
    stichworte: 'sps logik gatter und oder nicht xor nand nor and or not wahrheitstabelle logiktabelle iec symbol & ≥1 =1 negation boolesche algebra',
    frage: 'Nennen Sie 4 grundlegende logische Operationen. Zeichnen Sie ihre grafische Repräsentation in Form eines Logikgatters auf und notieren Sie jeweils die Logiktabelle mit allen Ein- und Ausgängen.',
    antwort: [
      { t: 'svg', svg: SVG_GATTER, unterschrift: 'Logikgatter nach IEC (Kästen)' },
      { t: 'zwischen', text: 'Wahrheitstabellen' },
      { t: 'tabelle', kopf: ['A', 'B', 'UND  A ∧ B', 'ODER  A ∨ B', 'XOR  A ⊕ B', 'NICHT A'], zeilen: [
        ['0', '0', '0', '0', '0', '1'],
        ['0', '1', '0', '1', '1', '1'],
        ['1', '0', '0', '1', '1', '0'],
        ['1', '1', '1', '1', '0', '0'],
      ] },
      { t: 'p', text: 'NICHT hat nur einen Eingang (A). Die Spalte „NICHT A“ gilt für A allein, B spielt dort keine Rolle.' },
      { t: 'liste', items: [
        'UND (&): Ausgang 1, wenn beide Eingänge 1 sind.',
        'ODER (≥1): Ausgang 1, wenn mindestens ein Eingang 1 ist.',
        'NICHT (1 mit Negationspunkt): invertiert das Signal.',
        'XOR (=1): Ausgang 1, wenn genau ein Eingang 1 ist, nicht bei beiden.',
      ] },
      { t: 'zwischen', text: 'Falls NAND / NOR verlangt' },
      { t: 'tabelle', kopf: ['A', 'B', 'NAND = ¬(A ∧ B)', 'NOR = ¬(A ∨ B)'], zeilen: [
        ['0', '0', '1', '1'],
        ['0', '1', '1', '0'],
        ['1', '0', '1', '0'],
        ['1', '1', '0', '0'],
      ] },
      { t: 'p', text: 'Symbol: UND bzw. ODER-Kasten mit Negationspunkt am Ausgang.' },
      { t: 'link', ziel: 'sps-logik', text: 'Rechner: Wahrheitstabelle → Gatterlogik' },
      { t: 'hinweis', text: 'Musterlösung: 1 Punkt für 2 Gatter (je Gatter Zeichnung und Tabelle). Ü09 A2: eine Schaltung mit Wahrheitstabelle (Eingänge A, B, Zwischenergebnisse, Ausgang C) als XOR erkennen.' },
    ],
  },
  {
    id: 'sps-sprachen',
    bereich: 'sps',
    titel: 'SPS-Programmiersprachen nach IEC 61131-3',
    quellen: 'K2 S2 · K3 S2 · Vorlesung 09',
    punkte: 2,
    stichworte: 'sps programmiersprachen iec 61131 awl il kop ld fup fbd as sfc st scl anweisungsliste kontaktplan funktionsplan ablaufsprache strukturierter text s7 graph',
    frage: 'Welche SPS-Programmiersprachen nach IEC 61131-3 gibt es? Nennen Sie sowohl die Abkürzung als auch die volle Bezeichnung.',
    antwort: [
      { t: 'tabelle', kopf: ['Englisch', 'Bezeichnung', 'Deutsch', 'Bezeichnung'], zeilen: [
        ['IL', 'Instruction List', 'AWL', 'Anweisungsliste'],
        ['LD', 'Ladder Diagram', 'KOP', 'Kontaktplan'],
        ['FBD', 'Function Block Diagram', 'FUP', 'Funktionsplan (Funktionsbaustein-Sprache)'],
        ['SFC', 'Sequential Function Chart', 'AS', 'Ablaufsprache (S7-Graph)'],
        ['ST', 'Structured Text', 'ST (Siemens: SCL)', 'Strukturierter Text'],
      ] },
      { t: 'zwischen', text: 'Kurzbeschreibung (falls verlangt)' },
      { t: 'liste', items: [
        'AWL / IL: textuell, maschinennah, eine Anweisung pro Zeile.',
        'KOP / LD: grafisch, wie ein Stromlaufplan mit Kontakten (Schließer/Öffner) und Spulen.',
        'FUP / FBD: grafisch mit Logikgattern (&, ≥1) und Funktionsbausteinen.',
        'AS / SFC: grafisch, Ablaufschritte mit Übergangsbedingungen (Ablaufsteuerungen).',
        'ST / SCL: textuell, Hochsprache ähnlich Pascal (Zuweisungen, IF, FOR).',
      ] },
      { t: 'hinweis', text: 'Musterlösung K2/K3 nennt: KOP (Kontaktplan), FUP (Funktionsplan), AWL (Anweisungsliste), AS (Ablaufsprache / S7 Graph), ST (Strukturierter Text). Pro fehlender Sprache 0,5 Punkte Abzug, also alle fünf nennen. Die Vorlesung nennt FBD „Funktionsbaustein-Sprache“ (FBS), die Musterlösung FUP. Beides hinschreiben. Die Kurzbeschreibungen sind Zusatz, nicht aus der Vorlesung wörtlich.' },
    ],
  },
  {
    id: 'sps-adressen',
    bereich: 'sps',
    titel: 'Adressierung %E, %A, %M (Byte.Bit), Beispiel %A5.3',
    quellen: 'K1 S3 · K2 S3 · Vorlesung 09',
    punkte: 1,
    stichworte: 'sps adresse adressierung %e %a %m eingang ausgang merker byte bit %a5.3 meldeleuchte operand variablenname x y',
    frage: 'Verwenden Sie für die Eingänge das Format %Ex.y und für die Ausgänge %Ax.y. Erläutern Sie kurz, wofür x und y stehen. / Erläutern Sie die Bedeutung der Adresse %A5.3 „Meldeleuchte“.',
    antwort: [
      { t: 'formel', text: `%E x.y   Eingang    (E = Eingang)
%A x.y   Ausgang    (A = Ausgang)
%M x.y   Merker     (interner Speicher, kein physischer Ein-/Ausgang)

x = Byteadresse (Nummer des Bytes)
y = Bitadresse  (Bit im Byte, 0 … 7)` },
      { t: 'zwischen', text: '%A5.3 „Meldeleuchte“' },
      { t: 'liste', items: [
        'A: Ausgang',
        '5: Byteadresse (Byte 5)',
        '3: Bitadresse (Bit 3 in diesem Byte)',
        'Meldeleuchte: Variablenname in der SPS (symbolischer Name, wofür der Ausgang gebraucht wird)',
      ] },
      { t: 'zwischen', text: 'Beispielbelegung K1 (Lüfter-Ampel)' },
      { t: 'formel', text: `L1 %E0.0    L2 %E0.1    L3 %E0.2
AMPEL_Rot %A0.0    AMPEL_Gruen %A0.1` },
      { t: 'hinweis', text: 'Die Belegung ist beliebig („andere Belegung möglich“). Vorsicht (Vorlesung): Bits werden von rechts nach links nummeriert (Bit 7 … 0), Bytes von links nach rechts. Ein Byte hat 8 Bit.' },
    ],
  },
  {
    id: 'sps-schliesser-oeffner',
    bereich: 'sps',
    titel: 'Schließer (NO) und Öffner (NC), Drahtbruchsicherheit',
    quellen: 'K2 S3 (Taster/Endschalter) · Vorlesung 09',
    stichworte: 'sps no nc schließer öffner normally open normally closed taster endschalter drahtbruch drahtbruchsicher sicherheit signal ruhezustand',
    frage: 'EIN-Taster (NO), AUS-Taster (NC), Endschalter (Öffner): Was heißt das für das Eingangssignal?',
    antwort: [
      { t: 'tabelle', kopf: ['Bauart', 'Englisch', 'Ruhezustand', 'betätigt'], zeilen: [
        ['Schließer', 'NO – Normally Open', 'Signal 0', 'Signal 1'],
        ['Öffner', 'NC – Normally Closed', 'Signal 1', 'Signal 0'],
      ] },
      { t: 'liste', items: [
        'EIN-Taster (NO): Eingang ist 1, solange gedrückt. Direkt an S (Setzen) anschließen.',
        'AUS-Taster (NC): Eingang ist normalerweise 1 und wird beim Drücken 0. Deshalb am Reset-Eingang negiert (Kreis) anschließen: R1 wirkt bei Signal 0.',
        'Endschalter (Öffner): Bühne oben bzw. unten ⇒ ES_oben = 0 bzw. ES_unten = 0. Im UND-Glied ohne Negation: Bewegung nur, solange ES = 1.',
      ] },
      { t: 'zwischen', text: 'Warum Öffner für AUS/Endschalter (Zusatz)' },
      { t: 'p', text: 'Drahtbruchsicherheit: Bei Leitungsbruch oder abgefallener Klemme sieht die SPS Signal 0, genau wie bei betätigtem Öffner. Die Anlage geht dann in den sicheren Zustand (AUS). Bei einem Schließer als AUS-Taster würde ein Drahtbruch unbemerkt bleiben.' },
      { t: 'hinweis', text: 'Aufgabentext K2: EIN-Taster NO, AUS-Taster NC, Hoch-/Runter-Taster NO, Endschalter Öffner (NC). Genau so müssen sie im FUP eingezeichnet werden. Die Drahtbruchsicherheit steht nicht in den Unterlagen als Frage, ist allgemeines Wissen.' },
    ],
  },
  {
    id: 'sps-selbsthaltung',
    bereich: 'sps',
    titel: 'Selbsthaltung, SR/RS-Flipflop, „Aus vor Ein“',
    quellen: 'K2 S3 · Vorlesung 09',
    stichworte: 'sps selbsthaltung speicher flipflop sr rs setzen rücksetzen dominant aus vor ein ausschalten vor einschalten merkregel sicherheit verriegelung speicherndes element',
    frage: 'Steuerung EIN (speicherndes Element). Welche Merkregel bezüglich des Einschaltens und Ausschaltens kennen Sie (Thema Sicherheit)?',
    antwort: [
      { t: 'p', text: 'Merkregel: „Ausschalten vor Einschalten“ („Aus vor Ein“). Werden EIN und AUS gleichzeitig betätigt, muss die Anlage ausgehen. Das Ausschalten hat Vorrang.' },
      { t: 'zwischen', text: 'Speicherndes Element: 1-Bit-Speicher' },
      { t: 'tabelle', kopf: ['Baustein', 'S – Setzen', 'R – Rücksetzen', 'S und R gleichzeitig'], zeilen: [
        ['SR-Flipflop', 'Ausgang 1', 'Ausgang 0', 'Rücksetzen dominant (Ausgang 0)'],
        ['RS-Flipflop', 'Ausgang 1', 'Ausgang 0', 'Setzen dominant (Ausgang 1)'],
      ] },
      { t: 'p', text: 'Für „Aus vor Ein“ also das SR-Flipflop (Rücksetzen dominant) nehmen.' },
      { t: 'hinweis', text: 'Vorlesung: In ABB Freelance ist es genau umgekehrt (SR setzt dominant, RS rücksetzt dominant). Bei Siemens (TIA) gilt die Aussage oben.' },
      { t: 'zwischen', text: 'Alternative ohne Flipflop (Selbsthaltung mit UND/ODER)' },
      { t: 'formel', text: 'Q = (EIN ∨ Q) ∧ AUS_Signal' },
      { t: 'p', text: 'Der Ausgang Q wird zu einem Eingang des ODER zurückgeführt und hält sich damit selbst. Ein AUS_Signal von 0 (Öffner gedrückt) sperrt das UND, also Aus vor Ein.' },
      { t: 'link', ziel: 'sps-logik', text: 'Rechner: Wahrheitstabelle → Gatterlogik' },
      { t: 'hinweis', text: 'Die Musterlösung K2 zeichnet das SR-Flipflop mit R1 negiert (siehe Antwort „Hebebühne“). Die Formel mit ODER/UND ist die gleichwertige Schreibweise, eigene Herleitung.' },
    ],
  },
  {
    id: 'sps-hebebuehne',
    bereich: 'sps',
    titel: 'Hebebühne: FUP für EIN, Motor Hoch, Motor Runter',
    quellen: 'K2 S3 (6 P)',
    punkte: 6,
    stichworte: 'sps hebebühne hebebuehne fup motor hoch runter endschalter taster selbsthaltung verriegelung steuerung ein meldeleuchte aus vor ein',
    frage: 'Zeichnen Sie in FUP: 1. Steuerung EIN (speicherndes Element) 2. Ansteuerung Motor Hoch 3. Ansteuerung Motor Runter. Motor nicht gleichzeitig Hoch und Runter; Bühne bewegt sich nur, wenn ein Taster gedrückt ist und die Anlage eingeschaltet ist. Merkregel? Bedeutung von %A5.3 „Meldeleuchte“?',
    antwort: [
      { t: 'zwischen', text: 'Belegung (Musterlösung, andere möglich)' },
      { t: 'tabelle', kopf: ['Adresse', 'Beschreibung', 'Adresse', 'Beschreibung'], zeilen: [
        ['E0.0', 'ES_oben (NC)', 'A0.0', 'Motor Hoch'],
        ['E0.1', 'ES_unten (NC)', 'A0.1', 'Motor Runter'],
        ['E0.2', 'Knopf EIN (NO)', 'A0.4', 'Meldeleuchte Steuerung EIN'],
        ['E0.3', 'Knopf AUS (NC)', 'M0.0', 'Steuerung_Ein (Merker)'],
        ['E0.4', 'Knopf HOCH (NO)', '', ''],
        ['E0.5', 'Knopf RUNTER (NO)', '', ''],
      ] },
      { t: 'zwischen', text: '1. Steuerung EIN (1 P)' },
      { t: 'svg', svg: SVG_SR, unterschrift: 'Netzwerk 1: SR-Flipflop mit Meldeleuchte' },
      { t: 'zwischen', text: '2. Motor Hoch (1,5 P)' },
      { t: 'formel', text: 'Motor_HOCH = Steuerung_Ein ∧ Knopf_HOCH ∧ ES_oben ∧ ¬Motor_RUNTER ∧ ¬Knopf_RUNTER' },
      { t: 'svg', svg: SVG_HOCH, unterschrift: 'Netzwerk 2: Bühne hoch (UND-Glied mit 5 Eingängen)' },
      { t: 'zwischen', text: '3. Motor Runter (1,5 P)' },
      { t: 'formel', text: 'Motor_RUNTER = Steuerung_Ein ∧ Knopf_RUNTER ∧ ES_unten ∧ ¬Motor_HOCH ∧ ¬Knopf_HOCH' },
      { t: 'liste', items: [
        'Steuerung_Ein: Bühne bewegt sich nur, wenn die Anlage eingeschaltet ist.',
        'Knopf gedrückt: Bewegung nur, solange der Taster gedrückt ist.',
        'ES_oben / ES_unten sind Öffner: normalerweise 1, am Endanschlag 0 ⇒ ohne Negation ins UND.',
        'Verriegelung: ¬Motor_RUNTER bzw. ¬Motor_HOCH und der jeweils andere Taster negiert, damit der Motor nie gleichzeitig hoch und runter angesteuert wird.',
      ] },
      { t: 'zwischen', text: 'Fragen (je 1 P)' },
      { t: 'liste', items: [
        'Merkregel: „Ausschalten vor Einschalten“ („Aus vor Ein“).',
        '%A5.3 „Meldeleuchte“: A = Ausgang, 5 = Byteadresse, 3 = Bitadresse, Meldeleuchte = Variablenname in der SPS.',
      ] },
      { t: 'hinweis', text: 'In der Aufgabe K2 gibt es keine Meldeleuchten für Hoch und Runter. Die Musterlösung hat sie durchgestrichen. Nur die System-Lampe (EIN/AUS) %A0.4 zeichnen. Die Lösung steht in der Musterlösung nur als Bildschirmfoto aus TIA, daher die Skizzen hier in eigener Zeichnung.' },
    ],
  },
  {
    id: 'sps-luefter',
    bereich: 'sps',
    titel: 'Lüfter-Ampel: Logiktabelle und Schaltnetz (≥ 2 von 3)',
    quellen: 'K1 S3 (6 P)',
    punkte: 6,
    stichworte: 'sps lüfter luefter ampel tunnel rot grün gruen wahrheitstabelle logiktabelle fup schaltnetz mehrheit 2 aus 3 kohlenmonoxid',
    frage: 'Drei Lüfter L1, L2, L3. AMPEL_Rot: kein oder nur ein Lüfter läuft. AMPEL_Gruen: zwei oder alle drei laufen. Logiktabelle, Schaltung in FUP, Adressbelegung (%Ex.y, %Ax.y).',
    antwort: [
      { t: 'zwischen', text: 'Vorgehen: 1. Tabelle, 2. Schaltung, 3. Adressen' },
      { t: 'tabelle', kopf: ['L3', 'L2', 'L1', 'dez', 'Rot', 'Grün'], zeilen: [
        ['0', '0', '0', '0', '1', '0'],
        ['0', '0', '1', '1', '1', '0'],
        ['0', '1', '0', '2', '1', '0'],
        ['0', '1', '1', '3', '0', '1'],
        ['1', '0', '0', '4', '1', '0'],
        ['1', '0', '1', '5', '0', '1'],
        ['1', '1', '0', '6', '0', '1'],
        ['1', '1', '1', '7', '0', '1'],
      ] },
      { t: 'formel', text: `Grün = L1·L2 + L1·L3 + L2·L3     (mindestens zwei laufen)
Rot  = NICHT Grün
     = ¬L1·¬L2·¬L3 + L1·¬L2·¬L3 + ¬L1·L2·¬L3 + ¬L1·¬L2·L3   (Musterlösung: 4 UND, 1 ODER)` },
      { t: 'svg', svg: SVG_GRUEN, unterschrift: 'Schaltnetz Grün (3 UND, 1 ODER) und Rot als Negation' },
      { t: 'zwischen', text: 'Adressen (Beispiel)' },
      { t: 'formel', text: `Eingänge:  L1 = %E0.0   L2 = %E0.1   L3 = %E0.2
Ausgänge:  AMPEL_Rot = %A0.0   AMPEL_Gruen = %A0.1` },
      { t: 'p', text: 'x = Byteadresse, y = Bitadresse.' },
      { t: 'link', ziel: 'sps-logik', text: 'Rechner: Wahrheitstabelle → Gatterlogik' },
      { t: 'hinweis', text: 'Die Musterlösung zeichnet beide Ausgänge als Disjunktion der Einsen-Zeilen (Rot 4 UND-Glieder mit Negationspunkten, Grün ebenso 4 UND mit je 3 Eingängen: 011, 101, 110, 111). Die kurze Form oben ist gleichwertig und schneller zu zeichnen. Rot als Negation von Grün ist die kürzeste Lösung. Im Zweifel die Form der Musterlösung zeichnen.' },
    ],
  },
  {
    id: 'sps-zahlen-bitfolge',
    bereich: 'sps',
    titel: 'Bitfolge umrechnen: UINT8, INT8, BCD',
    quellen: 'K3 S3 (6 P)',
    punkte: 6,
    stichworte: 'sps zahlendarstellung uint int bcd zweierkomplement bitfolge 1001.1011 pseudotetrade binary coded decimal 0100.0010 42 155 -101',
    frage: 'Bitfolge 1001.1011 als 1) UINT 8 bit, 2) INT 8 bit, 3) BCD 8 bit in Dezimal umrechnen. Was fällt bei 3) auf? Alternativ mit 0100.0010.',
    antwort: [
      { t: 'formel', text: `1001.1011 = 128 + 16 + 8 + 2 + 1
1) UINT (vorzeichenlos):  155
2) INT (Zweierkomplement): −128 + 16 + 8 + 2 + 1 = −101
   (erstes Bit = Vorzeichenbit, Wertigkeit −128)
3) BCD: 1001 | 1011  →  links 9, rechts 1011 = 11` },
      { t: 'p', text: 'Auffällig bei 3): Die rechte Tetrade 1011 (= 11) ist keine gültige Dezimalziffer. BCD kennt nur 0000 … 1001 (0 … 9). 1010 … 1111 sind Pseudotetraden. Die Bitfolge ist also keine gültige BCD-Zahl.' },
      { t: 'formel', text: `Alternative: 0100.0010  →  4 | 2  →  BCD = 42` },
      { t: 'link', ziel: 'sps-zahlen', text: 'Rechner: UINT / INT / BCD' },
      { t: 'hinweis', text: 'Musterlösung: UINT 155, INT −101 (erstes Zeichen Vorzeichenbit), BCD: Ziffer links 9, Ziffer rechts Pseudotetrade (B), alternativ 42.' },
    ],
  },
  {
    id: 'sps-signalpegel',
    bereich: 'sps',
    titel: 'Binäre Signale, Logikpegel 24 V, Bit und Byte',
    quellen: 'Vorlesung 09',
    stichworte: 'sps binär binaer signale logikpegel 24v bit byte verbotener bereich signalzustand 0 1 digital eingang spannung',
    frage: 'Was sind binäre Signale? Welche Spannungsbereiche gelten bei einer SPS für 0 und 1?',
    antwort: [
      { t: 'liste', items: [
        'Binäre Signale haben nur zwei Werte: logisch 0 (meist LOW-Spannung) und logisch 1 (meist HIGH-Spannung). Auch invertierte Logik ist möglich.',
        'Kleinste Einheit: Bit (Binary Digit). 8 Bit = 1 Byte.',
        'Industrielle SPS arbeitet meist mit 0 V … 24 V. 24 V entspricht der Versorgungsspannung der SPS.',
      ] },
      { t: 'tabelle', kopf: ['Spannung (Eingang)', 'Signalzustand'], zeilen: [
        ['15 V … 30 V', '1'],
        ['5 V … 15 V', 'verbotener Bereich, Signal undefiniert'],
        ['−3 V … 5 V', '0'],
      ] },
      { t: 'p', text: 'SPS können als Steuerung und als (digitaler) Regler eingesetzt werden (Vorlesung 09).' },
      { t: 'hinweis', text: 'Nur Vorlesung 09, in den Klausuren K1 bis K3 nicht gefragt. Grenzen aus der Grafik der Vorlesung (30 V, 15 V, 5 V, −3 V).' },
    ],
  },
];
