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
**NextPlaate** adds a panel to PlatesMania that makes posting photos and browsing faster. Twenty-six features, each with a switch in Settings (except Settings itself). Made by [NextEnzzo](https://platesmania.com/user121559).

A click on the logo of the panel checks for a newer version. The bar follows the order of use: Check a plate, Send photos, Describe a pair, Browse. Settings tells what each feature does and where it works: the plate check covers all 96 countries and 829 plate categories (795 checked exactly on real plates), the series counter 84 countries, the official register the Netherlands and Israel; the rest works everywhere.

## Posting photos
1. **Photo pair selection** (`S`) - pick the front and the rear photo of a vehicle from a gallery.
2. **Location and hashtags** - write your place and hashtags once; they head every description.
3. **Descriptions and auto-fill** (`F`) - fills the description of each photo of the pair on the edit page, with a link and a thumbnail of the other side, then saves and goes back to the gallery if you want it to.
4. **Batch upload** (`U`, `N`, `R`) - queue many photos or a folder (HEIC included), give each a country and a plate category, and send them one tab per photo with a delay. The queue survives a reload and pauses 15 minutes when the site asks to wait.
5. **Plate check** - as you type a plate on the upload page, tells how many photos of that plate are already on the site. All 96 countries and 829 plate categories, written the way the site's search writes them (795 verified on real plates).
6. **Plate preview as you type** - presses the site's "Generate preview" button for you when you stop typing.
7. **Google Lens** - a photo you choose on the upload page is searched on Google Lens by itself, in a background tab that closes when the results are read. What Google itself calls the vehicle counts first. The likely brand, model and generation appear under the photo, three choices each; a click fills the site's menus. Nothing is filled until you click.
8. **Tag picker** - replaces the closed "Add tags" accordion (and the pop-up on a photo page) with buttons by group, a search box, removable chips, your most used tags and the ones of your last upload. The site still saves the tags itself.
9. **Extra information box** - the three-line box becomes a tall card that grows as you type, with buttons to insert your saved location and the date of the photo.
10. **Floating upload button** - while the site's Upload button is out of view, ours follows you at the bottom of the page and presses it.
11. **Plate lookup links** - one link per public lookup page of the country for the plate you type, each writing the plate the way that site wants it; plain links, nothing is sent before you click, each site can be hidden.
12. **Your photos of this vehicle** - under the vehicle menus, how many photos of that brand, model and generation you already have, each number a link.
13. **Official register** (Netherlands, Israel) - a button in the plate card asks the country's open register (free, no key) about the plate: make, model, year, colour, inspection date; for the Netherlands it fills the menus that are still empty. It asks by itself (public open data, only the plate is sent); two switches in Settings turn that off.
14. **Series counter** - 84 countries (checked on the real site with real plates): your photos of the plate's series (HF-137-QQ is in HF-*-QQ); on a series page, the numbers on the site.

## Browsing
15. **Gallery page keys** (`A`, `D`) - previous and next page from the keyboard.
16. **Country flags** - a flag and a name for every country, linking to its upload page: in the panel; on the page /add the drop-down becomes large flags with a search box; elsewhere a bar beside the content, or a tab at the right edge where there is no room. Choose which countries the bar shows.
17. **Member shortcuts** - the members you go to often, with picture and name, one click to their page. You are always first; an Edit mode lets you drag the lines (or use the arrow keys), remove them and add a member by number or link; a star on a profile saves that member. Your own picture is also in the panel's bar.

## Profiles
18. **Profile: real uploads** - the real total of a member's gallery and the uploads of the day (from 03:30 local time), next to the profile's own figure, which the site only recalculates from time to time.
19. **Profile: regions** - how many regions of a country a member has a photo from, with a bar, the regions seen and the missing ones.

20. **World map** (`G`, globe) - the countries a member has photos from on a map of the world, shaded by how many photos, each a link to the member's photos of it; a Europe view; yours or anyone's (a member number or a profile link); for 54 countries, a map of the regions (departments, states...).

## The panel
21. **Profile page look** - a member's profile in the look of the script: figures as tiles, the private messages and notifications in two identical panels, the countries table and the last photos tidied. One switch gives the site's look back.
22. **Notification pop-ups** - a notice in the corner, like a phone's, for a new like, comment or private message on any PlatesMania page while a tab is open. You choose the kinds and how often.
23. **Latest plates strip**: the line of the latest uploads that every page carries becomes a slim strip with a flag and a chip per plate.
24. **Update notice** - a notice when you join the site if the script has a newer version, with the link to install it. At most once every 3 hours; switch off in Settings.
25. **Shortcut editor** - every key can be changed (AZERTY-safe).
26. **Settings** - one switch per feature.

## Permissions, in plain words
- It works on platesmania.com. Everything it reads from the site goes through one queue: one request at a time, three seconds apart, a pause after a block.
- For Google Lens only, it also runs on Google pages, where it acts only for a search the panel asked for. `GM_setValue` / `GM_getValue` pass the photo to that page and the results back. `GM_openInTab` opens the batch upload and Lens tabs.
- For the maps of regions it downloads public shape files (geoBoundaries, through geoboundaries.org and media.githubusercontent.com) when you open a country: nothing about you is sent. The other open sources (the Dutch and Israeli registers) are asked only for the plate you typed.
- The notification pop-ups and the plate pictures read PlatesMania's own pages through the same queue; nothing leaves your browser.
- Update notice: at most once every 3 hours, when you join the site, it reads the version number of the published script from Greasy Fork (`update.greasyfork.org`) and tells you if a newer one exists. Nothing about you is sent. Switch it off in Settings.
- Nothing is sent to any server of ours: there is none.
- Licence: all rights reserved. You can install it and use it; the code is readable so that you can check it, not so that it can be copied, modified or redistributed.
```

## Le dépôt n'est pas cité

Ni le script, ni son en-tête, ni le texte à coller ci-dessus ne mentionnent le dépôt (aucun lien, aucun nom de compte GitHub) ; `tests/e2e/test_public_text.py` le vérifie. Le `README.md` reste dans le dépôt, mais n'envoie pas non plus vers lui : l'installation passe par Greasy Fork.

## Quand le texte change

À chaque nouvelle fonction : mettre à jour la liste ci-dessus, le `README.md` (« Features, one by one »), le tableau en tête de `docs/FONCTIONNALITES.md`, et coller le nouveau texte sur Greasy Fork.
