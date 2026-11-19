// PID-Einstellregeln mit Rechenweg: T-Summe (normal/schnell), Chien-Hrones-Reswick (Führung/Störung,
// aperiodisch/20 %), Ziegler-Nichols, PID-Kompensationsregler, Kennwerte aus der Sprungantwort.
// Tabellen exakt nach den Folien V06 (S. 31 ZN, S. 36 T-Summe, S. 39/40 CHR); Literaturwerte nur als Hinweis.
// Übung 06 A2–A4.
// Reine Rechnung, keine Oberfläche.

import { fmt, frac, parsePoly, bfmt, BP, K } from '../lib/poly.js';

const z3 = (x) => fmt(x, 3);
/** Zahl wie getippt: Bruch, wenn kurz (1/3), sonst Dezimal */
const zb = (x) => {
  const d = fmt(x, 3);
  if (Math.abs(parseFloat(d.replace('−', '-').replace(',', '.')) - x) < 1e-12) return d; // exakt als Dezimalzahl (3,5)
  const f = frac(x, 100);
  return f.includes('/') ? f : fmt(x, 4);
};
const gleich = (...t) => t.filter((x, i) => t.indexOf(x) === i).join(' = ');
const fak = (x) => { const s = zb(x); return s.includes('/') || x < 0 ? `(${s})` : s; };
const komma = (x) => String(x).replace('.', ',');

function zahl(s, name) {
  if (s === undefined || s === null || !String(s).trim()) throw new Error(`Bitte ${name} eingeben.`);
  let p;
  try { p = BP.trim(parsePoly(s)); } catch (e) { throw new Error(`${name}: ${e.message}`); }
  if (p.length > 1 || !K.isConst(p[0])) throw new Error(`${name} muss eine Zahl sein (z. B. 7, 0,5 oder 1/3).`);
  return p[0][0];
}

// ---------- Tabellen ----------
// kp: { f, b } mit b = 'KS' (f/K_S), 'k' (f·T_G/(T_U·K_S)), 'Kkr' (f·K_kr). tn/tv: { f, b } mit b = Zeitbasis.
export const VERFAHREN = {
  'tsumme-normal': {
    titel: 'T-Summen-Regel, Führungsverhalten, normale Einstellung', basis: ['KS', 'TS'],
    regler: {
      P: { kp: { f: 1, b: 'KS' } },
      PD: { kp: { f: 1, b: 'KS' }, tv: { f: 0.33, b: 'TS' } },
      PI: { kp: { f: 0.5, b: 'KS' }, tn: { f: 0.5, b: 'TS' } },
      PID: { kp: { f: 1, b: 'KS' }, tn: { f: 0.66, b: 'TS' }, tv: { f: 0.167, b: 'TS' } },
    },
  },
  'tsumme-schnell': {
    titel: 'T-Summen-Regel, Führungsverhalten, schnelle Einstellung', basis: ['KS', 'TS'],
    regler: {
      PI: { kp: { f: 1, b: 'KS' }, tn: { f: 0.7, b: 'TS' } },
      PID: { kp: { f: 2, b: 'KS' }, tn: { f: 0.8, b: 'TS' }, tv: { f: 0.194, b: 'TS' } },
    },
  },
  'chr-fa': {
    titel: 'Chien-Hrones-Reswick, Führungsverhalten, aperiodisch (stark gedämpft)', basis: ['KS', 'TU', 'TG'],
    regler: {
      P: { kp: { f: 0.3, b: 'k' } },
      PI: { kp: { f: 0.35, b: 'k' }, tn: { f: 1.2, b: 'TG' } },
      PID: { kp: { f: 0.6, b: 'k' }, tn: { f: 1, b: 'TG' }, tv: { f: 0.5, b: 'TU' } },
    },
  },
  'chr-f20': {
    titel: 'Chien-Hrones-Reswick, Führungsverhalten, 20 % Überschwingen (schnell)', basis: ['KS', 'TU', 'TG'],
    regler: {
      P: { kp: { f: 0.7, b: 'k' } },
      PI: { kp: { f: 0.6, b: 'k' }, tn: { f: 1, b: 'TG' } },
      PID: { kp: { f: 0.95, b: 'k' }, tn: { f: 1.35, b: 'TG' }, tv: { f: 0.47, b: 'TU' } },
    },
  },
  'chr-sa': {
    titel: 'Chien-Hrones-Reswick, Störverhalten, aperiodisch (stark gedämpft)', basis: ['KS', 'TU', 'TG'], folieTG: true,
    regler: {
      P: { kp: { f: 0.3, b: 'k' } },
      PI: { kp: { f: 0.6, b: 'k' }, tn: { f: 4, b: 'TG' } },
      PID: { kp: { f: 0.95, b: 'k' }, tn: { f: 2.4, b: 'TG' }, tv: { f: 0.42, b: 'TU' } },
    },
  },
  'chr-s20': {
    titel: 'Chien-Hrones-Reswick, Störverhalten, 20 % Überschwingen', basis: ['KS', 'TU', 'TG'], folieTG: true,
    regler: {
      P: { kp: { f: 0.7, b: 'k' } },
      PI: { kp: { f: 0.7, b: 'k' }, tn: { f: 2.3, b: 'TG' } },
      PID: { kp: { f: 1.2, b: 'k' }, tn: { f: 2, b: 'TG' }, tv: { f: 0.42, b: 'TU' } },
    },
  },
  zn: {
    titel: 'Ziegler-Nichols (Schwingversuch)', basis: ['Kkr', 'Tkr'],
    regler: {
      P: { kp: { f: 0.5, b: 'Kkr' } },
      PI: { kp: { f: 0.45, b: 'Kkr' }, tn: { f: 0.85, b: 'Tkr' } },
      PID: { kp: { f: 0.6, b: 'Kkr' }, tn: { f: 0.5, b: 'Tkr' }, tv: { f: 0.12, b: 'Tkr' } },
    },
  },
};

const NAME = { KS: 'K_S', TS: 'T_Σ', TU: 'T_U', TG: 'T_G', Kkr: 'K_kr', Tkr: 'T_kr' };
const EINGABE = { KS: 'KS', TS: 'TS', TU: 'TU', TG: 'TG', Kkr: 'Kkr', Tkr: 'Tkr' };

function formelKP(kp) {
  if (kp.b === 'KS') return `${komma(kp.f)}/K_S`;
  if (kp.b === 'k') return `${komma(kp.f)} · T_G/(T_U·K_S)`;
  return `${komma(kp.f)} · K_kr`;
}
const formelT = (t) => (t.f === 1 ? NAME[t.b] : `${komma(t.f)} · ${NAME[t.b]}`);

/** Ein Regler nach Tabelle: Werte + Rechenweg-Zeilen. */
function einRegler(typ, regel, w, verf) {
  const zeilen = [];
  const formel = [`K_P = ${formelKP(regel.kp)}`];
  if (regel.tn) formel.push(`T_n = ${formelT(regel.tn)}`);
  if (regel.tv) formel.push(`T_v = ${formelT(regel.tv)}`);
  zeilen.push({ text: `Tabelle (${typ}-Regler): ${formel.join(',  ')}`, muted: true });

  let KP;
  const kp = regel.kp;
  if (kp.b === 'KS') {
    KP = kp.f / w.KS;
    zeilen.push({ text: `K_P = ${komma(kp.f)}/K_S = ${komma(kp.f)}/${fak(w.KS)} = ${z3(KP)}`, strong: true });
  } else if (kp.b === 'k') {
    KP = kp.f * w.k;
    zeilen.push({ text: `K_P = ${komma(kp.f)} · T_G/(T_U·K_S) = ${komma(kp.f)} · ${zb(w.TG)}/(${zb(w.TU)}·${fak(w.KS)}) = ${komma(kp.f)} · ${zb(w.k)} = ${z3(KP)}`, strong: true });
  } else {
    KP = kp.f * w.Kkr;
    zeilen.push({ text: `K_P = ${komma(kp.f)} · K_kr = ${komma(kp.f)} · ${zb(w.Kkr)} = ${z3(KP)}`, strong: true });
  }
  const zeit = (t, n) => {
    const x = t.f * w[t.b];
    zeilen.push({ text: `${n} = ${formelT(t)} = ${t.f === 1 ? '' : komma(t.f) + ' · '}${zb(w[t.b])} = ${z3(x)}`.replace('=  =', '=').replace(/= (\S+) = \1$/, '= $1'), strong: true });
    return x;
  };
  const Tn = regel.tn ? zeit(regel.tn, 'T_n') : null;
  const Tv = regel.tv ? zeit(regel.tv, 'T_v') : null;

  // Hinweise zu Abweichungen zwischen Folie und Literatur
  if (verf.folieTG && regel.tn) {
    const alt = regel.tn.f * w.TU;
    zeilen.push({ text: `Literatur/Fachbücher: T_n mit T_U statt T_G (= ${komma(regel.tn.f)} · ${zb(w.TU)} = ${z3(alt)}). Gerechnet wird nach Folie V06 S. 40.`, muted: true });
  }
  if (verf === VERFAHREN.zn && regel.tv) {
    zeilen.push({ text: `Literatur: 0,125·T_kr (= ${z3(0.125 * w.Tkr)}). Gerechnet wird nach Folie V06 S. 31.`, muted: true });
  }

  // Reglergleichung (ideale Parallelform, wie Vorlesung)
  const teile = [z3(KP)];
  let gl;
  if (Tn && Tv) gl = `R(s) = K_P·(1 + 1/(T_n·s) + T_v·s) = ${z3(KP)}·(1 + 1/(${z3(Tn)}s) + ${z3(Tv)}s)`;
  else if (Tn) gl = `R(s) = K_P·(1 + 1/(T_n·s)) = ${z3(KP)}·(1 + 1/(${z3(Tn)}s))`;
  else if (Tv) gl = `R(s) = K_P·(1 + T_v·s) = ${z3(KP)}·(1 + ${z3(Tv)}s)`;
  else gl = `R(s) = K_P = ${teile[0]}`;
  zeilen.push({ text: gl });
  const KI = Tn ? KP / Tn : null, KD = Tv ? KP * Tv : null;
  const extra = [];
  if (KI !== null) extra.push(`K_I = K_P/T_n = ${z3(KI)}`);
  if (KD !== null) extra.push(`K_D = K_P·T_v = ${z3(KD)}`);
  if (extra.length) zeilen.push({ text: extra.join(',  '), muted: true });
  return { zeilen, KP, Tn, Tv, KI, KD };
}

function werteLesen(verf, input) {
  const w = {};
  for (const b of verf.basis) w[b] = zahl(input[EINGABE[b]], NAME[b]);
  if ('KS' in w && w.KS <= 0) throw new Error('K_S muss > 0 sein.');
  for (const b of ['TS', 'TU', 'TG', 'Tkr', 'Kkr']) if (b in w && w[b] <= 0) throw new Error(`${NAME[b]} muss > 0 sein.`);
  if ('TU' in w) w.k = w.TG / (w.TU * w.KS);
  return w;
}

function einstellregel(input) {
  const verf = VERFAHREN[input.verfahren];
  const w = werteLesen(verf, input);
  const schritte = [];
  const gegeben = verf.basis.map((b) => `${NAME[b]} = ${zb(w[b])}`).join(',  ');
  const zeilen = [{ text: `Gegeben: ${gegeben}` }];
  if ('k' in w) {
    zeilen.push({ text: `Hilfsgröße: T_G/(T_U·K_S) = ${zb(w.TG)}/(${zb(w.TU)}·${fak(w.KS)}) = ${zb(w.k)}${frac(w.k, 100).includes('/') ? ' ≈ ' + fmt(w.k, 4) : ''}` });
  }
  schritte.push({ titel: verf.titel, zeilen });

  const typen = input.regler === 'alle' ? Object.keys(verf.regler) : [input.regler];
  const regel0 = verf.regler[input.regler];
  if (input.regler !== 'alle' && !regel0) {
    throw new Error(`Für „${verf.titel}“ gibt es keinen ${input.regler}-Regler in der Tabelle. Möglich: ${Object.keys(verf.regler).join(', ')}.`);
  }
  const erg = {};
  for (const t of typen) {
    const r = einRegler(t, verf.regler[t], w, verf);
    erg[t] = { KP: r.KP, Tn: r.Tn, Tv: r.Tv, KI: r.KI, KD: r.KD };
    schritte.push({ titel: `${t}-Regler`, zeilen: r.zeilen });
  }
  if (typen.length > 1) {
    const tab = [['Regler', 'K_P', 'T_n', 'T_v'], ...typen.map((t) => [t, z3(erg[t].KP), erg[t].Tn === null ? '–' : z3(erg[t].Tn), erg[t].Tv === null ? '–' : z3(erg[t].Tv)])];
    schritte.splice(1, 0, { titel: 'Übersicht', zeilen: [{ text: '', matrix: tab }] });
  }
  const e = typen.length === 1 ? erg[typen[0]] : null;
  const fazit = e
    ? [`K_P = ${z3(e.KP)}`, e.Tn !== null && `T_n = ${z3(e.Tn)}`, e.Tv !== null && `T_v = ${z3(e.Tv)}`].filter(Boolean).join(',  ')
    : `${typen.length} Regler berechnet (Tabelle unten)`;
  return { schritte, fazit, ...(e || {}), alle: erg };
}

// ---------- Strecke in Produktform lesen ----------
/** "5/((7s+1)(3s+1)(11s+1))" oder "(1+7s)(1+3s)" → { KS, T: [7, 3, 11] } */
export function streckeLesen(s, ksFeld) {
  const src = String(s).replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/[·*]/g, '');
  if (!src) throw new Error('Bitte die Strecke eingeben, z. B. 5/((7s+1)(3s+1)(11s+1)).');
  let zaehler = null, nenner = src;
  const m = /^\(?([^()/]+)\)?\/(.+)$/.exec(src);
  if (m) { zaehler = m[1]; nenner = m[2]; }
  if (nenner.startsWith('(') && nenner.endsWith(')') && /^\((\(.*\))+\)$/.test(nenner)) nenner = nenner.slice(1, -1);
  const faktoren = nenner.match(/\(([^()]*)\)(\^\d+|[²³])?/g);
  if (!faktoren || faktoren.join('') !== nenner) throw new Error('Nenner bitte als Produkt von Klammern schreiben, z. B. (7s+1)(3s+1)(11s+1).');
  let KS = zaehler !== null ? zahl(zaehler, 'Zähler der Strecke') : (ksFeld !== undefined && String(ksFeld).trim() ? zahl(ksFeld, 'K_S') : 1);
  const T = [];
  for (const f of faktoren) {
    const mm = /^\(([^()]*)\)(?:\^(\d+)|([²³]))?$/.exec(f);
    const n = mm[2] ? +mm[2] : mm[3] === '²' ? 2 : mm[3] === '³' ? 3 : 1;
    const p = BP.trim(parsePoly(mm[1]));
    if (p.length !== 2 || BP.hasParam(p)) throw new Error(`Faktor ${f}: nur PT1-Faktoren (T·s + 1) erlaubt.`);
    const a0 = p[0][0], a1 = p[1][0];
    if (Math.abs(a0) < 1e-12) throw new Error(`Faktor ${f}: Integrator (s ohne +1) – Einstellregeln gelten nur für P-Tn-Strecken.`);
    if (a1 / a0 <= 0) throw new Error(`Faktor ${f}: Zeitkonstante muss > 0 sein (stabile Strecke).`);
    for (let k = 0; k < n; k++) { T.push(a1 / a0); KS /= a0; }
  }
  return { KS, T };
}

const pt1 = (T) => `(${zb(T)}s + 1)`;

function kompensation(input) {
  const { KS, T } = streckeLesen(input.strecke, input.KS);
  if (T.length < 2) throw new Error('Für den PID-Kompensationsregler braucht die Strecke mindestens 2 Zeitkonstanten.');
  const schritte = [];
  // die zwei größten, in der Reihenfolge wie in der Strecke
  const sortiert = T.map((t, i) => [t, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const idx2 = [sortiert[0][1], sortiert[1][1]].sort((a, b) => a - b);
  const [TR1, TR2] = idx2.map((i) => T[i]);
  const rest = T.filter((_, i) => !idx2.includes(i));
  schritte.push({
    titel: 'Strecke und größte Zeitkonstanten',
    zeilen: [
      { text: `G(s) = ${zb(KS)}/(${T.map(pt1).join('')})` },
      { text: `K_S = ${zb(KS)},  Zeitkonstanten: ${T.map(zb).join(', ')}` },
      { text: `Die beiden größten Zeitkonstanten werden kompensiert: T_R1 = ${zb(TR1)},  T_R2 = ${zb(TR2)}`, strong: true },
      ...(rest.length ? [{ text: `Übrig bleibt: ${rest.map(zb).join(', ')}`, muted: true }] : []),
    ],
  });
  const Tn = TR1 + TR2, Tv = (TR1 * TR2) / Tn;
  schritte.push({
    titel: 'Nachstellzeit T_n und Vorhaltzeit T_v (Koeffizientenvergleich)',
    zeilen: [
      { text: `T_n = T_R1 + T_R2 = ${zb(TR1)} + ${zb(TR2)} = ${z3(Tn)}`, strong: true },
      { text: `T_v = T_R1·T_R2/(T_R1 + T_R2) = ` + gleich(`${zb(TR1 * TR2)}/${zb(Tn)}`, zb(Tv), z3(Tv)), strong: true },
      { text: `R(s) = K_P · (1 + T_R1·s)(1 + T_R2·s)/(T_n·s) = K_P · (1 + ${zb(TR1)}s)(1 + ${zb(TR2)}s)/(${zb(Tn)}s)` },
    ],
  });
  // G0 = K_S·K_P / (T_n s · Π(1+T s))
  let N0 = [[0], [Tn]]; // T_n·s
  for (const t of rest) N0 = BP.mul(N0, [[1], [t]]);
  const Z0 = [[0, KS]];
  const NW = BP.add(N0, Z0);
  const restTxt = rest.map(pt1).join('');
  const zeilenG = [
    { text: `G₀(s) = R(s)·G(s) = K_P·(1 + ${zb(TR1)}s)(1 + ${zb(TR2)}s)/(${zb(Tn)}s) · ${zb(KS)}/(${T.map(pt1).join('')})` },
    { text: `Gleiche Klammern kürzen sich weg:`, muted: true },
    { text: `G₀(s) = ${bfmt(Z0, 'K_P')} / (${zb(Tn)}s${restTxt ? '·' + restTxt : ''})`, strong: true },
    { text: `G_W(s) = G₀/(1 + G₀) = Z₀/(N₀ + Z₀)` },
    { text: `G_W(s) = ${bfmt(Z0, 'K_P')} / (${bfmt(NW, 'K_P')})`, strong: true },
  ];
  schritte.push({ titel: 'Offener und geschlossener Kreis', zeilen: zeilenG });

  const out = { Tn, Tv, TR1, TR2, KS };
  const d = String(input.d ?? '').trim() ? zahl(input.d, 'Dämpfung d') : null;
  if (d !== null) {
    if (rest.length === 1) {
      const a2 = Tn * rest[0], a1 = Tn;
      // G_W = (K_S K_P/a2)/(s² + a1/a2 s + K_S K_P/a2); 2dω0 = a1/a2; ω0² = K_S K_P/a2
      const w0 = a1 / a2 / (2 * d);
      const KP = (a2 * w0 * w0) / KS;
      out.KP = KP; out.w0 = w0;
      schritte.push({
        titel: `Reglerverstärkung K_P für Dämpfung d = ${zb(d)}`,
        zeilen: [
          { text: `G_W(s) = (${zb(KS)}K_P/${zb(a2)}) / (s² + ${zb(a1)}/${zb(a2)}·s + ${zb(KS)}K_P/${zb(a2)})` },
          { text: `Vergleich mit PT2-Glied: G(s) = K·ω₀²/(s² + 2d·ω₀·s + ω₀²)`, muted: true },
          { text: `(I)  2d·ω₀ = ${zb(a1)}/${zb(a2)}   mit d = ${zb(d)} ⇒ ω₀ = ${zb(a1)}/${fak(2 * d * a2)} = ${zb(w0)}${frac(w0, 1000).includes('/') ? ' = ' + fmt(w0, 4) : ''}` },
          { text: `(II) ω₀² = ${zb(KS)}K_P/${zb(a2)}  ⇒  K_P = ${zb(a2)}·ω₀²/${zb(KS)} = ${zb(a2)}·(${zb(w0)})²/${zb(KS)} = ${z3(KP)}`, strong: true },
          { text: `R(s) = ${z3(KP)} · (1 + ${zb(TR1)}s)(1 + ${zb(TR2)}s)/(${zb(Tn)}s)`, strong: true },
        ],
      });
    } else if (rest.length === 0) {
      schritte.push({ titel: 'Dämpfung', zeilen: [{ text: `Es bleibt kein PT1 übrig: G_W ist ein PT1-Glied mit T = T_n/(K_S·K_P) – keine Schwingung, d spielt keine Rolle. K_P frei wählbar (größer = schneller).` }] });
    } else {
      schritte.push({ titel: 'Dämpfung', zeilen: [{ text: `Es bleiben ${rest.length} Zeitkonstanten übrig → G_W ist kein PT2, K_P für d kann so nicht bestimmt werden.` }] });
    }
  }
  // Zum Vergleich T-Summe schnell (Ü06 A4 fragt danach)
  const TS = T.reduce((a, b) => a + b, 0);
  const kp2 = 2 / KS, tn2 = 0.8 * TS, tv2 = 0.194 * TS;
  out.tsumme = { TS, KP: kp2, Tn: tn2, Tv: tv2 };
  schritte.push({
    titel: 'Zum Vergleich: PID nach T_Σ-Regel (schnelle Einstellung)',
    zeilen: [
      { text: `K_S = h(∞) = lim s→0 G(s) = ${zb(KS)}  (stationärer Endwert)` },
      { text: `T_Σ = Summe der Zeitkonstanten = ${T.map(zb).join(' + ')} = ${zb(TS)}` },
      { text: `K_P = 2/K_S = 2/${fak(KS)} = ${z3(kp2)}`, strong: true },
      { text: `T_n = 0,8 · T_Σ = 0,8 · ${zb(TS)} = ${z3(tn2)}`, strong: true },
      { text: `T_v = 0,194 · T_Σ = 0,194 · ${zb(TS)} = ${z3(tv2)}`, strong: true },
    ],
  });
  const fazit = `T_n = ${z3(Tn)},  T_v = ${z3(Tv)}${out.KP !== undefined ? `,  K_P = ${z3(out.KP)} (d = ${zb(d)})` : ''}`;
  return { schritte, fazit, ...out };
}

function kennwerte(input) {
  const schritte = [];
  const out = {};
  const zeilen = [];
  const hatK = ['xa1', 'xa2', 'xe1', 'xe2'].every((k) => String(input[k] ?? '').trim());
  if (hatK) {
    const xa1 = zahl(input.xa1, 'x_a vorher'), xa2 = zahl(input.xa2, 'x_a nachher');
    const xe1 = zahl(input.xe1, 'x_e vorher'), xe2 = zahl(input.xe2, 'x_e nachher');
    if (xe2 === xe1) throw new Error('Der Eingangssprung Δx_e darf nicht 0 sein.');
    const KS = (xa2 - xa1) / (xe2 - xe1);
    out.KS = KS;
    zeilen.push({ text: `Verstärkung: K_S = Δx_a/Δx_e = (${zb(xa2)} − ${fak(xa1)})/(${zb(xe2)} − ${fak(xe1)}) = ` + gleich(`${zb(xa2 - xa1)}/${zb(xe2 - xe1)}`, zb(KS)) + (frac(KS, 100).includes('/') ? ' ≈ ' + fmt(KS, 4) : ''), strong: true });
  }
  if (String(input.zeitkonstanten ?? '').trim()) {
    const T = String(input.zeitkonstanten).trim().split(/[;\s]+/).filter(Boolean).map((x) => zahl(x, 'Zeitkonstante'));
    const TS = T.reduce((a, b) => a + b, 0);
    out.TS = TS;
    zeilen.push({ text: `Summenzeitkonstante: T_Σ = ${T.map(zb).join(' + ')} = ${zb(TS)}`, strong: true });
    zeilen.push({ text: 'Gilt für P-Tn-Strecke 1/((1+T₁s)(1+T₂s)…): T_Σ = T₁ + T₂ + … (+ Totzeit).', muted: true });
  }
  if (String(input.A ?? '').trim() && out.KS !== undefined) {
    const A = zahl(input.A, 'Fläche A');
    out.TS = A / out.KS;
    zeilen.push({ text: `T_Σ = A/K_S = ${zb(A)}/${fak(out.KS)} = ${z3(out.TS)}`, strong: true });
  }
  if (!zeilen.length) throw new Error('Bitte Sprunghöhen (x_e, x_a vorher/nachher) oder Zeitkonstanten eingeben.');
  schritte.push({ titel: 'Kennwerte der Strecke', zeilen });
  schritte.push({
    titel: 'T_U und T_G aus dem Bild (Wendetangente)',
    zeilen: [
      { text: 'Tangente im Wendepunkt der Sprungantwort zeichnen.', muted: true },
      { text: 'T_U (Verzugszeit): vom Sprungzeitpunkt bis Schnitt der Tangente mit dem Anfangswert.', muted: true },
      { text: 'T_G (Ausgleichszeit): vom Schnitt mit dem Anfangswert bis Schnitt mit dem Endwert.', muted: true },
      { text: 'T_Σ: senkrechte Linie, bei der die Fläche A₁ (links, über der Kurve) = A₂ (rechts, unter der Kurve) ist.', muted: true },
      { text: 'Ü06 A2: Sprung 6 → 9, Ausgang 2,5 → 3,5: K = 1/3, T_U ≈ 7, T_G ≈ 20, T_Σ ≈ 19.', muted: true },
    ],
  });
  const fazit = [out.KS !== undefined && `K_S = ${zb(out.KS)}`, out.TS !== undefined && `T_Σ = ${z3(out.TS)}`].filter(Boolean).join(',  ');
  return { schritte, fazit, ...out };
}

/**
 * Eingabe: { verfahren, regler: 'P'|'PD'|'PI'|'PID'|'alle', KS, TS, TU, TG, Kkr, Tkr }
 *          { verfahren: 'kompensation', strecke, KS?, d? }
 *          { verfahren: 'kennwerte', xa1, xa2, xe1, xe2, zeitkonstanten?, A? }
 */
export function pid(input) {
  if (input.verfahren === 'kompensation') return kompensation(input);
  if (input.verfahren === 'kennwerte') return kennwerte(input);
  if (!VERFAHREN[input.verfahren]) throw new Error('Unbekanntes Verfahren.');
  return einstellregel(input);
}
