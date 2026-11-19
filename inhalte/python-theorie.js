// Musterantworten Python (P1, P2, Spickzettel) – Format: tools/inhalte-format.md
export const ANTWORTEN = [
  {
    id: 'python-interpreter-pip',
    bereich: 'python',
    titel: 'Interpreter oder Compiler? Pakete installieren (pip)',
    quellen: 'K1 P1 · K2 P1 · K3 P1',
    punkte: 2,
    stichworte: 'python interpreter compiler pip install control paket nachinstallieren konsole kommandozeile',
    frage: 'Benötigt man zur Ausführung eines Python-Programmes einen Compiler oder einen Interpreter? Mit welchem Hilfsprogramm / Kommandozeilenprogramm können Pakete nachinstalliert werden? Befehl für das „control“-Paket?',
    antwort: [
      { t: 'liste', items: [
        'Python braucht einen Interpreter (kein Compiler). Der Interpreter führt den Quelltext Zeile für Zeile aus.',
        'Das Kommandozeilenprogramm heißt pip (Python installs Packages).',
      ] },
      { t: 'formel', text: '$ pip install control' },
      { t: 'hinweis', text: 'Musterlösung: pro Antwort 1 Punkt. K1 fragt nach Interpreter und pip (z. B. „pip install control“). K2 und K3 fragen nur nach pip und dem Befehl für „control“.' },
    ],
  },
  {
    id: 'python-ausgabe-k1',
    bereich: 'python',
    titel: 'Programm-Ausgabe K1: Liste, range, len, append',
    quellen: 'K1 P2 (3 P)',
    punkte: 3,
    stichworte: 'python ausgabe programm liste index range for len append print eins 3.0 länge zweite_liste',
    frage: 'Notieren Sie die Ausgabe des Programms (8 Zeilen).',
    antwort: [
      { t: 'zwischen', text: 'Programm (K1)' },
      { t: 'formel', text: `# Listenverständnis
eine_Liste = ['eins', 2, 3.0, "vier", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]]
zweite_Liste = [1, 2, 3]

# Ausgabe
print(eine_Liste[0])
print(eine_Liste[2])

teil_Liste = eine_Liste[4]
for i in range(2,6,1):
    print(teil_Liste[i])

print("Länge von zweite_Liste =", len(zweite_Liste))
zweite_Liste.append(4)
print("Länge von zweite_Liste =", len(zweite_Liste))` },
      { t: 'zwischen', text: 'Ausgabe' },
      { t: 'formel', text: `eins
3.0
2
3
4
5
Länge von zweite_Liste = 3
Länge von zweite_Liste = 4` },
      { t: 'zwischen', text: 'Warum' },
      { t: 'liste', items: [
        'eine_Liste[0] ist das erste Element (Zählung ab 0) → eins (ohne Anführungszeichen, print zeigt den Inhalt).',
        'eine_Liste[2] ist das dritte Element → 3.0 (Fließkommazahl, die Nachkommastelle bleibt).',
        'teil_Liste = eine_Liste[4] ist die innere Liste [0 … 9]. Da Wert = Index, ist teil_Liste[i] = i.',
        'range(2,6,1) = 2, 3, 4, 5 (Start 2, Ende 6 ausgeschlossen, Schritt 1) → vier Zeilen: 2, 3, 4, 5.',
        'len(zweite_Liste) = 3 Elemente → „Länge von zweite_Liste = 3“. print mit Komma trennt die Werte durch ein Leerzeichen.',
        'append(4) hängt hinten an → [1, 2, 3, 4], len = 4.',
      ] },
      { t: 'hinweis', text: 'Musterlösung: pro Fehler 1 Punkt Abzug. Zeilen zählen: 2 + 4 + 2 = 8.' },
    ],
  },
  {
    id: 'python-ausgabe-k2',
    bereich: 'python',
    titel: 'Programm-Ausgabe K2: Liste in Liste, Dictionary',
    quellen: 'K2 P2 (4 P)',
    punkte: 4,
    stichworte: 'python ausgabe programm liste dictionary dict car tree baum eins 6 5 verschachtelt index',
    frage: 'Notieren Sie die Ausgabe des Programms (4 Zeilen).',
    antwort: [
      { t: 'zwischen', text: 'Programm (K2)' },
      { t: 'formel', text: `# Listen und Dictionaries

a_list = ['Eins', 2, 3.0, [4]]
print(a_list[0])
temp = a_list[3][0] + a_list[1]
print(temp)

a_dict = {
    "car" : 5,
    "tree":"Baum"
}
print(a_dict["car"])
print(a_dict["tree"])` },
      { t: 'zwischen', text: 'Ausgabe' },
      { t: 'formel', text: `Eins
6
5
Baum` },
      { t: 'zwischen', text: 'Warum' },
      { t: 'liste', items: [
        'a_list[0] = Eins.',
        'a_list[3] ist die innere Liste [4]; a_list[3][0] ist deren erstes Element = 4. a_list[1] = 2. Summe 4 + 2 = 6.',
        'Beim Dictionary wählt der Schlüssel den Wert: a_dict["car"] = 5, a_dict["tree"] = Baum.',
      ] },
      { t: 'hinweis', text: 'Musterlösung: je richtiger Antwort 1 Punkt.' },
    ],
  },
  {
    id: 'python-ausgabe-k3',
    bereich: 'python',
    titel: 'Programm-Ausgabe K3: Funktion mit Dictionary',
    quellen: 'K3 P2 (3 P)',
    punkte: 3,
    stichworte: 'python ausgabe programm funktion def myfunc dictionary range len eins drei zwei fertig schlüssel',
    frage: 'Notieren Sie die Ausgabe des Programms (4 Zeilen).',
    antwort: [
      { t: 'zwischen', text: 'Programm (K3)' },
      { t: 'formel', text: `# Funktion definieren
def myfunc(mydict):
    mydict_len = len(mydict)
    for i in range(1,mydict_len+1):
        print(mydict[i])
    print("Fertig")

# ein Dictionary definieren
adict = {
    1: "Eins",
    3: "Zwei",
    2: "Drei"
}

myfunc(adict)` },
      { t: 'zwischen', text: 'Ausgabe' },
      { t: 'formel', text: `Eins
Drei
Zwei
Fertig` },
      { t: 'zwischen', text: 'Warum' },
      { t: 'liste', items: [
        'len(adict) = 3 Einträge → range(1, 4) = 1, 2, 3.',
        'Der Schlüssel zählt, nicht die Reihenfolge im Text: 1 → Eins, 2 → Drei, 3 → Zwei.',
        'print("Fertig") steht eine Ebene weiter links (Einrückung 4) als print(mydict[i]). Es gehört also zur Funktion, aber nicht zur Schleife, und läuft nur einmal am Ende.',
        'myfunc(adict) ganz unten ruft die Funktion auf. Ohne Aufruf gäbe es keine Ausgabe.',
      ] },
      { t: 'hinweis', text: 'Musterlösung: 1 Punkt Abzug pro Fehler.' },
    ],
  },
  {
    id: 'python-spickzettel',
    bereich: 'python',
    titel: 'Python-Spickzettel für „Was gibt das Programm aus?“',
    quellen: 'K1 P2 · K2 P2 · K3 P2',
    stichworte: 'python spickzettel index negativ slicing range len append dict for if print f-string division float ganzzahl',
    frage: 'Hilfe zum Vorhersagen der Ausgabe von Python-Programmen (Listen, Indizes, range, Dictionary, Funktion).',
    antwort: [
      { t: 'zwischen', text: 'Vorgehen' },
      { t: 'liste', nummeriert: true, items: [
        'Zuerst nur Definitionen lesen (def, Listen, Dictionaries). Es passiert noch nichts.',
        'Dann Zeile für Zeile von oben nach unten. Jede print-Zeile ergibt eine Ausgabezeile (Schleife: mehrere).',
        'Die Zeilenzahl aus der Aufgabe („Output von 8 Zeilen“) zur Kontrolle nutzen.',
        'Einrückung = Zugehörigkeit zu for / if / def.',
      ] },
      { t: 'zwischen', text: 'Listen und Indizes' },
      { t: 'formel', text: `L = ['a', 'b', 'c', 'd']
L[0]      → a        erstes Element (Zählung ab 0!)
L[3]      → d        letztes Element bei 4 Stück
L[-1]     → d        negativ = von hinten
L[-2]     → c
L[1:3]    → ['b', 'c']   Slicing: Start bis Ende, Ende NICHT dabei
L[:2]     → ['a', 'b']
L[2:]     → ['c', 'd']
M = [[1, 2], [3, 4]]
M[1][0]   → 3        erst äußere Liste, dann innere
len(L)    → 4        Anzahl der Elemente
L.append('e')        hängt hinten an, len(L) wird 5` },
      { t: 'zwischen', text: 'range(Start, Ende, Schritt)' },
      { t: 'formel', text: `range(5)       → 0, 1, 2, 3, 4      (Start 0, Ende ausgeschlossen)
range(2, 6)    → 2, 3, 4, 5
range(2, 6, 1) → 2, 3, 4, 5        (K1)
range(0, 10, 3)→ 0, 3, 6, 9
range(1, n+1)  → 1 … n             (K3, mit n = 3: 1, 2, 3)` },
      { t: 'zwischen', text: 'Dictionary' },
      { t: 'formel', text: `d = {"car": 5, "tree": "Baum", 1: "Eins"}
d["car"]   → 5          Zugriff über den Schlüssel, nicht über die Position
d[1]       → Eins       Schlüssel dürfen auch Zahlen sein
len(d)     → 3          Anzahl der Einträge
d["x"] = 7              neuen Eintrag anlegen` },
      { t: 'zwischen', text: 'for, if, print' },
      { t: 'formel', text: `for i in range(3):
    print(i)           → 0 / 1 / 2 (je eine Zeile)
if x > 2:
    print("groß")
else:
    print("klein")
print("Länge =", 3)    → Länge = 3   (Komma = ein Leerzeichen dazwischen)
print("a", "b")        → a b
print('eins')          → eins        (Anführungszeichen werden nicht ausgegeben)
print(3.0)             → 3.0` },
      { t: 'zwischen', text: 'Rechnen' },
      { t: 'formel', text: `7 / 2    → 3.5     normale Division, Ergebnis immer Fließkomma
6 / 2    → 3.0     auch hier mit „.0“!
7 // 2   → 3       Ganzzahldivision
7 % 2    → 1       Rest
2 ** 3   → 8       Potenz
4 + 2    → 6       int + int bleibt int
4 + 2.0  → 6.0     int + float wird float
"a" + "b"→ ab      Text zusammenhängen` },
      { t: 'zwischen', text: 'f-String' },
      { t: 'formel', text: `x = 3
print(f"x = {x}")        → x = 3
print(f"{x * 2}")        → 6
print(f"{3.14159:.2f}")  → 3.14   (2 Nachkommastellen)` },
      { t: 'hinweis', text: 'Typische Fallen: Zählung ab 0 · range-Ende nicht dabei · 3.0 bleibt 3.0 · print zeigt Text ohne Anführungszeichen · Dictionary über Schlüssel, nicht über Reihenfolge · Funktion läuft erst nach dem Aufruf.' },
    ],
  },
];
