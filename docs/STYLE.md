# Style du script

Le panneau, la carte dans la page et la fenêtre d'envoi par lots partagent **un seul système de style**, défini dans `src/ui/01-tokens.js` (`UI_BASE`). Il reprend la palette de PlatesMania pour que le script paraisse faire partie du site, mais pas ses défauts : le site mélange des dizaines de bleus et de survols écrits à la main, le script n'a qu'une palette, une échelle de tailles et un seul comportement par type de contrôle.

## D'où viennent les couleurs

Du thème du site (`/bootstrap/assets/css/theme-colors/dark-blue.css`, `custom.css`) :

| Jeton | Valeur | Origine |
|---|---|---|
| `--primary` | `#4765a0` | « Dark Blue Color » du thème : liens, boutons `.btn-u`, onglets, titres soulignés |
| `--primary-h` | `#324c80` | « Dark Blue Hover Color » : survol des boutons, texte accentué |
| `--primary-soft` | `#cad9f6` | « Additional color » du thème : fonds et bordures légers |
| `--primary-tint` | `#eef2fb` | dérivé : `--primary-soft` très dilué, pour les survols |
| `--ring` | `rgba(71,101,160,.28)` | dérivé : l'anneau de focus |
| `--soft`, `--paper` | `#f0f0f0`, `#fafafa` | gris de la barre du haut du site |

Le texte secondaire (`--mute`, `#626a70`) est **plus foncé** que le gris du site (`#7c8082`) : à 12 px, le gris du site est trop pâle pour être lu sans effort.

## Ce que le script fait autrement, exprès

- **Une seule palette** : aucun fichier n'écrit de couleur, sauf `01-tokens.js`. Le test `tests/e2e/test_style.py` le vérifie et échoue si une couleur apparaît ailleurs (le blanc et les ombres noires exceptés).
- **Une échelle de tailles** : contrôles de 38 px (`--h`) ou 32 px (`--h-sm`).
- **Angles droits** : `--r` vaut 0, comme les rectangles de PlatesMania. Aucun rayon écrit à la main : seulement `var(--r)`. Une seule exception, demandée : la photo de profil de la barre d'icônes est ronde (`--r-round`).
- **Un seul focus** : tout élément cliquable ou saisissable reçoit le même anneau (`--ring`) au clavier.
- **Les mêmes composants partout** : bouton `.btn` (plein) / `.btn.ghost` (blanc) / `.btn.danger`, choix `.chip` (`.best` = le choix principal, `.on` = le choix en vigueur), étiquette `.cat`. Le panneau, la carte Lens et la fenêtre d'envoi s'en servent tous.
- **Pas de filet de couleur** sur les blocs, la carte ou le titre du tiroir : la couleur sert aux actions (boutons, choix, case active), pas à la décoration.

- **Le logo** (version 5.9) est un appareil photo rond avec un plus, en trois bleus (`LOGO_BLUES` dans `src/ui/01-tokens.js`) : ce sont les seules couleurs hors palette, celles du logo lui-même. Le fichier `logo_nextplaate.svg` est identique pixel pour pixel au dessin d'origine (chemins arrondis à deux décimales) ; l'icône du script (`@icon`) en est une version simplifiée de 700 octets.

## L'échelle

Tailles de texte : **11** (étiquettes en petites capitales), **12** (aide, détails), **13** (contrôles, choix), **14** (texte), **16** (titres, la croix), **18** (l'étoile). Aucune autre.

Hauteurs : **38 px** (`--h`) pour les boutons, champs et listes ; **32 px** (`--h-sm`) pour les petits boutons, boutons-icônes, pastilles, drapeaux et choix ; **40 px** (`--h-rail`) pour la barre du panneau. Les lignes de membres (photo de 40 px) sont à 54 px. `test_style.py` mesure tout cela dans le navigateur et lit les sources : une taille hors de l'échelle, ou un bouton à une autre hauteur, fait échouer le test.

## Espaces

Entre deux lignes d'une liste, entre le titre et la liste, entre la liste et la case d'ajout : **8 px au moins** (12 px entre les parties d'un bloc). Une case et le bouton qui la suit ont la même hauteur (38 px) ; un petit bouton (`.sm`, 32 px) ou un bouton qui garde la taille de son texte (`.fit`) n'est pas étiré sur toute la largeur d'un bloc du tiroir, seuls les gros boutons d'action le sont.

## Écrans étroits

Rien ne doit élargir un tiroir : un téléphone de 320 px lui laisse 264 px. Les libellés longs passent à la ligne (`.gbody .btn`), les rangées de boutons aussi (`.btnrow`), les champs étiquettés aussi (`.row`). `tests/e2e/test_responsive.py` ouvre chaque tiroir à 320, 360, 768 et 1280 px et refuse tout débordement. Les colonnes de choix (`.cols`) s'empilent d'elles-mêmes quand la place manque.

## États

| État | Fond | Bordure | Texte |
|---|---|---|---|
| Erreur / doublon | `--danger-soft` | `--danger-line` | `--danger-ink` |
| Réussite | `--ok-soft` | `--ok-line` | `--ok-ink` |
| Attention | `--warn-soft` | `--warn-line` | `--warn-ink` |

## Pour ajouter un élément

1. Utiliser les classes ci-dessus avant d'en créer une.
2. Si une nouvelle classe est nécessaire, ne mettre que des `var(--…)` : ni `#…` ni `rgb…` (le test le refuse).
3. Un jeton nouveau se définit une seule fois, dans `UI_BASE`, avec sa justification.

## Ce qui n'est pas repris du site

- **La police** : le site utilise son thème Bootstrap (`style.css`, non récupéré). Le script garde la police du système.
- **Les formes du reste du site** (en-têtes, onglets, cartes de portfolio) : le script n'en a pas besoin.
