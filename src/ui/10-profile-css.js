  /* =====================================================================
   *  PROFILE STYLE  (the site's own profile page, brought into the look of the script: flat rectangles, one blue, the greys, the type scale)
   *    Nothing is rebuilt: the site's elements stay where they are with their own scripts (sort, filter and delete of the messages, load more
   *    of the notifications, the table's sort), only their look changes. The colours are the page-level constants (SITE_BLUE, PAGE_GREY):
   *    this CSS lives on the page, where the panel's tokens do not reach. Scoped to the profile container.
   * ===================================================================== */
  const PROFILE_CSS = `
    .container.profile{${PAGE_TOKENS}}
    .profile .panel,.profile .tag-box,.profile .service-block-v3{border-radius:0;box-shadow:none}
    /* the member: picture and badges on the left, name and figures on the right, in one box */
    .profile > .row:first-child{display:flex;flex-wrap:wrap;gap:16px;margin:0 0 16px;padding:16px;border:1px solid var(--pm-line);background:#fff}
    .profile > .row:first-child > [class*=col-md]{float:none;width:auto;padding:0}
    .profile > .row:first-child > .col-md-3{flex:0 0 150px}
    .profile > .row:first-child > .col-md-9{flex:1 1 320px;min-width:0}
    .profile .profile-img{width:120px;height:120px;margin:0 auto 12px;object-fit:cover;border:1px solid var(--pm-line2)}
    .profile .devider{display:none}
    .profile .badge-lists{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 6px;margin:0;padding:0}
    .profile .badge-lists li{display:flex;align-items:center;gap:4px;padding:0}
    .profile .badge-lists li a{display:grid;place-items:center;width:32px;height:32px;border:1px solid var(--pm-line2);background:#fff;color:var(--pm-ink)}
    .profile .badge-lists li a:hover{background:var(--pm-tint);border-color:var(--pm-soft);color:var(--pm)}
    .profile .badge-lists .badge{border-radius:0;font-size:11px;line-height:1.6;background:var(--pm)}
    .profile h1{display:flex;align-items:baseline;gap:8px;margin:0 0 12px;font-size:18px;font-weight:700;line-height:1.3;color:var(--pm)}
    .profile h1 a{color:var(--pm)}
    .profile h1 small{margin-left:auto;font-size:12px;font-weight:400;color:var(--pm-mute)}
    /* the figures: the uploads, then the likes and the comments, as tiles */
    .profile .service-block-v3{display:flex;align-items:center;gap:10px;margin:0 0 8px;padding:10px 12px;border:1px solid var(--pm-line);background:var(--pm-paper);text-align:left}
    .profile .service-block-v3 i{font-size:16px;color:var(--pm);margin:0}
    .profile .service-block-v3 .service-heading{flex:1;min-width:0;margin:0;font-size:13px;font-weight:400;color:var(--pm-mute)}
    .profile .service-block-v3 .counter{margin:0;font-size:18px;font-weight:700}
    .profile .service-block-v3 .counter a{color:var(--pm-ink)}
    .profile .tag-box-v7{display:flex;flex-wrap:wrap;margin:0;padding:0;border:1px solid var(--pm-line);background:#fff}
    .profile .tag-box-v7 .service-in{float:none;flex:1 1 200px;width:auto;padding:10px 12px}
    .profile .tag-box-v7 .service-in + .service-in{border-left:1px solid var(--pm-line)}
    .profile h4.counter{margin:0;padding:3px 0;font-size:13px;font-weight:400;color:var(--pm-mute)}
    .profile h4.counter b,.profile h4.counter b a{font-size:16px;font-weight:700;color:var(--pm-ink)}
    .profile h4.counter .badge{border-radius:0;font-size:11px}
    /* the two panels: the same box, the same header, the same height */
    .profile .panel{margin:0 0 16px;border:1px solid var(--pm-line);background:#fff}
    .profile .panel-heading{display:flex;align-items:center;justify-content:space-between;min-height:40px;padding:0 12px;border:0;border-bottom:1px solid var(--pm-line);background:var(--pm-paper)!important}
    .profile .panel-title{float:none!important;margin:0;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--pm)}
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
    .profile ul.mCustomScrollbar li > div{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0;padding:8px 12px;border-bottom:1px solid var(--pm-line);background:transparent!important;font-size:13px}
    .profile ul.mCustomScrollbar li > div:hover{background:var(--pm-tint)!important}
    .profile ul.mCustomScrollbar li a{color:var(--pm);font-weight:600}
    .profile ul.mCustomScrollbar li .pull-right{margin:0 0 0 auto;font-size:12px;color:var(--pm-mute)}
    .profile #load{display:block;width:100%;height:38px;border:1px solid var(--pm);border-radius:0;background:var(--pm);color:#fff;font-weight:600;cursor:pointer}
    .profile #load:hover{background:var(--pm-h);border-color:var(--pm-h)}
    /* the countries: the table, quiet */
    .profile .panel-blue .table{margin:0;font-size:13px}
    .profile .panel-blue .table th{padding:10px 12px;border-bottom:1px solid var(--pm-line2);font-size:13px;color:var(--pm-mute)}
    .profile .panel-blue .table td{padding:8px 12px;border-top:1px solid var(--pm-line);vertical-align:middle;color:var(--pm-ink)}
    .profile .panel-blue .table td:first-child b a{color:var(--pm-ink)}
    .profile .panel-blue .table tbody tr:hover td{background:var(--pm-tint)}
    .profile .panel-blue .table .fa-lg{font-size:14px}
    /* the last photos: an even grid */
    .profile h3{margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--pm)}
    .profile .portfolio-box-v1{margin:0 -6px 16px}
    .profile .portfolio-box-v1 li{padding:0 6px 12px}
    .profile .portfolio-box-v1 li > img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border:1px solid var(--pm-line2)}
    .profile .portfolio-box-v1-in{position:relative;padding:6px 0 0}
    .profile .portfolio-box-v1-in h3{margin:0;font-size:14px;letter-spacing:0;text-transform:none;color:var(--pm-ink)}
    .profile .portfolio-box-v1-in p{margin:0;font-size:12px;color:var(--pm-mute)}
    .profile .portfolio-box-v1-in .btn-u{position:absolute;right:0;top:6px;display:grid;place-items:center;width:32px;height:32px;padding:0;border:1px solid var(--pm-line2);border-radius:0;background:#fff;color:var(--pm)}
    .profile .portfolio-box-v1-in .btn-u:hover{background:var(--pm-tint);border-color:var(--pm-soft)}
  `;
