  /* =====================================================================
   *  REGION MAPS: WHICH COUNTRIES, AT WHICH LEVEL  (written by tools/measure-regions.py: do not edit by hand)
   *    For each country of the site that has regions: its ISO 3166 alpha-3 code and the geoBoundaries level whose shapes the site's regions
   *    fall on best. A country is listed only when at least seven regions in ten are placed on the shapes; the others show the table of
   *    their regions, without a map, until their matching is worked out. 28 countries.
   * ===================================================================== */
  const REGION_MAPS = {
    ae: ['ARE', 'ADM1'], al: ['ALB', 'ADM2'], az: ['AZE', 'ADM2'], bg: ['BGR', 'ADM1'], by: ['BLR', 'ADM1'], ca: ['CAN', 'ADM1'], ch: ['CHE', 'ADM1'], cn: ['CHN', 'ADM1'], cz: ['CZE', 'ADM2'], fr: ['FRA', 'ADM2'], it: ['ITA', 'ADM3'], kg: ['KGZ', 'ADM1'], la: ['LAO', 'ADM1'], md: ['MDA', 'ADM1'], me: ['MNE', 'ADM1'], mx: ['MEX', 'ADM1'], pt: ['PRT', 'ADM2'], ro: ['ROU', 'ADM1'], rs: ['SRB', 'ADM2'], ru: ['RUS', 'ADM1'], si: ['SVN', 'ADM2'], th: ['THA', 'ADM1'], tj: ['TJK', 'ADM1'], tr: ['TUR', 'ADM1'], ua: ['UKR', 'ADM1'], us: ['USA', 'ADM1'], uz: ['UZB', 'ADM1'], vn: ['VNM', 'ADM1']
  };
