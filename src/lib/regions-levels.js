  /* =====================================================================
   *  REGION MAPS: WHICH COUNTRIES, AT WHICH LEVEL  (written by tools/measure-regions.py: do not edit by hand)
   *    For each country of the site that has regions: its ISO 3166 alpha-3 code and the geoBoundaries level whose shapes the site's regions
   *    fall on best. A country is listed only when at least seven regions in ten are placed on the shapes; the others show the table of
   *    their regions, without a map, until their matching is worked out. 42 countries.
   * ===================================================================== */
  const REGION_MAPS = {
    ae: ['ARE', 'ADM1'], al: ['ALB', 'ADM2'], at: ['AUT', 'ADM2'], au: ['AUS', 'ADM1'], az: ['AZE', 'ADM2'], bg: ['BGR', 'ADM1'], by: ['BLR', 'ADM1'], ca: ['CAN', 'ADM1'], ch: ['CHE', 'ADM1'], cn: ['CHN', 'ADM1'], cz: ['CZE', 'ADM2'], de: ['DEU', 'ADM3'], eg: ['EGY', 'ADM1'], es: ['ESP', 'ADM2'], fr: ['FRA', 'ADM2'], id: ['IDN', 'ADM1'], iq: ['IRQ', 'ADM1'], it: ['ITA', 'ADM3'], kg: ['KGZ', 'ADM1'], kh: ['KHM', 'ADM1'], kr: ['KOR', 'ADM1'], kz: ['KAZ', 'ADM1'], la: ['LAO', 'ADM1'], md: ['MDA', 'ADM1'], me: ['MNE', 'ADM1'], mk: ['MKD', 'ADM2'], mn: ['MNG', 'ADM1'], mx: ['MEX', 'ADM1'], no: ['NOR', 'ADM2'], pt: ['PRT', 'ADM2'], ro: ['ROU', 'ADM1'], rs: ['SRB', 'ADM2'], ru: ['RUS', 'ADM1'], si: ['SVN', 'ADM2'], sk: ['SVK', 'ADM2'], th: ['THA', 'ADM1'], tj: ['TJK', 'ADM1'], tr: ['TUR', 'ADM1'], ua: ['UKR', 'ADM1'], us: ['USA', 'ADM1'], uz: ['UZB', 'ADM1'], vn: ['VNM', 'ADM1']
  };
