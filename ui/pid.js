// Oberfläche PID-Einstellregeln: Verfahren wählen, Kennwerte eingeben, Regler wählen (rechnet beim Tippen).
import { el } from './dom.js';
import { pid, VERFAHREN } from '../rechner/pid.js';
import { rechenweg, fazit, fehler, tasten } from './render.js';

const GRUPPEN = [
  ['tsumme', 'T-Summe', [['tsumme-normal', 'normal'], ['tsumme-schnell', 'schnell']]],
  ['chr', 'Chien-Hrones-Reswick', [['chr-fa', 'Führung aperiodisch'], ['chr-f20', 'Führung 20 %'], ['chr-sa', 'Störung aperiodisch'], ['chr-s20', 'Störung 20 %']]],
  ['zn', 'Ziegler-Nichols', [['zn', 'Schwingversuch']]],
  ['kompensation', 'Kompensation', [['kompensation', 'PID-Kompensationsregler']]],
  ['kennwerte', 'Kennwerte', [['kennwerte', 'K_S, T_Σ aus Sprungantwort']]],
];

const FELDER = {
  KS: ['K_S (Streckenverstärkung)', 'z. B. 1/3'],
  TS: ['T_Σ (Summenzeitkonstante)', 'z. B. 19'],
  TU: ['T_U (Verzugszeit)', 'z. B. 7'],
  TG: ['T_G (Ausgleichszeit)', 'z. B. 20'],
  Kkr: ['K_kr (kritische Verstärkung)', 'z. B. 4'],
  Tkr: ['T_kr (Periodendauer der Dauerschwingung)', 'z. B. 10'],
};

const BEISPIELE = {
  tsumme: [['Ü06 A3 (a)', { verfahren: 'tsumme-schnell', regler: 'PID', KS: '1/3', TS: '19' }]],
  chr: [['Ü06 A3 (b)', { verfahren: 'chr-f20', regler: 'PID', KS: '1/3', TU: '7', TG: '20' }]],
  zn: [],
  kompensation: [['Ü06 A4', { verfahren: 'kompensation', strecke: '5/((7s+1)(3s+1)(11s+1))', d: '1' }]],
  kennwerte: [['Ü06 A2', { verfahren: 'kennwerte', xe1: '6', xe2: '9', xa1: '2,5', xa2: '3,5', zeitkonstanten: '' }]],
};

let zustand = {
  verfahren: 'tsumme-schnell', regler: 'PID', KS: '', TS: '', TU: '', TG: '', Kkr: '', Tkr: '',
  strecke: '', d: '1', xe1: '', xe2: '', xa1: '', xa2: '', zeitkonstanten: '', A: '',
};
try { Object.assign(zustand, JSON.parse(localStorage.getItem('pid') || '{}')); } catch {}

const gruppeVon = (v) => GRUPPEN.find((g) => g[2].some(([id]) => id === v))[0];

export function renderPid(view) {
  const box = el('div');
  view.append(box);
  let aktiv = null;
  const ergebnis = el('div');

  function speichern() { try { localStorage.setItem('pid', JSON.stringify(zustand)); } catch {} }

  function feld(key, label, placeholder) {
    const inp = el('input', {
      type: 'text', value: zustand[key] ?? '', placeholder, autocomplete: 'off', autocorrect: 'off',
      autocapitalize: 'off', spellcheck: 'false',
      onfocus: () => { aktiv = inp; },
      oninput: () => { zustand[key] = inp.value; speichern(); rechne(); },
    });
    if (!aktiv) aktiv = inp;
    return el('label', { class: 'feld' }, el('span', {}, label), inp);
  }

  function rechne() {
    try {
      const r = pid(zustand);
      ergebnis.replaceChildren(fazit(r.fazit, 'neutral'), rechenweg(r.schritte));
    } catch (e) {
      // leere Felder: still bleiben, sonst Hinweis zeigen
      if (/^Bitte /.test(e.message)) ergebnis.replaceChildren(el('div', { class: 'vorschau' }, e.message));
      else ergebnis.replaceChildren(fehler(e.message));
    }
  }

  function aufbau() {
    aktiv = null;
    const g = gruppeVon(zustand.verfahren);
    const knopf = (an, text, klick) => el('button', { type: 'button', class: an ? 'on' : '', onclick: klick }, text);
    const setze = (werte) => { Object.assign(zustand, werte); speichern(); aufbau(); };

    const teile = [
      el('div', { class: 'seg' }, GRUPPEN.map(([id, t, unter]) => knopf(g === id, t, () => setze({ verfahren: unter[0][0] })))),
    ];
    const unter = GRUPPEN.find((x) => x[0] === g)[2];
    if (unter.length > 1) teile.push(el('div', { class: 'seg' }, unter.map(([id, t]) => knopf(zustand.verfahren === id, t, () => setze({ verfahren: id })))));

    if (VERFAHREN[zustand.verfahren]) {
      const verf = VERFAHREN[zustand.verfahren];
      const typen = [...Object.keys(verf.regler), 'alle'];
      if (!typen.includes(zustand.regler)) zustand.regler = typen.includes('PID') ? 'PID' : typen[0];
      teile.push(el('div', { class: 'seg' }, typen.map((t) => knopf(zustand.regler === t, t === 'alle' ? 'alle (Tabelle)' : t, () => setze({ regler: t })))));
      for (const b of verf.basis) teile.push(feld(b, ...FELDER[b]));
    } else if (zustand.verfahren === 'kompensation') {
      teile.push(
        feld('strecke', 'Strecke G(s) in Produktform', 'z. B. 5/((7s+1)(3s+1)(11s+1))'),
        feld('d', 'Gewünschte Dämpfung d (leer = nicht gefragt)', 'z. B. 1'),
      );
    } else {
      teile.push(
        el('div', { class: 'vorschau' }, 'Verstärkung aus dem Sprung (Werte vom Bild ablesen):'),
        feld('xe1', 'Eingang x_e vorher', 'z. B. 6'),
        feld('xe2', 'Eingang x_e nachher', 'z. B. 9'),
        feld('xa1', 'Ausgang x_a vorher (Anfangswert)', 'z. B. 2,5'),
        feld('xa2', 'Ausgang x_a nachher (Endwert)', 'z. B. 3,5'),
        feld('zeitkonstanten', 'Optional: Zeitkonstanten der Strecke → T_Σ (mit Leerzeichen trennen)', 'z. B. 7 3 11'),
        feld('A', 'Optional: Steuerfläche A → T_Σ = A/K_S', ''),
      );
    }
    const bsp = (BEISPIELE[g] || []).map(([name, werte]) => el('button', { type: 'button', onclick: () => setze(werte) }, name));

    box.replaceChildren(
      ...teile,
      tasten(() => aktiv, ['/', ',', '(', ')', 's', '−']),
      bsp.length ? el('div', { class: 'beispiele' }, 'Beispiele:', bsp) : null,
      ergebnis,
    );
    rechne();
  }

  aufbau();
}
