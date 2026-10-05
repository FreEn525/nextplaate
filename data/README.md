# data/ : ce qui a été récupéré sur PlatesMania

Données dérivées, petites et versionnées. Les pages brutes (270 Mo) restent en local dans `reference/` : elles ne sont pas dans le dépôt.

## Règle

**Un seul sens** : `reference/` (brut, local) → `node scripts/build-data.mjs` → `data/` (propre, versionné). On ne modifie jamais `data/` à la main : on relance le script. La sortie est triée et sans date d'exécution, donc deux exécutions sur les mêmes pages donnent des fichiers identiques.

## Contenu

```
data/
  index.json                 une ligne par pays : nombre de types, de catégories, de plaques
  countries/<cc>/            <cc> = code du site (fr, de, uk...)
    country.json             nom, formulaire d'ajout, catégories de recherche
    plates.json              plaques vues sur le site, par catégorie
```

### `country.json`

| Champ | Sens |
|---|---|
| `code`, `name` | code du site et nom du pays |
| `upload` | `null` si le pays n'a pas de page d'ajout |
| `upload.typeMenu` | le formulaire a un menu de type de plaque (`ctype`) |
| `upload.hooks` | fonctions JavaScript du site qui affichent/cachent les champs (ex. `dismdn`) |
| `upload.types[]` | `id` (valeur du menu), `label`, `visible` (identifiants des champs affichés pour ce type) |
| `search.categories[]` | `id`, `label` : options du menu de catégorie de la page de recherche |

Un pays sans `upload.types` utilise un formulaire sans menu de type : le script lit alors les champs visibles (`genericPlate`).

### `plates.json`

Une entrée par catégorie et par plaque (la dernière lecture gagne) : `category`, `plate` (telle qu'elle est écrite sur le site), `read` (ce que le script a relu dans le formulaire), `count` (photos du site pour cette plaque), `date`, et `source` si elle vient de la galerie.

## Quoi en faire

- **Tests hors ligne** : `plates.json` est le corpus de `tests/offline/check_db.py`. Une plaque dont `read` diffère de `plate` signale une règle fausse.
- **Remplissage** : les catégories de `search.categories` sans plaque dans `plates.json` sont celles que l'outil de remplissage doit chercher.
- **Interface** : `name` et les catégories peuvent alimenter le script à la compilation (liste des pays, menus) au lieu d'être écrits en dur dans `src/lib/countries.js`.

## Mise à jour

1. Recapturer les pages avec le build dev (tiroir *Dev*) dans `reference/real/countries/`.
2. `node scripts/build-data.mjs`
3. Relire `git diff data/` : un changement de catégorie ou de champ veut dire que le site a bougé.
