// Oberfläche Polynom & Polstellen: zwei Modi (A11 Polynomdivision, Z(s)/N(s)), rechnet beim Tippen.
import { el } from './dom.js';
import { polynom } from '../rechner/polynom.js';
import { leseQPoly, pfmt } from '../lib/polynom-kern.js';
import { rechenweg, fazit, fehler, tasten } from './render.js';

const BEISPIELE = {
  polynom: [
    ['K1 A11', '30s^3+s^2-6s-1', '-1/3'],
    ['K2 A11', '480s^3+2447s^2+236s+5', '-5'],
    ['K3 A11', '1088s^3+3345s^2+244s+3', '-3'],
  ],
  gs: [
    ['Ü04 A1', '4s^2+5s+1', '30s^3+31s^2+10s+1', '-1/2'],
    ['K1 Py A3', '294s^3+161s^2+24s+1', '1440s^4+988s^3+245s^2+26s+1', ''],
    ['K2 Py A3', '495s^3+199s^2+25s+1', '190080s^4+40212s^3+2991s^2+92s+1', ''],
  ],
};

let zustand = { modus: 'polynom', polynom: '', bekannt: '', zaehler: '', nenner: '', bekanntPol: '', bekanntNull: '' };
try { Object.assign(zustand, JSON.parse(localStorage.getItem('polynom') || '{}')); } catch {}

export function renderPolynom(view) {
  const box = el('div');
  view.append(box);
  let aktiv = null;

  function speichern() { try { localStorage.setItem('polynom', JSON.stringify(zustand)); } catch {} }

  function feld(key, label, placeholder, istPoly = true) {
    const vorschau = el('div', { class: 'vorschau' });
    const inp = el('input', {
      type: 'text', value: zustand[key], placeholder, autocomplete: 'off', autocorrect: 'off',
      autocapitalize: 'off', spellcheck: 'false',
      onfocus: () => { aktiv = inp; },
      oninput: () => { zustand[key] = inp.value; speichern(); zeigeVorschau(); rechne(); },
    });
    function zeigeVorschau() {
      if (!istPoly) return;
      try { vorschau.textContent = inp.value.trim() ? '= ' + pfmt(leseQPoly(inp.value)) : ''; }
      catch { vorschau.textContent = ''; }
    }
    zeigeVorschau();
    if (!aktiv) aktiv = inp;
    return istPoly ? [el('label', { class: 'feld' }, el('span', {}, label), inp), vorschau] : [el('label', { class: 'feld' }, el('span', {}, label), inp)];
  }

  const ergebnis = el('div');

  function rechne() {
    const leer = zustand.modus === 'polynom' ? !zustand.polynom.trim() : !zustand.zaehler.trim() || !zustand.nenner.trim();
    if (leer) { ergebnis.replaceChildren(); return; }
    try {
      const r = polynom(zustand);
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
      ? [
          ...feld('polynom', 'Polynom N(s), z. B. Nenner von G(s) = 1/N(s)', 'z. B. 30s^3+s^2-6s-1'),
          ...feld('bekannt', 'Bekannte Polstelle s₁ (leer lassen, wenn keine gegeben)', 'z. B. -1/3', false),
        ]
      : [
          ...feld('zaehler', 'Zähler Z(s)', 'z. B. 4s^2+5s+1'),
          ...feld('nenner', 'Nenner N(s)', 'z. B. 30s^3+31s^2+10s+1'),
          ...feld('bekanntPol', 'Bekannte Polstelle (optional)', 'z. B. -1/2', false),
          ...feld('bekanntNull', 'Bekannte Nullstelle (optional)', '', false),
        ];

    const bsp = BEISPIELE[zustand.modus].map(([name, a, b, c]) =>
      el('button', {
        type: 'button',
        onclick: () => {
          if (zustand.modus === 'polynom') { zustand.polynom = a; zustand.bekannt = b; }
          else { zustand.zaehler = a; zustand.nenner = b; zustand.bekanntPol = c; zustand.bekanntNull = ''; }
          speichern(); aufbau();
        },
      }, name));

    box.replaceChildren(
      el('div', { class: 'seg' }, modusBtn('polynom', 'Polstellen (A11)'), modusBtn('gs', 'Null- & Polstellen Z/N')),
      ...felder,
      tasten(() => aktiv, ['s', '^', 's²', 's³', 's⁴', '(', ')', '+', '−', '/', ';']),
      el('div', { class: 'vorschau' }, 'Mehrere bekannte Werte mit ; trennen. Brüche wie −1/3 direkt eingeben.'),
      el('div', { class: 'beispiele' }, 'Beispiele:', bsp),
      ergebnis
    );
    rechne();
  }

  aufbau();
}
