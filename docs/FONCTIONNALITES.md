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
- Lit la plaque tapée dans le formulaire, selon les règles du pays et de la catégorie (`src/lib/plate/`, un fichier par pays).
- Compte les photos de cette plaque sur le site (recherche `gallery.php`). Le nombre est lu dans le titre de la page, donc indépendant de la langue du compte.
- Affiche : « N photos de cette plaque sont déjà sur le site » ou « Pas encore sur le site ».
- Option « Check as I type » : vérifie quand on quitte un champ, qu'on appuie sur Entrée ou qu'on change le type. Pas de vérification en boucle.
- Quand un envoi par lot est en cours, le résultat est gardé sur la photo et affiché en avertissement dans la fenêtre de lot.
- La recherche du site garde les espaces de la plaque (un tiret vaut un espace) : la plaque est lue avec l'espacement de la galerie. Couverture : `COUVERTURE.md`.

### Envoi par lots (tiroir `upload`)
- Ajouter plusieurs photos (ou un dossier), chacune avec ses options.
- Chaque photo s'envoie dans **un onglet à part** (`GM_openInTab`, avec `#pmg=identifiant`), avec un délai aléatoire entre les ouvertures.
- La file est dans IndexedDB (`pmg-batch`) : elle survit à un rechargement.
- Un onglet vivant se signale par un verrou (Web Locks), pour éviter qu'un autre onglet le refasse.
- **Protection Cloudflare** : si le site renvoie une vérification ou une limite, les envois se mettent en pause 15 minutes.
- Touches : `U` (ouvrir la fenêtre de lot), `N` (démarrer), `R` (reprendre).

### Réglages (tiroir `settings`)
- Une case par fonction (`registerFeature({ id, label })`) : décochée, la fonction n'ajoute ni contrôle, ni touche, ni étape d'Échap. Une fonction qui en demande une autre (`requires`) s'éteint avec elle. Le bouton « Apply » recharge la page.
- Le registre est dans `src/core/15-settings.js` : `settings.define(id, défaut, libellé, groupe)`, `settings.get(id)`, `settings.on(id)`, `settings.set(id, valeur)`. Les valeurs sont gardées dans le navigateur (`pmg_set_<id>`). Les autres réglages (`autoCheck`, `delay`, `qDelay`...) y seront migrés au fil des modifications.

### Raccourcis (tiroir `keys`)
- Tous les raccourcis sont modifiables. Le réglage est sauvegardé dans le navigateur (`pmg_*`).
- Échange automatique si une touche est déjà prise.
- Les raccourcis ne s'activent pas quand on tape dans un champ de texte.
- Compatible AZERTY : `Ctrl+A` se lit sur la touche `a` (`e.key`), pas sur la position physique.

### Tags (page d'ajout, `src/features/71-tags.js`)
- La section « Add tags » du site (accordéon fermé, 52 tags à faire défiler, un « + » par tag) est remplacée par une carte : chaque tag est un bouton, rangé dans les 7 groupes du site ; une case de recherche trouve un tag en tapant (Entrée choisit le premier) ; les tags choisis sont des pastilles qu'on retire d'un clic, avec « Clear » ; les plus utilisés et ceux du dernier envoi sont à un clic (« Use again »).
- Les cases du site restent la source de vérité : un clic coche ou décoche la vraie case et déclenche son événement `change`, donc le formulaire part comme avant et le compteur du site (« Tags (3) ») continue de marcher. La section du site est seulement masquée ; l'interrupteur de Settings la rend.
- Ce qui est retenu (compteurs et dernier envoi) l'est à l'envoi du formulaire, dans le navigateur.

### Aperçu de la plaque en direct (page d'ajout, `src/features/69-preview.js`)
- Le site dessine un aperçu de la plaque à partir des champs du pays et propose un bouton « Generate preview » ; tout changement des champs l'efface. Ici le bouton est pressé 0,7 s après la dernière frappe : l'aperçu est toujours là. Seuls les champs du pays comptent (ceux avant la photo), comme pour le site.
- C'est la requête du site lui-même (le script ne fait que cliquer) : jamais deux aperçus à moins de 2 s, rien pendant un chargement, sans plaque, ou quand l'aperçu affiché correspond déjà aux champs. Un aperçu revenu en retard pour d'anciens champs est refait. Interrupteur dans Settings.

### Drapeaux des pays (tiroir `upload`, et sur les pages d'ajout)
- Un drapeau et le nom de chaque pays (96), chacun mène à la page d'ajout du pays (`/xx/add`) ; le pays de la page est encadré. Une case « Find a country… » filtre par nom ou par code. Les colonnes s'adaptent à la place (deux dans la barre ou le tiroir) ; dans la page, la liste défile au-delà de 70 % de la hauteur de l'écran. Un drapeau dont l'image ne charge pas affiche le code du pays.
- **Dans la page** (`/add`, `/xx/add` et le profil d'un membre `/user<id>`, `src/features/68-flags.js`) : à droite du contenu quand l'écran a la place, sans jamais passer sous le panneau même ouvert (la barre et le tiroir prennent 56 + 340 px à droite) ; sur un écran plus étroit, sous la photo dans la colonne de droite (sur un profil : sous l'avatar, dans la colonne de gauche). Sur un profil la barre est alignée sur le haut du contenu. Elle suit le redimensionnement.
- **Choix des pays de la barre** : dans Settings, groupe « Country flags: the side bar », une case par pays (avec une recherche et les boutons All / None). La barre suit tout de suite et le choix est gardé (`flags_chosen`). Avec peu de pays (moins de 13), la case de recherche de la barre disparaît ; avec aucun pays, la barre le dit.
- **Dans le panneau** : le même groupe dans le tiroir d'envoi, avec tous les pays. Un interrupteur (Settings) retire la barre et le groupe.
- Les drapeaux sont les images du site (`/assets/img/profile-flags/<code>.svg`) : rien n'est chargé ailleurs.

### Google Lens (tiroir `search`, pages d'ajout, de modification et de galerie)
- **Recherche automatique** : une photo choisie sur la page d'ajout est cherchée sur Google Lens toute seule, dans un onglet en arrière-plan (option « Search each new photo by itself »). Le bouton **Search this photo on Google Lens** le fait à la demande.
- **Onglet Google** : il se ferme tout seul quand les résultats sont lus ; s'il ne revient rien, il reste ouvert pour que vous voyiez la page.
- **Résultat** : une carte juste sous la photo de la page d'ajout (et le même tableau dans le tiroir Search) (`src/ui/06-inline-card.js`), trois choix pour chacun, le premier mis en avant. Un clic sur un choix remplit les menus du site ; « Fill with the first choices » remplit les trois. Rien n'est rempli sans clic. Si la page n'a pas de bloc photo, la carte se place au-dessus des menus.
- **Comparaison** (`src/lib/vehicle.js`) : les titres des résultats de Lens sont comparés aux menus de PlatesMania (`bmObject`, `modelObject`, `bmgObject`, `modgenObject` de la page d'ajout) : la marque la plus citée, puis ses modèles les plus cités, puis les générations dont les années sont celles des titres.
- **Principe** : le panneau garde la photo (`GM_setValue`) et ouvre `https://www.google.com/?olud&src=pm`. Sur cette page (le marqueur est dans l'adresse), le script colle la photo dans la case « coller un lien d'image » de Google et lance la recherche ; sur la page de résultats qui suit (dans les 3 minutes), il note les titres et le panneau les lit. Une page Google non demandée par le panneau est laissée telle quelle (`src/features/66-lens-google.js`). Limite : cela dépend de la page de Google, qui peut changer.

### Développeur (tiroir `dev`, seulement dans le build dev)
- **Save** : enregistre la page en HTML.
- **Capture** : garde la page d'ajout et de recherche de chaque pays, puis les écrit dans un dossier.
- **Collect only** : une requête de galerie par catégorie sans plaque connue ; distingue une galerie vide (0) d'une galerie dont le texte n'est pas lisible.
- **Verify the reads** : demande au site si la lecture du script est trouvée (`data/verify/reads.json`).
- **Database** : écrit la base, le journal des requêtes, les galeries vides et les résultats de vérification.
- **Plate test** : teste les plaques de la galerie dans le formulaire de chaque catégorie, sur tous les pays, et écrit un rapport (`plates-report.md` et `.json`) et une base (`plates-db.json`, `request-log.json`).

## Fonctionnement technique

### Organisation du code
- `src/meta` : en-tête Tampermonkey.
- `src/core` : point d'entrée, stockage (`store`), détection de la page (`here`), registre des fonctions, raccourcis clavier.
- `src/ui` : icônes, styles, barre et tiroirs.
- `src/lib` : format des plaques (`plate/` : `00-helpers.js` puis un fichier par pays, `PLATE_RULES.<cc>`), file de requêtes vers le site (`http.js`), pays (`countries.js`).
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

### Règles de plaque (`src/lib/plate/`)
- Une règle par pays, et souvent une règle par catégorie : seuls les champs **visibles** pour la catégorie sont lus (les champs cachés gardent une ancienne valeur, source d'erreurs).
- Les menus affichent un libellé, mais leur valeur est un code interne : on lit le libellé.
- Un pays sans règle utilise la lecture générale : les champs visibles, dans l'ordre de la page.

### Données
- `pmg_*` dans `localStorage` : réglages, raccourcis, état du blocage.
- IndexedDB `pmg-batch` : file d'envoi.
- IndexedDB `nextplaate-dev` (dev seulement) : pages capturées, résultats de test, base de plaques, journal des requêtes.

## Tests (`tests/`)

- `python -m pytest tests -q` (dossier `tests/e2e/`) : 77 tests (83 avec le build dev) sur une version simulée du site (`fake_site.py`). Pas d'accès réel à PlatesMania.
- `python tests/offline/check_known.py` : 39 plaques validées à la main, tapées dans les pages sauvegardées.
- `python tests/offline/check_db.py` : toutes les plaques de la base, dans la catégorie correspondante, en parallèle. Hors ligne.
- `scripts/extract-fields.cjs` (données dérivées : `node scripts/build-data.mjs` → `data/`, voir `data/README.md`)
- `scripts/extract-fields.cjs` : lit, pour chaque pays et catégorie, les champs visibles, à partir du JavaScript des pages.

## Limites connues

- La vérification de plaque dépend des règles. Un pays ou une catégorie sans règle vérifiée peut donner un mauvais format.
- Les tests hors ligne prouvent la lecture du script, pas l'acceptation par le site.
- 21 catégories n'ont aucune plaque sur le site, 13 ont une limite du formulaire (`data/limits.json`).
- Pas encore : Regcheck (informations de véhicule, tierce partie), remplissage automatique marque et modèle, compteurs de séries.
