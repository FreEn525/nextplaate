# Briques réutilisables

Ce que le script offre déjà pour construire une nouvelle fonction sans réécrire la plomberie. Chaque brique est un fichier court, commenté en tête, avec un exemple d'usage. Le Google Lens (`src/features/65-lens.js`) est le modèle : il ne contient que sa propre logique et assemble ces briques.

| Brique | Fichier | Sert à |
|---|---|---|
| Fonction | `src/core/30-app.js` (`registerFeature`) | déclarer une fonction : tiroir, touches, interrupteur dans Settings |
| Réglage | `src/core/15-settings.js` (`settings`) | une option avec sa valeur par défaut |
| Requête vers le site | `src/lib/http.js` (`siteFetch`) | lire une page de PlatesMania : une requête à la fois, 3 s d'écart, pause après un blocage |
| **Pont entre deux sites** | `src/lib/bridge.js` | demander un travail à un autre site, dans un autre onglet, et attendre la réponse |
| **Véhicule** | `src/lib/vehicle.js` | marques, modèles, générations de PlatesMania : lire, deviner à partir de textes, remplir les menus |
| **Carte dans la page** | `src/ui/06-inline-card.js` | afficher un bloc au bon endroit du site, au style du panneau, avec des choix à cliquer |
| Interface du panneau | `src/ui/` (`h`, `UI_BASE`, `setStatus`) | construire des contrôles sans `innerHTML` |

## Le pont (`bridgeAsk`, `bridgePending`, `bridgeAnswer`)

Le navigateur sépare les sites : une page de PlatesMania ne peut pas lire une page de Google. Le script tourne sur les deux et partage une petite mémoire (`GM_setValue` / `GM_getValue`). Un **travail** a un nom (`'lens'`) ; une **demande** porte un tampon (l'heure), et la **réponse** porte le même tampon, donc une réponse à une ancienne demande n'est jamais prise pour la nouvelle.

```js
// côté PlatesMania : demander, attendre la réponse
bridgeAsk('lens', { photo }, 'https://www.google.com/?olud&src=pm', { background: true, timeout: 120 })
  .then(titles => ..., erreur => ...);

// côté autre site (dans `core/00-open.js`, avant le reste du script) : voir s'il y a une demande, la traiter, répondre
const request = bridgePending('lens');            // null s'il n'y en a pas, si elle a plus de 3 minutes ou si elle est déjà traitée
// ... travail sur la page ...
bridgeAnswer('lens', request, resultat);
```

Pour **ajouter un autre site** (par exemple chercher une plaque ailleurs) : ajouter son adresse en `@match` dans `src/meta/00-header.txt`, écrire sa partie comme `66-lens-google.js` (uniquement des déclarations `function`, car elle démarre avant le reste), l'appeler depuis `core/00-open.js`. Ne jamais faire tourner autre chose sur ce site : le script s'arrête là.

## Le véhicule (`vehicle*`)

La page d'ajout contient tout le catalogue de PlatesMania (3 659 marques, leurs modèles et générations avec les années).

| Fonction | Rôle |
|---|---|
| `vehicleData()` | le catalogue de la page : marques, modèles, générations |
| `vehicleGuess(textes, data)` | la marque, le modèle et la génération les plus cités dans des textes (titres, légendes, descriptions…). Trois candidats chacun, le premier est le plus probable |
| `vehicleFill(chemin)` | choisit marque, puis modèle, puis génération dans les menus, comme le ferait l'utilisateur (la page remplit elle-même le menu suivant) |
| `vehicleCurrent()` | les valeurs actuelles des trois menus |

`vehicleGuess` ne sait pas d'où viennent les textes. Il sert donc aussi pour une description, un titre de page ou une légende. Pour une meilleure précision plus tard (une IA, une base de modèles), on change son contenu : tout ce qui l'appelle reste identique.

## La carte dans la page (`inlineCard`, `cardChoices`)

```js
const card = inlineCard({ id: 'pmg-ma-carte', title: 'Mon titre', before: element });   // null si l'élément n'existe pas
card.message('Recherche…');
cardChoices(card, colonnes, { pick: chemin => ..., current: () => valeursActuelles, action: { label: '...', path: [...] } });
```

La carte est dans un shadow root : le CSS du site ne l'atteint pas, et elle reprend les couleurs et boutons du panneau. Le même `id` redonne la même carte. `colonnes` : `[{ label, level, choices: [{ id, name, path }] }]` ; le premier choix de chaque colonne est mis en avant, les choix égaux aux valeurs actuelles sont marqués.

## Pour une nouvelle fonction

1. Un fichier dans `src/features/` avec `registerFeature({ id, label, groups, init })` (copier `65-lens.js` ou `20-details.js`).
2. Une option : `settings.define('mon_option', '1', 'Libellé', 'groupe')`, lue par `settings.on('mon_option')`.
3. Lire le site : `siteFetch(url)` (jamais `fetch` direct). Parler à un autre site : le pont.
4. Montrer un résultat : dans le tiroir (`groups`), ou dans la page (`inlineCard`).
5. Ajouter un test dans `tests/e2e/` (un fichier par fonction, comme `test_lens.py`) et une entrée dans `CHANGELOG.md` ; monter `@version`.

## Règles à garder

- Le code qui tourne sur un autre site n'utilise **que des déclarations `function`** et ne dépend de rien d'initialisé plus bas (les `const` ne sont pas prêts à ce moment-là).
- Rien n'est rempli dans le formulaire sans clic de l'utilisateur.
- Une seule porte vers le site (`siteFetch`) et une seule vers la mémoire (`store` / `settings` / pont).
