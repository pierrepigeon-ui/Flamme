/* =====================================================================
   FLAMME — blason : transposition d'un profil en écusson héraldique
   Grammaire validée le 30/09/2026 (voir GRAMMAIRE plus bas).
   Utilisable dans le navigateur (window.FLAMME_BLASON) ou sous Node.
   Dépend de FLAMME_MOTEUR (analyser, ordonner).
   ===================================================================== */
(function (racine, fabrique) {
  const b = fabrique(typeof module === "object" && module.exports ? require("./flamme_moteur.js") : racine.FLAMME_MOTEUR);
  if (typeof module === "object" && module.exports) module.exports = b; else racine.FLAMME_BLASON = b;
})(typeof self !== "undefined" ? self : this, function (M) {
  "use strict";
  const VERSION = { numero: "1.8", date: "2026-10-01 23:43" };

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
  const SEUIL_PLEIN = 50;                     // pièce pleine si la couleur atteint 50 %
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

    // champ des deux principales : parti si inégales (la plus forte à dextre), écartelé si égales
    function champDeux(A1, A2, y0, y1){
      const eg = egales(A1, A2), m = (y0 + y1) / 2;
      if (eg){
        formes.push(rect(0, y0, 200, m - y0, A1), rect(200, y0, 200, m - y0, A2), rect(0, m, 200, y1 - m, A2), rect(200, m, 200, y1 - m, A1),
          diapre(0, y0, 200, m - y0, A1), diapre(200, m, 200, y1 - m, A1), diapre(200, y0, 200, m - y0, A2), diapre(0, m, 200, y1 - m, A2),
          trait(`M200 ${y0}V${y1}M0 ${m}H400`));
        zones.push({ y0, y1: m, g: A1, d: A2 }, { y0: m, y1, g: A2, d: A1 });
        return { texte: `Écartelé ${de(A1)} et ${de(A2)}, tous deux diaprés`,
          lecture: `Le champ écartelé ${de(A1)} et ${de(A2)} dit l'égalité parfaite des deux couleurs principales, ${A1} et ${A2} (${pct(s[A1])} chacune) : aucune ne prend la dextre, et les deux sont diaprées.` };
      }
      formes.push(rect(0, y0, 200, y1 - y0, A1), rect(200, y0, 200, y1 - y0, A2), diapre(0, y0, 200, y1 - y0, A1), trait(`M200 ${y0}V${y1}`));
      zones.push({ y0, y1, g: A1, d: A2 });
      return { texte: `Parti ${de(A1)} diapré et ${de(A2)}`,
        lecture: `Le champ parti ${de(A1)} et ${de(A2)} porte les deux couleurs principales : ${A1} (${pct(s[A1])}) à dextre, place d'honneur, ${A2} (${pct(s[A2])}) à senestre. La plus forte seule est diaprée : l'inégalité se voit.` };
    }

    let pos;                                   // positions des meubles : t1, t2, t19, t20
    // part de la plus forte de deux couleurs, écart amplifié (×3) pour qu'il se voie, bornée à 15–85 %
    const PARTAGE_AMPLI = 3;
    const partage = (x, y) => { const t = s[x] + s[y]; if (!t) return .5; return Math.max(.15, Math.min(.85, .5 + PARTAGE_AMPLI * (s[x] / t - .5))); };
    // chef parti à proportion (radical : secondaires ; généraliste : couleurs moyennes)
    let axe = null;                           // ligne de partage commune à tout l'écu (null : pas encore fixée)
    function chefProportion(c1, c2){
      const moy = (s[c1] + s[c2]) / 2, h = Math.round(Math.max(48, Math.min(180, 2.4 * moy)));
      const fixe = axe === null, eg = egales(c1, c2), part = fixe ? partage(c1, c2) : (axe - 20) / 360, xs = fixe ? Math.round(20 + 360 * part) : axe;
      if (fixe) axe = xs;
      formes.push(rect(0, 0, xs, 20 + h, c1), rect(xs, 0, 400 - xs, 20 + h, c2), trait(`M0 ${20 + h}H400M${xs} 0V${20 + h}`));
      zones.unshift({ y0: 0, y1: 20 + h, g: c1, d: c2, x: xs });
      return { h, eg, part, moy, texte: `au chef parti ${fixe && !eg ? "à proportion " : ""}${de(c1)} et ${de(c2)}` };
    }
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
    function bordure(cs){
      if (cs.length === 1){
        const w = larg(cs[0]);
        formes.push(`<path d="${ECU}" fill="none" stroke="${teinte(cs[0])}" stroke-width="${2 * w}"/>`);
        return { texte: `à la bordure ${de(cs[0])}`, lecture: `La bordure ${de(cs[0])} porte la couleur absente, ${cs[0]} (${pct(s[cs[0]])}) ; sa largeur suit son score : plus elle est faible, plus la bordure est mince.` };
      }
      const [e1, e2] = parScore(cs), eg = egales(e1, e2);
      defs.push(`<clipPath id="bg-${id}"><rect x="0" y="0" width="200" height="480"/></clipPath><clipPath id="bd-${id}"><rect x="200" y="0" width="200" height="480"/></clipPath>`);
      formes.push(`<path d="${ECU}" fill="none" stroke="${teinte(e1)}" stroke-width="${2 * larg(e1)}" clip-path="url(#bg-${id})"/>`,
                  `<path d="${ECU}" fill="none" stroke="${teinte(e2)}" stroke-width="${2 * larg(e2)}" clip-path="url(#bd-${id})"/>`);
      return { texte: `à la bordure partie ${de(e1)} et ${de(e2)}${eg ? "" : ", d'inégale largeur"}`,
        lecture: `La bordure partie ${de(e1)} et ${de(e2)} porte les deux couleurs absentes, ${e1} (${pct(s[e1])}) à dextre et ${e2} (${pct(s[e2])}) à senestre. Sa largeur suit chaque score : l'absence se voit sans crier.` };
    }

    if (a.famille === "radical"){
      const A = a.principales, [b1, b2] = parScore(a.secondaires);
      formes.push(rect(0, 0, 400, 480, A), diapre(0, 0, 400, 480, A));
      zones = [{ y0: 0, y1: 480, g: A, d: A }];
      const ch = chefProportion(b1, b2), bo = (o.bordure === "epaisseur" ? bordure : bordurePartage)(a.absentes.split(""));
      blason = `${cap(de(A))} diapré, ${ch.texte}, ${bo.texte}`;
      lecture.push(`Famille radicale (1.23) : une couleur domine, deux autres la couronnent, deux l'entourent à peine.`,
        `Le champ ${de(A)} porte la couleur principale, ${A} (${pct(s[A])}), diaprée car c'est la valeur dominante.`,
        `Le chef porte les deux couleurs secondaires ; sa hauteur suit leur force moyenne (${pct(ch.moy)}), ` +
          (ch.eg ? `et il est parti au milieu : ${b1} et ${b2} sont à égalité.` : `et il est parti à proportion : ${b1} (${pct(s[b1])}) à dextre occupe ${Math.round(ch.part * 100)} % de la largeur (écart amplifié pour être visible), ${b2} (${pct(s[b2])}) le reste.`),
        bo.lecture);
      pos = { deux: true, haut: 20 + ch.h + 6, bas: 418 };   // radical : n° 1 en cœur, n° 2 en pointe
    } else {
      const [A1, A2] = parScore(a.principales);
      if (a.famille === "specialiste" && o.specialiste !== "ancien"){
        // même formule que les radicaux, transposée
        const c = a.secondaires;
        const hc = Math.round(Math.max(48, Math.min(180, 2.4 * s[c])));   // hauteur de la champagne, comme le chef
        const top = 465 - hc;
        const part = partage(A1, A2), xs = Math.round(20 + 360 * part), eg = egales(A1, A2); axe = xs;
        formes.push(rect(0, 0, xs, top, A1), rect(xs, 0, 400 - xs, top, A2), diapre(0, 0, xs, top, A1));
        if (eg) formes.push(diapre(xs, 0, 400 - xs, top, A2));
        formes.push(trait(`M${xs} 0V${top}`), rect(0, top, 400, 200, c), trait(`M0 ${top}H400`));
        zones = [{ y0: 0, y1: top, g: A1, d: A2, x: xs }, { y0: top, y1: 480, g: c, d: c }];
        const bo = bordurePartage(a.absentes.split(""));
        blason = `Parti ${eg ? "" : "à proportion "}${de(A1)} diapré et ${de(A2)}${eg ? " diapré" : ""}, à la champagne ${de(c)}, ${bo.texte}`;
        lecture.push(`Famille spécialiste (12.3) : deux moteurs, posés sur un socle, cernés par ce qui manque.`,
          eg ? `Le champ est parti au milieu ${de(A1)} et ${de(A2)} : les deux principales sont à égalité (${pct(s[A1])}), toutes deux diaprées.`
             : `Le champ est parti à proportion : ${A1} (${pct(s[A1])}) à dextre occupe ${Math.round(part * 100)} % de la largeur (écart amplifié pour être visible), ${A2} (${pct(s[A2])}) le reste. La plus forte seule est diaprée.`,
          `La champagne ${de(c)} porte la couleur secondaire, ${c} (${pct(s[c])}) ; sa hauteur suit son score, comme le chef des radicaux.`, bo.lecture);
        pos = { deux: true, haut: 26, bas: top - 4, xs };
      } else if (a.famille === "specialiste"){
        const c = a.secondaires, plein = s[c] >= SEUIL_PLEIN, top = plein ? 330 : 380;
        const chp = champDeux(A1, A2, 0, top);
        formes.push(rect(0, top, 400, 200, c), trait(`M0 ${top}H400`));
        zones.push({ y0: top, y1: 480, g: c, d: c });
        const bo = bordure(a.absentes.split(""));
        blason = `${chp.texte}, à la champagne${plein ? "" : " abaissée"} ${de(c)}, ${bo.texte}`;
        lecture.push(`Famille spécialiste (12.3) : deux moteurs, posés sur un socle, cernés par ce qui manque.`, chp.lecture,
          `La champagne ${plein ? "" : "abaissée (amoindrie) "}${de(c)} porte la couleur secondaire, ${c} (${pct(s[c])}) : ${plein ? `au moins ${SEUIL_PLEIN} %, pièce pleine` : `moins de ${SEUIL_PLEIN} %, pièce amoindrie`}.`,
          bo.lecture);
        pos = { t2: [200, 75], t1: [200, (110 + top) / 2 + 10], t20: [218, top + (465 - top) / 2 - 16], t19: [152, top + (465 - top) / 2 - 24] };
      } else if (o.generaliste !== "ancien"){               // généraliste AB/e : formule unifiée
        const [c1, c2] = parScore(a.secondaires), e = a.absentes;
        const part = partage(A1, A2), xs = Math.round(20 + 360 * part), eg = egales(A1, A2); axe = xs;
        formes.push(rect(0, 0, xs, 480, A1), rect(xs, 0, 400 - xs, 480, A2), diapre(0, 0, xs, 480, A1));
        if (eg) formes.push(diapre(xs, 0, 400 - xs, 480, A2));
        formes.push(trait(`M${xs} 0V480`));
        zones = [{ y0: 0, y1: 480, g: A1, d: A2, x: xs }];
        const ch = chefProportion(c1, c2);
        const W = 18;                                       // bordure d'épaisseur constante, comme les autres familles
        formes.push(`<path d="${ECU}" fill="none" stroke="${teinte(e)}" stroke-width="${2 * W}"/>`);
        blason = `Parti ${eg ? "" : "à proportion "}${de(A1)} diapré et ${de(A2)}${eg ? " diapré" : ""}, ${ch.texte}, à la bordure ${de(e)}`;
        lecture.push(`Famille généraliste (12/5) : un large éventail, cerné par un seul manque.`,
          eg ? `Le champ est parti au milieu ${de(A1)} et ${de(A2)} : les deux principales sont à égalité (${pct(s[A1])}), toutes deux diaprées.`
             : `Le champ est parti à proportion : ${A1} (${pct(s[A1])}) à dextre occupe ${Math.round(part * 100)} % de la largeur (écart amplifié pour être visible), ${A2} (${pct(s[A2])}) le reste. La plus forte seule est diaprée.`,
          `Le chef porte les deux couleurs moyennes ; sa hauteur suit leur force moyenne (${pct(ch.moy)}), ` +
            `et il est parti sur l'axe du champ : ${c1} (${pct(s[c1])}) à dextre, ${c2} (${pct(s[c2])}) à senestre.`,
          `La bordure ${de(e)} entoure l'écu : c'est la couleur absente, ${e} (${pct(s[e])}), la seule qui manque à ce large éventail.`);
        pos = { deux: true, haut: 20 + ch.h + 6, bas: 418, xs };
      } else {                                              // généraliste AB/e (ancienne disposition)
        const [c1, c2] = parScore(a.secondaires), e = a.absentes;
        const chp = champDeux(A1, A2, 0, 480);
        const ch = chefProportion(c1, c2), bo = bordure([e]);
        blason = `${chp.texte}, ${ch.texte}, ${bo.texte}`;
        lecture.push(`Famille généraliste (12/5) : un large éventail, cerné par un seul manque.`, chp.lecture,
          `Le chef porte les deux couleurs moyennes ; sa hauteur suit leur force moyenne (${pct(ch.moy)}), ` +
            `et il est parti sur l'axe du champ : ${c1} (${pct(s[c1])}) à dextre, ${c2} (${pct(s[c2])}) à senestre.`,
          bo.lecture);
        const yc = 20 + ch.h;
        pos = { t2: [200, Math.max(52, yc / 2 + 8)], t1: [200, yc + (420 - yc) / 2 - 10], t20: [218, 405], t19: [152, 393] };
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
    const emailSous = (x, y) => { const z = zones.find(z => y >= z.y0 && y < z.y1) || zones[zones.length - 1]; return x < (z.x ?? 200) ? z.g : z.d; };
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
      if (pos.xs){
        // champ parti : chaque meuble repose sur une seule couleur, le n° 1 sur la plus forte (dextre), le n° 2 sur l'autre
        const ld = pos.xs - 38, ls = 362 - pos.xs;
        if (ls >= 80 && ld >= 80){
          x1 = Math.max(110, Math.min(200, 38 + ld / 2)); x2 = Math.max(pos.xs + 12 + s2 / 2, Math.min(272, pos.xs + ls / 2));
          s1 = Math.min(s1, ld - 16); s2 = Math.min(s2, ls - 16);
          if (x2 + s2 / 2 > 330) s2 = Math.max(40, 2 * (330 - x2));
          yy2 = Math.min(y2, 352);
        } else { x1 = 200 - 34; x2 = 200 + 34; }       // partage trop inégal : bande centrée
      } else { const dx = o.decalage === false ? 0 : 34; x1 = 200 - dx; x2 = 200 + dx; }
      tailles.t1 = s1; tailles.t2 = s2;
      haut = [poser(t1, [x1, y1], s1), poser(t2, [x2, yy2], s2)]; bas = [];
    } else {
      haut = [poser(t1, pos.t1, tailles.t1), poser(t2, pos.t2, tailles.t2)];
      bas = [poser(t20, pos.t20, tailles.t20, true), poser(t19, pos.t19, tailles.t19, true)];
    }
    const nomMetal = g => { const ms = [...new Set(g.map(x => x.met))]; return ms.length === 1 ? (ms[0] === "or" ? "d'or" : "de sable") : "d'or, et de sable sur l'argent"; };
    const M1 = MEUBLES[t1], M2 = MEUBLES[t2], M19 = MEUBLES[t19], M20 = MEUBLES[t20];
    const lieuBas = a.famille === "specialiste" ? "en champagne" : "en pointe";
    if (pos.deux) blason += ` ; ${un(M1)} ${M1.nom} et ${un(M2)} ${M2.nom} ${nomMetal(haut)}, ${accorde("posé", M1.genre === "f" && M2.genre === "f" ? "f" : "m", true)} en bande.`;
    else blason += ` ; ${un(M1)} ${M1.nom} en cœur, ${accorde("accompagné", M1.genre)} en chef ${M2.genre === "f" ? "d'une" : "d'un"} ${M2.nom}, le tout ${nomMetal(haut)} ;`
            + ` ${lieuBas}, ${un(M20)} ${M20.nom} et ${un(M19)} ${M19.nom}, ${accorde("renversé", M20.genre === "f" && M19.genre === "f" ? "f" : "m", true)} et ${nomMetal(bas)}.`;
    const nt = t => o.noms?.[t] ? `${t} « ${o.noms[t]} »` : t;
    const pc = v => Math.round(v * 100) + " %";
    if (pos.deux) lecture.push(`Deux meubles posés en bande, de la dextre du chef vers la senestre de la pointe, la diagonale noble de l'héraldique. En haut : ${un(M1)} ${M1.nom}, pour le tempérament le plus proche, ${nt(t1)} (intensité ${pc(intensite(t1))}). En bas : ${un(M2)} ${M2.nom}, pour le deuxième, ${nt(t2)} (intensité ${pc(intensite(t2))}).`,
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
    ["Trois zones, cinq couleurs", "Chaque écu montre les cinq couleurs. Le champ porte les principales ; le chef ou la champagne, les couleurs du milieu ; la bordure, les plus faibles. L'écusson est une carte complète du profil."],
    ["Le côté d'honneur", "La dextre (à gauche pour qui regarde l'écu) est la place d'honneur : la couleur la plus forte s'y place. À égalité de deux principales, l'écartelé partage l'honneur."],
    ["Radical (1.23)", "Champ plein de la couleur principale ; chef parti des deux secondaires ; bordure partie des deux absentes, partagée à proportion comme le chef. Deux meubles posés en bande : le tempérament n° 1 vers la dextre du chef, le n° 2 vers la senestre de la pointe, de taille proportionnelle à leur intensité (écart amplifié)."],
    ["Spécialiste (12.3)", "Champ parti à proportion des deux principales, la plus forte à dextre ; champagne de la secondaire, dont la hauteur suit le score ; bordure partie à proportion des deux absentes. Deux meubles posés en bande, comme les radicaux."],
    ["Généraliste (12/5)", "Champ parti à proportion des deux principales ; chef parti à proportion des deux couleurs moyennes ; bordure pleine de la couleur absente. Deux meubles posés en bande."],
    ["Les proportions", "La hauteur d'un chef ou d'une champagne suit la force de ses couleurs. Chaque partage (champ, chef, bordure) suit le rapport des deux couleurs, avec un écart amplifié trois fois pour être visible, et tombe pile au milieu à égalité. L'écart à l'héraldique orthodoxe est voulu : l'écu dit les scores."],
    ["Profil frontière", "Écus accolés : un écu par profil, côte à côte, comme on réunit deux lignées."],
    ["Le diapré", "Arabesques claires sur la couleur dominante, la valeur n° 1 (sur les deux principales en cas d'égalité)."],
    ["Les meubles", "Deux meubles tirés des tempéraments, posés en bande : le n° 1 vers la dextre du chef, le n° 2 vers la senestre de la pointe. Leur taille suit l'intensité du tempérament, écart amplifié. L'absence se lit déjà dans la lettre minuscule du n° 1 et dans la bordure."],
    ["Le cimier", "L'animal-totem du profil, au-dessus de l'écu."],
    ["La devise", "Portée sur un listel sous l'écu."]
  ];

  return { VERSION, MEUBLES, EMAUX, GRAMMAIRE, HAUTEUR, VUE, ecusson };
});
