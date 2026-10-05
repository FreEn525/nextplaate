# Plaques à vérifier à la main sur le site

Généré par `python tools/hand_check.py`. Pour chaque ligne : ouvrir `platesmania.com/<pays>/add`, choisir la catégorie dans le menu de type, remplir les champs comme indiqué, ouvrir le tiroir **Search** (loupe) : la vérification de plaque doit dire que la plaque est déjà sur le site (1 photo ou plus). Un champ « écrit par le site » est grisé : on n'y touche pas.

| Pays | Catégorie | Plaque | Comment la saisir |
|---|---|---|---|
| il | Sportcars | `S-100 294` | `b1` = S- (écrit par le site) ; `nomer` champ : 100 294 → la vérification lit `S-100 294` |
| il | Military | `172539-צ` | `nomer` champ : 172539 ; `b1` = צ (écrit par le site) → la vérification lit `172539 צ` |
| it | Dealer | `00 P 1FLYG` | `mb1` champ : 00 ; `dealp` = P (écrit par le site) ; `mb2` champ : 1FLYG → la vérification lit `00 P 1FLYG` |
| kg | Diplomatic | `D 09 003` | `dip_system` menu : White ; `nomerpl` champ : D 09 003 → la vérification lit `D 09 003` |
| kz | Foreigners (2012) | `C 463 02` | `digit2` champ : C 463 ; `region2` menu : 02 → la vérification lit `C 463 02` |
| pt | National Republican Guard | `GNR T-399` | `gnr` = GNR (écrit par le site) ; `nomer` champ : T 399 → la vérification lit `GNR T 399` |
| ge | Test license plates (TEST) | `TEST-050` | `testprefix` = TEST- (écrit par le site) ; `nomer` champ : 050 → la vérification lit `TEST- 050` |
| de | Plates for oldtimers (type "H") | `HEI Z 924 H` | `region` menu : HEI ; `b1` champ : Z ; `digit` champ : 924 ; `b2` = H (écrit par le site) → la vérification lit `HEI Z 924 H` |
| ch | Vehicles w/o paid duty (with "Z") | `ZH 1257 Z` | `region` menu : ZH ; `digit` champ : 1257 ; `b1` = Z (écrit par le site) → la vérification lit `ZH 1257 Z` |
| gi | Regular car plates (G 1234 A) | `G 1267 G` | `let` = G (écrit par le site) ; `nomer` champ : 1267 G → la vérification lit `G 1267 G` |
| ax | Vanity Plates | `BOMAN2` | `b1` menu : B ; `b2` menu : O ; `b3` menu : M ; `b4` menu : A ; `b5` menu : N ; `b6` menu : 2 → la vérification lit `BOMAN2` |
| dk | Vanity Plates | `USANO1` | `b1` menu : U ; `b2` menu : S ; `b3` menu : A ; `b4` menu : N ; `b5` menu : O ; `b6` menu : 1 → la vérification lit `USANO1` |
| mc | Provisional | `1517 WW MC` | `nomerpl` champ : 1517 ; `drop_1` menu : WW → la vérification lit `1517 WW MC` |
| mn | Motorcycles | `БӨЗ 3510` | `format` menu : RRA 1234 ; `digit` champ : 3510 ; `region` menu : БӨ - Bayan-Ölgii Province ; `b1` menu : З → la vérification lit `БӨЗ 3510` |
| si | Trailers | `H4-86 KP` | `drop_1` menu : KP - Koper ; `nomer` champ : H4 86 → la vérification lit `H4 86 KP` |
| ru | Diplomatic | `032 D 345 77` | `code` champ : 032 ; `dipb1` menu : D ; `digit` champ : 345 ; `region` menu : 77 → la vérification lit `032 D 345 77` |
| cz | Electric vehicles | `EL5 57CP` | `el` = EL (écrit par le site) ; `digit3` champ : 557CP → la vérification lit `EL 557CP` |
| ma | Regular plates | `3385|د|40` | `digit` champ : 3385 ; `let` menu : د/D ; `region` champ : 40 → la vérification lit `3385 د 40` |
