# Third-party material

The icons in src/ui/00-icons.js are from Lucide (https://lucide.dev), licence ISC: Copyright (c) Lucide Contributors 2022, and portions Copyright (c) Cole Bemis 2013-2022 (Feather, MIT).
- Keyboard icon: Lucide (ISC).
- Car and grid icons: Lucide (ISC), as above.

The plate count reads the same gallery search as the "Notification Doubles Plaques" script (MIT, https://greasyfork.org): the regular expression for the count was taken from it.

The way the Google Lens search is started (the script puts the photo in the "paste an image link" box of Google's search by image, on a page it opened, and starts the search) and the selectors of that box and its button come from the userscript "Platesmania → Google Lens" (Greasy Fork script 535713, MIT, https://greasyfork.org/scripts/535713). The code is rewritten in src/features/66-lens-google.js, with the rest of the Lens feature (the bridge between the two sites, the reading of the results, the card) written for this project.

The names of the plate codes in src/lib/regions-codes.js (Germany, Poland, Czech Republic) come from Wikidata (property P395, licence CC0), fetched with tools/wikidata-codes.py; the units that towns lie in (property P131, same licence) with tools/wikidata-parents.py; their coordinates (P625) and the names of the countries (for the diplomatic plates), same licence.
