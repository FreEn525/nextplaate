# Couverture des règles de plaque

Généré par `node scripts/coverage.mjs` : ne pas modifier à la main. Après une correction : `python tests/offline/check_db.py && node scripts/coverage.mjs`.

**Vérifié** = au moins une plaque connue du site, et toutes relues correctement par le script dans la page sauvegardée. **À corriger** = une plaque connue est mal relue. **À trouver** = aucune plaque connue pour cette catégorie : la règle n'est pas prouvée.

## Résumé

| | Nombre | Part |
|---|---|---|
| Pays du site | 96 | |
| Pays capturés (pages sauvegardées) | 96 | 100 % |
| **Pays non capturés** | **0** | |
| Pays avec une règle propre | 51 sur 96 | |
| Catégories (pays capturés) | 829 | |
| Vérifiées | 795 | 96 % |
| **À corriger** | **0** | 0 % |
| **À trouver** (aucune plaque connue) | **0** | 0 % |
| À vérifier sur le site : mêmes caractères, espaces différents | 1 | 0 % |
| Limite connue du formulaire du site (voir plus bas) | 12 | 1 % |
| Galerie vide sur le site (aucune plaque n'existe) | 21 | 3 % |
| Sans champ de plaque dans le formulaire ou sans page d'ajout | 0 | 0 % |

## À corriger

Aucune.

## Par pays

`own` : règle dans `src/lib/plate/<cc>.js`. `generic` : lecture des champs visibles.

| Pays | Règle | Catégories | Vérifiées | À corriger | À trouver | Galerie vide | Non testables | Page d'ajout |
|---|---|---|---|---|---|---|---|---|
| ad Andorra | generic | 5 | 5 |  |  |  |  | oui |
| ae UAE | generic | 0 | 0 |  |  |  |  | oui |
| al Albania | own | 4 | 4 |  |  |  |  | oui |
| am Armenia | own | 8 | 8 |  |  |  |  | oui |
| ar Argentina | generic | 6 | 6 |  |  |  |  | oui |
| at Austria | generic | 9 | 9 |  |  |  |  | oui |
| au Australia | generic | 0 | 0 |  |  |  |  | oui |
| ax Åland (FI) | own | 5 | 5 |  |  |  |  | oui |
| az Azerbaijan | generic | 5 | 4 |  |  |  |  | oui |
| ba Bosnia and Herzegovina | own | 5 | 5 |  |  |  |  | oui |
| be Belgium | generic | 5 | 5 |  |  |  |  | oui |
| bg Bulgaria | generic | 7 | 7 |  |  |  |  | oui |
| bh Bahrain | generic | 7 | 7 |  |  |  |  | oui |
| br Brazil | generic | 13 | 13 |  |  |  |  | oui |
| bs Bahamas | generic | 7 | 7 |  |  |  |  | oui |
| by Belarus | own | 18 | 18 |  |  |  |  | oui |
| ca Canada | generic | 0 | 0 |  |  |  |  | oui |
| ch Switzerland | generic | 11 | 11 |  |  |  |  | oui |
| cl Chile | generic | 15 | 12 |  |  | 3 |  | oui |
| cn China | own | 6 | 6 |  |  |  |  | oui |
| cy Cyprus | generic | 5 | 4 |  |  |  |  | oui |
| cz Czech Republic | own | 22 | 21 |  |  | 1 |  | oui |
| de Germany | own | 16 | 16 |  |  |  |  | oui |
| dk Denmark | own | 8 | 8 |  |  |  |  | oui |
| dz Algeria | own | 7 | 4 |  |  | 3 |  | oui |
| ee Estonia | own | 10 | 10 |  |  |  |  | oui |
| eg Egypt | own | 4 | 4 |  |  |  |  | oui |
| es Spain | own | 6 | 6 |  |  |  |  | oui |
| fi Finland | generic | 9 | 9 |  |  |  |  | oui |
| fr France | own | 17 | 17 |  |  |  |  | oui |
| ge Georgia | own | 12 | 12 |  |  |  |  | oui |
| gg Guernsey (UK) | own | 3 | 3 |  |  |  |  | oui |
| gi Gibraltar (UK) | generic | 4 | 4 |  |  |  |  | oui |
| gr Greece | own | 16 | 16 |  |  |  |  | oui |
| gu Guam (USA) | generic | 9 | 5 |  |  | 4 |  | oui |
| hk Hong Kong (CN) | generic | 2 | 2 |  |  |  |  | oui |
| hr Croatia | own | 11 | 11 |  |  |  |  | oui |
| hu Hungary | generic | 23 | 23 |  |  |  |  | oui |
| id Indonesia | generic | 7 | 7 |  |  |  |  | oui |
| ie Ireland | generic | 3 | 3 |  |  |  |  | oui |
| il Israel | own | 8 | 8 |  |  |  |  | oui |
| iq Iraq | own | 4 | 4 |  |  |  |  | oui |
| ir Iran | own | 16 | 15 |  |  |  |  | oui |
| is Iceland | own | 10 | 10 |  |  |  |  | oui |
| it Italy | own | 14 | 14 |  |  |  |  | oui |
| je Jersey (UK) | generic | 2 | 2 |  |  |  |  | oui |
| jp Japan | own | 4 | 4 |  |  |  |  | oui |
| ke Kenya | generic | 12 | 12 |  |  |  |  | oui |
| kg Kyrgyzstan | own | 12 | 12 |  |  |  |  | oui |
| kh Cambodia | own | 7 | 7 |  |  |  |  | oui |
| kr South Korea | own | 3 | 3 |  |  |  |  | oui |
| kw Kuwait | generic | 4 | 4 |  |  |  |  | oui |
| kz Kazakhstan | own | 18 | 18 |  |  |  |  | oui |
| la Laos | own | 9 | 8 |  |  |  |  | oui |
| li Liechtenstein | own | 9 | 9 |  |  |  |  | oui |
| lt Lithuania | generic | 9 | 9 |  |  |  |  | oui |
| lu Luxembourg | generic | 5 | 5 |  |  |  |  | oui |
| lv Latvia | own | 9 | 9 |  |  |  |  | oui |
| ma Morocco | generic | 2 | 2 |  |  |  |  | oui |
| mc Monaco | own | 4 | 4 |  |  |  |  | oui |
| md Moldova | own | 8 | 8 |  |  |  |  | oui |
| me Montenegro | own | 6 | 6 |  |  |  |  | oui |
| mk North Macedonia | generic | 8 | 7 |  |  | 1 |  | oui |
| mn Mongolia | own | 4 | 4 |  |  |  |  | oui |
| mp Northern Mariana Islands (USA) | generic | 6 | 2 |  |  | 4 |  | oui |
| mt Malta | generic | 6 | 6 |  |  |  |  | oui |
| mx Mexico | generic | 20 | 20 |  |  |  |  | oui |
| my Malaysia | generic | 4 | 4 |  |  |  |  | oui |
| nl Netherlands | generic | 27 | 26 |  |  | 1 |  | oui |
| no Norway | generic | 12 | 12 |  |  |  |  | oui |
| nz New Zealand | generic | 5 | 5 |  |  |  |  | oui |
| pl Poland | own | 12 | 12 |  |  |  |  | oui |
| ps Palestinian Authority | own | 6 | 5 |  |  |  |  | oui |
| pt Portugal | own | 4 | 4 |  |  |  |  | oui |
| qa Qatar | generic | 6 | 6 |  |  |  |  | oui |
| ro Romania | generic | 5 | 5 |  |  |  |  | oui |
| rs Serbia | own | 10 | 10 |  |  |  |  | oui |
| ru Russia | own | 23 | 23 |  |  |  |  | oui |
| sa Saudi Arabia | own | 6 | 6 |  |  |  |  | oui |
| sc Seychelles | generic | 9 | 6 |  |  | 1 |  | oui |
| se Sweden | generic | 8 | 8 |  |  |  |  | oui |
| sg Singapore | own | 13 | 13 |  |  |  |  | oui |
| si Slovenia | own | 4 | 4 |  |  |  |  | oui |
| sk Slovakia | own | 21 | 18 |  |  | 2 |  | oui |
| sm San Marino | generic | 13 | 13 |  |  |  |  | oui |
| su USSR | own | 15 | 15 |  |  |  |  | oui |
| th Thailand | own | 9 | 7 |  |  |  |  | oui |
| tj Tajikistan | own | 10 | 10 |  |  |  |  | oui |
| tr Turkey | own | 6 | 6 |  |  |  |  | oui |
| ua Ukraine | own | 19 | 16 |  |  |  |  | oui |
| uk United Kingdom | generic | 10 | 10 |  |  |  |  | oui |
| us USA | generic | 0 | 0 |  |  |  |  | oui |
| uz Uzbekistan | own | 9 | 9 |  |  |  |  | oui |
| va Vatican | generic | 6 | 5 |  |  | 1 |  | oui |
| vn Vietnam | own | 8 | 8 |  |  |  |  | oui |
| xx Non-recognized and partially recognized states | generic | 0 | 0 |  |  |  |  | oui |

## Catégories à trouver (par pays)

Pour chacune : trouver une plaque réelle sur le site, la saisir, puis relancer le contrôle. Le remplissage du build dev (`Fill missing plates`) le fait.

## À vérifier sur le site : espaces

Le script lit les mêmes caractères que le texte de la galerie, mais avec d'autres espaces (EL 557CP au lieu de EL5 57CP). La recherche du site garde les espaces (D09003 ne trouve pas D 09 003) mais traite le tiret comme un espace. Le build dev, boîte « Verify the reads », demande au site si chaque lecture est trouvée.

- **la** Diplomatic (1/3) : `ຂຕ-1192` lu `ຂຕ11-92`, `ຂຕ-1777` lu `ຂຕ17-77`

## Limites connues du formulaire

Plaques de galerie que le formulaire d'ajout du site ne peut pas écrire exactement, avec la cause. Ce n'est pas une règle à corriger.

- **az** Foreign citizens and enterprises (0/3) : Le formulaire de l'Azerbaïdjan n'a pas ce type : sa plaque (H 014401, une lettre et six chiffres) ne peut pas y être écrite.
- **cy** Trailers (2/3) : Une plaque sur trois (14001 CT) n'a pas la forme P 12345 que le formulaire produit.
- **ir** Disabled (0/3) : Le texte de galerie écrit une lettre (ژ) là où le formulaire met le symbole du fauteuil roulant.
- **ps** Dealer (0/3) : Le menu du premier chiffre n'a que 1 à 9 : la plaque 62-100-76 (deux chiffres) ne peut pas y être écrite.
- **sc** Ambassador, chief of diplomatic mission (0/3) : Le texte de galerie (S 16958) ne contient pas les lettres que le formulaire ajoute (CD).
- **sc** Government (0/3) : Le texte de galerie (S 13069) ne contient pas les lettres que le formulaire ajoute (GS).
- **sk** Sportcars (AB S(A)123) (0/3) : Le code AA des plaques (AA S 009) n'est pas dans le menu de région du formulaire.
- **th** Private owners (2/3) : Le menu de la première lettre n'a pas le ฒ : la plaque 4ฒฆ 5147 (une sur trois) ne peut pas y être écrite.
- **th** Vanity Plates (1/3) : Le menu de la première lettre n'a pas le บ : les plaques บพ 9595 et บว 9988 ne peuvent pas y être écrites.
- **ua** Government agencies (2/3) : IM (2 plaques sur 3 passent) : le code IM de la plaque 'IM 113 G' n'est pas dans le menu de région du formulaire.
- **ua** Cars and trucks (1995) (0/3) : La plaque a trois groupes de chiffres (14 296-45 TA) ; le formulaire n'a que deux champs de chiffres.
- **ua** Public transport (1995) (0/3) : Même cause : trois groupes de chiffres (04 000-06 AA), deux champs dans le formulaire.

## Galerie vide sur le site

Aucune photo dans la galerie de ces catégories : il n'y a pas de plaque à utiliser. À revérifier de temps en temps.

- **cl** : Shared taxis (AB-12-34), Special airport taxis and tourist vehicles (AB-12-34), Buses (AB-12-34)
- **cz** : Diplomatic (2001)
- **dz** : Police ((1)11111), Protection Civile ((111)111111), Military (111111111)
- **gu** : Commercial vehicles (2008), Amateur Radio, Motorcycles (M1234), Mopeds (MP1234)
- **mk** : Vanity Plates
- **mp** : Heavy Equipment, Vanity Plates, Amateur Radio, Motorcycles
- **nl** : Dealer (Scooters)
- **sc** : Dealer
- **sk** : Sportcars (S(A) 123AB), Agricultural vehicles (F(A) 123AB)
- **va** : Dealer (PROVA SCV)

## Sans champ de plaque dans le formulaire

Catégories dont le formulaire n'affiche aucun champ où taper la plaque. Il y en a eu cinq (Bosnie, Croatie, Italie 2, Portugal), qui avaient en fait des champs que l'outil ne connaissait pas (pol1, num1, mb1, mnum1...) : ils sont maintenant lus.


## Vérifiées à la main sur le vrai site

39 plaques tapées dans le formulaire du site, que la vérification a trouvées : MZ MZ 78 [de] · 1-CVX-965 [be] · 2649 HSM [es] · 94-PV-55 [nl] · KX-484-N [nl] · RO62OUK [uk] · CJ 54 HAI [ro] · 40 H 944 MB [uz] · 01 H 010229 (Foreign citizens) [uz] · KR PV-081 (Oldtimers) [hr] · OS PP-178 (Dealer) [hr] · 50 SB 095 [tr] · 7717XZ 07 [tj] · A 001 AA 77 [ru] · у 007 ут 198 (Cars) [ru] · BMR 001 [md] · GU 213 JX [at] · CNA 32756 [pl] · K0 069U (Sportcars) [pl] · W 016600 (Diplomatic) [pl] · IAZ 6038 (Trucks) [gr] · KZT 7722 (Cars) [gr] · ITI-9245 (Cars) [gr] · TAE 1009 (Taxi) [gr] · 70144 د 8 [ma] · 47A 271.12 (Cars) [vn] · 80A-039.27 (Government and public administrations) [vn] · OO-442 VR (Trailers) [rs] · 山梨 336 な 718 (Private owners) [jp] · 1133 Ф4 (Military (2004)) [ua] · ทห 7776 (Taxi) [th] · ۵۱ت۱۶۵ ۲۲ (Taxi) [ir] · 경기50바 4521 (Commercial vehicles) [kr] · ກທ 5868 (Military) [la] · 7073 УН (Special machinery) [mn] · PC 9090 A (Buses) [sg] · MBG-133-A (Cars (AAA-000-A)) [mx] · 3273 JRS (Cars) [sa] · ١٤٦٩ رقج (Cars (2008)) [eg].

La vérification de plaque cherche le **texte de la plaque** sur le site, sans la catégorie : pour un formulaire sans menu de type (Pays-Bas, Mexique, Singapour...) elle fonctionne donc, même si la catégorie ne peut pas être prouvée hors ligne.

## Pays non capturés

Aucune page sauvegardée : ni catégories, ni règle. Capturer avec le build dev (tiroir *Dev*, `Capture`).


