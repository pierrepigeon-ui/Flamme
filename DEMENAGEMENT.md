# Déménagement de Flamme Bleue dans `blueflame/` — 04/10/2026

## Nouvelle arborescence

```
/                     pages de redirection (anciens liens préservés)
/blueflame/           Flamme Bleue : accueil 1.4, console 1.21 et toutes ses pages, bibliotheque/, polices/, scripts
/prisme/              PRISME : accueil 1.4 et console 1.7 (liens vers ../blueflame/), le reste inchangé
```

## Envoi sur GitHub (interface web, limite de 100 fichiers par envoi)

1. **Lot 1 — `lot1_animaux.zip`** : décompresser, puis glisser le dossier `blueflame` à la racine du dépôt. Il ne contient que `blueflame/bibliotheque/animaux/` (90 images). Valider.
2. **Lot 2 — `lot2_site.zip`** : décompresser, puis glisser d'un coup son contenu à la racine : le dossier `blueflame`, le dossier `prisme` et les 8 pages de redirection. GitHub remplace les fichiers de même nom. Valider.
3. Vérifier que `…/blueflame/` s'ouvre et fonctionne (connexion, autotest, totems), et que les liens croisés avec PRISME marchent.
4. **Supprimer de la racine** ce qui a déménagé : le dossier `bibliotheque`, le dossier `polices`, `flamme_moteur.js`, `flamme_blason.js` (sur un dossier : menu « … » puis *Delete directory* ; sur un fichier : icône corbeille). Ne pas supprimer les 8 pages `.html` de la racine : ce sont désormais les redirections.

Avec GitHub Desktop, plus simple : décompresser les deux lots dans le dossier local du dépôt, supprimer les quatre éléments de l'étape 4, puis un seul *Commit* et *Push*.

## Ce qui ne change pas
- La base Supabase et les comptes. Connexion par mot de passe : aucune adresse de redirection à déclarer.
- Les chemins internes de chaque outil (tout est relatif).
