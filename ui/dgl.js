// Oberfläche DGL → G(s): ein Feld für die ganze DGL, Schnelltasten für Striche, rechnet beim Tippen.
import { el } from './dom.js';
import { dgl } from '../rechner/dgl.js';
import { rechenweg, fazit, fehler, tasten } from './render.js';

const BEISPIELE = [
  ['K1 A10', "96y''' + 68y'' + 15y' + y = 7x'' + 8x' + x"],
  ['K2 A10', "960x_a''' + 332x_a'' + 33x_a' + x_a = 15x_e'' + 46x_e' + 3x_e"],
  ['K3 A10', "1638x_a''' + 451x_a'' + 38x_a' + x_a = 17x_e'' + 86x_e' + 5x_e"],
];

let zustand = { dgl: '' };
try { Object.assign(zustand, JSON.parse(localStorage.getItem('dgl') || '{}')); } catch {}

export function renderDgl(view) {
  const box = el('div');
  view.append(box);
  function speichern() { try { localStorage.setItem('dgl', JSON.stringify(zustand)); } catch {} }

  const ergebnis = el('div');
  function rechne() {
    if (!zustand.dgl.trim()) { ergebnis.replaceChildren(); return; }
    try {
      const r = dgl(zustand);
      ergebnis.replaceChildren(fazit(r.fazit, 'neutral'), rechenweg(r.schritte));
    } catch (e) {
      ergebnis.replaceChildren(fehler(e.message));
    }
  }

  function aufbau() {
    const inp = el('input', {
      type: 'text', value: zustand.dgl, placeholder: "z. B. 96y''' + 68y'' + 15y' + y = 7x'' + 8x' + x",
      autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false',
      oninput: () => { zustand.dgl = inp.value; speichern(); rechne(); },
    });
    const bsp = BEISPIELE.map(([name, t]) => el('button', {
      type: 'button', onclick: () => { zustand.dgl = t; speichern(); aufbau(); },
    }, name));
    box.replaceChildren(
      el('label', { class: 'feld' }, el('span', {}, 'DGL: Ausgangsgröße links, Eingangsgröße rechts'), inp),
      el('div', { class: 'vorschau' }, "Ableitung mit Strich: ẋ = x' · ẍ = x'' · x⃛ = x'''. Fehlende Glieder einfach weglassen."),
      tasten(() => inp, ["'", "''", "'''", 'x_a', 'x_e', 'y', 'x', '=', '+', '−']),
      el('div', { class: 'beispiele' }, 'Beispiele:', bsp),
      ergebnis
    );
    rechne();
  }
  aufbau();
}
