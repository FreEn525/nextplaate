# Changelog

## 5.9 (in progress)

**Series counter**
- New feature *Series counter* (switch in Settings), for the French plates (the shape was checked on the real site; other countries join once their pages are checked): in the plate card of the upload page, how many photos of the series of the plate you already have (HF-137-QQ is in the series HF-*-QQ), a link to them; on a series page of the site, how many of its numbers are on the site, which ones, and how many photos of the series you have. One request each, through the shared queue.

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
