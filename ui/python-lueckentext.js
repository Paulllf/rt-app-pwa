// Oberfläche Python-Lückentexte: Lösung zum Abschreiben, Trainer, Spickzettel „Welche Lücke?“.
import { el } from './dom.js';
import { LUECKENTEXTE, SPICKZETTEL, teileZeile, pruefeLuecke } from '../inhalte/python-lueckentexte.js';

const KEY = 'python-lueckentext';
let zustand = { modus: 'loesung', k: 'K1', eingaben: {} };
try { Object.assign(zustand, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch {}
if (!LUECKENTEXTE.some((l) => l.id === zustand.k)) zustand.k = LUECKENTEXTE[0].id;
if (!zustand.eingaben || typeof zustand.eingaben !== 'object') zustand.eingaben = {};

const MONO = 'font:15px/1.55 ui-monospace,Menlo,monospace;';
const CODE_STIL = MONO + 'margin:12px 0;padding:14px 16px;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow-x:auto;white-space:pre;color:var(--ink);';
const LOESUNG_STIL = 'background:var(--ok-soft);color:var(--ok);font-weight:700;border-radius:6px;padding:1px 5px;';

function speichern() { try { localStorage.setItem(KEY, JSON.stringify(zustand)); } catch {} }

export function renderPythonLueckentext(view) {
  const box = el('div');
  view.append(box);

  function codeBlock(lt, fuelle) {
    const pre = el('pre', { style: CODE_STIL });
    lt.zeilen.forEach((z, i) => {
      const teile = teileZeile(z).map((t) => (typeof t === 'string' ? t : fuelle(t.luecke)));
      pre.append(...teile, i < lt.zeilen.length - 1 ? '\n' : '');
    });
    return pre;
  }

  function kopf(lt) {
    return [
      el('div', { class: 'vorschau' }, `${lt.aufgabe} · ${lt.gs}`),
      el('div', { class: 'vorschau' }, lt.bewertung),
      lt.hinweis ? el('div', { class: 'vorschau' }, lt.hinweis) : null,
    ];
  }

  function gruende(lt) {
    return el('ol', { class: 'weg' }, Object.entries(lt.luecken).map(([nr, l]) =>
      el('li', {}, el('h3', {}, `<${nr}> = ${l.loesung}`), el('div', { class: 'zeile' }, l.grund))));
  }

  function loesungsAnsicht(lt) {
    const code = codeBlock(lt, (nr) => el('span', { style: LOESUNG_STIL, title: `<${nr}>` }, lt.luecken[nr].loesung));
    return [
      ...kopf(lt),
      el('div', { class: 'fazit neutral' }, 'Grün = einzusetzen. Zahlen mit Kommata genau so abschreiben.'),
      code,
      el('h3', {}, 'Warum?'),
      gruende(lt),
    ];
  }

  function trainerAnsicht(lt) {
    const eing = zustand.eingaben[lt.id] || (zustand.eingaben[lt.id] = {});
    const felder = {};
    const status = el('div');
    const gruendeBox = el('div');

    const code = codeBlock(lt, (nr) => {
      const l = lt.luecken[nr];
      const inp = el('input', {
        type: 'text', value: eing[nr] || '', placeholder: nr, autocomplete: 'off', autocorrect: 'off',
        autocapitalize: 'off', spellcheck: 'false', 'aria-label': `Lücke ${nr}`,
        style: `${MONO}font-size:16px;height:34px;box-sizing:content-box;padding:0 6px;border-radius:8px;border:2px solid var(--line);background:var(--bg);color:var(--ink);width:${Math.max(6, l.loesung.length + 2)}ch;`,
        oninput: () => { eing[nr] = inp.value; speichern(); inp.style.borderColor = 'var(--line)'; status.replaceChildren(); },
      });
      felder[nr] = inp;
      return inp;
    });

    function pruefen() {
      let ok = 0;
      const nrs = Object.keys(lt.luecken);
      for (const nr of nrs) {
        const richtig = pruefeLuecke(lt.luecken[nr], felder[nr].value);
        felder[nr].style.borderColor = richtig ? 'var(--ok)' : 'var(--bad)';
        if (richtig) ok++;
      }
      const falsch = nrs.filter((nr) => !pruefeLuecke(lt.luecken[nr], felder[nr].value));
      status.replaceChildren(el('div', { class: 'fazit ' + (falsch.length ? 'bad' : 'ok') },
        falsch.length ? `${ok} von ${nrs.length} richtig. Falsch oder leer: ${falsch.map((n) => '<' + n + '>').join(' ')}` : `Alle ${nrs.length} Lücken richtig.`));
    }

    function zeigeLoesung() {
      for (const [nr, l] of Object.entries(lt.luecken)) {
        felder[nr].value = l.loesung; eing[nr] = l.loesung;
        felder[nr].style.borderColor = 'var(--ok)';
      }
      speichern();
      status.replaceChildren();
      gruendeBox.replaceChildren(el('h3', {}, 'Warum?'), gruende(lt));
    }

    function leeren() {
      for (const nr of Object.keys(lt.luecken)) { felder[nr].value = ''; felder[nr].style.borderColor = 'var(--line)'; }
      zustand.eingaben[lt.id] = {};
      for (const k of Object.keys(eing)) delete eing[k];
      speichern();
      status.replaceChildren(); gruendeBox.replaceChildren();
    }

    const knopf = (t, f) => el('button', { type: 'button', onclick: f, style: 'min-height:48px;padding:0 18px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;' }, t);

    return [
      ...kopf(lt),
      code,
      el('div', { class: 'beispiele' }, knopf('Prüfen', pruefen), knopf('Lösung zeigen', zeigeLoesung), knopf('Leeren', leeren)),
      status,
      gruendeBox,
    ];
  }

  function spickzettel() {
    return SPICKZETTEL.map((g) => el('section', {},
      el('h3', {}, g.gruppe),
      g.eintraege.map((e) => el('div', { style: 'background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin:8px 0;' },
        el('div', { style: MONO + 'font-weight:700;color:var(--accent);' }, e.name),
        el('div', {}, e.bedeutung),
        el('div', { class: 'meta' }, 'Kam vor: ' + e.vorkommen)))));
  }

  function aufbau() {
    const modusBtn = (m, t) => el('button', {
      type: 'button', class: zustand.modus === m ? 'on' : '',
      onclick: () => { zustand.modus = m; speichern(); aufbau(); },
    }, t);
    const kBtn = (lt) => el('button', {
      type: 'button', class: zustand.k === lt.id ? 'on' : '',
      onclick: () => { zustand.k = lt.id; speichern(); aufbau(); },
    }, lt.titel);

    const lt = LUECKENTEXTE.find((l) => l.id === zustand.k);
    const inhalt = zustand.modus === 'spick' ? spickzettel() : [
      el('div', { class: 'seg' }, LUECKENTEXTE.map(kBtn)),
      ...(zustand.modus === 'trainer' ? trainerAnsicht(lt) : loesungsAnsicht(lt)),
    ];

    box.replaceChildren(
      el('div', { class: 'seg' }, modusBtn('loesung', 'Lösung'), modusBtn('trainer', 'Trainer'), modusBtn('spick', 'Welche Lücke?')),
      ...inhalt
    );
  }

  aufbau();
}
