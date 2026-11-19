// Vorlesung 05: stationäre Genauigkeit, Stabilitätskriterien, Gütefunktionen – Format: tools/inhalte-format.md
// Foliennummer = PDF-Seite (geprüft). Skizzen aus kleinen Hilfsfunktionen (nur currentColor, kein Skript, kein Link).

// ---------- Hilfsfunktionen für Skizzen ----------
const n1 = (x) => (Math.round(x * 10) / 10).toString();
const txt = (x, y, s, anker = 'start', gr = 12) =>
  `<text x="${x}" y="${y}" font-family="sans-serif" font-size="${gr}" text-anchor="${anker}" fill="currentColor">${s}</text>`;
const lin = (x1, y1, x2, y2, extra = '') =>
  `<line x1="${n1(x1)}" y1="${n1(y1)}" x2="${n1(x2)}" y2="${n1(y2)}" stroke="currentColor" stroke-width="1.5" ${extra}/>`;
const gestr = (x1, y1, x2, y2) => lin(x1, y1, x2, y2, 'stroke-dasharray="4 3" stroke-width="1"');
const pfeil = (x1, y1, x2, y2) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - 7 * Math.cos(a), by = y2 - 7 * Math.sin(a);
  const px = -Math.sin(a) * 3, py = Math.cos(a) * 3;
  return lin(x1, y1, bx, by) +
    `<polygon points="${n1(x2)},${n1(y2)} ${n1(bx + px)},${n1(by + py)} ${n1(bx - px)},${n1(by - py)}" fill="currentColor"/>`;
};
const kasten = (x, y, b, h, s, gr = 14) =>
  `<rect x="${x}" y="${y}" width="${b}" height="${h}" fill="none" stroke="currentColor" stroke-width="1.5"/>` +
  txt(x + b / 2, y + h / 2 + 4, s, 'middle', gr);
const kreis = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
const punkt = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="2.5" fill="currentColor"/>`;
const kurve = (pts, extra = '') => `<polyline points="${pts.map(([x, y]) => `${n1(x)},${n1(y)}`).join(' ')}" fill="none" stroke="currentColor" stroke-width="2" ${extra}/>`;
const kopf = (b, h) => `<svg viewBox="0 0 ${b} ${h}" xmlns="http://www.w3.org/2000/svg">`;
const kreuz = (x, y) => lin(x - 5, y - 5, x + 5, y + 5) + lin(x - 5, y + 5, x + 5, y - 5);

// ---------- Rückgekoppelter Integrator: Blockschaltbild ----------
const svgRI = kopf(330, 120) +
  txt(4, 44, 'x_e') + pfeil(24, 40, 61, 40) + kreis(70, 40) + txt(56, 32, '+', 'start', 11) + txt(78, 66, '+', 'start', 11) +
  pfeil(79, 40, 120, 40) + kasten(120, 22, 60, 36, '∫  K_I=1', 11) + lin(180, 40, 290, 40) + punkt(240, 40) + pfeil(280, 40, 292, 40) + txt(296, 44, 'x_a') +
  lin(240, 40, 240, 100) + pfeil(240, 100, 205, 100) + kasten(145, 85, 60, 30, 'K_P = K', 12) + lin(145, 100, 70, 100) + pfeil(70, 100, 70, 49) + '</svg>';

// ---------- Rückgekoppelter Integrator: drei Sprungantworten ----------
const OX = 35, OY = 115;
const svgRIh = `<svg viewBox="0 0 290 140" xmlns="http://www.w3.org/2000/svg">` +
  pfeil(OX, OY, 240, OY) + pfeil(OX, OY, OX, 8) + txt(238, OY + 14, 't') + txt(OX + 6, 14, 'h(t)') +
  kurve(Array.from({ length: 50 }, (_, i) => { const t = i * 0.12; return [OX + t * 32, OY - 60 * (1 - Math.exp(-t))]; })) +
  txt(120, OY - 14, 'K<0: stabil (Gegenkopplung)', 'start', 11) +
  lin(OX, OY, 200, OY - 95, 'stroke-width="1.5" stroke-dasharray="6 3"') + txt(206, 26, 'K=0: Rampe', 'start', 11) +
  kurve(Array.from({ length: 24 }, (_, i) => { const t = i * 0.1; return [OX + t * 32, OY - 30 * (Math.exp(t) - 1)]; }), 'stroke-dasharray="2 2"') +
  txt(OX + 60, 24, 'K>0: instabil', 'start', 11) + '</svg>';

// ---------- Wurzelortskurve (Prinzip, 3. Ordnung) ----------
const svgWOK = kopf(300, 190) +
  pfeil(10, 95, 292, 95) + pfeil(200, 185, 200, 8) + txt(290, 88, 'Re', 'end') + txt(206, 16, 'Im') +
  kreuz(140, 95) + kreuz(95, 55) + kreuz(95, 135) +
  kurve([[140, 95], [60, 95]]) +
  kurve([[95, 55], [120, 55], [165, 38], [235, 8]]) + kurve([[95, 135], [120, 135], [165, 152], [235, 182]]) +
  txt(100, 112, '× Pole bei K = 0', 'start', 10) + txt(214, 52, 'K wächst →', 'start', 10) + txt(60, 112, '←', 'start', 12) +
  txt(6, 160, 'Wurzeln wandern mit K;', 'start', 11) + txt(6, 174, 'rechts der Im-Achse: instabil', 'start', 11) + '</svg>';

// ---------- Nyquist: Ortskurve G0(jω) = K/(1+jω)³ ----------
const ortsK = (K) => {
  const p = [];
  for (let i = 0; i <= 80; i++) {
    const w = Math.pow(10, -1.5 + 3 * i / 80);
    const d = [1, 0];
    for (let k = 0; k < 3; k++) { const re = d[0] - 0 * d[1], im = d[1] + 0; const nr = d[0] * 1 - d[1] * w, ni = d[0] * w + d[1] * 1; d[0] = nr; d[1] = ni; }
    const q = d[0] * d[0] + d[1] * d[1];
    p.push([K * d[0] / q, -K * d[1] / q]);   // Im
  }
  return p;
};
const UN = 16, NX = 50, NY = 30;
const nPunkte = (K) => ortsK(K).map(([re, imG]) => [NX + re * UN, NY - imG * UN]);   // imG<0 → nach unten
const svgNyquist = kopf(400, 170) +
  pfeil(10, NY, 235, NY) + lin(NX, 5, NX, 160, 'stroke-width="1"') + txt(233, NY - 6, 'Re', 'end', 11) + txt(NX + 4, 12, 'Im', 'start', 11) +
  kurve(nPunkte(5)) + kurve(nPunkte(11), 'stroke-dasharray="5 3"') +
  `<circle cx="${NX - UN}" cy="${NY}" r="3.5" fill="currentColor"/>` + txt(NX - UN, NY + 16, '−1', 'middle', 12) +
  txt(NX + 5 * UN + 4, NY + 12, 'K=5', 'start', 11) + txt(NX + 11 * UN - 14, NY + 12, 'K=11', 'start', 11) +
  txt(245, 70, 'durchgezogen (K=5):', 'start', 11) + txt(245, 84, '−1 links der Kurve', 'start', 11) + txt(245, 98, '→ stabil', 'start', 11) +
  txt(245, 124, 'gestrichelt (K=11):', 'start', 11) + txt(245, 138, '−1 nicht links der Kurve', 'start', 11) + txt(245, 152, '→ instabil', 'start', 11) + '</svg>';

// ---------- Bode: Phasenreserve und Amplitudenreserve (Beispiel G0 = 4/(1+s)³) ----------
const bx = (w) => 40 + (Math.log10(w) + 1) * 105;
const bM = (w) => 40 - 1.5 * 20 * Math.log10(4 / Math.pow(1 + w * w, 1.5));
const bP = (w) => 135 - 0.5 * (-3 * Math.atan(w) * 180 / Math.PI);
const logPts = (f) => Array.from({ length: 60 }, (_, i) => { const w = Math.pow(10, -1 + 2 * i / 59); return [bx(w), f(w)]; });
const wD = Math.sqrt(Math.pow(4, 2 / 3) - 1), wPi = Math.sqrt(3);
const svgBode = kopf(300, 290) +
  pfeil(40, 40, 285, 40) + lin(40, 8, 40, 122) + txt(283, 34, 'ω', 'end', 11) + txt(46, 18, '|G₀| in dB', 'start', 11) + txt(34, 44, '0', 'end', 10) +
  kurve(logPts((w) => bM(w))) +
  pfeil(40, 135, 285, 135) + lin(40, 128, 40, 280) + txt(283, 129, 'ω', 'end', 11) + txt(46, 142, 'φ₀', 'start', 11) + txt(34, 139, '0', 'end', 10) +
  gestr(40, 225, 285, 225) + txt(36, 229, '−180°', 'end', 10) +
  kurve(logPts((w) => bP(w))) +
  gestr(bx(wD), 40, bx(wD), 262) + txt(bx(wD), 278, 'ω_D', 'middle', 11) +
  gestr(bx(wPi), 40, bx(wPi), 262) + txt(bx(wPi) + 4, 278, 'ω_π', 'start', 11) +
  pfeil(bx(wD) - 6, bP(wD), bx(wD) - 6, 225) + txt(bx(wD) - 10, 222 - 10, 'φ_R', 'end', 11) +
  pfeil(bx(wPi) + 6, 40, bx(wPi) + 6, bM(wPi)) + txt(bx(wPi) + 10, 62, 'A_R', 'start', 11) + '</svg>';

export const ANTWORTEN = [
  // ================= Nachtrag Regelfehler =================
  {
    id: 'v05-regelfehler-nachtrag',
    bereich: 'vorlesung',
    vorlesung: 'V05',
    titel: 'Nachtrag: Regelfehler E(s), Störung am Eingang bzw. Ausgang der Strecke',
    quellen: 'V05 Folie 2–8 · V04 Folie 47–53',
    stichworte: 'regelfehler E(s) störgröße eingang ausgang strecke G1 G2 offener kreis G_O führungsübertragungsfunktion störübertragungsfunktion dynamischer regelfaktor einkopplung',
    frage: 'Wie ändern sich G₁ und G₂, wenn die Störgröße am Eingang bzw. am Ausgang der Strecke G(s) angreift? Geben Sie Regelgröße X(s) und Regelfehler E(s) an.',
    antwort: [
      { t: 'p', text: 'Allgemeiner Kreis (G_M = 1): Regler R(s), Strecke G₁(s)·G₂(s), Störung Z(s) zwischen G₁ und G₂.' },
      { t: 'tabelle', kopf: ['Störung greift an …', 'G₁(s)', 'G₂(s)'], zeilen: [
        ['am Eingang der Strecke G(s)', '1', 'G(s)'],
        ['am Ausgang der Strecke G(s)', 'G(s)', '1'],
      ] },
      { t: 'formel', text: 'Offener Kreis:  G_O(s) = R(s)·G₁(s)·G₂(s)' },
      { t: 'formel', text: 'X(s) = G₀/(1 + G₀)·W(s) + G₂/(1 + G₀)·Z(s)' },
      { t: 'formel', text: 'G_W(s) = G₀(s)/(1 + G₀(s))        G_Z(s) = G₂(s)/(1 + G₀(s))' },
      { t: 'formel', text: 'E(s) = W − X = 1/(1 + G₀)·W − G₂/(1 + G₀)·Z      S(s) = 1/(1 + G₀(s)):  E = S·(W − G₂·Z)' },
      { t: 'p', text: 'Der Regelfehler hängt ab von: G₀(s) = R·G₁·G₂ (Regler und Strecke), Führungsgröße W(s), Störgröße Z(s). Stationär mit dem Endwertsatz: lim e(t) = lim s·E(s) für s → 0.' },
      { t: 'link', ziel: 'a/standardregelkreis', text: 'Standardregelkreis' },
      { t: 'link', ziel: 'a/stationaere-genauigkeit', text: 'Stationäre Genauigkeit' },
      { t: 'link', ziel: 'a/v04-regelkreis-stoerung', text: 'Herleitung Regelkreis mit Störeinkopplung (V04)' },
    ],
  },

  // ================= BIBO =================
  {
    id: 'v05-bibo',
    bereich: 'vorlesung',
    vorlesung: 'V05',
    titel: 'BIBO-Stabilität (Bounded Input, Bounded Output)',
    quellen: 'V05 Folie 10 · V04 Folie 4',
    stichworte: 'BIBO bounded input bounded output stabilität begrenztes eingangssignal begrenztes ausgangssignal integrator unbegrenzt p-glied sprung',
    frage: 'Was bedeutet Stabilität (BIBO)? Prüfen Sie Integrator und P-Glied mit dem Einheitssprung.',
    antwort: [
      { t: 'p', text: 'Stabilität bedeutet: begrenztes Eingangssignal → begrenztes Ausgangssignal. BIBO-Stabilität = Bounded Input, Bounded Output.' },
      { t: 'p', text: 'Test mit dem Sprung x_e(t) = σ(t) (ein begrenztes Signal) und Blick auf die Sprungantwort:' },
      { t: 'liste', items: [
        'Integrator: Sprungantwort wächst unbegrenzt (Rampe) → nicht stabil.',
        'P-Glied: Sprungantwort begrenzt (Sprung der Höhe K) → stabil.',
      ] },
      { t: 'link', ziel: 'a/stabilitaet-bedingung', text: 'Stabilitätsbedingung: alle Pole mit negativem Realteil' },
    ],
  },

  // ================= Rückgekoppelter Integrator =================
  {
    id: 'v05-rueckgekoppelter-integrator',
    bereich: 'vorlesung',
    vorlesung: 'V05',
    titel: 'Stabilitätsproblem: rückgekoppelter Integrator (Mitkopplung / Gegenkopplung)',
    quellen: 'V05 Folie 11–14',
    stichworte: 'stabilitätsproblem rückgekoppelter integrator mitkopplung gegenkopplung K_I K_P fall 1 fall 2 fall 3 grenzfall instabil sprungantwort K kleiner null',
    frage: 'Ein Integrator (K_I = 1) wird mit einem P-Glied K_P = K rückgekoppelt. Berechnen Sie G(s) und die Sprungantwort und unterscheiden Sie K < 0, K = 0, K > 0.',
    antwort: [
      { t: 'svg', svg: svgRI, unterschrift: 'Integrator (K_I = 1) mit Rückführung K_P = K (Vorzeichen der Rückkopplung steckt in K).' },
      { t: 'formel', text: 'G(s) = (1/s) / (1 − K·1/s) = 1/(s − K)' },
      { t: 'formel', text: 'Sprungantwort:  H(s) = G(s)·1/s = 1 / ( s·(s − K) )' },
      { t: 'zwischen', text: 'Fallunterscheidung' },
      { t: 'tabelle', kopf: ['Fall', 'K', 'Struktur', 'H(s)', 'h(t)', 'Ergebnis'], zeilen: [
        ['1', 'K < 0', 'Gegenkopplung', '1/(s·(s + |K|))', '(1/|K|)·(1 − e^(−|K|·t))', 'stabil'],
        ['2', 'K = 0', 'Grenzfall', '1/s²', 't', 'nicht begrenzt (Rampe)'],
        ['3', 'K > 0', 'Mitkopplung', '1/(s·(s − K))', '(1/K)·(e^(K·t) − 1)', 'instabil'],
      ] },
      { t: 'p', text: 'Korrespondenz: 1/(s·(s + a)) ↔ (1/a)·(1 − e^(−a·t)).' },
      { t: 'svg', svg: svgRIh, unterschrift: 'Sprungantworten: K < 0 läuft gegen einen Endwert, K = 0 Rampe, K > 0 wächst exponentiell.' },
      { t: 'hinweis', text: 'Auf Folie 13 steht für Fall 1 „s + K“ und e^(−K·t), also mit K als Betrag (K > 0). Fall 3 ist dort h(t) = −(1/K)·(1 − e^(+K·t)), gleichwertig mit (1/K)·(e^(Kt) − 1). In der Abschrift „K < 0“ ⇒ Pol bei s = K links.' },
      { t: 'p', text: 'Pol von G(s) bei s = K: K < 0 links (stabil), K = 0 auf der imaginären Achse, K > 0 rechts (instabil).' },
      { t: 'link', ziel: 'a/gegenkopplung-herleitung', text: 'Gegenkopplung/Rückkopplung herleiten' },
    ],
  },

  // ================= Stabilität über Pole (Herleitung) =================
  {
    id: 'v05-stabilitaet-herleitung',
    bereich: 'vorlesung',
    vorlesung: 'V05',
    titel: 'Stabilität einer rationalen Übertragungsfunktion: Herleitung über Polstellen und PBZ',
    quellen: 'V05 Folie 15–22',
    stichworte: 'stabilität polstellen negativer realteil partialbruchzerlegung PBZ sprungantwort herleitung reelle pole komplexe pole aufklingende abklingende oszillation grenzstabil imaginäre achse euler',
    frage: 'Leiten Sie die Stabilitätsbedingung (alle Pole mit Re{s_i} < 0) aus der Sprungantwort her. Unterscheiden Sie reelle und komplexe Pole.',
    antwort: [
      { t: 'formel', text: 'G(s) = Z(s)/N(s) = (b_m·sᵐ + … + b₀)/(aₙ·sⁿ + … + a₀),  m < n' },
      { t: 'formel', text: 'H(s) = G(s)·1/s = Z(s)/(N(s)·s)' },
      { t: 'p', text: 'Partialbruchzerlegung (PBZ) und Rücktransformation:' },
      { t: 'formel', text: 'H(s) = P₀/s + P₁/(s − s₁) + … + Pₙ/(s − sₙ)   ↔   h(t) = P₀ + P₁·e^(s₁t) + … + Pₙ·e^(sₙt)' },
      { t: 'p', text: 'Stabil, wenn Re{s_i} < 0 für alle s_i (Merksatz der Folie 17: Damit ein System stabil ist, müssen alle Polstellen der Übertragungsfunktion einen negativen Realteil besitzen).' },
      { t: 'zwischen', text: 'Teilsprungantwort h_i(t) = P_i·e^(s_i·t)' },
      { t: 'tabelle', kopf: ['Pol s_i', 'h_i(t)', 'Ergebnis'], zeilen: [
        ['reell, s_i = +a > 0', 'P_i·e^(+a·t)', 'instabil'],
        ['reell, s_i = −a < 0', 'P_i·e^(−a·t)', 'stabil'],
        ['s_i = 0', 'P_i·e⁰ = P_i', 'abhängig von P_i (konstant)'],
        ['komplex, Re{s_i} = +δ > 0', '2P_i·e^(δt)·cos(ωt)', 'aufklingende Oszillation: instabil'],
        ['komplex, Re{s_i} = −δ < 0', '2P_i·e^(−δt)·cos(ωt)', 'abklingende Oszillation: stabil'],
        ['komplex, Re{s_i} = 0 (s = ±jω)', '2|P_i|·cos(ωt)', 'Dauerschwingung: grenzstabil'],
      ] },
      { t: 'zwischen', text: 'Komplexe Pole s_i₁,₂ = ±δ ± jω (Folie 19–22)' },
      { t: 'formel', text: 'e^(jωt) = cos ωt + j·sin ωt     e^(−jωt) = cos ωt − j·sin ωt' },
      { t: 'formel', text: 'cos ωt = ½·(e^(jωt) + e^(−jωt))     sin ωt = (1/2j)·(e^(jωt) − e^(−jωt))' },
      { t: 'formel', text: 'h_i = P_i·e^((δ+jω)t) + P_i·e^((δ−jω)t) = P_i·e^(δt)·(e^(jωt) + e^(−jωt)) = 2P_i·e^(δt)·cos ωt' },
      { t: 'hinweis', text: 'Die Folie rechnet mit gleichem P_i für beide Pole (vereinfacht). Allgemein sind die Residuen konjugiert komplex und es entsteht 2|P_i|·e^(δt)·cos(ωt + φ). Das Ergebnis (e^(δt) steuert Auf- bzw. Abklingen) ist dasselbe.' },
      { t: 'p', text: 'Pole auf der imaginären Achse (Re = 0): Grenzfall, Dauerschwingung, „grenzstabil“.' },
      { t: 'link', ziel: 'a/stabilitaet-bedingung', text: 'Stabilitätsbedingung (Musterantwort)' },
      { t: 'link', ziel: 'a/warum-pbz', text: 'Warum PBZ?' },
      { t: 'link', ziel: 'pbz', text: 'PBZ-Rechner' },
      { t: 'link', ziel: 'a/hurwitz-kriterium', text: 'Hurwitz-Kriterium' },
    ],
  },

  // ================= Grenzstabilität =================
  {
    id: 'v05-grenzstabilitaet',
    bereich: 'vorlesung',
    vorlesung: 'V05',
    titel: 'Grenzstabilität: Beispiel G(s) = 1/(s² + 25), Dauerschwingung, kein Endwert',
    quellen: 'V05 Folie 23–24',
    stichworte: 'grenzstabilität grenzstabil dauerschwingung imaginäre achse pole ±j5 kein stationärer endwert endwertsatz existiert nicht ungedämpft',
    frage: 'Bestimmen Sie Pole und Sprungantwort von G(s) = 1/(s² + 25). Ist das System stabil? Existiert ein Endwert?',
    antwort: [
      { t: 'formel', text: 'G(s) = 1/(s² + 25) = 1/((s − j5)(s + j5))        Pole s₁,₂ = ±j5' },
      { t: 'p', text: 'Pole auf der imaginären Achse ⇒ grenzstabil.' },
      { t: 'zwischen', text: 'Sprungantwort (nachgerechnet)' },
      { t: 'formel', text: 'H(s) = 1/(s·(s² + 25)) = (1/25)·( 1/s − s/(s² + 25) )   ↔   h(t) = (1 − cos 5t)/25' },
      { t: 'p', text: 'h(t) schwingt dauerhaft zwischen 0 und 0,08 (Kurve der Folie 24). Periode T = 2π/5 ≈ 1,26 s.' },
      { t: 'liste', items: [
        'Dauerschwingung (Amplitude klingt nicht ab).',
        'Kein stationärer Endwert für t → ∞.',
        'Endwertsatz der Laplace-Transformation: Grenzwert existiert nicht (er darf hier nicht angewendet werden, da nicht alle Pole links liegen).',
      ] },
      { t: 'link', ziel: 'a/stabilitaet-bedingung', text: 'Stabilitätsbedingung' },
    ],
  },

  // ================= Wurzelortskurve =================
  {
    id: 'v05-wurzelortskurve',
    bereich: 'vorlesung',
    vorlesung: 'V05',
    titel: 'Wurzelortskurve (WOK): Pole des geschlossenen Kreises in Abhängigkeit von K',
    quellen: 'V05 Folie 25–27',
    stichworte: 'wurzelortskurve WOK root locus polstellen wurzeln wandern reglerverstärkung geschlossener regelkreis N(s)+Z(s)=0 stabilitätsnachweisverfahren charakteristische gleichung',
    frage: 'Was ist eine Wurzelortskurve? Wie bestimmt man die Pole des geschlossenen Regelkreises aus dem offenen Kreis?',
    antwort: [
      { t: 'p', text: 'Die Polstellen (Wurzeln) bestimmen die Stabilität. Im geschlossenen Regelkreis (rückgekoppelte Reihenschaltung von Regler und Strecke) verändern sich die Pole in Abhängigkeit der Reglerverstärkung.' },
      { t: 'p', text: 'Trägt man die Wurzeln in Abhängigkeit von der Reglerverstärkung in der komplexen Ebene auf, spricht man von der Wurzelortskurve.' },
      { t: 'zwischen', text: 'Pole des geschlossenen Kreises (Folie 27)' },
      { t: 'formel', text: 'G_W(s) = G₀/(1 + G₀) mit G₀ = Z(s)/N(s):   G_W = Z/(N + Z)' },
      { t: 'formel', text: 'Pole:  N(s) + Z(s) = 0     (⇔ 1 + G₀(s) = 0)' },
      { t: 'p', text: 'Beispiel der Folie 26: System 3. Ordnung mit P-Regler. Eine reelle Polstelle und ein konjugiert komplexes Polpaar, die mit der Verstärkung „wandern“: das komplexe Paar läuft in die rechte Halbebene (instabil), die reelle Polstelle nach links.' },
      { t: 'svg', svg: svgWOK, unterschrift: 'WOK-Prinzip (3. Ordnung): Start in den Polen des offenen Kreises (×), Äste wandern mit wachsendem K.' },
      { t: 'zwischen', text: 'Mini-Beispiel (eigene Rechnung)' },
      { t: 'p', text: 'G₀(s) = K/(s·(s + 1)):  N + Z = s² + s + K = 0  ⇒  s₁,₂ = −½ ± √(¼ − K).' },
      { t: 'p', text: 'K = 0: Pole bei 0 und −1. K = ¼: doppelter Pol bei −½. K > ¼: komplexes Paar mit Realteil −½ (immer stabil).' },
      { t: 'link', ziel: 'polynom', text: 'Polynom-Rechner (Pole von N + Z)' },
      { t: 'link', ziel: 'a/pol-nullstellen-diagramm', text: 'Pol-Nullstellen-Diagramm' },
    ],
  },

  // ================= Nyquist =================
  {
    id: 'v05-nyquist',
    bereich: 'vorlesung',
    vorlesung: 'V05',
    titel: 'Stabilitätskriterium von Nyquist (grafisch, Ortskurve des offenen Kreises, Punkt −1)',
    quellen: 'V05 Folie 28–29',
    stichworte: 'nyquist kriterium ortskurve offener kreis punkt −1 links der kurve 1+G0=0 G0=−1 frequenzkennlinienverfahren stabilität geschlossener kreis vereinfachtes nyquist kritische verstärkung',
    frage: 'Erläutern Sie das Nyquist-Kriterium. Welche Rolle spielt der Punkt −1? Skizzieren Sie die Ortskurve eines stabilen und eines instabilen Regelkreises.',
    antwort: [
      { t: 'p', text: 'Nyquist ist ein grafisches Kriterium anhand der Ortskurve des offenen Kreises G₀(jω). Aus ihr können dynamisches Verhalten und Stabilität des geschlossenen Kreises „vorhergesagt“ werden.' },
      { t: 'formel', text: '1 + G₀(s) = 0   ⇔   G₀(s) = −1' },
      { t: 'p', text: 'Der Punkt −1 ist der kritische Punkt: Dort wird der Nenner von G_W = G₀/(1 + G₀) null, also liegt ein Pol des geschlossenen Kreises auf der imaginären Achse.' },
      { t: 'p', text: 'Regel (Folie 28): Der Punkt −1 muss für Stabilität immer links der Kurve liegen, wenn man die Ortskurve in Richtung wachsender Frequenz ω durchläuft.' },
      { t: 'svg', svg: svgNyquist, unterschrift: 'Ortskurve des offenen Kreises G₀ = K/(1+s)³ für ω = 0 … ∞ (Beispiel; kritisch bei K = 8, K=5 stabil, K=11 instabil).' },
      { t: 'zwischen', text: 'Beispiel der Folie 29: P-Regler und P-T₃-Strecke, K = 1, 2, 4' },
      { t: 'p', text: 'Die Ortskurve wird mit K größer und der Punkt (−1, 0) rückt näher. Sprungantworten: K = 1: gut gedämpft, K = 2 und K = 4: zunehmend schwingend, aber noch stabil. Endwerte 0,5 / 0,67 / 0,8 = K/(1 + K).' },
      { t: 'hinweis', text: 'Die Folie zeigt nur die einfache Form (Kurve links vom Punkt −1 liegen lassen). Sie gilt für offene Kreise, die selbst stabil sind (alle Pole links, ggf. Integrator). Das vollständige Nyquist-Kriterium zählt die Umläufe um −1; das kam in der Vorlesung nicht vor.' },
      { t: 'p', text: 'Zur Beispiel-Skizze: Hurwitz von s³ + 3s² + 3s + 1 + K liefert K < 8; die Ortskurve schneidet die negative reelle Achse bei −K/8 (ω = √3), also bei −1 genau für K = 8.' },
      { t: 'link', ziel: 'hurwitz', text: 'Hurwitz-Rechner (K_krit der Beispielstrecke)' },
      { t: 'link', ziel: 'a/hurwitz-kriterium', text: 'Hurwitz-Kriterium (algebraisches Kriterium)' },
    ],
  },

  // ================= Bode-Verfahren =================
  {
    id: 'v05-bode-verfahren',
    bereich: 'vorlesung',
    vorlesung: 'V05',
    titel: 'Bode-Verfahren: Phasenreserve φ_R, Amplitudenreserve A_R, Durchtrittsfrequenz ω_D',
    quellen: 'V05 Folie 30–33',
    stichworte: 'bode verfahren phasenreserve amplitudenreserve durchtrittsfrequenz omega_D phi_R A_R dB 20 log schwache dämpfung starke dämpfung frequenzkennlinienverfahren überschwingweite reglereinstellung',
    frage: 'Definieren Sie Durchtrittsfrequenz, Phasen- und Amplitudenreserve, zeichnen Sie sie im Bode-Diagramm ein und geben Sie Richtwerte für die Reglereinstellung an.',
    antwort: [
      { t: 'p', text: 'Frequenzkennlinienverfahren: Aus dem Frequenzgang des offenen Kreises G₀ ergeben sich Stabilität (Nyquist), stationäre Genauigkeit (I-Anteile des offenen Kreises), Überschwingweite (Abschätzung durch Bode-Verfahren) und Schnelligkeit (Bode-Parameter).' },
      { t: 'liste', items: [
        'φ_R = Phasenreserve',
        'A_R = Amplitudenreserve',
        'ω_D = Durchtrittsfrequenz',
      ] },
      { t: 'formel', text: 'Durchtrittsfrequenz ω_D:   |G(jω_D)| = 1   oder   |G(jω_D)|_dB = 0 dB' },
      { t: 'p', text: 'Standarddefinitionen (so auch in der Skizze): φ_R = Abstand der Phase bei ω_D zur −180°-Linie (φ_R = 180° + φ₀(ω_D)); A_R = Abstand des Betrags unter 0 dB bei der Frequenz, bei der die Phase −180° erreicht (ω_π).' },
      { t: 'svg', svg: svgBode, unterschrift: 'Bode-Diagramm des offenen Kreises (Beispiel G₀ = 4/(1+s)³: ω_D ≈ 1,2, φ_R ≈ 27°, A_R = 2 ≙ 6 dB).' },
      { t: 'p', text: 'In der Nyquist-Ortskurve: φ_R ist der Winkel zwischen negativer reeller Achse und dem Punkt, wo die Kurve den Einheitskreis schneidet. Die Kurve schneidet die negative reelle Achse bei −1/A_R (Folie 32).' },
      { t: 'formel', text: 'A_R|dB = 20·log(A_R)' },
      { t: 'tabelle', kopf: ['', 'Schwache Dämpfung (schnell)', 'Starke Dämpfung (langsam)'], zeilen: [
        ['Phasenreserve φ_R', '30°', 'bis 60°'],
        ['Amplitudenreserve A_R', '2,5', 'bis 10'],
        ['Amplitudenreserve A_R|dB', '8 dB', 'bis 20 dB'],
      ] },
      { t: 'p', text: 'Das Bode-Verfahren dient der Reglereinstellung: Kleinere Reserven → schneller, aber stärker schwingend.' },
      { t: 'link', ziel: 'a/guetefunktionen', text: 'Gütefunktionen und Kennwerte' },
    ],
  },

  // ================= Gütekriterien =================
  {
    id: 'v05-integralkriterien',
    bereich: 'vorlesung',
    vorlesung: 'V05',
    titel: 'Gütekriterien (Integralkriterien): Regelfläche, ITAE, quadratische Regelfläche mit Stellaufwand',
    quellen: 'V05 Folie 34–37',
    stichworte: 'gütefunktionen gütekriterien integralkriterien betragslineare regelfläche quadratische regelfläche ITAE zeitbewertet stellaufwand K_y optimierungsproblem J minimieren führungsverhalten störverhalten',
    frage: 'Nennen Sie die vier Integralkriterien mit Formel. Was ist das Ziel des Reglers, und was bedeutet ITAE?',
    antwort: [
      { t: 'p', text: 'Ziele des Reglers: Störungen Z(s) schnell ausregeln (Störverhalten G_Z = G₂/(1+G₀)), einer Führungsgröße W(s) schnell folgen (Führungsverhalten G_W = G₀/(1+G₀)), dazu stationäre Genauigkeit (Endwertsatz).' },
      { t: 'p', text: 'Gütefunktion J festlegen, dann J → min. Der Regelfehler soll minimal werden, der Stellgrößenaufwand kann mit berücksichtigt werden (Minimierung der Regelfläche). Teilweise mehrdimensionales Optimierungsproblem, wenn nach mehreren Parametern optimiert wird.' },
      { t: 'tabelle', kopf: ['Kriterium', 'J ='], zeilen: [
        ['Betragslineare Regelfläche', '∫₀^∞ |e(t)| dt'],
        ['Quadratische Regelfläche', '∫₀^∞ e²(t) dt'],
        ['Zeitbewertete betragslineare Regelfläche (ITAE)', '∫₀^∞ t·|e(t)| dt'],
        ['Quadratische Regelfläche mit Bewertung des Stellaufwands', '∫₀^∞ ( e²(t) + K_y·y²(t) ) dt'],
      ] },
      { t: 'p', text: 'ITAE = integral of time multiplied absolute value of error. Die Zeitbewertung (Faktor t) bestraft Fehler, die spät noch vorhanden sind. Der Term K_y·y² bewertet den Stellaufwand quadratisch.' },
      { t: 'link', ziel: 'a/guetefunktionen', text: 'Gütefunktionen (Musterantwort)' },
      { t: 'link', ziel: 'a/kennwerte-sprungantwort', text: 'Kennwerte der Sprungantwort' },
    ],
  },
];
