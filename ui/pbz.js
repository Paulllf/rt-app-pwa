// Oberfläche PBZ & Sprungantwort / inverse Laplace: drei Modi, Eingabe, Beispiele, Fazit + Rechenweg.
import { el } from './dom.js';
import { pbz } from '../rechner/pbz.js';
import { huebsch } from '../lib/pbz-mathe.js';
import { rechenweg, fazit, fehler, tasten } from './render.js';

const BEISPIELE = {
  sprung: [
    ['K3 A15', '1/((1+7s)(1+8s))'],
    ['Ü05 A1', '1/((1+4s)(1+5s))'],
    ['3× PT1', '1/((1+2s)(1+3s)(1+4s))'],
    ['PT1 doppelt', '1/(1+2s)^2'],
    ['I + PT1', '1/(s(1+5s))'],
    ['PT2 schwingend', '5/(s^2+2s+5)'],
  ],
  pbz: [
    ['Ü05 A1', '1/((1+4s)(1+5s))'],
    ['K3 A15', '1/((1+7s)(1+8s))'],
    ['H(s) direkt', '1/(s(1+7s)(1+8s))'],
    ['mit Zähler', '(1+2s)/((1+5s)(1+7s))'],
  ],
  laplace: [
    ['K2/K3 A6', '2s/(s^2-7)+3/(s^2-7)'],
    ['K1 A6', 'K/(1+Ts)'],
    ['cos/sin', '3s/(s^2+4)+2/(s^2+4)'],
    ['e-Funktion', '4/(1+2s)'],
    ['1/(s(s+a))', '1/(s(s+3))'],
  ],
};

const LABEL = {
  sprung: ['Übertragungsfunktion G(s) (wie in der Aufgabe)', 'z. B. 1/((1+7s)(1+8s))'],
  pbz: ['G(s) oder H(s) (wie in der Aufgabe)', 'z. B. 1/((1+4s)(1+5s))'],
  laplace: ['F(s) (Summanden wie in der Aufgabe)', 'z. B. 2s/(s^2-7)+3/(s^2-7)'],
};

let zustand = { modus: 'sprung', sprung: '', pbz: '', laplace: '' };
try { Object.assign(zustand, JSON.parse(localStorage.getItem('pbz') || '{}')); } catch {}

export function renderPbz(view) {
  const box = el('div');
  view.append(box);
  let inp = null;

  function speichern() { try { localStorage.setItem('pbz', JSON.stringify(zustand)); } catch {} }

  const ergebnis = el('div');
  const vorschau = el('div', { class: 'vorschau' });

  function zeigeVorschau() {
    try { vorschau.textContent = inp.value.trim() ? '= ' + huebsch(inp.value) : ''; } catch { vorschau.textContent = ''; }
  }

  function rechne() {
    const m = zustand.modus;
    const text = zustand[m] || '';
    if (!text.trim()) { ergebnis.replaceChildren(); return; }
    try {
      const r = m === 'laplace' ? pbz({ modus: m, ausdruck: text }) : pbz({ modus: m, g: text });
      ergebnis.replaceChildren(fazit(r.fazit, 'neutral'), rechenweg(r.schritte));
    } catch (e) {
      ergebnis.replaceChildren(fehler(e.message));
    }
  }

  function aufbau() {
    const m = zustand.modus;
    const modusBtn = (k, t) => el('button', {
      type: 'button', class: m === k ? 'on' : '',
      onclick: () => { zustand.modus = k; speichern(); aufbau(); },
    }, t);

    inp = el('input', {
      type: 'text', value: zustand[m] || '', placeholder: LABEL[m][1], autocomplete: 'off', autocorrect: 'off',
      autocapitalize: 'off', spellcheck: 'false',
      oninput: () => { zustand[m] = inp.value; speichern(); zeigeVorschau(); rechne(); },
    });
    zeigeVorschau();

    const bsp = BEISPIELE[m].map(([name, x]) =>
      el('button', { type: 'button', onclick: () => { zustand[m] = x; speichern(); aufbau(); } }, name));

    const hinweis = {
      sprung: 'Rechnet PBZ von G(s), dann H(s) = G(s)·1/s und h(t) mit 1/(s(s+a)) ⊶ (1/a)(1 − e^(−at)).',
      pbz: 'PBZ und Rücktransformation des eingegebenen Ausdrucks (g(t), oder h(t) bei Eingabe H(s) = …).',
      laplace: 'Jeder Summand einzeln. Buchstaben nur in K/(1+Ts), K/(s+a), K/s, K/(s(1+Ts)).',
    }[m];

    box.replaceChildren(
      el('div', { class: 'seg' },
        modusBtn('sprung', 'PBZ + h(t)'), modusBtn('pbz', 'Nur PBZ'), modusBtn('laplace', 'Inverse Laplace')),
      el('label', { class: 'feld' }, el('span', {}, LABEL[m][0]), inp),
      vorschau,
      el('div', { class: 'vorschau' }, hinweis),
      tasten(() => inp, ['s', '^', 's²', '(', ')', '/', '+', '−', '1+', 'K', 'T']),
      el('div', { class: 'beispiele' }, 'Beispiele:', bsp),
      ergebnis
    );
    rechne();
  }

  aufbau();
}
