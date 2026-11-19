// Gemeinsame Darstellung für alle Rechner: Fazit-Box und nummerierter Rechenweg.
import { el } from './dom.js';

export function matrix(m, indent) {
  const cols = m[0]?.length || 1;
  const g = el('div', { class: 'mat' + (indent ? ' indent' : '') }, m.flat().map((x) => el('div', {}, x)));
  g.style.gridTemplateColumns = `repeat(${cols}, auto)`;
  return g;
}

export function rechenweg(schritte) {
  return el('ol', { class: 'weg' }, schritte.map((s) =>
    el('li', {}, el('h3', {}, s.titel), s.zeilen.flatMap((z) => {
      const out = [];
      if (z.text) out.push(el('div', { class: ['zeile', z.strong && 'strong', z.muted && 'muted', z.indent && 'indent'].filter(Boolean).join(' ') }, z.text));
      if (z.matrix) out.push(el('div', {}, matrix(z.matrix, z.indent || /^D/.test(z.text || ''))));
      return out;
    }))
  ));
}

export function fazit(text, art) {
  return el('div', { class: 'fazit ' + art }, text);
}

export function fehler(msg) {
  return el('div', { class: 'fehler' }, msg);
}

/** Zeile mit Schnelltasten, die Text an der Cursorposition einfügen. */
export function tasten(getInput, liste) {
  return el('div', { class: 'tasten' }, liste.map((t) =>
    el('button', {
      type: 'button',
      onpointerdown: (ev) => ev.preventDefault(), // Fokus bleibt im Feld, Tastatur bleibt offen
      onclick: () => {
        const inp = getInput();
        const a = inp.selectionStart ?? inp.value.length, b = inp.selectionEnd ?? a;
        inp.value = inp.value.slice(0, a) + t + inp.value.slice(b);
        inp.setSelectionRange(a + t.length, a + t.length);
        inp.focus();
        inp.dispatchEvent(new Event('input'));
      },
    }, t)
  ));
}
