  /* =====================================================================
   *  PROFILE NOTIFICATIONS  (the site's list of likes and comments: the plate as a picture, and the rest loaded as you scroll)
   *    Each line names a photo by its plate in text; the picture comes from src/lib/profile-plates.js and is put in place of the text (the
   *    text stays as the picture's alternative and hover). The site's "Load more" button is replaced by loading the next ten
   *    when the end of the list comes in view; the button stays in the page, hidden, with its own script.
   *      profileNotifications(root, memberId)
   * ===================================================================== */
  function profileNotifications(root, memberId) {
    const list = root.querySelector('ul.mCustomScrollbar');
    if (!list || list.dataset.pmDone) return;
    list.dataset.pmDone = '1';
    const holder = root.querySelector('#content') || list;
    const show = (link, src) => { const text = link.textContent.trim(); link.title = text; link.replaceChildren(h('img', { class: 'pm-plate', src, alt: text })); };
    // Each line: its kind (a like, a comment, other news: a tint and an edge, set by CSS from the class) and the picture of the member
    const picture = (id, name) => {
      const letter = h('span', { class: 'pm-ava', text: (name[0] || '?').toUpperCase() });
      const img = h('img', { src: `https://forum.platesmania.com/data/avatars/s/${Math.floor(id / 1000)}/${id}.jpg`, alt: '', loading: 'lazy' });
      img.addEventListener('error', () => img.parentNode && img.parentNode.replaceWith(letter));         // no picture: the letter
      return h('span', { class: 'pm-ava' }, img);
    };
    const decorate = li => {
      const row = li.querySelector(':scope > div');
      if (!row || row.dataset.pmKind) return;
      const icon = (row.querySelector('i.fa') || {}).className || '';
      row.dataset.pmKind = /heart/.test(icon) ? 'like' : /comment/.test(icon) ? 'comment' : 'other';
      const who = row.querySelector('strong a'), id = who && (who.getAttribute('href').match(/user(\d+)/) || [])[1];
      if (id) who.closest('strong').before(picture(id, who.textContent.trim()));
    };
    const watch = scope => scope.querySelectorAll('li').forEach(li => {
      decorate(li);
      const link = li.querySelector('a[href*="/nomer"]');
      if (link && !link.querySelector('.pm-plate')) plateWatch(li, link, src => show(link, src));
    });
    watch(list);

    // The rest of the list, ten by ten, when its end comes in view
    const more = root.querySelector('#load');
    if (more) more.style.display = 'none';
    const end = h('div', { class: 'pm-end', text: 'Loading more\u2026' });
    holder.append(end);
    let busy = false, done = false;
    const next = async () => {
      if (busy || done) return;
      busy = true;
      try {
        const html = await siteFetch(`/action2.php?num=${list.querySelectorAll('li').length}&user=${memberId}`, undefined, { low: true });
        const items = [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('li')];
        if (!items.length) { done = true; end.textContent = 'That is all.'; return; }
        const added = document.createDocumentFragment();
        items.forEach(li => {
          const when = li.querySelector('time[datetime]');
          const span = when && when.querySelector('span');
          if (span) span.textContent = new Date(when.getAttribute('datetime')).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
          if (when) when.style.visibility = 'visible';
          added.append(li);
        });
        end.before(added);
        watch(holder);
      } catch (e) { done = true; end.textContent = 'Could not load more.'; }
      finally {
        busy = false;
        if (!done) { tail.unobserve(end); tail.observe(end); }                     // still in view after the batch: look again (an observer only speaks on a change)
      }
    };
    const tail = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) next(); }, { rootMargin: '120px' });
    tail.observe(end);
  }
