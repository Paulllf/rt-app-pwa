// Oberfläche RC/RL/RLC-Netzwerk: Z₁ (Längsglied) und Z₂ (Querglied) wählen oder tippen,
// optional Zahlenwerte → Schaltbild, Fazit, Rechenweg (rechnet beim Tippen).
import { el } from './dom.js';
import { netzwerk } from '../rechner/netzwerk.js';
import { symName } from '../lib/netzwerk-algebra.js';
import { rechenweg, fazit, fehler, tasten } from './render.js';

const BEISPIELE = [
  ['K1 A13', 'C', 'R'],
  ['K2/K3 A13', 'R', 'L'],
  ['RC-Tiefpass', 'R', 'C'],
  ['LR', 'L', 'R'],
  ['RLC → u_C (PT2)', 'R+L', 'C'],
  ['Ü01 Netzwerk 1', 'R1', 'R3‖(R2+C)'],
  ['Ü01 Netzwerk 2', 'R', 'L‖C'],
  ['Ü01 Netzwerk 3', 'R+C', 'R‖C'],
];
const BAUSTEINE = ['R', 'L', 'C', 'R+L', 'R+C', 'L+C', 'R+L+C', 'R‖L', 'R‖C', 'L‖C'];

let zustand = { z1: 'C', z2: 'R', werte: {} };
try { Object.assign(zustand, JSON.parse(localStorage.getItem('netzwerk') || '{}')); } catch {}
if (!zustand.werte || typeof zustand.werte !== 'object') zustand.werte = {};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Schaltbild wie in der Klausur: Z₁ oben in Reihe, Z₂ senkrecht parallel zum Ausgang */
function schaltbild(t1, t2) {
  const d = el('div');
  d.style.cssText = 'max-width:520px;margin:0 0 12px;color:inherit';
  const w1 = Math.max(70, 12 * t1.length + 24), w2 = Math.max(60, 12 * t2.length + 24);
  const x1 = 150 - w1 / 2;
  d.innerHTML = `<svg viewBox="0 0 420 190" width="100%" role="img" aria-label="Schaltbild Spannungsteiler" style="font-family:inherit">
  <g fill="none" stroke="currentColor" stroke-width="2">
    <line x1="40" y1="40" x2="${x1}" y2="40"/><rect x="${x1}" y="24" width="${w1}" height="32" rx="4"/>
    <line x1="${x1 + w1}" y1="40" x2="380" y2="40"/>
    <line x1="270" y1="40" x2="270" y2="76"/><rect x="${270 - w2 / 2}" y="76" width="${w2}" height="40" rx="4"/>
    <line x1="270" y1="116" x2="270" y2="160"/><line x1="40" y1="160" x2="380" y2="160"/>
    <line x1="40" y1="56" x2="40" y2="146"/><line x1="380" y1="56" x2="380" y2="146"/>
  </g>
  <g fill="currentColor"><circle cx="270" cy="40" r="4"/><circle cx="270" cy="160" r="4"/>
    <path d="M34 140 L40 152 L46 140 Z"/><path d="M374 140 L380 152 L386 140 Z"/></g>
  <g fill="currentColor" font-size="17" text-anchor="middle">
    <text x="150" y="46">${esc(t1)}</text><text x="270" y="102">${esc(t2)}</text>
    <text x="150" y="16" font-size="14" opacity=".7">Z₁</text><text x="${270 + w2 / 2 + 16}" y="100" font-size="14" opacity=".7">Z₂</text>
    <text x="20" y="106" font-style="italic">uₑ</text><text x="402" y="106" font-style="italic">uₐ</text>
    <text x="230" y="32" font-size="14" font-style="italic">i</text><text x="330" y="32" font-size="14" font-style="italic">iₐ = 0</text>
  </g></svg>`;
  return d;
}

export function renderNetzwerk(view) {
  const box = el('div');
  view.append(box);
  let aktiv = null;
  let symboleAlt = '';

  function speichern() { try { localStorage.setItem('netzwerk', JSON.stringify(zustand)); } catch {} }

  const bild = el('div');
  const werteBox = el('div');
  const ergebnis = el('div');

  function feld(key, label, placeholder) {
    const inp = el('input', {
      type: 'text', value: zustand[key], placeholder, autocomplete: 'off', autocorrect: 'off',
      autocapitalize: 'characters', spellcheck: 'false',
      onfocus: () => { aktiv = inp; },
      oninput: () => { zustand[key] = inp.value; speichern(); rechne(); },
    });
    if (!aktiv) aktiv = inp;
    const wahl = el('div', { class: 'tasten' }, BAUSTEINE.map((b) => el('button', {
      type: 'button',
      onclick: () => { inp.value = b; zustand[key] = b; speichern(); aktiv = inp; rechne(); },
    }, b)));
    return [el('label', { class: 'feld' }, el('span', {}, label), inp), wahl];
  }

  function werteFelder(syms) {
    const key = syms.join(',');
    if (key === symboleAlt) return;
    symboleAlt = key;
    werteBox.replaceChildren(
      syms.length ? el('div', { class: 'vorschau' }, 'Zahlenwerte (optional, z. B. 100, 4,7k, 10µ, 0,5) – leer lassen = nur Formel:') : '',
      ...syms.map((s) => el('label', { class: 'feld' }, el('span', {}, symName(s) + (s[0] === 'R' ? ' in Ω' : s[0] === 'L' ? ' in H' : ' in F')),
        el('input', {
          type: 'text', inputmode: 'decimal', value: zustand.werte[s] ?? '', autocomplete: 'off', spellcheck: 'false',
          oninput: (ev) => { zustand.werte[s] = ev.target.value; speichern(); rechne(); },
        })))
    );
  }

  function rechne() {
    if (!zustand.z1.trim() || !zustand.z2.trim()) { ergebnis.replaceChildren(); bild.replaceChildren(); return; }
    try {
      const r = netzwerk(zustand);
      const st = r.schritte[0].zeilen;
      bild.replaceChildren(schaltbild(st[0].text.split(': ')[1], st[1].text.split(': ')[1]));
      werteFelder(r.symbole);
      ergebnis.replaceChildren(fazit(r.fazit, 'neutral'), rechenweg(r.schritte));
    } catch (e) {
      ergebnis.replaceChildren(fehler(e.message));
    }
  }

  function aufbau() {
    aktiv = null;
    symboleAlt = '';
    const bsp = BEISPIELE.map(([name, a, b]) => el('button', {
      type: 'button',
      onclick: () => { zustand.z1 = a; zustand.z2 = b; speichern(); aufbau(); },
    }, name));
    box.replaceChildren(
      el('div', { class: 'beispiele' }, 'Beispiele:', bsp),
      bild,
      ...feld('z1', 'Z₁ – Längsglied (oben, in Reihe zwischen uₑ und uₐ)', 'z. B. C oder R+L'),
      ...feld('z2', 'Z₂ – Querglied (senkrecht, parallel zum Ausgang uₐ)', 'z. B. R oder L‖C'),
      el('div', { class: 'vorschau' }, '+ = Reihe, ‖ = parallel (‖ bindet stärker), Klammern erlaubt. Gleiche Bauteile werden R₁, R₂ … nummeriert.'),
      tasten(() => aktiv, ['R', 'L', 'C', '+', '‖', '(', ')', '1', '2', '3']),
      werteBox,
      ergebnis
    );
    rechne();
  }

  aufbau();
}
