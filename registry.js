// Alle Inhalte der App. Neue Rechner/Seiten hier eintragen, dann tauchen sie in Navigation und Suche auf.
// bereich: theorie | python | sps | vorlesung · fertig: false → „kommt bald“

export const BEREICHE = [
  { id: 'theorie', titel: 'Theorie', info: 'Rechner für Aufgaben 1–15' },
  { id: 'python', titel: 'Python', info: 'Ausgabe-Fragen, Lückentexte' },
  { id: 'sps', titel: 'SPS', info: 'Logik, Zahlenformate' },
  { id: 'vorlesung', titel: 'Vorlesung', info: 'Nachschlagen V01–V11' },
];

// Vorlesungen für die Gruppierung im Bereich „Vorlesung“ (Einträge in app/inhalte/vorlesung-*.js)
export const VORLESUNGEN = [
  { id: 'V01', titel: 'Einführung in die Regelungstechnik' },
  { id: 'V02', titel: 'Laplace-Transformation, Einführung Python' },
  { id: 'V03', titel: 'Signalflussplan, Frequenzbereich, Übertragungsglieder' },
  { id: 'V04', titel: 'Regelstrecken, Regler, Reglerentwurf' },
  { id: 'V05', titel: 'Stationäre Genauigkeit, Stabilität, Gütefunktionen' },
  { id: 'V06', titel: 'Reglerentwurf, Einstellregeln für PID-Regler' },
  { id: 'V07', titel: 'Besondere Strukturen (Störgrößenaufschaltung, Kaskade, Vorfilter)' },
  { id: 'V08', titel: 'Hurwitz-Kriterium, Zustandsraumdarstellung' },
  { id: 'V09', titel: 'SPS: Aufbau, zyklische Arbeitsweise, Programmierung' },
];

export const EINTRAEGE = [
  { id: 'hurwitz', bereich: 'theorie', titel: 'Hurwitz-Kriterium', info: 'H₁…Hₙ mit Rechenweg, K_R-Bereich',
    stichworte: 'stabilität stabil determinante unterdeterminante kr k_r p-regler geschlossener kreis', fertig: true },
  { id: 'polynom', bereich: 'theorie', titel: 'Polynom & Polstellen', info: 'Polynomdivision, pq-Formel, Pole/Nullstellen',
    stichworte: 'nullstellen pole polstellen polynomdivision pq abc mitternachtsformel wurzel produktdarstellung bekannte polstelle stabil a11 zero pole', fertig: true },
  { id: 'dgl', bereich: 'theorie', titel: 'DGL → G(s)', info: 'Laplace, Nullstellen von Z(s)',
    stichworte: 'differentialgleichung laplace übertragungsfunktion differentiationssatz zähler nenner nullstellen a10 stabilität', fertig: true },
  { id: 'regelkreis', bereich: 'theorie', titel: 'Regelkreis & Endwertsatz', info: 'G₀, G_W, G_Z, bleibende Regelabweichung, Vorfilter',
    stichworte: 'endwertsatz führung störung sprung rampe parabel regelabweichung stationär genau integrator typ führungsübertragungsfunktion störübertragungsfunktion vorfilter vorsteuerung g_wun i-regler', fertig: true },
  { id: 'signalfluss', bereich: 'theorie', titel: 'Signalfluss', info: 'Bausteine oder Hilfsgrößen → G, G_W, G_Z',
    stichworte: 'blockschaltbild signalflussbild gegenkopplung mitkopplung hilfsgröße reihe parallel rückführung störgrößenaufschaltung führungsübertragungsfunktion störübertragungsfunktion a12', fertig: true },
  { id: 'pbz', bereich: 'theorie', titel: 'PBZ & Sprungantwort', info: 'Partialbruchzerlegung, h(t), inverse Laplace (A6)',
    stichworte: 'partialbruch partialbruchzerlegung rücktransformation korrespondenz pt1 h(t) sprungantwort inverse laplace cosh sinh zuhaltemethode koeffizientenvergleich', fertig: true },
  { id: 'netzwerk', bereich: 'theorie', titel: 'RC/RL/RLC-Netzwerk', info: 'DGL + G(s) symbolisch, Spannungsteiler, DT1/PT1/PT2',
    stichworte: 'widerstand kondensator spule impedanz dt1 pt1 pt2 rc rl rlc schwingkreis maschengleichung spannungsteiler elektrisches netzwerk a13', fertig: true },
  { id: 'zustandsraum', bereich: 'theorie', titel: 'Zustandsraum (RNF)', info: 'A, b, cᵀ, d aus G(s), Dimensionen, SISO/MIMO',
    stichworte: 'regelungsnormalform rnf zustandsraumdarstellung matrix systemmatrix tf2ss ss siso mimo durchgangsmatrix beobachtungsnormalform bnf', fertig: true },
  { id: 'matrix', bereich: 'theorie', titel: 'Matrizen', info: 'Produkt, Determinante, Inverse',
    stichworte: 'sarrus laplace-entwicklung multiplikation determinante inverse produkt dimension adjunkte', fertig: true },
  { id: 'linearisierung', bereich: 'theorie', titel: 'Linearisierung', info: 'Tangente im Arbeitspunkt, Fehler',
    stichworte: 'arbeitspunkt taylor tangente fehler wurzel', fertig: true },
  { id: 'pid', bereich: 'theorie', titel: 'PID-Einstellregeln', info: 'T-Summe, CHR, Ziegler-Nichols, Kompensation',
    stichworte: 'chien hrones reswick ziegler nichols t-summe kompensation regler einstellen tu tg verzugszeit ausgleichszeit summenzeitkonstante kennwerte', fertig: true },
  { id: 'python-lueckentext', bereich: 'python', titel: 'Lückentext Jupyter', info: 'K1–K3 mit Lösung, Trainer, Spickzettel „Welche Lücke?“',
    stichworte: 'python lückentext jupyter notebook numpy control tf zero pole step tf2ss ss expand sympy plt show ylabel koeffizienten p3 aufgabe 3 lücke spickzettel', fertig: true },
  { id: 'sps-logik', bereich: 'sps', titel: 'Wahrheitstabelle → Logik', info: 'Tabelle antippen → DNF, KV, FUP, Adressen; Selbsthaltung',
    stichworte: 'und oder nicht xor nand nor gatter fup kop wahrheitstabelle logiktabelle kv diagramm minterm dnf lüfter ampel selbsthaltung verriegelung sr rs aus vor ein hebebühne %e %a adresse', fertig: true },
  { id: 'sps-zahlen', bereich: 'sps', titel: 'Zahlenformate', info: 'UINT, INT (Zweierkomplement), BCD – 8/16 Bit',
    stichworte: 'uint int bcd zweierkomplement pseudotetrade tetrade bitfolge binär dezimal hex vorzeichen', fertig: true },
];
