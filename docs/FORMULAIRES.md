# Ce que disent les pages sauvegardées

Généré par `node scripts/analyze-pages.mjs` à partir de `reference/real/countries` : ne pas modifier à la main. Les détails de chaque pays sont dans `data/countries/<cc>/form.json` (formulaire d'ajout) et `search.json` (page de recherche).

## En chiffres

- Pays analysés : 96 (page d'ajout et page de recherche).
- Menu de type de plaque : `#ctype` dans 81 pays, `#drop_2` dans 6 (ad, mt, nz, ps, sm, va), aucun dans 9 (ae, au, ca, mx, my, nl, sg, us, xx).
- Types dans les formulaires d'ajout : 753. Catégories dans les pages de recherche : 829.
- Champs visibles par type : calculés avec le script du site dans 75 pays ; lus tels que la page les affiche au chargement dans 21 pays (aucune fonction d'affichage : ad, ae, au, br, ca, dz, je, ke, lt, mt, mx, my, nl, nz, sg, si, sm, uk, us, va, xx).
- Types où le calcul a échoué : 1.

## Les trois formes de formulaire

- **Menu de type** (`ctype` : 81 pays ; `drop_2` : ad, mt, nz, ps, sm, va) : la catégorie se choisit dans le formulaire, donc sa règle peut être essayée une à une.
- **Menu de région seulement** (`drop_1`, texte libre pour la plaque) : ae, au, ca, mx, us, xx. Le formulaire ne choisit pas de catégorie : la recherche du site filtre par région (ae, au, ca, us, xx n'ont donc aucune catégorie de recherche ; mx en a 20 qui ne se choisissent pas dans le formulaire).
- **Texte libre** (aucun menu) : my, nl, sg. La catégorie se déduit du texte de la plaque côté site (Pays-Bas : le champ `fon` ne décrit que l'apparence).

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
- recherche seulement : mx: Cars (AAA-00-00)
- recherche seulement : mx: Cars (AAA-000-A)
- recherche seulement : mx: Cars (000-AAA)
- recherche seulement : mx: Cars (A00-AAA)
- recherche seulement : mx: Trucks (AA-0000-A)
- recherche seulement : mx: Trucks (AA-00-000)
- recherche seulement : mx: Trucks (00-00-AA)
- recherche seulement : mx: Trucks (A-000-AA)
- recherche seulement : mx: Trailers (0-AA-0000)
- recherche seulement : mx: Trailers (0AA-000-A)
- recherche seulement : mx: Trailers (A-00-00)
- recherche seulement : mx: Border zone (A00-AAA-0)
- recherche seulement : mx: Border zone (000-AAA-0)
- recherche seulement : mx: Federal (00-AA-0A)
- recherche seulement : mx: Federal (00-00-AA)
- recherche seulement : mx: Federal (000-AA-0)
- recherche seulement : mx: Motorcycles (00AAA0)
- recherche seulement : mx: Motorcycles (AAA0A)
- recherche seulement : mx: Oldtimers (0AA-00)
- recherche seulement : mx: Dealer (0-AA-00)
- recherche seulement : my: A(BC) 1(234)
- recherche seulement : my: AB(C) 1(234) D
- recherche seulement : my: Taxi (HAB 1(234))
- recherche seulement : my: Military (Z(A) 1(234))
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
- recherche seulement : sg: Private owners
- recherche seulement : sg: Commercial vehicles
- recherche seulement : sg: Taxi / Rentals
- recherche seulement : sg: Motorcycles
- recherche seulement : sg: Buses
- recherche seulement : sg: Trucks
- recherche seulement : sg: Exceptional vehicles
- recherche seulement : sg: Trailers
- recherche seulement : sg: Police
- recherche seulement : sg: Restricted Use
- recherche seulement : sg: For research and development
- recherche seulement : sg: Special machinery
- recherche seulement : sg: Authorities

## Par pays

| Pays | Forme | Menu de type | Types (ajout) | Catégories (recherche) | Champs de plaque | Champs visibles | Erreurs | Notes |
|---|---|---|---|---|---|---|---|---|
| ad | type-menu | drop_2 | 5 | 5 | 3 | page au chargement |  | the plate type menu is #drop_2, not #ctype |
| ae | region-menu | - | 0 | 0 | 2 | page au chargement |  | no plate type menu: the plate is chosen by region (#drop_1) and typed freely |
| al | type-menu | ctype | 4 | 4 | 6 | script du site |  |  |
| am | type-menu | ctype | 8 | 8 | 10 | script du site |  |  |
| ar | type-menu | ctype | 6 | 6 | 7 | script du site |  |  |
| at | type-menu | ctype | 9 | 9 | 8 | script du site |  |  |
| au | region-menu | - | 0 | 0 | 2 | page au chargement |  | no plate type menu: the plate is chosen by region (#drop_1) and typed freely |
| ax | type-menu | ctype | 5 | 5 | 8 | script du site |  |  |
| az | type-menu | ctype | 4 | 5 | 4 | script du site |  |  |
| ba | type-menu | ctype | 5 | 5 | 8 | script du site |  |  |
| be | type-menu | ctype | 5 | 5 | 3 | script du site |  |  |
| bg | type-menu | ctype | 7 | 7 | 6 | script du site |  |  |
| bh | type-menu | ctype | 7 | 7 | 2 | script du site |  |  |
| br | type-menu | ctype | 13 | 13 | 3 | page au chargement |  |  |
| bs | type-menu | ctype | 7 | 7 | 3 | script du site |  |  |
| by | type-menu | ctype | 18 | 18 | 18 | script du site |  |  |
| ca | region-menu | - | 0 | 0 | 3 | page au chargement |  | no plate type menu: the plate is chosen by region (#drop_1) and typed freely |
| ch | type-menu | ctype | 11 | 11 | 6 | script du site |  |  |
| cl | type-menu | ctype | 5 | 15 | 8 | script du site |  |  |
| cn | type-menu | ctype | 6 | 6 | 7 | script du site |  |  |
| cy | type-menu | ctype | 5 | 5 | 7 | script du site |  |  |
| cz | type-menu | ctype | 22 | 22 | 10 | script du site |  |  |
| de | type-menu | ctype | 15 | 16 | 20 | script du site |  |  |
| dk | type-menu | ctype | 8 | 8 | 15 | script du site |  |  |
| dz | type-menu | ctype | 7 | 7 | 7 | page au chargement |  |  |
| ee | type-menu | ctype | 10 | 10 | 5 | script du site |  |  |
| eg | type-menu | ctype | 4 | 4 | 13 | script du site |  |  |
| es | type-menu | ctype | 6 | 6 | 6 | script du site |  |  |
| fi | type-menu | ctype | 9 | 9 | 7 | script du site |  |  |
| fr | type-menu | ctype | 17 | 17 | 15 | script du site |  |  |
| ge | type-menu | ctype | 12 | 12 | 7 | script du site |  |  |
| gg | type-menu | ctype | 3 | 3 | 16 | script du site |  |  |
| gi | type-menu | ctype | 4 | 4 | 7 | script du site |  |  |
| gr | type-menu | ctype | 16 | 16 | 6 | script du site |  |  |
| gu | type-menu | ctype | 9 | 9 | 3 | script du site |  |  |
| hk | type-menu | ctype | 2 | 2 | 4 | script du site |  |  |
| hr | type-menu | ctype | 11 | 11 | 15 | script du site |  |  |
| hu | type-menu | ctype | 23 | 23 | 5 | script du site |  |  |
| id | type-menu | ctype | 7 | 7 | 7 | script du site |  |  |
| ie | type-menu | ctype | 3 | 3 | 5 | script du site |  |  |
| il | type-menu | ctype | 9 | 8 | 14 | script du site |  |  |
| iq | type-menu | ctype | 4 | 4 | 33 | script du site |  |  |
| ir | type-menu | ctype | 16 | 16 | 30 | script du site |  |  |
| is | type-menu | ctype | 10 | 10 | 17 | script du site |  |  |
| it | type-menu | ctype | 14 | 14 | 15 | script du site |  |  |
| je | type-menu | ctype | 2 | 2 | 14 | page au chargement |  |  |
| jp | type-menu | ctype | 4 | 4 | 21 | script du site |  |  |
| ke | type-menu | ctype | 12 | 12 | 2 | page au chargement |  |  |
| kg | type-menu | ctype | 12 | 12 | 19 | script du site | 1 |  |
| kh | type-menu | ctype | 7 | 7 | 6 | script du site |  |  |
| kr | type-menu | ctype | 3 | 3 | 6 | script du site |  |  |
| kw | type-menu | ctype | 4 | 4 | 2 | script du site |  |  |
| kz | type-menu | ctype | 18 | 18 | 36 | script du site |  |  |
| la | type-menu | ctype | 9 | 9 | 11 | script du site |  |  |
| li | type-menu | ctype | 9 | 9 | 4 | script du site |  |  |
| lt | type-menu | ctype | 9 | 9 | 2 | page au chargement |  |  |
| lu | type-menu | ctype | 5 | 5 | 3 | script du site |  |  |
| lv | type-menu | ctype | 9 | 9 | 7 | script du site |  |  |
| ma | type-menu | ctype | 2 | 2 | 4 | script du site |  |  |
| mc | type-menu | ctype | 4 | 4 | 6 | script du site |  |  |
| md | type-menu | ctype | 8 | 8 | 7 | script du site |  |  |
| me | type-menu | ctype | 6 | 6 | 11 | script du site |  |  |
| mk | type-menu | ctype | 8 | 8 | 8 | script du site |  |  |
| mn | type-menu | ctype | 4 | 4 | 6 | script du site |  |  |
| mp | type-menu | ctype | 6 | 6 | 3 | script du site |  |  |
| mt | type-menu | drop_2 | 6 | 6 | 7 | page au chargement |  | the plate type menu is #drop_2, not #ctype |
| mx | region-menu | - | 0 | 20 | 2 | page au chargement |  | no plate type menu: the plate is chosen by region (#drop_1) and typed freely |
| my | free-text | - | 0 | 4 | 2 | page au chargement |  | no plate type menu: the plate is typed freely |
| nl | free-text | - | 0 | 27 | 2 | page au chargement |  | no plate type menu: the plate is typed freely |
| no | type-menu | ctype | 12 | 12 | 7 | script du site |  |  |
| nz | type-menu | drop_2 | 5 | 5 | 13 | page au chargement |  | the plate type menu is #drop_2, not #ctype |
| pl | type-menu | ctype | 13 | 12 | 6 | script du site |  |  |
| ps | type-menu | drop_2 | 6 | 6 | 14 | script du site |  | the plate type menu is #drop_2, not #ctype |
| pt | type-menu | ctype | 4 | 4 | 7 | script du site |  |  |
| qa | type-menu | ctype | 6 | 6 | 13 | script du site |  |  |
| ro | type-menu | ctype | 5 | 5 | 7 | script du site |  |  |
| rs | type-menu | ctype | 10 | 10 | 12 | script du site |  |  |
| ru | type-menu | ctype | 21 | 23 | 10 | script du site |  |  |
| sa | type-menu | ctype | 6 | 6 | 27 | script du site |  |  |
| sc | type-menu | ctype | 9 | 9 | 7 | script du site |  |  |
| se | type-menu | ctype | 8 | 8 | 5 | script du site |  |  |
| sg | free-text | - | 0 | 13 | 23 | page au chargement |  | no plate type menu: the plate is typed freely |
| si | type-menu | ctype | 4 | 4 | 3 | page au chargement |  |  |
| sk | type-menu | ctype | 21 | 21 | 10 | script du site |  |  |
| sm | type-menu | drop_2 | 13 | 13 | 2 | page au chargement |  | the plate type menu is #drop_2, not #ctype |
| su | type-menu | ctype | 15 | 15 | 12 | script du site |  |  |
| th | type-menu | ctype | 9 | 9 | 21 | script du site |  |  |
| tj | type-menu | ctype | 10 | 10 | 4 | script du site |  |  |
| tr | type-menu | ctype | 6 | 6 | 5 | script du site |  |  |
| ua | type-menu | ctype | 19 | 19 | 22 | script du site |  |  |
| uk | type-menu | ctype | 10 | 10 | 21 | page au chargement |  |  |
| us | region-menu | - | 0 | 0 | 3 | page au chargement |  | no plate type menu: the plate is chosen by region (#drop_1) and typed freely |
| uz | type-menu | ctype | 9 | 9 | 12 | script du site |  |  |
| va | type-menu | drop_2 | 6 | 6 | 3 | page au chargement |  | the plate type menu is #drop_2, not #ctype |
| vn | type-menu | ctype | 8 | 8 | 7 | script du site |  |  |
| xx | region-menu | - | 0 | 0 | 1 | page au chargement |  | no plate type menu: the plate is chosen by region (#drop_1) and typed freely |

## Champs de plaque (identifiants et nombre de pays qui les ont)

`fon` 69 · `nomer` 41 · `digit` 36 · `b1` 31 · `region` 30 · `b2` 22 · `r1` 22 · `let` 19 · `r2` 19 · `b3` 16 · `r3` 15 · `digit1` 14 · `r4` 14 · `digit2` 13 · `r5` 13 · `r6` 12 · `region1` 12 · `b4` 11 · `dip` 11 · `drop_1` 10 · `nomerpl` 10 · `region2` 10 · `let1` 9 · `let2` 8 · `r7` 8 · `r10` 7 · `r8` 7 · `b5` 6 · `r11` 6 · `r12` 6 · `r9` 6 · `d1` 5 · `d2` 5 · `d3` 5 · `d4` 5 · `letter` 5 · `r13` 5 · `r14` 5 · `r15` 5 · `r16` 5 · `r17` 5 · `year` 5 · `b6` 4 · `cdate` 4 · `dig1` 4 · `dig2` 4 · `digit3` 4 · `expdate` 4 · `fon1` 4 · `region3` 4 · `b7` 3 · `d5` 3 · `d6` 3 · `exp` 3 · `fon2` 3 · `format1` 3 · `police` 3 · `r100` 3 · `r101` 3 · `r102` 3 · `r103` 3 · `r104` 3 · `r105` 3 · `r106` 3 · `r18` 3 · `r19` 3 · `r20` 3 · `reg1` 3 · `region4` 3 · `region5` 3 · `cntr` 2 · `code` 2 · `dig3` 2 · `digit4` 2 · `digit5` 2 · `dipcode` 2 · `dipletter` 2 · `dipreg` 2 · `fonfnt` 2 · `font` 2 · `format1_input` 2 · `r0` 2 · `r107` 2 · `r21` 2 · `r22` 2 · `regdip` 2 · `season` 2 · `trl` 2 · `valid` 2 · `arm` 1 · `b1c` 1 · `b1com` 1 · `b1dop` 1 · `b1i` 1 · `b1l` 1 · `b1mt` 1 · `b1p` 1 · `b1txc` 1 · `b1v` 1 · `b2i` 1 · `base1` 1 · `base10` 1 · `base10g` 1 · `base11` 1 · `base12` 1 · `base13` 1 · `base13g` 1 · `base5` 1 · `base6` 1 · `base7` 1 · `base8` 1 · `base8g` 1 · `base9` 1 · `bfixed` 1 · `checksum` 1 · `color` 1 · `ct` 1 · `d7` 1 · `d8` 1 · `data` 1 · `day` 1 · `dealp` 1 · `dfon` 1 · `dig` 1 · `dig0` 1 · `digdip` 1 · `dighk` 1 · `digit11` 1 · `dip_code` 1 · `dip_kind` 1 · `dip_month` 1 · `dip_system` 1 · `dip_year` 1 · `dip1` 1 · `dip2` 1 · `dip3` 1 · `dipb1` 1 · `dipb2` 1 · `dipdate` 1 · `dipf` 1 · `dipfrm` 1 · `dkfont` 1 · `dlet1` 1 · `dlet2` 1 · `dop` 1 · `dop1` 1 · `dreg` 1 · `dt` 1 · `dw` 1 · `el` 1 · `EV` 1 · `expiry` 1 · `fonSelfDrive` 1 · `fonv` 1 · `foreignfrm` 1 · `format` 1 · `gnr` 1 · `gov` 1 · `hiragana` 1 · `hkmo` 1 · `hv` 1 · `insbg` 1 · `inslet` 1 · `insz` 1 · `kg_hologram` 1 · `kg2016_color_white` 1 · `kg2016_color_yellow` 1 · `kg2016_pos_bottom` 1 · `kg2016_pos_top` 1 · `kg2016_reduced` 1 · `kzaddmilfon1` 1 · `kzaddmilfon41` 1 · `kzaddmilfon43` 1 · `kzaddvlast1` 1 · `kzaddvlast15` 1 · `kzaddvlast17` 1 · `kzaddvlast25` 1 · `kzaddvlast27` 1 · `kzaddvlast29` 1 · `kzaddvlast3` 1 · `kzaddvlast5` 1 · `kzaddvlast7` 1 · `kzaddvlast9` 1 · `largeletter` 1 · `let11` 1 · `let3` 1 · `let4` 1 · `lethk` 1 · `letter_fw` 1 · `ltype` 1 · `mb1` 1 · `mb2` 1 · `mil_b1` 1 · `mil_b2` 1 · `milb1` 1 · `milb2` 1 · `milfrm` 1 · `milt` 1 · `mm` 1 · `mnum1` 1 · `mnum2` 1 · `month` 1 · `moto` 1 · `mtype` 1 · `nomer_line0` 1 · `nomer_line1` 1 · `nomer_line2` 1 · `nomer1` 1 · `nomerhk` 1 · `nomerpl1` 1 · `nonr` 1 · `noseals` 1 · `num1` 1 · `num2` 1 · `oldfont` 1 · `p1` 1 · `p2` 1 · `pol1` 1 · `pol2` 1 · `r109` 1 · `r110` 1 · `r121` 1 · `r122` 1 · `r123` 1 · `r124` 1 · `r23` 1 · `r33` 1 · `reg` 1 · `reg2` 1 · `reg3` 1 · `region6` 1 · `region7` 1 · `regiondip` 1 · `regionfed` 1 · `regionfed1` 1 · `regioni` 1 · `regionmil` 1 · `regionreg` 1 · `regmil` 1 · `rent` 1 · `rg_r1` 1 · `rg_r10` 1 · `rg_r11` 1 · `rg_r12` 1 · `rg_r2` 1 · `rg_r20` 1 · `rg_r3` 1 · `rg_r4` 1 · `rg_r9` 1 · `sc_rg_1` 1 · `sc_rg_2` 1 · `shortplate` 1 · `spec` 1 · `special` 1 · `spreg` 1 · `subletter` 1 · `testprefix` 1 · `tractorfrm` 1 · `trailer` 1 · `transdate` 1 · `transit_suffix` 1 · `trdate` 1 · `trz` 1 · `tt95` 1 · `tx` 1

## Autres champs du formulaire (après la photo)

`CheckBox1` 96 · `CheckBox13` 96 · `CheckBox14` 96 · `CheckBox15` 96 · `CheckBox16` 96 · `CheckBox18` 96 · `CheckBox19` 96 · `CheckBox2` 96 · `CheckBox20` 96 · `CheckBox21` 96 · `CheckBox22` 96 · `CheckBox23` 96 · `CheckBox24` 96 · `CheckBox25` 96 · `CheckBox26` 96 · `CheckBox27` 96 · `CheckBox33` 96 · `CheckBox37` 96 · `CheckBox38` 96 · `CheckBox39` 96 · `CheckBox4` 96 · `CheckBox40` 96 · `CheckBox41` 96 · `CheckBox42` 96 · `CheckBox43` 96 · `CheckBox44` 96 · `CheckBox45` 96 · `CheckBox46` 96 · `CheckBox47` 96 · `CheckBox48` 96 · `CheckBox49` 96 · `CheckBox5` 96 · `CheckBox50` 96 · `CheckBox52` 96 · `CheckBox53` 96 · `CheckBox56` 96 · `CheckBox57` 96 · `CheckBox58` 96 · `CheckBox59` 96 · `CheckBox6` 96 · `CheckBox60` 96 · `CheckBox61` 96 · `CheckBox62` 96 · `CheckBox63` 96 · `CheckBox64` 96 · `CheckBox65` 96 · `CheckBox66` 96 · `CheckBox67` 96 · `CheckBox68` 96 · `CheckBox69` 96 · `CheckBox8` 96 · `CheckBox9` 96 · `dop` 96 · `enablesave` 96 · `hide` 96 · `markaavto` 96 · `markamodtype` 96 · `model` 96 · `modgen` 96 · `null` 96 · `patternenable` 65
