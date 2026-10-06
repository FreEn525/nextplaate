  // How a plate is typed into the form of a category when the page lists its fields in another order than the plate is
  // read, when one field takes the whole text, or when the site writes a part itself. Used by the offline check and the
  // plate tests. Key: 'cc|Category' (the label of the search page) or 'cc|*' for every category of the country.
  //   order: the field ids in the order the plate is read      field: one field takes the whole text
  //   drop:  tokens that the form already has (written by the site, or fixed): they are not typed
  //   prefix: text the site writes in front of the plate (ÅL, ÅS): removed from the plate before it is typed
  //   keepStart / dropEnd: the letters the site writes itself are at the end of the plate (not at the start): the start is kept, the last piece is dropped
  //   onlyFirst: only the first piece equal to what the site wrote is dropped, a later equal piece is typed
  //   keepDigits: a piece that is only digits is not cut into menu choices
  //   extra: more field ids to type into (a menu the plate-field list does not know)
  //   right: the last piece is a number written one digit per menu (d1..d4), from the right
  //   set: [{ id, text, when }]: choose that option of a menu first, when the plate matches the pattern
  //   chars: 'before' | 'after': one menu per character (Arabic-script forms), see ptTypeChars in 00-typing.js
  const PT_HINTS = {
    'lv|Diplomatic': { field: 'nomer' },
    'lv|Vanity Plates': { field: 'nomer' },
    'rs|Trailers': { order: ['b1', 'b2', 'digit2', 'region2'] },
    'ax|Cars (ÅLA 1234)': { prefix: 'ÅL' },
    'li|*': { drop: ['FL'] },
    'li|Dealer (with "U")': { drop: ['FL', 'U'] },
    'gr|*': { order: ['region', 'b1', 'let', 'digit'] },
    'gr|Agricultural vehicles': { order: ['let', 'digit'] },   // its region menu (prefectures) is not part of the plate text
    'si|Trailers': { order: ['nomer', 'drop_1'] },
    'de|Plates for oldtimers (type "H")': { keepStart: true, dropEnd: true },   // the H is written by the site after the number
    'de|Seasonal plates (Oldtimers)': { keepStart: true, dropEnd: true },
    'ch|Vehicles w/o paid duty (with "Z")': { keepStart: true, dropEnd: true },   // the Z is written by the site after the number
    'gi|Regular car plates (G 1234 A)': { onlyFirst: true },   // the G at the start is written by the site, the G at the end is typed
    'kz|Foreigners (2012)': { order: ['digit2', 'region2'] },
    'mn|*': { order: ['region', 'b1', 'b2', 'digit'] },
    'mn|Motorcycles': { order: ['region', 'b1', 'b2', 'digit'], set: [{ id: 'format', text: 'RRA 1234', when: '^\\S{3}\\s' }, { id: 'format', text: 'RR 1234', when: '^\\S{2}\\s' }] },   // three letters: the RRA format, two: RR
    'mc|Provisional': { drop: ['MC'] },
    'jp|*': { right: true },
    'rs|Diplomatic': { order: ['region1', 'dip'] },
    'tj|Trailers (2009)': { order: ['region2', 'nomer'] },
    'th|*': { keepDigits: true, order: ['b1', 'b1mt', 'b1c', 'b1p', 'b1v', 'b1i', 'b1com', 'b1txc', 'b1dop', 'b2', 'b3', 'b4', 'digit1', 'digit', 'digit5'] },   // the order the rule reads them
    'de|*': { extra: ['season'] },
    'ps|*': { extra: ['reg1'] },
    'kg|*': { order: ['region', 'nomerpl'] },
    'kg|Diplomatic': { order: null, field: 'nomerpl' },   // the whole plate in one field; the colour, month and year are not plate text
    'ir|*': { chars: 'before' },
    'ir|License plates for driving abroad (2010)': { chars: null },
    'ir|License plates for driving abroad (2015)': { chars: null },
    'is|Vanity Plates': { chars: 'boxes' },
    'ax|Vanity Plates': { chars: 'boxes' },
    'eg|*': { chars: 'before' },
    'sa|*': { chars: 'after' },
    'sa|1996 year system': { chars: 'before' },
    'iq|1988 year system': { chars: 'before' },
    'iq|2001 year system': { chars: 'before' },
    'iq|2008 year system': { chars: 'after' },
    'iq|2022 year system': { chars: 'after' }
  };
  const ptHint = (cc, category) => ({ ...(PT_HINTS[cc + '|*'] || {}), ...(PT_HINTS[cc + '|' + category] || {}) });
