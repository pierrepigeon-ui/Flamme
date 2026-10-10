/* =====================================================================
   Flamme Bleue — en-tête commun (1.0, 10/10/2026)
   - une petite flamme bleue devant le nom « Flamme Bleue », qui ramène à l'accueil ;
   - un lien « La Forge », avec sa petite enclume, en haut à droite, comme dans PRISME :
     il n'apparaît que si la personne a aussi accès à PRISME (la Forge a alors autre chose à proposer).
   À charger APRÈS le script de la page (il réutilise son client Supabase « sb »).
   ===================================================================== */
(function () {
  const ENCLUME = "data:image/png;base64,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";
  const FLAMME = '<svg class="fb-flamme" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="fb-flamme-g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0B2E8A"/><stop offset=".55" stop-color="#2F6BFF"/><stop offset="1" stop-color="#BFE0FF"/></linearGradient></defs><path fill="url(#fb-flamme-g)" d="M50 4c4 16 22 24 22 48 0 12-6 22-14 26 4-8 2-18-6-24 2 10-4 16-8 18-2-10-10-12-10-22-8 8-10 20-4 30C18 76 14 64 16 52c3-16 18-22 22-36 4 8 4 16 2 22 8-6 12-18 10-34z"/></svg>';
  const css = document.createElement("style");
  css.textContent = `
    .wordmark a{display:inline-flex;align-items:center;gap:.28em}
    .wordmark .fb-flamme{width:1.15em;height:1.15em;flex:none;margin-left:-.1em}
    .fb-forge{display:inline-flex;align-items:center;gap:6px;color:inherit;text-decoration:none;font-size:13px;opacity:.85;margin-right:4px}
    .fb-forge:hover{opacity:1;text-decoration:underline}
    .fb-forge img{display:block}
    .fb-forge.cache{display:none}
    @media (prefers-color-scheme: dark){ .fb-forge img{background:#F6F5F1;border-radius:3px;padding:1px} }`;
  document.head.appendChild(css);

  // la flamme devant le nom
  document.querySelectorAll(".wordmark a").forEach(a => { if (!a.querySelector(".fb-flamme")) a.insertAdjacentHTML("afterbegin", FLAMME); });

  // le lien vers la Forge, en tête de la zone de connexion (en haut à droite)
  const zone = document.querySelector("header .who") || document.querySelector(".barre");
  if (!zone) return;
  const lien = document.createElement("a");
  lien.className = "fb-forge cache"; lien.href = "../"; lien.title = "Revenir à la Forge de l'Arpenteur";
  lien.innerHTML = `<img src="${ENCLUME}" alt="" width="15" height="17">La Forge`;
  zone.insertBefore(lien, zone.firstChild);

  let client = null;
  try { client = sb; } catch { return; }                         // « sb » : le client Supabase de la page
  let vu = undefined;
  client.auth.onAuthStateChange((_e, session) => {
    const id = session?.user?.id || null; if (id === vu) return; vu = id;
    if (!id){ lien.classList.add("cache"); return; }
    setTimeout(async () => {
      try { const { data } = await client.rpc("prisme_mon_role"); lien.classList.toggle("cache", !data); }
      catch { lien.classList.add("cache"); }
    }, 0);
  });
})();
