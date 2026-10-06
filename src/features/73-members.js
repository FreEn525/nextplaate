  /* =====================================================================
   *  MEMBER SHORTCUTS  (the profiles of members you go to often, one click away)
   *    A shortcut is a member's picture and name; a click goes to the member's page (/user<id>). The list is yours (kept in the
   *    browser) and starts with you: the member who is logged in (read from the site's top bar) is always the first line, which
   *    cannot be moved or removed.
   *    Two ways of using it, so the everyday one stays clean:
   *      - looking: only the lines, nothing else. On a member's profile a star in the title saves that member (or takes them off);
   *        with more than eight members a box finds one by typing;
   *      - editing (the Edit button, Done to leave): each line gets a grip to drag it (a bar shows where it lands, never above you;
   *        or focus the grip and press Up / Down), a cross to remove it, and a box adds a member by number or by the link of
   *        their page (the page is read once, through the script's own queue, for the picture and the name).
   *    Your own picture is also in the panel's bar, under the logo, in a circle: a click goes to your page.
   *    The list is in the panel (Gallery drawer) and, on a member's profile, right on the site, to the LEFT of the content, level with
   *    the profile picture (the flags are on the right); on a narrower screen it moves under the picture, in the left column.
   * ===================================================================== */
  const MEMBERS_GAP = 16;
  const MEMBERS_MIN = 170;        // narrower than this, the list goes under the picture
  const MEMBERS_MAX = 300;
  const MEMBERS_FIND_FROM = 9;    // from this many members, a box to find one
  let membersEditing = false;     // editing or looking (the same in the panel and on the page)

  const membersGet = () => { try { const v = JSON.parse(store.get('members', '[]')); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const membersSet = list => store.set('members', JSON.stringify(list));

  // The member of a profile page (the page itself, or one fetched): its number, name and picture; null when it is not a profile
  function memberInfo(doc, id) {
    const name = doc.querySelector('.profile h1 a, .container.profile h1 a');
    const img = doc.querySelector('.profile-img');
    const small = doc.querySelector('.profile h1 small');
    const num = id || ((small && small.textContent.match(/ID:\s*(\d+)/)) || [])[1];
    if (!num || !name) return null;
    return { id: String(num), name: name.textContent.trim(), avatar: img ? img.getAttribute('src') || '' : '' };
  }

  // The number out of what the user typed: "121546", "user121546", or the link of the page
  const memberIdOf = text => ((String(text).trim().match(/^(?:.*\/)?(?:user)?(\d{1,9})\/?(?:[?#].*)?$/i)) || [])[1] || '';

  // ---- you: the logged-in member, from the first link of the site's top bar (/user<id>); the picture is kept from your own page
  let meAvatarAsked = false;
  function membersMe() {
    const link = document.querySelector('.header .topbar .loginbar a[href^="/user"]');
    const id = link && (link.getAttribute('href').match(/^\/user(\d+)/) || [])[1];
    if (!id) return null;
    let kept = {};
    try { kept = JSON.parse(store.get('members_me', '{}')); } catch (e) { /* none yet */ }
    const own = memberHere();
    const me = { id, name: link.textContent.trim(), avatar: (own && own.id === id ? own.avatar : kept.id === id ? kept.avatar : '') || '' };
    if (me.id !== kept.id || me.name !== kept.name || me.avatar !== kept.avatar) store.set('members_me', JSON.stringify(me));
    return me;
  }
  // Your own picture is only on your own page: read it once, in the background, when it is not known yet
  function membersMeAvatar(me) {
    if (!me || me.avatar || meAvatarAsked) return;
    meAvatarAsked = true;
    siteFetch('/user' + me.id).then(text => {
      const m = memberInfo(new DOMParser().parseFromString(text, 'text/html'), me.id);
      if (m && m.avatar) { store.set('members_me', JSON.stringify({ ...me, avatar: m.avatar })); membersRefresh(); }
    }).catch(() => { /* the line shows the initial instead */ });
  }

  // You first, then the members you added (you are not listed twice if you added yourself)
  function membersAll() {
    const me = membersMe();
    return { me, others: membersGet().filter(x => !me || x.id !== me.id) };
  }

  function memberAdd(m) {
    const list = membersGet().filter(x => x.id !== m.id);
    list.push(m);
    membersSet(list);
    membersRefresh();
  }
  function memberRemove(id) {
    membersSet(membersGet().filter(x => x.id !== id));
    membersRefresh();
  }
  // Moves a member to another place among the added ones (to: the index in that list)
  function memberMove(id, to) {
    const list = membersGet();
    const from = list.findIndex(x => x.id === id);
    if (from < 0) return;
    const [m] = list.splice(from, 1);
    list.splice(Math.max(0, Math.min(to, list.length)), 0, m);
    membersSet(list);
  }

  // The page we are on, when it is a profile
  const memberHere = () => (here.profile ? memberInfo(document, (location.pathname.match(/\d+/) || [])[0]) : null);

  // ---- the parts of the view
  function memberLine(m, me) {
    const initial = h('span', { class: 'mav', text: (m.name[0] || '?').toUpperCase() });
    const img = h('img', { src: m.avatar, alt: '', width: 40, height: 40 });
    img.addEventListener('error', () => img.replaceWith(initial));
    const now = memberHere();
    return h('a', { class: 'member' + (now && now.id === m.id ? ' on' : '') + (me ? ' me' : ''), href: `/user${m.id}`, title: m.name },
      m.avatar ? img : initial, h('span', { class: 'mname', text: m.name }), me ? h('span', { class: 'mtag', text: 'You' }) : null);
  }

  // The lines. Looking: links only. Editing: a grip and a cross on each added member, and the lines can be dragged.
  function membersLines(where, others, me, filter) {
    const box = h('div', { class: 'members', 'data-where': where });
    if (me) box.append(h('div', { class: 'mrow pinned', 'data-id': me.id }, membersEditing ? h('span', { class: 'grip off', title: 'You are always first' }) : null, memberLine(me, true)));
    others.filter(m => !filter || m.name.toLowerCase().includes(filter)).forEach(m => {
      const i = others.indexOf(m);
      const row = h('div', { class: 'mrow', 'data-id': m.id }, memberLine(m, false));
      if (membersEditing) {
        const grip = h('button', { type: 'button', class: 'grip', title: 'Drag to move (or press the Up and Down arrows here)', text: '⋮⋮' });
        grip.addEventListener('keydown', e => {
          if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
          e.preventDefault();
          memberMove(m.id, i + (e.key === 'ArrowUp' ? -1 : 1));
          membersRefresh(where, m.id);
        });
        row.prepend(grip);
        row.append(h('button', { type: 'button', class: 'iconbtn', title: 'Remove ' + m.name, text: '×', onclick: () => memberRemove(m.id) }));
        row.draggable = true;
        row.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', m.id); e.dataTransfer.effectAllowed = 'move'; row.classList.add('dragging'); });
        row.addEventListener('dragend', () => box.querySelectorAll('.dragging, .before, .after').forEach(x => x.classList.remove('dragging', 'before', 'after')));
      }
      box.append(row);
    });
    if (membersEditing) {
      // dropping: the line goes before or after the one under the pointer, by the half of it the pointer is in; never above you
      box.addEventListener('dragover', e => {
        const over = e.target.closest && e.target.closest('.mrow');
        if (!over || !box.querySelector('.dragging')) return;
        e.preventDefault();
        box.querySelectorAll('.before, .after').forEach(x => x.classList.remove('before', 'after'));
        const r = over.getBoundingClientRect();
        over.classList.add(!over.classList.contains('pinned') && e.clientY < r.top + r.height / 2 ? 'before' : 'after');
      });
      box.addEventListener('drop', e => {
        const over = e.target.closest && e.target.closest('.mrow');
        const id = e.dataTransfer.getData('text/plain');
        if (!over || !id) return;
        e.preventDefault();
        const list = membersAll().others;
        const target = list.findIndex(x => x.id === over.dataset.id);              // -1 when it is you: the first place
        const from = list.findIndex(x => x.id === id);
        if (from < 0) return;
        let to = target < 0 ? 0 : target + (over.classList.contains('after') ? 1 : 0);
        if (from < to) to -= 1;                                                     // the line leaves its place before it lands
        memberMove(id, to);
        membersRefresh();
      });
    }
    return box;
  }

  // Add by number or link (editing only)
  function membersAddBox() {
    const input = h('input', { type: 'text', placeholder: 'Number or link' });
    const msg = h('p', { class: 'presult', hidden: true });
    const say = (text, warn) => { msg.hidden = !text; msg.textContent = text || ''; msg.className = 'presult' + (warn ? ' warn' : ''); };
    const go = async () => {
      const id = memberIdOf(input.value);
      const { me } = membersAll();
      if (!id) { say('Type the number of the member (121546) or the link of the page.', true); return; }
      if ((me && me.id === id) || membersGet().some(x => x.id === id)) { say('This member is already in the list.'); return; }
      say('Reading the page…');
      try {
        const doc = new DOMParser().parseFromString(await siteFetch('/user' + id), 'text/html');
        const m = memberInfo(doc, id);
        if (!m) { say('No member with this number.', true); return; }
        memberAdd(m);                                                                // the view is drawn again: this box with it
      } catch (e) { say('Could not read the page: ' + e.message + '.', true); }
    };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    return h('div', { class: 'membersadd' }, h('div', { class: 'addrow' }, input, h('button', { type: 'button', class: 'btn ghost fit', text: 'Add', onclick: go })), msg);
  }

  // The whole view: the buttons of the title line, the lines, the box to add (editing), the hint
  function membersView(where) {
    const { me, others } = membersAll();
    membersMeAvatar(me);
    const now = memberHere();
    const here_ = now && !(me && me.id === now.id) ? now : null;                        // not offered on your own page
    const saved = !!(here_ && membersGet().some(x => x.id === here_.id));
    const star = here_ ? h('button', { type: 'button', class: 'iconbtn star' + (saved ? ' on' : ''), text: saved ? '★' : '☆',
      title: saved ? `Take ${here_.name} off the shortcuts` : `Save ${here_.name} in the shortcuts`, onclick: () => (saved ? memberRemove(here_.id) : memberAdd(here_)) }) : null;
    const edit = h('button', { type: 'button', class: 'btn ghost sm', text: membersEditing ? 'Done' : 'Edit', title: membersEditing ? 'Leave editing' : 'Reorder, remove or add members',
      onclick: () => { membersEditing = !membersEditing; membersRefresh(); } });
    const head = h('div', { class: 'mhead' }, where === 'bar' ? h('span', { class: 't', text: 'Member shortcuts' }) : h('span', { class: 'mute', text: others.length ? `${others.length} saved` : '' }),
      h('span', { class: 'mactions' }, star, edit));
    const kids = [head];
    if (!membersEditing && others.length >= MEMBERS_FIND_FROM) {
      const find = h('input', { type: 'text', placeholder: 'Find a member…' });
      const lines = h('div', { class: 'mlines' }, membersLines(where, others, me, ''));
      find.addEventListener('input', () => lines.replaceChildren(membersLines(where, others, me, find.value.trim().toLowerCase())));
      kids.push(find, lines);
    } else kids.push(membersLines(where, others, me, ''));
    if (!others.length) kids.push(h('p', { class: 'hint', text: here_ ? 'Press the star to save this member.' : 'Open a member’s page and press the star, or press Edit to add one by number.' }));
    if (membersEditing) kids.push(membersAddBox());
    return kids.filter(Boolean);                                                            // replaceChildren would write a null as the word "null"
  }

  // ---- the bar on a profile page, to the left of the content
  const MEMBERS_CSS = `
    :host{display:block}
    .box{background:#fff;border:1px solid var(--line);padding:12px;display:flex;flex-direction:column;gap:12px}
    .t{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--primary-h)}
    .members,.mlines{max-height:60vh;overflow-y:auto}
  `;
  function membersBar() {
    const host = h('div', { id: 'pmg-members' });
    const root = host.attachShadow({ mode: 'open' });
    root.append(h('style', { text: UI_BASE + MEMBERS_CSS }), h('div', { class: 'box' }, membersView('bar')));
    return host;
  }

  // Your own picture in the panel's bar, under the logo: a circle, and a click goes to your page (nothing when nobody is logged in)
  function membersRail() {
    const rail = $('rail');
    const old = rail.querySelector('.rme');
    if (old) old.remove();
    const { me } = membersAll();
    if (!me) return;
    const initial = h('span', { text: (me.name[0] || '?').toUpperCase() });
    const img = h('img', { src: me.avatar, alt: '' });
    img.addEventListener('error', () => img.replaceWith(initial));
    const own = memberHere();
    rail.querySelector('.logo').after(h('a', { class: 'rme' + (own && own.id === me.id ? ' on' : ''), href: `/user${me.id}`, title: `${me.name} (your page)` }, me.avatar ? img : initial));
  }

  // Everything that shows the list follows a change (the panel and the bar). focus: a member whose grip gets the keyboard focus back
  function membersRefresh(where, focus) {
    membersRail();
    const host = document.getElementById('pmg-members');
    if (host) host.shadowRoot.querySelector('.box').replaceChildren(...membersView('bar'));
    const slot = $('membersPanel');
    if (slot) slot.replaceChildren(...membersView('panel'));
    if (focus) {
      const root = where === 'bar' && host ? host.shadowRoot : slot;
      const grip = root && root.querySelector(`.mrow[data-id="${focus}"] .grip`);
      if (grip) grip.focus();
    }
  }

  // To the left of the content when there is room, else under the picture
  function membersPlace() {
    const host = document.getElementById('pmg-members');
    if (!host) return;
    const content = document.querySelector('.container.content, .content .container') || document.querySelector('.container');
    const left = content ? content.getBoundingClientRect().left : 0;
    const room = left - 2 * MEMBERS_GAP;
    if (room >= MEMBERS_MIN) {
      const width = Math.min(room, MEMBERS_MAX);
      const top = (content || document.body).getBoundingClientRect().top + window.scrollY;
      if (host.parentNode !== document.body) document.body.appendChild(host);
      host.style.cssText = `position:absolute;z-index:50;top:${Math.max(0, top)}px;left:${left + window.scrollX - MEMBERS_GAP - width}px;width:${width}px`;
    } else {
      const side = content && content.querySelector('.col-md-3');
      host.style.cssText = 'position:static;margin-top:10px';
      if (side) side.insertBefore(host, document.getElementById('pmg-flags') || null);
      else if (content) content.insertBefore(host, content.firstChild);
      else document.body.appendChild(host);
    }
  }

  registerFeature({
    id: 'members', label: 'Member shortcuts',
    groups: [{
      drawer: 'gallery', title: 'Member shortcuts',
      build: () => [h('div', { id: 'membersPanel', class: 'members-panel' }, membersView('panel'))]
    }],
    init: () => {
      const now = memberHere();
      if (now && membersGet().some(x => x.id === now.id)) membersSet(membersGet().map(x => (x.id === now.id ? now : x)));   // the picture and the name may have changed
      membersRefresh();
      if (!here.profile) return;
      document.body.appendChild(membersBar());
      membersPlace();
      window.addEventListener('resize', membersPlace);
      window.addEventListener('load', membersPlace);
    }
  });
