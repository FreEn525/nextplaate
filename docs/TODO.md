# PlatesMania - NextPlaate : todo

État au 5 octobre 2026. Légende : **fait**, **en cours**, **à faire**, **info nécessaire** (il me faut une précision de ta part).

## Identité visuelle

- **Logo** : fait. Le logo SVG (`logo_nextplaate.svg`) est en `#3781c5`, et l'interface utilise maintenant la même couleur (commit `fc69004`). La forme est identique, seule la couleur a changé.
- **Couleurs du site** : **info nécessaire**. Les pages sauvegardées renvoient vers des feuilles de style que je n'ai pas. Pour reprendre les vraies couleurs du site, il me faut le CSS (ou une capture d'écran de la couleur principale).

## Développement et logs

- **Retirer les logs de la console** : **fait** (le build public a les logs éteints, le dev les garde). Les logs de test (`[NextPlaate] plate check`, etc.) restent dans le build dev. Dans le build public, il faut les supprimer, ou les garder seulement derrière un réglage.
- **Console ASCII** : **fait en version simple** (bannière stylée au démarrage). Remplace-la par ton ASCII art quand tu l'as choisi. Un logo en ASCII affiché une fois dans la console au démarrage du script (build public et dev).
- **Options de désactivation** : à faire. Un réglage par fonctionnalité (tiroir, raccourcis, vérification de plaque…), sauvegardé dans le navigateur.

## Fonctionnalités

- **Statut du site** : à faire. Une indication (en ligne, bloqué, en pause après un blocage) visible dans la barre, à partir de la file de requêtes existante (`http.js`).
- **Recherche Google Lens** : à faire. Un bouton qui ouvre Lens avec la photo, et un prompt préparé (marque, modèle, génération, code châssis…). Le prompt doit être défini avant, c'est le point à valider.
- **Génération de modèle** : **info nécessaire**. Je ne sais pas ce que tu entends : une génération par rapport à l'année, au code châssis, ou une suggestion par IA ? Ça change tout.
- **Ajout simplifié** : à faire. Un mode « simple » avec un indicateur (flag) à la place du menu déroulant, pour l'ajout de photo.
- **Remplissage marque, modèle, génération** : à faire. Quand la plaque existe déjà sur le site, pré-remplir les menus avec les photos existantes. Dépend de la lecture de la galerie de recherche (déjà utilisée par la vérification de plaque).
- **Compteur par marque et modèle** : à faire. À côté des menus, le nombre de tes photos correspondantes. Ça demande de lire ton profil ou ta galerie.
- **Vrai total d'uploads** : à faire. Le nombre réel de photos publiées depuis la galerie, et le total du jour. Même source que le compteur.
- **Améliorations de la page d'ajout par pays** : à faire. Bouton flottant, champs réorganisés. Commencer par un pays test (par exemple la France), puis généraliser.
- **Boîte à outils de recherche** : à faire. Boutons de recherche (Google Lens et d'autres sites) sur la page d'ajout. Dépend de la fonction Google Lens ci-dessus.
- **Platesmania Plus** : **info nécessaire**. Je ne sais pas ce qu'il y a dedans. Peux-tu me dire les fonctionnalités, ou coller la description ?

## Ce qui est déjà en place (pas dans la todo, mais utile)

- Vérification de plaque, testée sur 770 plaques de la base (commit `31d4d83`).
- Test par type sur tous les pays, qui utilise maintenant la base (commit `937aff8`).
- File de requêtes vers le site, avec pause de 15 minutes après un blocage.
- Documentation des fonctionnalités : `docs/FONCTIONNALITES.md` et `docs/PLATESMANIA-ETAT.md`.

## Ordre proposé

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
