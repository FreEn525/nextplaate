# Analyse des scripts publics de PlatesMania

Les 30 scripts de Greasy Fork gardés dans `reference/platesmania-scripts/` (liste : `index.tsv`), lus le 6 octobre 2026 : ce que chacun fait, comment, ce que nous avons déjà, et ce qui vaut d'être repris. 29 sur 30 déclarent la licence MIT ; seul **Replace Country Dropdown** (`551089`) n'en indique aucune (à demander à l'auteur avant d'en reprendre du code mot pour mot ; une idée n'est pas du code).

## 1. Les 30 scripts, par famille

### Vérifier une plaque
| Script | Ce qu'il fait | Comment | Chez nous |
|---|---|---|---|
| **Notification Doubles Plaques** (586634, v3) et **… All** (591680, v3.9.3.1) | nombre de plaques trouvées pour la plaque tapée, tous pays ; **remplit marque, modèle, génération** d'après la photo qui existe déjà ; détecte le blocage 1015 | recherche `gallery.php?gal=<pays>&nomer=` (`fastsearch=` pour `pt` et pour les lettres du FR), nombre dans `h1.pull-left b` ; la marque, le modèle et la génération (**avec leurs numéros**) viennent de `a[href*="markaavto="]` de la même page | **fait** : nos règles de plaque en viennent (crédit dans `THIRD_PARTY.md`) ; nous avons en plus 96 pays vérifiés, une file de requêtes et une pause. **Pas repris** : le remplissage marque/modèle d'après la photo existante |
| **Compteurs de série** FR (594984), DE (591676), NL (591682), BE (595120), IT (595122), ES (595125) | combien de combinaisons de lettres vous avez déjà, numéros « proches » (+/- 10), numéros que vous possédez | `userreg.php?gallery=<pays>-<votre id>` (régions et séries de votre galerie), `/<pays>/series-AA-BB-1` (la série entière), `gallery.php?fastsearch=` avec `usr=` | **non** |
| **FR SIV Rank** (585617) | « votre plaque est la n-ième du système SIV », confettis près des millions | calcul pur sur la plaque (528 séries × 999) | non (amusant, sans valeur pour nous) |

### Remplir le formulaire
| Script | Ce qu'il fait | Comment | Chez nous |
|---|---|---|---|
| **Information Autofill** (524820) | écrit lieu et date dans « Extra information » | le site affiche sous la photo choisie ses dates EXIF (`#fotodiv span[onclick^="appdop"]`, un clic les ajoute) et un lien Google Maps avec les coordonnées ; le script formate la date et traduit les coordonnées en adresse avec **geocode.maps.co et votre propre clé** | partiel : notre carte « Extra information » insère votre lieu enregistré, pas la date ni le lieu de la photo |
| **Upload Enhancements** (555559) | grappe de tags toujours ouverte ou déplacée, **bouton d'envoi flottant**, levée de la limite de taille (6 Mo → 500 Mo, côté navigateur), aide « BK », eurobandes déployées (DE), tweaks DK et UK | CSS et DOM de la page d'ajout | tags : **fait** (sélecteur de tags). **Pas repris** : le bouton d'envoi flottant, la limite de taille |
| **Google Lens** (535713) | un bouton Lens sous la photo | colle l'adresse de l'image dans la case de Google (par `GM.setValue`) | **fait**, refait dans notre architecture (crédit dans `THIRD_PARTY.md`) |
| **Lookup Toolbox** (524809, 154 Ko, même auteur que le Lens) | des **boutons de recherche par pays** (Finnik, car.info, carcheck, checkcardetails…, une quarantaine) avec la plaque lue du formulaire ; fenêtres FI et IT avec des données ; Google Images, Flickr, Autogespot ; **Lens automatique qui lit les « recherches similaires » de Google et les propose pour remplir le champ marque/modèle `#markamodtype`** ; réglages par pays | voir le § 3 | **partiel** : le Lens est fait, avec une autre lecture des résultats ; pas les boutons de recherche |
| **Compteur de photos par marque/modèle** (591683) | le nombre de vos photos entre parenthèses à côté de la marque et du modèle | page catalogue `gallery.php?markaavto=…` filtrée sur votre numéro | non |

### Fiches de véhicule (sites tiers)
| Script | Ce qu'il fait | Comment | Chez nous |
|---|---|---|---|
| **Regcheck DK / NL / UK / FR** (586193, 591669, 591671, 591673, 595253) et **Encadré Post DK / NL / UK / FR** (586194, 591670, 591672, 591674) | année, marque, modèle, VIN, « importé » d'après la plaque, dans la page d'ajout (Regcheck) et sur la page d'une plaque (Encadré) ; remplit l'étiquette CC | appels `GM_xmlhttpRequest` vers bilopslag.nu (DK), Finnik et Van Mossel (NL, avec l'API de RDW en secours), carcheck.co.uk (UK), akrgarantie.fr (FR) ; ouvre un onglet de fond pour passer un 429 | non, **volontairement** (§ 4) |

### Autour du profil et du site
| Script | Ce qu'il fait | Comment | Chez nous |
|---|---|---|---|
| **Vrai total uploads** (591678) | le vrai nombre de photos publiées depuis la galerie, et le total du jour (le jour se remet à zéro à 3 h 30) | `gallery.php?usr=<id>&date1=…&date2=…&tz_offset=…`, nombre dans le titre | non |
| **Code Counter** (524808) | des statistiques par pays pour un membre, en un bouton | une page `userreg.php?gallery=<pays>-<id>` par pays (une longue liste écrite en dur) | non |
| **Notifications Enhancer** (546208, 108 Ko) | sur votre page : avatars, dates relatives, drapeau remplacé par la photo, aperçus, derniers commentaires, plaque en image | CSS et DOM de la section « notifications » du profil | non |
| **PM Username flags** (566991) | un drapeau à côté des pseudos | `flagcdn.com` | non (nos drapeaux sont ceux du site, dans une barre) |
| **Replace Country Dropdown** (551089) | remplace le menu « Select a country » du site par une version par continents | HTML écrit en dur dans la barre de navigation | non : notre barre de drapeaux avec recherche fait mieux |
| **Google Maps Iframe Generator** (469785) | écrit le code d'un iframe de carte | page d'administration seulement (`/admin/edit_dopol.php`) | sans objet |
| **Platesmania Plus** (597418) | un faux menu « abonnement Plus », un logo remplacé, des likes tirés au hasard | DOM de la barre | sans objet |

## 2. Ce qu'ils nous ont appris du site (à garder)

- **La page de résultats d'une recherche de plaque dit tout de la photo existante** : `h4.text-center a[href*="nomer"]` (marque et modèle en texte), la ligne en dessous (génération), et surtout `a[href*="markaavto="]` dont l'adresse porte `markaavto=<id>&model=<id>&modgen=<id>` : les **numéros** des menus du formulaire. Nous lisons déjà cette page pour compter : ces informations sont **gratuites**.
- **`#fotodiv`**, sous la photo choisie : les dates EXIF (`span[onclick^="appdop"]`), le lien de carte (`a[href^="https://www.google.com/maps"]`), la taille.
- **`#markamodtype`** : une case de texte libre avec autocomplétion (jQuery UI) pour « marque et modèle » ; `$('#markamodtype').val(texte).autocomplete('search', texte)` lui fait chercher à notre place.
- **`gallery.php?fastsearch=`** est une autre recherche (utilisée pour `pt` et pour les lettres du FR) ; `gallery.php?usr=<id>&date1=&date2=&tz_offset=` filtre par membre et par date ; `userreg.php?gallery=<pays>-<id>` liste les régions d'un membre ; `/<pays>/series-AA-BB-1` liste une série entière.
- **Blocage** : le texte « Error 1015 » ou « rate limited » ou le statut 429 : nous les détectons déjà (`SITE_BLOCK_RE`).
- **Google Lens** : les pastilles « recherches similaires » sont des liens `…q=<texte>&kgmid=…` (ou `lns_surface=`) qui contiennent une miniature ; c'est l'identification que Google donne lui-même (« Audi A3 Sportback »), sans les centaines de liens de la page.
- **Fermer l'onglet de Google** : `window.close()` ne suffit pas toujours ; leur script déclare `@grant window.close` et essaie plusieurs façons, en réessayant à 200, 800 et 1500 ms.

## 3. Ce qui vaut d'être repris, dans l'ordre

| # | Idée | D'où | Effort | Pourquoi |
|---|---|---|---|---|
| 1 | **Remplir marque, modèle, génération d'après la photo existante de la plaque** | Doubles Plaques All | petit : nous lisons déjà la page, et nous avons `vehicleFill` | fait gagner trois menus à chaque plaque déjà présente ; sans requête de plus ; un bouton « Même véhicule que la photo du site : Audi A3 (8P) — Remplir » dans la vérification de plaque |
| 2 | **Lens : lire les « recherches similaires » de Google en premier** | Lookup Toolbox | moyen (dépend de la page de Google) | plus précis que nos titres de liens ; à comparer sur de vraies pages avec nos journaux ; garder les titres en repli |
| 3 | **Lens : repli sur `#markamodtype`** quand la marque n'est pas dans nos menus | Lookup Toolbox | petit | un texte comme « Audi A3 Sportback » est résolu par le site lui-même |
| 4 | **Bouton d'envoi flottant** | Upload Enhancements | petit | le formulaire est long : le bouton reste visible |
| 5 | **Extra information : la date de la photo** (et le lieu par GPS, avec une clé de géocodage au choix) | Information Autofill | petit pour la date ; moyen pour le lieu (service tiers) | le site donne déjà la date EXIF ; un clic dans notre carte |
| 6 | **Boutons de recherche par pays** (Finnik, car.info, carcheck…), avec la plaque lue par nos règles | Lookup Toolbox | moyen | nos règles lisent la plaque exactement ; **rien n'est envoyé avant le clic** : ce sont de simples liens |
| 7 | **Vrai total d'uploads et total du jour** | Vrai total uploads | petit (deux requêtes par la file) | déjà dans `docs/TODO.md` |
| 8 | **Compteur de photos par marque et modèle** | Compteur de photos | moyen | à côté de nos choix marque/modèle |
| 9 | **Compteur de série** (un seul pour tous les pays) | les six compteurs | grand | précieux pour un collectionneur ; une base commune (la plaque lue, la liste de votre galerie, la série) à la place de six scripts |
| 10 | Statistiques par pays d'un membre | Code Counter | moyen | bas : une fois par membre |

Pas repris : Notifications Enhancer (108 Ko de retouche d'une zone du site que nous n'avons pas touchée), SIV Rank, Username flags, Replace Country Dropdown (couvert), Google Maps Iframe Generator (administration), Platesmania Plus.

## 4. Pourquoi pas les fiches de véhicule (Regcheck, Encadré Post, la majorité de Lookup Toolbox)

- Chaque plaque tapée est **envoyée à un service tiers** (bilopslag.nu, Finnik, Van Mossel, carcheck.co.uk, akrgarantie.fr…), sans clic de l'utilisateur. Notre script ne contacte que PlatesMania (et Google pour le Lens, sur demande) : c'est ce qui est dit aux utilisateurs dans le README et sur Greasy Fork.
- Ce sont des **pages lues par un script** : elles changent sans prévenir, certaines bloquent (le script FR ouvre un onglet de fond pour contourner un 429), et leurs conditions d'utilisation peuvent l'interdire. Seul le service officiel de RDW (open data) est fait pour cela.
- Si vous voulez la fonction malgré tout, la version raisonnable est celle du point 6 : des **liens** que l'utilisateur ouvre lui-même.

## 5. Crédits et licences

- Notre lecture de la plaque vient de « Notification Doubles Plaques » (MIT) ; la méthode du Lens, de « Platesmania → Google Lens » (MIT) : voir `THIRD_PARTY.md`.
- Reprendre une idée (point 1 à 10) ne demande rien. Reprendre du **code** d'un script sans licence indiquée demande l'accord de son auteur ; reprendre du code MIT demande de garder sa mention. Nos reprises sont des réécritures dans nos briques (`bridge`, `vehicle`, `inlineCard`).
