# Les modules complémentaires (add-ons)

Un module est un **petit script Tampermonkey séparé** qui s'accroche au panneau de NextPlaate. Il sert à garder dans le script général ce que tout le monde utilise, et à donner à quelques personnes ce qui ne regarde qu'elles. Il n'est ni dans le script publié, ni dans le texte de Greasy Fork, ni dans le README : on le donne à la main (voir plus bas).

## Comment un module se connecte

Le script général n'expose que quatre points d'accroche, tous dans le DOM (un module en `@grant none` et NextPlaate, qui a ses `GM_*`, ne partagent pas leurs variables, mais ils partagent la page) :

1. **L'événement `pmg-ready`** sur `document`, envoyé quand le panneau est construit. Un module qui s'exécute plus tard trouve le panneau déjà là : il regarde d'abord, puis écoute l'événement, puis réessaie un moment.
2. **L'élément `#pmg-host`**, dont la racine ombre est **ouverte** (`host.shadowRoot`), avec l'attribut `data-version` (la version de NextPlaate). Les tiroirs sont des `<section data-drawer="…">` (`pair`, `search`, `upload`, `gallery`, `settings`, `keys`).
3. **La structure d'une boîte**, que le module reprend telle quelle pour avoir le style du panneau (ses feuilles de style sont dans la même racine) : `<div class="group"><div class="gbody">…</div><div class="gtitle">Titre</div></div>`. Les classes `btn`, `btn ghost`, `row`, `presult`, `gabout`, `pnote`, `chk` y sont celles du panneau.
4. **L'attribut `data-pmg-busy` sur `<html>`** : tant qu'un module travaille sur la page, il y met son nom ; les touches de page de NextPlaate (A, D) refusent alors de changer de page (« … is running. Press Esc to stop it first. »). Il l'enlève à la fin.

Rien d'autre n'est partagé : un module garde ses réglages sous son propre préfixe (`pmgx_<nom>_…` dans `localStorage`), ses touches, et son état.

## Le module Auto-like (`addons/nextplaate-autolike.user.js`)

Ce qu'était la fonction *Likes* du script général (version 5.11 et avant) : une boîte **Auto-like** dans le tiroir Browse, qui like les cœurs vides de la page (jamais un cœur déjà plein : on ne retire jamais un like), ou de plusieurs pages à la suite (« Pages to like », jusqu'à 50, avec un délai réglable entre deux likes). La touche `L` lance ou arrête, `Échap` arrête. Une série sur plusieurs pages se poursuit toute seule après chaque chargement de page ; elle s'abandonne si elle reste 60 secondes sans avancer, si on quitte la galerie où elle a commencé, ou si on l'arrête.

- **Installer** (à donner aux personnes concernées) : ouvrir l'adresse du fichier brut dans le navigateur, Tampermonkey propose l'installation : `https://raw.githubusercontent.com/FreEn525/nextplaate/main/addons/nextplaate-autolike.user.js`. Les mises à jour suivent par la même adresse (`@updateURL`).
- **Il faut NextPlaate** (le module s'ajoute à son panneau). Sans lui, il ne montre rien.
- Il vit dans `addons/`, qui n'est pas dans la construction du script (`scripts/build.mjs`) : le fichier est écrit à la main, sans étape de build. Ses tests sont dans `tests/e2e/test_autolike_addon.py` (le module y est injecté comme le fait Tampermonkey).

## Écrire un autre module

Copier la structure d'`nextplaate-autolike.user.js` : une fonction `join()` qui cherche le tiroir et y ajoute une boîte (appelée tout de suite, sur `pmg-ready`, et par une courte boucle d'attente), son état sous `pmgx_<nom>_`, `data-pmg-busy` pendant qu'il travaille, des touches qui ignorent la saisie (`e.composedPath()[0]` : dans la racine ombre du panneau, la cible vue de l'extérieur est l'hôte) et les modificateurs. Un test qui injecte le module avec `context.add_init_script` sur `DOMContentLoaded`.
