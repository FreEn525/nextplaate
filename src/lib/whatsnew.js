  /* =====================================================================
   *  WHAT'S NEW  (the text of the window shown once after an update, and from Settings > About)
   *    One entry per version that has something to show, newest first. Each section: a title and items { title, text }.
   *    Write for someone who has never seen the script: what it does, where it is, in plain words.
   *    Add the entry of a version when its @version is bumped (src/meta/00-header.txt).
   * ===================================================================== */
  const AUTHOR = { name: 'NextEnzzo', profile: 'https://platesmania.com/user121559' };

  const WHATS_NEW = [{
    version: '5.9',
    title: 'Plate check does more, and the profiles are smarter',
    sections: [{
      title: 'On the upload page',
      items: [
        { title: 'Plate check, for 96 countries', text: 'Type a plate: how many photos of it are already on the site. Now it also offers the vehicle of those photos (one click fills the brand, model and generation) and links to look the plate up.' },
        { title: 'Your photos of the series', text: 'Under the plate: how many of your photos are in its series (HF-137-QQ is in HF-*-QQ). Works for 84 countries.' },
        { title: 'Your photos of this vehicle', text: 'Under the brand, model and generation menus: how many photos of each you already have, each number a link.' },
        { title: 'Official register (Netherlands, Israel)', text: 'A button asks the country’s open register for make, model, year and colour. The plate is sent only when you click.' },
        { title: 'Google Lens, Google says', text: 'Lens now shows what Google itself calls the vehicle, and a click types it in the site’s brand and model box.' },
        { title: 'Date of the photo, and a floating Upload button', text: 'The extra information card can insert the date of the photo, and the Upload button follows you down the page.' }
      ]
    }, {
      title: 'On profiles and series',
      items: [
        { title: 'Real uploads', text: 'The real total of a member’s gallery and the uploads of today (from 03:30), next to the figure the site only updates from time to time.' },
        { title: 'Regions', text: 'Which regions of a country a member has a photo from, and which are missing.' },
        { title: 'Series pages', text: 'On a series page: the numbers already on the site, and how many photos of the series you have.' }
      ]
    }, {
      title: 'Good to know',
      items: [
        { title: 'Every feature has a switch', text: 'Settings lists them all: turn off what you do not use. Nothing is sent to another site until you click a link or a button that says so.' }
      ]
    }]
  }];
