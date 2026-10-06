  /* =====================================================================
   *  LOOKUP SITES  (public pages where a plate can be looked up, by country)
   *    Only links: nothing is sent to any of them before the user clicks, and the script reads nothing from them.
   *    A site is { name, url } with {plate} where the plate goes, and fmt, how the plate is written there:
   *      'squash' (default)  letters and digits only, in capitals: AB-12 CDE -> AB12CDE
   *      'hyphen'            the parts joined by hyphens: AB 123 CD -> AB-123-CD
   *      'raw'               as the form gives it
   *    A site that fails or goes away is taken off here, or hidden by the user in Settings. The list starts from the public
   *    userscript "Platesmania Lookup Toolbox" (links only; its fiches that call an API are not part of it: see
   *    docs/ANALYSE-SCRIPTS-PUBLICS.md).
   * ===================================================================== */
  const LOOKUP_SITES = {
    '*': [
      { name: 'Google Images', url: 'https://www.google.com/search?tbm=isch&q="{plate}"', fmt: 'raw' },
      { name: 'Flickr', url: 'https://www.flickr.com/search/?text={plate}', fmt: 'raw' },
      { name: 'Autogespot', url: 'https://www.autogespot.com/spots?licenseplate={plate}' }
    ],
    nl: [
      { name: 'Finnik', url: 'https://finnik.nl/kenteken/{plate}' },
      { name: 'Autoweek', url: 'https://www.autoweek.nl/kentekencheck/{plate}' },
      { name: 'voertuig.net', url: 'https://voertuig.net/kenteken/{plate}' },
      { name: 'Kentekencheck.info', url: 'https://www.kentekencheck.info/kenteken/{plate}' },
      { name: 'Kentekencheck.nu', url: 'https://www.kentekencheck.nu/kenteken/{plate}' },
      { name: 'Qenteken', url: 'https://www.qenteken.nl/kentekencheck/{plate}' },
      { name: 'RDW', url: 'https://www.rdwdata.nl/kenteken/{plate}' }
    ],
    se: [
      { name: 'car.info', url: 'https://www.car.info/?s={plate}' },
      { name: 'biluppgifter.se', url: 'https://biluppgifter.se/fordon/{plate}' },
      { name: 'Transportstyrelsen', url: 'https://fordon-fu-regnr.transportstyrelsen.se/?ts-regnr-sok={plate}' }
    ],
    ua: [
      { name: 'carplates.app', url: 'https://ua.carplates.app/en/number/{plate}' },
      { name: 'baza-gai.com.ua', url: 'https://baza-gai.com.ua/nomer/{plate}' },
      { name: 'auto-inform.com.ua', url: 'https://auto-inform.com.ua/search/{plate}' }
    ],
    uk: [
      { name: 'checkcardetails', url: 'https://www.checkcardetails.co.uk/cardetails/{plate}' },
      { name: 'totalcarcheck', url: 'https://totalcarcheck.co.uk/FreeCheck?regno={plate}' },
      { name: 'checkhistory', url: 'https://checkhistory.uk/vehicle/{plate}' },
      { name: 'carhistorycheck', url: 'https://carhistorycheck.co.uk/confirm-vehicle/?vrm={plate}' },
      { name: 'carbaba', url: 'https://carbaba.co.uk/?reg={plate}' }
    ],
    dk: [
      { name: 'digitalservicebog', url: 'https://app.digitalservicebog.dk/search?country=dk&Registration={plate}' },
      { name: 'esyn.dk', url: 'https://findsynsrapport.esyn.dk/result?registration={plate}' }
    ],
    no: [
      { name: 'Statens vegvesen', url: 'https://www.vegvesen.no/en/vehicles/buy-and-sell/vehicle-information/check-vehicle-information/?registreringsnummer={plate}' },
      { name: 'regnr.info', url: 'https://regnr.info/{plate}' }
    ],
    fr: [
      { name: 'immatriculation-auto.info', url: 'https://immatriculation-auto.info/vehicle/{plate}' },
      { name: 'Carter-Cash', url: 'https://www.carter-cash.com/pieces-auto/?plate={plate}', fmt: 'hyphen' }
    ],
    es: [{ name: 'Carter-Cash', url: 'https://www.carter-cash.es/piezas-auto/?plate={plate}' }],
    it: [{ name: 'Carter-Cash', url: 'https://www.carter-cash.it/ricambi-auto/?plate={plate}' }],
    fi: [{ name: 'Biltema', url: 'https://www.biltema.fi/sv-fi/rekosok-bil/{plate}' }],
    sk: [
      { name: 'overenie.digital', url: 'https://overenie.digital/over/sk/ecv/{plate}' },
      { name: 'stkonline', url: 'https://www.stkonline.sk/spz/{plate}' }
    ],
    ie: [
      { name: 'cartell.ie', url: 'https://www.cartell.ie/ssl/servlet/beginStarLookup?registration={plate}' },
      { name: 'motorcheck.ie', url: 'https://www.motorcheck.ie/free-car-check/?vrm={plate}' }
    ],
    is: [{ name: 'island.is', url: 'https://island.is/uppfletting-i-oekutaekjaskra?vq={plate}' }],
    ch: [{ name: 'swisscarinfo', url: 'https://swisscarinfo.ch/en/search?type=all&q={plate}' }]
  };

  // The plate as a site wants it
  function lookupPlate(plate, fmt) {
    if (fmt === 'raw') return plate;
    const clean = String(plate).toUpperCase().replace(/[\s-]+/g, fmt === 'hyphen' ? '-' : '');
    return fmt === 'hyphen' ? clean.replace(/^-|-$/g, '') : clean;
  }

  // The sites for a country: its own, then the ones for every country; { key, name, href }
  function lookupFor(cc, plate) {
    const all = [...(LOOKUP_SITES[cc] || []).map(s => ({ ...s, cc })), ...LOOKUP_SITES['*'].map(s => ({ ...s, cc: '*' }))];
    return all.map(s => ({ key: s.cc + '|' + s.name, name: s.name, href: s.url.replace('{plate}', encodeURIComponent(lookupPlate(plate, s.fmt))) }));
  }
