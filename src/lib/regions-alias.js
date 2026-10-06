  /* =====================================================================
   *  REGION ALIASES  (names the site writes differently from the shapes, per country: normalised name -> normalised shape name)
   *    Only what neither the exact names, the codes nor the near names settle (tools/measure-regions.py --suggest prints the nearest shape
   *    names of what found none). Normalised: no accent, lower case, without words such as region, oblast, city (see regionNorm).
   *    A region that merged into another (an autonomous district of Russia that became part of a krai) is put on its successor.
   * ===================================================================== */
  const REGION_ALIAS = {
    ru: {
      chechen: 'chechnya', primorye: 'primorsky', 'khanty mansi yugra': 'khanty mansiysk ugra',
      'komi permyak': 'perm', 'buryat aginskoye': 'zabaykalsky', 'buryat ust ordynskoy': 'irkutsk', taymyr: 'krasnoyarsk', evenk: 'krasnoyarsk', koryak: 'kamchatka'
    },
    es: { biscay: 'bizkaia', 'balearic islands': 'balears', lerida: 'lleida' },
    mk: { stip: 'shtip', 'titov veles': 'veles', vinica: 'vinitsa' },
    md: { 'atu gagauzia': 'gagauzia' },
    kz: { zhambyl: 'jambyl' },
    iq: { nineveh: 'ninawa', babylon: 'babil', duhok: 'dohuk', saladin: 'salah al din', najaf: 'an najaf' },
    mn: { 'ulan bator': 'ulaanbaatar' }
  };
