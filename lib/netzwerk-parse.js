// Eingabe einer Impedanz als Text: R, L, C (mit Index R1, C₂), "+" = Reihe, "‖" (oder ||, //, |) = parallel,
// Klammern. ‖ bindet stärker als +:  R + L‖C  =  R + (L‖C).
// Baum: { typ: 'el', art: 'R'|'L'|'C', name: 'R1' } | { typ: 'reihe'|'parallel', teile: [...] }

const TIEF = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };

function tokens(s) {
  s = String(s ?? '').replace(/[₀-₉]/g, (c) => TIEF[c]).replace(/_/g, '');
  const out = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '|' || c === '‖' || c === '∥') { out.push({ t: 'par' }); i += s[i + 1] === '|' && c === '|' ? 2 : 1; continue; }
    if (c === '/' && s[i + 1] === '/') { out.push({ t: 'par' }); i += 2; continue; }
    if (c === '+') { out.push({ t: 'ser' }); i++; continue; }
    if (c === '(' || c === ')') { out.push({ t: c }); i++; continue; }
    const m = /^[RLCrlc]\d*/.exec(s.slice(i));
    if (m) {
      out.push({ t: 'el', art: m[0][0].toUpperCase(), idx: m[0].slice(1) });
      i += m[0].length;
      continue;
    }
    if (c === '-' || c === '−') throw new Error('„−“ gibt es hier nicht: Reihe = „+“, parallel = „‖“.');
    throw new Error(`Unbekanntes Zeichen „${c}“. Erlaubt: R, L, C (auch R1, C2), +, ‖, Klammern.`);
  }
  return out;
}

export function parseImpedanz(text) {
  const tk = tokens(text);
  if (!tk.length) throw new Error('Leeres Feld: bitte R, L oder C (oder eine Kombination) eingeben.');
  let p = 0;
  const peek = () => tk[p];
  function reihe() {
    const teile = [parallel()];
    while (peek() && peek().t === 'ser') { p++; teile.push(parallel()); }
    return teile.length === 1 ? teile[0] : flach('reihe', teile);
  }
  function parallel() {
    const teile = [atom()];
    while (peek() && peek().t === 'par') { p++; teile.push(atom()); }
    return teile.length === 1 ? teile[0] : flach('parallel', teile);
  }
  function atom() {
    const t = tk[p++];
    if (!t) throw new Error('Ausdruck endet zu früh (fehlt ein Bauteil nach + oder ‖?).');
    if (t.t === 'el') return { typ: 'el', art: t.art, idx: t.idx };
    if (t.t === '(') {
      const r = reihe();
      if (!tk[p] || tk[p].t !== ')') throw new Error('Klammer „)“ fehlt.');
      p++;
      return r;
    }
    throw new Error('Hier fehlt ein Bauteil (R, L oder C).');
  }
  const r = reihe();
  if (p < tk.length) throw new Error(tk[p].t === ')' ? 'Eine Klammer „)“ zu viel.' : 'Zwischen zwei Bauteilen fehlt + (Reihe) oder ‖ (parallel).');
  return r;
}

function flach(typ, teile) {
  return { typ, teile: teile.flatMap((x) => (x.typ === typ ? x.teile : [x])) };
}

export function blaetter(baum, out = []) {
  if (baum.typ === 'el') out.push(baum);
  else baum.teile.forEach((x) => blaetter(x, out));
  return out;
}

/**
 * Namen vergeben: Bauteile ohne Index, deren Buchstabe mehrfach vorkommt, bekommen 1, 2, … in Lesereihenfolge
 * (erst Z₁, dann Z₂), wie in der Übung (R₁, R₂, C₁, C₂). Einzelne bleiben R, L, C.
 */
export function namenVergeben(baeume) {
  const alle = baeume.flatMap((b) => blaetter(b));
  const proArt = {};
  alle.forEach((x) => { (proArt[x.art] ||= []).push(x); });
  for (const art of Object.keys(proArt)) {
    const liste = proArt[art];
    const benutzt = new Set(liste.filter((x) => x.idx).map((x) => x.idx));
    const ohne = liste.filter((x) => !x.idx);
    if (liste.length === 1) continue; // einzeln: bleibt wie eingegeben (R oder R1)
    // mehrfach: die ohne Index bekommen den nächsten freien (z. B. "R + R2" → R1 + R2)
    let n = 1;
    for (const x of ohne) {
      while (benutzt.has(String(n))) n++;
      x.idx = String(n);
      benutzt.add(String(n));
    }
  }
  alle.forEach((x) => { x.name = x.art + (x.idx || ''); });
  return baeume;
}
