# Couverture des règles de plaque

Généré par `node scripts/coverage.mjs` : ne pas modifier à la main. Après une correction : `python tests/offline/check_db.py && node scripts/coverage.mjs`.

**Vérifié** = au moins une plaque connue du site, et toutes relues correctement par le script dans la page sauvegardée. **À corriger** = une plaque connue est mal relue. **À trouver** = aucune plaque connue pour cette catégorie : la règle n'est pas prouvée.

## Résumé

| | Nombre | Part |
|---|---|---|
| Pays du site | 96 | |
| Pays capturés (pages sauvegardées) | 96 | 100 % |
| **Pays non capturés** | **0** | |
| Pays avec une règle propre | 27 sur 96 | |
| Catégories (pays capturés) | 829 | |
| Vérifiées | 581 | 70 % |
| **À corriger** | **135** | 16 % |
| **À trouver** (aucune plaque connue) | **0** | 0 % |
| Galerie vide sur le site (aucune plaque n'existe) | 21 | 3 % |
| Non testables par le formulaire (pas de menu de type, catégorie absente du menu, ou aucun champ de plaque) | 92 | 11 % |

## À corriger

| Pays | Catégorie | OK | Plaque attendue | Lue |
|---|---|---|---|---|
| am | High officials | 0/3 | `ARM 025` | `ARM` |
| am | High officials | 0/3 | `ARM 035` | `ARM` |
| am | High officials | 0/3 | `ARM 160` | `ARM` |
| ax | Cars (ÅL 12345) | 0/3 | `ÅL 10500` | `10500` |
| ax | Cars (ÅL 12345) | 0/3 | `ÅL 12968` | `12968` |
| ax | Cars (ÅL 12345) | 0/3 | `ÅL 16319` | `16319` |
| ax | Cars (ÅLA 1234) | 0/3 | `ÅLA 4642` | `L A` |
| ax | Cars (ÅLA 1234) | 0/3 | `ÅLA 5168` | `L A` |
| ax | Cars (ÅLA 1234) | 0/3 | `ÅLA 7020` | `L A` |
| ax | Trailers (ÅS 1234) | 0/3 | `ÅS 10959` | `10959` |
| ax | Trailers (ÅS 1234) | 0/3 | `ÅS 2704` | `2704` |
| ax | Trailers (ÅS 1234) | 0/3 | `ÅS 8594` | `8594` |
| ax | Provisional (ÅF 1234) | 0/3 | `ÅF 6841` | `6841` |
| ax | Provisional (ÅF 1234) | 0/3 | `ÅF 6962` | `6962` |
| ax | Provisional (ÅF 1234) | 0/3 | `ÅF 6993` | `6993` |
| ch | Vehicles w/o paid duty (with "Z") | 0/3 | `GE 1892 Z` | `GE 1892` |
| ch | Vehicles w/o paid duty (with "Z") | 0/3 | `VS 549 Z` | `VS 549` |
| ch | Vehicles w/o paid duty (with "Z") | 0/3 | `ZH 1257 Z` | `VS H 1257` |
| ch | Dealer (with "U") | 0/3 | `VD 1171 U` | `VD 1171` |
| ch | Dealer (with "U") | 0/3 | `VD 479 U` | `VD 479` |
| ch | Dealer (with "U") | 0/3 | `VD 941 U` | `VD 941` |
| cy | Trailers | 0/3 | `14001 CT` | `14001` |
| cy | Trailers | 0/3 | `P 04878` | `04878` |
| cy | Trailers | 0/3 | `P 08038` | `08038` |
| cz | Electric vehicles | 0/3 | `EL5 57CP` | `EL` |
| cz | Electric vehicles | 0/3 | `EL6 41FT` | `EL` |
| cz | Electric vehicles | 0/3 | `EL8 39AE` | `EL` |
| cz | Trailers (1977) | 0/3 | `24 DOA-99` | `DO2 4` |
| cz | Trailers (1977) | 0/3 | `40-AH-85` | `AH4 0` |
| cz | Trailers (1977) | 0/3 | `44-AI-59` | `AI4 4` |
| de | Plates for oldtimers (type "H") | 1/3 | `HEI Z 924 H` | `EI Z 924 H` |
| de | Plates for oldtimers (type "H") | 1/3 | `HH CW 311 H` | `CW 311 H` |
| de | Seasonal plates | 0/3 | `AC W 2005 (04/10)` | `AC W 2005` |
| de | Seasonal plates | 0/3 | `EI KK 88 (04/10)` | `EI KK 88` |
| de | Seasonal plates | 0/3 | `ILL Z 300 (03/10)` | `ILL Z 300` |
| de | Seasonal plates (Oldtimers) | 0/3 | `GS KV 72H (05/10)` | `GS KV 72 H` |
| de | Seasonal plates (Oldtimers) | 0/3 | `H NG 382H (04/10)` | `N G 382 H` |
| de | Seasonal plates (Oldtimers) | 0/3 | `NU SW 57H (04/10)` | `NU SW 57 H` |
| de | Regional authorities | 0/3 | `BBL 4 7675` | `4 7675` |
| de | Regional authorities | 0/3 | `NRW 3-58E` | `3 58E` |
| de | Regional authorities | 0/3 | `RPL 4 8731` | `4 8731` |
| dk | Vanity Plates | 1/3 | `777` | `777AAAA` |
| dk | Vanity Plates | 1/3 | `USANO1` | `USANO1J` |
| eg | Cars (2008) | 0/3 | `٣٦٢١ جىر` | `أ` |
| eg | Cars (2008) | 0/3 | `٤٢٥ جھس` | `أ` |
| eg | Cars (2008) | 0/3 | `٦٣٢٨ قفج` | `أ` |
| eg | Motorcycles | 0/3 | `٣٩١٦ دنب` | `أ` |
| eg | Motorcycles | 0/3 | `٦٣٢٣ سقط` | `أ` |
| eg | Motorcycles | 0/3 | `٦٧١٣ طدن` | `أ` |
| eg | Police | 0/3 | `٢٥٤٦ ١عب` | `` |
| eg | Police | 0/3 | `٨١١٢ ١٢ب` | `` |
| eg | Police | 0/3 | `٨١١٧ ١٢ب` | `` |
| eg | Cars (1999) | 0/3 | `١٠٧١٤` | `ALX` |
| eg | Cars (1999) | 0/3 | `١١١٠٤` | `ALX` |
| eg | Cars (1999) | 0/3 | `١٣١٣` | `ALX` |
| gg | Alderney | 0/3 | `AY 1573` | `1573` |
| gg | Alderney | 0/3 | `AY 2057` | `2057` |
| gg | Alderney | 0/3 | `AY 2185` | `2185` |
| hr | Dealer | 0/3 | `OS PP-178` | `OS PP-AA` |
| hr | Dealer | 0/3 | `OS PP-274` | `OS PP-AA` |
| hr | Dealer | 0/3 | `ZG PP-1442` | `ZG PP-AA` |
| hr | Oldtimers | 0/3 | `KR PV-081` | `KR PV-C` |
| hr | Oldtimers | 0/3 | `ZG PV-0470` | `ZG PV-C` |
| hr | Oldtimers | 0/3 | `ZG PV-4004` | `ZG PV-C` |
| hr | Military | 0/3 | `HV 236-MP` | `ZG 236-HV` |
| hr | Military | 0/3 | `HV 271-LV` | `ZG 271-HV` |
| hr | Military | 0/3 | `HV 420-LZ` | `ZG 420-HV` |
| hr | Export transit plates | 0/3 | `RH 199-BE` | `ZG 199-RH` |
| hr | Export transit plates | 0/3 | `RH 290-AP` | `ZG 290-RH` |
| hr | Export transit plates | 0/3 | `RH 718-BA` | `ZG 718-RH` |
| hr | Diplomatic | 0/3 | `025-A-020` | `ZG 020-AA` |
| hr | Diplomatic | 0/3 | `053-A-024` | `ZG 024-AA` |
| hr | Diplomatic | 0/3 | `097-A-001` | `ZG 001-AA` |
| ie | Oldtimers | 0/3 | `ZV 12656` | `12656` |
| ie | Oldtimers | 0/3 | `ZV 37603` | `37603` |
| ie | Oldtimers | 0/3 | `ZV 89253` | `89253` |
| il | Diplomatic | 0/3 | `33-232-21` | `0 33-232-21` |
| il | Diplomatic | 0/3 | `58-077-21` | `0 58-077-21` |
| il | Diplomatic | 0/3 | `94-081-22` | `0 94-081-22` |
| iq | 2022 year system | 0/3 | `21 O 17000` | `21 O` |
| iq | 2022 year system | 0/3 | `22 H 6661` | `22 H` |
| iq | 2022 year system | 0/3 | `22 H 96641` | `22 H` |
| iq | 2008 year system | 0/3 | `E 74525` | `AN E` |
| iq | 2008 year system | 0/3 | `F 12528` | `AN F` |
| iq | 2008 year system | 0/3 | `F 49260` | `AN F` |
| iq | 2001 year system | 0/3 | `١٠٦٩٧` | `AN` |
| iq | 2001 year system | 0/3 | `٢٤٠٤٠٩` | `AN` |
| iq | 2001 year system | 0/3 | `٢٨٧٤١٩` | `AN` |
| iq | 1988 year system | 0/3 | `١٠٣٧٠٤` | `AN` |
| iq | 1988 year system | 0/3 | `٣٧٥٧٥` | `AN` |
| iq | 1988 year system | 0/3 | `٦٢٢٠٣٠` | `AN` |
| ir | Private owners | 0/3 | `۱۵ص۱۷۵ ۴۸` | `C ۱۵` |
| ir | Private owners | 0/3 | `۲۹س۸۴۶ ۴۸` | `S ۲۹` |
| ir | Private owners | 0/3 | `۸۱د۱۲۷ ۴۸` | `D ۸۱` |
| ir | Disabled | 0/3 | `۱۱ژ۴۷۳ ۴۳` | `۱۱` |
| ir | Disabled | 0/3 | `۱۷ژ۹۵۷ ۱۱` | `۱۷` |
| ir | Disabled | 0/3 | `۵۲ژ۵۱۶ ۱۱` | `۵۲` |
| ir | Taxi | 0/3 | `۵۱ت۱۶۵ ۲۲` | `۵۱` |
| ir | Taxi | 0/3 | `۶۷ت۲۹۲ ۲۲` | `۶۷` |
| ir | Taxi | 0/3 | `۸۲ت۱۳۴ ۲۲` | `۸۲` |
| ir | Commercial vehicles | 0/3 | `۵۳ع۴۴۴ ۴۳` | `۵۳` |
| ir | Commercial vehicles | 0/3 | `۶۱ع۵۹۳ ۴۸` | `۶۱` |
| ir | Commercial vehicles | 0/3 | `۷۱ع۴۲۲ ۲۵` | `۷۱` |
| ir | Agricultural vehicles | 0/1 | `۱۱ک۴۷۹ ۸۴` | `۱۱` |
| ir | Police | 0/3 | `۱۶پ۴۲۹ ۲۲` | `۱۶` |
| ir | Police | 0/3 | `۵۵پ۴۶۴ ۱۱` | `۵۵` |
| ir | Police | 0/3 | `۸۱پ۲۲۹ ۱۱` | `۸۱` |
| ir | Islamic Revolutionary Guard Corps | 0/3 | `۳۶ث۲۳۲ ۱۱` | `۳۶` |
| ir | Islamic Revolutionary Guard Corps | 0/3 | `۵۱ث۲۳۳ ۱۱` | `۵۱` |
| ir | Islamic Revolutionary Guard Corps | 0/3 | `۵۴ث۱۶۴ ۱۱` | `۵۴` |
| ir | Military | 0/3 | `۱۶ش۴۱۱ ۱۱` | `۱۶` |
| ir | Military | 0/3 | `۱۶ش۹۲۸ ۱۱` | `۱۶` |
| ir | Military | 0/3 | `۳۲ش۶۷۱ ۱۱` | `۳۲` |
| ir | Ministry of Defense | 0/2 | `۱۷ز۸۹۸ ۱۱` | `۱۷` |
| ir | Ministry of Defense | 0/2 | `۱۸ز۹۱۴ ۱۱` | `۱۸` |
| ir | General Staff | 0/1 | `۱۱ف۱۳۴ ۱۱` | `۱۱` |
| ir | Authorities | 0/3 | `۱۶الف۵۴۴ ۴۶` | `۱۶` |
| ir | Authorities | 0/3 | `۱۸الف۵۲۴ ۱۱` | `۱۸` |
| ir | Authorities | 0/3 | `۲۵الف۲۶۳ ۱۱` | `۲۵` |
| is | Vanity Plates | 2/3 | `T BÍRD` | `TBÍRDN` |
| it | Road machinery | 0/3 | `AKF 511` | `PE AKF 511` |
| it | Road machinery | 0/3 | `ANL 084` | `PE ANL 084` |
| it | Road machinery | 0/3 | `ANY 257` | `PE ANY 257` |
| jp | Private owners | 0/3 | `多摩 300 Y 8223` | `` |
| jp | Private owners | 0/3 | `山梨 301 せ 6028` | `` |
| jp | Private owners | 0/3 | `山梨 336 な 718` | `` |
| jp | Commercial vehicles | 0/3 | `世田谷 310 あ 7410` | `` |
| jp | Commercial vehicles | 0/3 | `大宮 830 い 1122` | `` |
| jp | Commercial vehicles | 0/3 | `奈良 100 あ 9832` | `` |
| jp | Private owners (Kei car) | 0/3 | `なにわ 480 と 1145` | `` |
| jp | Private owners (Kei car) | 0/3 | `横浜 581 ち 882` | `` |
| jp | Private owners (Kei car) | 0/3 | `横浜 583 と 1714` | `` |
| jp | Commercial vehicles (Kei car) | 0/3 | `袖ヶ浦 480 り 7690` | `` |
| jp | Commercial vehicles (Kei car) | 0/3 | `豊橋 480 り 3995` | `` |
| jp | Commercial vehicles (Kei car) | 0/3 | `金沢 580 り 33` | `` |
| kg | Private owners (2016) | 0/3 | `02 002 NDR` | `02 002 NDR 01` |
| kg | Private owners (2016) | 0/3 | `02 940 AHD` | `02 940 AHD 01` |
| kg | Private owners (2016) | 0/3 | `08 222 AIA` | `08 222 AIA 01` |
| kg | Organizations (2016) | 0/3 | `01 058 ES` | `01 058 ES 01` |
| kg | Organizations (2016) | 0/3 | `01 237 DA` | `01 237 DA 01` |
| kg | Organizations (2016) | 0/3 | `01 604 BP` | `01 604 BP 01` |
| kg | Trailers, motorcycles, special vehicles (2016) | 0/3 | `03 814 PB` | `03 814 PB 01` |
| kg | Trailers, motorcycles, special vehicles (2016) | 0/3 | `08 888 PQ` | `08 888 PQ 01` |
| kg | Trailers, motorcycles, special vehicles (2016) | 0/3 | `09 042 PG` | `09 042 PG 01` |
| kg | Foreign citizens and enterprises (2016) | 0/3 | `01 1366 H` | `01 1366 H 01` |
| kg | Foreign citizens and enterprises (2016) | 0/3 | `01 9236 M` | `01 9236 M 01` |
| kg | Foreign citizens and enterprises (2016) | 0/3 | `01 9451 M` | `01 9451 M 01` |
| kg | Transit plates (2023) | 0/3 | `01 A932K` | `01 A932K 01` |
| kg | Transit plates (2023) | 0/3 | `08 A159G` | `08 A159G 01` |
| kg | Transit plates (2023) | 0/3 | `08 A295H` | `08 A295H 01` |
| kg | Vanity Plates | 0/3 | `01 DAAVAT` | `01 DAAVAT 01` |
| kg | Vanity Plates | 0/3 | `01 KAO` | `01 KAO 01` |
| kg | Vanity Plates | 0/3 | `01 KG OI` | `01 KG OI 01` |
| kg | Diplomatic | 0/3 | `D 09 003` | `WHITE D 09 003` |
| kg | Diplomatic | 0/3 | `D 26 004` | `WHITE D 26` |
| kg | Diplomatic | 0/3 | `D 52 100` | `WHITE D 52` |
| kh | Authorities | 0/3 | `2-0459` | `20 2-0459` |
| kh | Authorities | 0/3 | `2-0504` | `20 2-0504` |
| kh | Authorities | 0/3 | `5-0024` | `50 5-0024` |
| kh | Vehicles w/o paid duty | 0/3 | `1-7172` | `10 1-7172` |
| kh | Vehicles w/o paid duty | 0/3 | `1-9945` | `10 1-9945` |
| kh | Vehicles w/o paid duty | 0/3 | `2-0831` | `20 2-0831` |
| kr | Cars (2007) | 0/3 | `29무 3759` | `29무 가 3759` |
| kr | Cars (2007) | 0/3 | `45보 6266` | `45보 가 6266` |
| kr | Cars (2007) | 0/3 | `98너 6838` | `98너 가 6838` |
| kr | Commercial vehicles | 0/3 | `경기50바 4521` | `강원 (GANGWON PROVINCE) 경기50바 바 4521` |
| kr | Commercial vehicles | 0/3 | `경기72아 3023` | `강원 (GANGWON PROVINCE) 경기72아 바 3023` |
| kr | Commercial vehicles | 0/3 | `경기99사 9822` | `강원 (GANGWON PROVINCE) 경기99사 바 9822` |
| kr | Electric vehicles | 0/3 | `63부 5555` | `63부 가 5555` |
| kr | Electric vehicles | 0/3 | `64마 6213` | `64마 가 6213` |
| kr | Electric vehicles | 0/3 | `82고 3163` | `82고 가 3163` |
| kz | Foreigners (2012) | 0/3 | `C 463 02` | `463 02 C` |
| kz | Foreigners (2012) | 0/3 | `H 194 10` | `194 10 H` |
| kz | Foreigners (2012) | 0/3 | `H 476 05` | `476 05 H` |
| kz | Police (1993) | 0/3 | `A 117 KP` | `A 117` |
| kz | Police (1993) | 0/3 | `F 345 KP` | `F 345` |
| kz | Police (1993) | 0/3 | `M 669 KP` | `M 669` |
| kz | Military (1993) | 0/3 | `2723 АЯ` | `2723` |
| kz | Military (1993) | 0/3 | `2883 АЗ` | `2883` |
| kz | Military (1993) | 0/3 | `8906 АВ` | `8906` |
| la | Diplomatic | 0/3 | `ຂຕ-1192` | `2 1192` |
| la | Diplomatic | 0/3 | `ຂຕ-1777` | `2 1777` |
| la | Diplomatic | 0/3 | `ສທ23-78` | `1 2378` |
| la | Military | 0/3 | `ກທ 5868` | `5868` |
| la | Military | 0/3 | `ກທ/1 0040` | `` |
| la | Military | 0/3 | `ກທ/116 0043` | `` |
| la | Police | 0/3 | `ປກສ 1099` | `1099` |
| la | Police | 0/3 | `ປກສ 1132` | `1132` |
| la | Police | 0/3 | `ປກສ/06 0143` | `` |
| la | Temporary | 0/3 | `ຂຄ3-541` | `3541` |
| la | Temporary | 0/3 | `ຂຄ3-659` | `3659` |
| la | Temporary | 0/3 | `ຂຄ3-730` | `3730` |
| li | Dealer (with "U") | 0/3 | `FL 116-U` | `FL 116` |
| li | Dealer (with "U") | 0/3 | `FL 125-U` | `FL 125` |
| li | Dealer (with "U") | 0/3 | `FL 213-U` | `FL 213` |
| lv | Trailers | 0/3 | `B-362Y` | `BQ 362Y` |
| lv | Trailers | 0/3 | `B-389E` | `BQ 389E` |
| lv | Trailers | 0/3 | `B-906J` | `BQ 906J` |
| lv | Dealer | 0/3 | `B 1122-6` | `BA 1122` |
| lv | Dealer | 0/3 | `B 340-7` | `BA 340` |
| lv | Dealer | 0/3 | `B 452-7` | `BA 452` |
| ma | Regular plates | 0/3 | `3385|د|40` | `3385|د|40 أ` |
| ma | Regular plates | 0/3 | `66555|د|1` | `66555|د|1 أ` |
| ma | Regular plates | 0/3 | `70144|د|8` | `70144|د|8 أ` |
| mc | Provisional | 0/3 | `1517 WW MC` | `1517 WW` |
| mc | Provisional | 0/3 | `1725 WW MC` | `1725 WW` |
| mc | Provisional | 0/3 | `2000 WW MC` | `2000 WW` |
| me | Police | 0/3 | `P PG273` | `Single-row plate PGPG273` |
| me | Police | 0/3 | `P PG288` | `Single-row plate PGPG288` |
| me | Police | 0/3 | `P PG607` | `Single-row plate PGPG607` |
| mn | Cars | 0/3 | `2294 БӨН` | `2294 - DIPLOMATIC MISSIONS Б` |
| mn | Cars | 0/3 | `4067 УЕН` | `4067 - DIPLOMATIC MISSIONS У` |
| mn | Cars | 0/3 | `9393 УБЦ` | `9393 - DIPLOMATIC MISSIONS У` |
| mn | Special machinery | 0/3 | `7073 УН` | `7073 УН - ULAN BATOR CITY` |
| mn | Special machinery | 0/3 | `7743 УР` | `7743 УР - ULAN BATOR CITY` |
| mn | Special machinery | 0/3 | `8188 УН` | `8188 УН - ULAN BATOR CITY` |
| mn | Motorcycles | 0/3 | `БӨЗ 3510` | `БӨЗ - DIPLOMATIC MISSIONS` |
| mn | Motorcycles | 0/3 | `БӨЗ 5517` | `БӨЗ - DIPLOMATIC MISSIONS` |
| mn | Motorcycles | 0/3 | `УК 2368` | `2368 УК - ULAN BATOR CITY` |
| pl | Provisional and testing | 0/3 | `B2 5891` | `B 5891` |
| pl | Provisional and testing | 0/3 | `C3 4089` | `C 4089` |
| pl | Provisional and testing | 0/3 | `S0 3853` | `S 3853` |
| pl | Vanity Plates | 0/3 | `G0 ARTY` | `G ARTY` |
| pl | Vanity Plates | 0/3 | `P3 KOTEK` | `P KOTEK` |
| pl | Vanity Plates | 0/3 | `P5 ATS` | `P ATS` |
| pl | 1976 year system | 0/3 | `ROK 8992` | `RO 8992` |
| pl | 1976 year system | 0/3 | `WGW 823N` | `WG 823N` |
| pl | 1976 year system | 0/3 | `WIC 8729` | `WI 8729` |
| pl | Diplomatic | 0/3 | `W 016600` | `001` |
| pl | Diplomatic | 0/3 | `W 028011` | `001` |
| pl | Diplomatic | 0/3 | `W 110500` | `001` |
| pl | Sportcars | 0/3 | `K0 069U` | `K 069U` |
| pl | Sportcars | 0/3 | `K0 414U` | `K 414U` |
| pl | Sportcars | 0/3 | `W8 751Y` | `W 751Y` |
| ps | Private owners (1994) | 0/3 | `4-7752-94` | `4 7752` |
| ps | Private owners (1994) | 0/3 | `5-1097-98` | `5 1097` |
| ps | Private owners (1994) | 0/3 | `8-2446-46` | `8 2446` |
| ps | Public transport (1994) | 0/3 | `6-2337-30` | `6 2337` |
| ps | Public transport (1994) | 0/3 | `6-8509-30` | `6 8509` |
| ps | Public transport (1994) | 0/3 | `7-7099-34` | `7 7099` |
| ps | Gaza Strip (2012) | 0/3 | `3-0653-28` | `3 0653` |
| ps | Gaza Strip (2012) | 0/3 | `3-2005-10` | `3 2005` |
| ps | Gaza Strip (2012) | 0/3 | `3-4181-06` | `3 4181` |
| ps | Private owners (2018) | 0/3 | `5-9098-H` | `5 9098` |
| ps | Private owners (2018) | 0/3 | `6-5513-H` | `6 5513` |
| ps | Private owners (2018) | 0/3 | `6-9136-E` | `6 9136` |
| ps | Dealer | 0/3 | `62-100-76` | `62 100` |
| ps | Dealer | 0/3 | `64-074-76` | `64 074` |
| ps | Dealer | 0/3 | `65-067-76` | `65 067` |
| ro | Ministry of Interior | 0/3 | `MAI 27273` | `27273` |
| ro | Ministry of Interior | 0/3 | `MAI 50112` | `50112` |
| ro | Ministry of Interior | 0/3 | `MAI 62117` | `62117` |
| rs | Motorcycles | 0/3 | `BG 64-565` | `BG 64 565-BM` |
| rs | Motorcycles | 0/3 | `BG 66-711` | `BG 66 711-BM` |
| rs | Motorcycles | 0/3 | `BG 70-493` | `BG 70 493-BM` |
| rs | Police | 0/3 | `П 009-299` | `ČA П-BM` |
| rs | Police | 0/3 | `П 009-502` | `ČA П-BM` |
| rs | Police | 0/3 | `П 024-923` | `ČA П-BM` |
| rs | Diplomatic | 0/3 | `BG 162-A-017` | `BG BM` |
| rs | Diplomatic | 0/3 | `BG 80-A-010` | `BG BM` |
| rs | Diplomatic | 0/3 | `BG 86-A-009` | `BG BM` |
| rs | Mopeds | 0/3 | `BG 223-09` | `BG 223 09-BM` |
| rs | Mopeds | 0/3 | `BG 265-09` | `BG 265 09-BM` |
| rs | Mopeds | 0/3 | `LE 037-81` | `LE 037 81-BM` |
| rs | Oldtimers | 0/3 | `BG OT-190` | `BG BM` |
| rs | Oldtimers | 0/3 | `BG OT-241` | `BG BM` |
| rs | Oldtimers | 0/3 | `ČA OT-003` | `ČA BM` |
| rs | Special machinery | 0/3 | `BG AEA-96` | `BG BM` |
| rs | Special machinery | 0/3 | `BG AEC-49` | `BG BM` |
| rs | Special machinery | 0/3 | `BG AEC-58` | `BG BM` |
| rs | Military | 0/3 | `K-5605` | `BG BM` |
| rs | Military | 0/3 | `P-1864` | `BG BM` |
| rs | Military | 0/3 | `P-2019` | `BG BM` |
| ru | Diplomatic | 0/3 | `032 D 345 77` | `032 34` |
| ru | Diplomatic | 0/3 | `145 D 256 77` | `145 25` |
| ru | Diplomatic | 0/3 | `900 D 006 86` | `900 86` |
| ru | Diplomatic motorcycles | 0/3 | `D 017 02 77` | `017 02` |
| ru | Diplomatic motorcycles | 0/3 | `T 559 01 50` | `559 01` |
| ru | Diplomatic motorcycles | 0/3 | `T 559 06 50` | `559 06` |
| sa | Cars | 0/3 | `3273 JRS` | `A A A` |
| sa | Cars | 0/3 | `6982 ETR` | `A A A` |
| sa | Cars | 0/3 | `7 HSN` | `A A A` |
| sa | Public transport | 0/3 | `1889 HSA` | `A A A` |
| sa | Public transport | 0/3 | `6113 VJA` | `A A A` |
| sa | Public transport | 0/3 | `7817 SSA` | `A A A` |
| sa | Commercial vehicles | 0/3 | `3747 JXA` | `A A A` |
| sa | Commercial vehicles | 0/3 | `444 JUB` | `A A A` |
| sa | Commercial vehicles | 0/3 | `4642 DUA` | `A A A` |
| sa | Diplomatic | 0/3 | `100 BZD` | `A A A` |
| sa | Diplomatic | 0/3 | `15 JBD` | `A A A` |
| sa | Diplomatic | 0/3 | `6000 JGA` | `A A A` |
| sa | Provisional | 0/3 | `6478 BXA` | `A A A` |
| sa | Provisional | 0/3 | `8144 JXA` | `A A A` |
| sa | Provisional | 0/3 | `8289 JXA` | `A A A` |
| sa | 1996 year system | 0/3 | `١ لكأ` | `A A A` |
| sa | 1996 year system | 0/3 | `٦٦٦ نحل` | `A A A` |
| sa | 1996 year system | 0/3 | `٩٩٦ ردب` | `A A A` |
| sc | Ambassador, chief of diplomatic mission | 0/3 | `S 16958` | `S 16958 CD` |
| sc | Ambassador, chief of diplomatic mission | 0/3 | `S 19428` | `S 19428 CD` |
| sc | Ambassador, chief of diplomatic mission | 0/3 | `S 42635` | `S 42635 CD` |
| si | Trailers | 0/3 | `H4-86 KP` | `KP H4 86` |
| si | Trailers | 0/3 | `L4-14 CE` | `CE L4 14` |
| si | Trailers | 0/3 | `VD-24 LJ` | `LJ VD 24` |
| sk | Sportcars (AB S(A)123) | 0/3 | `AA S 009` | `SA AA 009` |
| sk | Sportcars (AB S(A)123) | 0/3 | `AA S 010` | `SA AA 010` |
| sk | Sportcars (AB S(A)123) | 0/3 | `AA S 359` | `SA AA 359` |
| sk | Military | 0/3 | `67-38966` | `-67` |
| sk | Military | 0/3 | `71-00089` | `-71` |
| sk | Military | 0/3 | `72-56208` | `-72` |
| sk | Diplomatic | 0/3 | `EE 10228` | `1` |
| sk | Diplomatic | 0/3 | `ZZ 44238` | `2` |
| sk | Diplomatic | 0/3 | `ZZ 72047` | `2` |
| th | Private owners | 2/3 | `4ฒฆ 5147` | `4 ฆ ฒ 5147` |
| th | Taxi | 1/3 | `ทห 7776` | `1 ท ห 7776` |
| th | Taxi | 1/3 | `ทฬ 1493` | `1 ท ฬ 1493` |
| th | Vanity Plates | 0/3 | `ฆส 4545` | `1 ฆ ส 4545` |
| th | Vanity Plates | 0/3 | `บพ 9595` | `R 1 พ ส 9595` |
| th | Vanity Plates | 0/3 | `บว 9988` | `R 1 ว ส 9988` |
| th | Commercial | 0/3 | `ณข 1801` | `9 ณ ข 1801` |
| th | Commercial | 0/3 | `ณข 5444` | `9 ณ ข 5444` |
| th | Commercial | 0/3 | `ณข 568` | `9 ณ ข 568` |
| th | Cars (1970) | 2/3 | `ย-1024` | `9 ย 1024` |
| tj | Trailers (2009) | 0/3 | `01AB 0096` | `01AB009602` |
| tj | Trailers (2009) | 0/3 | `02DD 6000` | `02DD600002` |
| tj | Trailers (2009) | 0/3 | `07MA 7070` | `07MA707002` |
| tj | Private owners (1996) | 0/3 | `AH 9832 02` | `AH` |
| tj | Private owners (1996) | 0/3 | `BM 8126 01` | `BM` |
| tj | Private owners (1996) | 0/3 | `X 6778 01` | `X6778` |
| tj | Organizations (1996) | 0/3 | `0526 B 01` | `0526B` |
| tj | Organizations (1996) | 0/3 | `1474 A 04` | `1474A` |
| tj | Organizations (1996) | 0/3 | `2080 A 04` | `2080A` |
| tj | Trailers (1996) | 0/3 | `A 0021 A 04` | `A` |
| tj | Trailers (1996) | 0/3 | `A 0910 A 02` | `A` |
| tj | Trailers (1996) | 0/3 | `A 0950 A 01` | `A` |
| tj | Motorcycles (1996) | 0/2 | `0542 AA 02` | `0542` |
| tj | Motorcycles (1996) | 0/2 | `0772 AA 02` | `0772` |
| ua | Transit plates (2004) | 0/3 | `05 CH 8725` | `05 8725 CH` |
| ua | Transit plates (2004) | 0/3 | `16 BP 3159` | `16 3159 BP` |
| ua | Transit plates (2004) | 0/3 | `21 BA 0640` | `21 0640 BA` |
| ua | Dealer (2004) | 0/3 | `T4 TE 2773` | `T4 2773 TE` |
| ua | Dealer (2004) | 0/3 | `T4 TP 4881` | `T4 4881 TP` |
| ua | Dealer (2004) | 0/3 | `T5 BI 7208` | `T5 7208 BI` |
| ua | Military (2004) | 0/3 | `1133 Ф4` | `1133` |
| ua | Military (2004) | 0/3 | `1175 Ф4` | `1175` |
| ua | Military (2004) | 0/3 | `6437 Т5` | `6437` |
| ua | Work vehicles (2004) | 0/3 | `02058 T AX` | `AX 02058` |
| ua | Work vehicles (2004) | 0/3 | `03213 T AI` | `AI 03213` |
| ua | Work vehicles (2004) | 0/3 | `10696 T AE` | `AE 10696` |
| ua | Government agencies | 0/3 | `AE 103 E` | `AE 103` |
| ua | Government agencies | 0/3 | `HA 121 G` | `HA 121` |
| ua | Government agencies | 0/3 | `IM 113 G` | `HA IM` |
| ua | Cars and trucks (1995) | 0/3 | `14 296-45 TA` | `14 AA` |
| ua | Cars and trucks (1995) | 0/3 | `16 095-93 OT` | `16 AA` |
| ua | Cars and trucks (1995) | 0/3 | `18 566-48 PB` | `18 AA` |
| ua | Public transport (1995) | 0/3 | `04 000-06 AA` | `04 JB` |
| ua | Public transport (1995) | 0/3 | `04 017-32 AA` | `04 JB` |
| ua | Public transport (1995) | 0/3 | `04 036-33 AA` | `04 JB` |
| ua | Vanity Plates | 0/3 | `11 SOPRANOS` | `11` |
| ua | Vanity Plates | 0/3 | `16 STORM` | `16` |
| ua | Vanity Plates | 0/3 | `16 VRSNSMV` | `16` |
| ua | Work vehicles (1995) | 0/3 | `Т0625 РВ` | `0625 РВ` |
| ua | Work vehicles (1995) | 0/3 | `Т1668 МК` | `1668 МК` |
| ua | Work vehicles (1995) | 0/3 | `Т2966 ЗС` | `2966 ЗС` |
| uz | Organizations | 0/3 | `10 023 XBA` | `10 M 023 XBA` |
| uz | Organizations | 0/3 | `10 363 PSP` | `10 M 363 PSP` |
| uz | Organizations | 0/3 | `10 400 VSG` | `10 M 400 VSG` |
| uz | Foreign citizens | 0/3 | `01 H 010229` | `01 H` |
| uz | Foreign citizens | 0/3 | `01 H 012673` | `01 H` |
| uz | Foreign citizens | 0/3 | `01 H 015022` | `01 H` |
| uz | Joint ventures and foreign enterprises | 0/3 | `01 M 000081` | `01 M` |
| uz | Joint ventures and foreign enterprises | 0/3 | `01 M 024863` | `01 M` |
| uz | Joint ventures and foreign enterprises | 0/3 | `10 M 002031` | `10 M` |
| vn | Cars | 1/3 | `47A-271.12` | `47 A` |
| vn | Cars | 1/3 | `51N-096.00` | `51 N` |
| vn | Specialty plates | 0/3 | `15CD-015.02` | `15 CD` |
| vn | Specialty plates | 0/3 | `34LA-1010` | `34 LA` |
| vn | Specialty plates | 0/3 | `79LD-002.51` | `79 LD` |
| vn | Government and public administrations | 1/3 | `80A-039.27` | `80 A` |
| vn | Government and public administrations | 1/3 | `99A-003.43` | `99 A` |
| vn | Military | 0/3 | `KC-56-49` | `KC` |
| vn | Military | 0/3 | `KC-57-26` | `KC` |
| vn | Military | 0/3 | `TH-12-13` | `TH` |
| vn | Government motorcycles | 0/3 | `29-B1 0910` | `29 B` |
| vn | Government motorcycles | 0/3 | `51-B2 0223` | `51 B` |
| vn | Government motorcycles | 0/3 | `79-A1 000.22` | `79 A` |
| vn | Commercial vehicles | 0/3 | `47C-144.72` | `47 C` |
| vn | Commercial vehicles | 0/3 | `47F-001.48` | `47 F` |
| vn | Commercial vehicles | 0/3 | `47H-046.91` | `47 H` |

## Par pays

`own` : règle dans `src/lib/plate/<cc>.js`. `generic` : lecture des champs visibles.

| Pays | Règle | Catégories | Vérifiées | À corriger | À trouver | Galerie vide | Non testables | Page d'ajout |
|---|---|---|---|---|---|---|---|---|
| ir Iran | generic | 16 | 2 | 11 |  |  | 3 | oui |
| ua Ukraine | own | 19 | 10 | 9 |  |  |  | oui |
| kg Kyrgyzstan | generic | 12 | 5 | 7 |  |  |  | oui |
| rs Serbia | own | 10 | 3 | 7 |  |  |  | oui |
| sa Saudi Arabia | generic | 6 | 0 | 6 |  |  |  | oui |
| vn Vietnam | generic | 8 | 0 | 6 |  |  | 2 | oui |
| hr Croatia | own | 11 | 5 | 5 |  |  | 1 | oui |
| pl Poland | own | 12 | 7 | 5 |  |  |  | oui |
| ps Palestinian Authority | generic | 6 | 1 | 5 |  |  |  | oui |
| th Thailand | generic | 9 | 4 | 5 |  |  |  | oui |
| tj Tajikistan | own | 10 | 5 | 5 |  |  |  | oui |
| ax Åland (FI) | generic | 5 | 1 | 4 |  |  |  | oui |
| de Germany | own | 16 | 11 | 4 |  |  | 1 | oui |
| eg Egypt | generic | 4 | 0 | 4 |  |  |  | oui |
| iq Iraq | generic | 4 | 0 | 4 |  |  |  | oui |
| jp Japan | generic | 4 | 0 | 4 |  |  |  | oui |
| la Laos | generic | 9 | 5 | 4 |  |  |  | oui |
| kr South Korea | generic | 3 | 0 | 3 |  |  |  | oui |
| kz Kazakhstan | generic | 18 | 15 | 3 |  |  |  | oui |
| mn Mongolia | generic | 4 | 1 | 3 |  |  |  | oui |
| sk Slovakia | own | 21 | 15 | 3 |  | 2 | 1 | oui |
| uz Uzbekistan | own | 9 | 6 | 3 |  |  |  | oui |
| ch Switzerland | generic | 11 | 9 | 2 |  |  |  | oui |
| cz Czech Republic | own | 22 | 18 | 2 |  | 1 | 1 | oui |
| kh Cambodia | generic | 7 | 4 | 2 |  | 1 |  | oui |
| lv Latvia | own | 9 | 7 | 2 |  |  |  | oui |
| ru Russia | own | 23 | 19 | 2 |  |  | 2 | oui |
| am Armenia | generic | 8 | 7 | 1 |  |  |  | oui |
| cy Cyprus | generic | 5 | 3 | 1 |  |  | 1 | oui |
| dk Denmark | own | 8 | 7 | 1 |  |  |  | oui |
| gg Guernsey (UK) | own | 3 | 2 | 1 |  |  |  | oui |
| ie Ireland | generic | 3 | 2 | 1 |  |  |  | oui |
| il Israel | generic | 8 | 7 | 1 |  |  |  | oui |
| is Iceland | own | 10 | 9 | 1 |  |  |  | oui |
| it Italy | generic | 14 | 11 | 1 |  |  | 2 | oui |
| li Liechtenstein | own | 9 | 8 | 1 |  |  |  | oui |
| ma Morocco | generic | 2 | 1 | 1 |  |  |  | oui |
| mc Monaco | generic | 4 | 3 | 1 |  |  |  | oui |
| me Montenegro | own | 6 | 5 | 1 |  |  |  | oui |
| ro Romania | generic | 5 | 4 | 1 |  |  |  | oui |
| sc Seychelles | generic | 9 | 7 | 1 |  | 1 |  | oui |
| si Slovenia | own | 4 | 3 | 1 |  |  |  | oui |
| ad Andorra | generic | 5 | 5 |  |  |  |  | oui |
| ae UAE | generic | 0 | 0 |  |  |  |  | oui |
| al Albania | own | 4 | 4 |  |  |  |  | oui |
| ar Argentina | generic | 6 | 6 |  |  |  |  | oui |
| at Austria | generic | 9 | 9 |  |  |  |  | oui |
| au Australia | generic | 0 | 0 |  |  |  |  | oui |
| az Azerbaijan | generic | 5 | 4 |  |  |  | 1 | oui |
| ba Bosnia and Herzegovina | own | 5 | 4 |  |  |  | 1 | oui |
| be Belgium | generic | 5 | 5 |  |  |  |  | oui |
| bg Bulgaria | generic | 7 | 7 |  |  |  |  | oui |
| bh Bahrain | generic | 7 | 7 |  |  |  |  | oui |
| br Brazil | generic | 13 | 13 |  |  |  |  | oui |
| bs Bahamas | generic | 7 | 7 |  |  |  |  | oui |
| by Belarus | own | 18 | 18 |  |  |  |  | oui |
| ca Canada | generic | 0 | 0 |  |  |  |  | oui |
| cl Chile | generic | 15 | 3 |  |  | 3 | 9 | oui |
| cn China | generic | 6 | 6 |  |  |  |  | oui |
| dz Algeria | own | 7 | 4 |  |  | 3 |  | oui |
| ee Estonia | own | 10 | 10 |  |  |  |  | oui |
| es Spain | own | 6 | 6 |  |  |  |  | oui |
| fi Finland | generic | 9 | 9 |  |  |  |  | oui |
| fr France | own | 17 | 17 |  |  |  |  | oui |
| ge Georgia | generic | 12 | 10 |  |  |  | 2 | oui |
| gi Gibraltar (UK) | generic | 4 | 4 |  |  |  |  | oui |
| gr Greece | own | 16 | 16 |  |  |  |  | oui |
| gu Guam (USA) | generic | 9 | 5 |  |  | 4 |  | oui |
| hk Hong Kong (CN) | generic | 2 | 2 |  |  |  |  | oui |
| hu Hungary | generic | 23 | 23 |  |  |  |  | oui |
| id Indonesia | generic | 7 | 7 |  |  |  |  | oui |
| je Jersey (UK) | generic | 2 | 2 |  |  |  |  | oui |
| ke Kenya | generic | 12 | 12 |  |  |  |  | oui |
| kw Kuwait | generic | 4 | 4 |  |  |  |  | oui |
| lt Lithuania | generic | 9 | 9 |  |  |  |  | oui |
| lu Luxembourg | generic | 5 | 5 |  |  |  |  | oui |
| md Moldova | own | 8 | 8 |  |  |  |  | oui |
| mk North Macedonia | generic | 8 | 7 |  |  | 1 |  | oui |
| mp Northern Mariana Islands (USA) | generic | 6 | 2 |  |  | 4 |  | oui |
| mt Malta | generic | 6 | 6 |  |  |  |  | oui |
| mx Mexico | generic | 20 | 0 |  |  |  | 20 | oui |
| my Malaysia | generic | 4 | 0 |  |  |  | 4 | oui |
| nl Netherlands | generic | 27 | 0 |  |  |  | 27 | oui |
| no Norway | generic | 12 | 12 |  |  |  |  | oui |
| nz New Zealand | generic | 5 | 5 |  |  |  |  | oui |
| pt Portugal | generic | 4 | 3 |  |  |  | 1 | oui |
| qa Qatar | generic | 6 | 6 |  |  |  |  | oui |
| se Sweden | generic | 8 | 8 |  |  |  |  | oui |
| sg Singapore | generic | 13 | 0 |  |  |  | 13 | oui |
| sm San Marino | generic | 13 | 13 |  |  |  |  | oui |
| su USSR | generic | 15 | 15 |  |  |  |  | oui |
| tr Turkey | own | 6 | 6 |  |  |  |  | oui |
| uk United Kingdom | generic | 10 | 10 |  |  |  |  | oui |
| us USA | generic | 0 | 0 |  |  |  |  | oui |
| va Vatican | generic | 6 | 5 |  |  | 1 |  | oui |
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
- **sc** : Dealer
- **sk** : Sportcars (S(A) 123AB), Agricultural vehicles (F(A) 123AB)
- **va** : Dealer (PROVA SCV)

## Non testables par le formulaire

Ces catégories existent dans la recherche du site mais le formulaire d'ajout ne permet pas de les choisir : leur règle ne peut pas être prouvée par ce moyen.

- **az** : absente du menu du formulaire (1) : Foreign citizens and enterprises
- **ba** : le formulaire n'a aucun champ de plaque pour ce type (1) : Diplomatic
- **cl** : absente du menu du formulaire (9)
- **cy** : absente du menu du formulaire (1) : Commercial vehicles
- **cz** : absente du menu du formulaire (1) : Foreign citizens and enterprises (1960)
- **de** : absente du menu du formulaire (1) : NATO
- **ge** : absente du menu du formulaire (2) : Cars (2024), Trailers and special equipment (2024)
- **hr** : le formulaire n'a aucun champ de plaque pour ce type (1) : Police
- **ir** : le formulaire n'a aucun champ de plaque pour ce type (3) : Motorcycles, Oldtimers, Free trade zones
- **it** : le formulaire n'a aucun champ de plaque pour ce type (2) : Mopeds, Dealer
- **mx** : pas de menu de type (20)
- **my** : pas de menu de type (4) : A(BC) 1(234), AB(C) 1(234) D, Taxi (HAB 1(234)), Military (Z(A) 1(234))
- **nl** : pas de menu de type (27)
- **pt** : le formulaire n'a aucun champ de plaque pour ce type (1) : Diplomatic
- **ru** : absente du menu du formulaire (2) : High authorities, Diplomatic (Ambassador, chief of diplomatic mission)
- **sg** : pas de menu de type (13)
- **sk** : le formulaire n'a aucun champ de plaque pour ce type (1) : Police
- **vn** : le formulaire n'a aucun champ de plaque pour ce type (2) : Motorcycles, Diplomatic

## Pays non capturés

Aucune page sauvegardée : ni catégories, ni règle. Capturer avec le build dev (tiroir *Dev*, `Capture`).


