// Oberfläche Linearisierung: f(t), Arbeitspunkt t₀, optional Stelle für den Fehler (rechnet beim Tippen).
import { el } from './dom.js';
import { linearisierung } from '../rechner/linearisierung.js';
import { parseAusdruck, text } from '../lib/linearisierung-ausdruck.js';
import { rechenweg, fazit, fehler, tasten } from './render.js';

const BEISPIELE = [
  ['K2 A8', { f: 't^2 - t', t0: '1', stelle: '' }],
  ['Ü01 √t, t₀ = 9', { f: '√t', t0: '9', stelle: '' }],
  ['V01 √t, t₀ = 4', { f: '√t', t0: '4', stelle: '' }],
];

let zustand = { f: '', t0: '', stelle: '' };
try { Object.assign(zustand, JSON.parse(localStorage.getItem('linearisierung') || '{}')); } catch {}

export function renderLinearisierung(view) {
  const box = el('div');
  view.append(box);
  let aktiv = null;
  const ergebnis = el('div');

  function speichern() { try { localStorage.setItem('linearisierung', JSON.stringify(zustand)); } catch {} }

  function feld(key, label, placeholder, mitVorschau) {
    const vorschau = el('div', { class: 'vorschau' });
    const inp = el('input', {
      type: 'text', value: zustand[key], placeholder, autocomplete: 'off', autocorrect: 'off',
      autocapitalize: 'off', spellcheck: 'false',
      onfocus: () => { aktiv = inp; },
      oninput: () => { zustand[key] = inp.value; speichern(); zeige(); rechne(); },
    });
    function zeige() {
      if (!mitVorschau) return;
      try {
        const { baum, varName } = parseAusdruck(inp.value);
        vorschau.textContent = inp.value.trim() ? `= ${text(baum, varName)}` : '';
      } catch { vorschau.textContent = ''; }
    }
    zeige();
    if (!aktiv) aktiv = inp;
    return [el('label', { class: 'feld' }, el('span', {}, label), inp), mitVorschau ? vorschau : null];
  }

  function rechne() {
    if (!zustand.f.trim() || !zustand.t0.trim()) { ergebnis.replaceChildren(); return; }
    try {
      const r = linearisierung(zustand);
      ergebnis.replaceChildren(fazit(r.fazit, 'neutral'), rechenweg(r.schritte));
    } catch (e) {
      ergebnis.replaceChildren(fehler(e.message));
    }
  }

  function aufbau() {
    aktiv = null;
    const bsp = BEISPIELE.map(([name, werte]) =>
      el('button', { type: 'button', onclick: () => { Object.assign(zustand, werte); speichern(); aufbau(); } }, name));
    box.replaceChildren(
      ...feld('f', 'Funktion f(t)', 'z. B. t^2 - t   oder   √t   oder   e^(-2t)', true),
      ...feld('t0', 'Arbeitspunkt t₀', 'z. B. 1   (auch 0,5  1/3  π/2)', false),
      ...feld('stelle', 'Optional: Fehler an der Stelle t =', 'leer lassen, wenn nicht gefragt', false),
      tasten(() => aktiv, ['t', '^', '²', '(', ')', '√', 'e^', 'sin(', 'cos(', 'ln(', '−', '/', 'π']),
      el('div', { class: 'beispiele' }, 'Beispiele:', bsp),
      ergebnis
    );
    rechne();
  }

  aufbau();
}
