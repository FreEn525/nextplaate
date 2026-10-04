  /* =====================================================================
   *  CODE GENERATION
   * ===================================================================== */
  function block(title, o, alt) {
    const link = `https://platesmania.com/${o.lang}/nomer${o.id}`;
    const img = `https://${o.srv}.platesmania.com/${o.folder}/m/${o.id}.jpg`;
    const tags = $('tag').value.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
    const head = tags.length ? tags.map(t => `<a href="/gallery.php?dop=${t}">#${t}</a>`).join(' ') + ' \n' : '';
    return `${head}${$('place').value.trim()}

<font color="#b8860b">━━━━━━ ◆ ━━━━━━</font>
<font color="#7a1f1f"><b>${title}</b></font>
<font color="#b8860b">━━━━━━ ◆ ━━━━━━</font>
<a href='${link}'><img src='${img}' width=230 height=175 border=0 alt='${alt}'></a>
<font color="#b8860b">━━━━━━━━━━━━━━━━━</font>`;
  }

