  /* =====================================================================
   *  OFFICIAL REGISTERS WITH OPEN DATA  (the only ones that answer a plate, free, with no key, to a page of another site)
   *    A register is { name, plate(plate) -> the plate as it asks for it or '', url(plate), read(json) -> the facts or null }.
   *    The facts: { make, model, year, colour, until } (all optional text). The plate leaves the page only when the user clicks.
   *    Checked on the real services: both answer with `access-control-allow-origin: *`, so a plain fetch from PlatesMania works.
   *    - nl: RDW open data, kentekenregister (opendata.rdw.nl)
   *    - il: Ministry of Transport vehicle register (data.gov.il), asked by the number of the plate; the make is in Hebrew
   * ===================================================================== */
  const REGISTRIES = {
    nl: {
      name: 'RDW open data',
      plate: p => String(p).toUpperCase().replace(/[\s-]+/g, '').replace(/[^A-Z0-9]/g, ''),
      url: p => `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${encodeURIComponent(p)}`,
      read: rows => {
        const r = Array.isArray(rows) && rows[0];
        const day = s => (/^\d{8}$/.test(s || '') ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}` : '');
        return r ? { make: r.merk || '', model: r.handelsbenaming || '', year: (r.datum_eerste_toelating || '').slice(0, 4), colour: r.eerste_kleur || '', until: day(r.vervaldatum_apk) } : null;
      }
    },
    il: {
      name: 'data.gov.il (Ministry of Transport)',
      plate: p => (/^\d{5,8}$/.test(String(p).replace(/\D/g, '')) ? String(p).replace(/\D/g, '') : ''),
      url: p => `https://data.gov.il/api/3/action/datastore_search?resource_id=053cea08-09bc-40ec-8f7a-156f0677aff3&filters=${encodeURIComponent(JSON.stringify({ mispar_rechev: +p }))}&limit=1`,
      read: json => {
        const r = json && json.result && json.result.records && json.result.records[0];
        return r ? { make: r.tozeret_nm || '', model: r.kinuy_mishari || '', year: String(r.shnat_yitzur || ''), colour: r.tzeva_rechev || '', until: r.tokef_dt || '' } : null;
      }
    }
  };
