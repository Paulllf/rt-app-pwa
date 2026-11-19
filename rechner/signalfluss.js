// Signalfluss-Rechner mit Rechenweg. Reine Rechnung, keine Oberfläche.
//
// Zwei Wege, wie in Vorlesung/Klausur:
//  1. Bausteine (Baum): Reihe, Parallel, Gegenkopplung, Mitkopplung, von innen nach außen zusammengefasst.
//  2. Hilfsgrößen: eine Gleichung pro Hilfsgröße (Summationsstelle/Blockausgang), dann einsetzen und
//     nach dem Ausgang auflösen (Weg der Musterlösungen K1–K3 A12). Geht für JEDES lineare Signalflussbild.
//
// Baum-Knoten (JSON, so speichert ihn auch die Oberfläche):
//   { typ: 'leer' }
//   { typ: 'block', name: 'G1' }                 name darf ein Ausdruck sein: '1', 'K', 'G11+G12', '2G1'
//   { typ: 'reihe', kinder: [...], name? }
//   { typ: 'parallel', kinder: [...], name? }    Vorzeichen am Kind: kind.vz = -1 (sonst +)
//   { typ: 'gegen' | 'mit', vor: Knoten, rueck: Knoten, name? }
// name an einer Struktur = Teilsystem (z. B. G1 = G11 + G12). Ein Block mit demselben Namen verweist darauf.

import { sub } from '../lib/poly.js';
import { bfmt } from '../lib/poly.js';
import { MP, R, fmtPoly, fmtRat, fmtFaktor, klammer, symText, parseAusdruck, normName } from '../lib/signalfluss-algebra.js';
import { parseBruchS, einsetzenS, kuerzenS } from '../lib/signalfluss-s.js';

const REGEL = {
  reihe: 'Reihenschaltung: Produkt der Glieder, G = G₁ · G₂ · …',
  parallel: 'Parallelschaltung: Summe der Zweige, G = G₁ ± G₂ … (Vorzeichen an der Summationsstelle!)',
  gegen: 'Gegenkopplung (− an der Summationsstelle): G = G_V / (1 + G_V · G_R)',
  mit: 'Mitkopplung (+ an der Summationsstelle): G = G_V / (1 − G_V · G_R)',
};
const TYPNAME = { reihe: 'Reihe', parallel: 'Parallel', gegen: 'Gegenkopplung', mit: 'Mitkopplung' };

const istEins = (r) => r.f.length === 0 && MP.isConst(r.n) && MP.constVal(r.n) === 1;
const hatNenner = (r) => r.f.length > 0;

/** Zeilen fürs Ergebnis: G = Z / N, dazu ausgeklammerte Form, falls anders. */
function ergebnisZeilen(label, r, strong = true, opt = {}) {
  const a = fmtRat(r, opt);
  const b = fmtRat(r, { ...opt, faktor: true });
  const z = [{ text: `${label} = ${a}`, strong }];
  if (b !== a) z.push({ text: `${label} = ${b}   (ausgeklammert)`, indent: true });
  return z;
}

// ===================== 1. Bausteine =====================

/** Kurzer Text der Baumstruktur für die Vorschau. */
export function strukturText(k) {
  if (!k || k.typ === 'leer') return '□';
  const nm = k.name ? symText(normName(k.name.trim())) + ' = ' : '';
  const wrap = (t) => (k.name ? `[${nm}${t}]` : t);
  switch (k.typ) {
    case 'block': {
      const t = (k.name || '').trim();
      if (!t) return '□';
      try { return klammer(fmtPoly(parseAusdruck(t))); } catch { return t; }
    }
    case 'reihe': return wrap((k.kinder || []).map((c) => (c.typ === 'parallel' && !c.name ? `(${strukturText(c)})` : strukturText(c))).join(' · ') || '□');
    case 'parallel': return wrap((k.kinder || []).map((c, i) => (c.vz === -1 ? (i ? ' − ' : '−') : i ? ' + ' : '') + strukturText(c)).join('') || '□');
    case 'gegen': return wrap(`Gegen(${strukturText(k.vor)}; ${strukturText(k.rueck)})`);
    case 'mit': return wrap(`Mit(${strukturText(k.vor)}; ${strukturText(k.rueck)})`);
    default: return '?';
  }
}

/**
 * Baum zusammenfassen.  eingabe: { baum, ergebnisName?: 'G', werte?: { G1: '1/(1+3s)', … } }
 * Rückgabe: { schritte, fazit, ergebnis (Rat), ergebnisText, ergebnisVoll (Rat, Teilsysteme eingesetzt), bloecke }
 */
export function bausteine(eingabe) {
  const baum = eingabe.baum;
  const schritte = [];
  const teil = new Map(); // Name → { rat (in Teilsystem-Symbolen), voll (alles eingesetzt) }
  const zaehl = { n: 0 };
  const label0 = (eingabe.ergebnisName || 'G').trim() || 'G';
  const L = (t) => symText(t);

  // Vorab: Namen der Teilsysteme sammeln (doppelte verbieten)
  (function sammle(k) {
    if (!k) return;
    if (k.typ !== 'block' && k.typ !== 'leer' && k.name && k.name.trim() && k !== baum) {
      const n = parseName(k.name);
      if (teil.has(n)) throw new Error(`Der Name ${L(n)} ist für zwei Teilsysteme vergeben. Jeder Name nur einmal; an weiteren Stellen einen Block „${n}“ einsetzen.`);
      teil.set(n, null);
    }
    (k.kinder || []).forEach(sammle);
    sammle(k.vor); sammle(k.rueck);
  })(baum);

  function parseName(t) {
    const p = parseAusdruck(t);
    const v = [...MP.vars(p)];
    if (p.size !== 1 || v.length !== 1 || !MP.eq(p, MP.sym(v[0]))) throw new Error(`„${t}“ ist kein Name. Teilsysteme heißen z. B. G1, G2 oder H.`);
    return v[0];
  }

  // liefert { r: Rat (wie es im Elternteil verwendet wird), anzeige: Text fürs Einsetzen, label }
  function rechne(k, istWurzel) {
    if (!k || k.typ === 'leer') throw new Error('Im Baum ist noch ein leerer Platz (□). Bitte Block oder Struktur wählen.');
    if (k.typ === 'block') {
      const t = (k.name || '').trim();
      if (!t) throw new Error('Ein Block hat noch keinen Namen. Z. B. G1, H, R, K oder 1 eintragen.');
      const p = parseAusdruck(t);
      const s = fmtPoly(p);
      return { r: R.of(p), anzeige: s, label: s };
    }
    const kinder = k.typ === 'reihe' || k.typ === 'parallel' ? (k.kinder || []) : [k.vor, k.rueck];
    if ((k.typ === 'reihe' || k.typ === 'parallel') && kinder.length === 0) throw new Error(`${TYPNAME[k.typ]} ohne Glieder: mit „+ Glied“ Blöcke hinzufügen.`);
    const ks = kinder.map((c) => rechne(c, false));
    const name = !istWurzel && k.name && k.name.trim() ? parseName(k.name) : null;
    const label = istWurzel ? (k.name && k.name.trim() ? L(normName(k.name.trim())) : L(label0)) : name ? L(name) : 'T' + sub(++zaehl.n);
    let r;
    const zeilen = [{ text: REGEL[k.typ], muted: true }];
    const kl = (t) => klammer(t);
    let formel, eingesetzt;
    if (k.typ === 'reihe') {
      r = ks.reduce((a, c) => R.mul(a, c.r), R.c(1));
      formel = ks.map((c) => kl(c.label)).join(' · ');
      eingesetzt = ks.map((c) => kl(c.anzeige)).join(' · ');
    } else if (k.typ === 'parallel') {
      r = R.c(0);
      const vz = kinder.map((c) => (c.vz === -1 ? -1 : 1));
      ks.forEach((c, i) => { r = vz[i] < 0 ? R.sub(r, c.r) : R.add(r, c.r); });
      const join = (arr) => arr.map((t, i) => (vz[i] < 0 ? (i ? ' − ' : '−') : i ? ' + ' : '') + (vz[i] < 0 ? kl(t) : t)).join('');
      formel = join(ks.map((c) => c.label));
      eingesetzt = join(ks.map((c) => c.anzeige));
    } else {
      const [V, H] = ks;
      const pm = k.typ === 'gegen' ? '+' : '−';
      const prod = R.mul(V.r, H.r);
      const nenner = k.typ === 'gegen' ? R.add(R.c(1), prod) : R.sub(R.c(1), prod);
      r = R.div(V.r, nenner);
      const vh = (v, h) => (h === '1' ? kl(v) : v === '1' ? kl(h) : `${kl(v)} · ${kl(h)}`);
      formel = `${kl(V.label)} / (1 ${pm} ${vh(V.label, H.label)})`;
      eingesetzt = `${kl(V.anzeige)} / (1 ${pm} ${vh(V.anzeige, H.anzeige)})`;
      if (hatNenner(V.r) || hatNenner(H.r)) {
        const d = R.den(R.mul(R.of(R.den(V.r)), R.of(R.den(H.r))));
        zeilen.push({ text: `${label} = ${formel}`, sub: true });
        if (eingesetzt !== formel) zeilen.push({ text: `${label} = ${eingesetzt}` });
        zeilen.push({ text: `Doppelbruch auflösen: Zähler und Nenner mit ${kl(fmtPoly(d))} multiplizieren`, muted: true });
        formel = null;
      }
    }
    if (formel !== null) {
      zeilen.push({ text: `${label} = ${formel}` });
      if (eingesetzt !== formel) zeilen.push({ text: `${label} = ${eingesetzt}` });
    }
    const res = ergebnisZeilen(label, r, true);
    if (res[0].text !== zeilen[zeilen.length - 1].text) zeilen.push(...res);
    else { zeilen[zeilen.length - 1].strong = true; zeilen.push(...res.slice(1)); }

    const titel = `${label}: ${TYPNAME[k.typ]}` + (k.typ === 'gegen' || k.typ === 'mit' ? ` (vorwärts ${ks[0].label}, rückwärts ${ks[1].label})` : ` aus ${ks.map((c) => c.label).join(', ')}`);
    schritte.push({ titel: name ? `Teilsystem ${titel}` : titel, zeilen });

    if (name) {
      // Teilsystem: im Elternteil als Symbol weiterrechnen, später einsetzen
      const voll = R.subst(r, Object.fromEntries([...teil].filter(([, v]) => v).map(([n, v]) => [n, v.voll])));
      teil.set(name, { rat: r, voll });
      return { r: R.sym(name), anzeige: label, label };
    }
    return { r, anzeige: fmtRat(r), label };
  }

  const top = rechne(baum, true);
  const ergebnisLabel = top.label;
  let ergebnis = top.r;
  if (baum.typ === 'block') {
    schritte.push({ titel: 'Einzelner Block', zeilen: [{ text: `${ergebnisLabel} = ${top.anzeige}`, strong: true }] });
  }

  // Teilsysteme einsetzen
  const defs = [...teil].filter(([, v]) => v);
  let voll = ergebnis;
  if (defs.length) {
    const map = Object.fromEntries(defs.map(([n, v]) => [n, v.voll]));
    const ersetze = Object.fromEntries(defs.map(([n, v]) => [n, fmtRat(v.voll)]));
    voll = R.subst(ergebnis, map);
    const zeilen = defs.map(([n, v]) => ({ text: `${symText(n)} = ${fmtRat(v.voll)}` }));
    zeilen.push({ text: `${L(label0)} = ${fmtRat(ergebnis)}` });
    zeilen.push({ text: `${L(label0)} = ${fmtRat(ergebnis, { ersetze })}` });
    zeilen.push(...ergebnisZeilen(L(label0), voll, true));
    schritte.push({ titel: 'Teilsysteme einsetzen', zeilen });
  }

  const ergebnisText = `${L(label0)} = ${fmtRat(voll)}`;
  const fz = defs.length
    ? `${L(label0)} = ${fmtRat(ergebnis)}  mit ${defs.map(([n, v]) => `${symText(n)} = ${fmtRat(v.voll)}`).join(', ')}`
    : ergebnisText;
  const out = { schritte, fazit: fz, ergebnis, ergebnisVoll: voll, ergebnisText, bloecke: [...R.vars(voll)].sort() };
  zahlenwerte(out, voll, L(label0), eingabe.werte);
  return out;
}

// ===================== 2. Hilfsgrößen =====================

const zerlege = (text) => String(text).split(/[,;\s]+/).map((t) => t.trim()).filter(Boolean).map(normName);

/** Lineare Kombination als Text: "G₁G₂R·W − G₁G₂R·X + G₂·Z" (Reihenfolge wie Liste). */
function fmtLin(liste, opt = {}) {
  if (!liste.length) return '0';
  return liste.map(([sig, c], i) => {
    const s = (opt.sigText || symText)(sig);
    let neg = false, body;
    const { n, d } = R.zn(c);
    const dEins = MP.isConst(d) && MP.constVal(d) === 1;
    if (n.size === 1) {
      const t = MP.terme(n)[0];
      neg = t.c < 0;
      const nAbs = MP.scale(n, neg ? -1 : 1);
      const nt = fmtPoly(nAbs);
      if (dEins) body = nt === '1' ? s : `${nt}·${s}`;
      else body = `${fmtRat({ n: nAbs, f: [d] })}·${s}`;
    } else {
      body = `${klammer(fmtRat(c))}·${s}`;
    }
    if (typeof opt.ersatz === 'function') { const e = opt.ersatz(sig, c, neg, s); if (e) body = e; }
    return i === 0 ? (neg ? '−' : '') + body : (neg ? ' − ' : ' + ') + body;
  }).join('');
}

/** Einträge zusammenfassen: gleiche Signale addieren, Reihenfolge des ersten Auftretens. */
function sammeln(liste) {
  const out = [];
  for (const [s, c] of liste) {
    const i = out.findIndex(([t]) => t === s);
    if (i < 0) out.push([s, c]);
    else out[i] = [s, R.add(out[i][1], c)];
  }
  return out.filter(([, c]) => !R.isZero(c));
}

/**
 * eingabe: { gleichungen: ['A = U + C − B', …] oder Text mit Zeilen, eingaenge: 'U' | 'W, Z', ausgang: 'Y', werte? }
 * Rückgabe: { schritte, fazit, ergebnisse: [{ eingang, name, rat, text }], … }
 */
export function hilfsgroessen(eingabe) {
  const zeilenRoh = (Array.isArray(eingabe.gleichungen) ? eingabe.gleichungen : String(eingabe.gleichungen || '').split(/\n|;/))
    .map((z) => String(z).trim()).filter(Boolean);
  if (!zeilenRoh.length) throw new Error('Bitte Gleichungen eingeben, eine pro Hilfsgröße, z. B. „A = U − B“.');

  // Gleichungen lesen
  const roh = zeilenRoh.map((z) => {
    const teile = z.split('=');
    if (teile.length !== 2) throw new Error(`„${z}“: Jede Gleichung braucht genau ein „=“.`);
    const lp = parseAusdruck(teile[0]);
    const lv = [...MP.vars(lp)];
    if (lv.length !== 1 || !MP.eq(lp, MP.sym(lv[0]))) throw new Error(`„${z}“: Links vom „=“ steht genau eine Hilfsgröße (z. B. A oder H1).`);
    if (!teile[1].trim()) throw new Error(`„${z}“: Rechts vom „=“ fehlt etwas.`);
    return { lhs: lv[0], rhs: parseAusdruck(teile[1]), roh: z };
  });
  const unbekannt = roh.map((g) => g.lhs);
  const doppelt = unbekannt.find((v, i) => unbekannt.indexOf(v) !== i);
  if (doppelt) throw new Error(`${symText(doppelt)} steht zweimal links. Jede Hilfsgröße bekommt genau eine Gleichung.`);

  let eingaenge = zerlege(eingabe.eingaenge || '');
  let auto = false;
  if (!eingaenge.length) {
    const alle = new Set(roh.flatMap((g) => [...MP.vars(g.rhs)]));
    eingaenge = ['U', 'W', 'Z', 'X_e', 'X_E', 'U_e', 'U_E'].filter((n) => alle.has(n) && !unbekannt.includes(n));
    auto = true;
    if (!eingaenge.length) throw new Error('Bitte die Eingänge angeben (z. B. „U“ oder „W, Z“).');
  }
  for (const e of eingaenge) if (unbekannt.includes(e)) throw new Error(`${symText(e)} ist Eingang und hat trotzdem eine Gleichung. Eingänge stehen nur rechts.`);
  const ausgang = eingabe.ausgang && eingabe.ausgang.trim() ? normName(eingabe.ausgang.trim()) : roh[roh.length - 1].lhs;
  if (!unbekannt.includes(ausgang)) throw new Error(`Für den Ausgang ${symText(ausgang)} fehlt eine Gleichung „${ausgang} = …“.`);
  const signale = new Set([...unbekannt, ...eingaenge]);

  // rechte Seiten in Signal · Koeffizient zerlegen (Reihenfolge des Auftretens im Text)
  const ordnung = (text) => {
    const pos = new Map();
    const src = String(text).replace(/\(\s*s\s*\)/g, '').replace(/[₀-₉]/g, (c) => '₀₁₂₃₄₅₆₇₈₉'.indexOf(c));
    let i = 0;
    for (const m of src.matchAll(/[A-Z][a-z]+|[A-Za-z](?:_[A-Za-z0-9]+|\d+)?/g)) {
      const n = normName(m[0]);
      if (signale.has(n) && !pos.has(n)) pos.set(n, i++);
    }
    return pos;
  };
  const gl = new Map();
  for (const g of roh) {
    const koef = new Map();
    for (const [k, c] of g.rhs) {
      const m = {};
      if (k) for (const t of k.split('*')) { const [x, e] = t.split('^'); m[x] = e ? +e : 1; }
      const sig = Object.keys(m).filter((x) => signale.has(x));
      const sgrad = sig.reduce((s, x) => s + m[x], 0);
      const term = fmtPoly(new Map([[k, c]]));
      if (sgrad === 0) throw new Error(`In „${g.roh}“ hat der Summand ${term} keine Signalgröße. Ist ${term} ein Eingang? Dann bei „Eingänge“ eintragen.`);
      if (sgrad > 1) throw new Error(`In „${g.roh}“ werden im Summanden ${term} zwei Signale multipliziert. Pro Summand genau ein Signal (Block · Signal).`);
      const s = sig[0];
      const rest = { ...m }; delete rest[s];
      const rk = Object.keys(rest).sort().map((x) => (rest[x] === 1 ? x : x + '^' + rest[x])).join('*');
      koef.set(s, MP.add(koef.get(s) || new Map(), new Map([[rk, c]])));
    }
    const pos = ordnung(g.roh.split('=')[1]);
    const liste = [...koef].filter(([, p]) => !MP.isZero(p)).sort((a, b) => pos.get(a[0]) - pos.get(b[0])).map(([s, p]) => [s, R.of(p)]);
    gl.set(g.lhs, liste);
  }

  const bloecke = [...new Set(roh.flatMap((g) => [...MP.vars(g.rhs)]).filter((x) => !signale.has(x)))].sort();
  const schritte = [];
  const S = symText;

  schritte.push({
    titel: 'Hilfsgrößen und Gleichungen aufstellen',
    zeilen: [
      { text: `Eingang: ${eingaenge.map(S).join(', ')}${auto ? ' (automatisch erkannt)' : ''} · Ausgang: ${S(ausgang)} · Blöcke: ${bloecke.map(S).join(', ') || '–'}`, muted: true },
      ...roh.map((g) => ({ text: `${S(g.lhs)} = ${fmtLin(gl.get(g.lhs))}` })),
    ],
  });

  // Hilfsgrößen der Reihe nach einsetzen
  const offen = unbekannt.filter((v) => v !== ausgang);
  for (const v of offen) {
    const zeilen = [];
    let ev = gl.get(v);
    const selbst = ev.find(([s]) => s === v);
    if (selbst) {
      const rest = ev.filter(([s]) => s !== v);
      const faktor = R.sub(R.c(1), selbst[1]);
      if (R.isZero(faktor)) throw new Error(`Die Schleife über ${S(v)} hat die Verstärkung 1 (1 − … = 0). So nicht lösbar.`);
      zeilen.push({ text: `${S(v)} kommt auf beiden Seiten vor → auf die linke Seite bringen und ausklammern:`, muted: true });
      zeilen.push({ text: `${S(v)}·(${fmtRat(faktor)}) = ${fmtLin(rest)}` });
      ev = sammeln(rest.map(([s, c]) => [s, R.div(c, faktor)]));
      zeilen.push({ text: `⇒ ${S(v)} = ${fmtLin(ev)}`, strong: true });
      gl.set(v, ev);
    }
    // in alle anderen Gleichungen einsetzen
    for (const [w, ew] of gl) {
      if (w === v || !offen.concat(ausgang).includes(w)) continue;
      if (!ew.some(([s]) => s === v)) continue;
      const vorher = fmtLin(ew, { ersatz: (sig, c, neg) => (sig === v ? zwischen(c, neg, ev) : null) });
      const neu = [];
      for (const [s, c] of ew) {
        if (s === v) for (const [s2, c2] of ev) neu.push([s2, R.mul(c, c2)]);
        else neu.push([s, c]);
      }
      const nw = sammeln(neu);
      gl.set(w, nw);
      const nachher = fmtLin(nw);
      if (vorher !== nachher) zeilen.push({ text: `${S(w)} = ${vorher}` });
      zeilen.push({ text: `${S(w)} = ${nachher}`, strong: true });
    }
    gl.delete(v);
    if (zeilen.length) schritte.push({ titel: `${S(v)} einsetzen`, zeilen });
  }

  // nach dem Ausgang auflösen
  let ey = gl.get(ausgang);
  const selbstY = ey.find(([s]) => s === ausgang);
  const zeilenY = [{ text: `${S(ausgang)} = ${fmtLin(ey)}` }];
  if (selbstY) {
    const rest = ey.filter(([s]) => s !== ausgang);
    const faktor = R.sub(R.c(1), selbstY[1]);
    if (R.isZero(faktor)) throw new Error(`Die Schleife über ${S(ausgang)} hat die Verstärkung 1. So nicht lösbar.`);
    zeilenY.push({ text: `${S(ausgang)} auf die linke Seite bringen und ausklammern:`, muted: true });
    zeilenY.push({ text: `${S(ausgang)}·(${fmtRat(faktor)}) = ${fmtLin(rest)}` });
    ey = sammeln(rest.map(([s, c]) => [s, R.div(c, faktor)]));
    zeilenY.push({ text: `${S(ausgang)} = ${fmtLin(ey)}`, strong: true });
  }
  const rest = ey.filter(([s]) => !eingaenge.includes(s));
  if (rest.length) throw new Error(`Nach dem Einsetzen bleibt ${rest.map(([s]) => S(s)).join(', ')} übrig. Fehlt eine Gleichung oder ein Eingang?`);
  schritte.push({ titel: `Nach ${S(ausgang)} auflösen`, zeilen: zeilenY });

  // Übertragungsfunktionen
  const ergebnisse = [];
  const zeilenG = [];
  for (const e of eingaenge) {
    const c = (ey.find(([s]) => s === e) || [null, R.c(0)])[1];
    const name = eingaenge.length === 1 ? 'G' : 'G_' + e;
    const andere = eingaenge.filter((x) => x !== e);
    const bed = andere.length ? ` für ${andere.map((x) => S(x) + ' = 0').join(', ')}` : '';
    zeilenG.push({ text: `${name} = ${S(ausgang)}/${S(e)}${bed}`, muted: true });
    zeilenG.push(...ergebnisZeilen(name, c, true));
    ergebnisse.push({ eingang: e, name, rat: c, text: `${name} = ${fmtRat(c)}` });
  }
  schritte.push({ titel: 'Übertragungsfunktion' + (ergebnisse.length > 1 ? 'en ablesen' : ' ablesen'), zeilen: zeilenG });

  // Struktur-Hinweis: Eingang greift an mehreren Summationsstellen an (z. B. Störgrößenaufschaltung)
  if (eingaenge.length > 1) {
    for (const e of eingaenge) {
      const wo = roh.filter((g) => MP.vars(g.rhs).has(e)).map((g) => S(g.lhs));
      if (wo.length > 1) {
        schritte.push({
          titel: 'Struktur',
          zeilen: [{ text: `${S(e)} greift an ${wo.length} Stellen an (${wo.join(', ')}). Wird die Störgröße gemessen und über einen eigenen Block zusätzlich eingespeist, heißt das Störgrößenaufschaltung.`, muted: true }],
        });
      }
    }
  }

  const out = {
    schritte,
    fazit: ergebnisse.map((x) => x.text).join('   ·   '),
    ergebnisse, eingaenge, ausgang, bloecke,
  };
  if (ergebnisse.length === 1) zahlenwerte(out, ergebnisse[0].rat, 'G', eingabe.werte);
  else for (const x of ergebnisse) zahlenwerte(out, x.rat, x.name, eingabe.werte);
  return out;
}

/** Text für „c·(Gleichung von v)“ beim Einsetzen, wie in der Musterlösung: G₁G₂(R·W − R·X − A·Z). */
function zwischen(c, neg, ev) {
  const cc = neg ? R.neg(c) : c;
  const inner = fmtLin(ev);
  const cs = istEins(cc) ? '' : klammer(fmtRat(cc));
  if (!cs) return ev.length > 1 ? `(${inner})` : inner;
  return `${cs}·(${inner})`;
}

// ===================== Zahlenwerte einsetzen =====================

function zahlenwerte(out, rat, label, werteText) {
  if (!werteText) return;
  const namen = [...R.vars(rat)].sort();
  if (!namen.length) return;
  const gefuellt = namen.filter((n) => werteText[n] && String(werteText[n]).trim());
  if (!gefuellt.length) return;
  if (gefuellt.length < namen.length) {
    out.schritte.push({ titel: `Zahlenwerte für ${label}`, zeilen: [{ text: `Es fehlen noch Werte für ${namen.filter((n) => !gefuellt.includes(n)).map(symText).join(', ')}.`, muted: true }] });
    return;
  }
  const werte = {};
  const zeilen = [];
  for (const n of namen) {
    try { werte[n] = parseBruchS(werteText[n]); } catch (e) { throw new Error(`Wert für ${symText(n)}: ${e.message}`); }
    zeilen.push({ text: `${symText(n)}(s) = ${String(werteText[n]).trim()}` });
  }
  const { Z, N } = einsetzenS(rat, werte);
  zeilen.push({ text: 'Einsetzen, Doppelbrüche auflösen (mit allen Teilnennern erweitern), ausmultiplizieren:', muted: true });
  const k = kuerzenS(Z, N);
  if (k.gekuerzt) zeilen.push({ text: `${label}(s) = (${bfmt(Z)}) / (${bfmt(N)})` });
  if (k.gekuerzt) {
    zeilen.push({ text: `Gemeinsamer Faktor in Zähler und Nenner: (${bfmt(k.gekuerzt)}) → kürzen`, muted: true });
  }
  zeilen.push({ text: `${label}(s) = (${bfmt(k.Z)}) / (${bfmt(k.N)})`, strong: true });
  out.schritte.push({ titel: `Zahlenwerte einsetzen: ${label}(s)`, zeilen });
  (out.zahlen ||= {})[label] = { Z: k.Z, N: k.N };
  out.fazit += `   ·   ${label}(s) = (${bfmt(k.Z)}) / (${bfmt(k.N)})`;
}

/** Einstieg für die Oberfläche. */
export function signalfluss(eingabe) {
  return eingabe.modus === 'hilfsgroessen' ? hilfsgroessen(eingabe) : bausteine(eingabe);
}
