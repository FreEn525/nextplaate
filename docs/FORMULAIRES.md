# Ce que disent les pages sauvegardées

Généré par `node scripts/analyze-pages.mjs` à partir de `reference/real/countries` : ne pas modifier à la main. Les détails de chaque pays sont dans `data/countries/<cc>/form.json` (formulaire d'ajout) et `search.json` (page de recherche).

## En chiffres

- Pays analysés : 84 (page d'ajout et page de recherche).
- Menu de type de plaque : `#ctype` dans 81 pays, `#drop_2` dans 2 (ad, mt), aucun dans 1 (nl).
- Types dans les formulaires d'ajout : 723. Catégories dans les pages de recherche : 762.
- Champs visibles par type : calculés avec le script du site dans 74 pays ; lus tels que la page les affiche au chargement dans 10 pays (aucune fonction d'affichage : ad, br, dz, je, ke, lt, mt, nl, si, uk).
- Types où le calcul a échoué : 1.

## À comprendre

- **Pays-Bas** : pas de menu de type. Le champ `fon` décrit l'apparence de la plaque (bandeau, une ou deux lignes, couleur), pas la catégorie : la catégorie (voiture, taxi, remorque...) ne se choisit pas dans ce formulaire. Les 27 catégories de recherche ne peuvent donc pas être testées une à une par le formulaire.
- **Andorre et Malte** : le menu de type existe mais s'appelle `drop_2`. L'outil de test actuel ne cherche que `#ctype`, donc ces catégories sont toujours « à trouver ».

### Noms de catégorie qui ne correspondent pas entre le formulaire et la recherche

- formulaire seulement : cl: AB-CD-12
- formulaire seulement : cl: AB-12-34
- formulaire seulement : cz: Foreign citizens and enterprises (1977)
- formulaire seulement : ge: Cars (2014)
- formulaire seulement : ge: Trailers and special equipment (2014)
- formulaire seulement : il: Oldtimers
- formulaire seulement : pl: Small-size
- recherche seulement : az: Foreign citizens and enterprises
- recherche seulement : cl: Cars (AB-CD-12)
- recherche seulement : cl: Taxi (AB-CD-12)
- recherche seulement : cl: Shared taxis (AB-CD-12)
- recherche seulement : cl: Special airport taxis and tourist vehicles (AB-CD-12)
- recherche seulement : cl: Free economic zones (AB-CD-12)
- recherche seulement : cl: Buses (AB-CD-12)
- recherche seulement : cl: Cars (AB-12-34)
- recherche seulement : cl: Taxi (AB-12-34)
- recherche seulement : cl: Shared taxis (AB-12-34)
- recherche seulement : cl: Special airport taxis and tourist vehicles (AB-12-34)
- recherche seulement : cl: Free economic zones (AB-12-34)
- recherche seulement : cl: Buses (AB-12-34)
- recherche seulement : cy: Commercial vehicles
- recherche seulement : cz: Foreign citizens and enterprises (1960)
- recherche seulement : de: NATO
- recherche seulement : ge: Cars (2024)
- recherche seulement : ge: Trailers and special equipment (2024)
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
| am | ctype | 8 | 8 | 10 | script du site |  |  |
| ar | ctype | 6 | 6 | 7 | script du site |  |  |
| at | ctype | 9 | 9 | 8 | script du site |  |  |
| ax | ctype | 5 | 5 | 8 | script du site |  |  |
| az | ctype | 4 | 5 | 4 | script du site |  |  |
| ba | ctype | 5 | 5 | 8 | script du site |  |  |
| be | ctype | 5 | 5 | 3 | script du site |  |  |
| bg | ctype | 7 | 7 | 6 | script du site |  |  |
| bh | ctype | 7 | 7 | 2 | script du site |  |  |
| br | ctype | 13 | 13 | 3 | page au chargement |  |  |
| bs | ctype | 7 | 7 | 3 | script du site |  |  |
| by | ctype | 18 | 18 | 18 | script du site |  |  |
| ch | ctype | 11 | 11 | 6 | script du site |  |  |
| cl | ctype | 5 | 15 | 8 | script du site |  |  |
| cn | ctype | 6 | 6 | 7 | script du site |  |  |
| cy | ctype | 5 | 5 | 7 | script du site |  |  |
| cz | ctype | 22 | 22 | 10 | script du site |  |  |
| de | ctype | 15 | 16 | 20 | script du site |  |  |
| dk | ctype | 8 | 8 | 15 | script du site |  |  |
| dz | ctype | 7 | 7 | 7 | page au chargement |  |  |
| ee | ctype | 10 | 10 | 5 | script du site |  |  |
| eg | ctype | 4 | 4 | 13 | script du site |  |  |
| es | ctype | 6 | 6 | 6 | script du site |  |  |
| fi | ctype | 9 | 9 | 7 | script du site |  |  |
| fr | ctype | 17 | 17 | 15 | script du site |  |  |
| ge | ctype | 12 | 12 | 7 | script du site |  |  |
| gg | ctype | 3 | 3 | 16 | script du site |  |  |
| gi | ctype | 4 | 4 | 7 | script du site |  |  |
| gr | ctype | 16 | 16 | 6 | script du site |  |  |
| gu | ctype | 9 | 9 | 3 | script du site |  |  |
| hk | ctype | 2 | 2 | 4 | script du site |  |  |
| hr | ctype | 11 | 11 | 15 | script du site |  |  |
| hu | ctype | 23 | 23 | 5 | script du site |  |  |
| id | ctype | 7 | 7 | 7 | script du site |  |  |
| ie | ctype | 3 | 3 | 5 | script du site |  |  |
| il | ctype | 9 | 8 | 14 | script du site |  |  |
| iq | ctype | 4 | 4 | 33 | script du site |  |  |
| ir | ctype | 16 | 16 | 30 | script du site |  |  |
| is | ctype | 10 | 10 | 17 | script du site |  |  |
| it | ctype | 14 | 14 | 15 | script du site |  |  |
| je | ctype | 2 | 2 | 14 | page au chargement |  |  |
| jp | ctype | 4 | 4 | 21 | script du site |  |  |
| ke | ctype | 12 | 12 | 2 | page au chargement |  |  |
| kg | ctype | 12 | 12 | 19 | script du site | 1 |  |
| kh | ctype | 7 | 7 | 6 | script du site |  |  |
| kr | ctype | 3 | 3 | 6 | script du site |  |  |
| kw | ctype | 4 | 4 | 2 | script du site |  |  |
| kz | ctype | 18 | 18 | 36 | script du site |  |  |
| la | ctype | 9 | 9 | 11 | script du site |  |  |
| li | ctype | 9 | 9 | 4 | script du site |  |  |
| lt | ctype | 9 | 9 | 2 | page au chargement |  |  |
| lu | ctype | 5 | 5 | 3 | script du site |  |  |
| lv | ctype | 9 | 9 | 7 | script du site |  |  |
| ma | ctype | 2 | 2 | 4 | script du site |  |  |
| mc | ctype | 4 | 4 | 6 | script du site |  |  |
| md | ctype | 8 | 8 | 7 | script du site |  |  |
| me | ctype | 6 | 6 | 11 | script du site |  |  |
| mk | ctype | 8 | 8 | 8 | script du site |  |  |
| mn | ctype | 4 | 4 | 6 | script du site |  |  |
| mp | ctype | 6 | 6 | 3 | script du site |  |  |
| mt | drop_2 | 6 | 6 | 7 | page au chargement |  | the plate type menu is #drop_2, not #ctype |
| nl | - | 0 | 27 | 2 | page au chargement |  | no plate type menu: the category is not chosen in this form |
| no | ctype | 12 | 12 | 7 | script du site |  |  |
| pl | ctype | 13 | 12 | 6 | script du site |  |  |
| pt | ctype | 4 | 4 | 7 | script du site |  |  |
| qa | ctype | 6 | 6 | 13 | script du site |  |  |
| ro | ctype | 5 | 5 | 7 | script du site |  |  |
| rs | ctype | 10 | 10 | 12 | script du site |  |  |
| ru | ctype | 21 | 23 | 10 | script du site |  |  |
| sa | ctype | 6 | 6 | 27 | script du site |  |  |
| sc | ctype | 9 | 9 | 7 | script du site |  |  |
| se | ctype | 8 | 8 | 5 | script du site |  |  |
| si | ctype | 4 | 4 | 3 | page au chargement |  |  |
| sk | ctype | 21 | 21 | 10 | script du site |  |  |
| su | ctype | 15 | 15 | 12 | script du site |  |  |
| th | ctype | 9 | 9 | 21 | script du site |  |  |
| tj | ctype | 10 | 10 | 4 | script du site |  |  |
| tr | ctype | 6 | 6 | 5 | script du site |  |  |
| ua | ctype | 19 | 19 | 22 | script du site |  |  |
| uk | ctype | 10 | 10 | 21 | page au chargement |  |  |
| uz | ctype | 9 | 9 | 12 | script du site |  |  |
| vn | ctype | 8 | 8 | 7 | script du site |  |  |

## Champs de plaque (identifiants et nombre de pays qui les ont)

`fon` 68 · `digit` 36 · `nomer` 32 · `b1` 31 · `region` 30 · `b2` 22 · `let` 18 · `r1` 17 · `b3` 16 · `r2` 15 · `digit1` 13 · `r3` 13 · `r4` 13 · `digit2` 12 · `r5` 12 · `region1` 12 · `b4` 11 · `dip` 11 · `r6` 11 · `nomerpl` 10 · `region2` 10 · `let1` 9 · `let2` 8 · `b5` 6 · `r7` 6 · `r8` 6 · `d1` 5 · `d2` 5 · `d3` 5 · `d4` 5 · `r10` 5 · `r9` 5 · `b6` 4 · `cdate` 4 · `dig1` 4 · `dig2` 4 · `digit3` 4 · `drop_1` 4 · `expdate` 4 · `fon1` 4 · `letter` 4 · `r11` 4 · `r12` 4 · `region3` 4 · `year` 4 · `b7` 3 · `d5` 3 · `d6` 3 · `exp` 3 · `fon2` 3 · `format1` 3 · `police` 3 · `r100` 3 · `r101` 3 · `r102` 3 · `r103` 3 · `r104` 3 · `r105` 3 · `r106` 3 · `r13` 3 · `r14` 3 · `r15` 3 · `r16` 3 · `r17` 3 · `region4` 3 · `region5` 3 · `code` 2 · `dig3` 2 · `digit4` 2 · `digit5` 2 · `dipcode` 2 · `dipletter` 2 · `dipreg` 2 · `fonfnt` 2 · `format1_input` 2 · `r0` 2 · `r107` 2 · `r18` 2 · `r19` 2 · `r20` 2 · `reg1` 2 · `regdip` 2 · `season` 2 · `trl` 2 · `valid` 2 · `arm` 1 · `b1c` 1 · `b1com` 1 · `b1dop` 1 · `b1i` 1 · `b1l` 1 · `b1mt` 1 · `b1p` 1 · `b1txc` 1 · `b1v` 1 · `b2i` 1 · `base1` 1 · `base10` 1 · `base10g` 1 · `base11` 1 · `base12` 1 · `base13` 1 · `base13g` 1 · `base5` 1 · `base6` 1 · `base7` 1 · `base8` 1 · `base8g` 1 · `base9` 1 · `bfixed` 1 · `color` 1 · `ct` 1 · `d7` 1 · `d8` 1 · `data` 1 · `day` 1 · `dealp` 1 · `dfon` 1 · `dig0` 1 · `digdip` 1 · `dighk` 1 · `digit11` 1 · `dip_code` 1 · `dip_kind` 1 · `dip_month` 1 · `dip_system` 1 · `dip_year` 1 · `dip1` 1 · `dip2` 1 · `dip3` 1 · `dipb1` 1 · `dipb2` 1 · `dipdate` 1 · `dipf` 1 · `dipfrm` 1 · `dkfont` 1 · `dlet1` 1 · `dlet2` 1 · `dop` 1 · `dop1` 1 · `dreg` 1 · `dt` 1 · `dw` 1 · `el` 1 · `EV` 1 · `expiry` 1 · `fonSelfDrive` 1 · `font` 1 · `fonv` 1 · `foreignfrm` 1 · `format` 1 · `gnr` 1 · `gov` 1 · `hiragana` 1 · `hkmo` 1 · `hv` 1 · `insbg` 1 · `inslet` 1 · `insz` 1 · `kg_hologram` 1 · `kg2016_color_white` 1 · `kg2016_color_yellow` 1 · `kg2016_pos_bottom` 1 · `kg2016_pos_top` 1 · `kg2016_reduced` 1 · `kzaddmilfon1` 1 · `kzaddmilfon41` 1 · `kzaddmilfon43` 1 · `kzaddvlast1` 1 · `kzaddvlast15` 1 · `kzaddvlast17` 1 · `kzaddvlast25` 1 · `kzaddvlast27` 1 · `kzaddvlast29` 1 · `kzaddvlast3` 1 · `kzaddvlast5` 1 · `kzaddvlast7` 1 · `kzaddvlast9` 1 · `largeletter` 1 · `let11` 1 · `let3` 1 · `let4` 1 · `lethk` 1 · `letter_fw` 1 · `ltype` 1 · `mb1` 1 · `mb2` 1 · `mil_b1` 1 · `mil_b2` 1 · `milb1` 1 · `milb2` 1 · `milfrm` 1 · `milt` 1 · `mm` 1 · `mnum1` 1 · `mnum2` 1 · `month` 1 · `moto` 1 · `mtype` 1 · `nomer_line0` 1 · `nomer_line1` 1 · `nomer_line2` 1 · `nomer1` 1 · `nomerhk` 1 · `nomerpl1` 1 · `nonr` 1 · `noseals` 1 · `num1` 1 · `num2` 1 · `oldfont` 1 · `p1` 1 · `p2` 1 · `pol1` 1 · `pol2` 1 · `r109` 1 · `r110` 1 · `r121` 1 · `r122` 1 · `r123` 1 · `r124` 1 · `r21` 1 · `r22` 1 · `r23` 1 · `reg` 1 · `region6` 1 · `region7` 1 · `regiondip` 1 · `regionfed` 1 · `regionfed1` 1 · `regioni` 1 · `regionmil` 1 · `regionreg` 1 · `regmil` 1 · `rent` 1 · `rg_r1` 1 · `rg_r10` 1 · `rg_r11` 1 · `rg_r12` 1 · `rg_r2` 1 · `rg_r20` 1 · `rg_r3` 1 · `rg_r4` 1 · `rg_r9` 1 · `sc_rg_1` 1 · `sc_rg_2` 1 · `shortplate` 1 · `spec` 1 · `special` 1 · `spreg` 1 · `testprefix` 1 · `tractorfrm` 1 · `trailer` 1 · `transdate` 1 · `transit_suffix` 1 · `trdate` 1 · `trz` 1 · `tt95` 1 · `tx` 1

## Autres champs du formulaire (après la photo)

`CheckBox1` 84 · `CheckBox13` 84 · `CheckBox14` 84 · `CheckBox15` 84 · `CheckBox16` 84 · `CheckBox18` 84 · `CheckBox19` 84 · `CheckBox2` 84 · `CheckBox20` 84 · `CheckBox21` 84 · `CheckBox22` 84 · `CheckBox23` 84 · `CheckBox24` 84 · `CheckBox25` 84 · `CheckBox26` 84 · `CheckBox27` 84 · `CheckBox33` 84 · `CheckBox37` 84 · `CheckBox38` 84 · `CheckBox39` 84 · `CheckBox4` 84 · `CheckBox40` 84 · `CheckBox41` 84 · `CheckBox42` 84 · `CheckBox43` 84 · `CheckBox44` 84 · `CheckBox45` 84 · `CheckBox46` 84 · `CheckBox47` 84 · `CheckBox48` 84 · `CheckBox49` 84 · `CheckBox5` 84 · `CheckBox50` 84 · `CheckBox52` 84 · `CheckBox53` 84 · `CheckBox56` 84 · `CheckBox57` 84 · `CheckBox58` 84 · `CheckBox59` 84 · `CheckBox6` 84 · `CheckBox60` 84 · `CheckBox61` 84 · `CheckBox62` 84 · `CheckBox63` 84 · `CheckBox64` 84 · `CheckBox65` 84 · `CheckBox66` 84 · `CheckBox67` 84 · `CheckBox68` 84 · `CheckBox69` 84 · `CheckBox8` 84 · `CheckBox9` 84 · `dop` 84 · `enablesave` 84 · `hide` 84 · `markaavto` 84 · `markamodtype` 84 · `model` 84 · `modgen` 84 · `null` 84 · `patternenable` 60
