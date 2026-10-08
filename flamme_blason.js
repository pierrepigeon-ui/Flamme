/* =====================================================================
   FLAMME — blason : transposition d'un profil en écusson héraldique
   Grammaire validée le 30/09/2026, révisée le 08/10/2026 (1.9) : quatre couleurs montrées,
   la cinquième se lit dans la forme (voir GRAMMAIRE plus bas).
   Utilisable dans le navigateur (window.FLAMME_BLASON) ou sous Node.
   Dépend de FLAMME_MOTEUR (analyser, ordonner).
   ===================================================================== */
(function (racine, fabrique) {
  const b = fabrique(typeof module === "object" && module.exports ? require("./flamme_moteur.js") : racine.FLAMME_MOTEUR);
  if (typeof module === "object" && module.exports) module.exports = b; else racine.FLAMME_BLASON = b;
})(typeof self !== "undefined" ? self : this, function (M) {
  "use strict";
  const VERSION = { numero: "1.9", date: "2026-10-08 15:30" };

/* Meubles héraldiques FLAMME : silhouettes pleines dans une boîte 100 × 100, cernées de sable.
   Chaque meuble : { nom, pluriel, genre ('m'|'f'), svg } — svg sans couleur (fill/stroke hérités). */
const MEUBLES = {
  "W/u": { nom:"chêne", pluriel:"chênes", genre:"m", svg:`
    <path d="M50 8c-9 0-15 6-17 12-8 0-15 7-14 15-6 3-9 9-7 16 2 7 9 11 16 10 3 5 9 7 15 6 4 4 12 4 16 0 6 1 12-1 15-6 7 1 14-3 16-10 2-7-1-13-7-16 1-8-6-15-14-15-2-6-8-12-17-12z"/>
    <path d="M45 60h10v18c4 4 11 7 18 8v6c-8 0-15-3-20-7l-3 9h-2l-3-9c-5 4-12 7-20 7v-6c7-1 14-4 18-8z"/>` },
  "W/b": { nom:"gonfanon", pluriel:"gonfanons", genre:"m", svg:`
    <rect x="16" y="6" width="7" height="90" rx="3"/><circle cx="19.5" cy="7" r="5"/>
    <path d="M23 12h62v44l-10 16-10-16-10 16-11-16-10 16-11-16z"/>` },
  "W/r": { nom:"chaîne", pluriel:"chaînes", genre:"f", svg:`<g transform="translate(50 55) rotate(-32) scale(1.3) translate(-50 -55)"><path fill-rule="evenodd" d="M16 43h16a12 12 0 0 1 0 24h-16a12 12 0 0 1 0-24zm0 8a4 4 0 0 0 0 8h16a4 4 0 0 0 0-8z"/><path fill-rule="evenodd" d="M38 47a12 12 0 0 1 24 0v16a12 12 0 0 1-24 0zm8 0v16a4 4 0 0 0 8 0V47a4 4 0 0 0-8 0z"/><path fill-rule="evenodd" d="M68 43h16a12 12 0 0 1 0 24h-16a12 12 0 0 1 0-24zm0 8a4 4 0 0 0 0 8h16a4 4 0 0 0 0-8z"/></g>` },
  "W/g": { nom:"balance", pluriel:"balances", genre:"f", svg:`
    <path d="M14 10h16v60h56v16H14z"/>` },
  "U/b": { nom:"livre ouvert", pluriel:"livres ouverts", genre:"m", svg:`
    <path d="M50 24C40 16 24 14 8 18v60c16-4 32-2 42 6 10-8 26-10 42-6V18C76 14 60 16 50 24z"/>
    <path d="M50 24v58" fill="none"/>` },
  "U/r": { nom:"loupe", pluriel:"loupes", genre:"f", svg:`
    <circle cx="50" cy="14" r="9"/><path d="M45 20l-26 72 6 2 28-66zM55 20l26 72-6 2-28-66z"/><path d="M28 64h44v7H28z"/>` },
  "U/g": { nom:"flèche", pluriel:"flèches", genre:"f", svg:`
    <path d="M47 30h6v58h-6z"/><path d="M50 4l16 30H34z"/><path d="M47 76l-12 16V78l12-10zM53 76l12 16V78L53 68z"/>` },
  "U/w": { nom:"comète", pluriel:"comètes", genre:"f", svg:`
    <path d="M66 14l6 17 18 1-14 11 5 18-15-10-15 10 5-18-14-11 18-1z"/>
    <path d="M44 48C32 58 20 70 8 90c16-10 30-18 42-30z"/><path d="M40 40C30 44 18 50 6 62c14-4 26-8 36-14z"/><path d="M58 60c-4 10-10 20-18 32 12-8 20-16 26-26z"/>` },
  "B/r": { nom:"marteau", pluriel:"marteaux", genre:"m", svg:`
    <path d="M20 12h44l8 8v14l-8 8H20z"/><path d="M40 42h10v50H40z"/>` },
  "B/g": { nom:"échelle", pluriel:"échelles", genre:"f", svg:`
    <path d="M24 4h8v92h-8zM68 4h8v92h-8z"/><path d="M32 14h36v7H32zM32 34h36v7H32zM32 54h36v7H32zM32 74h36v7H32z"/>` },
  "B/w": { nom:"couronne", pluriel:"couronnes", genre:"f", svg:`
    <path d="M10 34l18 16 22-30 22 30 18-16-6 44H16z"/><path d="M16 82h68v10H16z"/>
    <circle cx="10" cy="30" r="6"/><circle cx="50" cy="16" r="6"/><circle cx="90" cy="30" r="6"/>` },
  "B/u": { nom:"mont de trois coupeaux", pluriel:"monts de trois coupeaux", genre:"m", svg:`<path d="M28 68a22 22 0 0 1 44 0z" transform="translate(0 -2)"/><path d="M5 90a22 22 0 0 1 44 0z"/><path d="M51 90a22 22 0 0 1 44 0z"/>` },
  "R/g": { nom:"coupe", pluriel:"coupes", genre:"f", svg:`
    <path d="M18 10h64c0 28-12 44-28 48v20h14v10H32V78h14V58C30 54 18 38 18 10z"/>` },
  "R/w": { nom:"chaîne brisée", pluriel:"chaînes brisées", genre:"f", svg:`<g transform="translate(50 55) rotate(-32) scale(1.3) translate(-50 -55)"><path fill-rule="evenodd" d="M10 43h16a12 12 0 0 1 0 24h-16a12 12 0 0 1 0-24zm0 8a4 4 0 0 0 0 8h16a4 4 0 0 0 0-8z"/><path d="M35 52v-8a12 12 0 0 1 24 0v5h-8v-5a4 4 0 0 0-8 0v8z" transform="translate(-2 -9) rotate(-25 47 44)"/><path d="M41 58v8a12 12 0 0 0 24 0v-5h-8v5a4 4 0 0 1-8 0v-8z" transform="translate(4 9) rotate(-25 53 66)"/><path fill-rule="evenodd" d="M74 43h16a12 12 0 0 1 0 24h-16a12 12 0 0 1 0-24zm0 8a4 4 0 0 0 0 8h16a4 4 0 0 0 0-8z"/></g>` },
  "R/u": { nom:"fasce ondée", pluriel:"fasces ondées", genre:"f", svg:`
    <path d="M6 30c11-10 22-10 33 0s22 10 33 0 20-8 22-6v14c-2-2-11-4-22 6s-22 10-33 0-22-10-33 0z"/>
    <path d="M6 58c11-10 22-10 33 0s22 10 33 0 20-8 22-6v14c-2-2-11-4-22 6s-22 10-33 0-22-10-33 0z"/>` },
  "R/b": { nom:"flamme", pluriel:"flammes", genre:"f", svg:`
    <path d="M50 4c4 16 22 24 22 48 0 12-6 22-14 26 4-8 2-18-6-24 2 10-4 16-8 18-2-10-10-12-10-22-8 8-10 20-4 30C18 76 14 64 16 52c3-16 18-22 22-36 4 8 4 16 2 22 8-6 12-18 10-34z"/>` },
  "G/w": { nom:"rose", pluriel:"roses", genre:"f", svg:`
    <path d="M50 6c10 0 16 10 14 20 9-6 21-2 24 8s-4 18-14 20c8 6 8 20-2 24s-18-2-22-10c-4 8-12 14-22 10S14 60 22 54c-10-2-17-10-14-20s15-14 24-8C30 16 40 6 50 6z"/>
    <circle cx="50" cy="50" r="12" fill-opacity="0"/>` },
  "G/u": { nom:"soleil", pluriel:"soleils", genre:"m", svg:`
    <circle cx="50" cy="50" r="22"/>
    <path d="M50 2l5 20h-10zM50 98l-5-20h10zM2 50l20-5v10zM98 50l-20 5V45zM16 16l17 11-6 6zM84 84L67 73l6-6zM84 16L73 33l-6-6zM16 84l11-17 6 6z"/>` },
  "G/b": { nom:"pont", pluriel:"ponts", genre:"m", svg:`
    <path d="M4 44h92v10h-4v36H80c0-14-6-22-14-22s-14 8-14 22h-4c0-14-6-22-14-22s-14 8-14 22H8V54H4z"/>
    <path d="M4 36h92v6H4zM8 26h8v10H8zM26 26h8v10h-8zM46 26h8v10h-8zM66 26h8v10h-8zM84 26h8v10h-8z"/>` },
  "G/r": { nom:"anneaux entrelacés", pluriel:"anneaux entrelacés", genre:"m", svg:`
    <path fill-rule="evenodd" d="M6 50a26 26 0 1 0 52 0 26 26 0 1 0-52 0zm10 0a16 16 0 1 1 32 0 16 16 0 1 1-32 0z"/>
    <path fill-rule="evenodd" d="M42 50a26 26 0 1 0 52 0 26 26 0 1 0-52 0zm10 0a16 16 0 1 1 32 0 16 16 0 1 1-32 0z"/>` }
};


  const EMAUX = { W: "argent", U: "azur", B: "sable", R: "gueules", G: "sinople" };
  const de = c => (/^[aeiouy]/.test(EMAUX[c]) ? "d'" : "de ") + EMAUX[c];
  const OR = "#E6B422", SABLE_TRAIT = "#1B2430";
  const ECU = "M20,20 H380 V250 C380,380 290,440 200,465 C110,440 20,380 20,250 Z";

  const un = m => m.genre === "f" ? "une" : "un";
  const accorde = (mot, genre, pluriel) => mot + (genre === "f" ? "e" : "") + (pluriel ? "s" : "");

  const EGALITE = 0.5;                        // écart (en points) en dessous duquel deux couleurs sont dites égales
  const FEMININS = new Set(["abeille", "colombe", "pieuvre", "chouette", "orque", "étoile de mer", "oie sauvage", "hirondelle", "grenouille", "grue", "fourmi", "tortue", "tortue de mer", "libellule", "mante religieuse", "pie", "poule aux œufs d'or", "cigogne", "baleine", "araignée", "panthère", "chauve-souris", "chenille", "licorne", "otarie", "lionne", "mangouste", "loutre"]);
  const article = a => (FEMININS.has(a) ? "une " : "un ") + a;

  /**
   * @param {Object} o
   *   code         code du profil (A.bc, AB.c, AB/e)
   *   scores       {W,U,B,R,G} en %
   *   temperaments les 20 tempéraments du plus proche au plus éloigné
   *   couleurs     {W:{couleur},…} teintes de la base
   *   devise       texte de la devise
   *   animal       (facultatif) animal-totem, annoncé en cimier
   *   id           suffixe unique pour les identifiants SVG
   *   noms         (facultatif) {code tempérament: nom} pour la lecture
   */
  function ecusson(o){
    const a = M.analyser(o.code), s = o.scores, T = o.temperaments, id = o.id || "e";
    const teinte = c => (o.couleurs?.[c]?.couleur) || { W:"#FFFFFF", U:"#0055FF", B:"#111111", R:"#F00000", G:"#00D900" }[c];
    const parScore = cs => [...cs].sort((x, y) => s[y] - s[x] || M.ORDRE.indexOf(x) - M.ORDRE.indexOf(y));
    const egales = (x, y) => Math.abs(s[x] - s[y]) < EGALITE;
    const dominante = parScore(M.ORDRE)[0];
    const lecture = [], defs = [], formes = [];
    let blason = "", zones = [];
    const rect = (x, y, w, h, c, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${teinte(c)}" ${extra}/>`;
    const trait = d => `<path d="${d}" stroke="${SABLE_TRAIT}" stroke-width="3" fill="none"/>`;

    const clair = c => c === "W" ? "rgba(27,36,48,.10)" : "rgba(255,255,255,.20)";
    const motif = c => { const idp = `diapre-${id}-${c}`;
      if (!defs.some(d => d.includes(idp))) defs.push(`<pattern id="${idp}" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M20 2 L38 20 L20 38 L2 20 Z M20 10 C26 16 26 24 20 30 C14 24 14 16 20 10 Z M0 0 L6 6 M40 0 L34 6 M0 40 L6 34 M40 40 L34 34"
            fill="none" stroke="${clair(c)}" stroke-width="1.6"/></pattern>`); return `url(#${idp})`; };
    const diapre = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${motif(c)}"/>`;



    // lignes de partition héraldiques, une par couleur de la pièce qui « mord » le champ
    const LIGNE = { W:"crénelé", U:"ondé", B:"denché", R:"flammé", G:"engrêlé" };
    const lig = (c, genre) => LIGNE[c] + (genre === "f" ? "e" : "");
    const morsure = (c, x) => { const A = 14, P = 44, t = ((x % P) + P) % P / P;
      switch (c){
        case "W": return t < .5 ? A : 0;
        case "U": return A / 2 * (1 - Math.cos(2 * Math.PI * t));
        case "B": return A * (1 - Math.abs(2 * t - 1));
        case "R": return A * Math.pow(1 - t, 1.7);
        default:  return A * Math.sqrt(Math.max(0, 1 - Math.pow(2 * t - 1, 2)));
      } };
    // pièce de couleur c qui mord vers le haut (vers = -1) ou vers le bas (vers = +1), de x0 à x1, sur la ligne y
    function ligne(c, y, x0, x1, vers){
      const pts = []; for (let x = x0; x <= x1; x += 2) pts.push([x, y + vers * morsure(c, x)]);
      const bord = pts.map(([x, yy], i) => `${i ? "L" : "M"}${x} ${yy.toFixed(1)}`).join("");
      const fond = vers < 0 ? `M${x0} ${y + 4}` : `M${x0} ${y - 4}`;
      formes.push(`<path d="${fond}${bord.replace(/^M/, "L")}L${x1} ${y + (vers < 0 ? 4 : -4)}Z" fill="${teinte(c)}"/>`,
                  `<path d="${bord}" stroke="${SABLE_TRAIT}" stroke-width="3" fill="none"/>`);
    }


    // forme du champ des deux principales, donnée par la couleur « clé » (secondaire du spécialiste, absente du généraliste)
    const FORMES = { W:"écartelé", U:"tranché", B:"taillé", R:"chapé", G:"chaussé" };
    let geo = null;                                   // geo(x, y) -> couleur du champ en ce point
    // contour intérieur de l'écu : demi-largeur à la hauteur y
    const COURBE = (() => { const p = []; for (let i = 0; i <= 60; i++){ const t = i / 60, u = 1 - t;
      p.push([u*u*u*380 + 3*u*u*t*380 + 3*u*t*t*290 + t*t*t*200, u*u*u*250 + 3*u*u*t*380 + 3*u*t*t*440 + t*t*t*465]); } return p; })();
    const demiLargeur = y => { if (y < 250) return 180; for (let i = 1; i < COURBE.length; i++) if (COURBE[i][1] >= y){
      const [x0, y0] = COURBE[i - 1], [x1, y1] = COURBE[i]; return (x0 + (x1 - x0) * (y - y0) / ((y1 - y0) || 1)) - 200; } return 0; };
    const dansEcu = (x, y, m) => y > 20 + m && y < 465 - m && Math.abs(x - 200) < demiLargeur(y) - m;
    const poly = (pts, c) => `<polygon points="${pts.map(p => p.join(",")).join(" ")}" fill="${teinte(c)}"/>`;
    const polyDiapre = (pts, c) => `<polygon points="${pts.map(p => p.join(",")).join(" ")}" fill="${motif(c)}"/>`;
    function champForme(cle, A1, A2, p, xs, Y0, Y1, eg){
      const f = FORMES[cle], H = Y1 - Y0, B0 = Y0 - 30, B1 = Y1 + 30;     // on déborde : l'écu découpe
      const pose = (pts, c, diap) => { formes.push(poly(pts, c)); if (diap) formes.push(polyDiapre(pts, c)); };
      if (f === "écartelé"){
        const ym = (Y0 + Y1) / 2;
        pose([[-50, B0], [xs, B0], [xs, ym], [-50, ym]], A1, true); pose([[xs, B0], [450, B0], [450, ym], [xs, ym]], A2, eg);
        pose([[-50, ym], [xs, ym], [xs, B1], [-50, B1]], A2, eg);   pose([[xs, ym], [450, ym], [450, B1], [xs, B1]], A1, true);
        formes.push(trait(`M${xs} ${B0}V${B1}M0 ${ym}H400`));
        geo = (x, y) => (x < xs) === (y < ym) ? A1 : A2;
      } else if (f === "tranché" || f === "taillé"){
        const D = 120 * (H / 440), sens = f === "tranché" ? 1 : -1;      // tranché : de la dextre du chef vers la senestre de la pointe
        const xA = xs - sens * D, xB = xs + sens * D, k = (xB - xA) / H, xAt = y => xA + k * (y - Y0);
        pose([[-200, B0], [xAt(B0), B0], [xAt(B1), B1], [-200, B1]], A1, true);
        pose([[xAt(B0), B0], [600, B0], [600, B1], [xAt(B1), B1]], A2, eg);
        formes.push(trait(`M${xAt(B0)} ${B0}L${xAt(B1)} ${B1}`));
        geo = (x, y) => x < xAt(y) ? A1 : A2;
      } else {                                                           // chapé (pointe en haut) ou chaussé (pointe en bas)
        const haut = f === "chapé", ya = haut ? Y0 : Y1, yb = haut ? Y1 : Y0;
        // largeur réglée pour que la part visible de A1, dans l'écu, soit exactement sa part p
        const dedans = (Wt, x, y) => { const t = (y - ya) / (yb - ya); return t > 0 && Math.abs(x - 200) < Wt * t; };
        const part1 = Wt => { let n = 0, k = 0; for (let y = Y0 + 4; y < Y1; y += 8) for (let x = 24; x < 380; x += 8) if (dansEcu(x, y, 0)){ n++; if (dedans(Wt, x, y)) k++; } return n ? k / n : .5; };
        let lo = 10, hi = 900; for (let it = 0; it < 22; it++){ const mid = (lo + hi) / 2; if (part1(mid) < p) lo = mid; else hi = mid; }
        const W = (lo + hi) / 2;
        const ext = (yb - ya) * 1.0, yb2 = yb + (haut ? 30 : -30), Wb = W * (yb2 - ya) / (yb - ya);
        pose([[-200, B0], [600, B0], [600, B1], [-200, B1]], A2, eg);
        pose([[200, ya], [200 - Wb, yb2], [200 + Wb, yb2]], A1, true);
        formes.push(trait(`M${200 - Wb} ${yb2}L200 ${ya}L${200 + Wb} ${yb2}`));
        geo = (x, y) => { const t = (y - ya) / (yb - ya); return t > 0 && Math.abs(x - 200) < W * t ? A1 : A2; };
      }
      return f;
    }
    // places des deux meubles : le plus grand carré possible sur une seule couleur, n° 1 sur A1 (en haut), n° 2 sur A2
    function places(A1, A2, yh, yb, m){
      const PAS = 6, NX = Math.ceil(400 / PAS) + 1, NY = Math.ceil(480 / PAS) + 1, carte = new Array(NX * NY);   // carte des couleurs, calculée une fois
      for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++){ const X = i * PAS, Y = j * PAS;
        carte[j * NX + i] = (Y < yh || Y > yb || !dansEcu(X, Y, m)) ? null : geo(X, Y); }
      const lit = (X, Y) => { const i = Math.round(X / PAS), j = Math.round(Y / PAS); return (i < 0 || j < 0 || i >= NX || j >= NY) ? null : carte[j * NX + i]; };
      const ok = (x, y, r, c) => { for (let a = -1; a <= 1; a += .5) for (let b = -1; b <= 1; b += .5) if (lit(x + a * r, y + b * r) !== c) return false; return true; };
      const best = (c, evite, basPrefere) => { let r0 = null;
        for (let y = yh + 10; y <= yb - 10; y += 6) for (let x = 40; x <= 360; x += 6){
          if (geo(x, y) !== c) continue; let r = 10; while (r < 70 && ok(x, y, r + 3, c)) r += 3; if (!ok(x, y, r, c)) continue;
          if (evite && Math.abs(x - evite[0]) < r + evite[2] + 8 && Math.abs(y - evite[1]) < r + evite[2] + 8) continue;
          const score = r * 10 - (basPrefere ? -y : y) * .05;
          if (!r0 || score > r0.s) r0 = { s: score, p: [x, y, r] }; }
        return r0?.p; };
      const p1 = best(A1, null, false) || [150, (yh + yb) / 2, 40];
      let p2 = best(A2, p1, true);
      if (!p2 || p2[2] < 30){ const q = best(A1, p1, true); if (q && (!p2 || q[2] > p2[2])) p2 = q; }   // trop peu de place : le n° 2 rejoint le n° 1
      p2 = p2 || [250, (yh + yb) / 2 + 40, 34];
      return [p1, p2];
    }


    // pièce des radicaux, partie b1|b2 sur l'axe, aux bords dentelés selon chaque couleur ; sa forme dit la couleur cachée
    const PIECES = { W:["chef","un"], U:["bande","une"], B:["barre","une"], R:["chevron","un"], G:["pal","un"] };
    function dente(pts, sgn, coul){                       // ré-échantillonne une ligne brisée et la décale selon la morsure
      const out = []; let s0 = 0;
      for (let i = 1; i < pts.length; i++){
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L * sgn, ny = (x1 - x0) / L * sgn;
        for (let t = 0; t <= L; t += 2){ const x = x0 + (x1 - x0) * t / L, y = y0 + (y1 - y0) * t / L, m = coul ? morsure(coul(x), s0 + t) : 0; out.push([x + nx * m, y + ny * m]); }
        s0 += L; }
      return out;
    }
    function dansPoly(P, x, y){ let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++){ const [xi, yi] = P[i], [xj, yj] = P[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
    function pieceRadicale(d, b1, b2, A, xs, ep){
      const [nom, art] = PIECES[d], coul = x => x < xs ? b1 : b2;
      if (nom === "pal"){                                 // pal : bande verticale au centre, la tige qui pousse
        const l = Math.round(ep * .5), gx = 200 - l, dx = 200 + l;
        const g = dente([[gx, -60], [gx, 560]], 1, coul), d2 = dente([[dx, -60], [dx, 560]], -1, coul);
        const P = [...g, ...[...d2].reverse()].map(([x, y]) => [+x.toFixed(1), +y.toFixed(1)]), pts = P.map(p => p.join(",")).join(" ");
        defs.push(`<clipPath id="pg2-${id}"><rect x="-50" y="-100" width="${xs + 50}" height="700"/></clipPath><clipPath id="pd2-${id}"><rect x="${xs}" y="-100" width="${450 - xs}" height="700"/></clipPath><clipPath id="pc-${id}"><polygon points="${pts}"/></clipPath>`);
        formes.push(`<polygon points="${pts}" fill="${teinte(b1)}" clip-path="url(#pg2-${id})"/>`, `<polygon points="${pts}" fill="${teinte(b2)}" clip-path="url(#pd2-${id})"/>`,
          `<path d="M${xs} -60V560" stroke="${SABLE_TRAIT}" stroke-width="3" clip-path="url(#pc-${id})"/>`,
          ...[g, d2].map(e => `<polyline points="${e.map(p => p.map(v => v.toFixed(1)).join(",")).join(" ")}" stroke="${SABLE_TRAIT}" stroke-width="3" fill="none"/>`));
        geo = (x, y) => dansPoly(P, x, y) ? coul(x) : A;
        return { nom, art };
      }
      let haut, bas;                                      // bords supérieur et inférieur (de gauche à droite)
      const decale = (pts, dy) => pts.map(([x, y]) => [x, y + dy]);
      if (nom === "chef"){ haut = [[-40, -60], [440, -60]]; bas = [[-40, 20 + ep], [440, 20 + ep]]; }
      else if (nom === "champagne"){ haut = [[-40, 465 - ep], [440, 465 - ep]]; bas = [[-40, 560], [440, 560]]; }
      else {
        const axeC = nom === "bande" ? [[-40, 20], [440, 470]] : nom === "barre" ? [[-40, 470], [440, 20]] : [[-40, 470], [200, 130], [440, 470]];
        const pente = Math.abs((axeC[1][1] - axeC[0][1]) / (axeC[1][0] - axeC[0][0])), dy = ep / 2 * Math.sqrt(1 + pente * pente);
        haut = decale(axeC, -dy); bas = decale(axeC, dy);
      }
      const dh = nom === "chef" ? haut : dente(haut, -1, coul), db = nom === "champagne" ? bas : dente(bas, 1, coul);
      // sgn : -1 vers le haut sur un bord orienté de gauche à droite (normale (−dy, dx))
      const P = [...dh, ...[...db].reverse()].map(([x, y]) => [+x.toFixed(1), +y.toFixed(1)]);
      const pts = P.map(p => p.join(",")).join(" ");
      defs.push(`<clipPath id="pg2-${id}"><rect x="-50" y="-100" width="${xs + 50}" height="700"/></clipPath><clipPath id="pd2-${id}"><rect x="${xs}" y="-100" width="${450 - xs}" height="700"/></clipPath><clipPath id="pc-${id}"><polygon points="${pts}"/></clipPath>`);
      formes.push(`<polygon points="${pts}" fill="${teinte(b1)}" clip-path="url(#pg2-${id})"/>`, `<polygon points="${pts}" fill="${teinte(b2)}" clip-path="url(#pd2-${id})"/>`,
        `<path d="M${xs} -60V560" stroke="${SABLE_TRAIT}" stroke-width="3" clip-path="url(#pc-${id})"/>`);
      if (nom !== "chef") formes.push(`<polyline points="${dh.map(p => p.map(v => v.toFixed(1)).join(",")).join(" ")}" stroke="${SABLE_TRAIT}" stroke-width="3" fill="none"/>`);
      if (nom !== "champagne") formes.push(`<polyline points="${db.map(p => p.map(v => v.toFixed(1)).join(",")).join(" ")}" stroke="${SABLE_TRAIT}" stroke-width="3" fill="none"/>`);
      geo = (x, y) => dansPoly(P, x, y) ? coul(x) : A;
      return { nom, art };
    }

    let pos;                                   // positions des meubles : t1, t2, t19, t20
    // part de la plus forte de deux couleurs, écart amplifié (×3) pour qu'il se voie, bornée à 15–85 %
    const PARTAGE_AMPLI = 3;
    const partage = (x, y) => { const t = s[x] + s[y]; if (!t) return .5; return Math.max(.15, Math.min(.85, .5 + PARTAGE_AMPLI * (s[x] / t - .5))); };
    // chef parti à proportion (radical : secondaires ; généraliste : couleurs moyennes)
    let axe = null;                           // ligne de partage commune à tout l'écu (null : pas encore fixée)
    // bordure des couleurs les plus faibles, largeur proportionnelle à chaque score
    const larg = c => Math.max(4, Math.min(30, s[c] * .6));
    // test (radicaux) : bordure d'épaisseur constante, partagée à proportion des scores, comme le chef
    function bordurePartage(cs){
      const [e1, e2] = parScore(cs), eg = egales(e1, e2), W = 18;
      const part = axe === null ? partage(e1, e2) : (axe - 20) / 360, xs = axe === null ? Math.round(20 + 360 * part) : axe;
      defs.push(`<clipPath id="pg-${id}"><rect x="0" y="0" width="${xs}" height="480"/></clipPath><clipPath id="pd-${id}"><rect x="${xs}" y="0" width="${400 - xs}" height="480"/></clipPath>`);
      formes.push(`<path d="${ECU}" fill="none" stroke="${teinte(e1)}" stroke-width="${2 * W}" clip-path="url(#pg-${id})"/>`,
                  `<path d="${ECU}" fill="none" stroke="${teinte(e2)}" stroke-width="${2 * W}" clip-path="url(#pd-${id})"/>`);
      return { texte: `à la bordure partie ${de(e1)} et ${de(e2)}`,
        lecture: `La bordure porte les deux couleurs absentes, ${e1} (${pct(s[e1])}) à dextre et ${e2} (${pct(s[e2])}) à senestre, partagée sur le même axe que le reste de l'écu.` };
    }

    // 1.9 : quatre couleurs montrées, la cinquième (la moins signifiante) se lit dans la forme
    //   radical A.bc : champ A, pièce b|c, bordure e ; cachée : d (4e)     forme de la pièce selon d
    //   spécialiste AB.c : champ A|B, bordure d|e ; cachée : c (3e)         forme du champ selon c
    //   généraliste AB/e : champ A|B, chef c, bordure e ; cachée : d (4e)   forme du champ selon d
    const BORD = 18;
    // départage des couleurs à égalité, par la roue (W U B R G) : dist(a, b) = pas de a vers b dans le sens horaire
    const dist = (x, y) => (M.ORDRE.indexOf(y) - M.ORDRE.indexOf(x) + 5) % 5;
    const bordureUne = c => formes.push(`<path d="${ECU}" fill="none" stroke="${teinte(c)}" stroke-width="${2 * BORD}"/>`);
    if (a.famille === "radical"){
      const A = a.principales, [b1, b2] = parScore(a.secondaires);
      let [d, e] = parScore(a.absentes);
      if (egales(d, e) && dist(e, d) > dist(d, e)) [d, e] = [e, d];   // à égalité, on cache celle qui suit l'autre sur la roue
      formes.push(rect(0, 0, 400, 480, A), diapre(0, 0, 400, 480, A));
      const ep = Math.round(Math.max(48, Math.min(150, 2.2 * (s[b1] + s[b2]) / 2)));
      const part = partage(b1, b2), xs = Math.round(20 + 360 * part); axe = xs;
      const piece = pieceRadicale(d, b1, b2, A, xs, ep);
      bordureUne(e);
      zones = [{ y0: 0, y1: 480, g: A, d: A }];
      const gp = piece.art === "une" ? "f" : "m";
      blason = `${cap(de(A))} diapré, à ${piece.art} ${piece.nom} ${accorde("parti", gp)} ${de(b1)} ${lig(b1, gp)} et ${de(b2)} ${lig(b2, gp)}, à la bordure ${de(e)}`;
      lecture.push(`Famille radicale : une couleur domine, deux autres la traversent, une l'entoure.`,
        `Le champ ${de(A)} porte la couleur principale, ${A} (${pct(s[A])}).`,
        `${cap(piece.art === "une" ? "la" : "le")} ${piece.nom} porte les deux couleurs secondaires, ${b1} (${pct(s[b1])}) et ${b2} (${pct(s[b2])}), partagé${piece.art === "une" ? "e" : ""} à proportion ; son épaisseur suit leur force, et chaque bord suit sa couleur (${lig(b1, "m")}, ${lig(b2, "m")}).`,
        `Sa forme dit la couleur qu'on ne peint pas, ${d} (${pct(s[d])}), la quatrième : ${piece.nom} pour ${EMAUX[d]}.`,
        `La bordure ${de(e)} porte la couleur la plus absente, ${e} (${pct(s[e])}).`);
      pos = { deux: true, haut: 30, bas: 440, places: places(A, A, 34, 440, 24) };
    } else {
      let [A1, A2] = parScore(a.principales);
      if (egales(A1, A2) && dist(A1, A2) < dist(A2, A1)) [A1, A2] = [A2, A1];   // à égalité, celle qui suit l'autre sur la roue prend la place d'honneur
      const part = partage(A1, A2), xs = Math.round(20 + 360 * part), eg = egales(A1, A2); axe = xs;
      if (a.famille === "specialiste"){
        const c = a.secondaires;
        const forme = champForme(c, A1, A2, part, xs, 20, 465, eg);
        const bo = bordurePartage(a.absentes.split(""));
        zones = [{ y0: 0, y1: 480, g: A1, d: A2, x: xs }];
        blason = `${cap(forme)} ${de(A1)} diapré et ${de(A2)}${eg ? " diapré" : ""}, ${bo.texte}`;
        lecture.push(`Famille spécialiste : deux moteurs, cernés par ce qui manque.`,
          `Le champ ${forme} porte les deux couleurs principales, ${A1} (${pct(s[A1])}) et ${A2} (${pct(s[A2])}) ; sa forme dit la couleur qu'on ne montre pas, ${c} (${pct(s[c])}).`, bo.lecture);
        pos = { deux: true, haut: 30, bas: 440, places: places(A1, A2, 34, 440, 24) };
      } else {
        let [c1, c2] = parScore(a.secondaires); const e = a.absentes;
        if (egales(c1, c2) && dist(e, c1) < dist(e, c2)) [c1, c2] = [c2, c1];   // à égalité, on cache celle qui suit l'absente sur la roue
        const h = Math.round(Math.max(48, Math.min(180, 2.4 * s[c1])));
        const forme = champForme(c2, A1, A2, part, xs, 20 + h, 465, eg);
        formes.push(rect(0, 0, 400, 20 + h, c1)); ligne(c1, 20 + h, 0, 400, +1);
        bordureUne(e);
        zones = [{ y0: 0, y1: 20 + h, g: c1, d: c1 }, { y0: 20 + h, y1: 480, g: A1, d: A2, x: xs }];
        blason = `${cap(forme)} ${de(A1)} diapré et ${de(A2)}${eg ? " diapré" : ""}, au chef ${de(c1)} ${LIGNE[c1]}, à la bordure ${de(e)}`;
        lecture.push(`Famille généraliste : un large éventail, cerné par un seul manque.`,
          `Le champ ${forme} porte les deux couleurs principales, ${A1} (${pct(s[A1])}) et ${A2} (${pct(s[A2])}) ; sa forme dit la couleur qu'on ne montre pas, ${c2} (${pct(s[c2])}).`,
          `Le chef ${de(c1)} porte la troisième couleur, ${c1} (${pct(s[c1])}).`,
          `La bordure ${de(e)} est la couleur absente, ${e} (${pct(s[e])}).`);
        pos = { deux: true, haut: 20 + h + 6, bas: 440, places: places(A1, A2, 20 + h + 22, 440, 24) };
      }
    }

    // --- meubles : quatre, dont la taille dit le rang et l'intensité
    const t1 = T[0], t2 = T[1], t19 = T[18], t20 = T[19];
    const intensite = t => { const [x, y] = t.split("/"); return (s[x] + (100 - s[y.toUpperCase()])) / 200; };   // 0 à 1
    const borne = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
    const tailles = {
      t1: borne(78 + 90 * (intensite(t1) - .5), 74, 118),
      t2: borne(50 + 60 * (intensite(t2) - .5), 44, 70),
      t20: borne(52 + 90 * (.5 - intensite(t20)), 48, 80),
      t19: borne(36 + 50 * (.5 - intensite(t19)), 32, 52)
    };
    const emailSous0 = (x, y) => { const z = zones.find(z => y >= z.y0 && y < z.y1) || zones[zones.length - 1]; return x < (z.x ?? 200) ? z.g : z.d; };
    const emailSous = (x, y) => (geo && pos.places && y >= pos.haut - 6 && y <= pos.bas + 30) ? geo(x, y) : emailSous0(x, y);
    const metal = (x, y) => emailSous(x, y) === "W" ? "sable" : "or";
    const poser = (t, [x, y], taille, renverse) => {
      const m = MEUBLES[t], met = metal(x, y);
      const fill = met === "or" ? OR : "#1B2430", tr = met === "or" ? SABLE_TRAIT : OR, k = taille / 100;
      const img = o.images?.meubles?.[t];
      if (img){                                   // image de la bibliothèque (512 × 512, couleur héritée)
        const ki = taille / 512;
        return { met, svg: `<g transform="translate(${x - taille / 2} ${y - taille / 2}) scale(${ki.toFixed(4)})${renverse ? " rotate(180 256 256)" : ""}" color="${fill}" fill="${fill}" stroke="${tr}" stroke-width="${(1.6 / ki).toFixed(1)}" paint-order="stroke" stroke-linejoin="round"><title>${t} — ${m.nom}</title>${img}</g>` };
      }
      return { met, svg: `<g transform="translate(${x - taille / 2} ${y - taille / 2}) scale(${k})${renverse ? " rotate(180 50 50)" : ""}" fill="${fill}" stroke="${tr}" stroke-width="${(2.6 / k * 0.5).toFixed(2)}" stroke-linejoin="round"><title>${t} — ${m.nom}</title>${m.svg}</g>` };
    };
    let haut, bas;
    if (pos.deux){
      // taille strictement proportionnelle à l'intensité (même coefficient pour les deux) ; on réduit tout si la place manque
      // taille proportionnelle à l'intensité, écart amplifié (×3) pour que la hiérarchie se voie
      const AMPLI = 3, i1 = intensite(t1), i2 = intensite(t2), im = (i1 + i2) / 2 || .5;
      let s1 = 100 * (1 + AMPLI * (i1 - im) / im), s2 = 100 * (1 + AMPLI * (i2 - im) / im);
      const dispo = pos.bas - pos.haut, f = Math.min(1, (dispo - 18) / (s1 + s2)); s1 *= f; s2 *= f;
      const jeu = (dispo - s1 - s2) / 3;
      const y1 = pos.haut + jeu + s1 / 2, y2 = pos.haut + 2 * jeu + s1 + s2 / 2;
      let x1, x2, yy2 = y2;
      if (pos.places){
        const [[px1, py1, r1], [px2, py2, r2]] = pos.places;
        s1 = Math.min(s1, 2 * r1); s2 = Math.min(s2, 2 * r2); x1 = px1; x2 = px2;
        tailles.t1 = s1; tailles.t2 = s2;
        haut = [poser(t1, [px1, py1], s1), poser(t2, [px2, py2], s2)]; bas = [];
      } else if (pos.xs){
        // champ parti : chaque meuble repose sur une seule couleur, le n° 1 sur la plus forte (dextre), le n° 2 sur l'autre
        const ld = pos.xs - 38, ls = 362 - pos.xs;
        if (ls >= 80 && ld >= 80){
          x1 = Math.max(110, Math.min(200, 38 + ld / 2)); x2 = Math.max(pos.xs + 12 + s2 / 2, Math.min(272, pos.xs + ls / 2));
          s1 = Math.min(s1, ld - 16); s2 = Math.min(s2, ls - 16);
          if (x2 + s2 / 2 > 330) s2 = Math.max(40, 2 * (330 - x2));
          yy2 = Math.min(y2, 352);
        } else { x1 = 200 - 34; x2 = 200 + 34; }       // partage trop inégal : bande centrée
      } else { const dx = o.decalage === false ? 0 : 34; x1 = 200 - dx; x2 = 200 + dx; }
      if (!pos.places){ tailles.t1 = s1; tailles.t2 = s2;
      haut = [poser(t1, [x1, y1], s1), poser(t2, [x2, yy2], s2)]; bas = []; }
    } else {
      haut = [poser(t1, pos.t1, tailles.t1), poser(t2, pos.t2, tailles.t2)];
      bas = [poser(t20, pos.t20, tailles.t20, true), poser(t19, pos.t19, tailles.t19, true)];
    }
    const nomMetal = g => { const ms = [...new Set(g.map(x => x.met))]; return ms.length === 1 ? (ms[0] === "or" ? "d'or" : "de sable") : "d'or, et de sable sur l'argent"; };
    const M1 = MEUBLES[t1], M2 = MEUBLES[t2], M19 = MEUBLES[t19], M20 = MEUBLES[t20];
    const lieuBas = a.famille === "specialiste" ? "en champagne" : "en pointe";
    if (pos.places) blason += ` ; ${un(M1)} ${M1.nom} et ${un(M2)} ${M2.nom} ${nomMetal(haut)}.`;
    else if (pos.deux) blason += ` ; ${un(M1)} ${M1.nom} et ${un(M2)} ${M2.nom} ${nomMetal(haut)}, ${accorde("posé", M1.genre === "f" && M2.genre === "f" ? "f" : "m", true)} en bande.`;
    else blason += ` ; ${un(M1)} ${M1.nom} en cœur, ${accorde("accompagné", M1.genre)} en chef ${M2.genre === "f" ? "d'une" : "d'un"} ${M2.nom}, le tout ${nomMetal(haut)} ;`
            + ` ${lieuBas}, ${un(M20)} ${M20.nom} et ${un(M19)} ${M19.nom}, ${accorde("renversé", M20.genre === "f" && M19.genre === "f" ? "f" : "m", true)} et ${nomMetal(bas)}.`;
    const nt = t => o.noms?.[t] ? `${t} « ${o.noms[t]} »` : t;
    const pc = v => Math.round(v * 100) + " %";
    if (pos.places) lecture.push(`Deux meubles, chacun posé sur une seule couleur, là où la place est la plus grande. Le plus haut, sur la principale : ${un(M1)} ${M1.nom}, pour le tempérament le plus proche, ${nt(t1)} (intensité ${pc(intensite(t1))}). L'autre : ${un(M2)} ${M2.nom}, pour le deuxième, ${nt(t2)} (intensité ${pc(intensite(t2))}).`,
      `La taille des deux meubles suit l'intensité de leur tempérament, avec un écart amplifié pour que la hiérarchie se voie.`,
      `Tous les meubles sont d'or, ou de sable lorsqu'ils reposent sur l'argent : on ne pose jamais métal sur métal ni couleur sur couleur.`);
    else if (pos.deux) lecture.push(`Deux meubles posés en bande, de la dextre du chef vers la senestre de la pointe, la diagonale noble de l'héraldique. En haut : ${un(M1)} ${M1.nom}, pour le tempérament le plus proche, ${nt(t1)} (intensité ${pc(intensite(t1))}). En bas : ${un(M2)} ${M2.nom}, pour le deuxième, ${nt(t2)} (intensité ${pc(intensite(t2))}).`,
      `La taille des deux meubles suit l'intensité de leur tempérament, avec un écart amplifié pour que la hiérarchie se voie.`,
      `Tous les meubles sont d'or, ou de sable lorsqu'ils reposent sur l'argent : on ne pose jamais métal sur métal ni couleur sur couleur.`);
    else lecture.push(`En cœur, le grand meuble : ${un(M1)} ${M1.nom}, pour le tempérament le plus proche, ${nt(t1)} (intensité ${pc(intensite(t1))}). En chef, plus petit : ${un(M2)} ${M2.nom}, pour le deuxième, ${nt(t2)}.`,
      `${cap(lieuBas)}, renversés, car la figure renversée dit le contraire : ${un(M20)} ${M20.nom} pour le plus éloigné, ${nt(t20)}, et ${un(M19)} ${M19.nom}, plus petit, pour l'avant-dernier, ${nt(t19)}.`,
      `La taille de chaque meuble suit l'intensité du tempérament : plus il est marqué, plus le meuble est grand.`,
      `Tous les meubles sont d'or, ou de sable lorsqu'ils reposent sur l'argent : on ne pose jamais métal sur métal ni couleur sur couleur.`);
    if (o.animal){ blason += ` Cimier : ${article(o.animal)}.`; lecture.push(`Le cimier, au-dessus de l'écu, porte l'animal-totem du profil : ${article(o.animal)}.`); }
    if (o.devise) blason += ` Devise : « ${o.devise} ».`;

    let cimier = "";
    if (o.animal && o.images?.animal){
      const coul = parScore(M.ORDRE)[0], segs = 6, lw = 200, x0 = 100, y0 = -2;
      let torse = "";
      for (let i = 0; i < segs; i++) torse += `<rect x="${x0 + i * lw / segs}" y="${y0}" width="${lw / segs}" height="16" fill="${i % 2 ? teinte(coul) : OR}"/>`;
      cimier = `<g><title>Cimier : ${article(o.animal)}</title>
        <g transform="translate(130 -146) scale(${(140 / 512).toFixed(4)})" color="${OR}" fill="${OR}" stroke="${SABLE_TRAIT}" stroke-width="${(1.6 / (140 / 512)).toFixed(1)}" paint-order="stroke" stroke-linejoin="round">${o.images.animal}</g>
        <g clip-path="url(#torse-${id})">${torse}</g><rect x="${x0}" y="${y0}" width="${lw}" height="16" rx="8" fill="none" stroke="${SABLE_TRAIT}" stroke-width="2"/>
        <clipPath id="torse-${id}"><rect x="${x0}" y="${y0}" width="${lw}" height="16" rx="8"/></clipPath></g>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VUE}" width="400" height="${HAUTEUR}">
${cimier}
<defs><clipPath id="ecu-${id}"><path d="${ECU}"/></clipPath>
<linearGradient id="lustre-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
${defs.join("\n")}</defs>
<g clip-path="url(#ecu-${id})">${formes.join("\n")}
${haut.map(x => x.svg).join("\n")}
${bas.map(x => x.svg).join("\n")}
<rect x="0" y="0" width="400" height="480" fill="url(#lustre-${id})"/></g>
<path d="${ECU}" fill="none" stroke="${SABLE_TRAIT}" stroke-width="5"/>
${o.devise ? listel(o.devise, id) : ""}
</svg>`;
    return { svg, blason, lecture };
  }

  const HAUTEUR = 730, VUE = "0 -170 400 730";      // place pour le cimier au-dessus de l'écu
  function listel(devise, id){
    const t = devise.length > 30 ? 13 : devise.length > 22 ? 15 : 17;      // Cinzel : capitales, plus larges
    return `<path d="M8 496 L34 486 L34 532 L8 542 L21 519 Z" fill="#C9A227" stroke="#1B2430" stroke-width="1.5"/>
<path d="M392 496 L366 486 L366 532 L392 542 L379 519 Z" fill="#C9A227" stroke="#1B2430" stroke-width="1.5"/>
<path d="M34 486 Q200 466 366 486 L366 532 Q200 512 34 532 Z" fill="#FFF6DA" stroke="#1B2430" stroke-width="1.5"/>
<path id="courbe-${id}" d="M44 515 Q200 495 356 515" fill="none"/>
<text font-family="Cinzel, Georgia, 'Times New Roman', serif" font-weight="600" font-size="${t}" fill="#1B2430" text-anchor="middle"><textPath href="#courbe-${id}" startOffset="50%">${esc(devise)}</textPath></text>`;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const pct = x => String(Math.round(x * 10) / 10).replace(".", ",") + " %";

  const GRAMMAIRE = [
    ["Les émaux", "Chaque couleur du modèle prend son émail héraldique : argent (W), azur (U), sable (B), gueules (R), sinople (G). L'or, métal libre, est celui de Flamme Bleue : il porte les meubles."],
    ["La règle des émaux", "On ne pose jamais métal sur métal ni couleur sur couleur. Juxtaposer reste permis : les partitions peuvent donc unir deux couleurs. Les meubles sont d'or, ou de sable sur l'argent."],
    ["Quatre couleurs, et une forme", "Chaque écu peint quatre des cinq couleurs. La cinquième, la moins signifiante pour le profil, ne se peint pas : elle se lit dans la forme, celle de la pièce chez un radical, celle du champ chez un spécialiste ou un généraliste. Rien n'est perdu : quatre couleurs connues désignent la cinquième."],
    ["Le côté d'honneur", "La dextre (à gauche pour qui regarde l'écu) est la place d'honneur : la couleur la plus forte s'y place, ou au centre pour un chapé ou un chaussé."],
    ["Radical (A.bc)", "Champ plein de la principale ; une pièce partie des deux secondaires ; bordure de la plus faible. La 4e couleur, cachée, donne la forme de la pièce : chef pour l'argent, bande pour l'azur, barre pour le sable, chevron pour les gueules, pal pour le sinople."],
    ["Spécialiste (AB.c)", "Champ des deux principales ; bordure partie des deux absentes. La 3e couleur, cachée car elle est dans la moyenne, donne la forme du champ : écartelé pour l'argent, tranché pour l'azur, taillé pour le sable, chapé pour les gueules, chaussé pour le sinople."],
    ["Généraliste (AB/e)", "Champ des deux principales ; chef de la 3e couleur ; bordure de l'absente. La 4e couleur, cachée, donne la forme du champ, selon le même code que les spécialistes."],
    ["Les lignes de partition", "Le bord d'une pièce suit sa couleur : l'argent est crénelé, l'azur ondé, le sable denché, les gueules flammées, le sinople engrêlé."],
    ["Les proportions", "La hauteur d'un chef ou l'épaisseur d'une pièce suit la force de ses couleurs. Chaque partage suit le rapport des deux couleurs, avec un écart amplifié trois fois pour être visible ; pour un chapé ou un chaussé, la surface visible de chaque couleur respecte sa part. L'écart à l'héraldique orthodoxe est voulu : l'écu dit les scores."],
    ["Les égalités", "Quand deux couleurs sont à égalité, la roue (W, U, B, R, G) départage : celle qui suit l'autre, par le plus court chemin, prend la place d'honneur ou se cache. Chez un généraliste, on cache la couleur moyenne qui suit l'absente."],
    ["Profil frontière", "Écus accolés : un écu par profil, côte à côte, comme on réunit deux lignées."],
    ["Le diapré", "Arabesques claires sur la couleur dominante (sur les deux principales en cas d'égalité)."],
    ["Les meubles", "Deux meubles tirés des tempéraments, chacun posé sur une seule couleur, là où la place est la plus grande : le n° 1 sur la principale, le n° 2 sur la seconde (ou sur la même, si la place manque). Leur taille suit l'intensité du tempérament, écart amplifié."],
    ["Le cimier", "L'animal-totem du profil, au-dessus de l'écu."],
    ["La devise", "Portée sur un listel sous l'écu."]
  ];

  return { VERSION, MEUBLES, EMAUX, GRAMMAIRE, HAUTEUR, VUE, ecusson };
});
