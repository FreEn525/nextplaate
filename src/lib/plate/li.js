  PLATE_RULES.li = () => joinParts(['FL', fieldVal('digit').replace(/^FL\s*/i, ''), shownVal('b1')]);   // Liechtenstein: FL 12345 (the FL is fixed; the digit field may already hold it)
