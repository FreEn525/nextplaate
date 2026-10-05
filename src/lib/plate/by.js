  // Belarus: for each type, the visible letter menus, the region menu and the digit field (site's disby1 function, run on each type)
  const BY_TYPES = {
    '1': { letters: ['b3', 'b4'], region: 'region5', digit: 'digit1', lettersFirst: false },   // Cars (2004)
    '2': { letters: ['b1', 'b2'], region: 'region5', digit: 'digit1', lettersFirst: true },    // Trucks and buses (2004)
    '4': { letters: ['b3', 'b4'], region: 'region5', digit: 'digit1', lettersFirst: false },   // Electric vehicles (cars)
    '5': { letters: ['b1', 'b3'], region: 'region5', digit: 'digit1', lettersFirst: true },    // Trailers and semitrailers (2004)
    '6': { letters: ['b3', 'b4'], region: 'region5', digit: 'digit1', lettersFirst: false },   // Motorcycles (2004)
    '7': { letters: ['b1', 'b2'], region: 'region1', digit: 'digit1', lettersFirst: true },    // Special machinery (2004)
    '8': { letters: ['b1', 'b2'], region: 'region5', digit: 'digit1', lettersFirst: true },    // Electric vehicles (trucks and buses)
    '9': { letters: ['b3', 'b4'], region: 'region5', digit: 'digit1', lettersFirst: false },   // Electric vehicles (motorcycles)
    '12': { letters: ['b3', 'b4'], region: 'region1', digit: 'digit2', lettersFirst: false },  // Transit plates (2004)
    '13': { letters: ['b3', 'b4'], region: 'region3', digit: 'digit1', lettersFirst: false },  // Cars (2000)
    '20': { letters: [], region: 'region6', digit: 'digit1', lettersFirst: false },             // Police
    '3': { letters: ['dip'], region: 'region5', digit: 'digit1', lettersFirst: true },        // Diplomatic: CC 9605-1
    '14': { letters: [], region: 'region4', digit: 'digit1', lettersFirst: false },            // Cars (1992)
    '15': { letters: [], region: 'region4', digit: 'digit2', lettersFirst: false },            // Trucks and buses (1992)
    '16': { letters: [], region: '', digit: 'digit1', lettersFirst: false },                   // Trailers (1992)
    '17': { letters: ['b3', 'b4'], region: 'region1', digit: 'digit2', lettersFirst: false },  // Taxi
    '18': { letters: ['b3', 'b4'], region: '', digit: 'digit2', lettersFirst: false },         // Provisional (the T/BP mark is typed by the site)
    '19': { letters: [], region: '', digit: 'digit2', lettersFirst: false }                    // Foreign citizens and enterprises
  };


  // Belarus: the fields shown depend on the type (taken from the site's own switch function)
  PLATE_RULES.by = () => {
    const ctype = fieldVal('ctype');
    // trailers 2004: A 1057 K-1 (letter, digits, letter, dash region); special machinery: IH-4 3152 (letters, dash region, digits)
    if (ctype === '5') return joinParts([fieldVal('b1'), fieldVal('digit1'), fieldVal('b3')]) + '-' + selText('region5');
    if (ctype === '16') return joinParts([fieldVal('digit1'), selText('b3') + selText('b1')]);   // trailers 1992: 0222 KA (b3 then b1)
    if (ctype === '13') return joinParts([fieldVal('digit1'), selText('region3') + selText('b3') + selText('b4')]);   // cars 2000: 3897 MBI (digits, then the three letters)
    if (ctype === '15') return joinParts([selText('region4'), fieldVal('digit2')]);   // trucks 1992: AC 9877 (letters, then digits)
    // transit 2004: 8AP T 6938 (digit, letters, T set by the site, digits); taxi: 1 TAX 7359; provisional: MK BP 8462; foreign: P 91179
    if (ctype === '12') return joinParts([menu('region1') + shownVal('b3') + shownVal('b4'), shownVal('trz'), shownVal('digit2')]);
    if (ctype === '17') return joinParts([selText('region1'), shownVal('tx') + selText('b3') + selText('b4'), shownVal('digit2')]);   // taxi: 1 TAX 7359 (region menu, T from tx + the two letters, digits)
    if (ctype === '18') return joinParts([shownVal('b3') + shownVal('b4'), shownVal('trz'), shownVal('digit2')]);
    if (ctype === '19') return joinParts([selText('nonr'), shownVal('digit2')]);
    if (ctype === '7') return joinParts([selText('b1') + selText('b2') + (selText('region1') ? '-' + selText('region1') : ''), fieldVal('digit1')]);
    const row = BY_TYPES[ctype];
    if (!row) return genericPlate();
    const letters = row.letters.map(selText).join(''), digits = fieldVal(row.digit), region = selText(row.region);
    const core = row.lettersFirst ? joinParts([letters, digits]) : joinParts([digits, letters]);   // trucks AP 9665, cars 6383 EC
    return core + (region ? '-' + region : '');                    // the region follows a dash: AP 9665-1, 6383 EC-6
  };
