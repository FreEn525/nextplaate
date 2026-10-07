  /* =====================================================================
   *  PROFILE STYLE  (the site's own profile page, brought into the look of the script: flat rectangles, one blue, the greys, the type scale)
   *    The site's elements stay where they are with their own scripts (sort, filter and delete of the messages, the table's sort); only
   *    their look changes, and the loose figures are replaced by tiles built from them (src/lib/profile-parts.js: the originals stay in the
   *    page, hidden). The colours are PAGE_TOKENS (01-tokens.js): this CSS lives on the page, where the panel's tokens do not reach.
   *    Every box has the same frame: a 40 px band with a small blue title, then its content. Scoped to the profile container.
   * ===================================================================== */
  const PROFILE_CSS = `
    .container.profile{${PAGE_TOKENS}}
    .profile .panel,.profile .tag-box,.profile .service-block-v3{border-radius:0;box-shadow:none}
    /* the member: picture and badges (with the member shortcuts under them) on the left, name, tiles and cards on the right */
    .profile > .row:first-child{display:flex;flex-wrap:wrap;gap:16px;margin:0 0 16px;padding:16px;border:1px solid var(--pm-line);border-top:3px solid var(--pm);background:#fff}
    .profile > .row:first-child > [class*=col-md]{float:none;width:auto;padding:0}
    .profile > .row:first-child > .col-md-3{flex:0 0 200px;display:flex;flex-direction:column;align-items:stretch}
    .profile > .row:first-child > .col-md-9{flex:1 1 360px;min-width:0}
    .profile .profile-img{display:block;width:136px;height:136px;margin:4px auto 16px;padding:4px;border:1px solid var(--pm-line2)!important;border-radius:0!important;background:#fff;outline:4px solid var(--pm-tint);object-fit:cover}
    .profile .devider{display:none}
    .profile .badge-lists{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 14px;margin:0 0 4px;padding:0}
    .profile .badge-lists li{display:flex;align-items:center;gap:6px;margin:0;padding:0}
    .profile .badge-lists li a{display:flex;align-items:center;justify-content:center;width:32px;height:32px;margin:0;padding:0;border:1px solid var(--pm-line2);border-radius:0!important;background:#fff;color:var(--pm-ink);line-height:1;box-shadow:none}
    .profile .badge-lists li a i{display:block;width:auto;height:auto;margin:0;font-size:14px;line-height:1}
    .profile .badge-lists li a:hover{background:var(--pm-tint);border-color:var(--pm-soft);color:var(--pm)}
    .profile .badge-lists .badge{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;margin:0;padding:0 6px;border:0;border-radius:0!important;background:var(--pm);font-size:11px;font-weight:700;line-height:1}
    .profile h1{display:flex;align-items:baseline;gap:8px;margin:0 0 12px;font-size:18px;font-weight:700;line-height:1.3;color:var(--pm)}
    .profile h1 a{color:var(--pm)}
    .profile h1 small{margin-left:auto;font-size:12px;font-weight:400;color:var(--pm-mute)}
    /* the figures: four tiles (built from the site's own, which are hidden once the tiles stand) */
    .profile.pm-built .service-block-v3,.profile.pm-built .tag-box-v7,.profile.pm-built .badge-lists li:last-child{display:none}
    .pm-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0 0 12px}
    .pm-tile{display:flex;flex-direction:column;gap:2px;min-width:0;padding:10px 12px;border:1px solid var(--pm-line);background:#fff;color:var(--pm-ink);text-decoration:none}
    .pm-tile.link:hover{background:var(--pm-tint);border-color:var(--pm-soft);color:var(--pm-ink);text-decoration:none}
    .pm-label{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--pm-mute)}
    .pm-main{display:flex;align-items:baseline;gap:6px;font-size:18px;font-weight:700;line-height:1.3;overflow-wrap:anywhere}
    .pm-delta{font-size:12px;font-weight:600;color:var(--pm-mute)}
    .pm-delta.up{color:color-mix(in srgb,var(--pm-ok) 55%,#000)}
    .pm-delta.down{color:color-mix(in srgb,var(--pm-danger) 80%,#000)}
    .pm-sub{font-size:12px;color:var(--pm-mute)}
    /* the boxes: the same frame, the same band, the same height for the two panels */
    .profile .panel{margin:0 0 16px;border:1px solid var(--pm-line);background:#fff}
    .profile .panel-heading{display:flex;align-items:center;justify-content:space-between;min-height:40px;padding:0 12px;border:0;border-bottom:1px solid var(--pm-line);background:var(--pm-paper)!important}
    .profile .panel-title,.pm-title{float:none!important;margin:0;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--pm)}
    .profile .panel-title i{margin-right:4px}
    .profile .profile-notification-title-count{font-weight:400;color:var(--pm-mute)}
    .profile .profile-notification-actions{float:none;display:flex;gap:2px}
    .profile .profile-notification-actions .btn{display:grid;place-items:center;width:32px;height:32px;margin:0;padding:0;border:1px solid transparent;color:var(--pm-mute)}
    .profile .profile-notification-actions .btn:hover,.profile .profile-notification-actions .btn:focus{background:var(--pm-tint);border-color:var(--pm-soft);color:var(--pm)}
    .profile .panel-body.mCustomScrollbar,.profile ul.mCustomScrollbar{height:380px!important;max-height:380px;margin:0}
    .profile .profile-notification-card{margin:0;padding:10px 12px;border:0;border-bottom:1px solid var(--pm-line);border-left:3px solid var(--pm);background:#fff!important;box-shadow:none;color:var(--pm-ink)}
    .profile .profile-notification-card[data-notification-category=deleted]{border-left-color:var(--pm-danger)}
    .profile .profile-notification-card[data-notification-category=comments]{border-left-color:var(--pm-ok)}
    .profile .profile-notification-card[data-notification-category=awards]{border-left-color:var(--pm-warn)}
    .profile .profile-notification-card-type{font-size:12px;color:var(--pm-mute)}
    .profile .profile-notification-card-title a{font-size:14px;font-weight:700;color:var(--pm)}
    .profile .profile-notification-card-meta{font-size:12px;color:var(--pm-mute)}
    /* the notifications: one line each, the plate as its picture, the time on the right; the rest comes as the list is scrolled */
    .profile ul.mCustomScrollbar li > div{display:flex;align-items:center;gap:8px;min-height:44px;margin:0;padding:6px 12px;border-bottom:1px solid var(--pm-line);background:transparent!important;font-size:13px}
    .profile ul.mCustomScrollbar li > div:hover{background:var(--pm-tint)!important}
    .profile ul.mCustomScrollbar li a{color:var(--pm);font-weight:600}
    .profile ul.mCustomScrollbar li .fa-hand-o-right{color:var(--pm-mute)}
    .profile ul.mCustomScrollbar li .pull-right{margin:0 0 0 auto;font-size:12px;white-space:nowrap;color:var(--pm-mute)}
    .profile ul.mCustomScrollbar li .pull-right small{font-size:12px}
    .profile .pm-plate{display:block;height:26px;width:auto;border:1px solid var(--pm-line2)}
    .profile .pm-end{padding:10px 12px;font-size:12px;text-align:center;color:var(--pm-mute)}
    /* the countries: a band, then a table that lines up (flag and name left, the three figures right, in columns of one width) */
    .profile .panel-blue{margin:0 0 16px}
    .pm-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:40px;padding:0 12px;border-bottom:1px solid var(--pm-line);background:var(--pm-paper)}
    .pm-chk{display:inline-flex;align-items:center;gap:6px;margin:0;font-size:12px;font-weight:400;color:var(--pm-mute);cursor:pointer}
    .pm-chk input{margin:0}
    ${PM_FLAG_CSS}
    .profile .panel-blue:not(.pm-all) tr.pm-empty{display:none}
    .profile .dataTables_wrapper > .row:first-child,.profile .dataTables_info{display:none}
    .profile .panel-blue .table{width:100%!important;margin:0;font-size:13px;table-layout:fixed}
    .profile .panel-blue .table th,.profile .panel-blue .table td{padding:0 12px!important;height:38px;vertical-align:middle;border-top:1px solid var(--pm-line);color:var(--pm-ink)}
    .profile .panel-blue .table thead th{height:36px;border-top:0;border-bottom:1px solid var(--pm-line2);font-weight:400;color:var(--pm-mute);background-image:none!important}
    .profile .panel-blue .table th:not(:first-child),.profile .panel-blue .table td:not(:first-child){width:88px!important;text-align:right;font-variant-numeric:tabular-nums}
    .profile .panel-blue .table td:not(:first-child) i{display:none}
    .profile .panel-blue .table td:not(:first-child) a{color:var(--pm-ink);font-weight:400}
    .profile .panel-blue .table td:not(:first-child) a:hover{color:var(--pm);text-decoration:underline}
    .profile .panel-blue .table td font{font-size:12px;color:color-mix(in srgb,var(--pm-ok) 55%,#000)!important}
    .profile .panel-blue .table thead .fa-lg{font-size:14px;vertical-align:middle}
    .profile table.dataTable thead .sorting:before,.profile table.dataTable thead .sorting:after,.profile table.dataTable thead .sorting_asc:before,.profile table.dataTable thead .sorting_desc:before,.profile table.dataTable thead .sorting_asc_disabled:before,.profile table.dataTable thead .sorting_desc_disabled:before{content:none!important;display:none!important}
    .profile table.dataTable thead .sorting_asc:after,.profile table.dataTable thead .sorting_desc:after{content:''!important;position:static!important;display:inline-block!important;width:0;height:0;margin-left:6px;border:4px solid transparent;opacity:1!important;vertical-align:middle}
    .profile table.dataTable thead .sorting_asc:after{border-top:0;border-bottom:5px solid var(--pm)}
    .profile table.dataTable thead .sorting_desc:after{border-bottom:0;border-top:5px solid var(--pm)}
    .profile .panel-blue .table td:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .profile .panel-blue .table td:first-child b a{color:var(--pm-ink)}
    .profile .panel-blue .table td:first-child .fa-cloud-upload{color:var(--pm-line2)!important}
    .profile .panel-blue .table tbody tr:hover td{background:var(--pm-tint)}
    /* the last photos: the same band, then an even grid of cards (built in profile-parts.js); nothing is written over a photo */
    .profile .col-md-5 > h3{display:flex;align-items:center;min-height:40px;margin:0;padding:0 12px;border:1px solid var(--pm-line);background:var(--pm-paper);font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--pm)}
    .profile .portfolio-box-v1{margin:0 0 16px;padding:12px 6px 0;border:1px solid var(--pm-line);border-top:0;background:#fff}
    .profile .portfolio-box-v1 li{padding:0 6px 12px;background:none}
    .profile .pm-card-li > :not(.pm-card){display:none!important}
    .pm-card{display:flex;flex-direction:column;border:1px solid var(--pm-line2);background:#fff;color:var(--pm-ink);text-decoration:none;transition:box-shadow .15s,transform .15s,border-color .15s}
    .pm-card:hover,.pm-card:focus{border-color:var(--pm-soft);box-shadow:0 6px 16px rgba(0,0,0,.18);transform:translateY(-2px);color:var(--pm-ink);text-decoration:none}
    .pm-photo{position:relative;display:block;aspect-ratio:4/3;overflow:hidden;background:var(--pm-soft)}
    .pm-photo > img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .25s}
    .pm-card:hover .pm-photo > img{transform:scale(1.04)}
    .pm-badge{position:absolute;left:8px;top:8px;padding:3px;border:1px solid var(--pm-line2);background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35);line-height:0}
    .pm-badge .pm-flag{margin:0;vertical-align:top}
    .pm-plate-well{display:flex;align-items:center;justify-content:center;min-height:48px;padding:6px 8px;border-top:1px solid var(--pm-line);background:var(--pm-paper)}
    .pm-plate-text{font-size:16px;font-weight:700;line-height:1.2;letter-spacing:.04em;text-align:center;overflow-wrap:anywhere;color:var(--pm-ink)}
    .pm-plate-well img{display:block;width:auto;max-width:100%;height:34px}
    .pm-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-top:1px solid var(--pm-line);font-size:13px;color:var(--pm-ink)}
    .pm-meta b{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .pm-meta span{flex:none;font-size:12px;color:color-mix(in srgb,var(--pm-ink) 80%,#fff)}
    @media (max-width:760px){.pm-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}.profile > .row:first-child > .col-md-3{flex:1 1 100%}}
  `;
