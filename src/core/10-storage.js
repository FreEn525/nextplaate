  /* =====================================================================
   *  STORAGE  (survives page navigation)
   * ===================================================================== */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('pmg_' + k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('pmg_' + k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem('pmg_' + k); } catch (e) {} }
  };
  // Console log of what the script sees (keys, window, drawers). Off with: localStorage.setItem('pmg_debug', '0')
  const log = (...args) => { if (store.get('debug', '1') === '1') console.log('[NextPlaate]', ...args); };
  const loadPhoto = k => { try { return JSON.parse(store.get(k, 'null')); } catch (e) { return null; } };

  const state = {
    front: loadPhoto('front'),
    rear: loadPhoto('rear'),
    mode: null // 'front' | 'rear' | null  (selection mode)
  };

  // Photos already handled for the current pair (prevents auto-edit loops)
  const doneSet = () => { try { return new Set(JSON.parse(store.get('done', '[]'))); } catch (e) { return new Set(); } };
  const markDone = id => { const s = doneSet(); s.add(id); store.set('done', JSON.stringify([...s])); };
  const clearDone = () => { store.set('done', '[]'); store.set('filled', '[]'); store.set('returnPending', '0'); };

  // Photos whose description was actually filled (used to know when the whole pair is finished)
  const filledSet = () => { try { return new Set(JSON.parse(store.get('filled', '[]'))); } catch (e) { return new Set(); } };
  const markFilled = id => { const s = filledSet(); s.add(id); store.set('filled', JSON.stringify([...s])); };

