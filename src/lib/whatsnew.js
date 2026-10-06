  /* =====================================================================
   *  WHAT'S NEW  (the text of the window shown once after an update, and from Settings > About)
   *    One entry per version that has something to show, newest first. Each section: a title and items { title, text }.
   *    Write for someone who has never seen the script: what it does, where it is, in plain words.
   *    Add the entry of a version when its @version is bumped (src/meta/00-header.txt).
   * ===================================================================== */
  const AUTHOR = { name: 'NextEnzzo', profile: 'https://platesmania.com/user121559' };

  const WHATS_NEW = [{
    version: '5.11',
    title: 'A world map of the photos',
    sections: [{
      title: 'New',
      items: [
        { title: 'World map', text: 'The countries a member has photos from, on a map of the world, shaded by how many photos. Yours, or anyone’s: type a number or paste a profile link. Open it with G (globe), from Browse, or from a profile. Scroll to zoom, drag to move, or use the Europe view.' },
        { title: 'The brand and model box', text: 'The site’s text box is clearer: a short label, a field with an example, a clear button and nicer suggestions. The plate card is also in labelled sections now.' }
      ]
    }]
  }, {
    version: '5.10',
    title: 'The panel in the order of use, and every feature explained',
    sections: [{
      title: 'The panel',
      items: [
        { title: 'In the order you use it', text: 'The bar now reads Check a plate, Send photos, Describe a pair, Browse. Each box says in one sentence what it is for.' },
        { title: 'Describing a pair, in four steps', text: 'Choose the front and the rear photo, set your place and hashtags, fill the description on the edit page, and let the automation do the clicks if you want. The steps are numbered.' },
        { title: 'Settings explains everything', text: 'Each feature has its sentence and where it works (every country, 84 countries, Netherlands and Israel...), so you know what to expect.' },
        { title: 'Description without a pair', text: 'On an edit page, Fill description now writes your place and hashtags even if no pair is chosen. It never writes over a text that is already there.' }
      ]
    }, {
      title: 'Clearer pages',
      items: [
        { title: 'The page /add', text: 'The drop-down of countries becomes large flags with a search box (Enter opens the first match) and the countries you opened last.' },
        { title: 'Google Lens', text: 'The card leads with the best match and one button, then what Google calls the vehicle, then the other choices.' },
        { title: 'The batch window (U)', text: 'Two numbered steps, country chips side by side, and a clear first screen when no photo is chosen.' },
        { title: 'Flags on every screen', text: 'Beside the content where there is room, otherwise a tab Add a photo in… at the right edge, the same place everywhere.' },
        { title: 'Update from the logo', text: 'Click the logo of the panel to check for a newer version and install it.' },
        { title: 'Open registers, by themselves', text: 'For the Netherlands and Israel the register is asked as soon as the plate is read, and the empty menus are filled. Two switches in Settings turn that off.' },
        { title: 'Big galleries', text: 'A profile with more than 999 photos is counted (the Uploads card no longer says Not counted).' }
      ]
    }]
  }, {
    version: '5.9',
    title: 'Plate check does more, and the profiles are smarter',
    sections: [{
      title: 'On the upload page',
      items: [
        { title: 'Plate check, for 96 countries', text: 'Type a plate: how many photos of it are already on the site. Now it also offers the vehicle of those photos (one click fills the brand, model and generation) and links to look the plate up.' },
        { title: 'Your photos of the series', text: 'Under the plate: how many of your photos are in its series (HF-137-QQ is in HF-*-QQ). Works for 84 countries.' },
        { title: 'Your photos of this vehicle', text: 'Under the brand, model and generation menus: how many photos of each you already have, each number a link.' },
        { title: 'Official register (Netherlands, Israel)', text: 'The country’s open register (public data) is asked for make, model, year and colour, and the menus that are still empty are filled. Only the plate is sent; two switches in Settings turn it off.' },
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
