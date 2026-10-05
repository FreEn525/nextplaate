# Règles de plaque : comment les corriger

Une **règle** dit comment le script relit la plaque dans le formulaire d'ajout d'un pays (`src/lib/plate/<cc>.js`, `PLATE_RULES.<cc>`). Un pays sans fichier utilise `genericPlate()` (les champs visibles, dans l'ordre de la page). Le contrôle hors ligne tape chaque plaque connue dans la page sauvegardée de sa catégorie et vérifie que la règle relit la même plaque. État chiffré : `docs/COUVERTURE.md`.

## La boucle de travail

```
python tests/offline/check_db.py          # toutes les plaques (30 s) ; --country xx pour un seul pays ; écrit data/check.json
python tools/fails.py xx                  # une ligne par catégorie en échec : champs affichés, première plaque, ce qui a été lu
python tools/diag_shown.py xx "Catégorie" # tous les champs affichés pour cette catégorie, y compris les champs désactivés (écrits par le site)
python tools/diag_typing.py xx "Catégorie" "AB 123"   # tape la plaque, montre chaque champ et ce que la règle lit
python tools/fields.py xx [ids]           # les champs du formulaire du pays (taille, exemple, options)
node scripts/refresh-data.mjs             # régénère data/ et docs/COUVERTURE.md
```

**Garde-fou** : `python tests/offline/check_known.py` (16 plaques tapées à la main sur le vrai site) doit toujours dire `failed: 0`. Le contrôle complet peut réussir avec un mauvais ordre de lecture tant que la saisie de test suit le même ordre ; seules ces plaques vérifiées sur le site le détectent (la Grèce l'a montré : `IAZ` = la lettre `I` puis le code `AZ`, alors que la page liste le menu du code avant celui de la lettre : un utilisateur qui tape dans l'ordre de la page obtient `AZI`, la saisie doit suivre l'ordre de lecture de la plaque). Ajouter une plaque vérifiée à la main dans `tests/offline/known_plates.json` (une plaque ou une liste par pays) chaque fois qu'on en a une. Vérifiées à la main le 5 octobre 2026 : Pologne `K0 069U`, Vietnam `47A 271.12`, Serbie `OO-442 VR`.

Ordre d'une correction : `fails` (quoi) → `diag_shown` (quels champs, lesquels sont fixes) → corriger `src/lib/plate/<cc>.js` → `check_db --country xx` → un contrôle complet (rien d'autre ne doit baisser) → `refresh-data` → commit.

## Ce que le site fait (appris sur les 96 formulaires)

- **Lettres écrites par le site** : un champ **désactivé mais affiché** contient une partie de la plaque (ΞΑ grec, AM, E.A., ZV irlandais, GS, FL, ÅL...). Il faut la lire (`shownVal('id')`) et ne pas la taper. Un champ caché peut aussi garder une valeur : on ne le lit que s'il est affiché.
- **Menus avec libellé composé** : `BG - Belgrade`, `경기 (Gyeonggi Province)`, `١ / 1`. On lit la partie utile (`split(' - ')[0]`, `menuPart(id, 'before'|'after')`).
- **Lettres semblables** : la Russie écrit ses plaques en cyrillique dans les galeries, les menus en latin (A B E K M H O P C T Y X). Le contrôle les compare comme égales.
- **Un menu par caractère** (Iran, Égypte, Arabie saoudite, Irak) : `d1..d8` chiffres, `b1..b3` lettres, `charsOf([...], side)`.
- **Plaque sur plusieurs champs dans un autre ordre que la page** : `PT_HINTS[...].order`.

## Les astuces de saisie (`src/dev/40-plate-test/05-hints.js`)

`PT_HINTS['cc|Catégorie']` ou `['cc|*']` pour tout le pays : `order` (ordre de lecture), `field` (un seul champ prend tout), `drop` (morceaux déjà présents), `prefix` (début écrit par le site), `chars` (un menu par caractère), `right` (chiffres alignés à droite), `keepDigits`, `extra` (ids de champs à saisir en plus). Ce ne sont que des aides pour le **test** : la règle de lecture, elle, est ce que le script utilise sur le site.

## Catégories qui ne se testent pas

`no-type` : la catégorie de la recherche n'est pas dans le menu du formulaire. `no-field` : le formulaire n'affiche aucun champ pour ce type. Elles vont dans « non testables » de la couverture, pas dans « à corriger ».
