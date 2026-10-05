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
| Vérifiées | 297 | 36 % |
| **À corriger** | **0** | 0 % |
| **À trouver** (aucune plaque connue) | **468** | 56 % |
| Galerie vide sur le site (aucune plaque n'existe) | 0 | 0 % |
| Non testables par le formulaire (pas de page d'ajout ni de menu de type) | 64 | 8 % |

## À corriger

Aucune.

## Par pays

`own` : règle dans `src/lib/plate/<cc>.js`. `generic` : lecture des champs visibles.

| Pays | Règle | Catégories | Vérifiées | À corriger | À trouver | Galerie vide | Non testables | Page d'ajout |
|---|---|---|---|---|---|---|---|---|
| ru Russia | own | 23 | 0 |  | 23 |  |  | oui |
| kz Kazakhstan | generic | 18 | 0 |  | 18 |  |  | oui |
| ir Iran | generic | 16 | 0 |  | 16 |  |  | oui |
| cl Chile | generic | 15 | 0 |  | 15 |  |  | oui |
| su USSR | generic | 15 | 0 |  | 15 |  |  | oui |
| cz Czech Republic | own | 22 | 8 |  | 14 |  |  | oui |
| br Brazil | generic | 13 | 0 |  | 13 |  |  | oui |
| sm San Marino | generic | 13 | 0 |  | 13 |  |  | oui |
| ge Georgia | generic | 12 | 0 |  | 12 |  |  | oui |
| ke Kenya | generic | 12 | 0 |  | 12 |  |  | oui |
| kg Kyrgyzstan | generic | 12 | 0 |  | 12 |  |  | oui |
| gr Greece | own | 16 | 5 |  | 11 |  |  | oui |
| gu Guam (USA) | generic | 9 | 0 |  | 9 |  |  | oui |
| la Laos | generic | 9 | 0 |  | 9 |  |  | oui |
| li Liechtenstein | own | 9 | 0 |  | 9 |  |  | oui |
| sc Seychelles | generic | 9 | 0 |  | 9 |  |  | oui |
| th Thailand | generic | 9 | 0 |  | 9 |  |  | oui |
| tj Tajikistan | own | 10 | 1 |  | 9 |  |  | oui |
| am Armenia | generic | 8 | 0 |  | 8 |  |  | oui |
| il Israel | generic | 8 | 0 |  | 8 |  |  | oui |
| rs Serbia | own | 10 | 2 |  | 8 |  |  | oui |
| ua Ukraine | own | 19 | 11 |  | 8 |  |  | oui |
| vn Vietnam | generic | 8 | 0 |  | 8 |  |  | oui |
| bh Bahrain | generic | 7 | 0 |  | 7 |  |  | oui |
| bs Bahamas | generic | 7 | 0 |  | 7 |  |  | oui |
| de Germany | own | 16 | 9 |  | 7 |  |  | oui |
| id Indonesia | generic | 7 | 0 |  | 7 |  |  | oui |
| kh Cambodia | generic | 7 | 0 |  | 7 |  |  | oui |
| ar Argentina | generic | 6 | 0 |  | 6 |  |  | oui |
| by Belarus | own | 18 | 12 |  | 6 |  |  | oui |
| cn China | generic | 6 | 0 |  | 6 |  |  | oui |
| hr Croatia | own | 11 | 5 |  | 6 |  |  | oui |
| mp Northern Mariana Islands (USA) | generic | 6 | 0 |  | 6 |  |  | oui |
| mt Malta | generic | 6 | 0 |  | 6 |  |  | oui |
| ps Palestinian Authority | generic | 6 | 0 |  | 6 |  |  | oui |
| qa Qatar | generic | 6 | 0 |  | 6 |  |  | oui |
| sa Saudi Arabia | generic | 6 | 0 |  | 6 |  |  | oui |
| sk Slovakia | own | 21 | 15 |  | 6 |  |  | oui |
| va Vatican | generic | 6 | 0 |  | 6 |  |  | oui |
| ad Andorra | generic | 5 | 0 |  | 5 |  |  | oui |
| ax Åland (FI) | generic | 5 | 0 |  | 5 |  |  | oui |
| az Azerbaijan | generic | 5 | 0 |  | 5 |  |  | oui |
| cy Cyprus | generic | 5 | 0 |  | 5 |  |  | oui |
| nz New Zealand | generic | 5 | 0 |  | 5 |  |  | oui |
| pl Poland | own | 12 | 7 |  | 5 |  |  | oui |
| ch Switzerland | generic | 11 | 7 |  | 4 |  |  | oui |
| eg Egypt | generic | 4 | 0 |  | 4 |  |  | oui |
| gi Gibraltar (UK) | generic | 4 | 0 |  | 4 |  |  | oui |
| iq Iraq | generic | 4 | 0 |  | 4 |  |  | oui |
| jp Japan | generic | 4 | 0 |  | 4 |  |  | oui |
| kw Kuwait | generic | 4 | 0 |  | 4 |  |  | oui |
| mc Monaco | generic | 4 | 0 |  | 4 |  |  | oui |
| mn Mongolia | generic | 4 | 0 |  | 4 |  |  | oui |
| dz Algeria | own | 7 | 4 |  | 3 |  |  | oui |
| it Italy | generic | 14 | 11 |  | 3 |  |  | oui |
| kr South Korea | generic | 3 | 0 |  | 3 |  |  | oui |
| si Slovenia | own | 4 | 1 |  | 3 |  |  | oui |
| ba Bosnia and Herzegovina | own | 5 | 3 |  | 2 |  |  | oui |
| hk Hong Kong (CN) | generic | 2 | 0 |  | 2 |  |  | oui |
| je Jersey (UK) | generic | 2 | 0 |  | 2 |  |  | oui |
| lv Latvia | own | 9 | 7 |  | 2 |  |  | oui |
| me Montenegro | own | 6 | 4 |  | 2 |  |  | oui |
| mk North Macedonia | generic | 8 | 6 |  | 2 |  |  | oui |
| uz Uzbekistan | own | 9 | 7 |  | 2 |  |  | oui |
| al Albania | own | 4 | 3 |  | 1 |  |  | oui |
| at Austria | generic | 9 | 8 |  | 1 |  |  | oui |
| bg Bulgaria | generic | 7 | 6 |  | 1 |  |  | oui |
| dk Denmark | own | 8 | 7 |  | 1 |  |  | oui |
| gg Guernsey (UK) | own | 3 | 2 |  | 1 |  |  | oui |
| ie Ireland | generic | 3 | 2 |  | 1 |  |  | oui |
| is Iceland | own | 10 | 9 |  | 1 |  |  | oui |
| lu Luxembourg | generic | 5 | 4 |  | 1 |  |  | oui |
| ma Morocco | generic | 2 | 1 |  | 1 |  |  | oui |
| pt Portugal | generic | 4 | 3 |  | 1 |  |  | oui |
| ro Romania | generic | 5 | 4 |  | 1 |  |  | oui |
| ae UAE | generic | 0 | 0 |  |  |  |  | oui |
| au Australia | generic | 0 | 0 |  |  |  |  | oui |
| be Belgium | generic | 5 | 5 |  |  |  |  | oui |
| ca Canada | generic | 0 | 0 |  |  |  |  | oui |
| ee Estonia | own | 10 | 10 |  |  |  |  | oui |
| es Spain | own | 6 | 6 |  |  |  |  | oui |
| fi Finland | generic | 9 | 9 |  |  |  |  | oui |
| fr France | own | 17 | 17 |  |  |  |  | oui |
| hu Hungary | generic | 23 | 23 |  |  |  |  | oui |
| lt Lithuania | generic | 9 | 9 |  |  |  |  | oui |
| md Moldova | own | 8 | 8 |  |  |  |  | oui |
| mx Mexico | generic | 20 | 0 |  |  |  | 20 | oui |
| my Malaysia | generic | 4 | 0 |  |  |  | 4 | oui |
| nl Netherlands | generic | 27 | 0 |  |  |  | 27 | oui |
| no Norway | generic | 12 | 12 |  |  |  |  | oui |
| se Sweden | generic | 8 | 8 |  |  |  |  | oui |
| sg Singapore | generic | 13 | 0 |  |  |  | 13 | oui |
| tr Turkey | own | 6 | 6 |  |  |  |  | oui |
| uk United Kingdom | generic | 10 | 10 |  |  |  |  | oui |
| us USA | generic | 0 | 0 |  |  |  |  | oui |
| xx Non-recognized and partially recognized states | generic | 0 | 0 |  |  |  |  | oui |

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

<details><summary><b>am</b> : 8</summary>

- Private owners
- Organizations
- Privately owned trailers
- Trailers belonging to organizations
- Public transport
- High officials
- Taxi
- Export transit plates

</details>

<details><summary><b>ar</b> : 6</summary>

- Cars (Mercosur, AB 123 CD)
- Motorcycles (Mercosur, A123BCD)
- Cars (1995, ABC 123)
- Diplomatic
- Trailers (1995, 101 ABC 123)
- Motorcycles (1995, 123 ABC)

</details>

<details><summary><b>at</b> : 1</summary>

- Dealer

</details>

<details><summary><b>ax</b> : 5</summary>

- Cars (ÅL 12345)
- Cars (ÅLA 1234)
- Vanity Plates
- Trailers (ÅS 1234)
- Provisional (ÅF 1234)

</details>

<details><summary><b>az</b> : 5</summary>

- Cars
- Public transport
- Motorcycles
- Special machinery
- Foreign citizens and enterprises

</details>

<details><summary><b>ba</b> : 2</summary>

- Taxi
- Diplomatic

</details>

<details><summary><b>bg</b> : 1</summary>

- Temporary

</details>

<details><summary><b>bh</b> : 7</summary>

- Cars
- Commercial vehicles
- Public transport
- Export transit plates
- Motorcycles
- Police
- Diplomatic

</details>

<details><summary><b>br</b> : 13</summary>

- Private owners (1990)
- Commercial vehicles (1990)
- Oldtimers (1990)
- Testing (1990)
- Driving school (1990)
- Authorities (1990)
- Diplomatic (1990)
- Private owners (Mercosul)
- Commercial vehicles (Mercosul)
- Authorities (Mercosul)
- Diplomatic (Mercosul)
- Testing (Mercosul)
- Oldtimers (Mercosul)

</details>

<details><summary><b>bs</b> : 7</summary>

- Regular plates (2016)
- Public Service License
- Non-Passenger
- Motorcycles
- Regular plates (1997)
- Commercial vehicles (1997)
- Rental cars (1997)

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

<details><summary><b>cl</b> : 15</summary>

- Cars (AB-CD-12)
- Taxi (AB-CD-12)
- Shared taxis (AB-CD-12)
- Special airport taxis and tourist vehicles (AB-CD-12)
- Free economic zones (AB-CD-12)
- Buses (AB-CD-12)
- Motorcycles (AB-123)
- Motorcycles (ABC-12)
- Diplomatic
- Cars (AB-12-34)
- Taxi (AB-12-34)
- Shared taxis (AB-12-34)
- Special airport taxis and tourist vehicles (AB-12-34)
- Free economic zones (AB-12-34)
- Buses (AB-12-34)

</details>

<details><summary><b>cn</b> : 6</summary>

- Cars
- Trucks and buses
- Foreign citizens and enterprises
- Trailers
- Electric vehicles
- Motorcycles

</details>

<details><summary><b>cy</b> : 5</summary>

- Regular plates
- Commercial vehicles
- Rental cars
- Trailers
- 1956-1990 - system

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

<details><summary><b>eg</b> : 4</summary>

- Cars (2008)
- Motorcycles
- Police
- Cars (1999)

</details>

<details><summary><b>ge</b> : 12</summary>

- Cars (2024)
- Trailers and special equipment (2024)
- Motorcycles
- Cars (1993)
- Trailers and special equipment (1993)
- Transit plates (1234 AB)
- Transit plates (123 ABC)
- Temporary
- Test license plates (TEST)
- Military
- Diplomatic
- Vanity Plates

</details>

<details><summary><b>gg</b> : 1</summary>

- Alderney

</details>

<details><summary><b>gi</b> : 4</summary>

- Regular car plates (G 12345)
- Regular car plates (G 1234 A)
- Trailers
- Temporary

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

<details><summary><b>gu</b> : 9</summary>

- Regular plates (2008)
- Commercial vehicles (2008)
- Regular plates (1994)
- Commercial vehicles (1994)
- Vanity Plates
- Veteran
- Amateur Radio
- Motorcycles (M1234)
- Mopeds (MP1234)

</details>

<details><summary><b>hk</b> : 2</summary>

- AB 1234
- Vanity Plates

</details>

<details><summary><b>hr</b> : 6</summary>

- Dealer
- Oldtimers
- Military
- Export transit plates
- Police
- Diplomatic

</details>

<details><summary><b>id</b> : 7</summary>

- Regular plates
- Motorcycles
- Commercial vehicles
- Government and public administrations
- Temporary
- High authorities
- Free trade zones

</details>

<details><summary><b>ie</b> : 1</summary>

- Oldtimers

</details>

<details><summary><b>il</b> : 8</summary>

- Regular plates
- Police
- Military
- Special machinery
- Dealer
- Diplomatic
- Military Police
- Sportcars

</details>

<details><summary><b>iq</b> : 4</summary>

- 2022 year system
- 2008 year system
- 2001 year system
- 1988 year system

</details>

<details><summary><b>ir</b> : 16</summary>

- Private owners
- Disabled
- Taxi
- Commercial vehicles
- Agricultural vehicles
- Police
- Islamic Revolutionary Guard Corps
- Military
- Ministry of Defense
- General Staff
- Authorities
- Motorcycles
- Oldtimers
- Free trade zones
- License plates for driving abroad (2010)
- License plates for driving abroad (2015)

</details>

<details><summary><b>is</b> : 1</summary>

- Vanity Plates

</details>

<details><summary><b>it</b> : 3</summary>

- Mopeds
- Dealer
- Road machinery

</details>

<details><summary><b>je</b> : 2</summary>

- Regular plates (J123456)
- JSY123

</details>

<details><summary><b>jp</b> : 4</summary>

- Private owners
- Commercial vehicles
- Private owners (Kei car)
- Commercial vehicles (Kei car)

</details>

<details><summary><b>ke</b> : 12</summary>

- Cars (KAB 123C)
- Cars (KAB 123)
- Authorities (GK A123B/GKA 123B)
- Provincial governments, university rectors (12CG345A)
- Diplomatic (1(23) CD 4(56)(A)K)
- Motorcycles (KMAB 123C)
- Tuk-tuks (KTWA 123B)
- Agricultural vehicles (KTCA 123B)
- Exceptional vehicles (KHMA 123B)
- Trailers (ZA 1234)
- Dealer (KA 1234)
- Vanity Plates

</details>

<details><summary><b>kg</b> : 12</summary>

- Private owners (2016)
- Organizations (2016)
- Trailers, motorcycles, special vehicles (2016)
- Foreign citizens and enterprises (2016)
- Transit plates (2023)
- Private owners (1994)
- Organizations (1994)
- Trailers and motorcycles (1994)
- Foreign citizens and enterprises (1994)
- Government agency
- Vanity Plates
- Diplomatic

</details>

<details><summary><b>kh</b> : 7</summary>

- Regular plates
- Police
- Vanity Plates
- Military
- Authorities
- Right hand drive vehicles
- Vehicles w/o paid duty

</details>

<details><summary><b>kr</b> : 3</summary>

- Cars (2007)
- Commercial vehicles
- Electric vehicles

</details>

<details><summary><b>kw</b> : 4</summary>

- Cars
- Public transport
- Motorcycles
- Diplomatic

</details>

<details><summary><b>kz</b> : 18</summary>

- Private owners (2012)
- Organizations (2012)
- Trailers (2012)
- Motorcycles (2012)
- Foreigners (2012)
- Police (2012)
- Military (2012)
- Private owners (1993)
- Organizations (1993)
- Trailers (1993)
- Motorcycles (1993)
- Police (1993)
- Military (1993)
- Foreigners
- High authorities
- Transit plates
- Special machinery
- Diplomatic

</details>

<details><summary><b>la</b> : 9</summary>

- Private owners
- Organizations
- Foreign citizens and enterprises
- Сompany (1% paid tax)
- Authorities
- Diplomatic
- Military
- Police
- Temporary

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

<details><summary><b>mc</b> : 4</summary>

- Cars
- Motorcycles
- Royal family
- Provisional

</details>

<details><summary><b>me</b> : 2</summary>

- Vanity Plates
- Police

</details>

<details><summary><b>mk</b> : 2</summary>

- Vanity Plates
- Diplomatic

</details>

<details><summary><b>mn</b> : 4</summary>

- Cars
- Trailers
- Special machinery
- Motorcycles

</details>

<details><summary><b>mp</b> : 6</summary>

- Regular plates
- Heavy Equipment
- Vanity Plates
- Veteran
- Amateur Radio
- Motorcycles

</details>

<details><summary><b>mt</b> : 6</summary>

- Regular plates (ABC 123)
- Trailers (TR 123(4))
- Taxi (TAXI 123A)
- Vanity Plates
- High authorities (GM-12)
- Oldtimers (ABC 123)

</details>

<details><summary><b>nz</b> : 5</summary>

- AB1(234)
- ABC1(23)
- Motorcycles (1(2)ABC / A1BCD)
- Vanity Plates
- Trailers

</details>

<details><summary><b>pl</b> : 5</summary>

- Provisional and testing
- Vanity Plates
- 1976 year system
- Diplomatic
- Sportcars

</details>

<details><summary><b>ps</b> : 6</summary>

- Private owners (1994)
- Public transport (1994)
- Gaza Strip (2012)
- Private owners (2018)
- Authorities
- Dealer

</details>

<details><summary><b>pt</b> : 1</summary>

- Diplomatic

</details>

<details><summary><b>qa</b> : 6</summary>

- Private owners
- Commercial vehicles
- Export transit plates
- Taxi
- Police
- Limo

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

<details><summary><b>sa</b> : 6</summary>

- Cars
- Public transport
- Commercial vehicles
- Diplomatic
- Provisional
- 1996 year system

</details>

<details><summary><b>sc</b> : 9</summary>

- Cars
- Rental cars
- Ambassador, chief of diplomatic mission
- Diplomatic (United Nations)
- Government
- Commercial vehicles
- Parastatal
- Trailers
- Dealer

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

<details><summary><b>sm</b> : 13</summary>

- Cars (12345)
- Cars (A1234)
- Vanity Plates
- Motorcycles
- Mopeds
- Trailers (1234)
- Temporary (E 1234/1234 E)
- Oldtimers (123)
- Electric vehicles (123(4))
- Special machinery (1234)
- Agricultural vehicles (1234)
- Police (123)
- Diplomatic (123)

</details>

<details><summary><b>su</b> : 15</summary>

- Private-owned cars (1977)
- State-owned cars (1977)
- Motorcycles (1977)
- Special cars (1977)
- Foreign citizens and enterprises
- Trailers (1977)
- Special vehicles (1977)
- Trailers for special vehicles (1977)
- Сars (1958)
- Motorcycles and mopeds (1958)
- Trailers (1958)
- Military
- 1946 year license plates
- Special vehicles (1965)
- Trailers for special vehicles (1965)

</details>

<details><summary><b>th</b> : 9</summary>

- Private owners
- Taxi
- Dealer
- Vanity Plates
- Commercial
- Trucks and buses
- Motorcycles
- Cars (1970)
- Police

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

<details><summary><b>va</b> : 6</summary>

- Private (CV)
- State (SCV)
- Pope/pre-reform (S.C.V. red)
- Private (CV) motorcycle/tractor
- State (SCV) motorcycle/tractor
- Dealer (PROVA SCV)

</details>

<details><summary><b>vn</b> : 8</summary>

- Cars
- Motorcycles
- Specialty plates
- Government and public administrations
- Military
- Government motorcycles
- Commercial vehicles
- Diplomatic

</details>

## Galerie vide sur le site

Aucune photo dans la galerie de ces catégories : il n'y a pas de plaque à utiliser. À revérifier de temps en temps.


## Non testables par le formulaire

Ces catégories existent dans la recherche du site mais le formulaire d'ajout ne permet pas de les choisir : leur règle ne peut pas être prouvée par ce moyen.

- **mx** (pas de menu de type) : 20 catégorie(s)
- **my** (pas de menu de type) : 4 catégorie(s)
- **nl** (pas de menu de type) : 27 catégorie(s)
- **sg** (pas de menu de type) : 13 catégorie(s)

## Pays non capturés

Aucune page sauvegardée : ni catégories, ni règle. Capturer avec le build dev (tiroir *Dev*, `Capture`).


