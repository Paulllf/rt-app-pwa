// Oberfläche Hurwitz: zwei Modi, Eingabe, Beispiele, Fazit + Rechenweg (rechnet beim Tippen).
import { el } from './dom.js';
import { hurwitz } from '../rechner/hurwitz.js';
import { parsePoly, bfmt } from '../lib/poly.js';
import { rechenweg, fazit, fehler, tasten } from './render.js';

const BEISPIELE = {
  polynom: [
    ['Ü08 A1', 's^3+9s^2+23s+15'],
    ['Ü08 A1 b', 's^3-7s^2+7s+15'],
    ['Ü08 A2', '24s^4+50s^3+35s^2+10s+1'],
    ['Ü08 A2 b', '24s^4+38s^3+13s^2-2s-1'],
  ],
  regelkreis: [['K1 A14', '10', '(s+1)(s+2)']],
};

let zustand = { modus: 'polynom', polynom: '', zaehler: '', nenner: '' };
try { Object.assign(zustand, JSON.parse(localStorage.getItem('hurwitz') || '{}')); } catch {}

export function renderHurwitz(view) {
  const box = el('div');
  view.append(box);
  let aktiv = null;

  function speichern() { try { localStorage.setItem('hurwitz', JSON.stringify(zustand)); } catch {} }

  function feld(key, label, placeholder) {
    const vorschau = el('div', { class: 'vorschau' });
    const inp = el('input', {
      type: 'text', value: zustand[key], placeholder, autocomplete: 'off', autocorrect: 'off',
      autocapitalize: 'off', spellcheck: 'false',
      onfocus: () => { aktiv = inp; },
      oninput: () => { zustand[key] = inp.value; speichern(); zeigeVorschau(); rechne(); },
    });
    function zeigeVorschau() {
      try { vorschau.textContent = inp.value.trim() ? '= ' + bfmt(parsePoly(inp.value), 'K_R') : ''; }
      catch { vorschau.textContent = ''; }
    }
    zeigeVorschau();
    if (!aktiv) aktiv = inp;
    return [el('label', { class: 'feld' }, el('span', {}, label), inp), vorschau];
  }

  const ergebnis = el('div');

  function rechne() {
    const leer = zustand.modus === 'polynom' ? !zustand.polynom.trim() : !zustand.zaehler.trim() || !zustand.nenner.trim();
    if (leer) { ergebnis.replaceChildren(); return; }
    try {
      const r = hurwitz(zustand);
      const art = r.stabil === true ? 'ok' : r.stabil === false ? 'bad' : 'neutral';
      ergebnis.replaceChildren(fazit(r.fazit, art), rechenweg(r.schritte));
    } catch (e) {
      ergebnis.replaceChildren(fehler(e.message));
    }
  }

  function aufbau() {
    aktiv = null;
    const modusBtn = (m, t) => el('button', {
      type: 'button', class: zustand.modus === m ? 'on' : '',
      onclick: () => { zustand.modus = m; speichern(); aufbau(); },
    }, t);

    const felder = zustand.modus === 'polynom'
      ? feld('polynom', 'Nennerpolynom N(s) (darf K enthalten)', 'z. B. s^3+9s^2+23s+15')
      : [
          ...feld('zaehler', 'Strecke G_S(s): Zähler Z(s)', 'z. B. 10'),
          ...feld('nenner', 'Strecke G_S(s): Nenner N(s)', 'z. B. (s+1)(s+2)'),
          el('div', { class: 'vorschau' }, 'Regler: P-Regler R(s) = K_R'),
        ];

    const bsp = BEISPIELE[zustand.modus].map(([name, x, y]) =>
      el('button', {
        type: 'button',
        onclick: () => {
          if (zustand.modus === 'polynom') zustand.polynom = x;
          else { zustand.zaehler = x; zustand.nenner = y; }
          speichern(); aufbau();
        },
      }, name));

    box.replaceChildren(
      el('div', { class: 'seg' }, modusBtn('polynom', 'Polynom'), modusBtn('regelkreis', 'Regelkreis mit K_R')),
      ...felder,
      tasten(() => aktiv, ['s', '^', 's²', 's³', 's⁴', '(', ')', 'K', '+', '−']),
      el('div', { class: 'beispiele' }, 'Beispiele:', bsp),
      ergebnis
    );
    rechne();
  }

  aufbau();
}
