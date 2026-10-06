  /* =====================================================================
   *  REGION MAPS: WHICH COUNTRIES, AT WHICH LEVEL  (measured, see tools/measure-regions.py)
   *    For each country of the site that has regions: its ISO 3166 alpha-3 code and the geoBoundaries level whose shapes the site's regions
   *    fall on best. A country is listed only when at least three regions in four were placed on the shapes in the last measure
   *    (6 October 2026); the others show the table of their regions without a map until their matching is worked out.
   * ===================================================================== */
  const REGION_MAPS = {
    ae: ['ARE', 'ADM1'], al: ['ALB', 'ADM2'], au: ['AUS', 'ADM1'], az: ['AZE', 'ADM2'], br: ['BRA', 'ADM1'], by: ['BLR', 'ADM1'],
    ca: ['CAN', 'ADM1'], ch: ['CHE', 'ADM1'], fr: ['FRA', 'ADM2'], md: ['MDA', 'ADM1'], me: ['MNE', 'ADM1'],
    rs: ['SRB', 'ADM2'], ru: ['RUS', 'ADM1'], si: ['SVN', 'ADM2'], tr: ['TUR', 'ADM1'], ua: ['UKR', 'ADM1'], us: ['USA', 'ADM1'],
    uz: ['UZB', 'ADM1'], vn: ['VNM', 'ADM1']
  };
