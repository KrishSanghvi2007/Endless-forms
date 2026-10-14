/* ================= ?v1=1 switch and v2 retitles (API_v2 §6.2; D5 decision 26) =================
   Loads last of the v2 files, just before boot.js registers chapters and applies PLAN_ADD.
   ?v1=1 is the legacy game: no v2 chapter and no added menu entry (00_entry.js has already skipped the PLAN rewrite and
   its wraps, and Save keeps the legacy key). Otherwise a rebuilt unit that sets plan: [title, subtitle] retitles its menu
   entry, whether that entry is in PLAN or comes from PLAN_ADD (D3's new titles land with their rebuilds). */
if (Url.v1) { V2.length = 0; PLAN_ADD.length = 0; }
else {
  const entries = PLAN.flatMap(p => p.c).concat(PLAN_ADD.map(a => a && a.entry).filter(Boolean));
  for (const ch of V2) {
    if (!isV2(ch) || !Array.isArray(ch.plan)) continue;
    const e = entries.find(x => x[0] === ch.id); if (!e) continue;
    if (ch.plan[0]) e[1] = String(ch.plan[0]);
    if (ch.plan[1]) e[2] = String(ch.plan[1]);
  }
}
