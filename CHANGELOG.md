# Changelog

## 5.7

**Plate check**
- Last rules: Israel (letters written by the site before or after the number), Italy (dealers, road machinery), Kyrgyzstan (diplomatic), Kazakhstan (foreigners, military), Georgia (test plates), Portugal (National Republican Guard), Germany (oldtimers), Switzerland, Gibraltar, Thailand, Åland, Denmark, Monaco, Mongolia, Slovenia.
- Spaces: the site's search keeps the spaces of a plate (a dash counts as a space), so the plate is now read with the spacing of the gallery: Armenia, Kazakhstan 1993, Soviet Union (new rule), Czechia (older types), Tajikistan, Laos, Vietnam motorcycles, Latvia dealers, Guernsey dealers, Iceland and Åland vanity plates (a blank box is a space), Germany seasonal, China trailers, Iran motorcycles, Palestine authorities; Russia diplomatic letter D is searched as *.
- 795 of the 829 categories are now checked offline on real plates, none is left to fix. 12 more are plates the site's own form cannot write exactly (listed with their cause in `data/limits.json`), and 22 have an empty gallery on the site.

## 5.6

**Plate check**
- Rules for the forms that mix several kinds of fields: Mexico, Australia, Canada, UAE and USA (the state menu is no longer read as part of the plate), Singapore (the check letter), Netherlands and Malaysia (free text), Mongolia, Cambodia, Russia (diplomatic plates), Czechia (electric vehicles, 1977 trailers), Slovenia, Åland, Denmark, Montenegro, Monaco, Kazakhstan, Morocco, Croatia (police), Bosnia, Italy, Portugal.
- Greece: the two-letter code, then the letter (KZT, TAE, IAZ).
- Plates that exist in a category the upload form does not offer (Chile, Georgia, Cyprus...) are now read in the closest type of the form.
- 785 of the 829 categories of the site are checked offline on real plates (2320 of 2373 read back exactly); 22 plates were also checked by hand on the site. `docs/COUVERTURE.md` lists what is left and the known limits of the site's own form.

**Under the hood**
- `docs/REGLES.md` explains how to fix a rule; tools in `tools/`.

## 5.5

**Settings**
- New Settings drawer (gear icon): each feature can be switched off. A switched-off feature has no controls, no key and no Esc step; what depends on it goes off too (descriptions need the location and hashtags).

**Plate check**
- Greece: cars and most types read the two-letter code then the letter (KZT, ITI), trucks too (IAZ), taxis the letter then the code (TAE).
- Plate rules for many more countries: the plate read from the upload form now matches what the site shows for about 680 of its 829 categories (checked offline on 2188 real plates from the galleries, 93 % read back exactly). New or fixed rules include Russia, Greece, Croatia, Poland, Ukraine, Serbia, Germany, Slovakia, Uzbekistan, Tajikistan, Latvia, Belarus, Albania, Armenia, Åland, Japan, Korea, Vietnam, Thailand, Laos, Iran, Egypt, Saudi Arabia and Iraq.
- Letters that the site writes itself in a grey field (ΞΑ, AM, E.A., FL, ZV...) are now part of the plate that is searched.
- Russian plates: the menus use the Latin look-alike letters, the galleries the Cyrillic ones; the check now accounts for it.

**Batch upload**
- Less memory: the previews in the batch window are 720 px wide instead of 1400 (a decoded picture takes four times less memory), which avoids the "Out of Memory" page crash with large batches.
- The plate type menu is found in Andorra and Malta (`drop_2`) and the Netherlands (no type menu) no longer gives an error.

**Under the hood**
- Source split into small files (one file per country for the plate rules); faster tests; data collected from the site organised in `data/`, with a coverage report in `docs/COUVERTURE.md`.
- The dev build keeps its own name ("NextPlaate (dev)") on Windows copies too.
