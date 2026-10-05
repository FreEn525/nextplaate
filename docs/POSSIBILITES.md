# Ce qui est possible : recherches

Notes du 5 octobre 2026. Chaque ligne dit d'où vient l'information. « Pas vérifié » signifie que je ne l'ai pas testé dans ce projet.

## Outils d'un userscript (Tampermonkey)

| Outil | Ce qu'il permet | Utilité ici | Source |
|---|---|---|---|
| `GM_getValue` / `GM_setValue` | Stockage du script, partagé entre les pages où il tourne | Remplacerait `localStorage` (`pmg_*`), qui est propre à chaque origine : `platesmania.com` et ses sous-domaines d'images ne partagent pas | [documentation Tampermonkey](https://www.tampermonkey.net/documentation.php) |
| `GM_addValueChangeListener` | Réagit quand une valeur change dans un autre onglet | Coordination des onglets d'envoi par lot, aujourd'hui faite avec `localStorage` et Web Locks | [documentation Tampermonkey](https://www.tampermonkey.net/documentation.php) |
| `GM_registerMenuCommand` | Entrée dans le menu Tampermonkey de la page | Activer/désactiver une fonction sans ouvrir le panneau (réglages) | [documentation Tampermonkey](https://www.tampermonkey.net/documentation.php) |
| `GM_download` | Télécharge une ressource vers le disque | Export des données en dev, sans dossier à choisir | [documentation Tampermonkey](https://www.tampermonkey.net/documentation.php) |
| `GM_xmlhttpRequest` | Requête hors des règles CORS, avec `@connect` | Parler à un autre site (non utilisé : le script ne contacte que PlatesMania, c'est voulu) | [documentation Tampermonkey](https://www.tampermonkey.net/documentation.php) |

Le script déclare aujourd'hui seulement `GM_openInTab` et `unsafeWindow`. Chaque outil ajouté se déclare avec `@grant` dans `src/meta/00-header.txt`.

## Navigateur

- **`showDirectoryPicker`** (choisir un dossier et y écrire) : Chrome et Edge depuis la version 86, **pas Firefox ni Safari**, et pas dans une iframe. Les outils dev l'utilisent (capture, rapport, export) : acceptable pour le build dev, **à ne jamais mettre dans le build public**. Source : [web.dev](https://web.dev/articles/files/open-a-directory).
- Alternative pour tous les navigateurs : `<input type="file" webkitdirectory>` (lecture seulement).

## Publication (Greasy Fork)

- Greasy Fork retire `@updateURL`, `@installURL` et `@downloadURL`, puis les remplace par les siens : un script installé depuis Greasy Fork ne se met à jour que depuis Greasy Fork. Il ajoute `@version` et `@namespace` s'ils manquent. Source : [Greasy Fork, réécriture](https://greasyfork.org/help/rewriting).
- Donc : **sans nouveau `@version`, aucune mise à jour** (déjà noté dans le README). Pas vérifié : les règles de code de Greasy Fork sur les bibliothèques (`@require` de `libheif-js`), à relire sur [leurs règles](https://greasyfork.org/help/code-rules) avant une publication.

## Ce que ça change pour le projet

1. **Réglages** : `GM_setValue` + `GM_registerMenuCommand` peuvent servir de base au registre de réglages. Choix à faire : rester sur `localStorage` (simple, déjà en place, testé par Playwright) ou passer à `GM_*` (partagé entre sous-domaines, mais non testable dans le faux site sans simulation). Je recommande de **garder `store` comme seule porte** (déjà le cas) pour pouvoir changer de moteur plus tard sans toucher aux fonctions.
2. **Onglets d'envoi** : `GM_addValueChangeListener` supprimerait le sondage de l'état entre onglets. Gain réel seulement si le sondage actuel pose problème : pas constaté.
3. **Dev** : tout ce qui écrit dans un dossier reste en build dev (Chrome/Edge).
4. **Données** : rien dans ces recherches ne change le plan des plaques. Elles servent aux étapes suivantes (réglages, onglets).

## À vérifier avant de compter dessus

- Les conditions d'utilisation et le `robots.txt` de PlatesMania pour des captures de 96 pays : pas consultés. Le script respecte déjà une requête à la fois, 3 s d'écart et une pause de 15 min après un blocage.
- Le contenu de `bmObject` et `carsUrlsObj` (marques et modèles) : pas analysé.
