  // How a plate is typed into the form of a category when the page lists its fields in another order than the plate is
  // read, when one field takes the whole text, or when the site writes a part itself. Used by the offline check and the
  // plate tests. Key: 'cc|Category' (the label of the search page) or 'cc|*' for every category of the country.
  //   order: the field ids in the order the plate is read      field: one field takes the whole text
  //   drop:  tokens that the form already has (written by the site, or fixed): they are not typed
  //   prefix: text the site writes in front of the plate (ÅL, ÅS): removed from the plate before it is typed
  const PT_HINTS = {
    'lv|Diplomatic': { field: 'nomer' },
    'lv|Vanity Plates': { field: 'nomer' },
    'rs|Trailers': { order: ['b1', 'b2', 'digit2', 'region2'] },
    'li|*': { drop: ['FL'] }
  };
  const ptHint = (cc, category) => ({ ...(PT_HINTS[cc + '|*'] || {}), ...(PT_HINTS[cc + '|' + category] || {}) });
