# NextPlaate : état des lieux et plan

Rédigé le 5 octobre 2026, branche `refactor/ribbon`, version `5.4`. Remplace `NEXTPLAATE_HANDOFF.md` (périmé) et la partie « ordre proposé » de `TODO.md`.

## 1. Où on en est

**Livré et testé** : sélection de paire, description avant/arrière, likes, pages, raccourcis modifiables, envoi par lots (IndexedDB, un onglet par photo, pause Cloudflare), vérification de plaque (règles pour ~47 pays), Google Lens (prompt copié, réponse collée), file de requêtes (1 à la fois, 3 s, pause 15 min), barre d'icônes à tiroirs, build modulaire, logs coupés en public.
**Outils dev** (build dev seulement) : capture des pages, test de plaques par pays, base de plaques, remplissage des plaques manquantes.
**Tests** : 37 tests Playwright passent (1 ignoré), plus 3 scripts hors ligne (`check_known`, `check_db`, `check_formats`).
**En attente** : réglages par fonction, statut du site, remplissage marque/modèle, compteurs, page d'ajout améliorée (voir §4).

## 2. Problèmes constatés

### Dépôt
1. `.gitignore` en liste blanche : **`docs/`, `NEXTPLAATE_HANDOFF.md` et `logo_nextplaate.svg` ne sont pas versionnés**. Une perte de disque les efface. (`reference/`, 270 Mo, doit rester local.)
2. `NEXTPLAATE_HANDOFF.md` décrit la v5.2 « ~1350 lignes, sans build » : faux depuis le découpage en modules.
3. `nextplaate.user.js` est versionné **et** reconstruit par la CI : le fichier local modifié (+125/−15) n'était qu'un build en retard sur `src/`. Deux sources de commits sur le même fichier = conflits.
4. `refactor/ribbon` a 62 fichiers d'écart avec `main`, non fusionnée. La CI ne tourne que sur `main` : rien n'est validé avant fusion.
5. La CI ne lance **pas** les tests, seulement `node --check`. `@version` reste à 5.4 alors que la logique de plaques a changé.
6. Bruit : `.claude/` vide, entrée `tools/` dans `.gitignore` sans dossier, `tests/__pycache__`.
7. `tests/` mélange 3 choses : tests pytest (`test_*`), scripts de contrôle hors ligne (`check_*`), diagnostics jetables (`diag_*`).

### Code
1. **Une seule portée partagée** : les fichiers s'appellent sans import. Dépendances cachées : `lib/codegen.js` lit le DOM via `$`, `lib/http.js` appelle `devLog` (défini dans `dev/`, protégé par `typeof`). Un fichier ne se lit pas seul.
2. **Réglages dispersés** : ~40 clés `store.get/set` en chaînes libres, sans liste, sans valeur par défaut centralisée. C'est le blocage principal des « options de désactivation ».
3. **`lib/plate.js`** : un `switch` par pays qui mêle données et logique ; l'aide `menu` est recopiée dans plusieurs `case`. Chaque nouveau pays agrandit la même fonction.
4. `lib/countries.js` : toute la liste sur une seule ligne. Illisible en diff.
5. **92 lectures `$('id')`** : chaque fonction connaît les id du balisage des autres.
6. CSS en chaînes JS, avec des couleurs en dur hors des tokens (survols `#9fd3ea`, etc.). Seulement 2 `@media` : le gestionnaire d'upload est adapté au mobile, le reste peu.
7. Temporisations et attentes (`setTimeout`) éparpillées dans 12 fichiers, sans utilitaire commun.
8. `innerHTML` : 10 usages à vérifier un par un (échappement avec `esc`).
9. Dev : `dev/30-plate-test.js` fait 473 lignes (le plus gros fichier).
10. Mélange de langues voulu (UI en anglais, docs en français) : à écrire comme règle, pas à changer.

## 3. Organisation cible

Garder les groupes de `src/` (ils marchent). Changer peu, mais nommer les choses.

```
src/
  meta/        en-tête
  core/        00-open, 10-storage, 15-settings (NOUVEAU : registre de réglages), 20-here, 30-app, 40-keys
  lib/         pur, sans DOM de l'interface
    plate/     00-helpers, fr.js, by.js, ... un fichier par pays complexe, 99-generic.js
    countries.js (une entrée par ligne)
    http.js, photo.js
  ui/          tokens, dom, ribbon
  features/    un fichier par fonction (upload/ reste un sous-dossier)
  dev/         outils (build dev seulement)
  boot/
tests/
  e2e/         test_*.py (pytest, faux site)
  offline/     check_*.py (corpus de pages sauvegardées)
tools/         extract-fields.cjs, diag_*.py (jetables)
docs/          versionné : ETAT-ET-PLAN, ARCHITECTURE, FONCTIONNALITES, PLATESMANIA-ETAT, CHANGELOG
reference/     local, hors dépôt (documenté dans reference/README.md)
```

Règles de cohérence (à mettre dans `docs/ARCHITECTURE.md`) :
- Une fonction = un fichier = un `registerFeature({ id, label, defaultOn, groups, keys, init })`. Le `id` sert au réglage, au tiroir et au test.
- Tout réglage passe par `settings.define('id', defaut, libelle)`. Plus de `store.get('chaîne libre')`.
- Une seule porte vers le site : `siteFetch`. Une seule porte vers le stockage : `store`/`settings`.
- Un utilitaire `wait(ms)` / `retry` commun. Couleurs et espacements uniquement via les tokens.
- Un `lib/` ne touche pas l'interface : il reçoit ses valeurs en paramètre (corrige `codegen`).

## 4. Plan concret, par étapes

Chaque étape : une branche courte, tests verts, un commit clair.

**Étape 0 : assainir le dépôt (½ jour, sans risque)**
- Ajouter `docs/`, `logo_nextplaate.svg` à la liste blanche ; supprimer `HANDOFF` (remplacé par ce document) ; nettoyer `.claude/`, `tools/`.
- Décider du fichier compilé : soit la CI seule le commit (retirer le build local des commits), soit on le construit au release.
- Fusionner `refactor/ribbon` dans `main` après tests ; monter `@version` à 5.5.
- CI : ajouter le lancement de pytest sur chaque PR et sur les branches.

**Étape 1 : fondations (1 à 2 jours)**
- `core/15-settings.js` : registre `define/get/set/onChange`, migration des ~40 clés `pmg_*` existantes.
- Tiroir « Réglages » généré depuis le registre (un interrupteur par fonction + options). Livre aussi *Options de désactivation* du TODO.
- `registerFeature` reçoit `id`/`defaultOn` ; une fonction désactivée ne monte ni tiroir ni touche.
- Test : désactiver chaque fonction, vérifier que rien ne casse.

**Étape 2 : remise en forme du code (2 jours, sans changement visible)**
- Découper `plate.js` en `lib/plate/` (aides partagées dont `menu`) ; le test `check_db` (770 plaques) doit rester identique : c'est le filet de sécurité.
- `countries.js` une ligne par pays ; `wait()` commun ; couleurs dans les tokens ; revue des 10 `innerHTML`.
- Réorganiser `tests/` et `tools/`.

**Étape 3 : statut du site (½ jour)**
- Passif, à partir de `http.js` : en ligne / problème / en pause avec heure de reprise. Aucune requête en plus. Affiché dans la barre.

**Étape 4 : lecture de la galerie, source unique (2 à 3 jours)**
- `lib/gallery.js` : lit une page de galerie ou de recherche et renvoie des objets (plaque, marque, modèle, génération, date).
- Premier usage : pré-remplir marque/modèle/génération quand la plaque existe déjà. Le compteur par marque et le vrai total d'uploads réutilisent cette lecture. Les requêtes passent par `siteFetch` et s'arrêtent pendant une pause.

**Étape 5 : page d'ajout (2 jours)**
- Pays test : la France. Bouton flottant, champs réorganisés, mode simplifié avec drapeau. Généraliser ensuite pays par pays, avec un test par pays.

**Étape 6 : confort**
- Boîte à outils de recherche (réutilise Lens), console ASCII, responsive du panneau.

## 5. Idées fondées (par ordre de valeur)

1. **Registre de réglages avant toute nouvelle fonction** : sans lui, chaque ajout aggrave le point 2 du code et on ne peut pas couper une fonction qui gêne.
2. **Un seul extracteur de galerie** : trois demandes du TODO (pré-remplissage, compteur, total) lisent la même page. Une lecture = moins de requêtes vers le site, donc moins de risque Cloudflare.
3. **Le test `check_db` comme filet** : il valide 770 plaques hors ligne. S'en servir pour tout refactor de `plate.js`.
4. **CI qui teste** : le projet a déjà 37 tests ; leur donner un déclencheur coûte quelques lignes.
5. **Changelog + version à chaque release** : Greasy Fork ne met à jour que si `@version` monte. Un contrôle automatique (la CI échoue si `src/` change sans nouvelle version) évite l'oubli.

## 6. Infos nécessaires de votre part

- Couleurs du site (CSS ou capture de la couleur principale).
- « Génération de modèle » : année, code châssis, ou suggestion par IA ?
- Contenu de « PlatesMania Plus ».
- Fichier compilé : le laisser versionné et construit par la CI, ou le publier uniquement à chaque release ?

## 7. Avancement (branche `refactor/data-structure`)

- **Fait** : `data/` (47 pays, 974 plaques, 481 catégories de recherche, un dossier par pays, généré par `scripts/build-data.mjs`, schéma dans `data/README.md`) ; `.gitignore` versionne `data/`, `docs/`, le logo ; `tests/` rangé en `e2e/` (pytest) et `offline/` (contrôles sur pages sauvegardées), diagnostics dans `tools/`. Les 37 tests e2e et `check_known` (16/16) passent après le déplacement.
- **Règles de plaque** : le suivi chiffré est dans `docs/COUVERTURE.md` (généré). État : 294 catégories vérifiées sur 481, 3 à corriger (Allemagne « Authorities and federal agencies », Serbie « Trailers », Ukraine « Work vehicles (1995) » : 7 plaques), 184 sans plaque connue, 49 pays du site jamais capturés.
- **Suite** : étape 1 (registre de réglages), puis étape 2 (découper `plate.js` par pays, un fichier par pays à côté de ses données).

### Découpage et vitesse (branche `refactor/split-and-speed`)

- **Fusion** : `main` contient tout (`refactor/ribbon` et `refactor/data-structure` fusionnées, supprimées).
- **Découpage** : `lib/plate.js` (233 lignes) devient `lib/plate/` : `00-helpers.js`, `zz-entry.js` et 27 fichiers pays (`PLATE_RULES.<cc>`) ; `dev/30-plate-test.js` (473) devient 7 fichiers ; `upload/02-manager.js` (303) devient 3 ; le CSS du ruban a son fichier ; `countries.js` a une ligne par pays. Comportement identique (même résultat sur `check_db`).
- **Vitesse** : `check_db` 110 s → 19 s (le test attendait 350 ms par plaque pour rien sur des pages sauvegardées ; 8 navigateurs au lieu de 4). Tests e2e 26 s → 8 s (exécution parallèle avec pytest-xdist, et horloge simulée Playwright à la place d'une attente de 12 s).
- **Bug trouvé** : sur une copie Windows (fins de ligne CRLF), le build dev gardait le nom `NextPlaate` au lieu de `NextPlaate (dev)` : il aurait remplacé le script publié dans Tampermonkey. Corrigé dans `scripts/build.mjs`.

### Suivi de la couverture

`docs/COUVERTURE.md` est généré, jamais écrit à la main. À chaque règle corrigée ou plaque trouvée : `python tests/offline/check_db.py` (écrit `data/check.json`), puis `node scripts/coverage.mjs`, puis commit des deux fichiers.

### Étape 1 : capture des pays manquants (branche `refactor/dev-tab`)

- **Prêt** : le build dev capture maintenant les 96 pays du site (page d'ajout puis page de recherche, bouton *Capture everything missing*). Une page sans menu de type (`#ctype`) est notée « pas de page » ; une erreur serveur ou une limite de débit ne l'est pas : le pays reste dans la file et on clique *Continue*.
- **À faire par vous** : lancer la capture dans votre navigateur (session connectée), puis *Write to folder* vers `reference/real/countries`.
- **Ensuite** : analyse des pages (script qui lit sans deviner), mise à jour de `data/` et de `docs/COUVERTURE.md`, puis ajouter les nouveaux codes à `TEST_COUNTRIES` (`src/dev/30-capture.js`) pour que les tests de plaques les parcourent.
- **Tiroir développeur** : boîte *Status* (pages gardées, plaques en base, requêtes, pause du site), boutons du test de plaques rangés par portée (ce pays / tous les pays / résultats). Fichiers `src/dev/` renumérotés : `00-store`, `10-status`, `20-save-page`, `30-capture`, `40-plate-test/`, `50-database`.
- **Vérification du code** : revue ciblée des écritures HTML (`innerHTML`, `setStatus`) : les données de l'utilisateur passent par `esc()`, le reste est du texte du script ; rien à corriger. La revue automatique n'a trouvé qu'un vrai défaut (une erreur passagère du site comptée comme « pas de page »), corrigé. Les recherches sur ce qui est possible sont dans `docs/POSSIBILITES.md`.

### Analyse des 47 pays déjà sauvegardés (branche `data/form-analysis`)

Chaque page d'ajout et de recherche a été lue pays par pays : `data/countries/<cc>/form.json` et `search.json`, résumé dans `docs/FORMULAIRES.md`, tout relancé par `node scripts/refresh-data.mjs`. Ce qu'on a compris :

- **Le menu de type ne s'appelle pas toujours `ctype`** : Andorre et Malte utilisent `drop_2`, les Pays-Bas n'en ont aucun (`fon` n'y décrit que l'apparence de la plaque : la catégorie ne se choisit pas dans le formulaire). Les outils de test ne cherchent que `ctype` : c'est pourquoi ces 3 pays n'ont aucune catégorie vérifiée.
- **Allemagne, « Authorities and federal agencies »** (règle en échec) : le formulaire affiche `fon`, `regionfed`, `regionfed1` et `digit`. La règle actuelle ne lit que le nombre, d'où `7004` au lieu de `BD 16 7004`.
- **441 types dans les formulaires, 481 catégories en recherche** : 431 se correspondent ; les autres sont des noms qui diffèrent (République tchèque 1977/1960, Pologne « Small-size », Allemagne « NATO ») ou les Pays-Bas.
- **Extracteur de champs visibles** : 23 erreurs avant, 0 maintenant (commentaires `// ... {` qui faussaient le comptage des accolades, tables de données de la page absentes). 7 pays n'ont aucune fonction d'affichage (`ad dz lt mt nl si uk`) : on lit alors ce que la page affiche au chargement (`visibleFrom: page-at-load`).
- **`bmObject`** n'est pas propre aux marques : l'Allemagne l'utilise pour « autorité fédérale → codes ». À regarder avant de supposer quoi que ce soit sur les marques et modèles.
- **Capture des 49 autres pays** : en attente des fichiers (rien n'est encore écrit dans `reference/real/countries`).

### Capture des 96 pays (branche `data/all-countries`)

- **Reçu** : 96 pages de recherche, 83 pages d'ajout (plus `cz.html`, de la capture précédente). Sans page d'ajout : `ae au ca mx my nz ps sg sm us va xx`. `docs/FORMULAIRES.md`, `data/` et `docs/COUVERTURE.md` sont régénérés : **96 pays, 829 catégories** (et non 481 : les 49 nouveaux pays en apportent 348).
- **Couverture** : 294 vérifiées (35 %), 3 à corriger, **438 à trouver**, **94 non testables par le formulaire** (Pays-Bas : pas de menu de type ; les 7 pays qui ont une recherche mais pas de page d'ajout : `mx my nz ps sg sm va`).
- **À éclaircir** : pourquoi ces 12 pays (et `cz`) n'ont pas de page d'ajout. La capture notait « pas de page » dès qu'il manquait `#ctype`, ce qui aurait écarté une page valide sans menu (comme celle des Pays-Bas). Corrigé : le formulaire `#frm` suffit désormais, le fichier `index.json` écrit aussi la raison de chaque page ignorée, et un bouton *Forget the "no page" marks and capture again* relance ces pays. Aucun résultat tant que vous ne l'avez pas relancé avec le script dev mis à jour.
- **Extracteur** : 56 erreurs sur les nouveaux pays, 1 maintenant (`kg`, un type). Les pages définissent des tables de données dynamiques (`bmObject*`, `fonOptions56` = îles des Bahamas, `allDivIds`...) : l'extracteur prend leur définition dans la page. Ces tables contiennent des listes d'options (régions, autorités) qui ne sont pas dans le HTML : à exploiter pour les règles.

### Règles corrigées (branche `fix/rules-and-drop2`)

- **3 règles fausses corrigées**, `check_db` 871/871 : Allemagne « Authorities » (`regionfed` + `regionfed1` + `digit`), Ukraine « Work vehicles (1995) » (`digit1` + `region5`, le champ qu'on ne lisait pas), Serbie « Trailers » (deux lettres, chiffres, puis le menu `region2`). Pour la Serbie, le test saisissait les jetons dans l'ordre de la page, qui n'est pas l'ordre de lecture : `TYPING_ORDER` dans `check_db.py` donne l'ordre pour cette catégorie.
- **`drop_2`** (Andorre, Malte) : reconnu par le gestionnaire d'envoi (`01-queue.js`, `05-tab.js`), par les outils de test et par `check_db` via `typeMenuEl()` (`lib/plate/00-helpers.js`). Les Pays-Bas (formulaire sans menu de type) ne provoquent plus d'erreur « no category list » dans le gestionnaire d'envoi : la liste est simplement vide.

### Les 96 pays ont tous une page d'ajout (branche `data/complete-96`)

- **Reçu** : 96 pages d'ajout et 96 pages de recherche. Les 13 pays « sans page d'ajout » n'étaient qu'un défaut de ma capture (elle exigeait `#ctype`) : tous ont un formulaire, y compris `cz`.
- **Trois formes de formulaire** (voir `docs/FORMULAIRES.md`, champ `layout` de `form.json`) : menu de type (`ctype` pour 81 pays, `drop_2` pour `ad mt nz ps sm va`), menu de région seulement (`drop_1` : `ae au ca mx us xx`, plaque en texte libre ; la recherche y filtre par région), texte libre (`my nl sg`).
- **Couverture** : 829 catégories, 297 vérifiées, 0 à corriger, 468 à trouver, 64 non testables par le formulaire (formulaire sans menu de type : `nl`, `mx`, `my`, `sg`).
- **À étudier ensuite** : la recherche de chaque pays a des filtres `region`, `model`, `modgen`, `markamodtype` (marque, modèle, génération) : voir `data/countries/<cc>/search.json`.
