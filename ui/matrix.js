// Oberfläche Matrizen: Produkt, Determinante, Inverse (rechnet beim Tippen).
import { el } from './dom.js';
import { matrix } from '../rechner/matrix.js';
import { parseMatrix, dimText } from '../lib/matrix-bruch.js';
import { rechenweg, fazit, fehler, tasten } from './render.js';

const BEISPIELE = {
  produkt: [
    ['K3 A14', { A: '3 7; 5 9; 4 5', B: '2 3 5; 9 3 7' }],
    ['Ü07 A2', { A: '1 5; −7 3; 8 4', B: '2 3 5; −9 7 12' }],
  ],
  det: [
    ['K3 A14 (C)', { M: '3 7 19; 0 0 2; 4 5 12', name: 'C', methode: 'auto' }],
    ['Ü07 A3', { M: '3 9; 7 12', name: 'A', methode: 'auto' }],
    ['Ü07 A4 Sarrus', { M: '7 −3 5; 1 9 8; 3 4 −2', name: 'A', methode: 'sarrus' }],
    ['Ü08 A3 D₁', { M: '5 3 0; 7 10 13; 0 0 1', name: 'D₁', methode: 'auto' }],
    ['Ü08 A3 D₃ (4×4)', { M: '5 3 0 1; 0 0 0 1; 7 10 13 12; 0 0 1 1', name: 'D₃', methode: 'auto' }],
  ],
  inverse: [
    ['K3 A14 (D)', { M: '3 1; 5 2', name: 'D' }],
    ['Ü07 A3', { M: '3 9; 7 12', name: 'A' }],
  ],
};

let zustand = { modus: 'produkt', A: '', B: '', M: '', name: 'A', methode: 'auto' };
try { Object.assign(zustand, JSON.parse(localStorage.getItem('matrix') || '{}')); } catch {}

export function renderMatrix(view) {
  const box = el('div');
  view.append(box);
  let aktiv = null;
  const ergebnis = el('div');

  function speichern() { try { localStorage.setItem('matrix', JSON.stringify(zustand)); } catch {} }

  function feld(key, label, placeholder, vorschauAn = true) {
    const vorschau = el('div', { class: 'vorschau' });
    const inp = el('input', {
      type: 'text', value: zustand[key], placeholder, autocomplete: 'off', autocorrect: 'off',
      autocapitalize: 'off', spellcheck: 'false',
      onfocus: () => { aktiv = inp; },
      oninput: () => { zustand[key] = inp.value; speichern(); zeige(); rechne(); },
    });
    function zeige() {
      if (!vorschauAn) return;
      try { vorschau.textContent = inp.value.trim() ? 'erkannt: ' + dimText(parseMatrix(inp.value)) + ' – ' + parseMatrix(inp.value).map((r) => r.join('  ')).join('  |  ') : ''; }
      catch { vorschau.textContent = ''; }
    }
    zeige();
    if (!aktiv) aktiv = inp;
    return [el('label', { class: 'feld' }, el('span', {}, label), inp), vorschauAn ? vorschau : null];
  }

  function rechne() {
    const leer = zustand.modus === 'produkt' ? !zustand.A.trim() || !zustand.B.trim() : !zustand.M.trim();
    if (leer) { ergebnis.replaceChildren(); return; }
    try {
      const r = matrix({ ...zustand, name: zustand.name.trim() || 'A' });
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

    const regel = 'Werte mit Leerzeichen, Zeilen mit ; trennen. Komma = Dezimalkomma (0,5). Brüche: 1/3.';
    let felder;
    if (zustand.modus === 'produkt') {
      felder = [...feld('A', 'Matrix A', 'z. B. 3 7; 5 9; 4 5'), ...feld('B', 'Matrix B', 'z. B. 2 3 5; 9 3 7')];
    } else {
      felder = [
        ...feld('M', `Matrix ${zustand.name || 'A'}`, zustand.modus === 'det' ? 'z. B. 3 7 19; 0 0 2; 4 5 12' : 'z. B. 3 1; 5 2'),
        ...feld('name', 'Name der Matrix (wie in der Aufgabe)', 'A', false),
      ];
      if (zustand.modus === 'det') {
        const mBtn = (m, t) => el('button', {
          type: 'button', class: zustand.methode === m ? 'on' : '',
          onclick: () => { zustand.methode = m; speichern(); aufbau(); },
        }, t);
        let n = 3;
        try { n = parseMatrix(zustand.M).length; } catch {}
        const ks = Array.from({ length: Math.min(Math.max(n, 2), 5) }, (_, i) => i + 1);
        felder.push(
          el('div', { class: 'seg' }, mBtn('auto', 'Laplace (meiste Nullen)'), mBtn('sarrus', 'Sarrus (nur 3×3)')),
          el('div', { class: 'seg' }, ks.map((k) => mBtn('zeile' + k, `nach Zeile ${k}`))),
          el('div', { class: 'seg' }, ks.map((k) => mBtn('spalte' + k, `nach Spalte ${k}`))),
        );
      }
    }

    const bsp = BEISPIELE[zustand.modus].map(([name, werte]) =>
      el('button', { type: 'button', onclick: () => { Object.assign(zustand, werte); speichern(); aufbau(); } }, name));

    box.replaceChildren(
      el('div', { class: 'seg' }, modusBtn('produkt', 'A·B und B·A'), modusBtn('det', 'Determinante'), modusBtn('inverse', 'Inverse')),
      el('div', { class: 'vorschau' }, regel),
      ...felder.filter(Boolean),
      tasten(() => aktiv, ['␣', ';', '−', ',', '/']),
      el('div', { class: 'beispiele' }, 'Beispiele:', bsp),
      ergebnis
    );
    rechne();
  }

  aufbau();
}
