# Couverture des règles de plaque

Généré par `node scripts/coverage.mjs` : ne pas modifier à la main. Après une correction : `python tests/offline/check_db.py && node scripts/coverage.mjs`.

**Vérifié** = au moins une plaque connue du site, et toutes relues correctement par le script dans la page sauvegardée. **À corriger** = une plaque connue est mal relue. **À trouver** = aucune plaque connue pour cette catégorie : la règle n'est pas prouvée.

## Résumé

| | Nombre | Part |
|---|---|---|
| Pays du site | 96 | |
| Pays capturés (pages sauvegardées) | 47 | 49 % |
| **Pays non capturés** | **49** | |
| Pays avec une règle propre | 27 sur 47 | |
| Catégories (pays capturés) | 481 | |
| Vérifiées | 294 | 61 % |
| **À corriger** | **3** | 1 % |
| **À trouver** (aucune plaque connue) | **184** | 38 % |

## À corriger

| Pays | Catégorie | OK | Plaque attendue | Lue |
|---|---|---|---|---|
| de | Authorities and federal agencies | 0/3 | `BD 16 7004` | `7004` |
| de | Authorities and federal agencies | 0/3 | `BP 17-924` | `924` |
| de | Authorities and federal agencies | 0/3 | `BW 7 590` | `590` |
| rs | Trailers | 0/1 | `OO-442 VR` | `O-442 O` |
| ua | Work vehicles (1995) | 0/3 | `Т0625 РВ` | `Т0625` |
| ua | Work vehicles (1995) | 0/3 | `Т1668 МК` | `Т1668` |
| ua | Work vehicles (1995) | 0/3 | `Т2966 ЗС` | `Т2966` |

## Par pays

`own` : règle dans `src/lib/plate/<cc>.js`. `generic` : lecture des champs visibles.

| Pays | Règle | Catégories | Vérifiées | À corriger | À trouver | Page d'ajout |
|---|---|---|---|---|---|---|
| nl Netherlands | generic | 27 | 0 |  | 27 | oui |
| ru Russia | own | 23 | 0 |  | 23 | oui |
| cz Czech Republic | own | 22 | 8 |  | 14 | oui |
| gr Greece | own | 16 | 5 |  | 11 | oui |
| li Liechtenstein | own | 9 | 0 |  | 9 | oui |
| rs Serbia | own | 10 | 1 | 1 | 8 | oui |
| tj Tajikistan | own | 10 | 1 |  | 9 | oui |
| ua Ukraine | own | 19 | 10 | 1 | 8 | oui |
| de Germany | own | 16 | 8 | 1 | 7 | oui |
| by Belarus | own | 18 | 12 |  | 6 | oui |
| hr Croatia | own | 11 | 5 |  | 6 | oui |
| mt Malta | generic | 6 | 0 |  | 6 | oui |
| sk Slovakia | own | 21 | 15 |  | 6 | oui |
| ad Andorra | generic | 5 | 0 |  | 5 | oui |
| pl Poland | own | 12 | 7 |  | 5 | oui |
| ch Switzerland | generic | 11 | 7 |  | 4 | oui |
| dz Algeria | own | 7 | 4 |  | 3 | oui |
| it Italy | generic | 14 | 11 |  | 3 | oui |
| si Slovenia | own | 4 | 1 |  | 3 | oui |
| ba Bosnia and Herzegovina | own | 5 | 3 |  | 2 | oui |
| lv Latvia | own | 9 | 7 |  | 2 | oui |
| me Montenegro | own | 6 | 4 |  | 2 | oui |
| mk North Macedonia | generic | 8 | 6 |  | 2 | oui |
| uz Uzbekistan | own | 9 | 7 |  | 2 | oui |
| al Albania | own | 4 | 3 |  | 1 | oui |
| at Austria | generic | 9 | 8 |  | 1 | oui |
| bg Bulgaria | generic | 7 | 6 |  | 1 | oui |
| dk Denmark | own | 8 | 7 |  | 1 | oui |
| gg Guernsey (UK) | own | 3 | 2 |  | 1 | oui |
| ie Ireland | generic | 3 | 2 |  | 1 | oui |
| is Iceland | own | 10 | 9 |  | 1 | oui |
| lu Luxembourg | generic | 5 | 4 |  | 1 | oui |
| ma Morocco | generic | 2 | 1 |  | 1 | oui |
| pt Portugal | generic | 4 | 3 |  | 1 | oui |
| ro Romania | generic | 5 | 4 |  | 1 | oui |
| be Belgium | generic | 5 | 5 |  |  | oui |
| ee Estonia | own | 10 | 10 |  |  | oui |
| es Spain | own | 6 | 6 |  |  | oui |
| fi Finland | generic | 9 | 9 |  |  | oui |
| fr France | own | 17 | 17 |  |  | oui |
| hu Hungary | generic | 23 | 23 |  |  | oui |
| lt Lithuania | generic | 9 | 9 |  |  | oui |
| md Moldova | own | 8 | 8 |  |  | oui |
| no Norway | generic | 12 | 12 |  |  | oui |
| se Sweden | generic | 8 | 8 |  |  | oui |
| tr Turkey | own | 6 | 6 |  |  | oui |
| uk United Kingdom | generic | 10 | 10 |  |  | oui |

## Catégories à trouver (par pays)

Pour chacune : trouver une plaque réelle sur le site, la saisir, puis relancer le contrôle. Le remplissage du build dev (`Fill missing plates`) le fait.

<details><summary><b>ad</b> : 5</summary>

- Cars (A 1234)
- Vanity Plates
- Cars (1234(5))
- Motorcycles (A 1234)
- Provisional (1234)

</details>

<details><summary><b>al</b> : 1</summary>

- Trailers (2011)

</details>

<details><summary><b>at</b> : 1</summary>

- Dealer

</details>

<details><summary><b>ba</b> : 2</summary>

- Taxi
- Diplomatic

</details>

<details><summary><b>bg</b> : 1</summary>

- Temporary

</details>

<details><summary><b>by</b> : 6</summary>

- Transit plates (2004)
- Cars (2000)
- Trucks and buses (1992)
- Taxi
- Provisional
- Foreign citizens and enterprises

</details>

<details><summary><b>ch</b> : 4</summary>

- Vehicles w/o paid duty (with "Z")
- Dealer (with "U")
- Military (black)
- Diplomatic

</details>

<details><summary><b>cz</b> : 14</summary>

- Sportcars (2001)
- Oldtimers (2001)
- Cars (1960)
- Motorcycles (1960)
- Commercial vehicles (1960)
- Foreign citizens and enterprises (1960)
- Electric vehicles
- Diplomatic (2004)
- Agricultural vehicles (1960)
- Trailers (1977)
- Military (1960)
- Special machinery (2001)
- Diplomatic (2025)
- Diplomatic (2001)

</details>

<details><summary><b>de</b> : 7</summary>

- Plates for oldtimers (type "H")
- Seasonal plates
- Electric vehicles
- Seasonal plates (Oldtimers)
- Transferable license plates
- Regional authorities
- NATO

</details>

<details><summary><b>dk</b> : 1</summary>

- Vanity Plates

</details>

<details><summary><b>dz</b> : 3</summary>

- Police ((1)11111)
- Protection Civile ((111)111111)
- Military (111111111)

</details>

<details><summary><b>gg</b> : 1</summary>

- Alderney

</details>

<details><summary><b>gr</b> : 11</summary>

- Government and public administrations
- Trucks
- Trailers
- Taxi
- Oldtimers
- Diplomatic corps
- Administrative and technical staff
- Agricultural vehicles
- Private trailers
- Police
- Coast Guard

</details>

<details><summary><b>hr</b> : 6</summary>

- Dealer
- Oldtimers
- Military
- Export transit plates
- Police
- Diplomatic

</details>

<details><summary><b>ie</b> : 1</summary>

- Oldtimers

</details>

<details><summary><b>is</b> : 1</summary>

- Vanity Plates

</details>

<details><summary><b>it</b> : 3</summary>

- Mopeds
- Dealer
- Road machinery

</details>

<details><summary><b>li</b> : 9</summary>

- Cars
- Motorcycles
- Short-term transit plates
- Agricultural vehicles (green)
- Exceptional vehicles
- Work and fire vehicles (blue)
- Provisional
- Dealer (with "U")
- Light motor vehicles

</details>

<details><summary><b>lu</b> : 1</summary>

- Diplomatic

</details>

<details><summary><b>lv</b> : 2</summary>

- Trailers
- Dealer

</details>

<details><summary><b>ma</b> : 1</summary>

- Regular plates

</details>

<details><summary><b>me</b> : 2</summary>

- Vanity Plates
- Police

</details>

<details><summary><b>mk</b> : 2</summary>

- Vanity Plates
- Diplomatic

</details>

<details><summary><b>mt</b> : 6</summary>

- Regular plates (ABC 123)
- Trailers (TR 123(4))
- Taxi (TAXI 123A)
- Vanity Plates
- High authorities (GM-12)
- Oldtimers (ABC 123)

</details>

<details><summary><b>nl</b> : 27</summary>

- Cars
- Motorcycles
- Taxi
- Diplomatic
- Trailers
- Commercial vehicles
- Dealer
- Agricultural vehicles
- Except vehicles / Oldtimers
- Military
- Allied Joint Force Command Brunssum
- Imported youngtimers / oldtimers
- Mopeds
- Heavy Commercial Vehicles (1994 system)
- Light Commercial Vehicles (1994 system)
- Semi-trailers
- Agricultural trailers (2021 system)
- Border Traffic (1953-2021 system)
- Dealer (Agricultural)
- Dealer (Trailers)
- Dealer (Scooters)
- Imported oldtimers (motorcycles)
- Imported oldtimers (commercial vehicles)
- Royal Household
- Light electric vehicles and special mopeds
- Diplomatic Justice Corps (CDJ)
- One-day registration plate

</details>

<details><summary><b>pl</b> : 5</summary>

- Provisional and testing
- Vanity Plates
- 1976 year system
- Diplomatic
- Sportcars

</details>

<details><summary><b>pt</b> : 1</summary>

- Diplomatic

</details>

<details><summary><b>ro</b> : 1</summary>

- Ministry of Interior

</details>

<details><summary><b>rs</b> : 8</summary>

- Motorcycles
- Vanity Plates
- Police
- Diplomatic
- Mopeds
- Oldtimers
- Special machinery
- Military

</details>

<details><summary><b>ru</b> : 23</summary>

- Cars
- High authorities
- Public transport
- Trailers
- Special machinery
- Motorcycles
- ATV and snowmobiles
- Military cars
- Military trailers
- Special military vehicles
- Military motorcycles
- Foreign citizens and enterprises
- Transit plates
- Export transit plates
- Paper transit plates
- Special Vehicles Transits
- Military Transits
- Police cars
- Police trailers
- Police motorcycles
- Diplomatic (Ambassador, chief of diplomatic mission)
- Diplomatic
- Diplomatic motorcycles

</details>

<details><summary><b>si</b> : 3</summary>

- Cars
- Trailers
- Motorcycles

</details>

<details><summary><b>sk</b> : 6</summary>

- Sportcars (AB S(A)123)
- Sportcars (S(A) 123AB)
- Police
- Military
- Diplomatic
- Agricultural vehicles (F(A) 123AB)

</details>

<details><summary><b>tj</b> : 9</summary>

- Private owners (2009)
- Public transport (2009)
- Trailers (2009)
- Motorcycles (2009)
- Police (2009)
- Private owners (1996)
- Organizations (1996)
- Trailers (1996)
- Motorcycles (1996)

</details>

<details><summary><b>ua</b> : 8</summary>

- Transit plates (2004)
- Dealer (2004)
- Military (2004)
- Work vehicles (2004)
- Government agencies
- Cars and trucks (1995)
- Public transport (1995)
- Vanity Plates

</details>

<details><summary><b>uz</b> : 2</summary>

- Foreign citizens
- Joint ventures and foreign enterprises

</details>

## Pays non capturés

Aucune page sauvegardée : ni catégories, ni règle. Capturer avec le build dev (tiroir *Dev*, `Capture`).

ar Argentina · am Armenia · au Australia · az Azerbaijan · bs Bahamas · bh Bahrain · br Brazil · kh Cambodia · ca Canada · cl Chile · cn China · cy Cyprus · eg Egypt · ge Georgia · gi Gibraltar (UK) · gu Guam (USA) · hk Hong Kong (CN) · id Indonesia · ir Iran · iq Iraq · il Israel · jp Japan · je Jersey (UK) · kz Kazakhstan · ke Kenya · kw Kuwait · kg Kyrgyzstan · la Laos · my Malaysia · mx Mexico · mc Monaco · mn Mongolia · nz New Zealand · mp Northern Mariana Islands (USA) · ps Palestinian Authority · qa Qatar · sm San Marino · sa Saudi Arabia · sc Seychelles · sg Singapore · kr South Korea · th Thailand · ae UAE · us USA · su USSR · va Vatican · vn Vietnam · ax Åland (FI) · xx Non-recognized and partially recognized states
