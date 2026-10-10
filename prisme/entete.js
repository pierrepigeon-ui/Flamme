/* PRISME — en-tête commun (logo PRISME, lien « La Forge »), chargé par toutes les pages de prisme/
   après le script de la page : <script src="entete.js?v=1.0"></script> juste avant </body>.
   Même principe que blueflame/entete.js. Le fichier injecte ses styles et ses éléments lui-même. */
(function(){
  const ENTETE_VERSION = "1.0";
  const ENCLUME = "data:image/png;base64,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";
  try {
    // 1. styles
    const st = document.createElement("style");
    st.textContent = `
.ent-marque{display:inline-flex!important;align-items:center;gap:.4em}
.ent-logo{display:inline-block;flex:none;width:1.15em;height:1.15em;border-radius:50%;position:relative;
  background:conic-gradient(#C33030 0 36deg,#C38930 36deg 72deg,#A6C330 72deg 108deg,#4EC330 108deg 144deg,#30C36B 144deg 180deg,
    #30C3C3 180deg 216deg,#306BC3 216deg 252deg,#4E30C3 252deg 288deg,#A630C3 288deg 324deg,#C33089 324deg 360deg)}
.ent-logo::after{content:"";position:absolute;inset:30%;border-radius:50%;background:#FFD54A}
.ent-zone{display:inline-flex;align-items:center;gap:12px;flex-wrap:wrap}
.ent-forge{display:inline-flex;align-items:center;gap:6px;text-decoration:none!important;color:inherit}
.ent-forge img{display:block;width:15px;height:17px}
@media (prefers-color-scheme: dark){ .ent-forge img{background:#F6F5F1;border-radius:3px;padding:1px} }
.ent-forge.cache{display:none!important}`;
    document.head.appendChild(st);

    // 2. le nom « PRISME », avec son logo, vers l'accueil de PRISME
    let marque = document.querySelector("a.marque, header .wordmark a");
    if (!marque){
      const barre = document.querySelector(".barre, #barre-haut, header");
      if (barre){
        marque = document.createElement("a");
        marque.href = "index.html"; marque.className = "marque"; marque.title = "Accueil de PRISME"; marque.textContent = "PRISME";
        barre.insertBefore(marque, barre.firstChild);
      }
    }
    if (marque && !marque.querySelector(".ent-logo")){
      const logo = document.createElement("span"); logo.className = "ent-logo"; logo.setAttribute("aria-hidden", "true");
      marque.insertBefore(logo, marque.firstChild); marque.classList.add("ent-marque");
    }

    // 3. le lien « La Forge », en premier dans la zone de connexion (caché par défaut)
    const forge = document.createElement("a");
    forge.href = "../"; forge.className = "ent-forge cache"; forge.title = "Retour à la Forge de l'Arpenteur";
    forge.innerHTML = `<img src="${ENCLUME}" alt="" width="15" height="17">La Forge`;
    const qui = document.getElementById("qui");
    let zone = document.querySelector("[data-entete-zone]") || document.querySelector("header .who");
    if (!zone && qui){   // #qui est réécrit par la page à chaque connexion : on l'enveloppe au lieu d'écrire dedans
      zone = document.createElement("span"); zone.className = "ent-zone";
      qui.parentNode.insertBefore(zone, qui); zone.appendChild(qui);
    }
    if (zone) zone.insertBefore(forge, zone.firstChild);

    // 4. le lien n'apparaît que si la personne a aussi accès à Flamme Bleue
    if (typeof sb === "undefined" || !sb?.auth) return;
    let dernier;   // identifiant déjà vérifié
    sb.auth.onAuthStateChange((_e, session) => {
      const id = session?.user?.id || null;
      if (id === dernier) return; dernier = id;
      if (!id){ forge.classList.add("cache"); return; }
      setTimeout(async () => {
        try {
          const { data, error } = await sb.rpc("flamme_mon_role");
          if (dernier === id) forge.classList.toggle("cache", !!error || !data);
        } catch (e){ forge.classList.add("cache"); }
      }, 0);
    });
  } catch (e){ console.warn("entete.js " + ENTETE_VERSION + " :", e); }
})();
