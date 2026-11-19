// Oberfläche Signalfluss: Bausteine zusammenklicken (Baum) oder Hilfsgrößen-Gleichungen eintippen.
// Rechnet bei jeder Änderung, Formel-Vorschau, Rückgängig, Beispiele aus K1–K3.
import { el } from './dom.js';
import { signalfluss, strukturText } from '../rechner/signalfluss.js';
import { symText } from '../lib/signalfluss-algebra.js';
import { rechenweg, fazit, fehler, tasten } from './render.js';

const B = (name, vz) => (vz ? { typ: 'block', name, vz } : { typ: 'block', name });
const LEER = () => ({ typ: 'leer' });

const BEISPIELE_BAUM = [
  ['K1 A12', 'G', { typ: 'reihe', kinder: [
    { typ: 'gegen', vor: B('G1'), rueck: { typ: 'parallel', kinder: [B('G2'), B('G3', -1)] } },
    { typ: 'parallel', kinder: [B('G2'), B('G4')] }, B('K')] }],
  ['K2 A12 G_W', 'G_W', { typ: 'gegen', vor: { typ: 'reihe', kinder: [B('R'), B('G1'), B('G2')] }, rueck: B('1') }],
  ['K2 A12 G_Z', 'G_Z', { typ: 'reihe', kinder: [
    { typ: 'parallel', kinder: [B('1'), { typ: 'reihe', kinder: [B('A'), B('G1')], vz: -1 }] },
    { typ: 'gegen', vor: B('G2'), rueck: { typ: 'reihe', kinder: [B('R'), B('G1')] } }] }],
  ['K3 A12', 'G', { typ: 'reihe', kinder: [
    { typ: 'gegen', vor: { typ: 'parallel', name: 'G1', kinder: [B('G11'), B('G12')] },
      rueck: { typ: 'parallel', kinder: [B('1'), { typ: 'reihe', name: 'G2', kinder: [B('G21'), B('G22')] }] } },
    B('G2')] }],
  ['Gegenkopplung', 'G', { typ: 'gegen', vor: B('G1'), rueck: B('G2') }],
  ['Mitkopplung', 'G', { typ: 'mit', vor: B('G1'), rueck: B('G2') }],
];

const BEISPIELE_HG = [
  ['K1 A12', 'U', 'Y', ['B = G1G2·A', 'C = G1G3·A', 'D = G1G4·A', 'A = U + C − B', 'Y = K(B + D)']],
  ['K2 A12', 'W, Z', 'X', ['E = W − X', 'H1 = R·E − A·Z', 'H2 = G1·H1 + Z', 'X = G2·H2']],
  ['K3 A12', 'U', 'V', ['E = U − H', 'A = G11·E + G12·E', 'V = G21G22·A', 'H = A + V']],
  ['Regelkreis + Störung', 'W, Z', 'X', ['E = W − X', 'Y = R·E', 'H = G1·Y + Z', 'X = G2·H']],
];

let zustand = {
  modus: 'bausteine', baum: LEER(), ergebnisName: 'G',
  gleichungen: [''], eingaenge: '', ausgang: '', werte: {},
};
try { Object.assign(zustand, JSON.parse(localStorage.getItem('signalfluss') || '{}')); } catch {}

const kopie = (x) => JSON.parse(JSON.stringify(x));
const zeile = (style, ...kids) => el('div', { class: 'tasten', style: 'margin:0;align-items:center;' + (style || '') }, ...kids);
const knopf = (text, onclick, extra = {}) => el('button', { type: 'button', onclick, ...extra }, text);

export function renderSignalfluss(view) {
  const box = el('div');
  view.append(box);
  let aktiv = null;
  let fokusNeu = null;
  const undo = [];

  function speichern() { try { localStorage.setItem('signalfluss', JSON.stringify(zustand)); } catch {} }
  function merken() {
    undo.push(schnappschuss());
    if (undo.length > 60) undo.shift();
  }
  function rueckgaengig() {
    const s = undo.pop();
    if (!s) return;
    Object.assign(zustand, s);
    speichern(); aufbau();
  }

  const vorschau = el('div', { class: 'vorschau' });
  const ergebnis = el('div');
  const werteBox = el('div');
  let werteKey = '';

  const schnappschuss = () => kopie({ baum: zustand.baum, gleichungen: zustand.gleichungen, ergebnisName: zustand.ergebnisName, eingaenge: zustand.eingaenge, ausgang: zustand.ausgang });

  /** Textfeld; beim Verlassen nach einer Änderung wird der Stand von vorher für „Rückgängig“ gemerkt. */
  function textfeld(wert, placeholder, oninput) {
    let vorher = null, vorherText = null;
    const inp = el('input', {
      type: 'text', value: wert || '', placeholder, autocomplete: 'off', autocorrect: 'off',
      autocapitalize: 'off', spellcheck: 'false',
      onfocus: () => { aktiv = inp; vorher = schnappschuss(); vorherText = inp.value; },
      onchange: () => {
        if (vorher && vorherText !== inp.value) { undo.push(vorher); if (undo.length > 60) undo.shift(); }
        vorher = schnappschuss(); vorherText = inp.value;
      },
      oninput: () => oninput(inp.value),
    });
    if (!aktiv) aktiv = inp;
    return inp;
  }

  // ---------- Baum ----------

  /** Ein Knoten des Baums. ort = { ersetzen(neu), loeschen(), inParallel, kind } */
  function knoten(k, ort) {
    const rahmen = el('div', { style: 'border-left:3px solid var(--line);padding:4px 0 4px 10px;margin:6px 0;' });
    const vzKnopf = ort.inParallel
      ? knopf(k.vz === -1 ? '−' : '+', () => { merken(); if (k.vz === -1) delete k.vz; else k.vz = -1; geaendert(true); },
        { style: 'min-width:44px;font-weight:700', title: 'Vorzeichen an der Summationsstelle' })
      : null;
    const weg = knopf('✕', () => { merken(); ort.loeschen(); geaendert(true); }, { title: 'Löschen (mit allem darin)' });

    if (k.typ === 'leer') {
      const neu = (obj) => () => { merken(); ort.ersetzen(obj); if (obj.typ === 'block') fokusNeu = obj; geaendert(true); };
      rahmen.append(zeile('',
        vzKnopf,
        knopf('Block', neu(B(''))),
        knopf('Reihe', neu({ typ: 'reihe', kinder: [LEER(), LEER()] })),
        knopf('Parallel', neu({ typ: 'parallel', kinder: [LEER(), LEER()] })),
        knopf('Gegenkopplung', neu({ typ: 'gegen', vor: LEER(), rueck: LEER() })),
        knopf('Mitkopplung', neu({ typ: 'mit', vor: LEER(), rueck: LEER() })),
        ort.wurzel ? null : weg));
      return rahmen;
    }

    if (k.typ === 'block') {
      const inp = textfeld(k.name, 'z. B. G1, H, R, K, 1', (v) => { k.name = v; geaendert(false); });
      if (fokusNeu === k) setTimeout(() => inp.focus(), 0);
      rahmen.append(zeile('flex-wrap:nowrap;',
        vzKnopf,
        el('label', { class: 'feld', style: 'margin:0;flex:1;min-width:100px' }, inp),
        weg));
      return rahmen;
    }

    // Struktur: Kopfzeile
    const istSchleife = k.typ === 'gegen' || k.typ === 'mit';
    const titel = { reihe: 'Reihe ·', parallel: 'Parallel ±', gegen: 'Gegenkopplung −', mit: 'Mitkopplung +' }[k.typ];
    const nameFeld = textfeld(k.name, ort.wurzel ? 'Ergebnis-Name (G)' : 'Name (optional)', (v) => {
      if (ort.wurzel) zustand.ergebnisName = v || 'G';
      k.name = v; geaendert(false);
    });
    nameFeld.style.height = '44px';
    nameFeld.style.fontSize = '17px';
    rahmen.append(zeile('',
      vzKnopf,
      el('b', { style: 'margin-right:4px' }, titel),
      istSchleife ? knopf('⇄ ' + (k.typ === 'gegen' ? 'Mit' : 'Gegen'), () => { merken(); k.typ = k.typ === 'gegen' ? 'mit' : 'gegen'; geaendert(true); }, { title: 'Vorzeichen der Rückführung tauschen' }) : null,
      el('label', { class: 'feld', style: 'margin:0;width:170px' }, nameFeld),
      weg));

    if (istSchleife) {
      const slot = (key, text) => [
        el('div', { class: 'vorschau', style: 'margin:6px 0 0' }, text),
        knoten(k[key], { ersetzen: (n) => { k[key] = n; }, loeschen: () => { k[key] = LEER(); } }),
      ];
      rahmen.append(...slot('vor', 'Vorwärtszweig G_V'), ...slot('rueck', 'Rückwärtszweig G_R (Rückführung)'));
    } else {
      k.kinder.forEach((c, i) => {
        rahmen.append(knoten(c, {
          inParallel: k.typ === 'parallel',
          ersetzen: (n) => { if (c.vz) n.vz = c.vz; k.kinder[i] = n; },
          loeschen: () => { k.kinder.splice(i, 1); },
        }));
      });
      rahmen.append(zeile('', knopf('+ Glied', () => { merken(); k.kinder.push(LEER()); geaendert(true); })));
    }
    return rahmen;
  }

  // ---------- Hilfsgrößen ----------

  function gleichungsListe() {
    const liste = el('div');
    zustand.gleichungen.forEach((g, i) => {
      const inp = textfeld(g, i === 0 ? 'z. B. A = U − B' : 'z. B. B = G1·A', (v) => { zustand.gleichungen[i] = v; geaendert(false); });
      liste.append(zeile('flex-wrap:nowrap;margin-bottom:8px;',
        el('label', { class: 'feld', style: 'margin:0;flex:1' }, inp),
        knopf('✕', () => { merken(); zustand.gleichungen.splice(i, 1); if (!zustand.gleichungen.length) zustand.gleichungen.push(''); geaendert(true); })));
      if (fokusNeu === i) setTimeout(() => inp.focus(), 0);
    });
    liste.append(zeile('margin-bottom:12px;', knopf('+ Gleichung', () => {
      merken(); zustand.gleichungen.push(''); fokusNeu = zustand.gleichungen.length - 1; geaendert(true);
    })));
    return liste;
  }

  // ---------- Rechnen ----------

  function eingabe() {
    return zustand.modus === 'hilfsgroessen'
      ? { modus: 'hilfsgroessen', gleichungen: zustand.gleichungen, eingaenge: zustand.eingaenge, ausgang: zustand.ausgang, werte: zustand.werte }
      : { modus: 'bausteine', baum: zustand.baum, ergebnisName: zustand.ergebnisName, werte: zustand.werte };
  }

  function rechne() {
    if (zustand.modus === 'bausteine') vorschau.textContent = 'Struktur: ' + strukturText(zustand.baum);
    else vorschau.textContent = '';
    const leer = zustand.modus === 'bausteine' ? zustand.baum.typ === 'leer' : !zustand.gleichungen.some((g) => g.trim());
    if (leer) { ergebnis.replaceChildren(); werteBox.replaceChildren(); werteKey = ''; return; }
    try {
      const r = signalfluss(eingabe());
      ergebnis.replaceChildren(fazit(r.fazit, 'neutral'), rechenweg(r.schritte));
      zeigeWerte(r.bloecke || []);
    } catch (e) {
      ergebnis.replaceChildren(fehler(e.message));
    }
  }

  function zeigeWerte(bloecke) {
    const key = bloecke.join(',');
    if (key === werteKey) return;
    werteKey = key;
    if (!bloecke.length) { werteBox.replaceChildren(); return; }
    const offen = bloecke.some((n) => zustand.werte[n]);
    const det = el('details', { style: 'margin:0 0 16px' },
      el('summary', { style: 'cursor:pointer;color:var(--accent);padding:8px 0' }, 'Zahlen/Polynome für die Blöcke einsetzen (optional)'),
      el('div', { class: 'vorschau', style: 'margin:4px 0 8px' }, 'Wie auf dem Blatt eintippen, z. B. 1/(1+3s), 1/((1+5s)(1+7s)), 1/s, K. Rechnet erst, wenn alle Felder gefüllt sind.'),
      ...bloecke.map((n) => el('label', { class: 'feld' }, el('span', {}, symText(n) + '(s) ='),
        textfeld(zustand.werte[n], 'leer lassen = nur symbolisch', (v) => { zustand.werte[n] = v; speichern(); rechne(); }))));
    if (offen) det.open = true;
    werteBox.replaceChildren(det);
  }

  function geaendert(neuBauen) {
    speichern();
    if (neuBauen) aufbau(); else rechne();
  }

  // ---------- Aufbau ----------

  function aufbau() {
    aktiv = null;
    werteKey = '';
    const modusBtn = (m, t) => el('button', {
      type: 'button', class: zustand.modus === m ? 'on' : '',
      onclick: () => { zustand.modus = m; speichern(); aufbau(); },
    }, t);

    let inhalt;
    if (zustand.modus === 'bausteine') {
      const bsp = BEISPIELE_BAUM.map(([name, label, baum]) => knopf(name, () => {
        merken(); zustand.baum = kopie(baum); zustand.ergebnisName = label;
        if (label !== 'G') zustand.baum.name = label; speichern(); aufbau();
      }));
      inhalt = [
        el('div', { class: 'vorschau' }, 'Von außen nach innen bauen: auf □ tippen und Struktur wählen. Verzweigung vor einem Block, der auch vorwärts weiterläuft? Block in beiden Zweigen eintragen. Teilsystem benennen (z. B. G1) → später eingesetzt; ein Block „G1“ verweist darauf.'),
        zeile('margin-bottom:8px;',
          knopf('↶ Rückgängig', rueckgaengig),
          knopf('Neu', () => { merken(); zustand.baum = LEER(); zustand.ergebnisName = 'G'; speichern(); aufbau(); })),
        knoten(zustand.baum, { wurzel: true, ersetzen: (n) => { zustand.baum = n; }, loeschen: () => { zustand.baum = LEER(); } }),
        tasten(() => aktiv, ['G', 'H', 'R', 'K', '1', '₁', '₂', '·', '+', '−']),
        vorschau,
        el('div', { class: 'beispiele' }, 'Beispiele:', bsp),
      ];
    } else {
      const bsp = BEISPIELE_HG.map(([name, ein, aus, gl]) => knopf(name, () => {
        merken(); zustand.eingaenge = ein; zustand.ausgang = aus; zustand.gleichungen = [...gl]; speichern(); aufbau();
      }));
      inhalt = [
        el('div', { class: 'vorschau', style: 'margin:0 0 12px' },
          '1. Hinter jede Summationsstelle und jeden Block eine Hilfsgröße schreiben (A, B, … oder H1, H2). ',
          '2. Pro Hilfsgröße eine Gleichung: was fließt hinein, Vorzeichen an der Summationsstelle beachten. ',
          '3. Eingänge und Ausgang eintragen. Großbuchstaben hintereinander = Produkt (G1G2·A, RW = R·W).'),
        el('label', { class: 'feld' }, el('span', {}, 'Eingänge (bei mehreren mit Komma, z. B. W, Z)'),
          textfeld(zustand.eingaenge, 'z. B. U oder W, Z', (v) => { zustand.eingaenge = v; geaendert(false); })),
        el('label', { class: 'feld' }, el('span', {}, 'Ausgang'),
          textfeld(zustand.ausgang, 'z. B. Y (leer = linke Seite der letzten Gleichung)', (v) => { zustand.ausgang = v; geaendert(false); })),
        el('div', { class: 'vorschau', style: 'margin:0 0 4px' }, 'Gleichungen'),
        gleichungsListe(),
        tasten(() => aktiv, ['=', '·', '−', '+', '(', ')', 'G', 'H', 'A', 'B', 'C', 'E', 'R', 'K']),
        zeile('margin-bottom:16px;', knopf('↶ Rückgängig', rueckgaengig),
          knopf('Neu', () => { merken(); zustand.gleichungen = ['']; zustand.eingaenge = ''; zustand.ausgang = ''; speichern(); aufbau(); })),
        el('div', { class: 'beispiele' }, 'Beispiele:', bsp),
      ];
    }

    box.replaceChildren(
      el('div', { class: 'seg' }, modusBtn('bausteine', 'Bausteine'), modusBtn('hilfsgroessen', 'Hilfsgrößen')),
      ...inhalt,
      werteBox,
      ergebnis
    );
    fokusNeu = null;
    rechne();
  }

  aufbau();
}
