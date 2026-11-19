// SPS-Logik mit Rechenweg: Wahrheitstabelle → DNF → vereinfacht (KV/Quine-McCluskey) → Formel, FUP, Adressen.
// Konvention wie Musterlösung K1 SPS A3: Tabelle „L3, L2, L1 | dez“, d. h. der ERSTE Eingang (L1) ist das
// niederwertigste Bit (2⁰) und bekommt auch die erste Adresse %E0.0. Reine Rechnung, kein DOM.

import { sub } from '../lib/poly.js';

// ---------- Hilfen ----------

const bit = (zeile, i) => (zeile >> i) & 1;
const anzahlEinsen = (z) => z.toString(2).split('').filter((c) => c === '1').length;
const binaer = (z, n) => z.toString(2).padStart(n, '0'); // Darstellung Lₙ … L1 (wie Prof)

/** Adresse normalisieren: „e0.0“ → „%E0.0“, „I 1.3“ → „%I1.3“. Leer → null. */
export function normAdresse(text) {
  const s = String(text ?? '').trim();
  if (!s) return null;
  const m = s.match(/^%?\s*([EAIQM])\s*(\d+)\s*[.,]\s*(\d+)$/i);
  if (!m) return s;
  return `%${m[1].toUpperCase()}${m[2]}.${m[3]}`;
}

/** Standardadressen: %E0.0 … %E0.7, %E1.0 … */
export function standardAdresse(prefix, i) {
  return `%${prefix}${Math.floor(i / 8)}.${i % 8}`;
}

// ---------- Textbedingung („mindestens 2 von 3“) ----------

const ZAHLWORT = [
  [/\b(keiner|keine|keinen|kein)\b/g, '0'], [/\b(null)\b/g, '0'],
  [/\b(eins|einer|eine|einen|ein)\b/g, '1'], [/\bzwei\b/g, '2'], [/\bdrei\b/g, '3'], [/\bvier\b/g, '4'],
];

/**
 * Bedingung über die ANZAHL der Eingänge mit 1 → Werte der Ausgangsspalte.
 * Versteht: mindestens/höchstens/genau/mehr als/weniger als k, ≥k, ≤k, >k, <k, =k, kein, alle, gerade, ungerade,
 * Kombinationen mit „oder“ / Komma und „und“. Beispiel: „kein oder nur ein“ → genau 0 oder genau 1.
 */
export function werteAusBedingung(text, n) {
  let s = ' ' + String(text ?? '').toLowerCase().replace(/≥/g, '>=').replace(/≤/g, '<=').replace(/−/g, '-') + ' ';
  if (!s.trim()) throw new Error('Bedingung eingeben, z. B. „mindestens 2“ oder „kein oder nur ein“.');
  s = s.replace(/\balle\b/g, String(n));
  for (const [re, z] of ZAHLWORT) s = s.replace(re, z);
  s = s.replace(/von\s*\d+/g, ' '); // „2 von 3“ → die 3 ist die Gesamtzahl
  const oderTeile = s.split(/\boder\b|,|;|\|/);
  const preds = oderTeile.map((teil) => {
    const undTeile = teil.split(/\bund\b|&/).map((t) => t.trim()).filter(Boolean);
    const ps = undTeile.map(einzel);
    if (!ps.length || ps.some((p) => !p)) return null;
    return (c) => ps.every((p) => p(c));
  }).filter((p, i) => p || oderTeile[i].trim());
  if (!preds.length || preds.some((p) => !p)) {
    throw new Error('Bedingung nicht verstanden. Beispiele: „mindestens 2“, „≥2“, „höchstens 1“, „genau 1“, „kein oder nur ein“, „alle“, „ungerade“.');
  }
  return Array.from({ length: 2 ** n }, (_, z) => (preds.some((p) => p(anzahlEinsen(z))) ? 1 : 0));

  function einzel(t) {
    let m;
    if (/ungerade/.test(t)) return (c) => c % 2 === 1;
    if (/gerade/.test(t)) return (c) => c % 2 === 0;
    if ((m = t.match(/(mindestens|wenigstens|min\.?|>=)\s*(\d+)/))) { const k = +m[2]; return (c) => c >= k; }
    if ((m = t.match(/(höchstens|hoechstens|maximal|max\.?|<=)\s*(\d+)/))) { const k = +m[2]; return (c) => c <= k; }
    if ((m = t.match(/(mehr als|>)\s*(\d+)/))) { const k = +m[2]; return (c) => c > k; }
    if ((m = t.match(/(weniger als|<)\s*(\d+)/))) { const k = +m[2]; return (c) => c < k; }
    if ((m = t.match(/(genau|nur|=)?\s*(\d+)/))) { const k = +m[2]; return (c) => c === k; }
    return null;
  }
}

// ---------- Formel-Parser (für Schaltung → Tabelle und als Gegenprobe) ----------

/**
 * Formel → Syntaxbaum. Erlaubt: ∧ & · * AND UND | ∨ + OR ODER | ⊕ ^ XOR | ¬ ! ~ / NOT NICHT, nachgestelltes ',
 * Klammern, 0/1. Zwei Namen nebeneinander (mit Leerzeichen) = UND. Rangfolge: NICHT vor UND vor XOR vor ODER.
 */
export function parseFormel(text) {
  const src = String(text ?? '');
  const toks = [];
  const re = /\s*(?:(\(|\))|(∧|&&?|·|\*)|(∨|\|\|?|\+|>=1|≥1)|(⊕|\^)|(¬|!|~|\/)|(')|(%?[A-Za-zÄÖÜäöüß_][\wÄÖÜäöüß.]*|%[EAIQMeaiqm]\s*\d+\.\d+)|([01]))/y;
  let pos = 0;
  while (pos < src.length) {
    if (/^\s*$/.test(src.slice(pos))) break;
    re.lastIndex = pos;
    const m = re.exec(src);
    if (!m) throw new Error(`Formel: unbekanntes Zeichen „${src.slice(pos).trim()[0]}“. Erlaubt: ∧ & ∨ + ¬ ! ⊕ ( ) und Namen.`);
    pos = re.lastIndex;
    if (m[1]) toks.push({ t: m[1] });
    else if (m[2]) toks.push({ t: 'and' });
    else if (m[3]) toks.push({ t: 'or' });
    else if (m[4]) toks.push({ t: 'xor' });
    else if (m[5]) toks.push({ t: 'not' });
    else if (m[6]) toks.push({ t: "'" });
    else if (m[7]) {
      const w = m[7];
      const up = w.toUpperCase();
      if (up === 'AND' || up === 'UND') toks.push({ t: 'and' });
      else if (up === 'OR' || up === 'ODER') toks.push({ t: 'or' });
      else if (up === 'XOR') toks.push({ t: 'xor' });
      else if (up === 'NOT' || up === 'NICHT') toks.push({ t: 'not' });
      else toks.push({ t: 'var', name: /^%/.test(w) ? normAdresse(w) : w });
    } else toks.push({ t: 'const', v: +m[8] });
  }
  if (!toks.length) throw new Error('Formel eingeben, z. B. (A ∧ ¬B) ∨ (¬A ∧ B)');
  let i = 0;
  const peek = () => toks[i]?.t;
  const startPrimary = () => ['(', 'not', 'var', 'const'].includes(peek());
  function or() { let l = xor(); while (peek() === 'or') { i++; l = { op: 'or', a: l, b: xor() }; } return l; }
  function xor() { let l = and(); while (peek() === 'xor') { i++; l = { op: 'xor', a: l, b: and() }; } return l; }
  function and() {
    let l = not();
    for (;;) {
      if (peek() === 'and') { i++; l = { op: 'and', a: l, b: not() }; }
      else if (startPrimary()) l = { op: 'and', a: l, b: not() }; // nebeneinander = UND
      else return l;
    }
  }
  function not() {
    if (peek() === 'not') { i++; return post({ op: 'not', a: not() }); }
    return post(prim());
  }
  function post(x) { while (peek() === "'") { i++; x = { op: 'not', a: x }; } return x; }
  function prim() {
    const t = toks[i];
    if (!t) throw new Error('Formel endet zu früh (fehlt ein Name nach einem Operator?).');
    if (t.t === '(') {
      i++;
      const x = or();
      if (peek() !== ')') throw new Error('Formel: schließende Klammer „)“ fehlt.');
      i++;
      return x;
    }
    if (t.t === 'var') { i++; return { op: 'var', name: t.name }; }
    if (t.t === 'const') { i++; return { op: 'const', v: t.v }; }
    throw new Error(`Formel: an Stelle ${i + 1} wird ein Name oder „(“ erwartet.`);
  }
  const baum = or();
  if (i < toks.length) throw new Error('Formel: Rest nicht verstanden (Klammer zu viel?).');
  return baum;
}

export function variablen(baum, liste = []) {
  if (baum.op === 'var') { if (!liste.includes(baum.name)) liste.push(baum.name); }
  else if (baum.a) { variablen(baum.a, liste); if (baum.b) variablen(baum.b, liste); }
  return liste;
}

/** Baum auswerten. belegung: { Name: 0|1 } */
export function auswerten(baum, belegung) {
  switch (baum.op) {
    case 'var': {
      if (!(baum.name in belegung)) throw new Error(`Formel: „${baum.name}“ ist kein Eingang.`);
      return belegung[baum.name] ? 1 : 0;
    }
    case 'const': return baum.v;
    case 'not': return 1 - auswerten(baum.a, belegung);
    case 'and': return auswerten(baum.a, belegung) & auswerten(baum.b, belegung);
    case 'or': return auswerten(baum.a, belegung) | auswerten(baum.b, belegung);
    case 'xor': return auswerten(baum.a, belegung) ^ auswerten(baum.b, belegung);
  }
  throw new Error('Formel kaputt.');
}

function baumText(b, oben = 'or') {
  const rang = { or: 1, xor: 2, and: 3 };
  switch (b.op) {
    case 'var': return b.name;
    case 'const': return String(b.v);
    case 'not': return '¬' + (b.a.op === 'var' || b.a.op === 'const' || b.a.op === 'not' ? baumText(b.a) : `(${baumText(b.a)})`);
    default: {
      const zeichen = { and: ' ∧ ', or: ' ∨ ', xor: ' ⊕ ' }[b.op];
      const t = baumText(b.a, b.op) + zeichen + baumText(b.b, b.op);
      return rang[b.op] < rang[oben] || (b.op !== oben && oben !== 'or') ? `(${t})` : t;
    }
  }
}

// ---------- Terme (Konjunktionen) ----------
// Implikant: Array der Länge n mit 1 (Eingang), 0 (negiert) oder null (fällt weg).

const literale = (imp) => imp.map((v, i) => (v === null ? null : { i, neg: v === 0 })).filter(Boolean);

function termText(imp, namen, stil) {
  const lit = literale(imp);
  if (!lit.length) return '1';
  if (stil === 'st') return lit.map((l) => (l.neg ? 'NOT ' : '') + namen[l.i]).join(' AND ');
  if (stil === 'kurz') return lit.map((l) => (l.neg ? '¬' : '') + namen[l.i]).join('·');
  return lit.map((l) => (l.neg ? '¬' : '') + namen[l.i]).join(' ∧ ');
}

/** Disjunktion von Termen als Text. stil: 'lang' (∧/∨), 'kurz' (· und +), 'st' (AND/OR) */
export function formelText(terme, namen, stil = 'lang') {
  if (!terme.length) return stil === 'st' ? 'FALSE' : '0';
  if (terme.length === 1 && !literale(terme[0]).length) return stil === 'st' ? 'TRUE' : '1';
  const teile = terme.map((t) => {
    const s = termText(t, namen, stil);
    return terme.length > 1 && literale(t).length > 1 && stil !== 'kurz' ? `(${s})` : s;
  });
  return teile.join(stil === 'st' ? ' OR ' : stil === 'kurz' ? ' + ' : ' ∨ ');
}

const termWert = (imp, z) => imp.every((v, i) => v === null || bit(z, i) === v);
export const termeWert = (terme, z) => (terme.some((t) => termWert(t, z)) ? 1 : 0);

// ---------- Quine-McCluskey ----------

const schluessel = (imp) => imp.map((v) => (v === null ? '-' : v)).join('');
/** Muster wie im KV/Tabellenkopf: Lₙ … L1, „-“ = fällt weg */
const muster = (imp) => imp.slice().reverse().map((v) => (v === null ? '-' : v)).join('');

export function quineMcCluskey(minterme, n) {
  let ebene = minterme.map((m) => ({ imp: Array.from({ length: n }, (_, i) => bit(m, i)), ms: [m] }));
  const prim = [];
  const verschmelzungen = []; // pro Stufe: [{a, b, c}]
  while (ebene.length) {
    const naechste = new Map();
    const benutzt = new Set();
    const stufe = [];
    for (let x = 0; x < ebene.length; x++) {
      for (let y = x + 1; y < ebene.length; y++) {
        const A = ebene[x].imp, B = ebene[y].imp;
        let diff = -1, ok = true;
        for (let i = 0; i < n && ok; i++) {
          if ((A[i] === null) !== (B[i] === null)) ok = false;
          else if (A[i] !== B[i]) { if (diff >= 0) ok = false; else diff = i; }
        }
        if (!ok || diff < 0) continue;
        const imp = A.slice(); imp[diff] = null;
        const ms = [...new Set([...ebene[x].ms, ...ebene[y].ms])].sort((p, q) => p - q);
        benutzt.add(x); benutzt.add(y);
        const k = schluessel(imp);
        if (!naechste.has(k)) { naechste.set(k, { imp, ms }); stufe.push({ a: ebene[x], b: ebene[y], c: { imp, ms }, weg: diff }); }
      }
    }
    ebene.forEach((e, idx) => { if (!benutzt.has(idx)) prim.push(e); });
    if (stufe.length) verschmelzungen.push(stufe);
    ebene = [...naechste.values()];
  }
  // Überdeckung: Kern-Primimplikanten, dann kleinste Auswahl (wenigste Terme, dann wenigste Literale)
  const deckt = (p, m) => p.ms.includes(m);
  const kern = [];
  for (const m of minterme) {
    const ps = prim.filter((p) => deckt(p, m));
    if (ps.length === 1 && !kern.includes(ps[0])) kern.push(ps[0]);
  }
  const rest = minterme.filter((m) => !kern.some((p) => deckt(p, m)));
  const kandidaten = prim.filter((p) => !kern.includes(p));
  let auswahl = [];
  if (rest.length) {
    const kosten = (s) => s.length * 100 + s.reduce((a, p) => a + literale(p.imp).length, 0);
    let best = null;
    for (let k = 1; k <= kandidaten.length && !best; k++) {
      kombis(kandidaten, k, (s) => {
        if (rest.every((m) => s.some((p) => deckt(p, m))) && (!best || kosten(s) < kosten(best))) best = s.slice();
      });
    }
    auswahl = best || [];
  }
  const ordne = (a, b) => literale(a.imp).length - literale(b.imp).length || vergleiche(a.imp, b.imp);
  const gewaehlt = [...kern, ...auswahl].sort(ordne);
  return { prim: prim.sort(ordne), kern, auswahl, gewaehlt, verschmelzungen };
}

function vergleiche(a, b) {
  const la = literale(a), lb = literale(b);
  for (let k = 0; k < Math.min(la.length, lb.length); k++) {
    if (la[k].i !== lb[k].i) return la[k].i - lb[k].i;
    if (la[k].neg !== lb[k].neg) return la[k].neg ? 1 : -1;
  }
  return la.length - lb.length;
}

function kombis(arr, k, f, start = 0, akt = []) {
  if (akt.length === k) { f(akt); return; }
  for (let i = start; i < arr.length; i++) { akt.push(arr[i]); kombis(arr, k, f, i + 1, akt); akt.pop(); }
}

// ---------- KV-Diagramm ----------

const GRAY = { 1: [0, 1], 2: [0, 1, 3, 2] };

function kvMatrix(werte, n, namen) {
  const nc = n === 2 ? 1 : 2;           // Spalten: L1 (n=2) bzw. L2 L1
  const nr = n - nc;                    // Zeilen: der Rest
  const cols = GRAY[nc], rows = GRAY[nr];
  const cn = Array.from({ length: nc }, (_, k) => namen[nc - 1 - k]).join(' ');
  const rn = Array.from({ length: nr }, (_, k) => namen[n - 1 - k]).join(' ');
  const kopf = [`${rn} \\ ${cn}`, ...cols.map((c) => binaer(c, nc))];
  const zeilen = rows.map((r) => [binaer(r, nr), ...cols.map((c) => {
    const z = (r << nc) | c;
    return `${werte[z]}  (${z})`;
  })]);
  return [kopf, ...zeilen];
}

// ---------- Bekannte Funktionen erkennen ----------

function erkenne(werte, n, namen) {
  const N = 2 ** n;
  const eins = werte.filter((w) => w).length;
  if (eins === 0) return 'immer 0';
  if (eins === N) return 'immer 1';
  const gleich = (f) => werte.every((w, z) => w === f(z));
  const c = (z) => anzahlEinsen(z);
  if (gleich((z) => (c(z) === n ? 1 : 0))) return `UND-Verknüpfung aller Eingänge (&)`;
  if (gleich((z) => (c(z) >= 1 ? 1 : 0))) return `ODER-Verknüpfung aller Eingänge (>=1)`;
  if (gleich((z) => (c(z) === n ? 0 : 1))) return `NAND (nicht UND)`;
  if (gleich((z) => (c(z) === 0 ? 1 : 0))) return `NOR (nicht ODER)`;
  if (gleich((z) => c(z) % 2)) return n === 2 ? 'XOR (Exklusiv-ODER, =1): genau ein Eingang ist 1' : 'XOR-Kette (ungerade Anzahl Einsen)';
  if (gleich((z) => 1 - (c(z) % 2))) return n === 2 ? 'XNOR (Äquivalenz): beide Eingänge gleich' : 'XNOR (gerade Anzahl Einsen)';
  for (let i = 0; i < n; i++) {
    if (gleich((z) => bit(z, i))) return `nur ${namen[i]} (die anderen Eingänge spielen keine Rolle)`;
    if (gleich((z) => 1 - bit(z, i))) return `NICHT ${namen[i]}`;
  }
  // symmetrisch (nur die Anzahl zählt)?
  const proAnzahl = new Map();
  for (let z = 0; z < N; z++) {
    if (proAnzahl.has(c(z)) && proAnzahl.get(c(z)) !== werte[z]) return null;
    proAnzahl.set(c(z), werte[z]);
  }
  const ks = [...proAnzahl].filter(([, w]) => w).map(([k]) => k).sort((a, b) => a - b);
  if (ks.every((k, j) => k === ks[0] + j)) {
    if (ks.at(-1) === n) return `mindestens ${ks[0]} von ${n} Eingängen sind 1`;
    if (ks[0] === 0) return `höchstens ${ks.at(-1)} von ${n} Eingängen sind 1`;
    return ks.length === 1 ? `genau ${ks[0]} von ${n} Eingängen sind 1` : `${ks[0]} bis ${ks.at(-1)} von ${n} Eingängen sind 1`;
  }
  return `Anzahl der Einsen ∈ {${ks.join(', ')}}`;
}

// ---------- FUP-Beschreibung ----------

/** Netz für die Zeichnung: { terme: [[{name, adr, neg}]], ausgang: {name, adr} } */
function netz(terme, namen, adrE, ausgang) {
  return {
    terme: terme.map((t) => literale(t).map((l) => ({ name: namen[l.i], adr: adrE[l.i], neg: l.neg }))),
    ausgang,
  };
}

function fupZeilen(terme, namen, adrE, ausgang) {
  const lit = (l) => `${namen[l.i]}${adrE[l.i] ? ` (${adrE[l.i]})` : ''}${l.neg ? ' mit Negation ○' : ''}`;
  const aus = `„=“ ${ausgang.name}${ausgang.adr ? ` (${ausgang.adr})` : ''}`;
  if (!terme.length) return [{ text: `Ausgang immer 0: ${aus} bekommt FALSE (0) – kein Gatter nötig.`, indent: true }];
  if (terme.length === 1 && !literale(terme[0]).length) return [{ text: `Ausgang immer 1: ${aus} bekommt TRUE (1).`, indent: true }];
  const z = [];
  const eingaengeOder = [];
  let nr = 0;
  for (const t of terme) {
    const ls = literale(t);
    if (ls.length === 1) { eingaengeOder.push(lit(ls[0])); continue; }
    nr++;
    z.push({ text: `&-Glied ${nr} (UND): Eingänge ${ls.map(lit).join(', ')}`, indent: true });
    eingaengeOder.push(`Ausgang &-Glied ${nr}`);
  }
  if (terme.length > 1) {
    z.push({ text: `>=1-Glied (ODER) mit ${terme.length} Eingängen: ${eingaengeOder.join(', ')}`, indent: true });
    z.push({ text: `Ausgang >=1-Glied → Zuweisung ${aus}`, indent: true });
  } else {
    z.push({ text: `${nr ? 'Ausgang &-Glied 1' : eingaengeOder[0]} → Zuweisung ${aus}`, indent: true });
  }
  const anzahl = nr + (terme.length > 1 ? 1 : 0);
  z.push({ text: `Bausteine: ${nr} × &${terme.length > 1 ? ', 1 × >=1' : ''}, 1 × =  (${anzahl} Logikgatter)`, muted: true, indent: true });
  return z;
}

// ---------- Hauptfunktion ----------

function pruefeNamen(liste, art, def) {
  const namen = liste.map((x, i) => String(x ?? '').trim() || `${def}${i + 1}`);
  namen.forEach((x) => {
    if (!/^[A-Za-zÄÖÜäöüß_][\wÄÖÜäöüß]*$/.test(x)) throw new Error(`${art} „${x}“: Name bitte ohne Leerzeichen/Sonderzeichen (z. B. L1, AMPEL_Rot).`);
  });
  const doppelt = namen.find((x, i) => namen.indexOf(x) !== i);
  if (doppelt) throw new Error(`${art} „${doppelt}“ kommt doppelt vor.`);
  return namen;
}

/**
 * Eingabe:
 *   { modus: 'tabelle', eingaenge: ['L1','L2','L3'], ausgaenge: [{ name: 'AMPEL_Gruen', werte: [0,0,0,1,0,1,1,1] }],
 *     adressenE?: ['%E0.0', …], adressenA?: ['%A0.0', …] }
 *     werte[z] gehört zur Zeile z = dez (Bit i von z = Eingang i, L1 = 2⁰).
 *   { modus: 'bedingung', eingaenge, ausgaenge: [{ name, bedingung: 'mindestens 2' }], … }
 *   { modus: 'formel', formel: 'A ∧ ¬B ∨ ¬A ∧ B', ausgang?: 'C', eingaenge?: ['A','B'] }  (Schaltung → Tabelle)
 *   { modus: 'selbsthaltung', … }  → siehe selbsthaltung()
 */
export function spsLogik(input) {
  if (input.modus === 'selbsthaltung') return selbsthaltung(input);
  const schritte = [];
  let namen, ausgaenge, formelBaum = null;

  if (input.modus === 'formel') {
    formelBaum = parseFormel(input.formel);
    const vars = variablen(formelBaum);
    const gegeben = (input.eingaenge || []).map((x) => String(x ?? '').trim()).filter(Boolean);
    namen = gegeben.length ? gegeben : vars;
    const fremd = vars.filter((v) => !namen.includes(v));
    if (fremd.length) throw new Error(`In der Formel steht ${fremd.join(', ')}, das ist kein Eingang.`);
    if (namen.length < 1 || namen.length > 4) throw new Error(`Formel hat ${namen.length} Eingänge – erlaubt sind 1 bis 4.`);
    const aName = String(input.ausgang ?? '').trim() || 'Y';
    const werte = Array.from({ length: 2 ** namen.length }, (_, z) =>
      auswerten(formelBaum, Object.fromEntries(namen.map((v, i) => [v, bit(z, i)]))));
    ausgaenge = [{ name: aName, werte }];
  } else {
    const nIn = (input.eingaenge || []).length;
    if (nIn < 1 || nIn > 4) throw new Error('1 bis 4 Eingänge möglich.');
    namen = pruefeNamen(input.eingaenge, 'Eingang', 'E');
    const aNamen = pruefeNamen((input.ausgaenge || []).map((a) => a.name), 'Ausgang', 'Y');
    if (!aNamen.length) throw new Error('Mindestens einen Ausgang angeben.');
    ausgaenge = input.ausgaenge.map((a, k) => {
      const werte = input.modus === 'bedingung' || (a.bedingung && !a.werte)
        ? werteAusBedingung(a.bedingung, nIn)
        : (a.werte || []).map((w) => (w ? 1 : 0));
      if (werte.length !== 2 ** nIn) throw new Error(`Ausgang ${aNamen[k]}: ${2 ** nIn} Werte nötig, ${werte.length} da.`);
      return { name: aNamen[k], werte, bedingung: a.bedingung };
    });
  }

  const n = namen.length;
  const N = 2 ** n;
  const alle = [...namen, ...ausgaenge.map((a) => a.name)];
  const doppelt = alle.find((x, i) => alle.indexOf(x) !== i);
  if (doppelt) throw new Error(`Name „${doppelt}“ ist doppelt (Ein- und Ausgang brauchen verschiedene Namen).`);

  const adrE = namen.map((_, i) => normAdresse(input.adressenE?.[i]) || standardAdresse('E', i));
  const adrA = ausgaenge.map((_, k) => normAdresse(input.adressenA?.[k]) || standardAdresse('A', k));
  const eigeneAdr = (input.adressenE || []).some((x) => String(x ?? '').trim()) || (input.adressenA || []).some((x) => String(x ?? '').trim());

  // Schritt: Formel → Tabelle (Schaltung analysieren)
  if (formelBaum) {
    const zeilen = [{ text: `Gegeben: ${ausgaenge[0].name} = ${baumText(formelBaum)}` }];
    // Zwischenergebnisse: Glieder unter dem obersten Operator
    const glieder = [];
    const sammle = (b) => { if (b.op === formelBaum.op && (b.op === 'or' || b.op === 'xor' || b.op === 'and')) { sammle(b.a); sammle(b.b); } else glieder.push(b); };
    if (['or', 'xor', 'and'].includes(formelBaum.op)) sammle(formelBaum);
    const zw = glieder.filter((g) => g.op !== 'var');
    zeilen.push({ text: 'Für jede Belegung einsetzen (Zwischenergebnisse = Ausgänge der einzelnen Glieder):' });
    const kopf = [namen.slice().reverse().join(' '), 'dez', ...zw.map((_, j) => 'Z' + sub(j + 1)), ausgaenge[0].name];
    const rows = Array.from({ length: N }, (_, z) => {
      const bel = Object.fromEntries(namen.map((v, i) => [v, bit(z, i)]));
      return [binaer(z, n), String(z), ...zw.map((g) => String(auswerten(g, bel))), String(ausgaenge[0].werte[z])];
    });
    zw.forEach((g, j) => zeilen.push({ text: `Z${sub(j + 1)} = ${baumText(g)}`, indent: true }));
    zeilen.push({ text: '', matrix: [kopf, ...rows] });
    schritte.push({ titel: 'Schaltung/Formel → Wahrheitstabelle', zeilen });
  }

  // Schritt 1: Logiktabelle
  const kopf = [namen.slice().reverse().join(', '), 'dez', ...ausgaenge.map((a) => a.name)];
  const tab = Array.from({ length: N }, (_, z) => [binaer(z, n), String(z), ...ausgaenge.map((a) => String(a.werte[z]))]);
  const tz = [
    { text: `${n} Eingänge → 2${'⁰¹²³⁴'[n]} = ${N} mögliche Fälle. Reihenfolge wie Musterlösung: ${namen.slice().reverse().join(', ')} (${namen[0]} = niederwertigstes Bit), dez = Zeilennummer.` },
    { text: '', matrix: [kopf, ...tab] },
  ];
  ausgaenge.forEach((a) => {
    const eins = a.werte.filter((w) => w).length;
    tz.push({ text: `Anzahl ${a.name} = 1: ${eins} · Anzahl ${a.name} = 0: ${N - eins}${a.bedingung ? `  (aus Bedingung „${a.bedingung}“)` : ''}`, muted: true });
  });
  schritte.push({ titel: 'Logiktabelle erstellen', zeilen: tz });

  const ergebnisse = [];
  const netze = [];

  ausgaenge.forEach((a, k) => {
    const minterme = a.werte.map((w, z) => (w ? z : -1)).filter((z) => z >= 0);
    const dnf = minterme.map((m) => Array.from({ length: n }, (_, i) => bit(m, i)));
    const ausgang = { name: a.name, adr: adrA[k] };

    // Minterme / DNF
    const zm = [];
    if (!minterme.length) zm.push({ text: `${a.name} ist in keiner Zeile 1 → ${a.name} = 0 (immer aus).`, strong: true });
    else if (minterme.length === N) zm.push({ text: `${a.name} ist in allen Zeilen 1 → ${a.name} = 1 (immer an).`, strong: true });
    else {
      zm.push({ text: `Jede Zeile mit ${a.name} = 1 ergibt ein UND (Eingang = 0 → negiert ¬):` });
      minterme.forEach((m, j) => zm.push({ text: `Zeile ${m} (${binaer(m, n)}): ${termText(dnf[j], namen)}`, indent: true }));
      zm.push({ text: 'Alle diese UND-Terme mit ODER verbinden (DNF, unvereinfacht – so zeichnet es die Musterlösung):' });
      zm.push({ text: `${a.name} = ${formelText(dnf, namen)}`, strong: true });
    }
    schritte.push({ titel: `${a.name}: Minterme ablesen (DNF)`, zeilen: zm });

    // Vereinfachen
    let minimal;
    if (!minterme.length) minimal = [];
    else if (minterme.length === N) minimal = [Array(n).fill(null)];
    else {
      const qm = quineMcCluskey(minterme, n);
      minimal = qm.gewaehlt.map((p) => p.imp);
      const zv = [];
      if (n >= 2) {
        zv.push({ text: 'KV-Diagramm (Zahl in Klammern = Zeile dez). Benachbarte Einsen (auch über den Rand) zu Blöcken aus 2, 4, 8 Feldern zusammenfassen:' });
        zv.push({ text: '', matrix: kvMatrix(a.werte, n, namen) });
      }
      zv.push({ text: 'Regel: X ∧ Y ∨ X ∧ ¬Y = X ∧ (Y ∨ ¬Y) = X → ein Eingang, der sich im Block ändert, fällt weg.', muted: true });
      qm.gewaehlt.forEach((p, j) => {
        const weg = p.imp.map((v, i) => (v === null ? namen[i] : null)).filter(Boolean);
        const blk = String.fromCharCode(65 + j);
        if (!weg.length) {
          zv.push({ text: `Block ${blk}: nur Zeile ${p.ms[0]} (${muster(p.imp)}), kein Nachbar mit 1 → bleibt ${termText(p.imp, namen)}`, indent: true });
        } else {
          zv.push({ text: `Block ${blk}: Zeilen ${p.ms.join(', ')} (${p.ms.map((m) => binaer(m, n)).join(', ')} → ${muster(p.imp)}): ${weg.join(', ')} ändert sich → fällt weg → ${termText(p.imp, namen)}`, indent: true });
        }
      });
      if (qm.prim.length > qm.gewaehlt.length) {
        const nicht = qm.prim.filter((p) => !qm.gewaehlt.includes(p));
        zv.push({ text: `Nicht gebraucht (alle Einsen sind schon abgedeckt): ${nicht.map((p) => termText(p.imp, namen)).join('; ')}`, muted: true, indent: true });
      }
      // Quine-McCluskey kompakt
      if (qm.verschmelzungen.length) {
        zv.push({ text: 'Gegenprobe Quine-McCluskey (Paare, die sich in genau einem Bit unterscheiden, zusammenfassen):', muted: true });
        qm.verschmelzungen.forEach((st, s) => {
          zv.push({ text: `Stufe ${s + 1}: ` + st.map((v) => `${v.a.ms.join(',')}+${v.b.ms.join(',')} → ${muster(v.c.imp)}`).join('  ·  '), muted: true, indent: true });
        });
        zv.push({ text: `Primimplikanten: ${qm.prim.map((p) => `${muster(p.imp)} = ${termText(p.imp, namen)}`).join('; ')}`, muted: true, indent: true });
      }
      zv.push({ text: `${a.name} = ${formelText(minimal, namen)}`, strong: true });
      schritte.push({ titel: `${a.name}: vereinfachen (KV-Diagramm)`, zeilen: zv });
    }

    // Gegenprobe: vereinfachte Formel in alle Zeilen einsetzen
    const falsch = [];
    for (let z = 0; z < N; z++) if (termeWert(minimal, z) !== a.werte[z]) falsch.push(z);
    const art = erkenne(a.werte, n, namen);

    ergebnisse.push({
      name: a.name, adr: adrA[k], werte: a.werte, minterme, dnf, minimal,
      formel: formelText(minimal, namen), formelKurz: formelText(minimal, namen, 'kurz'), formelDnf: formelText(dnf, namen),
      st: `${a.name} := ${formelText(minimal, namen, 'st')};`, gegenprobe: falsch.length === 0, erkannt: art,
    });
    netze.push({ titel: `${a.name} wie Musterlösung (DNF, je Zeile ein &-Glied)`, ...netz(dnf, namen, adrE, ausgang) });
    if (minimal.length && (minimal.length !== dnf.length || minimal.some((t) => literale(t).length < n))) {
      netze.push({ titel: `${a.name} vereinfacht`, ...netz(minimal, namen, adrE, ausgang) });
    }
  });

  // Beziehungen zwischen Ausgängen (z. B. Rot = ¬Grün)
  const bez = [];
  for (let p = 0; p < ergebnisse.length; p++) {
    for (let q = 0; q < ergebnisse.length; q++) {
      if (p === q) continue;
      if (!ergebnisse[p].werte.every((w, z) => w === 1 - ergebnisse[q].werte[z])) continue;
      ergebnisse[q].negVon = ergebnisse[p].name;
      if (p > q) {
        bez.push({ text: `${ergebnisse[p].name} = ¬${ergebnisse[q].name} (genau umgekehrt) → alternativ: ${ergebnisse[q].name} über ein NICHT-Glied (bzw. Negation ○ am Eingang der Zuweisung) auf ${ergebnisse[p].name}.`, strong: true });
      }
    }
  }

  // Ergebnis + FUP
  const ze = [];
  ergebnisse.forEach((e) => {
    ze.push({ text: `${e.name} = ${e.formel}`, strong: true });
    ze.push({ text: `kurz: ${e.name} = ${e.formelKurz}`, indent: true });
    ze.push({ text: `ST/SCL: ${e.st}`, indent: true, muted: true });
    if (e.erkannt) ze.push({ text: `Bedeutung: ${e.erkannt}`, indent: true });
    ze.push({ text: e.gegenprobe ? `Gegenprobe: Formel in alle ${N} Zeilen eingesetzt → stimmt mit der Tabelle überein ✓` : `Gegenprobe FEHLGESCHLAGEN – bitte melden!`, muted: e.gegenprobe, indent: true });
  });
  ze.push(...bez);
  schritte.push({ titel: 'Ergebnis: logische Funktion', zeilen: ze });

  const zf = [{ text: 'Zeichnen wie Musterlösung: Eingänge links, Negation als Kreis/Punkt ○ direkt am Gattereingang, „&“ = UND, „>=1“ = ODER, „=“ = Zuweisung auf den Ausgang (Name darüber).', muted: true }];
  ergebnisse.forEach((e) => {
    zf.push({ text: `${e.name} – wie Musterlösung (unvereinfacht, ${e.dnf.length} Zeilen mit 1):`, strong: true });
    zf.push(...fupZeilen(e.dnf, namen, adrE, { name: e.name, adr: e.adr }));
    if (e.minimal.length && e.formel !== e.formelDnf) {
      zf.push({ text: `${e.name} – vereinfacht (weniger Gatter, auch richtig):`, strong: true });
      zf.push(...fupZeilen(e.minimal, namen, adrE, { name: e.name, adr: e.adr }));
    }
  });
  schritte.push({ titel: 'Schaltung in FUP', zeilen: zf });

  // Adressen
  const za = [{ text: 'Eingänge:' }];
  namen.forEach((x, i) => za.push({ text: `${x} – ${adrE[i]}`, indent: true }));
  za.push({ text: 'Ausgänge:' });
  ergebnisse.forEach((e) => za.push({ text: `${e.name} – ${e.adr}`, indent: true }));
  if (!eigeneAdr) za.push({ text: 'Beispiel, andere Belegung möglich.', muted: true });
  za.push({ text: '%Ex.y bzw. %Ax.y: E = Eingang, A = Ausgang, x = Byteadresse, y = Bitadresse (0…7).' });
  schritte.push({ titel: 'Eingänge und Ausgänge belegen', zeilen: za });

  let fazit = ergebnisse.map((e) => `${e.name} = ${e.formelKurz}`).join('  ·  ');
  if (ergebnisse.length === 1 && ergebnisse[0].erkannt && /^(XOR|XNOR|UND|ODER|NAND|NOR|NICHT)/.test(ergebnisse[0].erkannt)) {
    fazit += `  →  ${ergebnisse[0].erkannt}`;
  }
  return { schritte, fazit, eingaenge: namen, adressenE: adrE, ausgaenge: ergebnisse, netze, gegenprobe: ergebnisse.every((e) => e.gegenprobe) };
}

// ---------- Selbsthaltung / Verriegelung (K2 SPS A3, Hebebühne) ----------

/**
 * Vorlage wie Musterlösung K2: Netzwerk 1 SR-Glied (rücksetzdominant, „Aus vor Ein“), optional
 * Netzwerk 2/3 zwei gegeneinander verriegelte Richtungen (Tippbetrieb, Endschalter).
 * Eingabe (alles optional, Vorgabe = K2-Lösung):
 *   { ein: {name, adr, art:'NO'|'NC'}, aus: {…}, merker: {name, adr}, leuchte: {name, adr} | null,
 *     richtungen: [{ motor:{name,adr}, taster:{name,adr,art}, endschalter:{name,adr,art} }, …] (0 oder 2) }
 */
export function selbsthaltung(input = {}) {
  const d = (x, def) => ({ ...def, ...Object.fromEntries(Object.entries(x || {}).filter(([, v]) => String(v ?? '').trim())) });
  const ein = d(input.ein, { name: 'Knopf_EIN', adr: '%E0.2', art: 'NO' });
  const aus = d(input.aus, { name: 'Knopf_AUS', adr: '%E0.3', art: 'NC' });
  const merker = d(input.merker, { name: 'Steuerung_Ein', adr: '%M0.0' });
  const leuchte = input.leuchte === null ? null : d(input.leuchte, { name: 'Meldeleuchte_Steuerung_EIN', adr: '%A0.4' });
  const stdR = [
    { motor: { name: 'Motor_HOCH', adr: '%A0.0' }, taster: { name: 'Knopf_HOCH', adr: '%E0.4', art: 'NO' }, endschalter: { name: 'ES_oben', adr: '%E0.0', art: 'NC' } },
    { motor: { name: 'Motor_RUNTER', adr: '%A0.1' }, taster: { name: 'Knopf_RUNTER', adr: '%E0.5', art: 'NO' }, endschalter: { name: 'ES_unten', adr: '%E0.1', art: 'NC' } },
  ];
  const richtungen = input.richtungen === null ? [] : (input.richtungen || stdR).map((r, i) => ({
    motor: d(r.motor, stdR[i].motor), taster: d(r.taster, stdR[i].taster), endschalter: d(r.endschalter, stdR[i].endschalter),
  }));
  for (const [x, w] of [[ein, 'EIN'], [aus, 'AUS']]) {
    if (!['NO', 'NC'].includes(x.art)) throw new Error(`${w}-Taster: Art NO (Schließer) oder NC (Öffner) wählen.`);
  }
  [ein, aus, merker, leuchte, ...richtungen.flatMap((r) => [r.motor, r.taster, r.endschalter])].filter(Boolean).forEach((x) => { x.adr = normAdresse(x.adr) || ''; });

  const A = (x) => `${x.name} (${x.adr})`;
  const schritte = [];
  // „gedrückt“ / „betätigt“ als Signal: NO → 1 = gedrückt, NC → 0 = gedrückt
  const sNeg = ein.art === 'NC';
  const rNeg = aus.art === 'NC';

  schritte.push({
    titel: 'Grundlagen: Öffner/Schließer, „Aus vor Ein“',
    zeilen: [
      { text: 'NO (Normally Open) = Schließer: gedrückt → Signal 1.  NC (Normally Closed) = Öffner: gedrückt → Signal 0.' },
      { text: 'AUS-Taster und Endschalter sind Öffner (NC): bei Drahtbruch ist das Signal 0 → die Anlage geht sicher AUS (drahtbruchsicher).' },
      { text: 'Merkregel (Sicherheit): „Ausschalten vor Einschalten“ bzw. „Aus vor Ein“ → Rücksetzen hat Vorrang → SR-Glied (rücksetzdominant, Eingang R1).', strong: true },
      { text: 'SR = rücksetzdominant (R1 gewinnt, wenn S und R gleichzeitig 1). RS = setzdominant (S1 gewinnt).', muted: true },
    ],
  });

  schritte.push({
    titel: `Netzwerk 1: Steuerung EIN (speicherndes Element)`,
    zeilen: [
      { text: `SR-Glied, Speicher ${A(merker)} über dem Kasten.`, strong: true },
      { text: `S  ← ${A(ein)}${sNeg ? ' mit Negation ○ (Öffner: gedrückt = 0)' : ' (Schließer, direkt)'}`, indent: true },
      { text: `R1 ← ${A(aus)}${rNeg ? ' mit Negation ○ (Öffner: gedrückt = 0 → negiert = 1 → Rücksetzen)' : ' (Schließer, direkt)'}`, indent: true },
      leuchte ? { text: `Q → „=“ ${A(leuchte)}`, indent: true } : { text: 'Q = Merker (keine Meldeleuchte).', indent: true },
      { text: `Tabelle SR: S=0,R1=0 → Q bleibt · S=1,R1=0 → Q=1 · S=0,R1=1 → Q=0 · S=1,R1=1 → Q=0 (Aus vor Ein)`, muted: true },
      { text: `Mit Gattern (Selbsthaltung): ${merker.name} = (${sNeg ? '¬' : ''}${ein.name} ∨ ${merker.name}) ∧ ${rNeg ? '' : '¬'}${aus.name}`, muted: true },
    ],
  });

  const netze = [{ titel: 'Netzwerk 1: Steuerung EIN', sr: { s: { ...ein, neg: sNeg }, r: { ...aus, neg: rNeg }, merker, leuchte } }];

  if (richtungen.length === 2) {
    richtungen.forEach((r, i) => {
      const g = richtungen[1 - i];
      const esNeg = r.endschalter.art === 'NO';
      const tNeg = r.taster.art === 'NC';
      const gtNeg = g.taster.art === 'NO';
      const eing = [
        { name: merker.name, adr: merker.adr, neg: false, warum: 'Anlage ist eingeschaltet' },
        { name: r.taster.name, adr: r.taster.adr, neg: tNeg, warum: 'Taster gedrückt (nur solange gedrückt = Tippbetrieb)' },
        { name: r.endschalter.name, adr: r.endschalter.adr, neg: esNeg, warum: esNeg ? 'Endschalter (Schließer) nicht erreicht' : 'Endschalter (Öffner): 1 = Endlage noch nicht erreicht' },
        { name: g.motor.name, adr: g.motor.adr, neg: true, warum: 'Verriegelung: Gegenrichtung läuft nicht' },
        { name: g.taster.name, adr: g.taster.adr, neg: gtNeg, warum: 'Gegen-Taster nicht gedrückt' },
      ];
      schritte.push({
        titel: `Netzwerk ${i + 2}: Ansteuerung ${r.motor.name}`,
        zeilen: [
          { text: `Ein &-Glied mit 5 Eingängen → „=“ ${A(r.motor)}`, strong: true },
          ...eing.map((e) => ({ text: `${e.name} (${e.adr})${e.neg ? ' mit Negation ○' : ''} – ${e.warum}`, indent: true })),
          { text: `${r.motor.name} = ${eing.map((e) => (e.neg ? '¬' : '') + e.name).join(' ∧ ')}`, muted: true },
        ],
      });
      netze.push({ titel: `Netzwerk ${i + 2}: ${r.motor.name}`, terme: [eing.map(({ name, adr, neg }) => ({ name, adr, neg }))], ausgang: { ...r.motor } });
    });
  }

  const ea = [ein, aus, ...richtungen.flatMap((r) => [r.endschalter, r.taster])].sort((a, b) => a.adr.localeCompare(b.adr, 'de', { numeric: true }));
  const aa = [...richtungen.map((r) => r.motor), ...(leuchte ? [leuchte] : [])].sort((a, b) => a.adr.localeCompare(b.adr, 'de', { numeric: true }));
  schritte.push({
    titel: 'Ein-/Ausgangsbelegung',
    zeilen: [
      ...ea.map((x) => ({ text: `${x.adr}  ${x.name}${x.art ? ` (${x.art})` : ''}`, indent: true })),
      ...aa.map((x) => ({ text: `${x.adr}  ${x.name}`, indent: true })),
      { text: `${merker.adr}  ${merker.name} (Merker)`, indent: true },
      { text: 'Beispiel %A5.3 „Meldeleuchte“: A = Ausgang, 5 = Byteadresse, 3 = Bitadresse, „Meldeleuchte“ = Variablenname.', muted: true },
    ],
  });

  return {
    schritte,
    fazit: `SR-Glied (Aus vor Ein)${richtungen.length ? ' + 2 verriegelte &-Glieder' : ''}`,
    netze,
  };
}
