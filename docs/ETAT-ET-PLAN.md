# NextPlaate : état des lieux et plan

Au 7 octobre 2026. Le détail du chemin parcouru est dans `HISTORIQUE.md`.

## 1. Où on en est

Au 7 octobre 2026, version **5.11** (la carte du monde et les cartes de régions de 54 pays, les notifications en pastille, le profil refait dans le style du script, la bande des dernières plaques, un cadre et une règle communs à toutes les fenêtres ; 5.10.1 : la carte Plate check en sections et la boîte marque et modèle) (la 5.9 puis un correctif de mise en page, puis la réorganisation de la barre dans l'ordre d'usage avec une explication par fonction, la page `/add` en grands drapeaux, la boîte de drapeaux au même endroit à toute largeur, la mise à jour par le logo, la fenêtre d'envoi par lots et la carte Lens refaites, les registres ouverts interrogés tout seuls, les galeries de plus de 999 photos lues). La 5.7 était la version de la vérification de plaque ; la 5.8 a ajouté six fonctions et un style commun ; la 5.9 ajoute sept fonctions (bouton d'envoi flottant, liens de recherche, vos photos de ce véhicule, registre officiel NL et IL, compteur de série pour 84 pays, vrais uploads et régions du profil), le véhicule des photos déjà sur le site, Google says, la date de la photo, la fenêtre des nouveautés, la signature et le nouveau logo.

**Les vingt-cinq fonctions** (le tableau complet, avec leur réglage, leur emplacement et leur touche, est en tête de `FONCTIONNALITES.md`) : sélection d'une paire, lieu et hashtags, descriptions, envoi par lots, vérification de plaque, aperçu de plaque en direct, Google Lens, sélecteur de tags, information complémentaire, touches de page, drapeaux des pays, raccourcis vers les membres, bouton d'envoi flottant, liens de recherche de plaque, vos photos de ce véhicule, registre officiel (NL, IL), compteur de série, vrais uploads du profil, régions du profil, carte du monde, apparence du profil, notifications, bande des dernières plaques, éditeur de raccourcis, réglages. Chacune (sauf les réglages) a un interrupteur dans Settings.

**Modules complémentaires** : ce qui ne doit pas être pour tout le monde vit hors du script général, dans un petit script séparé qui s'accroche au panneau (`addons/`, mode d'emploi dans `ADDONS.md`) ; le premier est l'auto-like, retiré du script général en 5.11.1.

**Vérification de plaque** : 96 pays, 829 catégories (voir `COUVERTURE.md`, généré).

| | Catégories | Part |
|---|---|---|
| Vérifiées : plaques réelles de la galerie relues à l'identique, espaces compris | 795 | 96 % |
| Galerie vide sur le site (rien à tester tant qu'une plaque n'y est pas publiée) | 21 | 3 % |
| Limite du formulaire du site (documentée dans `data/limits.json`) | 13 | 2 % |
| À corriger | 0 | 0 % |

Les cinq « pays » sans catégories (ae, au, ca, us, xx) ont un formulaire à menu de région : leur règle est `region-menu.js`.

**Preuves** : `check_db` (2 376 plaques relues dans les pages sauvegardées), `check_known` (39 plaques tapées à la main sur le vrai site, 0 échec), et **467 tests Playwright sur le script public, 479 avec le build dev** (une quinzaine de fichiers dans `tests/e2e/` : un par fonction, plus le style et le responsive). La CI (`.github/workflows/tests.yml`) les lance à chaque push et refuse un changement du script public sans nouveau `@version`.

**Style** : un seul système (`STYLE.md`), les couleurs de PlatesMania, angles droits, une échelle de textes et de hauteurs ; des tests le vérifient (aucune couleur ni rayon hors des jetons, tailles mesurées dans le navigateur, aucun débordement de 320 à 1280 px).

**Pièces réutilisables** (`BRIQUES.md`) : un pont vers un autre site, un catalogue de véhicules, une carte dans la page, une fenêtre, les drapeaux.

**Ce qui n'est pas prouvé** : (1) que le site *trouve* la plaque lue pour chaque catégorie (le test hors ligne prouve la lecture du formulaire ; le site a répondu pour une cinquantaine de plaques à la main et 123 lectures de « Verify the reads ») ; (2) le Lens sur le vrai Google : les tests utilisent une fausse page Google, et la lecture des résultats dépend de la page de Google, qui peut changer ; (3) l'enregistrement des tags par le site : notre fenêtre presse le bouton Save du site, qui l'envoie lui-même.

## 2. Ce que le site nous a appris (à retenir)

- La recherche de galerie **garde les espaces** de la plaque (`D09003` ne trouve pas `D 09 003`) mais traite le **tiret comme un espace**. Elle écrit la lettre diplomatique russe `D` comme `*`.
- Un champ désactivé mais affiché contient des lettres écrites par le site ; une case laissée vide entre deux lettres est un espace (Islande, Åland).
- Un texte de galerie vide ne veut pas dire galerie vide : le nombre « License plates found N » de la page tranche (le Cambodge a 2 949 plaques).
- Détail des règles et de la méthode : `REGLES.md`.

## 3. Organisation du dépôt

```
src/          le script, en modules (meta, core, lib, lib/plate, ui, features, dev, boot)
scripts/      build du script, génération de data/ et de la couverture
data/         ce qui a été collecté sur le site, versionné, généré (voir data/README.md)
docs/         documentation (ce dossier)
tests/        e2e/ (pytest, faux site) et offline/ (pages sauvegardées)
tools/        diagnostics pour corriger une règle (diag_*, fails, fields, hand_check)
reference/    pages brutes (270 Mo), local seulement, jamais dans le dépôt
```

Briques réutilisables (pont vers un autre site, catalogue de véhicules, carte dans la page) : `BRIQUES.md`. Règles de cohérence : une fonction = un fichier = un `registerFeature({...})` ; tout réglage passe par le registre `settings` ; une seule porte vers le site (`siteFetch`, une requête toutes les 3 s) ; un fichier par pays dans `src/lib/plate/`.

## 4. Flux de travail

- **Corriger une règle** : `python tests/offline/check_db.py` → `python tools/fails.py xx` → corriger `src/lib/plate/xx.js` → `check_db --country xx` → `check_known` (doit rester à 0) → `node scripts/refresh-data.mjs`.
- **Publier** : monter `@version` dans `src/meta/00-header.txt`, ajouter une entrée au `CHANGELOG.md`, pousser. La CI reconstruit `nextplaate.user.js` ; Greasy Fork et Tampermonkey ne mettent à jour que si `@version` change.
- **Récolter de nouvelles données** : build dev (`node scripts/build.mjs --dev`), tiroir Developer (capture, Collect only, Verify the reads, Database), puis `node scripts/refresh-data.mjs`.

## 5. Suite

Voir `TODO.md` pour le détail. Par ordre de valeur :

1. Migrer les derniers réglages libres (`autoCheck`, `delay`, `qDelay`, `pages`) vers le registre.
2. Suggestion automatique de tags d'après la catégorie de plaque (par exemple « police »), et des tags les plus utilisés par catégorie.
3. Statut du site (en ligne, problème, pause) à partir de la file de requêtes.
4. Compteurs par marque et modèle, vrai total d'uploads (même source : la galerie).
5. Quand une galerie vide reçoit une plaque : nouvelle collecte (`Collect only`) pour la faire entrer dans les vérifiées.
6. Si le Lens change : le test du côté Google (`test_lens.py`) et les journaux du build dev (`[NextPlaate] Lens (Google side)`) disent où ça s'arrête.

Informations encore nécessaires de votre part : sens de « génération de modèle » pour d'éventuelles suggestions, contenu de « PlatesMania Plus » (un script de la liste n'est qu'un faux menu).
