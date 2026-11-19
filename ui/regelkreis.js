// Oberfläche Regelkreis & Endwertsatz: R, G₁, G₂ als Brüche → G₀, G_W, G_Z, E(s), e∞. Zweiter Modus: Vorfilter.
import { el } from './dom.js';
import { regelkreis } from '../rechner/regelkreis.js';
import { parseRat, fmtR, fmtRExp } from '../lib/regelkreis-rational.js';
import { rechenweg, fazit, fehler, tasten } from './render.js';

const BEISPIELE = {
  regelkreis: [
    ['K1 A15', { R: '1/s', G1: '1/(1+3s)', G2: '1/(1+5s)(1+7s)' }],
    ['K2 A15', { R: '1/s', G1: '1/s(1+2s)', G2: '1/(1+5s)(1+8s)' }],
    ['Ü04 A3', { R: '1/s', G1: '1/(1+s)', G2: '1/(1+2s)' }],
    ['Ü06 A1', { R: '(2s+1)/4s', G1: '3/(2s+1)s', G2: '1' }],
  ],
  vorfilter: [['Ü07 A1', { G: '1/(4s+1)(5s+1)(20s+1)', Gwun: '1/(3s+1)^4' }]],
};

const FELDER = {
  regelkreis: [
    ['R', 'Regler R(s)', 'z. B. 1/s'],
    ['G1', 'Strecke G₁(s) (vor der Störung)', 'z. B. 1/(1+3s)'],
    ['G2', 'Strecke G₂(s) (nach der Störung)', 'z. B. 1/(1+5s)(1+7s)'],
  ],
  vorfilter: [
    ['G', 'Strecke G(s)', 'z. B. 1/(4s+1)(5s+1)(20s+1)'],
    ['Gwun', 'Gewünschtes Führungsverhalten G_wun(s)', 'z. B. 1/(3s+1)^4'],
  ],
};

let zustand = { modus: 'regelkreis', R: '', G1: '', G2: '', G: '', Gwun: '' };
try { Object.assign(zustand, JSON.parse(localStorage.getItem('regelkreis') || '{}')); } catch {}

export function renderRegelkreis(view) {
  const box = el('div');
  view.append(box);
  let aktiv = null;

  function speichern() { try { localStorage.setItem('regelkreis', JSON.stringify(zustand)); } catch {} }

  function feld(key, label, placeholder) {
    const vorschau = el('div', { class: 'vorschau' });
    const inp = el('input', {
      type: 'text', value: zustand[key] || '', placeholder, autocomplete: 'off', autocorrect: 'off',
      autocapitalize: 'off', spellcheck: 'false',
      onfocus: () => { aktiv = inp; },
      oninput: () => { zustand[key] = inp.value; speichern(); zeigeVorschau(); rechne(); },
    });
    function zeigeVorschau() {
      try {
        if (!inp.value.trim()) { vorschau.textContent = ''; return; }
        const r = parseRat(inp.value);
        const a = fmtR(r), b = fmtRExp(r);
        vorschau.textContent = '= ' + a + (a !== b ? '   = ' + b : '');
      } catch { vorschau.textContent = ''; }
    }
    zeigeVorschau();
    if (!aktiv) aktiv = inp;
    return [el('label', { class: 'feld' }, el('span', {}, label), inp), vorschau];
  }

  const ergebnis = el('div');

  function rechne() {
    const leer = FELDER[zustand.modus].some(([k]) => !String(zustand[k] || '').trim());
    if (leer) { ergebnis.replaceChildren(); return; }
    try {
      const r = regelkreis(zustand);
      ergebnis.replaceChildren(fazit(r.fazit, 'neutral'), rechenweg(r.schritte));
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

    const hinweis = zustand.modus === 'regelkreis'
      ? [
          el('div', { class: 'vorschau' }, 'Bruch tippen wie auf dem Blatt: 1/(1+5s)(1+7s) – alles direkt hinter „/“ ist der Nenner.'),
          el('div', { class: 'vorschau' }, 'Störung am Ausgang: G₂ = 1. Störung vor der ganzen Strecke: G₁ = 1, G₂ = Strecke. P-Regler mit Parameter: R = K.'),
        ]
      : [el('div', { class: 'vorschau' }, 'S₁ = G_wun (Vorfilter), S₂ = G_wun/G (Vorsteuerung).')];

    const bsp = BEISPIELE[zustand.modus].map(([name, werte]) =>
      el('button', { type: 'button', onclick: () => { Object.assign(zustand, werte); speichern(); aufbau(); } }, name));

    box.replaceChildren(
      el('div', { class: 'seg' }, modusBtn('regelkreis', 'Regelkreis & Endwertsatz'), modusBtn('vorfilter', 'Vorfilter/Vorsteuerung')),
      ...FELDER[zustand.modus].flatMap(([k, l, p]) => feld(k, l, p)),
      ...hinweis,
      tasten(() => aktiv, ['s', '/', '(', ')', '1+', '^', '²', 'K', '+', '−']),
      el('div', { class: 'beispiele' }, 'Beispiele:', bsp),
      ergebnis
    );
    rechne();
  }

  aufbau();
}
