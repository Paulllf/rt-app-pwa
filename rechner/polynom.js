// Polynom-Rechner: Pol-/Nullstellen mit Rechenweg. Reine Rechnung, keine Oberfläche.
// Klausur A11: Polstellen mit bekannter Polstelle s₁ → Polynomdivision → pq-Formel → Stabilität.
// Ü04 A1 / Python A3: Null- und Polstellen von G(s) = Z(s)/N(s), Produktdarstellung.

import { sub } from '../lib/poly.js';
import {
  leseQPoly, leseZahl, pfmt, pkl, nullstellenMitWeg, produkt, vorfaktor, stabilitaet, wfmt, ausmultiplizieren, dez,
} from '../lib/polynom-kern.js';

/** "−1/3; −5" → [Q, Q]. Leer → []. Trennzeichen ; (Komma ist das Dezimalzeichen). */
export function leseBekannte(text, wasFuer) {
  const t = String(text ?? '').trim();
  if (!t) return [];
  return t.split(/[;]|\s+und\s+/).map((x) => x.trim()).filter(Boolean).map((x) => leseZahl(x, wasFuer));
}

const lab = (pre) => (i) => 's' + pre + sub(i);

/** Lösungsliste und Produktdarstellung als Zeilen */
function loesungZeilen(p, wurzeln, bekannt, labf, wasP) {
  const zeilen = wurzeln.map((w, i) => ({ text: `${labf(i + 1)} = ${wfmt(w, true)}`, strong: true }));
  const pr = produkt(p[p.length - 1], wurzeln, bekannt);
  zeilen.push({ text: 'Produktdarstellung:', muted: true });
  if (pr.gemischt) zeilen.push({ text: `${wasP} = ${pr.gemischt}   (wie Musterlösung: bekannte Wurzel als (s − s₁), Rest als (Ts + 1))` });
  zeilen.push({ text: `${wasP} = ${pr.s}   (Form aₙ·(s − s₁)(s − s₂)…)` });
  zeilen.push({ text: `${wasP} = ${pr.t}   (Zeitkonstanten-Form V·(T₁s + 1)…, T = −1/sᵢ)` });
  return { zeilen, pr };
}

/** Kontrolle: ausmultiplizieren und mit dem Original vergleichen */
function kontrolle(p, wurzeln) {
  const back = ausmultiplizieren(p[p.length - 1], wurzeln);
  const ok = back.length === p.length && back.every((c, i) => Math.abs(c - p[i].num()) <= 1e-6 * Math.max(1, ...p.map((x) => Math.abs(x.num()))));
  return ok ? { text: 'Kontrolle: Produkt wieder ausmultipliziert ergibt das Ausgangspolynom ✓', muted: true }
    : { text: 'Achtung: Kontrolle (ausmultiplizieren) passt nicht – numerisch ungenau?', muted: true };
}

/**
 * Eingabe:
 *   { modus: 'polynom', polynom: '30s^3+s^2-6s-1', bekannt: '-1/3' }     (A11: Polynom = Nenner N(s))
 *   { modus: 'gs', zaehler: '4s^2+5s+1', nenner: '30s^3+31s^2+10s+1', bekanntPol: '-1/2', bekanntNull: '' }
 * Ausgabe: { schritte, fazit, stabil, wurzeln | nullstellen + pole, produkt }
 */
export function polynom(input) {
  if (input.modus === 'gs') return gs(input);
  const p = leseQPoly(input.polynom, 'das Polynom');
  if (p.length < 2) throw new Error('Das Polynom braucht mindestens ein s (Grad ≥ 1).');
  const bekannt = leseBekannte(input.bekannt, 'Bekannte Polstelle');
  const labf = lab('');
  const schritte = [{
    titel: 'Ansatz',
    zeilen: [
      { text: `N(s) = ${pfmt(p)}   (Grad ${p.length - 1})` },
      { text: 'Polstellen von G(s) = Nullstellen des Nenners: N(s) = 0', muted: true },
    ],
  }];
  const r = nullstellenMitWeg(p, { bekannt, name: 'N(s)', titelArt: 'Polstellen', lab: labf });
  schritte.push(...r.schritte);
  const { zeilen, pr } = loesungZeilen(p, r.wurzeln, bekannt, labf, 'N(s)');
  zeilen.push(kontrolle(p, r.wurzeln));
  schritte.push({ titel: 'Lösung', zeilen });
  const st = stabilitaet(r.wurzeln, r.wurzeln.map((_, i) => labf(i + 1)));
  schritte.push({ titel: 'Stabilität', zeilen: [{ text: st.text, strong: true }, { text: 'Merksatz: stabil ⇔ alle Pole in der linken Halbebene (Re{sᵢ} < 0).', muted: true }] });
  const liste = r.wurzeln.map((w, i) => `${labf(i + 1)} = ${wfmt(w)}`).join(', ');
  return {
    schritte,
    fazit: `Polstellen: ${liste} → ${kurz(st)}`,
    stabil: st.stabil,
    wurzeln: r.wurzeln,
    werte: r.wurzeln.map((w) => [w.re, w.im]),
    produkt: pr,
  };
}

const kurz = (st) => (st.stabil === true ? 'System ist stabil' : st.stabil === false ? 'System nicht stabil (positiver Realteil)' : 'Grenzfall (Pol auf der imaginären Achse)');

function gs(input) {
  const Z = leseQPoly(input.zaehler, 'den Zähler Z(s)');
  const N = leseQPoly(input.nenner, 'den Nenner N(s)');
  if (N.length === 1 && N[0].isZero()) throw new Error('Nenner N(s) darf nicht 0 sein.');
  if (Z.length === 1 && Z[0].isZero()) throw new Error('Zähler Z(s) = 0 → G(s) = 0. Bitte Zähler prüfen.');
  const bp = leseBekannte(input.bekanntPol, 'Bekannte Polstelle');
  const bn = leseBekannte(input.bekanntNull, 'Bekannte Nullstelle');
  const labN = lab('_N'), labP = lab('_P');
  const schritte = [{
    titel: 'Ansatz',
    zeilen: [
      { text: `G(s) = Z(s)/N(s) = ${pkl(Z)} / ${pkl(N)}` },
      { text: 'Nullstellen: Z(s) = 0 · Polstellen: N(s) = 0', muted: true },
    ],
  }];
  const rz = nullstellenMitWeg(Z, { bekannt: bn, name: 'Z(s)', titelArt: 'Nullstellen', lab: labN });
  const rn = nullstellenMitWeg(N, { bekannt: bp, name: 'N(s)', titelArt: 'Polstellen', lab: labP });
  schritte.push(...rz.schritte, ...rn.schritte);

  const zeilen = [];
  if (rz.wurzeln.length) zeilen.push({ text: 'Nullstellen: ' + rz.wurzeln.map((w, i) => `${labN(i + 1)} = ${wfmt(w)}`).join(', '), strong: true });
  else zeilen.push({ text: 'Keine Nullstellen (Z(s) ist konstant).', strong: true });
  zeilen.push({ text: 'Polstellen: ' + rn.wurzeln.map((w, i) => `${labP(i + 1)} = ${wfmt(w)}`).join(', '), strong: true });
  // Dezimalwerte (wie Python zero()/pole())
  const dz = (ws) => ws.map((w) => (w.im ? wfmt(w) : dez(w.re))).join('; ');
  zeilen.push({ text: `Dezimal: Nullstellen ${dz(rz.wurzeln) || '–'} · Pole ${dz(rn.wurzeln)}`, muted: true });

  const pz = produkt(Z[Z.length - 1], rz.wurzeln, bn);
  const pn = produkt(N[N.length - 1], rn.wurzeln, bp);
  // Nenner in Klammern, wenn er aus mehreren Faktoren besteht
  const kl = (t) => (t === '' ? '1' : /^\([^()]*\)$/.test(t) || /^[^()]*$/.test(t) ? t : `(${t})`);
  // Zeitkonstanten-Form: Verstärkung V = V_Z / V_N vorziehen
  const V = pz.Vq && pn.Vq ? { q: pz.Vq.div(pn.Vq), n: pz.Vq.div(pn.Vq).num() } : { q: null, n: pz.V / pn.V };
  const k = Z[Z.length - 1].div(N[N.length - 1]);
  zeilen.push({ text: 'Produktdarstellung:', muted: true });
  zeilen.push({ text: `G(s) = ${vorfaktor(V, pz.tFak)} / ${kl(pn.tFak)}   (Zeitkonstanten-Form, wie Ü04)`, strong: true });
  zeilen.push({ text: `G(s) = ${vorfaktor({ q: k, n: k.num() }, pz.sFak)} / ${kl(pn.sFak)}   (Form (s − sᵢ), Vorfaktor a_Z/a_N = ${k})` });
  if (pz.gemischt || pn.gemischt) zeilen.push({ text: `Mit bekannter Wurzel als (s − s₁): Z(s) = ${pz.gemischt || pz.t}, N(s) = ${pn.gemischt || pn.t}`, muted: true });
  zeilen.push(kontrolle(Z, rz.wurzeln), kontrolle(N, rn.wurzeln));
  schritte.push({ titel: 'Lösung', zeilen });

  // Kürzen möglich? (gleiche Null- und Polstelle)
  const gemeinsam = rz.wurzeln.filter((w) => rn.wurzeln.some((u) => Math.abs(u.re - w.re) < 1e-9 && Math.abs(u.im - w.im) < 1e-9));
  const st = stabilitaet(rn.wurzeln, rn.wurzeln.map((_, i) => labP(i + 1)));
  const stz = [{ text: st.text, strong: true }, { text: 'Für die Stabilität zählen nur die Pole (Nenner), nicht die Nullstellen.', muted: true }];
  if (gemeinsam.length) stz.push({ text: `Hinweis: ${gemeinsam.map((w) => wfmt(w)).join(', ')} ist Null- und Polstelle zugleich → kürzt sich heraus.`, muted: true });
  schritte.push({ titel: 'Stabilität', zeilen: stz });

  const nl = rz.wurzeln.map((w) => wfmt(w)).join('; ') || 'keine';
  const pl = rn.wurzeln.map((w) => wfmt(w)).join('; ');
  return {
    schritte,
    fazit: `Nullstellen: ${nl} · Polstellen: ${pl} → ${kurz(st)}`,
    stabil: st.stabil,
    nullstellen: rz.wurzeln,
    pole: rn.wurzeln,
    produkt: { zaehler: pz, nenner: pn, V },
  };
}
