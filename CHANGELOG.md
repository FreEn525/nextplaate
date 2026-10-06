# Changelog

## 5.11

**World map**
- New feature *World map* (switch in Settings): a window like the batch window (key `G` for globe, or Browse > World map, or the button of a profile) with the world as an SVG and the countries a member has photos from filled in five shades of the panel's blue (1, 2-9, 10-49, 50-199, 200 and more photos). Each country is a link to the member's photos of it, with its figures as the hover text; the small countries the map has no shape for are dots; USSR and the non-recognised states are listed under the map, and a list of all the countries is there for the keyboard. The wheel zooms at the pointer, a drag moves the map, buttons zoom by steps and go to the world or to Europe. The map has a tinted sea, a darker land where there is no photo and a ramp of blues that starts clearly blue. It shows yours, or anyone's: a box takes a member number or the link of a profile, and the members you saved are one click. The figures are those of the member's profile (one page, or none when you are on it), read through the shared queue.
- **The regions of a country, on a map** (in the same window): under the map of the world, *Regions of: Choose a country...* lists the countries where the member has photos and a map exists (28 countries: France with its departments, Russia, the United States, Turkey, Serbia, Italy, Romania, Thailand...). A choice draws the regions of that country shaded by the member's photos, with the same zoom and drag; each region with photos is a link to the member's photos of it; the regions that find no shape are listed under the map with their photos; the licence of the shapes is shown. The shapes are fetched when you choose a country, from geoBoundaries (CC-BY 4.0, an open public API): nothing is shipped in the script. The regions and the photos come from the site's region statistics (one page per system of the country), matched to the shapes by name, then by ISO code. A country is offered only where at least seven regions in ten find their shape (measured by `tools/measure-regions.py`); the others keep the table of their regions.
- **Fix**: the region statistics of the countries with no code column (Serbia, Turkey, Vietnam, Uzbekistan...) were read with the name in the wrong place; *Profile: regions* now reads both layouts.
- Developer build: new tool *Regions collection* (dev drawer) reads the region table of every country (about 90 requests, through the shared queue) and writes the pages to a folder, to match the regions of each country with the shapes of a map offline.
- The map is Natural Earth data (public domain, through the world-atlas package), built by `tools/build-worldmap.mjs` into `src/lib/worldmap.js`.

**Keys**
- Every key is now named as printed on *your* keyboard (read from the real layout): the world map was first bound to the physical M key, which prints a comma on AZERTY, so it is now **G** (the same place on QWERTY, AZERTY and QWERTZ). Every text that names a key (*Select photos (S)*, *Fill description (F)*, *Like ... (L)*, *Choose photos & countries (U)*, *Open the world map (G)*, the tooltips of the bar, the messages that say *press R*) now follows the key you chose in Shortcuts instead of a fixed letter, and the Shortcuts list is checked to hold every key of the script.

## 5.10.1

**The brand and model box**
- The site's text box *Specify brand and model of vehicle* keeps its own autocomplete but looks like the rest: a short label (*Brand and model*), a full-width 38 px field with a placeholder (*Type a brand or a model, for example Golf*), a clear button inside the field instead of the bold X, a hint under it, and the list of suggestions styled to match.

**The plate card, calmer**
- **The plate card in labelled sections**: *On the site* (the vehicle the photos show, with its *Fill the menus*, and the link to the photos), *Official register* (NL, IL, with the source in its title), *Your photos* (a sentence: *In the series HF-*-QQ: you have 2 photos*) and the lookup sites folded under one line (*Look up this plate on other sites (13)*) instead of thirteen buttons at once. *Your photos of this vehicle* reads *Brand Nissan: 4 · Model Qashqai: 2*, brand first. A stray word *null* after the register answer is gone.

## 5.10

**The panel in the order of use, every feature explained**
- The bar now follows the order of use: *Check a plate*, *Send photos*, *Describe a pair*, *Browse*. Every box of the working drawers says in one sentence what it is for, and describing a pair is four numbered steps (choose the photos, your details, the description, the automation).
- Settings gives, for each feature, what it does and where it works (every country, 84 countries, Netherlands and Israel...); the text is in `src/lib/featureinfo.js` and a test checks every feature has one.
- *Fill description* now works without a chosen pair: it writes your place and hashtags, never over a text that is already there, and never by itself (the automatic fill still needs a pair).
- Lighter at load: the long lists of the drawers nobody sees until they open it (the country flags of the panel, the flags picker of Settings) are now built on the first opening instead of at page load: half the elements of the panel (1141 to 553), the build of the bar twice as fast, and 190 flag images no longer requested at load. A card that plays on the upload page costs about 45 ms in all (2 ms on a gallery), with no work while idle.
- **The page /add** (choose a country): the site's drop-down and button become a card of large flags (40 px) with a search box by name or code (Enter opens the first match) and the countries you opened last at the top. The list is the site's own menu, so a country without a page is never offered; the site's box is only hidden. The other upload pages keep the side bar of flags.
- **The official register by itself**: the open registers of the Netherlands and Israel are public data, so they are asked as soon as the plate check has read the plate (before: on a click), and the menus that are all empty are filled from the answer, once per plate (a choice of yours is never overwritten). Two switches in Settings, *Official register*, restore the click-only behaviour or stop the filling.
- **The Google Lens card** reads top to bottom: *Best match* (the vehicle in one line, with the one button *Fill the menus*), *Google calls it* (the names Google gives, a click types one in the site's brand and model box), then *Not right? Pick another* (the choices of the three menus, at a sensible width instead of the whole page). The line of text under the title is shorter.
- **The batch window (key U)**: the two steps are numbered above the countries (1 click the photos, 2 give the selection a country); the country chips sit side by side at their own width instead of one wide line each; an empty list shows a clear *No photos yet* card with *Add photos* and *Add a folder* in reach; a photo without a country says *No country* instead of a question mark.
- **Update from the logo**: a click on the logo of the panel asks Greasy Fork for the header of the published script and compares its version with yours (numbers, so 5.10 is newer than 5.9.1). A newer one: *Update now* opens the install page, where Tampermonkey offers the update. Only on the click; the dev build says it is updated by building it again.
- **The flags box in the same place on every screen**: where there is room beside the content it stands there (the room now counts the drawer only while it is open); where there is none (a smaller screen, a profile), it is a tab *Add a photo in...* at the right edge, next to the panel, that opens the same box (Esc or a click elsewhere closes it), instead of a box under the profile photo. It follows the drawer when one opens.
- **Fix**: a gallery of more than 999 photos (the site writes `38.723`, with a dot) is counted: the *Uploads* card of a profile no longer says *Not counted*, and the plate check reads such counts too.
- *See the N photos of this plate on the site*: a link in the plate card to the site's own search of the plate, to see the photos already there.
- The *What's new* window shows everything newer than the version you last saw, newest first.

## 5.9.1

**Fix**
- A long label in a list of choices (the lookup sites in Settings) wraps instead of widening the drawer on a narrow screen. A fix version does not open the *What's new* window.

## 5.9

**What's new window and signature**
- After an update the script opens a *What's new* window once, in plain words (what each new thing does and where it is); it is also in Settings > About, which carries the signature © 2026 NextEnzzo with a link to the author's profile. A first install shows nothing. The text is in `src/lib/whatsnew.js`, and a test fails if `@version` is bumped without its entry.

**New logo**
- A round camera with a plus, in three blues, in the panel and as the script's icon. The icon in Tampermonkey and Greasy Fork is now the real logo (optimised to 4.5 KB, pixel for pixel the same at icon sizes) instead of a simplified drawing. In the panel the logo has its own cell with a line under it, so it no longer sits against the member's picture.

**Fix**
- Typing in a text field that sits in a card or bar of the script (the country search of the flag bar, for example) no longer triggers the shortcut keys: `U` no longer opens the Batch upload drawer while you type. The key handler now looks at the control that has the focus through every shadow root.

**Developer build**
- New tool *Series check* (dev drawer): for two real plates per country (91 countries), it builds the series search the feature will use (the longest run of digits becomes a wildcard: HF-137-QQ is `HF * QQ`, `01 A 123 ZZ` is `01 A * ZZ`), asks the site, and records whether the plate comes back; countries where it does are then switched on for the series counter.
- New tool *Series collection* (dev drawer, not in the published script): for the 55 countries whose pages link a table of series, it reads the table, one series page and the site's own wildcard search with your member number, through the shared queue (about three requests per country, it carries on where it stopped), keeps them in the browser and writes them to a folder, to build the series feature for more countries offline.

**Official register (Netherlands, Israel)**
- New feature *Official register* (switch in Settings): for Dutch and Israeli plates, a button in the plate card asks the country's open register (RDW open data; the Ministry of Transport's data.gov.il), both free, with no key, and answering to a page of another site. It shows make, model, year, colour and the end of the inspection, and for the Netherlands *Fill the menus* compares the make and model with the site's menus. The plate is sent to the register only when you click; the answer is kept for the visit.

**Plate lookup links**
- Three more universal image searches that are open or free (Wikimedia Commons, DuckDuckGo Images, Yandex Images), GOV.UK MOT history for the United Kingdom and Carjam for New Zealand.

**Series counter**
- New feature *Series counter* (switch in Settings), for 84 countries: in the plate card of the upload page, how many photos of the series of the plate you already have (HF-137-QQ is in the series HF-*-QQ, `AA 7181` in `AA *`), a link to them; on a series page of the site, how many of its numbers are on the site, which ones, and how many photos of the series you have. The series of a plate is its search with the longest run of digits as a wildcard. It is on only where the dev tool *Series check* found two real plates again on the real site (all but bh, eg, ir, ke, qa, sa, which write digits in Arabic or Persian or have plates of digits only, and ch, not sure). One request each, through the shared queue.

**Profile: regions**
- New feature *Profile: regions* (switch in Settings): on a member's profile, a button reads the site's region statistics page (nothing is asked on loading the profile) and shows how many regions (departments, districts, states...) of a country the member has a photo from, with a bar, each region seen as a link to those photos, and the list of the missing ones. The menu of countries comes from the page itself (no list in the script) and each country is asked once.

**Your photos of this vehicle**
- New feature *Your photos of this vehicle* (switch in Settings): on the upload page, under the brand / model / generation menus, a card says how many photos of that brand, that model and that generation you already have, each number a link to those photos. It follows the menus however they were filled (by you, the plate check or Lens). Counts come from your own gallery filtered on the vehicle, through the shared queue (most precise level first) and are kept for the visit.

**Profile: real uploads**
- New feature *Profile: real uploads* (switch in Settings): on a member's profile, a card with the real total of the gallery and the uploads of the day. The figure the profile shows is a statistic the site recalculates from time to time (its (+n) runs since that calculation, not since today), so the card reads the member's gallery, which is live: the whole gallery, and the day from 03:30 local time to 03:30 the next day, and says how far the profile figure is. Two requests, through the shared queue.

**Plate lookup links**
- New feature *Plate lookup links* (switch in Settings): for the plate you type, a link to each public lookup page of the country (Finnik, car.info, carcheck-type sites... about forty), and to a picture search (Google Images, Flickr, Autogespot), each writing the plate the way that site wants it. In the plate card above the vehicle menus and in the Search drawer. They are plain links opening a new tab: nothing is sent before a click and the script reads nothing from those sites. Each site can be hidden in Settings.

**Extra information**
- The card offers the date of the photo: the site lists the EXIF dates under the photo it is given, and the earliest is the shot; two buttons add it on a line of its own (*Date: October 2026*, *4 October 2026*).

**Floating upload button**
- New feature *Floating upload button* (switch in Settings): the form is long and its Upload button is at the very end. While that button is out of view, a button of ours stands at the bottom of the window and presses the site's own, so the form's checks and options apply as before; it goes away when the real button is on the screen.

**Google Lens**
- The Google side now also reads what Google itself calls the vehicle (the "similar searches" chips of Lens, read from their addresses, so in any language), next to the titles of the results. What Google names counts as five titles when the card guesses the brand, model and generation, and a *Google says* line shows the names: a click types one in the site's own "brand and model" box, which finds the vehicle itself (the way out when the page's menus do not name it). Without such chips, the titles decide as before. The dev build logs what was found on the Google page. A Google search is only taken for the answer when it carries Lens parameters (an images search opened by hand is left alone).

**Plate check**
- The vehicle of the photos already on the site is offered above the vehicle menus: the page that counts the photos of a plate also names the vehicle of each one (as the numbers of the form's menus); the most common is shown with the names of the menus themselves (*Volkswagen › Golf › Mk8, 2019–*, *2 of 3 photos*) and one click fills the menus. Nothing is filled before the click, and no request is made for it. A vehicle the menus do not know is not offered.

## 5.8

The biggest release since the panel: **six new features** and a new look.

New features: Google Lens (now automatic, with the answer as brand, model and generation), Tag picker, Extra information box, Plate preview as you type, Country flags, and Member shortcuts (with your own picture in the bar). Settings gains the choice of the countries of the flag bar. All of them have a switch in Settings.

Behind them: one design system taken from PlatesMania's own colours (square corners, one scale of sizes), and reusable parts (a bridge to another site, a vehicle catalogue, an inline card, a window). New permissions: `GM_setValue`, `GM_getValue`, and the script also runs on `www.google.*` and `lens.google.com` (it only acts there for a search the panel asked for): Tampermonkey may ask you to confirm the update.

**Member shortcuts**
- New feature *Member shortcuts* (switch in Settings): the profiles of members you go to often, each with its picture and name; a click goes to the member's page. You are always the first line (read from the site's top bar; your picture is kept from your own page), which cannot be moved or removed. On a member's profile the list stands to the left of the content, level with the profile picture (the flags are on the right); on a narrower screen it moves under the picture. The same list is in the Gallery drawer of the panel.
- Looking stays clean: only the lines. A star in the title saves the member of the page (or takes them off; not offered on your own page), and with more than eight members a box finds one by typing. *Edit* (then *Done*) adds a grip to each line to drag it (a bar shows where it lands, never above you; or focus the grip and press Up / Down), a cross to remove it, and a box to add a member by number or by the link of their page (read once through the script's own queue). Editing is the same in the panel and on the page. A shortcut's picture and name are refreshed when you visit the member.
- Your own profile picture is also in the panel's bar, under the logo, in a circle the size of the bar buttons with the blue ring of the rest; a click goes to your page, and the ring is stronger when you are on it. Nothing is shown when nobody is logged in.

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
