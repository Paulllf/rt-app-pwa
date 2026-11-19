// Darstellung einer Musterantwort (Wissensfrage) aus app/inhalte/*.js.
// Blocktypen siehe tools/inhalte-format.md
import { el } from './dom.js';

function block(b) {
  switch (b.t) {
    case 'p': return el('p', {}, b.text);
    case 'liste': return el(b.nummeriert ? 'ol' : 'ul', {}, b.items.map((i) => el('li', {}, i)));
    case 'formel': return el('div', { class: 'formel' }, b.text);
    case 'tabelle': return el('div', { class: 'tab-wrap' }, el('table', { class: 'tab' },
      b.kopf ? el('thead', {}, el('tr', {}, b.kopf.map((k) => el('th', {}, k)))) : null,
      el('tbody', {}, b.zeilen.map((z) => el('tr', {}, z.map((c) => el('td', {}, c)))))));
    case 'svg': {
      // Skizzen sind eigener, geprüfter Inhalt aus app/inhalte (kein fremder Text)
      const fig = el('figure', { class: 'skizze' });
      const box = el('div');
      box.innerHTML = b.svg;
      fig.append(box);
      if (b.unterschrift) fig.append(el('figcaption', {}, b.unterschrift));
      return fig;
    }
    case 'hinweis': return el('div', { class: 'hinweis' }, b.text);
    case 'zwischen': return el('h3', { class: 'zwischen' }, b.text);
    case 'link': return el('a', { class: 'rechner-link', href: '#/' + b.ziel }, '→ ' + b.text);
    default: return el('p', {}, b.text || '');
  }
}

export function renderAntwort(view, a) {
  view.append(
    el('div', { class: 'meta' }, [a.quellen, a.punkte ? a.punkte + ' P' : null].filter(Boolean).join(' · ')),
    a.frage ? el('div', { class: 'frage' }, el('b', {}, 'Aufgabe: '), a.frage) : null,
    el('div', { class: 'antwort' }, a.antwort.map(block))
  );
}

/** Ganzer Text einer Antwort für die Suche. */
export function antwortText(a) {
  const t = (b) => [b.text, ...(b.items || []), ...(b.kopf || []), ...((b.zeilen || []).flat()), b.unterschrift].filter(Boolean).join(' ');
  return [a.titel, a.frage, a.stichworte, a.quellen, ...a.antwort.map(t)].filter(Boolean).join(' ');
}
