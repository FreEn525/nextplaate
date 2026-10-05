# Couverture des règles de plaque

Généré par `node scripts/coverage.mjs` : ne pas modifier à la main. Après une correction : `python tests/offline/check_db.py && node scripts/coverage.mjs`.

**Vérifié** = au moins une plaque connue du site, et toutes relues correctement par le script dans la page sauvegardée. **À corriger** = une plaque connue est mal relue. **À trouver** = aucune plaque connue pour cette catégorie : la règle n'est pas prouvée.

## Résumé

| | Nombre | Part |
|---|---|---|
| Pays du site | 96 | |
| Pays capturés (pages sauvegardées) | 96 | 100 % |
| **Pays non capturés** | **0** | |
| Pays avec une règle propre | 43 sur 96 | |
| Catégories (pays capturés) | 829 | |
| Vérifiées | 768 | 93 % |
| **À corriger** | **39** | 5 % |
| **À trouver** (aucune plaque connue) | **0** | 0 % |
| Galerie vide sur le site (aucune plaque n'existe) | 22 | 3 % |
| Sans champ de plaque dans le formulaire ou sans page d'ajout | 0 | 0 % |

## À corriger

| Pays | Catégorie | OK | Plaque attendue | Lue |
|---|---|---|---|---|
| ax | Vanity Plates | 1/3 | `BOMAN2` | `BOM` |
| ax | Vanity Plates | 1/3 | `ÅLAND 2` | `ÅLA` |
| az | Foreign citizens and enterprises | 0/3 | `H 014401` | `99 H 014401` |
| az | Foreign citizens and enterprises | 0/3 | `H 027803` | `99 H 027803` |
| az | Foreign citizens and enterprises | 0/3 | `H 029505` | `99 H 029505` |
| ch | Vehicles w/o paid duty (with "Z") | 2/3 | `ZH 1257 Z` | `VS H 1257 Z` |
| cy | Trailers | 2/3 | `14001 CT` | `P 14001` |
| cz | Electric vehicles | 0/3 | `EL5 57CP` | `557CP` |
| cz | Electric vehicles | 0/3 | `EL6 41FT` | `641FT` |
| cz | Electric vehicles | 0/3 | `EL8 39AE` | `839AE` |
| cz | Trailers (1977) | 0/3 | `24 DOA-99` | `DO2 4` |
| cz | Trailers (1977) | 0/3 | `40-AH-85` | `AH4 0` |
| cz | Trailers (1977) | 0/3 | `44-AI-59` | `AI4 4` |
| de | Plates for oldtimers (type "H") | 1/3 | `HEI Z 924 H` | `EI Z 924 H` |
| de | Plates for oldtimers (type "H") | 1/3 | `HH CW 311 H` | `CW 311 H` |
| de | Seasonal plates (Oldtimers) | 2/3 | `H NG 382H (04/10)` | `N G 382H H (04/10)` |
| dk | Vanity Plates | 1/3 | `777` | `777AAAA` |
| dk | Vanity Plates | 1/3 | `USANO1` | `USANO1J` |
| gi | Regular car plates (G 1234 A) | 1/3 | `G 1267 G` | `G 1267` |
| gi | Regular car plates (G 1234 A) | 1/3 | `G 4684 G` | `G 4684` |
| il | Diplomatic | 0/3 | `33-232-21` | `0 33-232-21` |
| il | Diplomatic | 0/3 | `58-077-21` | `0 58-077-21` |
| il | Diplomatic | 0/3 | `94-081-22` | `0 94-081-22` |
| il | Military Police | 0/3 | `222-מ.צ` | `222-מ.צ מ.צ` |
| il | Military Police | 0/3 | `224-מ.צ` | `224-מ.צ מ.צ` |
| il | Military Police | 0/3 | `260-מ.צ` | `260-מ.צ מ.צ` |
| il | Sportcars | 0/3 | `S-100 294` | `S- S-100 294` |
| il | Sportcars | 0/3 | `S-102 440` | `S- S-102 440` |
| il | Sportcars | 0/3 | `S-108 069` | `S- S-108 069` |
| ir | Disabled | 0/3 | `۱۱ژ۴۷۳ ۴۳` | `۱۱♿۴۲۲ ۲۵` |
| ir | Disabled | 0/3 | `۱۷ژ۹۵۷ ۱۱` | `۱۷♿۴۲۲ ۲۵` |
| ir | Disabled | 0/3 | `۵۲ژ۵۱۶ ۱۱` | `۵۲♿۴۲۲ ۲۵` |
| it | Dealer | 0/3 | `00 P 1FLYG` | `00 P P` |
| it | Dealer | 0/3 | `BM P 10569` | `BM P P` |
| it | Dealer | 0/3 | `LN P GAVT0` | `LN P P` |
| kg | Diplomatic | 0/3 | `D 09 003` | `WHITE D 09 003` |
| kg | Diplomatic | 0/3 | `D 26 004` | `WHITE D 26` |
| kg | Diplomatic | 0/3 | `D 52 100` | `WHITE D 52` |
| kh | Authorities | 0/3 | `2-0459` | `20 2-0459` |
| kh | Authorities | 0/3 | `2-0504` | `20 2-0504` |
| kh | Authorities | 0/3 | `5-0024` | `50 5-0024` |
| kh | Vehicles w/o paid duty | 0/3 | `1-7172` | `10 1-7172` |
| kh | Vehicles w/o paid duty | 0/3 | `1-9945` | `10 1-9945` |
| kh | Vehicles w/o paid duty | 0/3 | `2-0831` | `20 2-0831` |
| kz | Foreigners (2012) | 0/3 | `C 463 02` | `463 02 C` |
| kz | Foreigners (2012) | 0/3 | `H 194 10` | `194 10 H` |
| kz | Foreigners (2012) | 0/3 | `H 476 05` | `476 05 H` |
| kz | Military (1993) | 0/3 | `2723 АЯ` | `2723` |
| kz | Military (1993) | 0/3 | `2883 АЗ` | `2883` |
| kz | Military (1993) | 0/3 | `8906 АВ` | `8906` |
| ma | Regular plates | 0/3 | `3385|د|40` | `3385|د|40 أ` |
| ma | Regular plates | 0/3 | `66555|د|1` | `66555|د|1 أ` |
| ma | Regular plates | 0/3 | `70144|د|8` | `70144|د|8 أ` |
| mc | Provisional | 0/3 | `1517 WW MC` | `1517 WW` |
| mc | Provisional | 0/3 | `1725 WW MC` | `1725 WW` |
| mc | Provisional | 0/3 | `2000 WW MC` | `2000 WW` |
| me | Police | 0/3 | `P PG273` | `P TZG273` |
| me | Police | 0/3 | `P PG288` | `P GSG288` |
| me | Police | 0/3 | `P PG607` | `P GSG607` |
| mn | Cars | 0/3 | `2294 БӨН` | `2294 - DIPLOMATIC MISSIONS Б` |
| mn | Cars | 0/3 | `4067 УЕН` | `4067 - DIPLOMATIC MISSIONS У` |
| mn | Cars | 0/3 | `9393 УБЦ` | `9393 - DIPLOMATIC MISSIONS У` |
| mn | Special machinery | 0/3 | `7073 УН` | `7073 УН - ULAN BATOR CITY` |
| mn | Special machinery | 0/3 | `7743 УР` | `7743 УР - ULAN BATOR CITY` |
| mn | Special machinery | 0/3 | `8188 УН` | `8188 УН - ULAN BATOR CITY` |
| mn | Motorcycles | 0/3 | `БӨЗ 3510` | `БӨЗ - DIPLOMATIC MISSIONS` |
| mn | Motorcycles | 0/3 | `БӨЗ 5517` | `БӨЗ - DIPLOMATIC MISSIONS` |
| mn | Motorcycles | 0/3 | `УК 2368` | `2368 УК - ULAN BATOR CITY` |
| ps | Dealer | 0/3 | `62-100-76` | `6 2 100` |
| ps | Dealer | 0/3 | `64-074-76` | `6 4 074` |
| ps | Dealer | 0/3 | `65-067-76` | `6 5 067` |
| ru | Diplomatic (Ambassador, chief of diplomatic mission) | 0/3 | `011 CD 1 77` | `1 77` |
| ru | Diplomatic (Ambassador, chief of diplomatic mission) | 0/3 | `086 CD 1 77` | `1 77` |
| ru | Diplomatic (Ambassador, chief of diplomatic mission) | 0/3 | `127 CD 1 77` | `1 77` |
| ru | Diplomatic | 0/3 | `032 D 345 77` | `345 77` |
| ru | Diplomatic | 0/3 | `145 D 256 77` | `256 77` |
| ru | Diplomatic | 0/3 | `900 D 006 86` | `006 86` |
| ru | Diplomatic motorcycles | 0/3 | `D 017 02 77` | `02 77` |
| ru | Diplomatic motorcycles | 0/3 | `T 559 01 50` | `01 50` |
| ru | Diplomatic motorcycles | 0/3 | `T 559 06 50` | `06 50` |
| sc | Ambassador, chief of diplomatic mission | 0/3 | `S 16958` | `S 16958 CD` |
| sc | Ambassador, chief of diplomatic mission | 0/3 | `S 19428` | `S 19428 CD` |
| sc | Ambassador, chief of diplomatic mission | 0/3 | `S 42635` | `S 42635 CD` |
| sc | Government | 0/3 | `S 13069` | `GS S 13069` |
| sc | Government | 0/3 | `S 18512` | `GS S 18512` |
| sc | Government | 0/3 | `S 32867` | `GS S 32867` |
| si | Trailers | 0/3 | `H4-86 KP` | `KP H4 86` |
| si | Trailers | 0/3 | `L4-14 CE` | `CE L4 14` |
| si | Trailers | 0/3 | `VD-24 LJ` | `LJ VD 24` |
| sk | Sportcars (AB S(A)123) | 0/3 | `AA S 009` | `SA AA 009` |
| sk | Sportcars (AB S(A)123) | 0/3 | `AA S 010` | `SA AA 010` |
| sk | Sportcars (AB S(A)123) | 0/3 | `AA S 359` | `SA AA 359` |
| th | Private owners | 2/3 | `4ฒฆ 5147` | `4ฆฒ 5147` |
| th | Vanity Plates | 1/3 | `บพ 9595` | `พส 9595` |
| th | Vanity Plates | 1/3 | `บว 9988` | `วส 9988` |
| ua | Government agencies | 2/3 | `IM 113 G` | `HA IM G` |
| ua | Cars and trucks (1995) | 0/3 | `14 296-45 TA` | `14 AA` |
| ua | Cars and trucks (1995) | 0/3 | `16 095-93 OT` | `16 AA` |
| ua | Cars and trucks (1995) | 0/3 | `18 566-48 PB` | `18 AA` |
| ua | Public transport (1995) | 0/3 | `04 000-06 AA` | `04 JB` |
| ua | Public transport (1995) | 0/3 | `04 017-32 AA` | `04 JB` |
| ua | Public transport (1995) | 0/3 | `04 036-33 AA` | `04 JB` |

## Par pays

`own` : règle dans `src/lib/plate/<cc>.js`. `generic` : lecture des champs visibles.

| Pays | Règle | Catégories | Vérifiées | À corriger | À trouver | Galerie vide | Non testables | Page d'ajout |
|---|---|---|---|---|---|---|---|---|
| il Israel | generic | 8 | 5 | 3 |  |  |  | oui |
| mn Mongolia | generic | 4 | 1 | 3 |  |  |  | oui |
| ru Russia | own | 23 | 20 | 3 |  |  |  | oui |
| ua Ukraine | own | 19 | 16 | 3 |  |  |  | oui |
| cz Czech Republic | own | 22 | 19 | 2 |  | 1 |  | oui |
| de Germany | own | 16 | 14 | 2 |  |  |  | oui |
| kh Cambodia | generic | 7 | 4 | 2 |  | 1 |  | oui |
| kz Kazakhstan | generic | 18 | 16 | 2 |  |  |  | oui |
| sc Seychelles | generic | 9 | 6 | 2 |  | 1 |  | oui |
| th Thailand | own | 9 | 7 | 2 |  |  |  | oui |
| ax Åland (FI) | own | 5 | 4 | 1 |  |  |  | oui |
| az Azerbaijan | generic | 5 | 4 | 1 |  |  |  | oui |
| ch Switzerland | generic | 11 | 10 | 1 |  |  |  | oui |
| cy Cyprus | generic | 5 | 4 | 1 |  |  |  | oui |
| dk Denmark | own | 8 | 7 | 1 |  |  |  | oui |
| gi Gibraltar (UK) | generic | 4 | 3 | 1 |  |  |  | oui |
| ir Iran | own | 16 | 15 | 1 |  |  |  | oui |
| it Italy | own | 14 | 13 | 1 |  |  |  | oui |
| kg Kyrgyzstan | own | 12 | 11 | 1 |  |  |  | oui |
| ma Morocco | generic | 2 | 1 | 1 |  |  |  | oui |
| mc Monaco | generic | 4 | 3 | 1 |  |  |  | oui |
| me Montenegro | own | 6 | 5 | 1 |  |  |  | oui |
| ps Palestinian Authority | own | 6 | 5 | 1 |  |  |  | oui |
| si Slovenia | own | 4 | 3 | 1 |  |  |  | oui |
| sk Slovakia | own | 21 | 18 | 1 |  | 2 |  | oui |
| ad Andorra | generic | 5 | 5 |  |  |  |  | oui |
| ae UAE | generic | 0 | 0 |  |  |  |  | oui |
| al Albania | own | 4 | 4 |  |  |  |  | oui |
| am Armenia | own | 8 | 8 |  |  |  |  | oui |
| ar Argentina | generic | 6 | 6 |  |  |  |  | oui |
| at Austria | generic | 9 | 9 |  |  |  |  | oui |
| au Australia | generic | 0 | 0 |  |  |  |  | oui |
| ba Bosnia and Herzegovina | own | 5 | 5 |  |  |  |  | oui |
| be Belgium | generic | 5 | 5 |  |  |  |  | oui |
| bg Bulgaria | generic | 7 | 7 |  |  |  |  | oui |
| bh Bahrain | generic | 7 | 7 |  |  |  |  | oui |
| br Brazil | generic | 13 | 13 |  |  |  |  | oui |
| bs Bahamas | generic | 7 | 7 |  |  |  |  | oui |
| by Belarus | own | 18 | 18 |  |  |  |  | oui |
| ca Canada | generic | 0 | 0 |  |  |  |  | oui |
| cl Chile | generic | 15 | 12 |  |  | 3 |  | oui |
| cn China | generic | 6 | 6 |  |  |  |  | oui |
| dz Algeria | own | 7 | 4 |  |  | 3 |  | oui |
| ee Estonia | own | 10 | 10 |  |  |  |  | oui |
| eg Egypt | own | 4 | 4 |  |  |  |  | oui |
| es Spain | own | 6 | 6 |  |  |  |  | oui |
| fi Finland | generic | 9 | 9 |  |  |  |  | oui |
| fr France | own | 17 | 17 |  |  |  |  | oui |
| ge Georgia | generic | 12 | 12 |  |  |  |  | oui |
| gg Guernsey (UK) | own | 3 | 3 |  |  |  |  | oui |
| gr Greece | own | 16 | 16 |  |  |  |  | oui |
| gu Guam (USA) | generic | 9 | 5 |  |  | 4 |  | oui |
| hk Hong Kong (CN) | generic | 2 | 2 |  |  |  |  | oui |
| hr Croatia | own | 11 | 11 |  |  |  |  | oui |
| hu Hungary | generic | 23 | 23 |  |  |  |  | oui |
| id Indonesia | generic | 7 | 7 |  |  |  |  | oui |
| ie Ireland | generic | 3 | 3 |  |  |  |  | oui |
| iq Iraq | own | 4 | 4 |  |  |  |  | oui |
| is Iceland | own | 10 | 10 |  |  |  |  | oui |
| je Jersey (UK) | generic | 2 | 2 |  |  |  |  | oui |
| jp Japan | own | 4 | 4 |  |  |  |  | oui |
| ke Kenya | generic | 12 | 12 |  |  |  |  | oui |
| kr South Korea | own | 3 | 3 |  |  |  |  | oui |
| kw Kuwait | generic | 4 | 4 |  |  |  |  | oui |
| la Laos | own | 9 | 9 |  |  |  |  | oui |
| li Liechtenstein | own | 9 | 9 |  |  |  |  | oui |
| lt Lithuania | generic | 9 | 9 |  |  |  |  | oui |
| lu Luxembourg | generic | 5 | 5 |  |  |  |  | oui |
| lv Latvia | own | 9 | 9 |  |  |  |  | oui |
| md Moldova | own | 8 | 8 |  |  |  |  | oui |
| mk North Macedonia | generic | 8 | 7 |  |  | 1 |  | oui |
| mp Northern Mariana Islands (USA) | generic | 6 | 2 |  |  | 4 |  | oui |
| mt Malta | generic | 6 | 6 |  |  |  |  | oui |
| mx Mexico | generic | 20 | 20 |  |  |  |  | oui |
| my Malaysia | generic | 4 | 4 |  |  |  |  | oui |
| nl Netherlands | generic | 27 | 26 |  |  | 1 |  | oui |
| no Norway | generic | 12 | 12 |  |  |  |  | oui |
| nz New Zealand | generic | 5 | 5 |  |  |  |  | oui |
| pl Poland | own | 12 | 12 |  |  |  |  | oui |
| pt Portugal | own | 4 | 4 |  |  |  |  | oui |
| qa Qatar | generic | 6 | 6 |  |  |  |  | oui |
| ro Romania | generic | 5 | 5 |  |  |  |  | oui |
| rs Serbia | own | 10 | 10 |  |  |  |  | oui |
| sa Saudi Arabia | own | 6 | 6 |  |  |  |  | oui |
| se Sweden | generic | 8 | 8 |  |  |  |  | oui |
| sg Singapore | own | 13 | 13 |  |  |  |  | oui |
| sm San Marino | generic | 13 | 13 |  |  |  |  | oui |
| su USSR | generic | 15 | 15 |  |  |  |  | oui |
| tj Tajikistan | own | 10 | 10 |  |  |  |  | oui |
| tr Turkey | own | 6 | 6 |  |  |  |  | oui |
| uk United Kingdom | generic | 10 | 10 |  |  |  |  | oui |
| us USA | generic | 0 | 0 |  |  |  |  | oui |
| uz Uzbekistan | own | 9 | 9 |  |  |  |  | oui |
| va Vatican | generic | 6 | 5 |  |  | 1 |  | oui |
| vn Vietnam | own | 8 | 8 |  |  |  |  | oui |
| xx Non-recognized and partially recognized states | generic | 0 | 0 |  |  |  |  | oui |

## Catégories à trouver (par pays)

Pour chacune : trouver une plaque réelle sur le site, la saisir, puis relancer le contrôle. Le remplissage du build dev (`Fill missing plates`) le fait.

## Galerie vide sur le site

Aucune photo dans la galerie de ces catégories : il n'y a pas de plaque à utiliser. À revérifier de temps en temps.

- **cl** : Shared taxis (AB-12-34), Special airport taxis and tourist vehicles (AB-12-34), Buses (AB-12-34)
- **cz** : Diplomatic (2001)
- **dz** : Police ((1)11111), Protection Civile ((111)111111), Military (111111111)
- **gu** : Commercial vehicles (2008), Amateur Radio, Motorcycles (M1234), Mopeds (MP1234)
- **kh** : Regular plates
- **mk** : Vanity Plates
- **mp** : Heavy Equipment, Vanity Plates, Amateur Radio, Motorcycles
- **nl** : Dealer (Scooters)
- **sc** : Dealer
- **sk** : Sportcars (S(A) 123AB), Agricultural vehicles (F(A) 123AB)
- **va** : Dealer (PROVA SCV)

## Sans champ de plaque dans le formulaire

Catégories dont le formulaire n'affiche aucun champ où taper la plaque. Il y en a eu cinq (Bosnie, Croatie, Italie 2, Portugal), qui avaient en fait des champs que l'outil ne connaissait pas (pol1, num1, mb1, mnum1...) : ils sont maintenant lus.


## Vérifiées à la main sur le vrai site

22 plaques tapées dans le formulaire du site, que la vérification a trouvées : MZ MZ 78 [de] · 1-CVX-965 [be] · 2649 HSM [es] · 94-PV-55 [nl] · KX-484-N [nl] · RO62OUK [uk] · CJ 54 HAI [ro] · 40 H 944 MB [uz] · KR PV-081 (Oldtimers) [hr] · 50 SB 095 [tr] · 7717XZ 07 [tj] · A 001 AA 77 [ru] · BMR 001 [md] · GU 213 JX [at] · CNA 32756 [pl] · K0 069U (Sportcars) [pl] · IAZ 6038 (Trucks) [gr] · KZT 7722 (Cars) [gr] · ITI-9245 (Cars) [gr] · 70144 د 8 [ma] · 47A 271.12 (Cars) [vn] · OO-442 VR (Trailers) [rs].

La vérification de plaque cherche le **texte de la plaque** sur le site, sans la catégorie : pour un formulaire sans menu de type (Pays-Bas, Mexique, Singapour...) elle fonctionne donc, même si la catégorie ne peut pas être prouvée hors ligne.

## Pays non capturés

Aucune page sauvegardée : ni catégories, ni règle. Capturer avec le build dev (tiroir *Dev*, `Capture`).


