// Gerüst: Navigation (#/…), Suche, Offline-Status.
import { BEREICHE, EINTRAEGE } from './registry.js';
import { renderHurwitz } from './ui/hurwitz.js';
import { renderZustandsraum } from './ui/zustandsraum.js';
import { renderRegelkreis } from './ui/regelkreis.js';
import { renderNetzwerk } from './ui/netzwerk.js';
import { renderPbz } from './ui/pbz.js';
import { renderSpsZahlen } from './ui/sps-zahlen.js';
import { renderSpsLogik } from './ui/sps-logik.js';
import { renderPolynom } from './ui/polynom.js';
import { renderDgl } from './ui/dgl.js';
import { renderMatrix } from './ui/matrix.js';
import { renderLinearisierung } from './ui/linearisierung.js';
import { renderPid } from './ui/pid.js';
import { renderSignalfluss } from './ui/signalfluss.js';
import { renderPythonLueckentext } from './ui/python-lueckentext.js';
import { el } from './ui/dom.js';
import { ANTWORTEN } from './inhalte/index.js';
import { VORLESUNGEN } from './registry.js';
import { renderAntwort, antwortText } from './ui/antwort.js';

export const VERSION = '0.5.0';
const RECHNER = {
  hurwitz: renderHurwitz,
  zustandsraum: renderZustandsraum,
  regelkreis: renderRegelkreis,
  netzwerk: renderNetzwerk,
  pbz: renderPbz,
  'sps-zahlen': renderSpsZahlen,
  'sps-logik': renderSpsLogik,
  polynom: renderPolynom,
  dgl: renderDgl,
  matrix: renderMatrix,
  linearisierung: renderLinearisierung,
  pid: renderPid,
  signalfluss: renderSignalfluss,
  'python-lueckentext': renderPythonLueckentext,
};

const view = document.getElementById('view');
const suche = document.getElementById('suche');


const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[_\s-]+/g, ' ');

// Musterantworten als Einträge (Route #/a/<id>), Suche auch im Antworttext
const WISSEN = ANTWORTEN.map((a) => ({
  id: 'a/' + a.id, bereich: a.bereich, titel: a.titel, art: 'wissen', fertig: true,
  info: a.quellen + (a.punkte ? ` · ${a.punkte} P` : ''), stichworte: antwortText(a), antwort: a,
}));
const ALLE = [...EINTRAEGE, ...WISSEN];

function kachel(e) {
  const inner = [el('b', {}, e.titel), el('span', {}, e.info)];
  return e.fertig ? el('a', { class: 'tile', href: '#/' + e.id }, inner) : el('div', { class: 'tile bald' }, inner);
}

function start() {
  view.replaceChildren(
    ...BEREICHE.flatMap((b) => {
      const rechner = EINTRAEGE.filter((e) => e.bereich === b.id);
      const wissen = WISSEN.filter((e) => e.bereich === b.id);
      if (!rechner.length && !wissen.length) return [el('h2', {}, b.titel), el('p', { class: 'leer' }, b.info + ' · kommt bald')];
      if (b.id === 'vorlesung') return [el('h2', {}, b.titel), ...VORLESUNGEN.flatMap((v) => {
        const teil = wissen.filter((e) => e.antwort.vorlesung === v.id);
        return teil.length ? [el('h3', { class: 'unter' }, `${v.id} – ${v.titel}`), el('div', { class: 'grid' }, teil.map(kachel))] : [];
      })];
      return [
        el('h2', {}, b.titel),
        rechner.length ? el('div', { class: 'grid' }, rechner.map(kachel)) : null,
        wissen.length ? el('h3', { class: 'unter' }, 'Wissensfragen – Musterantworten') : null,
        wissen.length ? el('div', { class: 'grid' }, wissen.map(kachel)) : null,
      ].filter(Boolean);
    })
  );
}

function suchErgebnis(q) {
  const woerter = norm(q).split(' ').filter(Boolean);
  const treffer = ALLE.filter((e) => {
    const text = norm(`${e.titel} ${e.info} ${e.stichworte} ${e.bereich}`);
    return woerter.every((w) => text.includes(w));
  }).sort((a, b) => b.fertig - a.fertig);
  view.replaceChildren(
    el('h2', {}, `Suche: „${q}“`),
    treffer.length ? el('div', { class: 'grid' }, treffer.map(kachel)) : el('p', { class: 'leer' }, 'Nichts gefunden.')
  );
}

function route() {
  const id = location.hash.replace(/^#\/?/, '');
  if (suche.value.trim() && !id) return suchErgebnis(suche.value.trim());
  const w = WISSEN.find((e) => e.id === id);
  if (w) {
    view.replaceChildren(el('a', { class: 'back', href: '#/' }, '‹ Übersicht'), el('h1', {}, w.titel));
    renderAntwort(view, w.antwort);
    window.scrollTo(0, 0);
    return;
  }
  const r = RECHNER[id];
  if (r) {
    const eintrag = EINTRAEGE.find((e) => e.id === id);
    view.replaceChildren(el('a', { class: 'back', href: '#/' }, '‹ Übersicht'), el('h1', {}, eintrag.titel));
    r(view);
  } else start();
  window.scrollTo(0, 0);
}

suche.addEventListener('input', () => {
  if (location.hash && location.hash !== '#/') location.hash = '#/';
  else route();
});
suche.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter') {
    const first = view.querySelector('a.tile');
    if (first) { suche.value = ''; suche.blur(); location.hash = first.getAttribute('href'); }
  }
});
document.querySelector('.home').addEventListener('click', () => { suche.value = ''; });
addEventListener('hashchange', route);
route();

// Offline-Status und Updates
const status = document.getElementById('status');
const setStatus = (t) => { status.textContent = `Version ${VERSION} · ${t}`; };
setStatus('…');
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js')
    .then(() => navigator.serviceWorker.ready)
    .then(() => setStatus('offline bereit ✓'))
    .catch(() => setStatus('Offline-Speicher fehlt!'));
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) document.getElementById('update').hidden = false;
  });
  document.getElementById('update-btn').addEventListener('click', () => location.reload());
} else setStatus('kein Offline-Speicher');
