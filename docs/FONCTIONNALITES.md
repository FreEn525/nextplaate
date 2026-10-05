# PlatesMania - NextPlaate : fonctionnalités

NextPlaate est un script Tampermonkey (userscript) pour [PlatesMania](https://platesmania.com). Il accélère la publication de photos : sélection, description, likes, navigation, envoi par lots et vérification de plaque. Il ne contacte aucun autre service que le site lui-même.

## Installation et version

- Fichier public : `nextplaate.user.js` (généré par `node scripts/build.mjs`).
- Fichier de développement : `nextplaate.dev.user.js` (`node scripts/build.mjs --dev`), avec les outils de test. Il ne doit jamais être publié.
- Le script ne fonctionne que sur `platesmania.com` et ses sous-domaines.

## Interface

- Une **barre d'icônes** à droite de la page. Chaque icône ouvre un **tiroir** (panneau qui glisse sur la page).
- Un **message d'état** en bas au centre (`setStatus`), qui disparaît après 6 secondes, sauf si on le rend permanent.
- L'interface est dans un **Shadow DOM** (`#pmg-host`), pour ne pas être touchée par le CSS du site.

## Tiroirs et fonctions

### Photos (tiroir `pair`)
- **Sélection** : choisir la photo de gauche et celle de droite (paire), pour les posts avant/arrière. Touche `S`.
- **Détails** : lieu et hashtags, remplis une fois et réutilisés.
- **Description** : remplit la description (avant/arrière) sur la page d'édition. Touche `F`. Options automatiques, retour à la galerie.
- **Automatisation** : enchaîne sélection, description et envoi.

### Galerie (tiroir `gallery`)
- **Likes** : like la page en cours, ou plusieurs pages, avec un délai entre chaque like. Touche `L`.
- **Pages** : boutons précédent et suivant, touches `A` (précédent) et `D` (suivant).

### Vérification de plaque (tiroir `plate`, sur la page d'ajout)
- Lit la plaque tapée dans le formulaire, selon les règles du pays et de la catégorie (`src/lib/plate.js`).
- Compte les photos de cette plaque sur le site (recherche `gallery.php`). Le nombre est lu dans le titre de la page, donc indépendant de la langue du compte.
- Affiche : « N photos de cette plaque sont déjà sur le site » ou « Pas encore sur le site ».
- Option « Check as I type » : vérifie quand on quitte un champ, qu'on appuie sur Entrée ou qu'on change le type. Pas de vérification en boucle.
- Quand un envoi par lot est en cours, le résultat est gardé sur la photo et affiché en avertissement dans la fenêtre de lot.

### Envoi par lots (tiroir `upload`)
- Ajouter plusieurs photos (ou un dossier), chacune avec ses options.
- Chaque photo s'envoie dans **un onglet à part** (`GM_openInTab`, avec `#pmg=identifiant`), avec un délai aléatoire entre les ouvertures.
- La file est dans IndexedDB (`pmg-batch`) : elle survit à un rechargement.
- Un onglet vivant se signale par un verrou (Web Locks), pour éviter qu'un autre onglet le refasse.
- **Protection Cloudflare** : si le site renvoie une vérification ou une limite, les envois se mettent en pause 15 minutes.
- Touches : `U` (ouvrir la fenêtre de lot), `N` (démarrer), `R` (reprendre).

### Raccourcis (tiroir `keys`)
- Tous les raccourcis sont modifiables. Le réglage est sauvegardé dans le navigateur (`pmg_*`).
- Échange automatique si une touche est déjà prise.
- Les raccourcis ne s'activent pas quand on tape dans un champ de texte.
- Compatible AZERTY : `Ctrl+A` se lit sur la touche `a` (`e.key`), pas sur la position physique.

### Développeur (tiroir `dev`, seulement dans le build dev)
- **Save** : enregistre la page en HTML.
- **Capture** : garde la page d'ajout et de recherche de chaque pays, puis les écrit dans un dossier.
- **Plate test** : teste les plaques de la galerie dans le formulaire de chaque catégorie, sur tous les pays, et écrit un rapport (`plates-report.md` et `.json`) et une base (`plates-db.json`, `request-log.json`).

## Fonctionnement technique

### Organisation du code
- `src/meta` : en-tête Tampermonkey.
- `src/core` : point d'entrée, stockage (`store`), détection de la page (`here`), registre des fonctions, raccourcis clavier.
- `src/ui` : icônes, styles, barre et tiroirs.
- `src/lib` : format des plaques (`plate.js`), file de requêtes vers le site (`http.js`), pays (`countries.js`).
- `src/features` : une fonction par fichier (pair, details, description, likes, pages, plate, shortcuts), et `upload/` pour les envois par lots.
- `src/boot` : démarrage.
- `src/dev` : outils de développement (seulement dans le build dev).
- `scripts/build.mjs` assemble les fichiers dans l'ordre et vérifie qu'aucun fichier n'est oublié.

### Registre des fonctions
Chaque fonction s'enregistre avec `registerFeature({ groups, keys, onEscape, init })`. Au démarrage, `mountApp()` assigne les actions, reconstruit les raccourcis, monte la barre, lance les `init` et prépare la touche Échap.

### Requêtes vers le site (`src/lib/http.js`)
- **Une requête à la fois**, avec **3 secondes** entre deux.
- Délai d'attente : 15 secondes.
- Au premier signe de blocage (erreur 1015, 429, page de vérification Cloudflare), **toutes** les requêtes s'arrêtent 15 minutes. L'arrêt est gardé dans le navigateur, donc les autres pages le savent aussi.
- Les comptages sont mis en cache pour la page en cours.

### Règles de plaque (`src/lib/plate.js`)
- Une règle par pays, et souvent une règle par catégorie : seuls les champs **visibles** pour la catégorie sont lus (les champs cachés gardent une ancienne valeur, source d'erreurs).
- Les menus affichent un libellé, mais leur valeur est un code interne : on lit le libellé.
- Un pays sans règle utilise la lecture générale : les champs visibles, dans l'ordre de la page.

### Données
- `pmg_*` dans `localStorage` : réglages, raccourcis, état du blocage.
- IndexedDB `pmg-batch` : file d'envoi.
- IndexedDB `nextplaate-dev` (dev seulement) : pages capturées, résultats de test, base de plaques, journal des requêtes.

## Tests (`tests/`)

- `python -m pytest tests -q` (dossier `tests/e2e/`) : 37 tests sur une version simulée du site (`fake_site.py`). Pas d'accès réel à PlatesMania.
- `python tests/offline/check_known.py` : 16 plaques validées à la main, tapées dans les pages sauvegardées.
- `python tests/offline/check_db.py` : toutes les plaques de la base, dans la catégorie correspondante, en parallèle. Hors ligne.
- `python tests/offline/check_formats.py` : les exemples de format affichés par le site, dans les pages sauvegardées.
- `scripts/extract-fields.cjs` (données dérivées : `node scripts/build-data.mjs` → `data/`, voir `data/README.md`)
- `scripts/extract-fields.cjs` : lit, pour chaque pays et catégorie, les champs visibles, à partir du JavaScript des pages.

## Limites connues

- La vérification de plaque dépend des règles. Un pays ou une catégorie sans règle vérifiée peut donner un mauvais format.
- Les tests hors ligne prouvent la lecture du script, pas l'acceptation par le site.
- Certaines catégories n'ont pas de plaque connue (détail dans le rapport).
- Pas encore : Regcheck (informations de véhicule, tierce partie), remplissage automatique marque et modèle, compteurs de séries.
