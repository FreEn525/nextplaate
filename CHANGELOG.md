# Changelog

## 5.8

**Extra information**
- New feature *Extra information box* (switch in Settings): the site's small three-line box becomes a tall card in the look of the panel, large from the start, growing with what you type, with the site's own hint, a character count, and a button to insert the location saved in Details (*Use my location*). It sits above the tags card with a clear space between the two (every card now has one). The site's own box stays the source of truth (hidden, and filled as you type), so the form is sent as before; switching the feature off brings it back.

**Tags**
- New feature *Tag picker* (switch in Settings): the site's "Add tags" section (a closed accordion with a list to scroll and a + to press for each of the 52 tags) is replaced by a card: every tag is a button, grouped like the site groups them; a search box finds a tag by typing (Enter chooses the first match); what is chosen shows as chips you remove with one click, with a Clear button; the tags you use most and the ones of your last upload are one click away (*Use again*). The site's own check boxes stay the source of truth, so the form is sent exactly as before and the site's own counter keeps working. Switching the feature off brings the site's section back.
- The same picker replaces the site's pop-up on a photo page: the *add tags* / *edit tags* link opens a window in the look of the panel (new reusable window component) with the tags the photo already has marked. *Save* presses the site's own Save button, so the site saves the tags exactly as before; *Cancel*, the cross, Esc and a click outside give the boxes back as they were. The window never goes under the panel's rail.

**Plate preview**
- New feature *Plate preview as you type* (switch in Settings): the site's "Generate preview" button is pressed for you 0.7 s after you stop typing, so the preview of the plate is always there and follows the fields. It is the page's own request (the script only clicks its button): never two less than 2 s apart, nothing while a preview is loading, while there is no plate yet, or while the one shown is up to date.

**Country flags**
- New feature *Country flags* (switch in Settings): the flags of the 96 countries with their names, each a link to that country's upload page, and a box to find a country by name or code. In Settings (*Country flags: the side bar*) you choose which countries the side bar shows (all by default; the bar follows at once, and the choice is kept). The panel always lists all of them. They are in the Batch upload drawer and, on the upload pages (`/add` and `/xx/add`) and on a member's profile (`/user<id>`), right on the site: to the right of the page content when the screen has room (never under the panel, even with its drawer open), else under the photo in the right-hand column. The flags are the site's own images.

**Look**
- The panel, the Lens card and the batch window now use the colours of PlatesMania itself (its blue `#4765a0`, hover `#324c80`, light `#cad9f6`) through one set of design tokens, with one button height scale, one radius and one focus ring. Square corners like the site, and no coloured rule on the blocks. No colour is written outside the tokens (a test checks it). See `docs/STYLE.md`.

**Google Lens**
- A photo chosen on the upload page is searched on Google Lens by itself, in a background tab (option *Search each new photo by itself*, on by default). The button *Search this photo on Google Lens* does the same on demand, also on a photo page.
- The answer appears in a card right under the photo of the upload page, and in the Search drawer at the same time (so you do not have to keep the drawer open): three choices for each, the first one highlighted. A click on a choice fills the site's menus, and *Fill with the first choices* fills the three at once. Nothing is filled until you click. The titles of the Lens results are compared with PlatesMania's own menus (brands, models, generations). No paste box, no prompt to copy.
- How: the panel saves the photo (its address, or the photo itself while it is not published) and opens Google; there the script puts the photo in Google's "paste an image link" box, starts the search, then writes down the titles of the results for the panel. It only does this for a search the panel asked for. This needs `GM_setValue` / `GM_getValue`, and the script now also runs on `www.google.*` and `lens.google.com` (it stops at once there unless the panel asked): Tampermonkey may ask to confirm the update.
- Picking a choice redoes the guess around it: the models of the picked brand, the generations of the picked model, so a generation never puts the model back to another one. A short model name inside a longer one (Gol in Golf) is no longer offered as a second choice. The choices are clickable in the drawer too, and the card and the drawer table stack their columns when the place is narrow.
- The Google tab that the search opened is closed as soon as the results are read (it stays open when nothing comes back, so you can see the page).
- The panel fits its drawer, down to a 320 px phone: long labels wrap and button rows wrap instead of widening it (a test opens every drawer at four widths).

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
