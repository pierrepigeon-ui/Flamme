/* PRISME — timeline du jeu : jalons, durées, flow, α β γ, demi-vie.
   Module partagé par l'encyclopédie et l'outil d'évaluation. Méthode arrêtée le 08/10/2026 (jeu d'essai : Heat). */
const TIMELINE_VERSION = { numero:"1.0", date:"2026-10-08 17:56" };   // à incrémenter à chaque livraison

const JALONS = [
  { n:0, nom:"identifié", quoi:"Le jeu est connu de loin : critique, vitrine, recommandation." },
  { n:1, nom:"ouvert", quoi:"La boîte est ouverte : on découvre le matériel et les règles." },
  { n:2, nom:"jouable", quoi:"La mise en place est faite, les règles sont lues : on peut lancer la partie." },
  { n:3, nom:"compris", quoi:"Une première partie a eu lieu, même hésitante." },
  { n:4, nom:"maîtrisé", quoi:"Les règles sont intégrées, la partie est fluide." },
  { n:5, nom:"exploré", quoi:"Les stratégies principales sont connues et utilisées." },
  { n:6, nom:"révélé", quoi:"Tout le contenu a été vu : modules, cartes, scénarios." },
  { n:7, nom:"archivé", quoi:"Le jeu entre en routine : classique régulier ou souvenir qui s'efface." }
];
const SOUSPHASES = [
  { nom:"Préparation", de:0, phase:"I", quoi:"La promesse du jeu : on se projette, on l'achète, on l'emprunte.", duree:"VAL1 / 4" },
  { nom:"Accès", de:1, phase:"I", quoi:"La porte d'entrée pratique : boîte, matériel, organisation des règles.", duree:"POID1 / 5 + MAN1 / 10" },
  { nom:"Premiers pas", de:2, phase:"II", quoi:"La première mise en mouvement, avec des allers-retours au livret.", duree:"1 + (5 − TRAN2) / 10" },
  { nom:"Expérimentations", de:3, phase:"II", quoi:"On rejoue, on apprend en jouant : le jeu devient intelligible.", duree:"2^(moy(POID1, EXIG1, VAR1, 5 − TRAN2, 5 − ART2b) − 1)" },
  { nom:"Rôdage", de:4, phase:"III", quoi:"La pratique standard : on ne lutte plus contre les règles.", duree:"2^(moy(PROF, EXIG1, POID1) − 1)" },
  { nom:"Aguerrissement", de:5, phase:"III", quoi:"La mise à l'épreuve : plans avancés, contre-stratégies, finesses.", duree:"2^(moy(PROF, EXIG, VAR1) + 0,1 − 1) ; le 0,1 est un bonus de confrontation. Plancher : parties pour tout exploiter" },
  { nom:"Habitude", de:6, phase:"IV", quoi:"Le jeu est pleinement connu et tourne à vitesse de croisière.", duree:"2^(moy(VAR, SCAL, MAN2) − 1)" },
  { nom:"Souvenir", de:7, phase:"IV", quoi:"La vie longue : pilier du répertoire ou oubli progressif.", duree:"sans fin : la courbe se prolonge en pointillés" }
];
const PHASES = { I:"Entrée", II:"Apprentissage", III:"Maîtrise et profondeur", IV:"Maturité" };
const R_REGIME = [0, .45, .6, .8, 1, 1, 1, 1];   // montée en régime, jalons 0 à 7
const TERMES = {
  1:{ s:"MAT, ART2a, THEM1", f:"POID1, M, 5 − ART2b" },
  2:{ s:"THEM, MAT, ART2a", f:"POID1, 5 − TRAN2, M, 5 − ART2b" },
  3:{ s:"THEM, INT2, EXIG, ALEA2", f:"5 − TRAN2, 5 − ART2b, A, M, POID1" },
  4:{ s:"EXIG, PROF, INT2, LIEN2", f:"A, M, 5 − ART2b" },
  5:{ s:"(PROF, EXIG, POID, LIEN2) × plafond d'aléa", f:"A, 5 − ALEA2, 5 − LIEN2, 5 − INT2, 5 − PROF, M" },
  6:{ s:"(PROF, VAR, POID, LIEN2) × plafond d'aléa", f:"les termes du jalon 5, plus 5 − VAR" },
  7:{ s:"(VAR, SCAL, MAN2, LIEN2) × usure", f:"A, M, M2, 5 − SCAL, 5 − VAR" }
};
// notes utilisées : axes (avec chiffre) et notes retenues de paires (sans chiffre)
const TIMELINE_AXES = ["POID1","VAR1","ALEA1","ALEA2","EXIG1","RYT1","RYT2","MAN1","MAN2","THEM1","LIEN2","INT2","ART2a","ART2b","TRAN2","VAL1"];
const TIMELINE_PAIRES = ["POID","PROF","VAR","EXIG","SCAL","MAT","THEM"];
const CLASSES_DEMIVIE = [[10, "éphémère"], [100, "durable"], [1000, "classique"], [Infinity, "inusable"]];

/* n : { code: valeur } ; une valeur absente (paire sans objet) est retirée des moyennes.
   contenu_parties : plancher du jalon 6 (facultatif). */
function flowJeu(n){
  const ok = v => v != null && !Number.isNaN(v);
  const moy = (...a) => { a = a.filter(ok); return a.length ? a.reduce((s, v) => s + v, 0) / a.length : null; };
  const quad = (...a) => { a = a.filter(ok); return a.length ? Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length) : 0; };
  const inv = v => ok(v) ? 5 - v : null, fois = (v, k) => ok(v) ? v * k : null;
  const lassitude = N => 1 + .1 * Math.log2(1 + N);
  const d = [ (n.VAL1 ?? 0) / 4, (n.POID1 ?? 0) / 5 + (n.MAN1 ?? 0) / 10, 1 + (inv(n.TRAN2) ?? 0) / 10,
    2 ** ((moy(n.POID1, n.EXIG1, n.VAR1, inv(n.TRAN2), inv(n.ART2b)) ?? 0) - 1), 2 ** ((moy(n.PROF, n.EXIG1, n.POID1) ?? 0) - 1),
    2 ** ((moy(n.PROF, n.EXIG, n.VAR1) ?? 0) + .1 - 1), 2 ** ((moy(n.VAR, n.SCAL, n.MAN2) ?? 0) - 1) ];
  const N = [0];
  d.forEach((k, i) => { N.push(N[i] + k); if (i === 5 && n.contenu_parties > 0 && N[6] < n.contenu_parties){ d[5] += n.contenu_parties - N[6]; N[6] = n.contenu_parties; } });
  const x = [0]; d.forEach((k, i) => x.push(x[i] + Math.log2(1 + k)));
  const plafond = ok(n.ALEA1) && ok(n.ALEA2) ? 1 - (n.ALEA1 / 5) * ((5 - n.ALEA2) / 5) : 1;
  const usure = .5 + (ok(n.VAR) ? n.VAR : (n.VAR1 ?? 0)) / 10;
  const termes = (j, Nj) => {
    const L = lassitude(Nj), M = fois(n.MAN1, L), M2 = fois(inv(n.MAN2), L), A = fois(moy(inv(n.RYT1), inv(n.RYT2)), L);
    const f5 = [A, inv(n.ALEA2), inv(n.LIEN2), inv(n.INT2), inv(n.PROF), M];
    const S = { 1:[n.MAT, n.ART2a, n.THEM1], 2:[n.THEM, n.MAT, n.ART2a], 3:[n.THEM, n.INT2, n.EXIG, n.ALEA2], 4:[n.EXIG, n.PROF, n.INT2, n.LIEN2],
      5:[n.PROF, n.EXIG, n.POID, n.LIEN2], 6:[n.PROF, n.VAR, n.POID, n.LIEN2], 7:[n.VAR, n.SCAL, n.MAN2, n.LIEN2] }[j];
    const F = { 1:[n.POID1, M, inv(n.ART2b)], 2:[n.POID1, inv(n.TRAN2), M, inv(n.ART2b)], 3:[inv(n.TRAN2), inv(n.ART2b), A, M, n.POID1], 4:[A, M, inv(n.ART2b)],
      5:f5, 6:[...f5, inv(n.VAR)], 7:[A, M, M2, inv(n.SCAL), inv(n.VAR)] }[j];
    const s = (moy(...S) ?? 0) * (j === 5 || j === 6 ? plafond : j === 7 ? usure : 1), f = quad(...F);
    return { s, f, brut: 2 * R_REGIME[j] * (s - f), L };
  };
  const det = [null], y = [0], brut = [0];
  for (let j = 1; j <= 7; j++){ const t = termes(j, N[j]); det.push(t); brut.push(t.brut); y.push(Math.min(10, Math.max(0, t.brut))); }
  const pente = j => (y[j + 1] - y[j]) / (x[j + 1] - x[j]);
  let alpha = 1; for (let j = 2; j <= 7; j++) if (y[j] > y[alpha]) alpha = j;
  let beta = null, gamma = null;
  const purge = brut.findIndex((v, j) => j >= 1 && v < 0);
  if (purge > 0){ beta = purge - 1; gamma = purge; }
  else {
    for (let j = alpha; j < 7; j++) if (pente(j) <= -.5){ beta = j; break; }
    if (beta != null) for (let k = beta + 1; k <= 7; k++) if (k === 7 || y[k] < 1 || pente(k) > -.5){ gamma = k; break; }
  }
  const yLoin = Nk => { const t = termes(7, Nk); return Math.min(10, Math.max(0, 2 * (t.s - t.f))); };
  const xLoin = Nk => x[7] + Math.log2((1 + Nk) / (1 + N[7]));
  const perte = (yLoin(N[7] * 4 + 3) - yLoin(N[7])) / (xLoin(N[7] * 4 + 3) - x[7]);
  const cible = y[alpha] / 2; let demivie = null, xDemi = null;
  for (let j = alpha + 1; j <= 7 && demivie == null; j++) if (y[j] < cible){
    const t = (y[j - 1] - cible) / (y[j - 1] - y[j]), xs = x[j - 1] + t * (x[j] - x[j - 1]);
    demivie = N[j - 1] + 2 ** (xs - x[j - 1]) - 1; xDemi = xs;
  }
  if (demivie == null && y[alpha] > 0 && yLoin(1e7) < cible){ let a = N[7], b = 1e7; for (let i = 0; i < 80; i++){ const m = Math.sqrt(a * b); yLoin(m) > cible ? a = m : b = m; } demivie = a; xDemi = xLoin(a); }
  const classe = (CLASSES_DEMIVIE.find(([s]) => (demivie ?? Infinity) < s) || CLASSES_DEMIVIE[3])[1];
  return { d, N, x, y, det, alpha, beta, gamma, plafond, usure, perte, demivie, xDemi, classe, yLoin, xLoin };
}

/* Graphique SVG : phases en bandes, jalons numérotés (nom au survol), α β γ, α / 2, demi-vie, pointillés. */
function courbeSVG(c, titre){
  const e = s => String(s ?? "").replace(/[&<>"']/g, k => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
  const f = (v, k = 2) => Number(v).toFixed(k).replace(".", ",");
  const W = 760, H = 330, g = 46, dr = 16, h0 = 26, b = 42;
  const xFin = Math.max(c.x[7] + 4, Math.min(c.x[7] + 9, c.xDemi ? c.xDemi + 1.5 : 0));
  const yMax = Math.max(5, Math.ceil(c.y[c.alpha] + 1));
  const X = v => g + v / xFin * (W - g - dr), Y = v => H - b - v / yMax * (H - b - h0);
  let s = `<svg class="courbe" viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe du flow${titre ? " de " + e(titre) : ""}">`;
  [["I", 0, 2], ["II", 2, 4], ["III", 4, 6], ["IV", 6, null]].forEach(([p, a, z], i) => {
    const x1 = X(c.x[a]), x2 = z == null ? X(xFin) : X(c.x[z]), long = `${p} ${PHASES[p]}`;
    const lib = (x2 - x1) > long.length * 6.6 + 8 ? long : (x2 - x1) > PHASES[p].length * 6.6 ? PHASES[p] : p;
    s += `<rect x="${x1}" y="${h0}" width="${x2 - x1}" height="${H - b - h0}" class="bande${i % 2}"><title>Phase ${p} : ${e(PHASES[p])}</title></rect><text x="${(x1 + x2) / 2}" y="${h0 - 8}" class="phase">${e(lib)}</text>`;
  });
  for (let v = 0; v <= yMax; v++) s += `<line x1="${g}" x2="${W - dr}" y1="${Y(v)}" y2="${Y(v)}" class="grille"/><text x="${g - 8}" y="${Y(v) + 4}" class="gy">${v}</text>`;
  s += `<text x="4" y="${h0 - 8}" class="gy" style="text-anchor:start">flow</text>`;
  const cible = c.y[c.alpha] / 2;
  if (cible > 0) s += `<line x1="${g}" x2="${W - dr}" y1="${Y(cible)}" y2="${Y(cible)}" class="demi"/><text x="${W - dr - 4}" y="${Y(cible) - 5}" class="gl" style="text-anchor:end">α / 2</text>`;
  if (c.xDemi != null){ const xd = X(Math.min(c.xDemi, xFin)); s += `<line x1="${xd}" x2="${xd}" y1="${Y(cible)}" y2="${H - b}" class="demi"/><text x="${Math.min(xd, W - dr - 70)}" y="${H - b + 34}" class="gl">demi-vie ≈ ${arrondiDemiVie(c.demivie)} parties</text>`; }
  const fin = c.gamma ?? 7, pts = j => `${X(c.x[j])},${Y(c.y[j])}`;
  s += `<polyline class="trait" points="${[...Array(fin + 1).keys()].map(pts).join(" ")}"/>`;
  const loin = [...Array(8 - fin).keys()].map(k => pts(fin + k));
  for (let xv = c.x[7] + .25; xv <= xFin + 1e-9; xv += .25){ const Nk = (1 + c.N[7]) * 2 ** (xv - c.x[7]) - 1; loin.push(`${X(xv)},${Y(c.yLoin(Nk))}`); }
  s += `<polyline class="pointille" points="${loin.join(" ")}"/>`;
  for (let j = 0; j <= 7; j++){
    const info = `Jalon ${j} : ${JALONS[j].nom} — ${f(c.N[j], 1)} parties, flow ${f(c.y[j])}`;
    s += `<g><title>${e(info)}</title><circle cx="${X(c.x[j])}" cy="${Y(c.y[j])}" r="${j === c.alpha ? 6 : 4}" class="${j === c.alpha ? "pt alpha" : "pt"}"/>
      <text x="${X(c.x[j])}" y="${H - b + 16}" class="gx">${j}</text></g>`;
  }
  s += `<text x="${X(c.x[c.alpha])}" y="${Y(c.y[c.alpha]) - 12}" class="gl fort">α ${f(c.y[c.alpha])}</text>`;
  if (c.beta != null) s += `<text x="${X(c.x[c.beta]) + 10}" y="${Y(c.y[c.beta]) - 12}" class="gl fort">β</text>`;
  if (c.gamma != null) s += `<text x="${X(c.x[c.gamma])}" y="${Y(c.y[c.gamma]) - 12}" class="gl fort">γ</text>`;
  s += `<line x1="${g}" x2="${W - dr}" y1="${H - b}" y2="${H - b}" class="axe-l"/>`;
  return s + `</svg>`;
}

const arrondiDemiVie = v => v == null ? "∞" : v >= 100 ? Math.round(v / 10) * 10 : Math.round(v);

/* Phrase de synthèse, en texte simple (bandeau, récapitulatif, export). */
function syntheseTimeline(c){
  const f = (v, k = 2) => Number(v).toFixed(k).replace(".", ",").replace("-", "−");
  const purge = c.gamma != null && c.det[c.gamma]?.brut < 0;
  const chute = c.beta == null ? "pas de chute : un classique" : purge ? `purge au jalon ${c.gamma}` : `chute du jalon ${c.beta} (β) au jalon ${c.gamma} (γ)`;
  const dv = c.demivie == null ? "demi-vie au-delà de 10 millions de parties (inusable)" : `demi-vie ≈ ${arrondiDemiVie(c.demivie)} partie${c.demivie >= 1.5 ? "s" : ""} (${c.classe})`;
  return `α ${f(c.y[c.alpha])} au jalon ${c.alpha} (${JALONS[c.alpha].nom}, vers ${Math.round(c.N[c.alpha])} partie${Math.round(c.N[c.alpha]) > 1 ? "s" : ""}) · ${chute}${purge ? "" : ` · perte ${f(c.perte)} par doublement`} · ${dv}`;
}

/* Styles du graphique, injectés une fois (les couleurs viennent des variables de la page). */
(function(){
  const css = `.courbe-box{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin:12px 0}
.courbe-box figcaption{font-size:13px;color:var(--muted);margin-top:4px}
svg.courbe{width:100%;height:auto;display:block;font-family:inherit}
svg.courbe .bande0{fill:var(--paper)} svg.courbe .bande1{fill:color-mix(in srgb, var(--accent) 7%, var(--panel))}
svg.courbe .phase{font-size:12px;fill:var(--muted);text-anchor:middle;font-weight:600}
svg.courbe .grille{stroke:var(--line);stroke-width:1} svg.courbe .axe-l{stroke:var(--ink);stroke-width:1.2}
svg.courbe .gy{font-size:12px;fill:var(--muted);text-anchor:end} svg.courbe .gx{font-size:12.5px;fill:var(--ink);text-anchor:middle;font-weight:600}
svg.courbe .gl{font-size:12px;fill:var(--muted);text-anchor:middle} svg.courbe .gl.fort{fill:var(--ink);font-weight:600;font-size:13px}
svg.courbe .trait{fill:none;stroke:var(--ink);stroke-width:2.5;stroke-linejoin:round}
svg.courbe .pointille{fill:none;stroke:var(--ink);stroke-width:2;stroke-dasharray:5 5}
svg.courbe .demi{stroke:var(--warn);stroke-width:1.2;stroke-dasharray:2 4}
svg.courbe .pt{fill:var(--panel);stroke:var(--ink);stroke-width:2} svg.courbe .pt.alpha{fill:var(--ink)}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();
