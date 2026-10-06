# PlatesMania - NextPlaate : fonctionnalités

NextPlaate est un script Tampermonkey (userscript) pour [PlatesMania](https://platesmania.com). Il accélère la publication de photos : sélection, description, likes, navigation, envoi par lots et vérification de plaque. Il ne contacte aucun autre service que le site lui-même.

## Toutes les fonctions, une par une

Chaque fonction a un interrupteur dans Settings (sauf Settings elle-même) : éteinte, elle n'ajoute ni contrôle, ni touche. La colonne « Réglage » donne son nom dans Settings. Le détail de chacune est plus bas.

| # | Fonction | Réglage | Où | Ce qu'elle fait | Touche |
|---|---|---|---|---|---|
| 1 | Sélection d'une paire | Photo pair selection | tiroir Describe a pair | choisir la photo avant et la photo arrière | `S` |
| 2 | Lieu et hashtags | Location and hashtags | tiroir Describe a pair | écrits une fois, en tête de chaque description | |
| 3 | Descriptions | Descriptions and auto-fill | page d'édition | remplit la description de chaque photo de la paire, enregistre, retourne à la galerie | `F` |
| 4 | Envoi par lots | Batch upload | tiroir Send photos, fenêtre de lot | file de photos, pays et catégorie par photo, un onglet par photo | `U`, `N`, `R` |
| 5 | Vérification de plaque | Plate check | page d'ajout | combien de photos de cette plaque sont déjà sur le site, 96 pays, 829 catégories | |
| 6 | Aperçu de la plaque en direct | Plate preview as you type | page d'ajout | presse « Generate preview » du site quand la frappe s'arrête | |
| 7 | Google Lens | Google Lens | page d'ajout, tiroir Check a plate | cherche la photo choisie sur Lens, propose marque, modèle et génération | |
| 8 | Sélecteur de tags | Tag picker | page d'ajout, page d'une photo | remplace la section « Add tags » du site et son pop-up | |
| 9 | Information complémentaire | Extra information box | page d'ajout | grande carte à la place de la petite boîte du site | |
| 10 | Likes | Likes | tiroir Browse | like une page ou plusieurs pages avec un délai | `L` |
| 11 | Touches de page | Gallery page keys | galeries | page précédente et suivante au clavier | `A`, `D` |
| 12 | Drapeaux des pays | Country flags | tiroir Send photos, pages d'ajout, profils | un lien par pays vers sa page d'ajout ; pays de la barre au choix | |
| 13 | Raccourcis vers les membres | Member shortcuts | tiroir Browse, profils, barre d'icônes | photo et pseudo des membres, un clic vers leur page ; vous d'abord | |
| 14 | Bouton d'envoi flottant | Floating upload button | page d'ajout | suit en bas de page tant que le bouton Upload du site est hors de vue, et le presse | |
| 15 | Liens de recherche de plaque | Plate lookup links | carte Plate check, tiroir Check a plate | un lien par site public du pays (et recherche d'images), la plaque écrite comme ce site la veut ; liens simples, rien n'est envoyé avant le clic ; chaque site masquable | |
| 16 | Vos photos de ce véhicule | Your photos of this vehicle | page d'ajout | combien de photos de la marque, du modèle, de la génération vous avez déjà, chaque chiffre est un lien | |
| 17 | Registre officiel (NL, IL) | Official register (NL, IL) | carte Plate check | un bouton interroge le registre ouvert du pays (RDW, data.gov.il) : marque, modèle, année, couleur, contrôle ; remplit les menus vides (NL) ; interrogé tout seul (données publiques), réglable | |
| 18 | Compteur de série | Series counter | carte Plate check, pages de série | vos photos de la série de la plaque (84 pays vérifiés sur le vrai site : le plus long groupe de chiffres devient un joker) ; sur une page de série, les numéros présents sur le site | |
| 19 | Vrais uploads | Profile: real uploads | profils | total réel de la galerie et uploads du jour (dès 03 h 30), écart avec le chiffre du profil | |
| 20 | Régions | Profile: regions | profils | régions d'un pays dont vous avez une photo, barre, liste des manquantes ; menu des pays lu sur la page du site | |
| 21 | Carte du monde | World map | tiroir Browse, profils, touche `G` | les pays dont un membre a des photos sur une carte du monde, nuancés selon le nombre de photos, chacun un lien vers ses photos ; vue Europe ; vous ou n'importe quel membre | `G` |
| 22 | Éditeur de raccourcis | Shortcut editor | tiroir Raccourcis | change chaque touche | |
| 23 | Réglages | (verrouillée) | tiroir Settings | un interrupteur par fonction ; choix des pays de la barre | |

Autour de ces fonctions : la barre d'icônes (avec votre photo de profil sous le logo), le message d'état en bas, et pour le développement le tiroir Developer du build dev (capture, test de plaques, vérification des lectures, base).

## Autour des fonctions

- **Logo du panneau** (5.10, `src/features/91-update.js`) : un clic demande à Greasy Fork l'en-tête du script publié (`update.greasyfork.org/.../NextPlaate.meta.js`, CORS ouvert, donc un `fetch` simple), compare les versions chiffre par chiffre et propose *Update now* (page d'installation, où Tampermonkey propose la mise à jour). Rien n'est demandé avant le clic ; le build dev n'est pas comparé.
- **Barre de drapeaux** (5.10) : à côté du contenu s'il y a la place (le tiroir n'est compté que s'il est ouvert) ; sinon un onglet *Add a photo in…* au bord droit, à côté du panneau, qui ouvre la même boîte (Échap ou un clic ailleurs la ferme). Même endroit sur le profil et sur les pages d'ajout, à toute largeur.
- **Compteurs de galerie** : `siteCount` (`src/lib/http.js`) lit le nombre du titre de la page, y compris avec un point de milliers (`38.723`).

## Où chaque fonction marche (le même texte est dans Settings, `src/lib/featureinfo.js`)

La barre suit l'ordre d'usage : **Check a plate** (vérifier ce qu'on va envoyer), **Send photos**, **Describe a pair**, **Browse**, puis Shortcuts et Settings. Chaque case dit en une phrase à quoi elle sert, et Settings donne pour chaque fonction ce qu'elle fait et où elle marche.

| Fonction | Fonctionne pour |
|---|---|
| Plate check | all 96 countries and 829 plate categories (795 checked exactly on real plates) |
| Plate lookup links | every country, with their own sites for 14 |
| Official register | Netherlands and Israel |
| Series counter | 84 countries (checked on the real site) |
| Your photos of this vehicle | every country |
| Google Lens | every country |
| Extra information | every country |
| Tag picker | every country |
| Plate preview | every country |
| Floating upload button | every upload page |
| Country flags | every country |
| Batch upload | every country |
| Photo pair selection | every gallery |
| Location and hashtags | everywhere |
| Descriptions | every country |
| Likes | every gallery |
| Gallery page keys | every gallery |
| Member shortcuts | everywhere |
| Profile: real uploads | every member |
| Profile: regions | every country the site has regions for |
| World map | every member |
| Shortcut editor | everywhere |

## Installation et version

- Fichier public : `nextplaate.user.js` (généré par `node scripts/build.mjs`).
- Fichier de développement : `nextplaate.dev.user.js` (`node scripts/build.mjs --dev`), avec les outils de test. Il ne doit jamais être publié.
- Le script ne fonctionne que sur `platesmania.com` et ses sous-domaines.

## Interface

- Une **barre d'icônes** à droite de la page. Chaque icône ouvre un **tiroir** (panneau qui glisse sur la page).
- Un **message d'état** en bas au centre (`setStatus`), qui disparaît après 6 secondes, sauf si on le rend permanent.
- L'interface est dans un **Shadow DOM** (`#pmg-host`), pour ne pas être touchée par le CSS du site.

## Tiroirs et fonctions

### Describe a pair (tiroir `pair`, en quatre étapes numérotées)
- **Étape 1, Selection** : dans une galerie, choisir la photo avant puis la photo arrière du même véhicule (`S`). **Étape 2, Details** : lieu et hashtags, écrits en tête de chaque description. **Étape 3, Description** : sur la page d'édition d'une photo, écrit la description (vos détails, puis l'autre face de la paire en lien et vignette) (`F`) ; sans paire choisie, elle écrit vos détails seulement, et jamais par-dessus un texte déjà là ; l'écriture automatique n'a lieu que pour une paire choisie. **Étape 4, Automation** (facultative) : le script fait les clics (ouvrir l'édition, remplir, enregistrer, revenir à la galerie).
- **Sélection** : choisir la photo de gauche et celle de droite (paire), pour les posts avant/arrière. Touche `S`.
- **Détails** : lieu et hashtags, remplis une fois et réutilisés.
- **Description** : remplit la description (avant/arrière) sur la page d'édition. Touche `F`. Options automatiques, retour à la galerie.
- **Automatisation** : enchaîne sélection, description et envoi.

### Browse (tiroir `gallery`)
- **Likes** : like la page en cours, ou plusieurs pages, avec un délai entre chaque like. Touche `L`.
- **Pages** : boutons précédent et suivant, touches `A` (précédent) et `D` (suivant).

### Vérification de plaque (tiroir `plate`, sur la page d'ajout)
- Lit la plaque tapée dans le formulaire, selon les règles du pays et de la catégorie (`src/lib/plate/`, un fichier par pays).
- Compte les photos de cette plaque sur le site (recherche `gallery.php`). Le nombre est lu dans le titre de la page, donc indépendant de la langue du compte.
- Affiche : « N photos de cette plaque sont déjà sur le site » ou « Pas encore sur le site ».
- Option « Check as I type » : vérifie quand on quitte un champ, qu'on appuie sur Entrée ou qu'on change le type. Pas de vérification en boucle.
- Quand un envoi par lot est en cours, le résultat est gardé sur la photo et affiché en avertissement dans la fenêtre de lot.
- La recherche du site garde les espaces de la plaque (un tiret vaut un espace) : la plaque est lue avec l'espacement de la galerie. Couverture : `COUVERTURE.md`.
- **Le véhicule des photos déjà sur le site** (5.9) : la même page de résultats donne les liens de catalogue (`gallery.php?markaavto=&model=&modgen=`) des photos de la plaque ; le véhicule le plus fréquent est proposé dans la carte, et *Fill the menus* remplit marque, modèle et génération (`vehicleFill`).
- **La carte en sections** (5.10) : *On the site* (le véhicule des photos, *Fill the menus*, le lien vers les photos), *Official register* (NL, IL), *Your photos* (une phrase : *In the series HF-*-QQ: you have 2 photos*), et les sites de recherche repliés sous une ligne (*Look up this plate on other sites (13)*).
- **La carte** (`pmg-plate-card`, au-dessus des menus du véhicule) réunit : le compte, le véhicule, **votre nombre de photos de la série** (voir Compteur de série), le bouton du registre officiel (NL, IL) et les liens de recherche.

### Send photos (tiroir `upload`) : un pays pour la photo, l'envoi par lots
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

### Information complémentaire (page d'ajout, `src/features/72-extra.js`)
- **Date de la photo** (5.9) : le site liste les dates EXIF sous la photo choisie (`#fotodiv`, `span[onclick^="appdop"]`) ; la plus ancienne est la prise de vue. Deux boutons ajoutent la date sur une ligne à part (*Date: October 2026*, *4 October 2026*) ; ils apparaissent et disparaissent avec la photo.
- La petite boîte de trois lignes du site (« Extra information ») devient une grande carte au style du panneau : haute dès le départ, elle grandit avec le texte, rappelle l'indication du site, compte les caractères et propose « Use my location » (le lieu enregistré dans Détails, jamais sa valeur par défaut).
- Elle est au-dessus de la carte des tags, avec un espace net entre les deux (toutes les cartes laissent maintenant 20 px dessous).
- La boîte du site reste la source de vérité : masquée, remplie à chaque frappe (avec son événement `input`), donc le formulaire part comme avant. Ce qu'écrit le site dans sa boîte apparaît dans la carte. Interrupteur dans Settings.

### Tags (page d'ajout, `src/features/71-tags.js`)
- La section « Add tags » du site (accordéon fermé, 52 tags à faire défiler, un « + » par tag) est remplacée par une carte : chaque tag est un bouton, rangé dans les 7 groupes du site ; une case de recherche trouve un tag en tapant (Entrée choisit le premier) ; les tags choisis sont des pastilles qu'on retire d'un clic, avec « Clear » ; les plus utilisés et ceux du dernier envoi sont à un clic (« Use again »).
- Les cases du site restent la source de vérité : un clic coche ou décoche la vraie case et déclenche son événement `change`, donc le formulaire part comme avant et le compteur du site (« Tags (3) ») continue de marcher. La section du site est seulement masquée ; l'interrupteur de Settings la rend.
- **Page d'une photo** : le même sélecteur remplace le pop-up du site. Le lien « add tags » / « edit tags » ouvre une fenêtre à notre style (`src/ui/07-modal.js`) avec les tags déjà posés cochés. « Save » presse le bouton Save du site lui-même : le site enregistre les tags exactement comme avant. « Cancel », la croix, Échap et un clic à côté rendent les cases comme elles étaient. La fenêtre ne passe jamais sous la barre du panneau.
- Ce qui est retenu (compteurs et dernier envoi) l'est à l'envoi du formulaire ou à « Save », dans le navigateur.

### Aperçu de la plaque en direct (page d'ajout, `src/features/69-preview.js`)
- Le site dessine un aperçu de la plaque à partir des champs du pays et propose un bouton « Generate preview » ; tout changement des champs l'efface. Ici le bouton est pressé 0,7 s après la dernière frappe : l'aperçu est toujours là. Seuls les champs du pays comptent (ceux avant la photo), comme pour le site.
- C'est la requête du site lui-même (le script ne fait que cliquer) : jamais deux aperçus à moins de 2 s, rien pendant un chargement, sans plaque, ou quand l'aperçu affiché correspond déjà aux champs. Un aperçu revenu en retard pour d'anciens champs est refait. Interrupteur dans Settings.

### Raccourcis vers les membres (tiroir `gallery`, et sur un profil, `src/features/73-members.js`)
- Les profils que vous visitez souvent : chacun avec sa photo et son pseudo ; un clic mène à la page du membre (`/user<id>`). Sans photo enregistrée, l'initiale du pseudo la remplace.
- **Vous d'abord** : le membre connecté (lu dans la barre du haut du site) est toujours la première ligne, marquée « You » ; elle ne se déplace ni ne se retire, et vous n'êtes jamais listé deux fois. Votre photo est gardée depuis votre propre page, ou lue une fois en arrière-plan.
- **Regarder, c'est propre** : seulement les lignes. Sur le profil d'un autre membre, une **étoile** dans le titre l'enregistre (ou le retire) ; elle n'est pas proposée sur votre propre page. À partir de neuf membres, une case de recherche.
- **Modifier** (bouton « Edit », puis « Done ») : chaque ligne reçoit une poignée (⋮⋮) pour la glisser (une barre bleue montre où elle tombe, jamais au-dessus de vous ; ou le focus sur la poignée et les flèches Haut / Bas), une croix pour la retirer, et une case pour ajouter un membre par son numéro (`121546`) ou le lien de sa page (page lue une fois par la file de requêtes du script). Le mode est le même dans le panneau et sur la page. Le glisser-déposer ne marche pas au doigt : les flèches du clavier restent possibles.
- **Dans la barre d'icônes** : votre photo de profil, sous le logo, dans un cercle de la taille des boutons de la barre (40 px), cerclé du bleu clair du reste ; un clic mène à votre page, et le cercle est cerné plus fort quand vous y êtes. Rien si personne n'est connecté.
- **Sur un profil** : la liste est à gauche du contenu, à la hauteur de la photo de profil (les drapeaux sont à droite) ; sur un écran plus étroit, sous la photo, dans la colonne de gauche. Le membre de la page est encadré. La liste est gardée dans le navigateur. Interrupteur dans Settings.

### Drapeaux des pays (tiroir `upload`, et sur les pages d'ajout)
- **Page `/add`** (5.10, `src/features/67-country-page.js`) : la liste déroulante et le bouton du site deviennent une carte de grands drapeaux (40 px) avec une recherche par nom ou code (Entrée ouvre le premier résultat) et les derniers pays ouverts en tête (clé `recent_countries`). La liste est celle du menu du site (`#mySelect`), la boîte du site est masquée, pas retirée. Les autres pages d'ajout gardent la barre latérale.
- Un drapeau et le nom de chaque pays (96), chacun mène à la page d'ajout du pays (`/xx/add`) ; le pays de la page est encadré. Une case « Find a country… » filtre par nom ou par code. Les colonnes s'adaptent à la place (deux dans la barre ou le tiroir) ; dans la page, la liste défile au-delà de 70 % de la hauteur de l'écran. Un drapeau dont l'image ne charge pas affiche le code du pays.
- **Dans la page** (`/add`, `/xx/add` et le profil d'un membre `/user<id>`, `src/features/68-flags.js`) : à droite du contenu quand l'écran a la place, sans jamais passer sous le panneau même ouvert (la barre et le tiroir prennent 56 + 340 px à droite) ; sur un écran plus étroit, sous la photo dans la colonne de droite (sur un profil : sous l'avatar, dans la colonne de gauche). Sur un profil la barre est alignée sur le haut du contenu. Elle suit le redimensionnement.
- **Choix des pays de la barre** : dans Settings, groupe « Country flags: the side bar », une case par pays (avec une recherche et les boutons All / None). La barre suit tout de suite et le choix est gardé (`flags_chosen`). Avec peu de pays (moins de 13), la case de recherche de la barre disparaît ; avec aucun pays, la barre le dit.
- **Dans le panneau** : le même groupe dans le tiroir d'envoi, avec tous les pays. Un interrupteur (Settings) retire la barre et le groupe.
- Les drapeaux sont les images du site (`/assets/img/profile-flags/<code>.svg`) : rien n'est chargé ailleurs.

### Google Lens (tiroir `search`, pages d'ajout, de modification et de galerie)
- **Recherche automatique** : une photo choisie sur la page d'ajout est cherchée sur Google Lens toute seule, dans un onglet en arrière-plan (option « Search each new photo by itself »). Le bouton **Search this photo on Google Lens** le fait à la demande.
- **Onglet Google** : il se ferme tout seul quand les résultats sont lus ; s'il ne revient rien, il reste ouvert pour que vous voyiez la page.
- **Lecture de la carte** (5.10) : *Best match* (marque › modèle › génération en une ligne et le bouton *Fill the menus*), *Google calls it* (les noms de Google), puis *Not right? Pick another* (les trois colonnes de choix).
- **Résultat** : une carte juste sous la photo de la page d'ajout (et le même tableau dans le tiroir Check a plate) (`src/ui/06-inline-card.js`), trois choix pour chacun, le premier mis en avant. Un clic sur un choix remplit les menus du site ; « Fill with the first choices » remplit les trois. Rien n'est rempli sans clic. Si la page n'a pas de bloc photo, la carte se place au-dessus des menus.
- **Google calls it** (5.9, nommé *Google says* à l'origine) : la page Google est lue aussi pour ce que Google appelle lui-même le véhicule (les pastilles « recherches similaires » : liens avec une vignette et un `kgmid` ou `lns_surface`, lus dans l'adresse donc dans toutes les langues). Ces noms comptent comme cinq titres dans la comparaison, s'affichent en une ligne *Google calls it*, et un clic en tape un dans la case « marque et modèle » du site (`vehicleSearchBox`, `#markamodtype`) : la sortie quand les menus ne connaissent pas le véhicule. Une page de recherche Google n'est prise comme réponse que si son adresse porte des paramètres Lens (`lns_`).
- **Comparaison** (`src/lib/vehicle.js`) : les titres des résultats de Lens sont comparés aux menus de PlatesMania (`bmObject`, `modelObject`, `bmgObject`, `modgenObject` de la page d'ajout) : la marque la plus citée, puis ses modèles les plus cités, puis les générations dont les années sont celles des titres.
- **Principe** : le panneau garde la photo (`GM_setValue`) et ouvre `https://www.google.com/?olud&src=pm`. Sur cette page (le marqueur est dans l'adresse), le script colle la photo dans la case « coller un lien d'image » de Google et lance la recherche ; sur la page de résultats qui suit (dans les 3 minutes), il note les titres et le panneau les lit. Une page Google non demandée par le panneau est laissée telle quelle (`src/features/66-lens-google.js`). Limite : cela dépend de la page de Google, qui peut changer.

### Bouton d'envoi flottant (page d'ajout, `src/features/74-upload-button.js`)
- Tant que le bouton Upload du site est hors de vue (`IntersectionObserver`), un bouton **Upload** suit en bas de page, aligné sur le contenu ; il appuie sur le vrai bouton (`real.click()`). Interrupteur *Floating upload button*.

### Liens de recherche de plaque (carte Plate check et tiroir `search`, `src/features/75-lookups.js`, `src/lib/lookups.js`)
- Pour la plaque lue, un lien par site public du pays (liste `LOOKUP_SITES`) et des recherches d'images valables partout (Google Images, Wikimedia Commons, DuckDuckGo, Yandex, Flickr, Autogespot). Chaque lien écrit la plaque comme ce site la veut (`squash`, `hyphen` ou `raw`).
- Ce sont de simples liens (nouvel onglet, `noopener noreferrer`) : rien n'est envoyé avant le clic, rien n'est lu chez ces sites. Chaque site se masque dans Settings (clé `lookup_hidden`).
- Pays avec des sites propres : nl, se, ua, uk (dont l'historique MOT de GOV.UK), dk, no, fr, es, it, fi, sk, ie, is, ch, nz (Carjam). Les autres pays n'ont que les liens généraux ; presque aucun pays n'a de site gratuit et officiel qui répond à une plaque (voir la recherche dans `CHANGELOG.md`).

### Registre officiel (carte Plate check, `src/features/80-registry.js`, `src/lib/registries.js`)
- Pour les Pays-Bas (RDW open data) et Israël (data.gov.il), un bouton interroge le registre ouvert du pays : marque, modèle, année, couleur, fin du contrôle technique. Les deux répondent en JSON, sans clé, avec `access-control-allow-origin: *` (vérifié), donc un `fetch` simple suffit.
- Ces registres sont des données publiques ouvertes : **le script les interroge tout seul** dès que la vérification de plaque a lu la plaque (5.10), et seule la plaque part. Deux réglages (Settings, *Official register*) : interroger seulement au clic ; ne pas remplir les menus. Les menus ne sont remplis que s'ils sont tous vides, une seule fois par plaque (un choix à vous n'est jamais écrasé). La réponse est gardée pour la visite. Pour les Pays-Bas, *Fill the menus* compare marque et modèle aux menus du site comme Lens. Israël donne la marque en hébreu : l'information est affichée, les menus ne sont pas remplis.

### Compteur de série (carte Plate check et pages de série, `src/features/79-series.js`)
- La série d'une plaque est sa recherche rapide (`gallery.php?fastsearch=`) avec le plus long groupe de chiffres en joker : `HF-137-QQ` donne `HF * QQ`, `AA 7181` donne `AA *`, `01 A 123 ZZ` donne `01 A * ZZ` (`seriesQuery`). Une seule lettre collée après les chiffres derrière un séparateur (`FAJ 04A`) ne donne pas de série : le site ne trouve rien.
- Dans la carte : *your photos in the series HF-*-QQ*, le chiffre est un lien vers ces photos (recherche + `&usr=<vous>`, une requête, gardée pour la visite). Le chiffre est confirmé sur le vrai site pour la France et le Luxembourg.
- Activé pour 84 pays (`SERIES_COUNTRIES`) : ceux où l'outil *Series check* (build dev) a retrouvé deux vraies plaques par leur recherche de série. Pas dans la liste : bh, eg, ir, ke, qa, sa (plaques de chiffres seuls ou en chiffres arabes ou persans) et ch (preuve trop faible).
- Sur une page de série du site (`/fr/series-HF-QQ-1`, les 999 numéros) : combien de numéros ont une photo (cases avec vignette, les autres proposent d'envoyer ce numéro), lesquels (liens), et vos photos de la série.

### Vos photos de ce véhicule (page d'ajout, `src/features/77-mine.js`)
- Sous les menus marque, modèle et génération : combien de photos de chaque niveau vous avez déjà (`gallery.php?usr=<vous>&markaavto=&model=&modgen=`, le niveau le plus précis d'abord, par la file de requêtes, gardé pour la visite). Chaque chiffre est un lien. La carte suit les menus quelle que soit la façon dont ils sont remplis (vous, la vérification de plaque, Lens).

### Profil : vrais uploads (pages `/user<id>`, `src/features/76-profile.js`)
- Le chiffre « uploaded » d'un profil est une statistique que le site recalcule de temps en temps ; son `(+n)` court depuis ce calcul, pas depuis aujourd'hui. La carte lit la galerie du membre, toujours à jour : le total réel et les uploads du jour (de 03 h 30 locale à 03 h 30 le lendemain, `date1`, `date2`, `tz_offset`), l'écart avec le chiffre du profil, et un lien vers les photos du jour. Deux requêtes.
- Vérifié sur deux profils réels : les sommes du tableau par pays égalent les chiffres du haut (photos, likes reçus, commentaires reçus).

### Profil : régions (pages `/user<id>`, `src/features/78-regions.js`)
- Un bouton lit `userreg.php?gallery=<système>-<id>` (rien n'est demandé au chargement) : une ligne par région, le nombre de photos en lien quand il y en a, un tiret sinon, et un menu `select[name=gallery]` qui liste tous les systèmes de tous les pays (aucune liste dans le script). La carte montre « X / Y régions », une barre, les régions vues (liens vers vos photos) et les manquantes. Chaque système est demandé une fois.

### Carte du monde (tiroir `gallery`, profils, touche `G`, `src/features/81-worldmap.js`, `src/lib/worldmap.js`)
- Une fenêtre (comme celle de l'envoi par lots) avec le monde en SVG : chaque pays dont le membre a des photos est rempli en cinq nuances du bleu du panneau (1, 2-9, 10-49, 50-199, 200 et plus). Chaque pays est un lien vers les photos du membre dans ce pays (`gallery.php?usr=`), avec ses chiffres en texte de survol. Les petits pays sans forme sur la carte sont des points ; USSR et les États non reconnus sont listés sous la carte, et une liste de tous les pays est là pour le clavier. Une vue *Europe* zoome là où sont la plupart des photos.
- Qui : vous (le membre connecté), ou n'importe qui : une case prend un numéro ou le lien d'un profil, et les membres enregistrés sont à un clic. Les chiffres sont ceux du profil du membre (`table` des pays, liens `/usercountry-<pays>-<id>`) : une page lue par la file de requêtes, ou aucune sur le profil même ; gardés pour la visite.
- La carte est fabriquée par `tools/build-worldmap.mjs` (Natural Earth, domaine public, via le paquet world-atlas ; projection Equal Earth, sans l'Antarctique) : une forme par pays du site (`uk` est le Royaume-Uni), un seul tracé pour tous les autres, des points pour les petits pays lus sur la carte au 1:50 000 000.

#### Les régions d'un pays (dans la même fenêtre, `83-regionmap.js`, `lib/regions-geo.js`, `lib/regions-match.js`, `lib/regions-levels.js`)
- Sous la carte du monde, *Regions of:* liste les pays où le membre a des photos et qui ont une carte (28 pays). Un choix dessine les régions du pays (départements, districts, États...) nuancées selon les photos du membre, avec le même zoom et déplacement (`lib/panzoom.js`) ; chaque région avec photos est un lien vers ses photos ; les régions sans forme sont listées dessous avec leurs photos ; la licence des contours est affichée.
- Les régions et les photos viennent des statistiques de régions du site (`userreg.php`, une page par système du pays : fr1 et fr2 pour la France) : deux dispositions de tableau, avec une colonne de code (7 cellules) ou sans (6 : Serbie, Turquie, Vietnam...) ; la ligne « sans région » n'est pas une région.
- Les contours viennent de **geoBoundaries** (CC-BY 4.0, API publique et ouverte), chargés à la demande, simplifiés au chargement (projection équirectangulaire corrigée de la latitude, 1000 unités de large, points trop proches supprimés) ; rien n'est embarqué dans le script. Rapprochement par nom normalisé puis par code ISO 3166-2 (`regionMatch`).
- Quels pays : `lib/regions-levels.js`, écrit par `tools/measure-regions.py` à partir des pages collectées (`reference/real/regions/`) : un pays n'a une carte que si au moins sept régions sur dix trouvent leur forme (France 88 %, Italie 83 %, Serbie 87 %, Turquie 100 %...). Les autres (Allemagne 37 % : 772 codes de plaque contre 428 Kreise ; Pologne, Royaume-Uni, Japon...) gardent le tableau, en attendant un rapprochement travaillé.

### À propos et nouveautés (tiroir `settings`, `src/features/90-about.js`, `src/lib/whatsnew.js`)
- Signature « © 2026 NextEnzzo » avec le lien du profil (`@author`, `@copyright`, bannière de la console aussi). Le bouton *What's new* ouvre la fenêtre des nouveautés ; elle s'ouvre seule une fois après une mise à jour (pas à la première installation). Son texte est dans `whatsnew.js` ; un test échoue si `@version` change sans son entrée.

### Développeur (tiroir `dev`, seulement dans le build dev)
- **Save** : enregistre la page en HTML.
- **Capture** : garde la page d'ajout et de recherche de chaque pays, puis les écrit dans un dossier.
- **Collect only** : une requête de galerie par catégorie sans plaque connue ; distingue une galerie vide (0) d'une galerie dont le texte n'est pas lisible.
- **Verify the reads** : demande au site si la lecture du script est trouvée (`data/verify/reads.json`).
- **Database** : écrit la base, le journal des requêtes, les galeries vides et les résultats de vérification.
- **Plate test** : teste les plaques de la galerie dans le formulaire de chaque catégorie, sur tous les pays, et écrit un rapport (`plates-report.md` et `.json`) et une base (`plates-db.json`, `request-log.json`).
- **Outil hors build** `tools/measure-regions.py` : mesure, pays par pays, combien de régions trouvent leur forme (niveaux ADM1 à ADM3 de geoBoundaries, jusqu'à 600 formes) et écrit `src/lib/regions-levels.js` (`--table` : seulement le tableau). Les formes téléchargées sont gardées dans `reference/real/regions/shapes/`.
- **Regions collection** : lit le tableau des régions de chaque pays (`userreg.php`, environ 90 requêtes, par la file de requêtes, reprend là où elle s'est arrêtée) et écrit les pages dans un dossier (`reference/real/regions/`), pour relier les régions de chaque pays aux formes d'une carte hors ligne.
- **Series check** : pour deux vraies plaques par pays (91 pays), construit la recherche de série (le plus long groupe de chiffres devient un joker : `HF-137-QQ` donne `HF * QQ`), la demande au site et note si la plaque revient ; les pays où elle revient seront activés pour le compteur de série.
- **Series collection** : pour les 55 pays dont les pages renvoient vers un tableau de séries, lit le tableau, une page de série et la recherche à joker du site avec votre numéro de membre (environ trois requêtes par pays, reprend là où elle s'est arrêtée), puis écrit le tout dans un dossier (`reference/real/series/`) pour construire le compteur de série de ces pays hors ligne.

## Fonctionnement technique

### Organisation du code
- `src/meta` : en-tête Tampermonkey.
- `src/core` : point d'entrée, stockage (`store`), détection de la page (`here`), registre des fonctions, raccourcis clavier.
- `src/ui` : icônes, styles, barre et tiroirs.
- `src/lib` : format des plaques (`plate/` : `00-helpers.js` puis un fichier par pays, `PLATE_RULES.<cc>`), file de requêtes vers le site (`http.js`), pays (`countries.js`), véhicule (`vehicle.js`), pont entre sites (`bridge.js`), sites de recherche (`lookups.js`), registres ouverts (`registries.js`), texte des nouveautés (`whatsnew.js`).
- `src/features` : une fonction par fichier (pair, details, description, likes, pages, plate, shortcuts, lens, flags, preview, tags, extra, members, bouton flottant, liens, profil, vos photos, régions, séries, registre, à propos), et `upload/` pour les envois par lots.
- `src/boot` : démarrage.
- `src/dev` : outils de développement (seulement dans le build dev).
- `scripts/build.mjs` assemble les fichiers dans l'ordre et vérifie qu'aucun fichier n'est oublié.

### Registre des fonctions
Un groupe peut porter `lazy: true` : il est construit à la première ouverture de son tiroir (listes longues que personne ne voit avant), pas au chargement de la page. Un groupe sans `lazy` est construit tout de suite, car l'`init` de sa fonction y cherche ses contrôles.

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

- `python -m pytest -q` (dossier `tests/e2e/`) : 412 tests (417 avec le build dev, `NEXTPLAATE_SCRIPT=nextplaate.dev.user.js`) sur une version simulée du site (`fake_site.py`, avec une fausse page Google pour le Lens). Un fichier par fonction (`test_lens.py`, `test_tags.py`, `test_members.py`, `test_flags.py`, `test_extra.py`, `test_preview.py`…), plus `test_style.py` (couleurs, rayons, tailles, hauteurs) et `test_responsive.py` (aucun débordement de 320 à 1280 px). Pas d'accès réel à PlatesMania ni à Google.
- `python tests/offline/check_known.py` : 39 plaques validées à la main, tapées dans les pages sauvegardées.
- `python tests/offline/check_db.py` : toutes les plaques de la base, dans la catégorie correspondante, en parallèle. Hors ligne.
- Les données dérivées : `node scripts/refresh-data.mjs` → `data/` et `docs/COUVERTURE.md` (voir `data/README.md`).
- `scripts/extract-fields.cjs` : lit, pour chaque pays et catégorie, les champs visibles, à partir du JavaScript des pages.

## Limites connues

- La vérification de plaque dépend des règles. Un pays ou une catégorie sans règle vérifiée peut donner un mauvais format.
- Les tests hors ligne prouvent la lecture du script, pas l'acceptation par le site.
- 21 catégories n'ont aucune plaque sur le site, 13 ont une limite du formulaire (`data/limits.json`).
- Registre officiel : seulement les Pays-Bas et Israël (les seuls registres gratuits, sans clé et ouverts trouvés).
- Compteur de série : 84 pays vérifiés (recherche retrouvée) ; le chiffre « vos photos » est confirmé pour la France et le Luxembourg seulement.
- « Your photos of this vehicle » suppose que `usr` se combine avec marque, modèle, génération dans `gallery.php` (confirmé par l'usage).
- Liens de recherche : seulement 14 pays ont des sites propres, les autres ont les liens généraux.
- Pas encore : réorganisation des icônes et explication fonction par fonction (voir `TODO.md`).
