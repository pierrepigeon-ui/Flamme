/* PRISME — timeline du jeu : jalons, durées, flow, α β γ, demi-vie.
   Module partagé par l'encyclopédie et l'outil d'évaluation. Méthode arrêtée le 08/10/2026 (jeu d'essai : Heat). */
const TIMELINE_VERSION = { numero:"1.5", date:"2026-10-11 01:30" };   // à incrémenter à chaque livraison

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
const TIMELINE_AXES = ["POID1","PROF1","VAR1","ALEA1","ALEA2","EXIG1","RYT1","RYT2","MAN1","MAN2","THEM1","LIEN1","LIEN2","INT1","INT2","NEG1","NEG2","ART2a","ART2b","TRAN2","VAL1"];
const TIMELINE_PAIRES = ["POID","PROF","VAR","EXIG","SCAL","MAT","THEM"];
const CLASSES_DEMIVIE = [[10, "éphémère"], [100, "durable"], [1000, "classique"], [Infinity, "inusable"]];

/* ---- les moteurs de PRISMEplayer vus par le jeu (revue du 08/10/2026, v2 du 10/10/2026) ----
   nourrit : paires dont la réussite compte davantage (2 = ++, 1 = +) ; trait : à quel point le jeu est tourné vers ce moteur (axes 1, 0 à 5) ;
   rejet : jalon à partir duquel le trait devient friction pour qui rejette ce moteur ; elan : paires et jalons où le moteur pèse encore plus. */
const MOTEURS_JEU = {
  U:{ nourrit:{ EXIG:2, PROF:2, POID:1, TRAN:1, ALEA:1 }, rejet:3, elan:{ paires:["EXIG","PROF"], de:3, a:4 },
      trait:n => moyT(n.EXIG1, n.PROF1, n.POID1), traitTxt:"moy(EXIG1, PROF1, POID1)" },
  B:{ nourrit:{ LIEN:2, ALEA:2, PROF:1, INT:1 }, rejet:5, elan:{ paires:["LIEN","PROF"], de:4, a:6 },
      trait:n => moyT(n.LIEN1 == null ? null : n.LIEN1 >= 2 ? n.LIEN1 : Math.max(n.LIEN1, n.EXIG1 ?? 0), n.ALEA1 == null ? null : 5 - n.ALEA1),
      traitTxt:"moy(adversité, 5 − ALEA1) ; adversité = LIEN1, ou max(LIEN1, EXIG1) si LIEN1 ≤ 1 (l'adversaire peut être le jeu)" },
  R:{ nourrit:{ RYT:2, ALEA:2, INT:1, THEM:1, MAT:1, ART:1 }, rejet:2, elan:{ paires:["MAT","ART","THEM"], de:1, a:3 },
      trait:n => moyT(n.RYT1, n.ALEA1, n.INT1), traitTxt:"moy(RYT1, ALEA1, INT1)" },
  W:{ nourrit:{ LIEN:2, NEG:2, SCAL:2, INT:1, TRAN:1 }, rejet:2, elan:{ paires:["LIEN","SCAL"], de:5, a:7 },
      trait:n => moyT(n.NEG1, n.INT1, n.LIEN1 == null ? null : 5 - n.LIEN1), traitTxt:"moy(NEG1, INT1, 5 − LIEN1)" },
  G:{ nourrit:{ VAR:2, PROF:1, THEM:1, NEG:1, RYT:1 }, rejet:3, elan:null,
      trait:n => moyT(n.NEG1, n.VAR1), traitTxt:"moy(NEG1, VAR1)" }
};
function moyT(...a){ a = a.filter(v => v != null && !Number.isNaN(v)); return a.length ? a.reduce((s, v) => s + v, 0) / a.length : null; }
// un style (v2) : { dom:"U", second:"B", autres:["W","R"], rejet:"G" } → poids 1 pour le dominant, 0,5 pour le second,
// 1/6 pour chacun des deux suivants (3 / 1,5 / 0,5 / 0,5) ; le moteur fui ne nourrit pas, il gêne (geneRejet)
const poidsProfil = pr => pr ? { [pr.dom]:1, [pr.second]:.5, [pr.autres[0]]:1 / 6, [pr.autres[1]]:1 / 6 } : {};
// d'un code de style à sa lecture : "W.b/u" → { dom:"W", second:"B", autres:["R","G"], rejet:"U" }
function prDeStyle(code){
  const dom = code[0], second = code[2].toUpperCase(), rejet = code[4].toUpperCase();
  return { dom, second, rejet, autres: [..."WUBRG"].filter(c => c !== dom && c !== second && c !== rejet) };
}
// Décrypter culmine à la fin de la compréhension (jalon 4) : ensuite sa stimulation baisse, sauf si le jeu reste très réflexif
// facteur = 1 − 0,2 × kU × (1 − r), r = (moy(EXIG1, PROF1) − 2,5) / 2 borné à [0, 1] (aucune baisse dès que la moyenne atteint 4,5)
function declinDecrypter(n, kU){
  if (!kU) return 1; const m = moyT(n.EXIG1, n.PROF1); const r = m == null ? 0 : Math.min(1, Math.max(0, (m - 2.5) / 2));
  return 1 - .2 * kU * (1 - r);
}
const geneRejet = (n, pr) => { if (!pr) return 0; const t = MOTEURS_JEU[pr.rejet].trait(n); return t == null ? 0 : Math.max(0, t - 2) / 3; };   // 0 à 1
function poidsPaire(code, pr, j){
  let w = 1; const k = poidsProfil(pr);
  Object.entries(k).forEach(([m, km]) => { const l = MOTEURS_JEU[m].nourrit[code] || 0, e = MOTEURS_JEU[m].elan;
    if (l) w += km * l * (e && j != null && j >= e.de && j <= e.a && e.paires.includes(code) ? 1.5 : 1); });
  return w;
}

/* n : { code: valeur } ; une valeur absente (paire sans objet) est retirée des moyennes.
   contenu_parties : plancher du jalon 6 (facultatif). pr : sous-profil (facultatif) → courbe vue par ce joueur. */
function flowJeu(n, pr){
  const ok = v => v != null && !Number.isNaN(v);
  const moy = (...a) => { a = a.filter(ok); return a.length ? a.reduce((s, v) => s + v, 0) / a.length : null; };
  const quad = (...a) => { a = a.filter(ok); return a.length ? Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length) : 0; };
  const inv = v => ok(v) ? 5 - v : null, fois = (v, k) => ok(v) ? v * k : null;
  const k = poidsProfil(pr), kR = k.R || 0, kG = k.G || 0, kW = k.W || 0, kU = k.U || 0;
  const penteL = .1 - .03 * kG;                                   // Rayonner prolonge l'apogée
  const lassitude = N => 1 + penteL * Math.log2(1 + N);
  const exces = Math.max(0, (n.EXIG1 ?? 0) - 2);
  const fAttente = (1 + kR * exces / 5) * (1 + kG * exces / 10) * (1 - kW * (n.NEG2 ?? 0) / 10);   // paralysie subie ; la parole fait passer le temps
  const gene = geneRejet(n, pr) * 5, deRejet = pr ? MOTEURS_JEU[pr.rejet].rejet : 99;
  const d = [ (n.VAL1 ?? 0) / 4, (n.POID1 ?? 0) / 5 + (n.MAN1 ?? 0) / 10, 1 + (inv(n.TRAN2) ?? 0) / 10,
    2 ** ((moy(n.POID1, n.EXIG1, n.VAR1, inv(n.TRAN2), inv(n.ART2b)) ?? 0) - 1), 2 ** ((moy(n.PROF, n.EXIG1, n.POID1) ?? 0) - 1),
    2 ** ((moy(n.PROF, n.EXIG, n.VAR1) ?? 0) + .1 - 1), 2 ** ((moy(n.VAR, n.SCAL, n.MAN2) ?? 0) - 1) ];
  const N = [0];
  d.forEach((x, i) => { N.push(N[i] + x); if (i === 5 && n.contenu_parties > 0 && N[6] < n.contenu_parties){ d[5] += n.contenu_parties - N[6]; N[6] = n.contenu_parties; } });
  const x = [0]; d.forEach((v, i) => x.push(x[i] + Math.log2(1 + v)));
  const plafond = ok(n.ALEA1) && ok(n.ALEA2) ? 1 - (n.ALEA1 / 5) * ((5 - n.ALEA2) / 5) : 1;
  const usure = .5 + (ok(n.VAR) ? n.VAR : (n.VAR1 ?? 0)) / 10;
  const termes = (j, Nj) => {
    const L = lassitude(Nj), M = fois(n.MAN1, L), M2 = fois(inv(n.MAN2), L), A = fois(moy(inv(n.RYT1), inv(n.RYT2)), L * fAttente);
    const f5 = [A, inv(n.ALEA2), inv(n.LIEN2), inv(n.INT2), inv(n.PROF), M];
    const S = { 1:[["MAT",n.MAT],["ART",n.ART2a],["THEM",n.THEM1]], 2:[["THEM",n.THEM],["MAT",n.MAT],["ART",n.ART2a]],
      3:[["THEM",n.THEM],["INT",n.INT2],["EXIG",n.EXIG],["ALEA",n.ALEA2]], 4:[["EXIG",n.EXIG],["PROF",n.PROF],["INT",n.INT2],["LIEN",n.LIEN2]],
      5:[["PROF",n.PROF],["EXIG",n.EXIG],["POID",n.POID],["LIEN",n.LIEN2]], 6:[["PROF",n.PROF],["VAR",n.VAR],["POID",n.POID],["LIEN",n.LIEN2]],
      7:[["VAR",n.VAR],["SCAL",n.SCAL],["MAN",n.MAN2],["LIEN",n.LIEN2]] }[j];
    if (pr && kW && (j === 6 || j === 7) && ok(n.NEG2)) S.push(["NEG", n.NEG2]);        // vraie négociation, pour un Rassembleur
    const F = { 1:[n.POID1, M, inv(n.ART2b)], 2:[n.POID1, inv(n.TRAN2), M, inv(n.ART2b)], 3:[inv(n.TRAN2), inv(n.ART2b), A, M, n.POID1], 4:[A, M, inv(n.ART2b)],
      5:f5, 6:[...f5, inv(n.VAR)], 7:[A, M, M2, inv(n.SCAL), inv(n.VAR)] }[j];
    let sw = 0, sv = 0; S.forEach(([c, v]) => { if (!ok(v)) return; const w = pr ? poidsPaire(c, pr, j) : 1; sw += w; sv += w * v; });
    const s = (sw ? sv / sw : 0) * (j === 5 || j === 6 ? plafond : j === 7 ? usure : 1) * (j >= 5 ? declinDecrypter(n, kU) : 1);
    let f = quad(...F); const nf = F.filter(ok).length || 1;
    if (gene > 0 && j >= deRejet) f = Math.sqrt(f * f + gene * gene / nf);            // ce que le joueur rejette devient friction
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
function courbeSVG(c, titre, ref){
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
  if (ref) s += `<polyline class="ref" points="${ref.x.map((v, j) => `${X(v)},${Y(ref.y[j])}`).join(" ")}"><title>Flow pour tous</title></polyline><text x="${X(ref.x[7]) + 6}" y="${Y(ref.y[7]) + 4}" class="gl" style="text-anchor:start">pour tous</text>`;
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
svg.courbe .ref{fill:none;stroke:var(--muted);stroke-width:1.5;stroke-dasharray:1 3;opacity:.9}
svg.courbe .pt{fill:var(--panel);stroke:var(--ink);stroke-width:2} svg.courbe .pt.alpha{fill:var(--ink)}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();

/* ---------------- le spectromètre : le jeu vu par chacun des 60 styles ---------------- */
// note finale vue par un style : dans chaque chapitre, moyenne des paires pondérée par ses moteurs ; puis moyenne des chapitres ; puis pénalité de rejet
function noteProfil(paires, n, pr){
  const parChap = {};
  paires.forEach(p => { if (p.note == null) return; const w = poidsPaire(p.code, pr, null); (parChap[p.chap] ??= { sw:0, sv:0 }); parChap[p.chap].sw += w; parChap[p.chap].sv += w * p.note; });
  const ch = Object.values(parChap).map(c => c.sv / c.sw); if (!ch.length) return null;
  return ch.reduce((a, b) => a + b, 0) / ch.length * (1 - .5 * geneRejet(n, pr));
}
// ce que le jeu offre à chaque moteur (trait) et ce qu'il réussit pour lui (moyenne des paires qu'il aime, pondérée)
function spectreMoteurs(paires, n){
  return Object.fromEntries(Object.entries(MOTEURS_JEU).map(([m, def]) => {
    let sw = 0, sv = 0; paires.forEach(p => { const l = def.nourrit[p.code]; if (l && p.note != null){ sw += l; sv += l * p.note; } });
    return [m, { trait: def.trait(n), reussite: sw ? sv / sw : null }];
  }));
}
// ---- les profils : un tempérament A/e et un style A.b ; le code complet A.b/e réunit les deux (60 profils) ----
const PROFILS = (() => { const O = "WUBRG", L = []; for (const a of O) for (const e of O) if (e !== a) for (const b of O) if (b !== a && b !== e) L.push(`${a}.${b.toLowerCase()}/${e.toLowerCase()}`); return L; })();
const temperamentDe = code => code[0] + "/" + code[4];   // R.u/b → R/b
const styleDe = code => code.slice(0, 3);                  // R.u/b → R.u
// les profils (codes complets) couverts par un code : profil R.u/b, tempérament R/b, style R.u, moteur R
const stylesDe = code => PROFILS.filter(c => code.length === 5 ? c === code : code.includes("/") ? c[0] === code[0] && c[4] === code[2]
  : code.includes(".") ? c.slice(0, 3) === code : c[0] === code);
// les tempéraments significatifs d'un profil : affinité de X/y = (score X − moyenne des 5) × (moyenne − score Y), les deux écarts positifs ;
// on garde ceux qui atteignent un tiers du premier, quatre au plus ; le tempérament du classement passe toujours en tête
function facettes(scores, principal){
  const S = scores || {}, C = "WUBRG".split("").filter(c => S[c] != null);
  if (C.length < 5) return [{ code:principal, aff:1, part:1 }];
  const m = C.reduce((t, c) => t + Number(S[c]), 0) / 5, L = [];
  C.forEach(a => C.forEach(e => { const h = Number(S[a]) - m, b = m - Number(S[e]); if (a !== e && h > 0 && b > 0) L.push({ code:a + "/" + e.toLowerCase(), aff:h * b }); }));
  L.sort((x, y) => (y.code === principal) - (x.code === principal) || y.aff - x.aff);
  const max = Math.max(...L.map(x => x.aff), 1e-9);
  return (L.length ? L : [{ code:principal, aff:1 }]).filter((x, i) => i === 0 || x.aff >= max / 3 - 1e-9).slice(0, 4).map(x => ({ ...x, part: x.aff / max }));
}

// pl : { moteurs, temperaments, styles } (tables PRISMEplayer : 20 tempéraments A/e, 20 styles A.b)
// lignes : une par profil (60) ; st : { code, nom, second } (nom = « tempérament (style) ») ; moteurs : regroupement moteur › tempérament › profils
function spectrometre(n, paires, pl){
  const base = flowJeu(n), noteBase = noteProfil(paires, n, null);
  const T = Object.fromEntries(pl.temperaments.map(t => [t.code, t])), S = Object.fromEntries(pl.styles.map(x => [x.code, x])), M = Object.fromEntries(pl.moteurs.map(m => [m.code, m]));
  const lignes = PROFILS.map(code => {
    const pr = prDeStyle(code), t = T[temperamentDe(code)], sty = S[styleDe(code)], c = flowJeu(n, pr), note = noteProfil(paires, n, pr), gene = geneRejet(n, pr);
    const st = { code, second: pr.second, nom: `${t?.nom || temperamentDe(code)} (${sty?.nom || styleDe(code)})`, style: sty };
    return { st, temperament:t, moteur:M[pr.dom], pr, c, note, gene,
      decroche: c.beta != null ? c.beta : gene > 0 ? MOTEURS_JEU[pr.rejet].rejet : null };
  }).sort((a, b) => (b.note ?? -1) - (a.note ?? -1));
  const resume = L => ({ note: L.reduce((s, l) => s + (l.note ?? 0), 0) / L.length, alpha: L.reduce((s, l) => s + l.c.y[l.c.alpha], 0) / L.length, lignes:L });
  const moteurs = pl.moteurs.map(m => ({ m, ...resume(lignes.filter(l => l.pr.dom === m.code)),
      temperaments: pl.temperaments.filter(t => t.moteur === m.code).map(t => ({ t, ...resume(lignes.filter(l => l.temperament?.code === t.code)) })).sort((x, y) => y.note - x.note) }))
    .sort((x, y) => y.note - x.note);
  return { base, noteBase, lignes, moteurs, spectre: spectreMoteurs(paires, n) };
}

/* Rosace : 5 moteurs, l'offre (trait) en contour, la réussite en surface. couleurs : { code: couleur } */
function rosaceSVG(spectre, moteurs){
  const e = s => String(s ?? "").replace(/[&<>"']/g, k => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
  const f = v => v == null ? "—" : Number(v).toFixed(2).replace(".", ",");
  const W = 400, cx = 200, cy = 168, R = 104, M = moteurs.map(m => m.code);
  const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / M.length; return [cx + Math.cos(a) * R * v / 5, cy + Math.sin(a) * R * v / 5]; };
  let s = `<svg class="rosace" viewBox="0 0 ${W} 360" role="img" aria-label="Rosace des cinq moteurs">`;
  [1,2,3,4,5].forEach(v => s += `<polygon points="${M.map((_, i) => pt(i, v).join(",")).join(" ")}" class="anneau"/>`);
  M.forEach((_, i) => { const [x, y] = pt(i, 5); s += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="rayon"/>`; });
  s += `<polygon points="${M.map((m, i) => pt(i, spectre[m]?.reussite ?? 0).join(",")).join(" ")}" class="reussite"/>`;
  s += `<polygon points="${M.map((m, i) => pt(i, spectre[m]?.trait ?? 0).join(",")).join(" ")}" class="offre"/>`;
  moteurs.forEach((m, i) => { const [x, y] = pt(i, i === 0 ? 7.3 : 6.1), anc = x < cx - 10 ? "end" : x > cx + 10 ? "start" : "middle";
    s += `<text x="${x}" y="${y}" class="mot" style="text-anchor:${anc};fill:${e(m.couleur)}">${e(m.nom)}</text>
      <text x="${x}" y="${y + 16}" class="val" style="text-anchor:${anc}">offre ${f(spectre[m.code]?.trait)}</text>
      <text x="${x}" y="${y + 31}" class="val" style="text-anchor:${anc}">réussite ${f(spectre[m.code]?.reussite)}</text>`; });
  return s + `</svg>`;
}
(function(){
  const st = document.createElement("style");
  st.textContent = `svg.rosace{width:100%;max-width:440px;height:auto;display:block;margin:0 auto;font-family:inherit}
svg.rosace .anneau{fill:none;stroke:var(--line)} svg.rosace .rayon{stroke:var(--line)}
svg.rosace .reussite{fill:color-mix(in srgb, var(--accent) 22%, transparent);stroke:var(--accent);stroke-width:1.5}
svg.rosace .offre{fill:none;stroke:var(--ink);stroke-width:2;stroke-dasharray:5 4}
svg.rosace .mot{font-size:15px;font-weight:600} svg.rosace .val{font-size:13px;fill:var(--muted)}`;
  document.head.appendChild(st);
})();

/* ---------------- d'une fiche d'évaluation aux entrées du calcul (partagé : outil, rosace) ---------------- */
// note d'une paire à partir de la saisie { axe: { valeur, sans_objet } } ; ax : les axes de la paire
function noteDePaire(p, s, ax){
  const val = r => s[ax.find(a => a.rang === r)?.code]?.valeur;
  const enS = x0 => { const t = (x0 + 2) / 9; return t <= .5 ? 10 * t * t : 5 * (1 - 2 * (1 - t) * (1 - t)); };
  if (ax.some(a => s[a.code]?.sans_objet)) return { complete:true, so:true, note:null };
  if (p.mecanisme === "composite" || p.mecanisme === "moyenne"){
    const t1 = val("1"), a = val("2a"), b = val("2b");
    if (t1 == null || a == null || b == null) return { complete:false, note:null };
    return { complete:true, note: p.mecanisme === "composite" ? (b * t1 + a * (5 - t1)) / 5 : (a + b) / 2 };
  }
  const v1 = val("1"), v2 = val("2");
  if (v1 != null && p.na_si_axe1_nul && Math.round(v1) === 0) return { complete:true, na1:true, note:null };
  if (v1 != null && p.seuil_axe1 != null && v1 < Number(p.seuil_axe1) && (v2 == null || v2 > 1)) return { complete:true, seuil:true, note:null };
  if (v1 == null || v2 == null) return { complete:false, note:null };
  return { complete:true, note: p.mecanisme === "liee" ? enS(v1 + v2) : p.mecanisme === "crans5" ? 2.5 + v2 * 1.25 : v2 };
}
// toutes les entrées d'une fiche : n (pour la courbe), paires (pour les notes), manque (paires à remplir), absents (sans objet)
function entreesFiche(s, paires, axes, contenu){
  const axesDeP = code => axes.filter(a => a.paire === code);
  const etats = Object.fromEntries(paires.map(p => [p.code, noteDePaire(p, s, axesDeP(p.code))]));
  const n = { contenu_parties: Number(contenu) || null }, manque = new Set(), absents = new Set();
  TIMELINE_PAIRES.forEach(code => { const r = etats[code]; if (!r) return;
    if (!r.complete) manque.add(code); else if (r.note == null) absents.add(code); else n[code] = r.note; });
  TIMELINE_AXES.forEach(code => {
    const a = axes.find(x => x.code === code); if (!a) return;
    const r = etats[a.paire], v = s[code]?.valeur;
    if (r?.seuil && a.rang !== "1") return;
    if (r?.so || (r?.na1 && a.rang !== "1")){ absents.add(a.paire); return; }
    if (v == null) manque.add(a.paire); else n[code] = v;
  });
  return { n, manque:[...manque], absents:[...absents], etats,
    paires: paires.map(p => ({ chap:p.chapitre, code:p.code, note:etats[p.code].note })) };
}
// le meilleur des jeux pour des profils (codes complets W.b/u) : fiches = [{ jeu, statut, saisie, contenu_parties }]
// pour un tempérament, un style ou un moteur, passer la liste de ses profils : stylesDe(code)
function jeuxPourJoueurs(fiches, paires, axes, pl, codes){
  const prs = codes.map(prDeStyle);
  const parJeu = {};
  fiches.forEach(f => {
    const e = entreesFiche(f.saisie, paires, axes, f.contenu_parties);
    if (e.manque.length) return;                                   // fiche incomplète : pas de calcul
    const base = noteProfil(e.paires, e.n, null), cb = flowJeu(e.n);
    const res = prs.map(pr => ({ note: noteProfil(e.paires, e.n, pr), c: flowJeu(e.n, pr) }));
    const moy = k => res.reduce((t, r) => t + k(r), 0) / res.length;
    (parJeu[f.jeu] ??= []).push({ finale: f.statut === "finale", base, alphaBase: cb.y[cb.alpha],
      note: moy(r => r.note), alpha: moy(r => r.c.y[r.c.alpha]), demivie: moy(r => Math.min(r.c.demivie ?? 1e7, 1e7)) });
  });
  return Object.entries(parJeu).map(([jeu, L]) => {
    const F = L.some(x => x.finale) ? L.filter(x => x.finale) : L, m = k => F.reduce((t, x) => t + x[k], 0) / F.length;
    return { jeu, fiches:F.length, finale:F[0].finale, note:m("note"), base:m("base"), alpha:m("alpha"), demivie:m("demivie") };
  }).sort((a, b) => b.note - a.note);
}

/* ---------------- lecture des jeux évalués et tableau « ses jeux » (partagé : rosace, fiche du joueur) ---------------- */
async function lireJeuxEvalues(sb){
  const lire = async (t, o) => { const tout = []; for (let d = 0; ; d += 1000){ let q = sb.from(t).select("*"); if (o) q = q.order(o); const { data, error } = await q.range(d, d + 999);
    if (error) throw error; tout.push(...data); if (data.length < 1000) return tout; } };
  try {
    const [paires, axes, jeux, evals, vals] = await Promise.all([lire("prisme_paires","ordre"), lire("prisme_axes","ordre"), lire("prisme_jeux","nom"), lire("prisme_evaluations"), lire("prisme_evaluation_valeurs")]);
    if (!paires.length) return { refus:true };
    const saisies = {}; vals.forEach(v => (saisies[v.evaluation] ??= {})[v.axe] = { valeur: v.valeur == null ? null : Number(v.valeur), sans_objet: v.sans_objet });
    return { paires, axes, jeux, fiches: evals.map(e => ({ jeu:e.jeu, statut:e.statut, contenu_parties:e.contenu_parties, saisie: saisies[e.id] || {} })) };
  } catch (e){ return { refus:true }; }
}
// L : résultat de jeuxPourJoueurs ; d : résultat de lireJeuxEvalues ; qui : « lui », « vous »…
function tableJeuxHTML(L, d, qui, moyenne){
  const e = s => String(s ?? "").replace(/[&<>"']/g, k => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
  const nom = c => d.jeux.find(j => j.code === c)?.nom || c, f = (v, k = 2) => Number(v).toFixed(k).replace(".", ",");
  if (!L.length) return `<p class="pj-discret">Aucun jeu n'a encore de fiche complète.</p>`;
  const ecart = x => { const v = x.note - x.base; return `<span class="pj-ecart ${v >= .005 ? "plus" : v <= -.005 ? "moins" : ""}">${Math.abs(v) < .005 ? "±" : v > 0 ? "+" : "−"}${f(Math.abs(v))}</span>`; };
  const ligne = (x, i) => `<tr><td class="rang">${i}</td><td><a href="evaluation.html?jeu=${encodeURIComponent(x.jeu)}">${e(nom(x.jeu))}</a>${x.finale ? "" : ' <small class="pj-discret">brouillon</small>'}</td>
    <td class="n"><b>${f(x.note)}</b> ${ecart(x)}</td><td class="n">${f(x.alpha)}</td><td class="n">${x.demivie >= 1e7 ? "∞" : arrondiDemiVie(x.demivie)}</td></tr>`;
  const haut = L.slice(0, 8), bas = L.length > 11 ? L.slice(-3) : [];
  return `<p class="pj-discret">${L.length} jeu${L.length > 1 ? "x" : ""} évalué${L.length > 1 ? "s" : ""}, classé${L.length > 1 ? "s" : ""} ${qui === "vous" ? "selon la note qu'ils obtiennent pour vous" : "selon la note vue par " + e(qui) + (moyenne ? " (en moyenne)" : "")} ; l'écart se lit par rapport à la note pour tous.</p>
    <table class="pj-jeux"><thead><tr><th></th><th>Jeu</th><th class="n">Note</th><th class="n">α</th><th class="n">Demi-vie</th></tr></thead>
    <tbody>${haut.map((x, i) => ligne(x, i + 1)).join("")}</tbody>
    ${bas.length ? `<tbody class="bas"><tr><td colspan="5" class="pj-discret">Ceux qui ${qui === "vous" ? "vous" : "lui"} vont le moins</td></tr>${bas.map((x, i) => ligne(x, L.length - bas.length + i + 1)).join("")}</tbody>` : ""}</table>`;
}
(function(){
  const st = document.createElement("style");
  st.textContent = `.pj-discret{color:var(--muted);font:13.5px/1.5 var(--sans, inherit)}
table.pj-jeux{width:100%;border-collapse:collapse;font-size:14px;margin:4px 0 10px}
table.pj-jeux th{font-weight:500;font-size:12px;color:var(--muted);text-align:left;border-bottom:1px solid var(--line);padding:4px 5px}
table.pj-jeux td{border-bottom:1px solid var(--line);padding:5px;vertical-align:baseline} table.pj-jeux .n{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
table.pj-jeux td.rang{color:var(--muted);width:1.6em} table.pj-jeux tbody.bas td{border-bottom-color:transparent}
.pj-ecart{font-size:12px;color:var(--muted)} .pj-ecart.plus{color:#1E7A46} .pj-ecart.moins{color:#B42318}
@media (prefers-color-scheme: dark){.pj-ecart.plus{color:#5CC98A} .pj-ecart.moins{color:#F2837A}}`;
  document.head.appendChild(st);
})();
