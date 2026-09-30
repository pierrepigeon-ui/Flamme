/* =====================================================================
   FLAMME — moteur de calcul
   Port JavaScript des règles du classeur ColorWheel v4.540 (VBA) :
     usrSortCode / usrCode  -> ordonner(), codeCanonique()
     usrProfil360           -> profilClasseur() (à l'identique), profil() (égalités conservées)
     prPARAM                -> scoresTypes()
     autotest (calculerScores) -> scoresDepuisTemperaments()
   Utilisable dans une page web (window.FLAMME_MOTEUR) ou sous Node (require).
   ===================================================================== */
(function (racine, fabrique) {
  const moteur = fabrique();
  if (typeof module === "object" && module.exports) module.exports = moteur;
  else racine.FLAMME_MOTEUR = moteur;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const VERSION = { numero: "1.1", date: "2026-09-30 13:36" };
  const ORDRE = ["W", "U", "B", "R", "G"];

  /* ---------- ordre canonique des combinaisons (usrSortCode) ---------- */
  const CANONIQUES = [
    "W", "U", "B", "R", "G",
    "WU", "WB", "UB", "UR", "BR", "BG", "RG", "RW", "GW", "GU",
    "WUB", "UBR", "BRG", "RGW", "GWU", "WBG", "URW", "BGU", "RWB", "GUR",
    "WUBR", "GWUB", "RGWU", "BRGW", "UBRG",
    "WUBRG"
  ];
  const cleTri = s => [...s].sort((a, b) => ORDRE.indexOf(a) - ORDRE.indexOf(b)).join("");
  const PAR_ENSEMBLE = Object.fromEntries(CANONIQUES.map(c => [cleTri(c), c]));

  /** Écrit un ensemble de couleurs dans l'ordre canonique : ordonner("UW") -> "WU", ordonner("wr") -> "rw". */
  function ordonner(couleurs) {
    const maj = [...new Set(String(couleurs).toUpperCase())].filter(c => ORDRE.includes(c));
    if (!maj.length) return "";
    const res = PAR_ENSEMBLE[cleTri(maj.join(""))];
    return couleurs === couleurs.toLowerCase() ? res.toLowerCase() : res;
  }

  const complement = couleurs => ORDRE.filter(c => !String(couleurs).toUpperCase().includes(c)).join("");

  /**
   * Code canonique d'une combinaison « présentes / absentes » (usrCode).
   * Tout ce qui suit « / » est absent.
   * Règle : UNE absente se note « / » (W/u, WU/b, /w) ; PLUSIEURS absentes signifient
   * la présence du complément, noté en couleurs secondaires :
   *   W/rg -> W.ub (radical)   WU/br -> WU.g (spécialiste)   W/ubr -> W.g (polarité)
   * Écart assumé avec le VBA : usrCode ne marquait absente que la PREMIÈRE lettre après « / ».
   * Aucun usage réel du classeur n'est affecté (il n'appelle usrCode qu'avec une seule absente).
   */
  function codeCanonique(code) {
    const [av, ap = ""] = String(code).toUpperCase().split("/");
    const pres = ordonner(av), abs = ordonner(ap);
    if (abs.length <= 1) return pres + (abs ? "/" + abs.toLowerCase() : "");
    if (!pres) throw new Error(`${code} : notation ambiguë (plusieurs absentes et aucune présente)`);
    const reste = ordonner(complement(pres + abs));
    return reste ? pres + "." + reste.toLowerCase() : pres;
  }

  /* ---------- reconnaissance d'un code ---------- */
  const MOTIFS = [
    ["valeur",      /^[WUBRG]$/],
    ["motivation",  /^[WUBRG]{2}$/],
    ["projet",      /^[WUBRG]{3}$/],
    ["trait",       /^([WUBRG])\1[wubrg]$/],
    ["anti-valeur", /^\/[wubrg]$/],
    ["temperament", /^[WUBRG]\/[wubrg]$/],
    ["polarite",    /^[WUBRG]\.[wubrg]$/],
    ["profil",      /^[WUBRG]\.[wubrg]{2}$/, "radical"],
    ["profil",      /^[WUBRG]{2}\.[wubrg]$/, "specialiste"],
    ["profil",      /^[WUBRG]{2}\/[wubrg]$/, "generaliste"]
  ];

  /**
   * Analyse un code : couche, famille, couleurs principales / secondaires / absentes,
   * et vérifie qu'il est écrit dans l'ordre canonique.
   */
  function analyser(code) {
    const m = MOTIFS.find(([, re]) => re.test(code));
    if (!m) return { code, couche: null, valide: false, erreur: "notation inconnue" };
    const [couche, , famille = null] = m;
    const lettres = code.replace(/[./]/g, "");
    const principales = lettres.replace(/[a-z]/g, "");
    const minuscules = lettres.replace(/[A-Z]/g, "").toUpperCase();
    const absentesExplicites = code.includes("/") ? code.split("/")[1].toUpperCase() : "";
    const secondaires = code.includes("/") ? "" : minuscules;
    const r = { code, couche, famille, principales, secondaires, absentes: absentesExplicites };

    // les couleurs non citées sont absentes pour les profils radicaux et spécialistes
    if (famille === "radical" || famille === "specialiste") r.absentes = complement(principales + secondaires);
    if (famille === "generaliste") r.secondaires = complement(principales + absentesExplicites);

    // contrôle de l'ordre canonique
    let attendu = code;
    if (couche === "motivation" || couche === "projet") attendu = ordonner(code);
    else if (famille === "radical") attendu = principales + "." + ordonner(secondaires).toLowerCase();
    else if (famille === "specialiste" || famille === "generaliste") attendu = ordonner(principales) + code.slice(2);
    r.valide = attendu === code;
    if (!r.valide) r.erreur = `ordre non canonique, attendu ${attendu}`;
    return r;
  }

  /* ---------- profil à partir des 5 scores (usrProfil360) ---------- */
  // Départage des égalités repris tel quel du VBA : W > B > U > G > R.
  const DEPARTAGE = { W: 1e-4, U: 1e-6, B: 1e-5, R: 1e-8, G: 1e-7 };

  // Tri du VBA reproduit à l'identique (y compris son comportement en cas d'égalité).
  function triVBA(t) {
    for (let i = 2; i <= t.length - 1; i++)
      for (let j = 1; j <= i; j++)
        if (t[j][1] < t[i][1]) { const x = t[i]; t[i] = t[j]; t[j] = x; }
    return t;
  }

  /**
   * Calcul du classeur, reproduit à l'identique (départage arbitraire des égalités : W > B > U > G > R).
   * Conservé pour comparer avec les anciens résultats. Les applis utilisent profil().
   */
  function profilClasseur(s) {
    ORDRE.forEach(c => { if (typeof s[c] !== "number" || !isFinite(s[c])) throw new Error(`score manquant ou invalide pour ${c}`); });
    const col = triVBA([null, ...["W", "U", "B", "R", "G"].map(c => [c, s[c] + DEPARTAGE[c]])]);
    const ecartsBruts = [1, 2, 3, 4].map(i => col[i][1] - col[i + 1][1]);
    const e = triVBA([null, ...ecartsBruts.map((v, k) => [k + 1, v])]);
    const r1 = e[1][0], r2 = e[2][0], r3 = e[3][0];

    let motif;
    if (r1 === 1) motif = "122";
    else if (r1 === 2) motif = r2 === 1 ? (r3 === 3 ? "212" : "221") : r2 === 3 ? "212" : "221";
    else if (r1 === 3) motif = r2 === 1 ? "122" : r2 === 2 ? "212" : (r3 === 1 ? "122" : "212");
    else motif = "221";

    const c = i => col[i][0];
    let code, famille;
    if (motif === "122") { famille = "radical";     code = c(1) + "." + ordonner(c(2) + c(3)).toLowerCase(); }
    if (motif === "212") { famille = "specialiste"; code = ordonner(c(1) + c(2)) + "." + c(3).toLowerCase(); }
    if (motif === "221") { famille = "generaliste"; code = ordonner(c(1) + c(2)) + "/" + c(5).toLowerCase(); }

    return { code, famille, motif, classement: [1, 2, 3, 4, 5].map(c), ecarts: ecartsBruts.map(v => Math.round(v * 1e6) / 1e6) };
  }

  /* ---------- profil avec égalités conservées ---------- */
  // Chaque famille correspond à deux « coupures » dans le classement des 5 couleurs :
  //   radical 1.23 = coupures après le 1er et le 3e rang (écarts e1 et e3)
  //   spécialiste 12.3 = après le 2e et le 3e (e2 et e3)
  //   généraliste 12/5 = après le 2e et le 4e (e2 et e4)
  // La famille retenue est celle dont les deux coupures tombent sur les plus grands écarts
  // (comparaison du plus grand, puis du second). C'est exactement la règle du classeur, sans départage.
  const COUPURES = { radical: [0, 2], specialiste: [1, 2], generaliste: [1, 3] };
  const ORDRE_FAMILLES = ["radical", "generaliste", "specialiste"];
  const EPS = 1e-9;

  function permutationsCompatibles(s) {
    // tous les classements décroissants possibles quand des couleurs sont à égalité
    const res = [];
    const rec = (reste, acc) => {
      if (!reste.length) { res.push(acc); return; }
      const max = Math.max(...reste.map(c => s[c]));
      reste.filter(c => Math.abs(s[c] - max) < EPS).forEach(c => rec(reste.filter(x => x !== c), [...acc, c]));
    };
    rec(ORDRE.slice(), []);
    return res;
  }
  const cmpPaire = (a, b) => Math.abs(a[0] - b[0]) >= EPS ? a[0] - b[0] : Math.abs(a[1] - b[1]) >= EPS ? a[1] - b[1] : 0;

  function codeDeFamille(famille, c) {
    if (famille === "radical")     return c[0] + "." + ordonner(c[1] + c[2]).toLowerCase();
    if (famille === "specialiste") return ordonner(c[0] + c[1]) + "." + c[2].toLowerCase();
    return ordonner(c[0] + c[1]) + "/" + c[4].toLowerCase();
  }

  /**
   * Profil à partir des scores des 5 couleurs (n'importe quelle échelle : 0–1 ou 0–100).
   * Les égalités sont conservées : si plusieurs profils sont également justifiés,
   * ils sont tous renvoyés et le profil est dit « frontière ».
   * @returns {{codes:string[], frontiere:boolean, familles:string[], classement:string[][], ecarts:number[]}}
   *   codes : 1 profil, ou plusieurs à égalité (triés par famille : radical, généraliste, spécialiste, puis par code)
   */
  function profil(s) {
    ORDRE.forEach(c => { if (typeof s[c] !== "number" || !isFinite(s[c])) throw new Error(`score manquant ou invalide pour ${c}`); });
    const trouves = new Map();
    const perms = permutationsCompatibles(s);
    for (const c of perms) {
      const e = [0, 1, 2, 3].map(i => s[c[i]] - s[c[i + 1]]);
      const paires = Object.fromEntries(Object.entries(COUPURES).map(([f, [a, b]]) => [f, [Math.max(e[a], e[b]), Math.min(e[a], e[b])]]));
      const meilleure = Object.values(paires).reduce((m, p) => cmpPaire(p, m) > 0 ? p : m);
      for (const [f, p] of Object.entries(paires))
        if (cmpPaire(p, meilleure) === 0) trouves.set(codeDeFamille(f, c), f);
    }
    const codes = [...trouves.keys()].sort((a, b) =>
      ORDRE_FAMILLES.indexOf(trouves.get(a)) - ORDRE_FAMILLES.indexOf(trouves.get(b)) ||
      [...a].map(x => ORDRE.indexOf(x.toUpperCase())).join().localeCompare([...b].map(x => ORDRE.indexOf(x.toUpperCase())).join()));
    const c0 = perms[0];
    return {
      codes, frontiere: codes.length > 1,
      familles: [...new Set(codes.map(k => trouves.get(k)))],
      classement: groupesEgalite(s),
      ecarts: [0, 1, 2, 3].map(i => Math.round((s[c0[i]] - s[c0[i + 1]]) * 1e6) / 1e6)
    };
  }
  // classement par groupes d'égalité : [["U"],["R","G"],["W","B"]]
  function groupesEgalite(s) {
    const tri = ORDRE.slice().sort((a, b) => s[b] - s[a] || ORDRE.indexOf(a) - ORDRE.indexOf(b));
    const g = [];
    tri.forEach(c => { const d = g[g.length - 1]; if (d && Math.abs(s[d[0]] - s[c]) < EPS) d.push(c); else g.push([c]); });
    return g;
  }

  /* ---------- scores types d'un profil (onglet prPARAM) ---------- */
  const PARAMETRES_TYPES = {         // rang 1 à 5, en %
    radical:     [80, 60, 60, 30, 30],
    specialiste: [75, 75, 50, 25, 25],
    generaliste: [75, 75, 45, 45, 10]
  };
  /** Scores types d'un profil, dans l'ordre de ses couleurs : scoresTypes("U.rg") -> {U:80,R:60,G:60,W:30,B:30} */
  function scoresTypes(code) {
    const a = analyser(code);
    if (a.couche !== "profil") throw new Error(`${code} n'est pas un code de profil`);
    const ordre = a.principales + a.secondaires + a.absentes;   // rang 1 à 5
    const p = PARAMETRES_TYPES[a.famille];
    return Object.fromEntries([...ordre].map((c, i) => [c, p[i]]));
  }

  /* ---------- profil opposé (colonne « opposé » des onglets 122 / 221 / 212) ---------- */
  function oppose(code) {
    const a = analyser(code);
    if (a.couche !== "profil") throw new Error(`${code} n'est pas un code de profil`);
    if (a.famille === "radical")     return ordonner(a.absentes) + "/" + a.principales.toLowerCase();
    if (a.famille === "generaliste") return a.absentes + "." + ordonner(a.secondaires).toLowerCase();
    return ordonner(a.absentes) + "." + a.secondaires.toLowerCase();   // spécialiste
  }

  /* ---------- autotest : scores à partir du classement des 20 tempéraments ---------- */
  /**
   * @param {string[]} codes les 20 tempéraments dans l'ordre choisi (le 1er = le plus proche de soi)
   * @returns {{bruts:Object, pourcentages:Object}} pourcentages bornés à 0–100
   */
  function scoresDepuisTemperaments(codes) {
    if (codes.length !== 20) throw new Error("il faut classer les 20 tempéraments");
    const bruts = { W: 0, U: 0, B: 0, R: 0, G: 0 };
    codes.forEach((t, i) => {
      const [p, a] = t.split("/"); const rang = i + 1;
      bruts[p] += 20 - rang; bruts[a.toUpperCase()] += rang;
    });
    const pourcentages = Object.fromEntries(ORDRE.map(c => [c, Math.max(0, Math.min(100, (bruts[c] - 16) / 128 * 100))]));
    return { bruts, pourcentages };
  }

  return { VERSION, ORDRE, ordonner, codeCanonique, analyser, profil, profilClasseur, scoresTypes, oppose, scoresDepuisTemperaments, PARAMETRES_TYPES };
});
