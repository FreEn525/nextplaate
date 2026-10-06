  /* =====================================================================
   *  NOTIFICATIONS, READ  (what the site tells a member, as plain items)
   *    Two places hold it: the list the profile loads by itself (action2.php?num=0&user=<id>: likes, comments, 10 at a time, light) and the
   *    cards of the private messages on the profile page itself (changes made by moderators, deletions, awards, comments).
   *      notifyParseList(html)      -> [{ key, kind: 'like' | 'comment' | 'other', title, body, href, time }]
   *      notifyParseMessages(html)  -> [{ key, kind: 'message', title, body, href, time }]
   *    key is stable: it is how an item is told from one already shown. time is in milliseconds (0 when unknown).
   * ===================================================================== */
  const NOTIFY_VERBS = { like: 'liked', comment: 'commented on', other: '' };

  function notifyParseList(html) {
    const doc = new DOMParser().parseFromString(String(html), 'text/html');
    return [...doc.querySelectorAll('li')].map(li => {
      const icon = (li.querySelector('i.fa') || {}).className || '';
      const kind = /heart/.test(icon) ? 'like' : /comment/.test(icon) ? 'comment' : 'other';
      const who = li.querySelector('strong a'), plate = li.querySelector('a[href*="/nomer"]'), when = li.querySelector('time');
      const name = who ? who.textContent.trim() : '', what = plate ? plate.textContent.trim() : '';
      const time = when ? Date.parse(when.getAttribute('datetime') || '') || 0 : 0;
      const href = plate ? plate.getAttribute('href') : who ? who.getAttribute('href') : '';
      const title = name ? `${name} ${NOTIFY_VERBS[kind]} ${what}`.replace(/\s+/g, ' ').trim() : li.textContent.replace(/\s+/g, ' ').trim();
      return { key: `${kind}|${name}|${href}|${time}`, kind, title, body: '', href, time };
    }).filter(i => i.title);
  }

  function notifyParseMessages(html) {
    const doc = new DOMParser().parseFromString(String(html), 'text/html');
    return [...doc.querySelectorAll('.profile-notification-card')].map(card => {
      const link = card.querySelector('.profile-notification-card-title a'), type = card.querySelector('.profile-notification-card-type');
      const id = card.getAttribute('data-notification-delete-id') || '', time = +(card.getAttribute('data-notification-time') || 0) || 0;
      const what = link ? link.textContent.trim() : '', label = type ? type.textContent.trim() : (card.getAttribute('data-notification-category') || 'message');
      const by = card.querySelector('.profile-notification-card-meta a');
      return { key: `message|${id}|${time}`, kind: 'message', title: what ? `${label}: ${what}` : label, body: by ? `by ${by.textContent.trim()}` : '', href: link ? link.getAttribute('href') : '', time };
    });
  }
