// Oberfläche SPS-Zahlenformate: Bitfolge → UINT/INT/BCD oder Dezimalzahl → Bitmuster (rechnet beim Tippen).
import { el } from './dom.js';
import { spsZahlen } from '../rechner/sps-zahlen.js';
import { rechenweg, fazit, fehler, tasten } from './render.js';

const BEISPIELE = {
  bits: [['K3 SPS A3', '1001.1011'], ['K3 A3 BCD', '0100.0010'], ['16 Bit', '1111.1111.1111.1110']],
  dezimal: [['−101', '-101', 8], ['42', '42', 8], ['1234 (16 Bit)', '1234', 16]],
};

let zustand = { modus: 'bits', bits: '', zahl: '', breite: 8 };
try { Object.assign(zustand, JSON.parse(localStorage.getItem('sps-zahlen') || '{}')); } catch {}

export function renderSpsZahlen(view) {
  const box = el('div');
  view.append(box);
  const ergebnis = el('div');
  let inp = null;

  function speichern() { try { localStorage.setItem('sps-zahlen', JSON.stringify(zustand)); } catch {} }

  function rechne() {
    const leer = zustand.modus === 'bits' ? !zustand.bits.trim() : !String(zustand.zahl).trim();
    if (leer) { ergebnis.replaceChildren(); return; }
    try {
      const r = spsZahlen(zustand);
      const art = zustand.modus === 'bits' && r.bcd === null ? 'bad' : 'neutral';
      ergebnis.replaceChildren(fazit(r.fazit, art), rechenweg(r.schritte));
    } catch (e) {
      ergebnis.replaceChildren(fehler(e.message));
    }
  }

  function aufbau() {
    const key = zustand.modus === 'bits' ? 'bits' : 'zahl';
    const modusBtn = (m, t) => el('button', {
      type: 'button', class: zustand.modus === m ? 'on' : '',
      onclick: () => { zustand.modus = m; speichern(); aufbau(); },
    }, t);
    inp = el('input', {
      type: 'text', value: zustand[key], autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false',
      inputmode: zustand.modus === 'bits' ? 'decimal' : 'text',
      placeholder: zustand.modus === 'bits' ? 'z. B. 1001.1011' : 'z. B. −101',
      oninput: () => { zustand[key] = inp.value; speichern(); rechne(); },
    });
    const feld = el('label', { class: 'feld' },
      el('span', {}, zustand.modus === 'bits' ? 'Bitfolge (8 oder 16 Bit, Punkt als Trenner erlaubt)' : 'Dezimalzahl (ganzzahlig)'), inp);

    const breite = zustand.modus === 'dezimal'
      ? el('div', { class: 'seg' }, [8, 16].map((b) => el('button', {
          type: 'button', class: zustand.breite === b ? 'on' : '',
          onclick: () => { zustand.breite = b; speichern(); aufbau(); },
        }, `${b} Bit`)))
      : null;

    const bsp = BEISPIELE[zustand.modus].map(([name, x, b]) => el('button', {
      type: 'button',
      onclick: () => { zustand[key] = x; if (b) zustand.breite = b; speichern(); aufbau(); },
    }, name));

    box.replaceChildren(
      el('div', { class: 'seg' }, modusBtn('bits', 'Bitfolge → Dezimal'), modusBtn('dezimal', 'Dezimal → Bitfolge')),
      feld,
      breite,
      tasten(() => inp, zustand.modus === 'bits' ? ['0', '1', '.'] : ['−']),
      el('div', { class: 'beispiele' }, 'Beispiele:', bsp),
      ergebnis
    );
    rechne();
  }

  aufbau();
}
