  /* =====================================================================
   *  FEATURE INFO  (what each feature is for, and where it works: shown in Settings, one place to read and to keep true)
   *    about: one plain sentence, for someone who has never seen the script. scope: the countries or pages it works for.
   *    A feature with a switch in Settings must have an entry here (a test checks it).
   * ===================================================================== */
  const FEATURE_INFO = {
    selection: { about: 'Pick the front photo and the rear photo of the same vehicle in a gallery. Step 1 of describing a pair.', scope: 'every gallery' },
    details: { about: 'Your place and hashtags, written once. They head every description the script writes.', scope: 'everywhere' },
    description: { about: 'Writes the description of a photo on its edit page: your details, then the other side of the pair as a link and a thumbnail. Without a pair it writes your details only.', scope: 'every country' },
    likes: { about: 'Likes a gallery page, or several pages in a row, with a pause between likes.', scope: 'every gallery' },
    pages: { about: 'Previous and next gallery page from the keyboard.', scope: 'every gallery' },
    plate: { about: 'As you type a plate on the upload page: how many photos of it are already on the site, the vehicle of those photos, and your photos of its series.', scope: 'all 96 countries and 829 plate categories (795 checked exactly on real plates)' },
    shortcuts: { about: 'Change any key of the script. Safe for AZERTY keyboards.', scope: 'everywhere' },
    lens: { about: 'Searches the photo you chose on Google Lens by itself and suggests brand, model and generation; a click fills the menus.', scope: 'every country' },
    flags: { about: 'A flag and a name for every country, each a link to its upload page. On the page /add the site’s drop-down becomes large flags with a search box (Enter opens the first match). Elsewhere a side bar; pick which countries it shows.', scope: 'every country' },
    preview: { about: 'Presses the site’s Generate preview button for you when you stop typing the plate.', scope: 'every country' },
    tags: { about: 'Replaces the closed Add tags box (and the pop-up on a photo) with buttons by group, search, your most used tags and the ones of your last upload.', scope: 'every country' },
    extra: { about: 'A tall card for the extra information, with your saved place and the date of the photo one click away.', scope: 'every country' },
    members: { about: 'The members you visit often, with picture and name, one click to their page.', scope: 'everywhere' },
    floatupload: { about: 'The Upload button follows you at the bottom of the page while the site’s own button is out of view.', scope: 'every upload page' },
    lookup: { about: 'For the plate you type: links to public lookup sites (open or free image searches, plus official sites by country). Nothing is sent before you click.', scope: 'every country, with their own sites for 14' },
    profile: { about: 'On a member’s profile: the real total of the gallery and today’s uploads, next to the figure the site only updates from time to time.', scope: 'every member' },
    mine: { about: 'Under the vehicle menus: how many photos of that brand, model and generation you already have.', scope: 'every country' },
    regions: { about: 'On a member’s profile: which regions of a country the member has a photo from, and which are missing.', scope: 'every country the site has regions for' },
    series: { about: 'How many of your photos are in the series of the plate you type (HF-137-QQ is in HF-*-QQ); on a series page, the numbers already on the site.', scope: '84 countries (checked on the real site)' },
    registry: { about: 'Asks the country’s open register (public data) for make, model, year and colour, and fills the menus that are still empty. Only the plate is sent; two switches in Settings turn it off.', scope: 'Netherlands and Israel' },
    worldmap: { about: 'The countries a member has photos from on a map of the world, shaded by how many photos. Yours, or anyone’s: type a number or paste a profile link. For many countries, the regions too (departments, districts, states).', scope: 'every member (the regions: 30 countries)' },
    upload: { about: 'Queue many photos (or a folder), give each a country and a plate category, and send them one tab per photo with a pause between.', scope: 'every country' }
  };
