// Oberfläche SPS-Logik: Wahrheitstabelle antippen (oder Bedingung), Schaltung/Formel → Tabelle,
// Vorlage Selbsthaltung/Verriegelung. Zeigt FUP-Zeichnung + Rechenweg (rechnet sofort).
import { el } from './dom.js';
import { spsLogik, werteAusBedingung } from '../rechner/sps-logik.js';
import { fupSvg, srSvg } from '../lib/sps-logik-fup.js';
import { rechenweg, fazit, fehler, tasten } from './render.js';

const leer = (n) => Array(2 ** n).fill(0);
const STANDARD = {
  modus: 'tabelle',
  n: 3,
  eingaenge: ['L1', 'L2', 'L3', 'L4'],
  adressenE: ['', '', '', ''],
  ausgaenge: [{ name: 'Y1', werte: leer(3), bedingung: '' }],
  adressenA: ['', '', ''],
  zeigeAdressen: false,
  formel: '', formelAusgang: 'Y', formelEingaenge: '',
  sh: {
    ein: { name: 'Knopf_EIN', adr: '%E0.2', art: 'NO' }, aus: { name: 'Knopf_AUS', adr: '%E0.3', art: 'NC' },
    merker: { name: 'Steuerung_Ein', adr: '%M0.0' }, leuchte: { name: 'Meldeleuchte_Steuerung_EIN', adr: '%A0.4' },
    verriegelung: true,
    r: [
      { motor: { name: 'Motor_HOCH', adr: '%A0.0' }, taster: { name: 'Knopf_HOCH', adr: '%E0.4', art: 'NO' }, endschalter: { name: 'ES_oben', adr: '%E0.0', art: 'NC' } },
      { motor: { name: 'Motor_RUNTER', adr: '%A0.1' }, taster: { name: 'Knopf_RUNTER', adr: '%E0.5', art: 'NO' }, endschalter: { name: 'ES_unten', adr: '%E0.1', art: 'NC' } },
    ],
  },
};

let zustand = structuredClone(STANDARD);
try {
  const s = JSON.parse(localStorage.getItem('sps-logik') || '{}');
  if (s && typeof s === 'object') zustand = { ...zustand, ...s, sh: { ...zustand.sh, ...(s.sh || {}) } };
} catch {}

const BEISPIELE = [
  ['K1 SPS A3 (Lüfter)', () => {
    zustand.modus = 'tabelle'; zustand.n = 3; zustand.eingaenge = ['L1', 'L2', 'L3', 'L4'];
    zustand.ausgaenge = [
      { name: 'AMPEL_Rot', werte: werteAusBedingung('kein oder nur ein', 3), bedingung: 'kein oder nur ein' },
      { name: 'AMPEL_Gruen', werte: werteAusBedingung('mindestens 2', 3), bedingung: 'mindestens 2' },
    ];
    zustand.adressenE = ['', '', '', '']; zustand.adressenA = ['', '', ''];
  }],
  ['Ü09 A2 (XOR?)', () => {
    zustand.modus = 'formel'; zustand.formel = 'Eingang_0 & !Eingang_1 | !Eingang_0 & Eingang_1';
    zustand.formelAusgang = 'Ausgang_3'; zustand.formelEingaenge = '';
  }],
  ['K2 SPS A3 (Hebebühne)', () => { zustand.modus = 'selbsthaltung'; zustand.sh = structuredClone(STANDARD.sh); }],
];

/** Eingabefeld, das in zustand über get/set schreibt. */
function textfeld(label, get, set, onChange, placeholder = '') {
  const inp = el('input', {
    type: 'text', value: get() ?? '', placeholder, autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false',
    oninput: () => { set(inp.value); onChange(); },
  });
  return el('label', { class: 'feld' }, el('span', {}, label), inp);
}

const reihe = (...kids) => {
  const d = el('div', {}, kids);
  d.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap';
  kids.forEach((k) => { if (k) k.style.cssText = 'flex:1 1 140px;min-width:0'; });
  return d;
};

function svgBox(svgText) {
  const d = el('div');
  d.innerHTML = svgText; // eigener SVG-Text, Namen darin sind escaped
  return d;
}

export function renderSpsLogik(view) {
  const box = el('div');
  view.append(box);
  const ergebnis = el('div');
  let aktiv = null;

  function speichern() { try { localStorage.setItem('sps-logik', JSON.stringify(zustand)); } catch {} }
  const geaendert = () => { speichern(); rechne(); };

  function eingabe() {
    const n = zustand.n;
    if (zustand.modus === 'formel') {
      return {
        modus: 'formel', formel: zustand.formel, ausgang: zustand.formelAusgang,
        eingaenge: zustand.formelEingaenge.split(/[,;\s]+/).filter(Boolean),
      };
    }
    if (zustand.modus === 'selbsthaltung') {
      const sh = zustand.sh;
      return {
        modus: 'selbsthaltung', ein: sh.ein, aus: sh.aus, merker: sh.merker,
        leuchte: sh.leuchte.name.trim() ? sh.leuchte : null,
        richtungen: sh.verriegelung ? sh.r : null,
      };
    }
    return {
      modus: 'tabelle',
      eingaenge: zustand.eingaenge.slice(0, n),
      adressenE: zustand.zeigeAdressen ? zustand.adressenE.slice(0, n) : [],
      adressenA: zustand.zeigeAdressen ? zustand.adressenA : [],
      ausgaenge: zustand.ausgaenge.map((a) => ({ name: a.name, werte: a.werte, bedingung: a.bedingung || undefined })),
    };
  }

  function rechne() {
    if (zustand.modus === 'formel' && !zustand.formel.trim()) { ergebnis.replaceChildren(); return; }
    try {
      const r = spsLogik(eingabe());
      const bilder = (r.netze || []).flatMap((nz) => {
        const svg = nz.sr ? srSvg(nz.sr) : fupSvg(nz);
        return svg ? [el('div', { class: 'zeile strong' }, nz.titel), svgBox(svg)] : [];
      });
      ergebnis.replaceChildren(
        fazit(r.fazit, r.gegenprobe === false ? 'bad' : 'neutral'),
        bilder.length ? el('div', {}, el('h3', {}, 'FUP zum Abzeichnen'), bilder) : null,
        rechenweg(r.schritte)
      );
    } catch (e) {
      ergebnis.replaceChildren(fehler(e.message));
    }
  }

  // ---- Wahrheitstabelle zum Antippen ----
  function tabelle() {
    const n = zustand.n;
    const N = 2 ** n;
    const namen = zustand.eingaenge.slice(0, n).map((x, i) => x.trim() || `E${i + 1}`);
    const kopf = el('div', { class: 'tasten' },
      el('button', { type: 'button', disabled: true }, `${namen.slice().reverse().join(' ')} | dez`),
      zustand.ausgaenge.map((a, k) => el('button', { type: 'button', disabled: true }, a.name.trim() || `Y${k + 1}`)));
    const zeilen = Array.from({ length: N }, (_, z) => {
      const knoepfe = zustand.ausgaenge.map((a, k) => {
        const b = el('button', {
          type: 'button',
          onclick: () => {
            a.werte[z] = a.werte[z] ? 0 : 1; a.bedingung = '';
            b.textContent = String(a.werte[z]); farbe(b, a.werte[z]);
            geaendert();
          },
        }, String(a.werte[z] ? 1 : 0));
        b.style.minWidth = '96px';
        b.style.fontSize = '20px';
        farbe(b, a.werte[z]);
        return b;
      });
      const r = el('div', { class: 'tasten' },
        el('button', { type: 'button', disabled: true }, `${z.toString(2).padStart(n, '0')} | ${z}`), knoepfe);
      r.style.margin = '0 0 6px';
      return r;
    });
    return el('div', {}, kopf, zeilen);
  }
  function farbe(b, v) {
    b.style.background = v ? 'var(--accent)' : '';
    b.style.color = v ? 'var(--bg)' : '';
    b.style.fontWeight = v ? '700' : '';
  }

  function aufbauTabelle() {
    const n = zustand.n;
    const nSeg = el('div', { class: 'seg' }, [2, 3, 4].map((k) => el('button', {
      type: 'button', class: n === k ? 'on' : '',
      onclick: () => {
        zustand.n = k;
        zustand.ausgaenge.forEach((a) => { a.werte = a.bedingung ? safeBed(a.bedingung, k) : leer(k); });
        speichern(); aufbau();
      },
    }, `${k} Eingänge`)));

    const einFelder = reihe(...Array.from({ length: n }, (_, i) =>
      textfeld(`Eingang ${i + 1}${i === 0 ? ' (2⁰)' : ''}`, () => zustand.eingaenge[i], (v) => { zustand.eingaenge[i] = v; }, geaendert)));
    einFelder.querySelectorAll('input').forEach((x) => x.addEventListener('change', aufbau));

    const ausBloecke = zustand.ausgaenge.map((a, k) => {
      const bed = textfeld('Bedingung (optional)', () => a.bedingung, (v) => { a.bedingung = v; }, () => {}, 'z. B. mindestens 2');
      const bedInp = bed.querySelector('input');
      const fuellen = el('button', {
        type: 'button',
        onclick: () => {
          try { a.werte = werteAusBedingung(bedInp.value, n); a.bedingung = bedInp.value; speichern(); aufbau(); }
          catch (e) { ergebnis.replaceChildren(fehler(e.message)); }
        },
      }, '→ Tabelle füllen');
      const name = textfeld(`Ausgang ${k + 1}`, () => a.name, (v) => { a.name = v; }, geaendert);
      name.querySelector('input').addEventListener('change', aufbau);
      return el('div', {}, reihe(name, bed), el('div', { class: 'beispiele' }, fuellen,
        zustand.ausgaenge.length > 1 ? el('button', { type: 'button', onclick: () => { zustand.ausgaenge.splice(k, 1); speichern(); aufbau(); } }, 'Ausgang entfernen') : null));
    });
    const plus = zustand.ausgaenge.length < 3
      ? el('button', { type: 'button', onclick: () => { zustand.ausgaenge.push({ name: `Y${zustand.ausgaenge.length + 1}`, werte: leer(n), bedingung: '' }); speichern(); aufbau(); } }, '+ Ausgang')
      : null;
    const adrToggle = el('button', { type: 'button', onclick: () => { zustand.zeigeAdressen = !zustand.zeigeAdressen; speichern(); aufbau(); } },
      zustand.zeigeAdressen ? 'Adressen ausblenden (Standard %E0.0 …)' : 'Eigene Adressen eingeben');
    const adressen = zustand.zeigeAdressen ? el('div', {},
      reihe(...Array.from({ length: n }, (_, i) => textfeld(`Adr. ${zustand.eingaenge[i] || 'E' + (i + 1)}`, () => zustand.adressenE[i], (v) => { zustand.adressenE[i] = v; }, geaendert, `%E0.${i}`))),
      reihe(...zustand.ausgaenge.map((a, k) => textfeld(`Adr. ${a.name || 'Y' + (k + 1)}`, () => zustand.adressenA[k], (v) => { zustand.adressenA[k] = v; }, geaendert, `%A0.${k}`)))) : null;

    return [nSeg, einFelder, ...ausBloecke, el('div', { class: 'beispiele' }, plus, adrToggle), adressen,
      el('h3', {}, 'Wahrheitstabelle – Ausgang antippen (0 ↔ 1)'), tabelle()];
  }

  function aufbauFormel() {
    const f = textfeld('Formel / Schaltung (∧ & · UND, ∨ + | ODER, ¬ ! NICHT, ⊕ XOR)', () => zustand.formel, (v) => { zustand.formel = v; }, geaendert, 'z. B. (A ∧ ¬B) ∨ (¬A ∧ B)');
    aktiv = f.querySelector('input');
    return [
      f,
      tasten(() => aktiv, ['∧', '∨', '¬', '⊕', '(', ')']),
      reihe(
        textfeld('Ausgang', () => zustand.formelAusgang, (v) => { zustand.formelAusgang = v; }, geaendert, 'Y'),
        textfeld('Eingänge in Reihenfolge (optional)', () => zustand.formelEingaenge, (v) => { zustand.formelEingaenge = v; }, geaendert, 'A, B, C'),
      ),
      el('div', { class: 'vorschau' }, 'Tipp: Jedes &-Glied der Zeichnung als Klammer schreiben, Negationskreis = ¬.'),
    ];
  }

  function aufbauSelbsthaltung() {
    const sh = zustand.sh;
    const paar = (titel, obj, mitArt) => {
      const teile = [
        textfeld(titel, () => obj.name, (v) => { obj.name = v; }, geaendert),
        textfeld('Adresse', () => obj.adr, (v) => { obj.adr = v; }, geaendert),
      ];
      if (mitArt) {
        teile.push(el('div', { class: 'seg' }, ['NO', 'NC'].map((a) => el('button', {
          type: 'button', class: obj.art === a ? 'on' : '',
          onclick: () => { obj.art = a; speichern(); aufbau(); },
        }, a === 'NO' ? 'NO Schließer' : 'NC Öffner'))));
      }
      return reihe(...teile);
    };
    const teile = [
      paar('EIN-Taster', sh.ein, true),
      paar('AUS-Taster', sh.aus, true),
      paar('Merker (Speicher)', sh.merker),
      paar('Meldeleuchte (leer = keine)', sh.leuchte),
      el('div', { class: 'seg' },
        el('button', { type: 'button', class: sh.verriegelung ? 'on' : '', onclick: () => { sh.verriegelung = true; speichern(); aufbau(); } }, 'Mit Verriegelung (2 Richtungen)'),
        el('button', { type: 'button', class: sh.verriegelung ? '' : 'on', onclick: () => { sh.verriegelung = false; speichern(); aufbau(); } }, 'Nur Selbsthaltung')),
    ];
    if (sh.verriegelung) {
      sh.r.forEach((r, i) => {
        teile.push(el('h3', {}, `Richtung ${i + 1}`));
        teile.push(paar('Motor (Ausgang)', r.motor));
        teile.push(paar('Taster', r.taster, true));
        teile.push(paar('Endschalter', r.endschalter, true));
      });
    }
    return teile;
  }

  function aufbau() {
    aktiv = null;
    const modusBtn = (m, t) => el('button', {
      type: 'button', class: zustand.modus === m ? 'on' : '',
      onclick: () => { zustand.modus = m; speichern(); aufbau(); },
    }, t);
    const inhalt = zustand.modus === 'formel' ? aufbauFormel()
      : zustand.modus === 'selbsthaltung' ? aufbauSelbsthaltung() : aufbauTabelle();
    const bsp = BEISPIELE.map(([name, f]) => el('button', { type: 'button', onclick: () => { f(); speichern(); aufbau(); } }, name));
    box.replaceChildren(
      el('div', { class: 'seg' }, modusBtn('tabelle', 'Wahrheitstabelle'), modusBtn('formel', 'Schaltung → Tabelle'), modusBtn('selbsthaltung', 'Selbsthaltung')),
      el('div', { class: 'beispiele' }, 'Beispiele:', bsp),
      ...inhalt,
      ergebnis
    );
    rechne();
  }

  aufbau();
}

function safeBed(text, n) {
  try { return werteAusBedingung(text, n); } catch { return leer(n); }
}
