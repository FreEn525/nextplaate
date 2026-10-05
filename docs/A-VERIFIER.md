# Plaques à vérifier à la main sur le site

Généré par `python tools/hand_check.py`. Pour chaque ligne : ouvrir `platesmania.com/<pays>/add`, choisir la catégorie dans le menu de type, remplir les champs comme indiqué, ouvrir le tiroir **Search** (loupe) : la vérification de plaque doit dire que la plaque est déjà sur le site (1 photo ou plus). Un champ « écrit par le site » est grisé : on n'y touche pas.

| Pays | Catégorie | Plaque | Comment la saisir |
|---|---|---|---|
| ru | Cars | `у 007 ут 198` | `b1` menu : Y ; `digit` champ : 007 ; `b3` menu : Y ; `b4` menu : T ; `region` menu : 198 → la vérification lit `Y 007 YT 198` |
| gr | Taxi | `TAE-1009` | `region` menu : TA ; `b1` menu : E ; `digit` champ : 1009 → la vérification lit `TAE 1009` |
| jp | Private owners | `山梨 336 な 718` | `region` menu : Yamanashi - 山梨 ; `code` champ : 336 ; `hiragana` menu : な ; `d2` menu : 7 ; `d3` menu : 1 ; `d4` menu : 8 → la vérification lit `山梨 336 な 718` |
| pl | Diplomatic | `W 016600` | `dip` = W (écrit par le site) ; `region` menu : 016 ; `digit` champ : 600 → la vérification lit `W 016600` |
| ua | Military (2004) | `1133 Ф4` | `digit1` champ : 1133 ; `mil_b1` menu : Ф ; `mil_b2` menu : 4 → la vérification lit `1133 Ф4` |
| th | Taxi | `ทห 7776` | `reg1` menu : The first letter in the name of province ; `b1txc` menu : ท ; `b2` menu : ห ; `digit` champ : 7776 → la vérification lit `ทห 7776` |
| ir | Taxi | `۵۱ت۱۶۵ ۲۲` | `d1` menu : ۵ ; `d2` menu : ۱ ; `let` = ت (écrit par le site) ; `d3` menu : ۱ ; `d4` menu : ۶ ; `d5` menu : ۵ ; `region1` menu : ۲۲ → la vérification lit `۵۱ت۱۶۵ ۲۲` |
| kr | Commercial vehicles | `경기50바 4521` | `region` menu : 경기 (Gyeonggi Province) ; `digit1` champ : 50 ; `let2` menu : 바 ; `digit` champ : 4521 → la vérification lit `경기50바 4521` |
| la | Military | `ກທ 5868` | `dop` = ກທ/ (écrit par le site) ; `dop1` champ : 5868 → la vérification lit `ກທ5868` |
| mn | Special machinery | `7073 УН` | `digit` champ : 7073 ; `region` menu : УН - Ulan Bator City → la vérification lit `7073 УН` |
| sg | Buses | `PC 9090 A` | `let` champ : PC ; `dig` champ : 9090 ; `checksum` champ : A → la vérification lit `PC 9090 A` |
| mx | Cars (AAA-000-A) | `MBG-133-A` | `drop_1` menu : Aguascalientes ; `nomer` champ : MBG-133-A → la vérification lit `MBG-133-A` |
| hr | Dealer | `OS PP-178` | `region` menu : OS ; `special` = PP (écrit par le site) ; `digit` champ : 178 → la vérification lit `OS PP-178` |
| uz | Foreign citizens | `01 H 010229` | `region` menu : 01 ; `b1` = H (écrit par le site) ; `dig2` champ : 010229 → la vérification lit `01 H 010229` |
| lv | Dealer | `B 1122-6` | `b1` menu : B ; `digit` champ : 1122 ; `digit2` champ : 6 → la vérification lit `B 11226` |
| sa | Cars | `3273 JRS` | `d1` menu : ٣ / 3 ; `d2` menu : ٢ / 2 ; `d3` menu : ٧ / 7 ; `d4` menu : ٣ / 3 ; `b1` menu : ح / J ; `b2` menu : ر / R ; `b3` menu : س / S → la vérification lit `3273 JRS` |
| eg | Cars (2008) | `٣٦٢١ جىر` | `d1` menu : ٣ ; `d2` menu : ٦ ; `d3` menu : ٢ ; `d4` menu : ١ ; `b1` menu : ج ; `b2` menu : ى ; `b3` menu : ر → la vérification lit `٣٦٢١ جىر` |
| vn | Government and public administrations | `80A-039.27` | `region` menu : 80 ; `mm` champ : A ; `digit` champ : 039.27 → la vérification lit `80A 039.27` |
