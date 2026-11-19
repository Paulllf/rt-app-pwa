// FUP-Zeichnung als SVG-Text (wie Musterlösung K1/K2: &-Glieder links, >=1 in der Mitte, „=“ rechts,
// Negation als Kreis am Gattereingang, Adresse klein über dem Namen). Reine Funktion → in Node testbar.

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const PITCH = 36;     // Abstand der Eingänge
const BOXW = 64;
const R = 5;          // Negationskreis
const textW = (s) => String(s ?? '').length * 8.4;

function rahmen(inhalt, w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(w)} ${Math.ceil(h)}" style="width:100%;max-width:${Math.ceil(w)}px;height:auto;display:block;margin:8px 0" font-family="ui-monospace, Menlo, monospace" font-size="14" fill="none" stroke="currentColor" stroke-width="1.6">${inhalt}</svg>`;
}

const txt = (x, y, s, anker = 'end', klein = false) =>
  `<text x="${x}" y="${y}" text-anchor="${anker}" stroke="none" ${klein ? 'font-size="11" style="fill:var(--accent, #2b6cb0)"' : 'fill="currentColor"'}>${esc(s)}</text>`;

/** Eingangsbeschriftung + Leitung bis xEnde, Negationskreis davor. */
function eingang(e, xLabel, xEnde, y) {
  let s = txt(xLabel, y + 5, e.name);
  if (e.adr) s += txt(xLabel, y - 9, e.adr, 'end', true);
  if (e.neg) {
    s += `<line x1="${xLabel + 6}" y1="${y}" x2="${xEnde - 2 * R}" y2="${y}"/>`;
    s += `<circle cx="${xEnde - R}" cy="${y}" r="${R}" fill="none"/>`;
  } else s += `<line x1="${xLabel + 6}" y1="${y}" x2="${xEnde}" y2="${y}"/>`;
  return s;
}

/** Leitungslänge vor dem „=“-Kasten, damit ein langer Name nicht in das Gatter davor ragt. */
const abstand = (aus) => Math.max(40, Math.max(textW(aus.name), textW(aus.adr) * 0.8) / 2 - BOXW / 2 + 24);

function zuweisung(x, yMitte, ausgang) {
  let s = `<rect x="${x}" y="${yMitte - 14}" width="${BOXW}" height="34"/>`;
  s += `<line x1="${x}" y1="${yMitte - 1}" x2="${x + BOXW}" y2="${yMitte - 1}"/>`;
  s += txt(x + BOXW / 2, yMitte - 3, '=', 'middle');
  s += txt(x + BOXW / 2, yMitte - 20, ausgang.name, 'middle');
  if (ausgang.adr) s += txt(x + BOXW / 2, yMitte - 36, ausgang.adr, 'middle', true);
  s += `<line x1="${x + BOXW}" y1="${yMitte + 6}" x2="${x + BOXW + 16}" y2="${yMitte + 6}"/>`;
  return s;
}

/**
 * netz: { terme: [[{name, adr, neg}]], ausgang: {name, adr} } → SVG-Text, oder '' wenn nichts zu zeichnen.
 * Ein Term mit mehreren Literalen = &-Glied, ein Literal = direkt an >=1. Nur ein Term → kein >=1.
 */
export function fupSvg(netz) {
  const terme = (netz.terme || []).filter((t) => t.length);
  if (!terme.length) return '';
  const alleNamen = terme.flat();
  const labelW = Math.max(...alleNamen.map((e) => Math.max(textW(e.name), textW(e.adr) * 0.8))) + 12;
  const xBox = labelW + 26;
  const oder = terme.length > 1;
  let y = 44;
  let s = '';
  const ausgaenge = []; // y der Termausgänge
  for (const t of terme) {
    if (t.length === 1 && oder) {
      ausgaenge.push({ y: y + 10, direkt: t[0] });
      y += PITCH + 8;
      continue;
    }
    const h = Math.max(t.length, 2) * PITCH;
    s += `<rect x="${xBox}" y="${y - 8}" width="${BOXW}" height="${h}"/>`;
    s += txt(xBox + BOXW / 2, y + 14, '&', 'middle');
    t.forEach((e, k) => { s += eingang(e, labelW, xBox, y + 10 + k * PITCH); });
    ausgaenge.push({ y: y - 8 + h / 2 });
    y += h + 16;
  }
  const hoehe = y;
  let xAus;
  let yAus;
  if (oder) {
    const m = ausgaenge.length;
    const xOr = xBox + BOXW + 28 + 6 * m;
    const hOr = Math.max(ausgaenge.length * 22 + 20, 70);
    const yOr = Math.max(30, hoehe / 2 - hOr / 2);
    s += `<rect x="${xOr}" y="${yOr}" width="${BOXW}" height="${hOr}"/>`;
    s += txt(xOr + BOXW / 2, yOr + hOr / 2 + 5, '>=1', 'middle');
    ausgaenge.forEach((a, k) => {
      const yIn = yOr + 18 + k * ((hOr - 36) / Math.max(1, ausgaenge.length - 1));
      // nach unten laufende Leitungen: obere knicken weiter rechts, nach oben laufende: untere weiter rechts → keine Kreuzung
      const xKnick = xBox + BOXW + 12 + 6 * (yIn >= a.y ? m - 1 - k : k);
      if (a.direkt) {
        s += eingang({ ...a.direkt, neg: false }, labelW, xKnick, a.y);
        s += `<polyline points="${xKnick},${a.y} ${xKnick},${yIn} ${a.direkt.neg ? xOr - 2 * R : xOr},${yIn}"/>`;
        if (a.direkt.neg) s += `<circle cx="${xOr - R}" cy="${yIn}" r="${R}"/>`;
      } else {
        s += `<polyline points="${xBox + BOXW},${a.y} ${xKnick},${a.y} ${xKnick},${yIn} ${xOr},${yIn}"/>`;
      }
    });
    yAus = yOr + hOr / 2;
    xAus = xOr + BOXW + abstand(netz.ausgang);
    s += `<line x1="${xOr + BOXW}" y1="${yAus}" x2="${xAus}" y2="${yAus}"/>`;
  } else {
    yAus = ausgaenge[0].y;
    xAus = xBox + BOXW + abstand(netz.ausgang);
    s += `<line x1="${xBox + BOXW}" y1="${yAus}" x2="${xAus}" y2="${yAus}"/>`;
  }
  s += zuweisung(xAus, yAus - 6, netz.ausgang);
  const breite = xAus + BOXW + 24 + Math.max(0, textW(netz.ausgang.name) / 2 - BOXW / 2);
  return rahmen(s, breite, Math.max(hoehe, yAus + 40));
}

/** SR-Glied wie K2-Lösung: { s:{name,adr,neg}, r:{name,adr,neg}, merker:{name,adr}, leuchte:{name,adr}|null } */
export function srSvg({ s: S, r: Rr, merker, leuchte }) {
  const labelW = Math.max(textW(S.name), textW(Rr.name)) + 12;
  const x = labelW + 26;
  const y = 70;
  let s = `<rect x="${x}" y="${y}" width="${BOXW + 16}" height="${2 * PITCH + 24}"/>`;
  s += txt(x + (BOXW + 16) / 2, y + 16, 'SR', 'middle');
  s += txt(x + (BOXW + 16) / 2, y - 10, merker.name, 'middle');
  if (merker.adr) s += txt(x + (BOXW + 16) / 2, y - 26, merker.adr, 'middle', true);
  const yS = y + 36, yR = y + 36 + PITCH;
  s += eingang(S, labelW, x, yS) + txt(x + 6, yS + 5, 'S', 'start');
  s += eingang(Rr, labelW, x, yR) + txt(x + 6, yR + 5, 'R1', 'start');
  s += txt(x + BOXW + 10, yR + 5, 'Q', 'end');
  const xQ = x + BOXW + 16;
  let breite = xQ + 30;
  if (leuchte) {
    const a = abstand(leuchte);
    s += `<line x1="${xQ}" y1="${yR}" x2="${xQ + a}" y2="${yR}"/>`;
    s += zuweisung(xQ + a, yR - 6, leuchte);
    breite = xQ + a + BOXW + 24 + Math.max(0, textW(leuchte.name) / 2 - BOXW / 2);
  } else s += `<line x1="${xQ}" y1="${yR}" x2="${xQ + 24}" y2="${yR}"/>`;
  return rahmen(s, breite, y + 2 * PITCH + 40);
}
