// Oberfläche Zustandsraum (RNF): Zähler/Nenner eingeben, Rechenweg erscheint beim Tippen.
import { el } from './dom.js';
import { zustandsraum } from '../rechner/zustandsraum.js';
import { parsePoly, bfmt } from '../lib/poly.js';
import { rechenweg, fazit, fehler, tasten } from './render.js';

const BEISPIELE = [
  ['K2 A14', '1', '210s^4+247s^3+101s^2+17s+1'],
  ['V08 Bsp.', '1', '30s^3+31s^2+10s+1'],
  ['Ü08 A4 / K3 Py', '1', '105s^4+176s^3+86s^2+16s+1'],
  ['Zähler mit s', '2s+1', '(1+5s)(1+7s)'],
  ['sprungfähig', '2s^2+3s+1', '(s+2)(s+3)'],
];

let zustand = { zaehler: '', nenner: '', extras: false };
try { Object.assign(zustand, JSON.parse(localStorage.getItem('zustandsraum') || '{}')); } catch {}

export function renderZustandsraum(view) {
  const box = el('div');
  view.append(box);
  let aktiv = null;

  function speichern() { try { localStorage.setItem('zustandsraum', JSON.stringify(zustand)); } catch {} }

  function feld(key, label, placeholder) {
    const vorschau = el('div', { class: 'vorschau' });
    const inp = el('input', {
      type: 'text', value: zustand[key], placeholder, autocomplete: 'off', autocorrect: 'off',
      autocapitalize: 'off', spellcheck: 'false',
      onfocus: () => { aktiv = inp; },
      oninput: () => { zustand[key] = inp.value; speichern(); zeigeVorschau(); rechne(); },
    });
    function zeigeVorschau() {
      try { vorschau.textContent = inp.value.trim() ? '= ' + bfmt(parsePoly(inp.value)) : ''; }
      catch { vorschau.textContent = ''; }
    }
    zeigeVorschau();
    if (!aktiv) aktiv = inp;
    return [el('label', { class: 'feld' }, el('span', {}, label), inp), vorschau];
  }

  const ergebnis = el('div');

  function rechne() {
    if (!zustand.zaehler.trim() || !zustand.nenner.trim()) { ergebnis.replaceChildren(); return; }
    try {
      const r = zustandsraum(zustand);
      ergebnis.replaceChildren(fazit(r.fazit, 'neutral'), rechenweg(r.schritte));
    } catch (e) {
      ergebnis.replaceChildren(fehler(e.message));
    }
  }

  function aufbau() {
    aktiv = null;
    const extraBtn = (wert, t) => el('button', {
      type: 'button', class: !!zustand.extras === wert ? 'on' : '',
      onclick: () => { zustand.extras = wert; speichern(); aufbau(); },
    }, t);
    const bsp = BEISPIELE.map(([name, z, n]) =>
      el('button', {
        type: 'button',
        onclick: () => { zustand.zaehler = z; zustand.nenner = n; speichern(); aufbau(); },
      }, name));

    box.replaceChildren(
      el('div', { class: 'seg' }, extraBtn(false, 'RNF'), extraBtn(true, 'RNF + BNF + Python')),
      ...feld('zaehler', 'G(s): Zähler Z(s)', 'z. B. 1'),
      ...feld('nenner', 'G(s): Nenner N(s) (auch Produktform)', 'z. B. 210s^4+247s^3+101s^2+17s+1'),
      tasten(() => aktiv, ['s', '^', 's²', 's³', 's⁴', '(', ')', '+', '−', '/']),
      el('div', { class: 'beispiele' }, 'Beispiele:', bsp),
      ergebnis
    );
    rechne();
  }

  aufbau();
}
