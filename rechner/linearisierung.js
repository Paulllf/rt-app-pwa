// Linearisierung um einen Arbeitspunkt (Taylor, Abbruch nach dem 1. Glied) mit Rechenweg.
// Wie Musterlösung K2 A8 und V01/Ü01: f̃(t) = f(t₀) + ḟ(t₀)·Δt mit Δt = t − t₀, Fehler = |f(t) − f̃(t)|.
// Reine Rechnung, keine Oberfläche.

import { fmt, sup } from '../lib/poly.js';
import {
  parseAusdruck, ableiten, wert, text, zahl, istPolynom, koeffizienten, polyText, hatVar,
} from '../lib/linearisierung-ausdruck.js';

/** Konstante lesen (t₀ oder Stelle): "1", "−2", "0,5", "1/3", "π/2" */
function konstante(s, name) {
  const { baum } = parseAusdruck(s);
  if (hatVar(baum)) throw new Error(`${name} muss eine Zahl sein.`);
  const v = wert(baum, 0);
  if (!isFinite(v)) throw new Error(`${name} ist keine gültige Zahl.`);
  return { v, txt: String(s).trim().replace(/-/g, '−').replace(/\*/g, '·') };
}

/** Polynom durch (t − t0) teilen (Horner). Gibt [Quotient, Rest]. */
function teile(p, t0) {
  const n = p.length - 1;
  const q = new Array(n).fill(0);
  let r = 0;
  for (let i = n; i >= 0; i--) {
    r = p[i] + r * t0;
    if (i > 0) q[i - 1] = r;
  }
  return [q, r];
}

const dt = (v, t0) => (Math.abs(t0.v) < 1e-15 ? v : `(${v} ${t0.v < 0 ? '+' : '−'} ${zahl(Math.abs(t0.v))})`);

/**
 * Eingabe: { f: 't^2 - t', t0: '1', stelle?: '2' }
 * Ausgabe: { schritte, fazit, f0, df0, a, b, fehlerAP, fehlerStelle? }
 */
export function linearisierung(input) {
  if (!String(input.f || '').trim()) throw new Error('Bitte f(t) eingeben.');
  if (!String(input.t0 ?? '').trim()) throw new Error('Bitte den Arbeitspunkt t₀ eingeben.');
  const { baum: f, varName: v } = parseAusdruck(input.f);
  if (!hatVar(f)) throw new Error(`f(${v}) enthält kein ${v}. Bitte die Funktion mit ${v} eingeben.`);
  const t0 = konstante(input.t0, `${v}₀`);
  const F = `f(${v})`, Fs = `f̃(${v})`, D = `ḟ(${v})`;
  const F0 = `f(${v}₀)`, D0 = `ḟ(${v}₀)`;
  const wTxt = /^[\d,.]+$/.test(t0.txt) ? t0.txt : `(${t0.txt})`;
  const ein = (baum) => text(baum, wTxt, true); // t durch t₀ ersetzen
  // Polynom (Koeffizienten) mit eingesetztem t₀: 6·(−2)² − 3
  const einPoly = (p) => {
    const teile = [];
    for (let i = p.length - 1; i >= 0; i--) {
      const c = p[i];
      if (Math.abs(c) < 1e-12) continue;
      const a = Math.abs(c);
      const z = zahl(a);
      const pot = i === 0 ? '' : wTxt + (i > 1 ? sup(i) : '');
      const body = i === 0 ? z : (a === 1 ? pot : `${/\//.test(z) ? '(' + z + ')' : z}·${pot}`);
      teile.push({ neg: c < 0, body });
    }
    if (!teile.length) return '0';
    return teile.map((t, k) => (k === 0 ? (t.neg ? '−' : '') + t.body : (t.neg ? ' − ' : ' + ') + t.body)).join('');
  };
  const poly = istPolynom(f);
  const schritte = [];

  schritte.push({
    titel: 'Formel: Taylor-Reihe nach dem 1. Glied abbrechen (Tangente im Arbeitspunkt)',
    zeilen: [
      { text: `${Fs} = ${F0} + ${D0}·Δ${v}     mit Δ${v} = ${v} − ${v}₀`, strong: true },
      { text: `${F} = ${poly ? polyText(koeffizienten(f), v) : text(f, v)}` },
      { text: `${v}₀ = ${t0.txt}${t0.txt !== zahl(t0.v) ? ' = ' + zahl(t0.v) : ''}` },
    ],
  });

  // f(t0)
  const f0 = wert(f, t0.v);
  if (!isFinite(f0)) throw new Error(`f(${v}₀) ist nicht definiert (z. B. Wurzel aus negativer Zahl oder Division durch 0).`);
  schritte.push({
    titel: `Arbeitspunkt: ${F0} berechnen`,
    zeilen: [
      { text: `${F0} = f(${t0.txt}) = ${ein(f)} = ${zahl(f0)}` },
      { text: `Arbeitspunkt AP(${zahl(t0.v)} | ${zahl(f0)})`, strong: true },
    ],
  });

  // Ableitung
  const df = ableiten(f);
  const df0 = wert(df, t0.v);
  if (!isFinite(df0)) throw new Error(`ḟ(${v}₀) ist nicht definiert – im Punkt ${v}₀ = ${t0.txt} kann nicht linearisiert werden.`);
  const dfText = poly ? polyText(koeffizienten(df), v) : text(df, v);
  schritte.push({
    titel: `Ableitung ${D} und Steigung ${D0}`,
    zeilen: [
      { text: `${D} = d/d${v} ${F} = ${dfText}` },
      { text: `⇒ ${D0} = ${poly ? einPoly(koeffizienten(df)) : ein(df)} = ${zahl(df0)}`, strong: true },
    ],
  });

  // Einsetzen
  const a = df0, b = f0 - df0 * t0.v;
  const lin = [b, a];
  const linText = polyText(lin, v);
  const zeilen = [
    { text: `${Fs} = ${zahl(f0)} + ${zahl(df0).includes('/') || df0 < 0 ? '(' + zahl(df0) + ')' : zahl(df0)}·${dt(v, t0)}` },
    { text: `${Fs} = ${linText}`, strong: true },
    { text: `(Form a·${v} + b: a = ${D0} = ${zahl(a)},  b = ${F0} − a·${v}₀ = ${zahl(f0)} − ${zahl(a).includes('/') || a < 0 ? '(' + zahl(a) + ')' : zahl(a)}·${t0.v < 0 || zahl(t0.v).includes('/') ? '(' + zahl(t0.v) + ')' : zahl(t0.v)} = ${zahl(b)})`, muted: true },
  ];
  schritte.push({ titel: 'Werte einsetzen', zeilen });

  // Fehler
  const fz = [
    { text: `Fehler = |${F} − ${Fs}|`, strong: true },
  ];
  const fText = poly ? polyText(koeffizienten(f), v) : text(f, v);
  fz.push({ text: `Fehler = |${fText} − (${linText})|` });
  if (poly) {
    const p = koeffizienten(f);
    const e = p.map((c, i) => c - (lin[i] || 0));
    while (e.length > 1 && Math.abs(e[e.length - 1]) < 1e-12) e.pop();
    if (e.length >= 3) {
      fz.push({ text: `Fehler = |${polyText(e, v)}|` });
      const [q1] = teile(e, t0.v);
      const [q2] = teile(q1, t0.v);
      const fakt = Math.abs(t0.v) < 1e-15 ? `${v}²` : `(${v} ${t0.v < 0 ? '+' : '−'} ${zahl(Math.abs(t0.v))})²`;
      const qt = polyText(q2, v);
      let rest;
      if (q2.length === 1) rest = q2[0] === 1 ? fakt : q2[0] === -1 ? `−${fakt}` : `${zahl(q2[0])}·${fakt}`;
      else rest = `${fakt}·(${qt})`;
      const betrag = q2.length === 1 && q2[0] > 0 ? rest : `|${rest}|`;
      fz.push({ text: `Fehler = ${betrag}   (doppelte Nullstelle bei ${v}₀: die Tangente berührt f dort)`, strong: true });
    } else {
      fz.push({ text: 'f ist schon linear → Fehler = 0 überall.' });
    }
  }
  const eAP = Math.abs(f0 - (a * t0.v + b));
  fz.push({ text: `Im Arbeitspunkt: |${F0} − f̃(${v}₀)| = |${zahl(f0)} − ${f0 < 0 ? '(' + zahl(f0) + ')' : zahl(f0)}| = ${fmt(eAP)}` });
  fz.push({ text: 'Im Arbeitspunkt ist der Fehler 0.', strong: true });
  fz.push({ text: `Je weiter ${v} vom Arbeitspunkt weg ist, desto größer wird der Fehler.`, muted: true });
  schritte.push({ titel: 'Fehler der Linearisierung', zeilen: fz });

  let fehlerStelle;
  if (String(input.stelle ?? '').trim()) {
    const t1 = konstante(input.stelle, 'Die Stelle');
    const f1 = wert(f, t1.v), l1 = a * t1.v + b;
    if (!isFinite(f1)) throw new Error(`f(${t1.txt}) ist nicht definiert.`);
    fehlerStelle = Math.abs(f1 - l1);
    const rel = Math.abs(f1) > 1e-12 ? ` (relativ: ${fmt((fehlerStelle / Math.abs(f1)) * 100, 2)} %)` : '';
    schritte.push({
      titel: `Fehler an der Stelle ${v} = ${t1.txt}`,
      zeilen: [
        { text: `f(${t1.txt}) = ${fmt(f1)}` },
        { text: `f̃(${t1.txt}) = ${fmt(l1)}` },
        { text: `Fehler = |${fmt(f1)} − ${l1 < 0 ? '(' + fmt(l1) + ')' : fmt(l1)}| = ${fmt(fehlerStelle)}${rel}`, strong: true },
      ],
    });
  }

  const fazit = `${Fs} = ${linText}  (AP: ${v}₀ = ${zahl(t0.v)}, ${F0} = ${zahl(f0)}, ${D0} = ${zahl(df0)})`;
  return { schritte, fazit, f0, df0, a, b, linText, fehlerAP: eAP, fehlerStelle, dfText };
}
