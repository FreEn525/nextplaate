# Ce que disent les pages sauvegardées

Généré par `node scripts/analyze-pages.mjs` à partir de `reference/real/countries` : ne pas modifier à la main. Les détails de chaque pays sont dans `data/countries/<cc>/form.json` (formulaire d'ajout) et `search.json` (page de recherche).

## En chiffres

- Pays analysés : 47 (page d'ajout et page de recherche).
- Menu de type de plaque : `#ctype` dans 44 pays, `#drop_2` dans 2 (ad, mt), aucun dans 1 (nl).
- Types dans les formulaires d'ajout : 452. Catégories dans les pages de recherche : 481.
- Champs visibles par type : calculés avec le script du site dans 40 pays ; lus tels que la page les affiche au chargement dans 7 pays (aucune fonction d'affichage : ad, dz, lt, mt, nl, si, uk).
- Types où le calcul a échoué : 0.

## À comprendre

- **Pays-Bas** : pas de menu de type. Le champ `fon` décrit l'apparence de la plaque (bandeau, une ou deux lignes, couleur), pas la catégorie : la catégorie (voiture, taxi, remorque...) ne se choisit pas dans ce formulaire. Les 27 catégories de recherche ne peuvent donc pas être testées une à une par le formulaire.
- **Andorre et Malte** : le menu de type existe mais s'appelle `drop_2`. L'outil de test actuel ne cherche que `#ctype`, donc ces catégories sont toujours « à trouver ».

### Noms de catégorie qui ne correspondent pas entre le formulaire et la recherche

- formulaire seulement : cz: Foreign citizens and enterprises (1977)
- formulaire seulement : pl: Small-size
- recherche seulement : cz: Foreign citizens and enterprises (1960)
- recherche seulement : de: NATO
- recherche seulement : nl: Cars
- recherche seulement : nl: Motorcycles
- recherche seulement : nl: Taxi
- recherche seulement : nl: Diplomatic
- recherche seulement : nl: Trailers
- recherche seulement : nl: Commercial vehicles
- recherche seulement : nl: Dealer
- recherche seulement : nl: Agricultural vehicles
- recherche seulement : nl: Except vehicles / Oldtimers
- recherche seulement : nl: Military
- recherche seulement : nl: Allied Joint Force Command Brunssum
- recherche seulement : nl: Imported youngtimers / oldtimers
- recherche seulement : nl: Mopeds
- recherche seulement : nl: Heavy Commercial Vehicles (1994 system)
- recherche seulement : nl: Light Commercial Vehicles (1994 system)
- recherche seulement : nl: Semi-trailers
- recherche seulement : nl: Agricultural trailers (2021 system)
- recherche seulement : nl: Border Traffic (1953-2021 system)
- recherche seulement : nl: Dealer (Agricultural)
- recherche seulement : nl: Dealer (Trailers)
- recherche seulement : nl: Dealer (Scooters)
- recherche seulement : nl: Imported oldtimers (motorcycles)
- recherche seulement : nl: Imported oldtimers (commercial vehicles)
- recherche seulement : nl: Royal Household
- recherche seulement : nl: Light electric vehicles and special mopeds
- recherche seulement : nl: Diplomatic Justice Corps (CDJ)
- recherche seulement : nl: One-day registration plate
- recherche seulement : ru: High authorities
- recherche seulement : ru: Diplomatic (Ambassador, chief of diplomatic mission)

## Par pays

| Pays | Menu de type | Types (ajout) | Catégories (recherche) | Champs de plaque | Champs visibles | Erreurs | Notes |
|---|---|---|---|---|---|---|---|
| ad | drop_2 | 5 | 5 | 3 | page au chargement |  | the plate type menu is #drop_2, not #ctype |
| al | ctype | 4 | 4 | 6 | script du site |  |  |
| at | ctype | 9 | 9 | 8 | script du site |  |  |
| ba | ctype | 5 | 5 | 8 | script du site |  |  |
| be | ctype | 5 | 5 | 3 | script du site |  |  |
| bg | ctype | 7 | 7 | 6 | script du site |  |  |
| by | ctype | 18 | 18 | 18 | script du site |  |  |
| ch | ctype | 11 | 11 | 6 | script du site |  |  |
| cz | ctype | 22 | 22 | 10 | script du site |  |  |
| de | ctype | 15 | 16 | 20 | script du site |  |  |
| dk | ctype | 8 | 8 | 15 | script du site |  |  |
| dz | ctype | 7 | 7 | 7 | page au chargement |  |  |
| ee | ctype | 10 | 10 | 5 | script du site |  |  |
| es | ctype | 6 | 6 | 6 | script du site |  |  |
| fi | ctype | 9 | 9 | 7 | script du site |  |  |
| fr | ctype | 17 | 17 | 15 | script du site |  |  |
| gg | ctype | 3 | 3 | 16 | script du site |  |  |
| gr | ctype | 16 | 16 | 6 | script du site |  |  |
| hr | ctype | 11 | 11 | 15 | script du site |  |  |
| hu | ctype | 23 | 23 | 5 | script du site |  |  |
| ie | ctype | 3 | 3 | 5 | script du site |  |  |
| is | ctype | 10 | 10 | 17 | script du site |  |  |
| it | ctype | 14 | 14 | 15 | script du site |  |  |
| li | ctype | 9 | 9 | 4 | script du site |  |  |
| lt | ctype | 9 | 9 | 2 | page au chargement |  |  |
| lu | ctype | 5 | 5 | 3 | script du site |  |  |
| lv | ctype | 9 | 9 | 7 | script du site |  |  |
| ma | ctype | 2 | 2 | 4 | script du site |  |  |
| md | ctype | 8 | 8 | 7 | script du site |  |  |
| me | ctype | 6 | 6 | 11 | script du site |  |  |
| mk | ctype | 8 | 8 | 8 | script du site |  |  |
| mt | drop_2 | 6 | 6 | 7 | page au chargement |  | the plate type menu is #drop_2, not #ctype |
| nl | - | 0 | 27 | 2 | page au chargement |  | no plate type menu: the category is not chosen in this form |
| no | ctype | 12 | 12 | 7 | script du site |  |  |
| pl | ctype | 13 | 12 | 6 | script du site |  |  |
| pt | ctype | 4 | 4 | 7 | script du site |  |  |
| ro | ctype | 5 | 5 | 7 | script du site |  |  |
| rs | ctype | 10 | 10 | 12 | script du site |  |  |
| ru | ctype | 21 | 23 | 10 | script du site |  |  |
| se | ctype | 8 | 8 | 5 | script du site |  |  |
| si | ctype | 4 | 4 | 3 | page au chargement |  |  |
| sk | ctype | 21 | 21 | 10 | script du site |  |  |
| tj | ctype | 10 | 10 | 4 | script du site |  |  |
| tr | ctype | 6 | 6 | 5 | script du site |  |  |
| ua | ctype | 19 | 19 | 22 | script du site |  |  |
| uk | ctype | 10 | 10 | 21 | page au chargement |  |  |
| uz | ctype | 9 | 9 | 12 | script du site |  |  |

## Champs de plaque (identifiants et nombre de pays qui les ont)

`fon` 41 · `digit` 23 · `nomer` 19 · `region` 19 · `b1` 18 · `b2` 13 · `let` 11 · `b3` 10 · `digit1` 9 · `digit2` 9 · `b4` 8 · `r1` 8 · `r2` 8 · `dip` 7 · `let1` 7 · `nomerpl` 7 · `region1` 7 · `let2` 6 · `r3` 6 · `r4` 6 · `b5` 5 · `r5` 5 · `region2` 5 · `letter` 4 · `r6` 4 · `b6` 3 · `dig1` 3 · `dig2` 3 · `exp` 3 · `police` 3 · `region3` 3 · `b7` 2 · `digit3` 2 · `dipcode` 2 · `dipletter` 2 · `dipreg` 2 · `drop_1` 2 · `expdate` 2 · `fon1` 2 · `fon2` 2 · `r0` 2 · `r100` 2 · `r101` 2 · `r102` 2 · `r103` 2 · `r104` 2 · `r105` 2 · `r106` 2 · `r107` 2 · `region4` 2 · `region5` 2 · `season` 2 · `valid` 2 · `bfixed` 1 · `cdate` 1 · `code` 1 · `color` 1 · `data` 1 · `dealp` 1 · `dfon` 1 · `dig3` 1 · `digdip` 1 · `digit11` 1 · `digit4` 1 · `dip1` 1 · `dip2` 1 · `dip3` 1 · `dipb1` 1 · `dipb2` 1 · `dipf` 1 · `dkfont` 1 · `dlet1` 1 · `dlet2` 1 · `dreg` 1 · `dt` 1 · `dw` 1 · `el` 1 · `expiry` 1 · `fonv` 1 · `format1` 1 · `format1_input` 1 · `gnr` 1 · `gov` 1 · `insbg` 1 · `inslet` 1 · `insz` 1 · `let11` 1 · `let3` 1 · `let4` 1 · `letter_fw` 1 · `ltype` 1 · `mb1` 1 · `mb2` 1 · `mil_b1` 1 · `mil_b2` 1 · `mnum1` 1 · `mnum2` 1 · `mtype` 1 · `nomer1` 1 · `nomerpl1` 1 · `nonr` 1 · `noseals` 1 · `num1` 1 · `num2` 1 · `pol1` 1 · `pol2` 1 · `r10` 1 · `r109` 1 · `r110` 1 · `r121` 1 · `r122` 1 · `r123` 1 · `r124` 1 · `r7` 1 · `r8` 1 · `r9` 1 · `reg` 1 · `regdip` 1 · `region6` 1 · `regiondip` 1 · `regionfed` 1 · `regionfed1` 1 · `regionmil` 1 · `regionreg` 1 · `shortplate` 1 · `special` 1 · `spreg` 1 · `transdate` 1 · `trdate` 1 · `trl` 1 · `trz` 1 · `tt95` 1 · `tx` 1 · `year` 1

## Autres champs du formulaire (après la photo)

`CheckBox1` 47 · `CheckBox13` 47 · `CheckBox14` 47 · `CheckBox15` 47 · `CheckBox16` 47 · `CheckBox18` 47 · `CheckBox19` 47 · `CheckBox2` 47 · `CheckBox20` 47 · `CheckBox21` 47 · `CheckBox22` 47 · `CheckBox23` 47 · `CheckBox24` 47 · `CheckBox25` 47 · `CheckBox26` 47 · `CheckBox27` 47 · `CheckBox33` 47 · `CheckBox37` 47 · `CheckBox38` 47 · `CheckBox39` 47 · `CheckBox4` 47 · `CheckBox40` 47 · `CheckBox41` 47 · `CheckBox42` 47 · `CheckBox43` 47 · `CheckBox44` 47 · `CheckBox45` 47 · `CheckBox46` 47 · `CheckBox47` 47 · `CheckBox48` 47 · `CheckBox49` 47 · `CheckBox5` 47 · `CheckBox50` 47 · `CheckBox52` 47 · `CheckBox53` 47 · `CheckBox56` 47 · `CheckBox57` 47 · `CheckBox58` 47 · `CheckBox59` 47 · `CheckBox6` 47 · `CheckBox60` 47 · `CheckBox61` 47 · `CheckBox62` 47 · `CheckBox63` 47 · `CheckBox64` 47 · `CheckBox65` 47 · `CheckBox66` 47 · `CheckBox67` 47 · `CheckBox68` 47 · `CheckBox69` 47 · `CheckBox8` 47 · `CheckBox9` 47 · `dop` 47 · `enablesave` 47 · `hide` 47 · `markaavto` 47 · `markamodtype` 47 · `model` 47 · `modgen` 47 · `null` 47 · `patternenable` 45
