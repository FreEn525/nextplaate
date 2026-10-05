# data/ : ce qui a été récupéré sur PlatesMania

Données dérivées, petites et versionnées. Les pages brutes (270 Mo) restent en local dans `reference/` : elles ne sont pas dans le dépôt.

## Règle

**Un seul sens** : `reference/` (brut, local) → `node scripts/refresh-data.mjs` → `data/` et `docs/` (propres, versionnés). On ne modifie jamais ces fichiers à la main : on relance le script. Il enchaîne `extract-fields.cjs` (champs visibles par type, avec le JavaScript du site), `analyze-pages.mjs` (formulaires), `build-data.mjs` (plaques, index) et `coverage.mjs`. La sortie est triée et sans date d'exécution, donc deux exécutions sur les mêmes pages donnent des fichiers identiques.

## Contenu

```
data/
  index.json                 une ligne par pays : nombre de types, de catégories, de plaques
  check.json                 résultat du dernier contrôle complet des règles (tests/offline/check_db.py)
  countries/<cc>/            <cc> = code du site (fr, de, uk...)
    country.json             nom, pages présentes, menu qui choisit le type de plaque
    form.json                formulaire d'ajout : types, champs de plaque dans l'ordre de la page, autres champs
    search.json              page de recherche : catégories, champs de filtre et leurs options
    plates.json              plaques vues sur le site, par catégorie
```

`docs/FORMULAIRES.md` (généré) compare tous les pays : menus de type, noms qui ne correspondent pas, vocabulaire des champs.

### `form.json`

| Champ | Sens |
|---|---|
| `typeMenu` | `ctype` (presque tous), `drop_2` (Andorre, Malte) ou `null` (Pays-Bas : la catégorie ne se choisit pas dans le formulaire) |
| `types[]` | `id`, `label`, `class` (couleur de la plaque), `visible` : champs affichés pour ce type |
| `visibleFrom` | `site-script` : calculé en exécutant la fonction d'affichage du site ; `page-at-load` : le pays n'en a pas, on lit ce que la page affiche au chargement |
| `plateFields[]` | champs avant la photo, dans l'ordre : `id`, `name`, `tag`, `type`, `maxlength`, `example`, `digitsOnly`, `options` (menus) |
| `otherFields[]` | champs après la photo (description, marque, modèle...) |
| `notes` | ce que le script n'a pas pu placer |

### `country.json`

| Champ | Sens |
|---|---|
| `code`, `name` | code du site et nom du pays |
| `pages` | `upload` et `search` : la page est présente dans `reference/` |
| `typeMenu` | même valeur que dans `form.json` |

### `plates.json`

Une entrée par catégorie et par plaque (la dernière lecture gagne) : `category`, `plate` (telle qu'elle est écrite sur le site), `read` (ce que le script a relu dans le formulaire), `count` (photos du site pour cette plaque), `date`, et `source` si elle vient de la galerie.

## Quoi en faire

- **Tests hors ligne** : `plates.json` est le corpus de `tests/offline/check_db.py`. Une plaque dont `read` diffère de `plate` signale une règle fausse.
- **Remplissage** : les catégories de `search.json` sans plaque dans `plates.json` sont celles que l'outil de remplissage doit chercher.
- **Interface** : `name` et les catégories peuvent alimenter le script à la compilation (liste des pays, menus) au lieu d'être écrits en dur dans `src/lib/countries.js`.

## Mise à jour

1. Recapturer les pages avec le build dev (tiroir *Dev*) dans `reference/real/countries/`.
2. `node scripts/build-data.mjs`
3. Relire `git diff data/` : un changement de catégorie ou de champ veut dire que le site a bougé.
