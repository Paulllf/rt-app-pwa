// DGL → G(s) per Laplace (Klausur A10). Reine Rechnung, keine Oberfläche.
// Differentiationssatz: n-te Ableitung ↔ sⁿ·X(s), alle Anfangswerte 0.
// Dann G(s) = Ausgang/Eingang = Z(s)/N(s), Nullstellen von Z(s) mit pq-Formel, Antwort zur Stabilität.

import { Q, qtrim, pfmt, pkl, nullstellenMitWeg, nullstellen, stabilitaet, wfmt } from '../lib/polynom-kern.js';
import { sup } from '../lib/poly.js';

const PRIME = /['’‘′`´]/g;

/**
 * Eine Seite der DGL lesen: "1638 x_a''' + 451 x_a'' + 38 x_a' + x_a"
 * Rückgabe: Liste {name, key, ord, c: Q}
 */
function leseSeite(text, seite) {
  let s = String(text)
    .replace(/[−–]/g, '-')
    .replace(/[·×*]/g, ' ')
    .replace(/″/g, "''").replace(/‴/g, "'''")
    .replace(/\(t\)/g, '')
    .trim();
  if (!s) throw new Error(`Die ${seite} Seite der DGL ist leer.`);
  // an + / − auf oberster Ebene trennen (Vorzeichen behalten)
  const teile = [];
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const prev = s.slice(0, i).trim().slice(-1);
    // "e-3" o. ä. gibt es nicht; ein +/− nach "/" wäre ein Bruch-Vorzeichen
    if ((ch === '+' || ch === '-') && cur.trim() && prev !== '/') { teile.push(cur); cur = ch; } else cur += ch;
  }
  teile.push(cur);
  return teile.map((t) => leseTerm(t, seite));
}

function leseTerm(roh, seite) {
  let t = roh.replace(/\s+/g, '');
  if (!t || t === '+' || t === '-') throw new Error(`Auf der ${seite} Seite fehlt ein Summand (doppeltes + oder −?).`);
  let ord = 0;
  // Striche zählen (auch iPad-Apostroph ’)
  ord += (t.match(PRIME) || []).length;
  t = t.replace(PRIME, '');
  // Punkte über dem Buchstaben (kombinierende Zeichen oder fertige Zeichen)
  ord += (t.match(/̇/g) || []).length + 2 * (t.match(/̈/g) || []).length + 3 * (t.match(/⃛/g) || []).length;
  t = t.replace(/[̇̈⃛]/g, '');
  const pre = { 'ẋ': ['x', 1], 'ẍ': ['x', 2], 'ẏ': ['y', 1], 'ÿ': ['y', 2] };
  t = t.replace(/[ẋẍẏÿ]/g, (m) => { ord += pre[m][1]; return pre[m][0]; });
  // y^(3), y⁽³⁾
  t = t.replace(/\^\((\d+)\)|⁽([⁰¹²³⁴⁵⁶⁷⁸⁹]+)⁾/g, (m, a, b) => {
    ord += a ? +a : +[...b].map((ch) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(ch)).join('');
    return '';
  });
  const m = /^([+-]?)((?:\d+(?:[.,]\d+)?|[.,]\d+)(?:\/(?:\d+(?:[.,]\d+)?))?)?([A-Za-zÄÖÜäöü][A-Za-z0-9ÄÖÜäöü]*(?:_[A-Za-z0-9]+)?)$/.exec(t);
  if (!m) {
    throw new Error(`„${roh.trim()}“ auf der ${seite} Seite nicht verstanden. Schreibweise z. B. 1638 x_a''' + 451 x_a'' + 38 x_a' + x_a (Ableitungen mit ').`);
  }
  let c = new Q(1);
  if (m[2]) {
    const [z, n] = m[2].split('/');
    c = Q.of(parseFloat(z.replace(',', '.')));
    if (n !== undefined) {
      const nn = parseFloat(n.replace(',', '.'));
      if (!nn) throw new Error('Division durch 0 in einem Koeffizienten.');
      c = c.div(Q.of(nn));
    }
  }
  if (m[1] === '-') c = c.neg();
  if (ord > 12) throw new Error('Ableitungsordnung über 12? Bitte Eingabe prüfen.');
  const name = m[3];
  return { name, key: name.replace(/_/g, '').toLowerCase(), ord, c };
}

/** "x_a" → "X_a(s)", "y" → "Y(s)" */
export const laplaceName = (name) => name[0].toUpperCase() + name.slice(1) + '(s)';
/** Zeitbereich mit Strichen: x_a'''(t) */
const zeitName = (name, ord) => name + "'".repeat(ord) + '(t)';

/** Seite als Text im Zeitbereich / Bildbereich */
function seiteText(terms, bild) {
  const parts = terms.filter((x) => !x.c.isZero()).map((x) => {
    const a = x.c.abs();
    const zahl = a.n === 1n && a.d === 1n ? '' : a.toString() + (bild ? '' : ' ');
    const body = bild
      ? zahl + (x.ord === 0 ? '' : 's' + (x.ord > 1 ? sup(x.ord) : '')) + laplaceName(x.name)
      : zahl + zeitName(x.name, x.ord);
    return { neg: x.c.sign() < 0, body };
  });
  if (!parts.length) return '0';
  return parts.map((p, i) => (i === 0 ? (p.neg ? '−' : '') + p.body : (p.neg ? ' − ' : ' + ') + p.body)).join('');
}

/**
 * Eingabe: { dgl: "1638 x_a''' + 451 x_a'' + 38 x_a' + x_a = 17 x_e'' + 86 x_e' + 5 x_e" }
 *   oder   { links: "...", rechts: "..." }
 * Ausgabe: { schritte, fazit, Z, N (Q-Polynome aufsteigend), nullstellen, pole, stabil, aus, ein }
 */
export function dgl(input) {
  let links = input.links, rechts = input.rechts;
  if (input.dgl !== undefined) {
    const t = String(input.dgl);
    const teile = t.split('=');
    if (teile.length !== 2) throw new Error('Die DGL braucht genau ein „=“: Ausgangsgröße links, Eingangsgröße rechts.');
    [links, rechts] = teile;
  }
  const L = leseSeite(links, 'linken');
  const R = leseSeite(rechts, 'rechten');

  // Größen bestimmen: Ausgang = erste Größe links, Eingang = die andere
  const namen = new Map();
  for (const x of [...L, ...R]) if (!namen.has(x.key)) namen.set(x.key, x.name);
  if (namen.size < 2) throw new Error('Es wird eine Ausgangsgröße (links, z. B. x_a oder y) und eine Eingangsgröße (rechts, z. B. x_e oder x) gebraucht.');
  if (namen.size > 2) throw new Error(`Zu viele Größen: ${[...namen.values()].join(', ')}. Erlaubt sind genau zwei (Ausgang und Eingang).`);
  const ausKey = L[0].key;
  const einKey = [...namen.keys()].find((k) => k !== ausKey);
  const aus = namen.get(ausKey), ein = namen.get(einKey);

  // Koeffizienten sammeln (alles mit Ausgang nach links, alles mit Eingang nach rechts)
  const nOrd = Math.max(...[...L, ...R].map((x) => x.ord));
  const Nk = Array.from({ length: nOrd + 1 }, () => new Q(0));
  const Zk = Array.from({ length: nOrd + 1 }, () => new Q(0));
  let umgestellt = false;
  for (const x of L) { if (x.key === ausKey) Nk[x.ord] = Nk[x.ord].add(x.c); else { Zk[x.ord] = Zk[x.ord].sub(x.c); umgestellt = true; } }
  for (const x of R) { if (x.key === einKey) Zk[x.ord] = Zk[x.ord].add(x.c); else { Nk[x.ord] = Nk[x.ord].sub(x.c); umgestellt = true; } }
  let N = qtrim(Nk), Z = qtrim(Zk);
  if (N.length === 1 && N[0].isZero()) throw new Error(`Die Ausgangsgröße ${aus} fällt komplett weg → keine Übertragungsfunktion.`);
  if (Z.length === 1 && Z[0].isZero()) throw new Error(`Die Eingangsgröße ${ein} fällt komplett weg → G(s) = 0.`);

  const Xa = laplaceName(aus), Xe = laplaceName(ein);
  const schritte = [];

  // 1. DGL
  const dglZeilen = [{ text: `${seiteText(L, false)} = ${seiteText(R, false)}` }];
  dglZeilen.push({ text: `Ausgangsgröße: ${aus}(t) → ${Xa} · Eingangsgröße: ${ein}(t) → ${Xe}`, muted: true });
  schritte.push({ titel: 'Gegebene DGL', zeilen: dglZeilen });

  // 2. Laplace
  const lap = [
    { text: 'Differentiationssatz (alle Anfangswerte = 0): n-te Ableitung ↔ sⁿ · X(s)', muted: true },
    { text: `${seiteText(L, true)} = ${seiteText(R, true)}` },
  ];
  if (umgestellt) {
    const aT = Nk.map((c, i) => ({ name: aus, ord: i, c })).reverse();
    const eT = Zk.map((c, i) => ({ name: ein, ord: i, c })).reverse();
    lap.push({ text: `umgestellt (${aus} nach links, ${ein} nach rechts): ${seiteText(aT, true)} = ${seiteText(eT, true)}` });
  }
  lap.push({ text: `[${pfmt(N)}] · ${Xa} = [${pfmt(Z)}] · ${Xe}`, strong: true });
  schritte.push({ titel: 'Laplace-Transformation', zeilen: lap });

  // 3. Übertragungsfunktion
  const Gt = `G(s) = ${Xa} / ${Xe} = Z(s)/N(s) = ${pkl(Z)} / ${pkl(N)}`;
  schritte.push({
    titel: 'Umformung: Übertragungsfunktion',
    zeilen: [
      { text: Gt, strong: true },
      { text: `Z(s) = ${pfmt(Z)}` },
      { text: `N(s) = ${pfmt(N)}` },
      { text: `Ausgang ${aus} → Nenner N(s), Eingang ${ein} → Zähler Z(s). Nicht verwechseln (Punktabzug)!`, muted: true },
    ],
  });

  // 4. Nullstellen von Z(s)
  const rz = nullstellenMitWeg(Z, { name: 'Z(s)', titelArt: 'Nullstellen' });
  rz.schritte.forEach((s) => { s.titel = s.titel.replace(/^Nullstellen mit pq-Formel$/, 'Nullstellen von Z(s) = 0 mit pq-Formel'); });
  schritte.push(...rz.schritte);

  // 5. Antwort Stabilität (wie Musterlösung K2/K3)
  schritte.push({
    titel: 'Stabilität: wie weiter? (Antwort zum Abschreiben)',
    zeilen: [
      { text: 'Wie weiter vorgehen? Man müsste die Polstellen der Übertragungsfunktion berechnen (Nullstellen des Nenners N(s) = 0) und prüfen, ob alle Pole in der linken Hälfte der komplexen Ebene liegen.' },
      { text: 'Was muss generell erfüllt sein? Alle Pole müssen in der linken Halbebene der komplexen Ebene liegen (Re{sᵢ} < 0).', strong: true },
      { text: 'Alternativ ohne Pole auszurechnen: Hurwitz-Kriterium auf N(s) (alle aᵢ > 0 und alle Hᵢ > 0). Die Nullstellen von Z(s) sind für die Stabilität egal.', muted: true },
    ],
  });

  // 6. Zusatz: Pole numerisch (nicht verlangt)
  const pole = nullstellen(N);
  const st = stabilitaet(pole);
  if (pole.length) {
    schritte.push({
      titel: 'Zusatz (nicht verlangt): Pole von N(s)',
      zeilen: [
        { text: `N(s) = ${pfmt(N)} = 0` },
        { text: pole.map((w, i) => `s${'₁₂₃₄₅₆₇₈₉'[i] || i + 1} = ${wfmt(w)}`).join(',  ') },
        { text: st.text, muted: true },
      ],
    });
  }

  const nl = rz.wurzeln.map((w, i) => `s${'₁₂₃₄₅₆₇₈₉'[i] || i + 1} = ${wfmt(w)}`).join(', ');
  return {
    schritte,
    fazit: `G(s) = ${pkl(Z)} / ${pkl(N)} · Nullstellen: ${nl || 'keine'}`,
    Z, N,
    nullstellen: rz.wurzeln,
    pole,
    stabil: st.stabil,
    aus, ein,
  };
}
