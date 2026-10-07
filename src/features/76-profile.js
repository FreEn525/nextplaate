  /* =====================================================================
   *  PROFILE: THE REAL UPLOADS  (a member's profile page)
   *    The "uploaded" figure of a profile is a statistic the site recalculates from time to time, and its (+n) runs since that
   *    last calculation, not since today. The gallery of the member is always live, so the card asks it twice: the whole gallery
   *    (the real total) and the day (from 03:30 local time, when the site's day starts, to 03:30 the next day), and shows both
   *    next to the figure of the profile, with the difference. Two requests through the shared queue (src/lib/http.js).
   * ===================================================================== */
  const DAY_STARTS = { h: 3, m: 30 };

  // The site's date format in a search: MM/DD/YYYY HH:MM:00 in local time (the page sends tz_offset with it)
  const profileDate = d => {
    const p = n => String(n).padStart(2, '0');
    return `${p(d.getMonth() + 1)}/${p(d.getDate())}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:00`;
  };

  // The day now in force: [start, end) with start the last 03:30 that has passed
  function profileDay(now) {
    const start = new Date(now);
    start.setHours(DAY_STARTS.h, DAY_STARTS.m, 0, 0);
    if (now < start) start.setDate(start.getDate() - 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  // The address of the member's gallery, whole or for the day
  function profileGallery(id, day) {
    if (!day) return `/gallery.php?usr=${id}`;
    return `/gallery.php?usr=${id}&tz_offset=${day.start.getTimezoneOffset()}&date1=${encodeURIComponent(profileDate(day.start))}&date2=${encodeURIComponent(profileDate(day.end))}`;
  }

  // The count a gallery page announces ("License plates found N")
  async function profileCount(url) {
    const doc = new DOMParser().parseFromString(await siteFetch(url), 'text/html');
    return siteCount(doc);
  }

  const profileNumber = text => +String(text).replace(/\D/g, '') || 0;
  const profileFormat = n => n.toLocaleString('en').replace(/,/g, ' ');

  function profileCard() {
    const link = document.querySelector('.service-block-v3 .counter a[href*="usr="]');
    const id = (location.pathname.match(/\/user(\d+)/) || [])[1];
    const anchor = document.querySelector('.service-block-v3');
    const card = id && link && anchor && inlineCard({ id: 'pmg-profile-card', title: 'Uploads', after: anchor, closable: false });
    if (!card) return;
    const shown = profileNumber(link.textContent);
    const day = profileDay(new Date());
    const at = `${String(DAY_STARTS.h).padStart(2, '0')}:${String(DAY_STARTS.m).padStart(2, '0')}`;
    const clock = ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const keep = 'profile_counts_' + id;                                                    // the last count, for the moments the site cannot be asked
    const known = () => { try { return JSON.parse(store.get(keep, 'null')); } catch (e) { return null; } };
    // The card stands at its final size at once: the figures are blanks that fill in, so nothing moves when they arrive
    const total = h('b', { class: 'blank', text: '0 000' }), today = h('b', { class: 'blank', text: '+0' });
    const hint = h('p', { class: 'hint', text: 'Counting the gallery…' });
    hint.style.minHeight = '3em';
    const retry = h('button', { type: 'button', class: 'btn ghost sm', text: 'Try again', hidden: true });
    card.body.append(h('div', { class: 'cardbox' },
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, total, h('span', { class: 'mute', text: 'photos in the gallery now' })),
        h('div', { class: 'stat' }, today, h('span', { class: 'mute', text: `today (since ${at})` }))),
      hint,
      h('div', { class: 'cardrow' }, h('a', { class: 'btn ghost sm', href: profileGallery(id, day), target: '_blank', rel: 'noopener noreferrer', text: 'See today’s photos' }),
        featureOn('worldmap') ? h('button', { type: 'button', class: 'btn ghost sm', text: 'World map of this member', onclick: () => worldMapOpen(id) }) : null, retry)));
    const paint = (c, stale) => {
      total.textContent = profileFormat(c.total);
      today.textContent = '+' + c.today;
      [total, today].forEach(b => { b.classList.remove('blank'); b.classList.toggle('stale', !!stale); });
      const gap = c.total - shown;
      hint.textContent = stale ? `Counted at ${clock(c.at)}.` : gap === 0 ? 'The profile figure is up to date.' : `The profile says ${profileFormat(shown)}: ${Math.abs(gap)} ${gap > 0 ? 'more' : 'fewer'} in the gallery, the site has not recalculated yet.`;
    };
    let timer = 0;
    async function load(force) {
      clearTimeout(timer);
      retry.hidden = true;
      const last = known();
      if (last && !force && Date.now() - last.at < 300000) { paint(last, false); return; }          // counted a moment ago: nothing to ask
      if (!last || force) hint.textContent = 'Counting the gallery…';
      try {
        const [count, now] = await Promise.all([profileCount(profileGallery(id)), profileCount(profileGallery(id, day))]);
        const c = { total: count, today: now, at: Date.now() };
        store.set(keep, JSON.stringify(c));
        paint(c, false);
      } catch (e) {
        const until = siteBlockedUntil(), paused = Date.now() < until;
        if (last) paint(last, true);
        if (paused) {                                                                           // the site asked to wait: say until when, and look again by itself
          hint.textContent = `${last ? `Counted at ${clock(last.at)}. ` : ''}The site asked to wait: it tries again by itself at ${clock(until)}.`;
          timer = setTimeout(() => load(true), until - Date.now() + 1000);
          retry.textContent = 'Try now';
        } else {
          hint.textContent = `${last ? `Counted at ${clock(last.at)}. ` : ''}Not counted: ${e.message}.`;
          retry.textContent = 'Try again';
        }
        retry.hidden = false;
      }
    }
    retry.onclick = () => { if (Date.now() < siteBlockedUntil()) siteResume(); load(true); };    // "Try now" lifts the pause: the user's own decision
    load(false);
  }

  registerFeature({
    id: 'profile', label: 'Profile: real uploads',
    init: () => { if (here.profile) profileCard(); }
  });
