  // How a plate is typed into the form of a category when the page lists its fields in another order than the plate is
  // read, when one field takes the whole text, or when the site writes a part itself. Used by the offline check and the
  // plate tests. Key: 'cc|Category' (the label of the search page) or 'cc|*' for every category of the country.
  //   order: the field ids in the order the plate is read      field: one field takes the whole text
  //   drop:  tokens that the form already has (written by the site, or fixed): they are not typed
  //   prefix: text the site writes in front of the plate (ÅL, ÅS): removed from the plate before it is typed
  //   keepDigits: a piece that is only digits is not cut into menu choices
  //   extra: more field ids to type into (a menu the plate-field list does not know)
  //   right: the last piece is a number written one digit per menu (d1..d4), from the right
  //   chars: 'before' | 'after': one menu per character (Arabic-script forms), see ptTypeChars in 00-typing.js
  const PT_HINTS = {
    'lv|Diplomatic': { field: 'nomer' },
    'lv|Vanity Plates': { field: 'nomer' },
    'rs|Trailers': { order: ['b1', 'b2', 'digit2', 'region2'] },
    'ax|Cars (ÅLA 1234)': { prefix: 'ÅL' },
    'li|*': { drop: ['FL'] },
    'li|Dealer (with "U")': { drop: ['FL', 'U'] },
    'gr|*': { order: ['region', 'b1', 'let', 'digit'] },
    'gr|Taxi': { order: ['b1', 'region', 'digit'] },
    'mn|*': { order: ['region', 'b1', 'b2', 'digit'] },
    'jp|*': { right: true },
    'rs|Diplomatic': { order: ['region1', 'dip'] },
    'tj|Trailers (2009)': { order: ['region2', 'nomer'] },
    'th|*': { keepDigits: true },
    'de|*': { extra: ['season'] },
    'ps|*': { extra: ['reg1'] },
    'kg|*': { order: ['region', 'nomerpl'] },
    'kg|Diplomatic': { order: null },
    'ir|*': { chars: 'before' },
    'ir|License plates for driving abroad (2010)': { chars: null },
    'ir|License plates for driving abroad (2015)': { chars: null },
    'eg|*': { chars: 'before' },
    'sa|*': { chars: 'after' },
    'sa|1996 year system': { chars: 'before' },
    'iq|1988 year system': { chars: 'before' },
    'iq|2001 year system': { chars: 'before' },
    'iq|2008 year system': { chars: 'after' },
    'iq|2022 year system': { chars: 'after' }
  };
  const ptHint = (cc, category) => ({ ...(PT_HINTS[cc + '|*'] || {}), ...(PT_HINTS[cc + '|' + category] || {}) });
