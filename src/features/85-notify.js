  /* =====================================================================
   *  NOTIFICATIONS  (pop-ups for what the site tells you: likes, comments, private messages)
   *    While a PlatesMania tab is open, on any page, the script asks the site from time to time (through the shared queue, one light request
   *    for the likes and comments, the profile page now and then for the private messages) and shows what is new as a notice in the corner,
   *    like a phone: src/ui/11-toast.js. It cannot run when no PlatesMania tab is open. The first time, what is there already is marked as
   *    seen (no flood). Several tabs share the work: the one that finds the last check old enough does it; the notices come up in the tab you
   *    are looking at, and wait for you if none is. Optionally also as a system notification when the tab is in the background.
   *    Choices (Settings > Notifications): which kinds, how often, system notifications. Read in src/lib/notify-parse.js.
   * ===================================================================== */
  settings.define('notify_like', '1', 'Likes', 'notify');
  settings.define('notify_comment', '1', 'Comments', 'notify');
  settings.define('notify_message', '1', 'Private messages', 'notify');
  settings.define('notify_other', '1', 'Other news', 'notify');
  settings.define('notify_every', '5', 'Look every (minutes)', 'notify');
  settings.define('notify_system', '0', 'Also as a system notification when this tab is in the background', 'notify');
  const NOTIFY_KINDS = ['like', 'comment', 'message', 'other'];
  const NOTIFY_KEEP = 600;                                  // the keys of the items already shown that are kept

  const notifyLoad = (key, fallback) => { try { return JSON.parse(store.get(key, '')) || fallback; } catch (e) { return fallback; } };

  // What is new in a fetched list: the items whose key is not known yet. The first time (no baseline) all are known, none is new.
  function notifyFresh(items, seen, name) {
    const known = new Set(seen.keys);
    const fresh = items.filter(i => !known.has(i.key));
    fresh.forEach(i => seen.keys.push(i.key));
    seen.keys = seen.keys.slice(-NOTIFY_KEEP);
    const first = !seen[name];
    seen[name] = true;
    return first ? [] : fresh;
  }

  async function notifyPoll(force) {
    const me = membersMe();
    if (!me) return;
    const now = Date.now(), every = Math.max(1, +settings.get('notify_every') || 5) * 60000;
    if (!force && now - +store.get('notify_last_list', '0') < every * 0.9) return;                 // another tab has just looked
    if (!force && document.visibilityState === 'hidden' && !settings.on('notify_system')) return;  // nobody is looking: no request (it looks again when the tab comes back)
    store.set('notify_last_list', String(now));
    const seen = notifyLoad('notify_seen', { keys: [] });
    let fresh = [];
    try { fresh = fresh.concat(notifyFresh(notifyParseList(await siteFetch(`/action2.php?num=0&user=${me.id}`, undefined, { low: true })), seen, 'list')); } catch (e) { /* the site is busy: next time */ }
    if (force || now - +store.get('notify_last_msgs', '0') >= Math.max(every * 2, 600000)) {         // the profile page is heavy: less often
      store.set('notify_last_msgs', String(now));
      try {
        const mine = here.profile && location.pathname.replace(/\/$/, '') === '/user' + me.id;               // on your own profile the cards are already here
        fresh = fresh.concat(notifyFresh(notifyParseMessages(mine ? document.documentElement.outerHTML : await siteFetch('/user' + me.id, undefined, { low: true })), seen, 'msgs'));
      } catch (e) { /* idem */ }
    }
    store.set('notify_seen', JSON.stringify(seen));
    if (fresh.length) store.set('notify_unseen', JSON.stringify([...notifyLoad('notify_unseen', []), ...fresh]));
    notifyShow();
  }

  // Shows what is waiting, in the tab that is in view; sends it as a system notification when it is in the background and that is allowed
  function notifyShow() {
    const waiting = notifyLoad('notify_unseen', []).filter(i => settings.on('notify_' + (NOTIFY_KINDS.includes(i.kind) ? i.kind : 'other')));
    if (!waiting.length) { store.set('notify_unseen', '[]'); return; }
    if (document.visibilityState === 'visible') {
      store.set('notify_unseen', '[]');
      const shown = waiting.length > 3 ? waiting.slice(0, 2) : waiting;
      shown.forEach(i => toast({ title: i.title, body: i.body, href: i.href, kind: i.kind }));
      if (waiting.length > shown.length) toast({ title: `${waiting.length - shown.length} more new notification${waiting.length - shown.length > 1 ? 's' : ''}`, href: membersMe() ? '/user' + membersMe().id : '', kind: 'other' });
    } else if (settings.on('notify_system') && window.Notification && Notification.permission === 'granted') {
      store.set('notify_unseen', '[]');
      waiting.slice(0, 3).forEach(i => new Notification(i.title, { body: i.body || 'PlatesMania' }));
    }
  }

  registerFeature({
    id: 'notify', label: 'Notification pop-ups', requires: [],
    groups: [{
      drawer: 'settings', rank: 20, title: 'Notifications',
      about: 'A notice in the corner for a new like, comment or private message, on any PlatesMania page, like a phone. It works while a PlatesMania tab is open.',
      build: () => [
        ...NOTIFY_KINDS.map(k => {
          const box = h('input', { type: 'checkbox', checked: settings.on('notify_' + k) });
          box.onchange = () => settings.set('notify_' + k, box.checked ? '1' : '0');
          return h('label', { class: 'chk' }, box, settings.list('notify').find(d => d.id === 'notify_' + k).label);
        }),
        h('label', { class: 'row' }, h('span', { class: 'lbl', text: 'Look every' }),
          (() => { const s = h('select', null, ['2', '5', '10', '30'].map(v => h('option', { value: v, text: v + ' min', selected: settings.get('notify_every') === v }))); s.onchange = () => settings.set('notify_every', s.value); return s; })()),
        (() => {
          const box = h('input', { type: 'checkbox', checked: settings.on('notify_system') });
          box.onchange = async () => {
            settings.set('notify_system', box.checked ? '1' : '0');
            if (box.checked && window.Notification && Notification.permission === 'default') { const answer = await Notification.requestPermission(); if (answer !== 'granted') { box.checked = false; settings.set('notify_system', '0'); } }
          };
          return h('label', { class: 'chk' }, box, settings.list('notify').find(d => d.id === 'notify_system').label);
        })(),
        h('div', { class: 'btnrow' },
          h('button', { type: 'button', class: 'btn ghost', id: 'notifyNow', text: 'Look now' }),
          h('button', { type: 'button', class: 'btn ghost', id: 'notifyTest', text: 'Show a test' }))
      ]
    }],
    init: () => {
      if (!membersMe()) return;
      $('notifyNow').onclick = () => notifyPoll(true);
      $('notifyTest').onclick = () => toast({ title: 'This is how a notification looks', body: 'It goes by itself, or with the cross', kind: 'like' });
      window.addEventListener('pmg-notify-poll', () => notifyPoll(true));
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') notifyPoll(false); notifyShow(); });
      window.addEventListener('storage', e => { if (e.key === 'pmg_notify_unseen') notifyShow(); });
      setTimeout(() => notifyPoll(false), 4000);
      setInterval(() => notifyPoll(false), 60000);
    }
  });
