// Python-Lückentexte (Aufgabe P3) aus K1 (28.03.2022), K2 (19.12.2022), K3 (22.12.2023).
// Code exakt wie im Klausur-PDF (Zeilen, Einrückung, Kommentare). Lücken stehen als <01>, <02> … in den Zeilen.
// Lösungen gegen die Musterlösungs-PDFs und README geprüft.

export const LUECKENTEXTE = [
  {
    id: 'K1',
    titel: 'K1 · 28.03.2022',
    punkte: 5,
    aufgabe: 'Aufgabe 3 (5 Punkte)',
    gs: 'G(s) = (294s³ + 161s² + 24s + 1) / (1440s⁴ + 988s³ + 245s² + 26s + 1)',
    bewertung: 'Je 2 Elemente geben 1 Punkt. Kommata bei <02> wichtig (Punktabzug bei Fehler). () bei show weglassen: kein Punktabzug.',
    hinweis: 'Im Original steht „From control.matlab import *“ mit großem F (Tippfehler der Klausur, in Python wäre es klein). Hier wie im Original abgetippt.',
    zeilen: [
      '# numpy Bibliothek',
      'import numpy as np',
      '# control Toolbox',
      'import <01>',
      'From control.matlab import *',
      '# Bibliothek für plots',
      'import matplotlib.pyplot as plt',
      'import matplotlib',
      '# Zeichne Plots in das Notebook',
      '%matplotlib inline',
      '',
      '# Koeffizienten: numpy array erzeugen',
      'num = np.array([<02>]) # Zaehler',
      'den = np.array([1440, <03>, 245, 26, 1]) # Nenner',
      '',
      '# Uebertragungsfunktion erstellen',
      'G_s = <04>(num, <05>)',
      '',
      '# Uebertragungsfunktion anzeigen',
      'G_s',
      '',
      '# Nullstellen berechnen',
      'Null = <06>(G_s)',
      'Null',
      '',
      '# Polstellen berechnen',
      'Pole = pole(<07>)',
      'Pole',
      '',
      '# Sprungantwort des Systems berechnen',
      'h, t = <08>(G_s)',
      '',
      'flabel = "Sprungantwort"',
      'plt.plot(<09>, h, label=flabel, color="red")',
      "plt.xlabel('t [s]')",
      "plt.ylabel('h(t)')",
      "plt.title('Sprungantwort', fontsize=12)",
      'plt.grid()',
      'plt.legend()',
      '',
      'plt.<10>()',
    ],
    luecken: {
      '01': { loesung: 'control', grund: 'Die control-Toolbox (Python Control Systems Library) liefert die regelungstechnischen Funktionen. Kommentar darüber: „control Toolbox“.' },
      '02': { loesung: '294, 161, 24, 1', grund: 'Zählerkoeffizienten aus G(s), höchste Potenz zuerst: 294s³ + 161s² + 24s + 1. Kommata zwischen den Zahlen sind Pflicht.' },
      '03': { loesung: '988', grund: 'Nennerkoeffizient vor s³: 1440s⁴ + 988s³ + 245s² + 26s + 1, passt zur Reihenfolge [1440, ?, 245, 26, 1].' },
      '04': { loesung: 'tf', grund: 'tf = transfer function, erzeugt G(s) aus Zähler- und Nennerkoeffizienten.' },
      '05': { loesung: 'den', grund: 'Zweites Argument von tf ist der Nenner; die Variable heißt hier den (Zeile darüber), der Zähler heißt num.' },
      '06': { loesung: 'zero', grund: 'zero(G_s) berechnet die Nullstellen (Kommentar „Nullstellen berechnen“, Ergebnis heißt Null).' },
      '07': { loesung: 'G_s', grund: 'pole(…) bekommt das System, hier die Übertragungsfunktion G_s.' },
      '08': { loesung: 'step', grund: 'step liefert die Sprungantwort: h = Ausgangswerte, t = Zeitvektor („h, t = …“).' },
      '09': { loesung: 't', grund: 'plt.plot(x, y): x ist der Zeitvektor t aus Zeile h, t = step(G_s), y ist h.' },
      '10': { loesung: 'show', grund: 'plt.show() zeigt den Plot an (letzte Zeile nach grid und legend).', auch: ['show()'] },
    },
  },
  {
    id: 'K2',
    titel: 'K2 · 19.12.2022',
    punkte: 4,
    aufgabe: 'Aufgabe 3 (4 Punkte)',
    gs: 'G(s) = (495s³ + 199s² + 25s + 1) / (190080s⁴ + 40212s³ + 2991s² + 92s + 1)',
    bewertung: 'Je 2 Elemente geben 1 Punkt. Kommata bei <03> wichtig (Punktabzug bei Fehler), hier kein Komma. () bei show weglassen: kein Punktabzug.',
    zeilen: [
      '# numpy Bibliothek (Rechnen mit Vektoren und Matrizen)',
      'import <01> as np',
      '# sympy Paket (Symbolische Mathematik)',
      'import sympy as sp',
      '',
      '# control Toolbox für Regelungstechnische Funktionen',
      'import control',
      '# Namespace (Funktionen direkt verwenden, z.B. tf() anstatt control.matlab.tf())',
      'from   control.matlab import *',
      '',
      '# Bibliothek für Plots',
      'import matplotlib.pyplot as plt',
      'import matplotlib',
      '# Zeichne Plots in das Notebook',
      '%matplotlib inline',
      '',
      '<02> = np.array([495, 199, 25, 1]) # Zaehler',
      'nenner = np.array([<03>, 40212, 2991, 92, 1]) # Nenner',
      '',
      '# Uebertragungsfunktion erstellen',
      '<04> = tf(zaehler, nenner)',
      '',
      '# Uebertragungsfunktion anzeigen',
      'G_s',
      '',
      '# Nullstellen berechnen',
      'Null = zero(<05>)',
      'Null',
      '',
      '# Polstellen berechnen',
      'Pole = <06>(G_s)',
      'Pole',
      '',
      '# Sprungantwort plotten',
      'h, <07> = step(G_s)',
      '',
      'flabel = "Sprungantwort"',
      'plt.plot(t, h, label=flabel, color="red")',
      "plt.xlabel('t [s]')",
      "plt.ylabel('h(t)')",
      "plt.title('Sprungantwort', fontsize=12)",
      'plt.grid()',
      'plt.legend()',
      '',
      'plt.<08>()',
    ],
    luecken: {
      '01': { loesung: 'numpy', grund: 'Kommentar: „numpy Bibliothek (Rechnen mit Vektoren und Matrizen)“. Danach „as np“, daher np.array.' },
      '02': { loesung: 'zaehler', grund: 'Variablenname des Zählers: wird zwei Zeilen weiter unten in tf(zaehler, nenner) verwendet (ohne Umlaut).' },
      '03': { loesung: '190080', grund: 'Nennerkoeffizient vor s⁴ aus G(s). Kein Komma dahinter, das steht schon im Code.' },
      '04': { loesung: 'G_s', grund: 'Name der Übertragungsfunktion: wird in den folgenden Zeilen als G_s angezeigt und verwendet.' },
      '05': { loesung: 'G_s', grund: 'zero(…) bekommt die Übertragungsfunktion G_s und berechnet daraus die Nullstellen.' },
      '06': { loesung: 'pole', grund: 'pole(G_s) berechnet die Polstellen (Kommentar „Polstellen berechnen“, Ergebnis heißt Pole).' },
      '07': { loesung: 't', grund: 'step liefert h und den Zeitvektor t; weiter unten steht plt.plot(t, h, …).' },
      '08': { loesung: 'show', grund: 'plt.show() zeigt den Plot an.', auch: ['show()'] },
    },
  },
  {
    id: 'K3',
    titel: 'K3 · 22.12.2023',
    punkte: 5,
    aufgabe: 'Aufgabe 3 (5 Punkte)',
    gs: 'Gu(s) = 1 / ((1s+1)(3s+1)(5s+1)(7s+1)) = 1 / (105s⁴ + 176s³ + 86s² + 16s + 1), dann Zustandsraum',
    bewertung: '0,5 Punkte pro Element. <03> expand: Befehl in Notebook.',
    zeilen: [
      '# numpy Bibliothek (Rechnen mit Vektoren und Matrizen)',
      'import <01> as np',
      '# sympy Paket (Symbolische Mathematik)',
      'import sympy as sp',
      '# control Toolbox für Regelungstechnische Funktionen',
      'import <02>',
      '# Namespace (Funktionen direkt verwenden, z.B. tf() anstatt control.matlab.tf())',
      'from   control.matlab import *',
      '# Bibliothek für Plots',
      'import matplotlib.pyplot as plt',
      'import matplotlib',
      '',
      '# Symbole definieren',
      "s = sp.Symbol('s')",
      '# Definiere Gu_s (stabil) in sympy',
      'Gu_s = 1 / ((1*s+1)*(3*s+1)*(5*s+1)*(7*s+1))',
      '# Gu_s ausmultiplizieren',
      'Gu_s_poly = sp.<03>(Gu_s)',
      '# Gebe Gu_s_poly in der Console aus',
      'print(Gu_s_poly)',
      '# Ausgabe',
      '# 1/(105*s**4 + 176*s**3 + 86*s**2 + 16*s + 1)',
      '',
      '# Übertragungsfunktion aufstellen (control Paket)',
      'b0 = 1; a4 = <04>; a3 = 176; a2 = <05>; a1 = 16; a0 = 1',
      'Gu1_s = tf([1], [a4, a3, a2, a1, <06>])',
      '# Übertragungsfunktion ausgeben',
      'print(Gu1_s)',
      '# Wandlung in den Zustandsraum',
      '# state space (ss)',
      'Gu1_ss = <07>(Gu1_s)',
      '# Systemmatrix A (4x4)',
      'Gu1_ss.A',
      '# Pole berechnen',
      'Gu1_ss.<08>()',
      '',
      '# Sprungantwort plotten (Zustandsraumdarstellung)',
      'h, t = <09>(Gu1_ss)',
      'flabel = "Sprungantwort"',
      'plt.plot(t, h, label=flabel, color="red")',
      "plt.xlabel('t [s]')",
      "plt.<10>('h(t)')",
      "plt.title('Sprungantwort', fontsize=12)",
      'plt.grid()',
      'plt.legend()',
      'plt.show()',
    ],
    luecken: {
      '01': { loesung: 'numpy', grund: 'Kommentar: „numpy Bibliothek“; danach „as np“.' },
      '02': { loesung: 'control', grund: 'Kommentar: „control Toolbox“. Darunter steht from control.matlab import *, das Paket heißt also control.' },
      '03': { loesung: 'expand', grund: 'sp.expand multipliziert das Produkt aus (Kommentar „ausmultiplizieren“). Ausgabe ist der Nennerpolynom-Ausdruck mit 105*s**4 + …' },
      '04': { loesung: '105', grund: 'a4 = Koeffizient von s⁴ aus der Ausgabe 105*s**4 + 176*s**3 + …; (1·3·5·7 = 105).' },
      '05': { loesung: '86', grund: 'a2 = Koeffizient von s² aus der Ausgabe: 86*s**2.' },
      '06': { loesung: 'a0', grund: 'Letzter Nennerkoeffizient in [a4, a3, a2, a1, …] ist a0 (a0 = 1 steht eine Zeile darüber).' },
      '07': { loesung: 'tf2ss', grund: 'tf2ss = transfer function to state space, wandelt G(s) in den Zustandsraum um (Kommentar „state space (ss)“).' },
      '08': { loesung: 'pole', grund: 'Gu1_ss.pole() berechnet die Pole des Zustandsraummodells (Kommentar „Pole berechnen“).' },
      '09': { loesung: 'step', grund: 'step liefert die Sprungantwort: „h, t = step(…)“ (Kommentar „Sprungantwort plotten“).' },
      '10': { loesung: 'ylabel', grund: 'plt.ylabel(\'h(t)\') beschriftet die y-Achse; darüber steht plt.xlabel für die x-Achse.' },
    },
  },
];

// Spickzettel „Welche Lücke?“: alles, was in den Klausuren (K1–K3) und in den Vorlesungs-/Übungsunterlagen vorkommt.
// vorkommen: Klausuren, in denen es als Lücke oder im Code steht.
export const SPICKZETTEL = [
  {
    gruppe: 'Pakete importieren',
    eintraege: [
      { name: 'import numpy as np', bedeutung: 'Rechnen mit Vektoren und Matrizen (Arrays). Danach heißt es np.', vorkommen: 'K1 K2 K3 (Lücke)' },
      { name: 'import control', bedeutung: 'Regelungstechnik-Toolbox (Python Control Systems Library).', vorkommen: 'K1 K3 (Lücke)' },
      { name: 'from control.matlab import *', bedeutung: 'Funktionen direkt benutzen: tf() statt control.matlab.tf().', vorkommen: 'K1 K2 K3' },
      { name: 'import sympy as sp', bedeutung: 'Symbolische Mathematik (ausmultiplizieren, Symbole).', vorkommen: 'K2 K3' },
      { name: 'import matplotlib.pyplot as plt', bedeutung: 'Plots zeichnen. Danach heißt es plt.', vorkommen: 'K1 K2 K3' },
      { name: '%matplotlib inline', bedeutung: 'Jupyter-Befehl: Plots erscheinen im Notebook.', vorkommen: 'K1 K2' },
    ],
  },
  {
    gruppe: 'numpy (np.)',
    eintraege: [
      { name: 'np.array([a, b, c])', bedeutung: 'Koeffizienten als Vektor. Höchste Potenz zuerst, Kommata dazwischen, fehlende Potenz als 0.', vorkommen: 'K1 K2 (Lücke: Koeffizienten)' },
      { name: 'np.arange(a, b, h)', bedeutung: 'Zahlenfolge von a bis (ohne) b mit Schrittweite h.', vorkommen: 'Vorlesung' },
      { name: 'np.zeros / np.ones', bedeutung: 'Array voller Nullen / Einsen.', vorkommen: 'Vorlesung' },
      { name: 'np.matmul(A, B)', bedeutung: 'Matrixprodukt.', vorkommen: 'Vorlesung' },
      { name: 'np.multiply(A, B)', bedeutung: 'Elementweises Produkt.', vorkommen: 'Vorlesung' },
      { name: 'np.linalg.inv(A)', bedeutung: 'Inverse Matrix.', vorkommen: 'Vorlesung' },
      { name: 'np.linalg.solve(A, b)', bedeutung: 'Löst A·x = b.', vorkommen: 'Vorlesung' },
      { name: 'np.sin, np.exp', bedeutung: 'Sinus, e-Funktion (auch auf ganze Arrays).', vorkommen: 'Vorlesung' },
    ],
  },
  {
    gruppe: 'control (Regelungstechnik)',
    eintraege: [
      { name: 'tf(num, den)', bedeutung: 'transfer function: erzeugt G(s) aus Zähler und Nenner. Kommt als Lücke oft vor.', vorkommen: 'K1 K2 K3 (Lücke)' },
      { name: 'zero(G_s)', bedeutung: 'Nullstellen der Übertragungsfunktion (Wurzeln des Zählers).', vorkommen: 'K1 (Lücke) K2' },
      { name: 'pole(G_s)', bedeutung: 'Polstellen (Wurzeln des Nenners). Bei Zustandsraum: Gu1_ss.pole().', vorkommen: 'K1 K2 K3 (Lücke)' },
      { name: 'step(G_s)', bedeutung: 'Sprungantwort. Gibt h (Werte) und t (Zeit) zurück: h, t = step(…).', vorkommen: 'K1 K2 K3 (Lücke)' },
      { name: 'tf2ss(G_s)', bedeutung: 'Übertragungsfunktion → Zustandsraum (transfer function to state space).', vorkommen: 'K3 (Lücke), Vorlesung' },
      { name: 'ss(A, B, C, D)', bedeutung: 'Zustandsraummodell direkt aus den Matrizen (state space). Danach .A .B .C .D abrufbar.', vorkommen: 'Abwandlung möglich' },
      { name: 'ss.A', bedeutung: 'Systemmatrix des Zustandsraummodells (Gu1_ss.A).', vorkommen: 'K3' },
      { name: 'control.tf(...)', bedeutung: 'Dasselbe wie tf, mit Paketname davor, wenn kein from … import * da ist.', vorkommen: 'Vorlesung' },
      { name: 'impulse / bode / feedback', bedeutung: 'Impulsantwort / Bode-Diagramm / Rückkopplung zweier Systeme. Kamen bisher nicht vor, sind aber ähnlich aufgebaut.', vorkommen: 'Abwandlung möglich' },
    ],
  },
  {
    gruppe: 'sympy (sp.)',
    eintraege: [
      { name: "sp.Symbol('s')", bedeutung: 'Legt ein Symbol s an (für symbolisches Rechnen).', vorkommen: 'K3' },
      { name: 'sp.expand(ausdruck)', bedeutung: 'Klammern ausmultiplizieren. Liefert die Polynom-Koeffizienten zum Ablesen.', vorkommen: 'K3 (Lücke)' },
      { name: 'sp.simplify / sp.factor', bedeutung: 'Vereinfachen / in Faktoren zerlegen (Gegenteil von expand). Kamen nicht vor.', vorkommen: 'Abwandlung möglich' },
    ],
  },
  {
    gruppe: 'matplotlib (plt.)',
    eintraege: [
      { name: 'plt.plot(x, y, label=…, color=…)', bedeutung: 'Kurve zeichnen: x = Zeit t, y = h.', vorkommen: 'K1 (Lücke) K2 K3' },
      { name: 'plt.xlabel(…) / plt.ylabel(…)', bedeutung: 'Beschriftung x-Achse / y-Achse.', vorkommen: 'K3 (Lücke) K1 K2' },
      { name: 'plt.title(…, fontsize=12)', bedeutung: 'Überschrift des Plots.', vorkommen: 'K1 K2 K3' },
      { name: 'plt.grid()', bedeutung: 'Gitternetz einblenden.', vorkommen: 'K1 K2 K3' },
      { name: 'plt.legend()', bedeutung: 'Legende (zeigt das label der Kurve).', vorkommen: 'K1 K2 K3' },
      { name: 'plt.show()', bedeutung: 'Plot anzeigen. Immer als letzte Zeile des Plot-Blocks. () weglassen gibt keinen Punktabzug.', vorkommen: 'K1 K2 (Lücke) K3' },
    ],
  },
  {
    gruppe: 'Wie finde ich die Lücke? (Regeln)',
    eintraege: [
      { name: 'Kommentar über der Zeile lesen', bedeutung: '„Nullstellen berechnen“ → zero · „Polstellen“ → pole · „Sprungantwort“ → step · „Zustandsraum“ → tf2ss · „ausmultiplizieren“ → expand.', vorkommen: 'immer' },
      { name: 'Variablennamen im Code suchen', bedeutung: 'Der Name steht meist an anderer Stelle schon (z. B. zaehler, den, G_s, t). Lücke = derselbe Name, gleiche Schreibweise (Python unterscheidet Groß/Klein).', vorkommen: 'immer' },
      { name: 'Koeffizienten aus G(s) ablesen', bedeutung: 'Höchste Potenz zuerst, Kommata, fehlende Potenz = 0. Zähler: im Zähler von G(s), Nenner: im Nenner.', vorkommen: 'K1 K2 K3' },
      { name: 'Namen vor und nach as', bedeutung: 'import numpy as np → np.… Der Name nach as ist die Abkürzung, die Lücke vor as ist der Paketname.', vorkommen: 'K1 K2 K3' },
    ],
  },
];

/** Whitespace entfernen: Python-Namen und Zahlen enthalten keine Leerzeichen, nur die Kommaliste ("294, 161" = "294,161"). */
export function normalisiere(s) {
  return String(s ?? '').replace(/\s+/g, '');
}

/** true, wenn Eingabe die Lücke richtig füllt (exakt bis auf Leerzeichen, Groß/Klein zählt). */
export function pruefeLuecke(luecke, eingabe) {
  const e = normalisiere(eingabe);
  if (!e) return false;
  return [luecke.loesung, ...(luecke.auch || [])].some((l) => normalisiere(l) === e);
}

/** Zerlegt eine Codezeile in Teile: String oder { luecke: '01' }. */
export function teileZeile(zeile) {
  const out = [];
  const re = /<(\d\d)>/g;
  let last = 0, m;
  while ((m = re.exec(zeile))) {
    if (m.index > last) out.push(zeile.slice(last, m.index));
    out.push({ luecke: m[1] });
    last = m.index + m[0].length;
  }
  if (last < zeile.length) out.push(zeile.slice(last));
  return out;
}

/** Code mit eingesetzten Lösungen als Text (zum Abtippen/Testen). */
export function codeMitLoesung(lt) {
  return lt.zeilen.map((z) => teileZeile(z).map((t) => typeof t === 'string' ? t : lt.luecken[t.luecke].loesung).join('')).join('\n');
}
