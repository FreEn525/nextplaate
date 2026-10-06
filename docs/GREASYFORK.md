# Greasy Fork : la page du script et sa mise à jour

Page du script : https://greasyfork.org/fr/scripts/598722-nextplaate

## Ce qui vient du dépôt, ce qui est à la main

| Élément de la page | D'où il vient | Comment il change |
|---|---|---|
| Le code, le numéro de version | `nextplaate.user.js` du dépôt | **automatique** : à chaque push, GitHub avertit Greasy Fork (webhook), qui relit le fichier |
| Le nom, la description courte, les permissions | l'en-tête du script (`src/meta/00-header.txt`) | automatique, avec le code |
| Le texte « Informations complémentaires » (la liste des fonctions, avec mise en forme) | **la page Greasy Fork elle-même** | **à la main** : modifier le script sur Greasy Fork, onglet « Admin », champ « Informations complémentaires », coller le texte ci-dessous |
| Les captures d'écran | la page Greasy Fork | à la main (onglet Admin) |

Greasy Fork n'installe une mise à jour que si `@version` change. À chaque publication : monter `@version`, ajouter l'entrée du `CHANGELOG.md`, pousser.

## Le dépôt peut-il passer en privé ?

**Non, pas sans casser la mise à jour.** Le webhook (réglé dans le dépôt, « Webhooks », adresse `api.greasyfork.org/.../webhook`) prévient seulement Greasy Fork qu'il y a eu un push. C'est ensuite **Greasy Fork qui va relire le fichier** à l'adresse de synchronisation du script (onglet « Admin » de la page : je ne l'ai pas pu lire d'ici, mais elle pointe vers GitHub), sans identifiants. Sur un dépôt privé, cette adresse répond « introuvable » : la synchronisation échoue et la page reste sur l'ancienne version.

Ce qui reste possible si vous voulez que le code source soit privé :
1. **Un petit dépôt public pour la seule version construite** (par exemple `nextplaate-release`), qui ne contient que `nextplaate.user.js`. Le dépôt privé garde le source, les tests, les données et les docs ; sa CI copie le fichier construit dans le dépôt public à chaque publication (il faut une clé d'accès enregistrée dans les secrets du dépôt privé). Greasy Fork se synchronise sur le dépôt public. À faire une fois.
2. **Ne rien changer** : garder le dépôt public. À noter que le code d'un userscript est de toute façon lisible par quiconque l'installe ou ouvre sa page Greasy Fork : ce que le privé protégerait, ce sont les tests, les données collectées (`data/`), les docs et l'historique.

Les Actions GitHub fonctionnent aussi en dépôt privé (dans le quota gratuit mensuel de minutes).

## Description courte (en-tête du script)

Elle est dans `src/meta/00-header.txt` (`@description`, et `@description:fr` pour le français). Greasy Fork l'affiche sous le nom du script.

## Texte à coller dans « Informations complémentaires »

(En anglais, Markdown : choisir « Markdown » comme format.)

```markdown
**NextPlaate** adds a panel to PlatesMania that makes posting photos and browsing faster. Fifteen features, each with a switch in Settings (except Settings itself).

## Posting photos
1. **Photo pair selection** (`S`) - pick the front and the rear photo of a vehicle from a gallery.
2. **Location and hashtags** - write your place and hashtags once; they head every description.
3. **Descriptions and auto-fill** (`F`) - fills the description of each photo of the pair on the edit page, with a link and a thumbnail of the other side, then saves and goes back to the gallery if you want it to.
4. **Batch upload** (`U`, `N`, `R`) - queue many photos or a folder (HEIC included), give each a country and a plate category, and send them one tab per photo with a delay. The queue survives a reload and pauses 15 minutes when the site asks to wait.
5. **Plate check** - as you type a plate on the upload page, tells how many photos of that plate are already on the site. All 96 countries and 829 plate categories, written the way the site's search writes them (795 verified on real plates).
6. **Plate preview as you type** - presses the site's "Generate preview" button for you when you stop typing.
7. **Google Lens** - a photo you choose on the upload page is searched on Google Lens by itself, in a background tab that closes when the results are read. The likely brand, model and generation appear under the photo, three choices each; a click fills the site's menus. Nothing is filled until you click.
8. **Tag picker** - replaces the closed "Add tags" accordion (and the pop-up on a photo page) with buttons by group, a search box, removable chips, your most used tags and the ones of your last upload. The site still saves the tags itself.
9. **Extra information box** - the three-line box becomes a tall card that grows as you type, with a button to insert your saved location.

## Browsing
10. **Likes** (`L`) - like a page, or several pages in a row, with a delay between likes.
11. **Gallery page keys** (`A`, `D`) - previous and next page from the keyboard.
12. **Country flags** - a flag and a name for every country, linking to its upload page: in the panel, and beside the content on the upload pages and on a member's profile. Choose which countries the side bar shows.
13. **Member shortcuts** - the members you go to often, with picture and name, one click to their page. You are always first; an Edit mode lets you drag the lines (or use the arrow keys), remove them and add a member by number or link; a star on a profile saves that member. Your own picture is also in the panel's bar.

## The panel
14. **Shortcut editor** - every key can be changed (AZERTY-safe).
15. **Settings** - one switch per feature.

## Permissions, in plain words
- It works on platesmania.com. Everything it reads from the site goes through one queue: one request at a time, three seconds apart, a pause after a block.
- For Google Lens only, it also runs on Google pages, where it acts only for a search the panel asked for. `GM_setValue` / `GM_getValue` pass the photo to that page and the results back. `GM_openInTab` opens the batch upload and Lens tabs.
- Nothing is sent to any server of ours: there is none.
```

## Le dépôt n'est pas cité

Ni le script, ni son en-tête, ni le texte à coller ci-dessus ne mentionnent le dépôt (aucun lien, aucun nom de compte GitHub) ; `tests/e2e/test_public_text.py` le vérifie. Le `README.md` reste dans le dépôt, mais n'envoie pas non plus vers lui : l'installation passe par Greasy Fork.

## Quand le texte change

À chaque nouvelle fonction : mettre à jour la liste ci-dessus, le `README.md` (« Features, one by one »), le tableau en tête de `docs/FONCTIONNALITES.md`, et coller le nouveau texte sur Greasy Fork.
