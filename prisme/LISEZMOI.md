# PRISMEplayer v2 — livraison du 10/10/2026

## Ordre
1. **Base** : exécuter `13_prisme_player_v2.sql`, puis `14_prisme_totems.sql` dans l'éditeur SQL de Supabase (une transaction : tout passe ou rien).
   Il ne touche à aucun objet de Flamme Bleue ; il utilise `forge_horodater()`, `forge_journaliser()` et `prisme_mon_role()`.
   Contrôle final attendu : 20 tempéraments, 60 styles, 0 résultat sans style.
2. **Pages** : remplacer le contenu de `prisme/` par le dossier `prisme/` (11 fichiers + le dossier `bibliotheque/` : 33 fichiers en tout, un seul envoi GitHub suffit).
   Ne pas publier les pages avant le script : elles lisent les nouvelles tables.

## Ce qui change
| Fichier | Version | Changement |
|---|---|---|
| `questionnaire.html` | 2.0 | Moteur, tempérament, style ; départage par duel direct ; enregistre `style` |
| `rosace.html` | 2.1 | Refaite de zéro, générée : 5 moteurs, 20 tempéraments (point = moteur fui), 60 styles (couleur = second moteur) ; totems dans la couronne et le panneau |
| `fiche.html` | 2.3 | En-tête : tempérament et style en qualificatif « (attentif) » ; moteur dominant et « Votre moment » (cinq moteurs) repliables ; « Vos jeux » par style ; totem du tempérament |
| `index.html` | 2.0 | Profil affiché en v2, roue aux cinq moteurs |
| `console.html` | 2.1 | Édition des moteurs v2, des tempéraments et de leurs styles ; résultats par style ; sauvegarde des nouvelles tables |
| `encyclopedie.html` | 2.1 | Moteurs, tempéraments et styles ; spectromètre v2 ; glossaire |
| `evaluation.html` | 3.13 | Spectromètre par style, regroupé par moteur et tempérament |
| `timeline.js` | 1.4 | Spectromètre v2 (poids 3 / 1,5 / 0,5 / 0,5, moteurs revus, baisse de Décrypter après le jalon 4) |
| `entete.js` | 1.2 | Logo aux cinq couleurs des moteurs |
| `totems.js` | 1 | Lecture de la bibliothèque des totems (même méthode que Flamme Bleue) |
| `totems.html` | 1.0 | Page de contrôle : les 20 totems sur une planche |
| `bibliotheque/` | v1 | `catalogue.json`, `CREDITS.md`, `totems/*.svg` (20 icônes game-icons, CC BY 3.0) |

Les anciennes tables (archétypes, profils, sous-profils) et l'ancienne vue restent en base, intactes : plus aucune page ne les lit.

Après tout changement d'image : incrémenter `BIB_VERSION` dans `totems.js` (sinon les navigateurs gardent les anciennes en cache).
