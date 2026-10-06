# NextPlaate : état des lieux et plan

Au 6 octobre 2026, version **5.7** (publiée sur GitHub). Le détail du chemin parcouru est dans `HISTORIQUE.md`.

## 1. Où on en est

**Livré et testé** : sélection de paire, description avant/arrière, likes, pages, raccourcis modifiables, envoi par lots (IndexedDB, un onglet par photo, pause Cloudflare), registre de réglages (un interrupteur par fonction), vérification de plaque.

**Vérification de plaque** : 96 pays, 829 catégories (voir `COUVERTURE.md`, généré).

| | Catégories | Part |
|---|---|---|
| Vérifiées : plaques réelles de la galerie relues à l'identique, espaces compris | 795 | 96 % |
| Galerie vide sur le site (rien à tester tant qu'une plaque n'y est pas publiée) | 21 | 3 % |
| Limite du formulaire du site (documentée dans `data/limits.json`) | 13 | 2 % |
| À corriger | 0 | 0 % |

Les cinq « pays » sans catégories (ae, au, ca, us, xx) ont un formulaire à menu de région : leur règle est `region-menu.js`.

**Preuves** : `check_db` (2 376 plaques relues dans les pages sauvegardées), `check_known` (39 plaques tapées à la main sur le vrai site, 0 échec), 77 tests Playwright sur le script public et 83 sur le build dev. La CI (`.github/workflows/tests.yml`) les lance à chaque push et refuse un changement du script public sans nouveau `@version`.

**Ce qui n'est pas prouvé** : que le site *trouve* la plaque lue pour chaque catégorie. Le test hors ligne prouve la lecture du formulaire ; l'acceptation par le site est confirmée par la main (une cinquantaine de plaques) et par « Verify the reads » (123 plaques, qui ont conduit aux règles d'espacement). Une vérification d'une plaque par catégorie sur le site (environ 795 requêtes, 40 minutes) est possible mais n'a pas été faite : décision du 6 octobre.

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

Règles de cohérence : une fonction = un fichier = un `registerFeature({...})` ; tout réglage passe par le registre `settings` ; une seule porte vers le site (`siteFetch`, une requête toutes les 3 s) ; un fichier par pays dans `src/lib/plate/`.

## 4. Flux de travail

- **Corriger une règle** : `python tests/offline/check_db.py` → `python tools/fails.py xx` → corriger `src/lib/plate/xx.js` → `check_db --country xx` → `check_known` (doit rester à 0) → `node scripts/refresh-data.mjs`.
- **Publier** : monter `@version` dans `src/meta/00-header.txt`, ajouter une entrée au `CHANGELOG.md`, pousser. La CI reconstruit `nextplaate.user.js` ; Greasy Fork et Tampermonkey ne mettent à jour que si `@version` change.
- **Récolter de nouvelles données** : build dev (`node scripts/build.mjs --dev`), tiroir Developer (capture, Collect only, Verify the reads, Database), puis `node scripts/refresh-data.mjs`.

## 5. Suite

Par ordre de valeur, voir `TODO.md` pour le détail :

1. Migrer les derniers réglages libres (`autoCheck`, `delay`, `qDelay`, `pages`) vers le registre.
2. Saisie d'une plaque en un seul champ (le script remplit le formulaire), puis avertissement de forme.
3. Statut du site, lecture de la galerie comme source unique (pré-remplissage marque/modèle, compteurs).
4. Page d'ajout améliorée, pays test d'abord.
5. Quand une galerie vide reçoit une plaque : nouvelle collecte (`Collect only`) pour la faire entrer dans les vérifiées.

Informations encore nécessaires de votre part : couleurs du site (CSS ou capture), sens de « génération de modèle », contenu de « PlatesMania Plus ».
