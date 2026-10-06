# PlatesMania - NextPlaate : todo

État au 6 octobre 2026 (version 5.10). Le bilan est dans `ETAT-ET-PLAN.md`. Légende : **fait**, **en cours**, **à faire**, **info nécessaire** (il me faut une précision de ta part).

## Remarques de l'utilisateur (6 octobre 2026) : à traiter une par une

Notes prises pendant la collecte des séries. On les fait au fur et à mesure, dans l'ordre qui a du sens ; chaque ligne passe à **fait** quand elle est livrée, testée et documentée.

1. **Bug** : **fait** (version 5.9, `deepActive` dans `src/core/40-keys.js`, test dans `test_flags.py`). Dans la recherche d'un pays de « Add photo » avec les drapeaux, taper la lettre `U` ouvre le menu U (raccourci) au lieu d'écrire dans la recherche. Les touches ne doivent jamais se déclencher quand on écrit dans un champ.
2. **Journal des changements et fenêtre à chaque mise à jour** : **fait** (version 5.9, `src/lib/whatsnew.js` + `src/features/90-about.js`, Settings > About, test `test_about.py`). Une fenêtre qui s'ouvre après une mise à jour du script, avec ce qui est nouveau et ce qu'on peut faire avec (le changelog de l'utilisateur, pas celui du dépôt).
3. **Réorganiser les icônes et les fonctions** : **fait** (version 5.10 : barre dans l'ordre d'usage, une phrase par case, étapes numérotées pour décrire une paire, Settings explique chaque fonction et où elle marche, description sans paire ; `featureinfo.js`). Ranger de façon logique ; et surtout **expliquer ce que fait chaque fonction**, car aujourd'hui seul l'auteur comprend (exemple : la sélection d'une paire sert à écrire une description automatique entre la photo avant et la photo arrière ; la description marche aussi sans la sélection ; il y a des automatisations). Repenser la logique de présentation pour que tout le monde comprenne, quitte à changer le fonctionnement ou l'enchaînement des automatisations, tant que c'est plus clair.
4. **Signature** : **fait dans le script** (Settings > About, en-tête `@author`/`@copyright`, bannière de la console) ; README et texte Greasy Fork aussi. Copyright « NextEnzzo » et lien vers le profil : https://platesmania.com/user121559 (dans le script, le panneau, le README et le texte Greasy Fork, sans mentionner le dépôt).
5. **Dire clairement ce qui marche pour tous les pays** : **fait** (Settings, README, texte Greasy Fork, tableau de `FONCTIONNALITES.md`). Mettre en avant les fonctions complètes et valables pour tous les pays (la vérification de plaque : 96 pays, 829 catégories, probablement jamais fait ailleurs), et dire pour lesquelles ce n'est pas sûr.
6. **Page https://platesmania.com/add** : **fait** (version 5.10, `src/features/67-country-page.js` : carte de grands drapeaux avec recherche et derniers pays ouverts ; la boîte du site est masquée). Refaire la boîte « Select a country » et y déplacer « Add flags » en plus grand, seulement sur cette page (plus propre, plus simple).
7. **Fluidité** : **fait** (version 5.10, mesures sur la page d'ajout : le script coûte environ 45 ms au chargement, 2 ms sur une galerie, une tâche longue de 70 ms au démarrage, aucune activité au repos, 9,5 Mo de mémoire ; les longues listes des tiroirs sont construites à la première ouverture ; `lazy: true` dans un groupe). À revérifier si une fonction coûteuse est ajoutée. Vérifier que tout est fluide, sans bug ni lag pour les utilisateurs (mesurer le coût du script au chargement et à l'usage).
8. **UX et UI du menu U** : **fait** (version 5.10 : étapes numérotées, pastilles de pays côte à côte, état vide clair, « No country » à la place du « ? »). À revoir.
9. **Nouveau logo** : **fait** (version 5.9, appareil photo rond avec un plus ; panneau, `logo_nextplaate.svg` et `@icon`).
10. **Plate check** : **fait** (version 5.10, lien « See the N photos of this plate on the site » dans la carte). Pouvoir ouvrir depuis la carte la recherche de la plaque (la page du site qui liste les photos déjà présentes).
11. **Remplissage automatique par site d'informations** : **à faire**. Pour les plaques qui ont un site où toutes les informations sont trouvables, remplir automatiquement (étendre le registre officiel NL, IL ; voir `src/lib/registries.js`).
12. **Design de Google Lens sur la page d'ajout** : **fait** (version 5.10 : « Best match » avec un seul bouton, « Google calls it », puis « Not right? Pick another »). Encore un peu étrange ; à revoir.

13. **Clic sur le logo du panneau = mise à jour du script** : **fait** (version 5.10, `src/features/91-update.js`). Vérifier s'il existe une version plus récente et proposer de l'installer.
14. **Positionnement responsive partout** : **fait** (version 5.10 : la barre de drapeaux est à côté du contenu s'il y a la place, sinon un onglet « Add a photo in… » au bord droit, au même endroit sur le profil et les pages d'ajout). À valider sur l'écran de l'ami. Les boîtes doivent être au même endroit sur tous les écrans. Exemple d'un ami : sur un profil, la boîte « Add a photo in… » avec les drapeaux se retrouve sous la photo de profil sur son petit écran (et revient à sa place s'il dézoome un peu) : trouver une solution qui marche à toute taille.
15. **Bug : le compteur d'uploads d'un profil** : **fait** (version 5.10, `siteCount` dans `src/lib/http.js` lit « 38.723 »). Aurel (ID 101605) : « Uploaded license plates 38.723 (+61) », la carte Uploads dit « Not counted: no count on the page » : le nombre de la galerie a un point de milliers (« 38.723 »), qu'on ne lisait pas.

Autres demandes en cours : compteur de série pour tous les pays (attend les pages de `reference/real/series/` de l'outil Series collection) ; liens de recherche par pays (faits : liens universels ouverts, NL, IL, UK, NZ).

## Identité visuelle

- **Logo** : fait. Le logo SVG (`logo_nextplaate.svg`) est en `#4765a0`, le bleu de PlatesMania, comme toute l'interface (voir `docs/STYLE.md`). La forme est identique, seule la couleur a changé.
- **Couleurs du site** : **info nécessaire**. Les pages sauvegardées renvoient vers des feuilles de style que je n'ai pas. Pour reprendre les vraies couleurs du site, il me faut le CSS (ou une capture d'écran de la couleur principale).

## Développement et logs

- **Retirer les logs de la console** : **fait** (le build public a les logs éteints, le dev les garde). Les logs de test (`[NextPlaate] plate check`, etc.) restent dans le build dev. Dans le build public, il faut les supprimer, ou les garder seulement derrière un réglage.
- **Console ASCII** : **fait en version simple** (bannière stylée au démarrage). Remplace-la par ton ASCII art quand tu l'as choisi. Un logo en ASCII affiché une fois dans la console au démarrage du script (build public et dev).
- **Options de désactivation** : **fait** (version 5.5, tiroir Settings, registre `src/core/15-settings.js`). Reste à migrer les clés libres `autoCheck`, `delay`, `qDelay`, `pages` vers le registre.

## Fonctionnalités

Idées tirées des scripts publics de PlatesMania : `ANALYSE-SCRIPTS-PUBLICS.md` (dix idées classées, avec l'effort et la source).

Faites en 5.9 : compteur par marque et modèle (*Your photos of this vehicle*), vrais uploads et régions du profil, liens de recherche par pays, registre officiel (NL, IL), compteur de série (84 pays), bouton d'envoi flottant, véhicule des photos déjà sur le site, date de la photo, Google says, fenêtre des nouveautés, signature, nouveau logo.

Faites (5.8, voir `FONCTIONNALITES.md`) : Google Lens automatique avec marque / modèle / génération, sélecteur de tags (page d'ajout et page d'une photo), information complémentaire, aperçu de plaque en direct, drapeaux des pays (avec le choix des pays), raccourcis vers les membres (vous en premier, ordre au choix, votre photo dans la barre).

- **Statut du site** : à faire. Une indication (en ligne, bloqué, en pause après un blocage) visible dans la barre, à partir de la file de requêtes existante (`http.js`).
- **Génération de modèle** : **info nécessaire**. Le Lens propose déjà une génération d'après les années des résultats ; dites si vous voulez autre chose (code châssis, suggestion par IA).
- **Suggestion de tags** : à faire. Proposer des tags d'après la catégorie de plaque (par exemple « police »), sans rien cocher sans clic.
- **Ajout simplifié** : à faire. Un mode « simple » avec un indicateur (flag) à la place du menu déroulant du pays pour l'ajout de photo (les drapeaux sont déjà là).
- **Ajout d'un membre depuis n'importe quel lien** : à faire si besoin (une étoile sur chaque pseudo des galeries et des commentaires).
- **Platesmania Plus** : **info nécessaire**. Un des scripts de la liste (`reference/platesmania-scripts/597418`) n'est qu'un faux menu d'abonnement ; dites ce que vous attendez de ce nom.

## Ce qui est déjà en place (pas dans la todo, mais utile)

- Vérification de plaque : 96 pays, 795 catégories sur 829 vérifiées exactement (voir `COUVERTURE.md`), 39 plaques confirmées à la main sur le site.
- Outils de collecte du build dev (capture, Collect only, Verify the reads, Database) et données dans `data/`.
- CI : tests sur chaque push, échec si `src/` change sans nouvelle `@version`.
- File de requêtes vers le site, avec pause de 15 minutes après un blocage.
- Documentation des fonctionnalités : `docs/FONCTIONNALITES.md` et `docs/PLATESMANIA-ETAT.md`.

## Ordre proposé (plan du 5 octobre : étapes 1 et 2 faites, le reste à faire)

1. Logs et console ASCII (rapide, sans risque).
2. Options de désactivation (à faire avant les nouvelles fonctions, pour pouvoir les couper).
3. Statut du site (réutilise la file de requêtes).
4. Remplissage marque et modèle, puis compteurs (même source de données).
5. Google Lens et boîte à outils (une fois le prompt défini).
6. Améliorations de la page d'ajout (pays test d'abord).

Les infos à me donner : le CSS du site (couleurs), ce que tu entends par « génération de modèle », et le contenu de « Platesmania Plus ».

## Regroupements (fonctionnalités qui partagent les mêmes données ou la même interface)

1. **Photos et recherche de véhicule** : *Google Lens*, *boîte à outils de recherche* et *remplissage marque/modèle/génération*. Les trois partent de la même photo ou de la même plaque, et la réponse (marque, modèle, génération) sert aux trois. Une seule étape : une réponse structurée, utilisée par le tiroir Lens, puis proposée dans les menus.
2. **Données de ton compte** : *compteur par marque et modèle*, *vrai total d'uploads* (profil et jour). Même source (ta galerie et ton profil), même lecture, un seul travail d'extraction.
3. **Vérification de plaque et historique du site** : *statut du site* et *remplissage marque/modèle* lisent tous deux la galerie de recherche et la file de requêtes. Le statut sert aussi de garde-fou au remplissage (pas de requête pendant une pause).
4. **Interface et réglages** : *options de désactivation*, *console ASCII* et *retrait des logs*. Tout est du réglage de l'affichage et du développement ; un seul mécanisme de réglages (dev/public) suffit.
5. **Page d'ajout par pays** : *améliorations de la page d'ajout* et *ajout simplifié avec indicateur*. Même formulaire, même endroit : à faire ensemble, pays test d'abord.

Ordre proposé avec ces regroupements :
- Groupe 4 (réglages) en premier, pour pouvoir couper ce qui est en cours.
- Groupe 3 (statut et lecture de la galerie), qui prépare le groupe 1.
- Groupe 1 (recherche de véhicule), puis groupe 2 (compteurs).
- Groupe 5 (page d'ajout) en dernier, pour un seul pays puis généralisation.

## Statut du site (détail, à faire plus tard)

Objectif : afficher si PlatesMania répond ou non, dans le panel.

- **Passif (recommandé)** : le script regarde ses propres requêtes. Succès récents : « en ligne ». Échecs (délai dépassé, erreur serveur) : « problème ». Pause de blocage active : « en pause », avec l'heure de reprise. Aucune requête de plus.
- **Actif (optionnel)** : un bouton « Vérifier » qui fait une seule requête, sur demande uniquement. Pas de vérification automatique en arrière-plan : ça ajouterait des requêtes vers le site.
- Réutilise la file de requêtes existante (`src/lib/http.js`) et l'état de pause.

## Google Lens : décision

- Version automatique (envoi de la photo à Lens et lecture des résultats sur google.com) : **écartée**. Elle lit les pages d'un service Google, contre ses conditions d'utilisation, et casse dès que la page change.
- Version retenue : prompt copié, Lens ouvert, photo déposée à la main, réponse collée dans l'onglet Search (déjà en place).
