
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const API = '/data/content.json';
const state = { items: [], user: JSON.parse(localStorage.getItem('ls_user') || 'null'), watchlist: JSON.parse(localStorage.getItem('ls_watchlist') || '[]') };
const thumb = id => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
const fallback = id => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
const embed = id => `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&controls=1`;
const byId = id => state.items.find(x => x && x.id === id);
function slugFromPath(){ const p = location.pathname.split('/').filter(Boolean); return p[0] === 'watch' ? p[1] : new URLSearchParams(location.search).get('slug') || new URLSearchParams(location.search).get('id'); }
function saveWatchlist(){ localStorage.setItem('ls_watchlist', JSON.stringify(state.watchlist)); }
function toast(msg){ const el = $('#toast'); if(!el) return; el.textContent = msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'), 1800); }
function safe(v){ return String(v ?? '').replace(/[<>&"]/g, s => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[s])); }
function img(id, title='poster'){ return `<img src="${thumb(id)}" onerror="this.onerror=null;this.src='${fallback(id)}'" alt="${safe(title)}">`; }
function card(item){
  const inList = state.watchlist.includes(item.id);
  const coming = item.type === 'Upcoming 2026 Trailer';
  const isMovie = item.type === 'Full Movie';
  const trailerBtn = (coming || isMovie) ? `<button class="mini-btn red" data-trailer="${item.trailerYoutubeId || item.youtubeId}">▶ Trailer</button>` : '';
  return `<article class="card ${coming ? 'trailer-card' : ''}">
    <a href="/watch/${item.id}" class="thumb">${img(item.youtubeId,item.title)}<span class="badge">${safe(item.type)}</span>${coming?'<span class="corner">2026</span>':''}<span class="duration-tag">${safe(item.duration)}</span></a>
    <div class="card-body"><h3>${safe(item.title)}</h3>
      <div class="meta"><span class="pill">${safe(item.genre)}</span><span class="pill">${safe(item.rating)}</span><span class="pill">${safe(item.watchTimeLabel || 'Watch time')}: ${safe(item.duration)}</span></div>
      <p>${safe(item.synopsis)}</p>
      <div class="card-actions"><a class="mini-btn primary" href="/watch/${item.id}">▶ ${coming?'Watch Trailer':'Play'}</a>${trailerBtn}<button class="mini-btn" data-watchlist="${item.id}">${inList?'✓ My List':'+ My List'}</button></div>
    </div>
  </article>`;
}
async function load(){
  const res = await fetch(API); const data = await res.json();
  state.items = [...(data.items || []), ...(data.upcoming || []), ...(data.series || [])];
  renderUser();
  if($('#featuredRail')) renderHome(data);
  if($('#catalogGrid')) renderBrowse();
  if($('#watchPage')) renderWatch();
  bindGlobal();
}
function renderUser(){ const label = state.user ? state.user.name : 'Login'; $$('.loginLabel').forEach(x=>x.textContent = label); }
function renderHome(){
  const featured = state.items.filter(x=>x.featured && x.type !== 'Upcoming 2026 Trailer').slice(0,4);
  const hero = featured[0] || state.items[0];
  if(hero && $('#heroBackdrop')) $('#heroBackdrop').style.backgroundImage = `linear-gradient(90deg,#050505 0%,rgba(5,5,5,.88) 30%,rgba(5,5,5,.42) 60%,rgba(5,5,5,.86) 100%),linear-gradient(0deg,#050505 0%,rgba(5,5,5,.04) 45%,rgba(5,5,5,.18) 100%),url('${thumb(hero.youtubeId)}')`;
  $('#featuredRail').innerHTML = featured.map(card).join('');
  $('#shortRail').innerHTML = state.items.filter(x=>x.type==='Short Film').slice(0,6).map(card).join('');
  $('#movieRail').innerHTML = state.items.filter(x=>x.type==='Full Movie').slice(0,6).map(card).join('');
  if($('#upcomingRail')) $('#upcomingRail').innerHTML = state.items.filter(x=>x.type==='Upcoming 2026 Trailer').map(card).join('');
  $('#continueRail').innerHTML = state.watchlist.length ? state.watchlist.map(byId).filter(Boolean).map(card).join('') : `<div class="empty">Your saved list will appear here. Click “+ My List” on any title.</div>`;
}
function renderBrowse(){
  const params = new URLSearchParams(location.search); const typeParam = params.get('type');
  if(typeParam && $('#typeFilter')) $('#typeFilter').value = typeParam;
  applyBrowse(); $('#searchBox').addEventListener('input', applyBrowse); $('#typeFilter').addEventListener('change', applyBrowse); $('#genreFilter').addEventListener('change', applyBrowse);
}
function applyBrowse(){
  const q = ($('#searchBox')?.value || '').toLowerCase(); const type = $('#typeFilter')?.value || 'All'; const genre = $('#genreFilter')?.value || 'All';
  const items = state.items.filter(x => (type==='All'||x.type===type) && (genre==='All'||x.genre.toLowerCase().includes(genre.toLowerCase()) || (x.tags||[]).join(' ').toLowerCase().includes(genre.toLowerCase())) && (!q || [x.title,x.genre,x.type,x.synopsis,(x.tags||[]).join(' '),x.cast,x.director,x.releaseWindow,x.duration].join(' ').toLowerCase().includes(q)) );
  $('#catalogGrid').innerHTML = items.length ? items.map(card).join('') : `<div class="empty">No results found. Try another search or category.</div>`;
}
function detailRow(label, value){ return `<div><small>${label}</small><strong>${safe(value || 'TBC')}</strong></div>`; }
function renderWatch(){
  const id = slugFromPath() || 'sf-001'; const item = byId(id) || state.items[0]; document.title = `${item.title} | LondonFlix`;
  const isMovie = item.type === 'Full Movie'; const coming = item.type === 'Upcoming 2026 Trailer';
  const related = state.items.filter(x=>x.id!==item.id && (x.type===item.type || x.genre===item.genre)).slice(0,5);
  const trailerButton = (isMovie || coming) ? `<button class="btn info" data-trailer="${item.trailerYoutubeId || item.youtubeId}">▶ Watch Trailer</button>` : '';
  $('#watchPage').innerHTML = `<div class="watch-layout"><div class="player-shell"><div class="player"><iframe src="${embed(item.youtubeId)}" title="${safe(item.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe></div><div class="player-note">Embedded privacy-enhanced player. External YouTube links are not shown in the app UI, but YouTube player branding is controlled by YouTube.</div>
  <div class="watch-info"><section class="panel"><span class="eyebrow">${safe(item.type)} • ${safe(item.rating)} • ${safe(item.language)}</span><h1>${safe(item.title)}</h1><div class="meta"><span class="pill">${safe(item.genre)}</span><span class="pill">${safe(item.year)}</span><span class="pill">${safe(item.watchTimeLabel || 'Watch time')}: ${safe(item.duration)}</span><span class="pill">${safe(item.region)}</span></div><p class="synopsis">${safe(item.synopsis)}</p><div class="hero-actions"><a class="btn play" href="#">▶ Play Now</a>${trailerButton}<button class="btn muted" data-watchlist="${item.id}">${state.watchlist.includes(item.id)?'✓ In My List':'+ My List'}</button></div><div class="details-grid">${detailRow('Availability',item.availability)}${detailRow('Release Window',item.releaseWindow)}${detailRow('Director',item.director)}${detailRow('Cast',item.cast)}${detailRow('Runtime / Watch Time',item.duration)}${detailRow('Maturity Rating',item.maturity || item.rating)}${detailRow('Audio',item.audio)}${detailRow('Subtitles',item.subtitles)}${detailRow('Format',item.format)}${detailRow('Quality',item.quality)}${detailRow('Plans',item.plans)}${detailRow('Content Advice',item.contentAdvice)}${detailRow('Tags',(item.tags||[]).join(', '))}</div></section></div></div>
  <aside class="panel side-panel"><h3>More like this</h3><div class="related-list">${related.map(x=>`<a href="/watch/${x.id}" class="related">${img(x.youtubeId,x.title)}<span><b>${safe(x.title)}</b><br><small>${safe(x.genre)} • ${safe(x.duration)}</small></span></a>`).join('')}</div></aside></div>`;
}
function openTrailer(id){ const modal=$('#trailerModal'); const frame=$('#trailerFrame'); if(!modal||!frame||!id) return; frame.innerHTML=`<iframe src="${embed(id)}&autoplay=1" title="Trailer" sandbox="allow-scripts allow-same-origin allow-presentation" allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin"></iframe>`; modal.classList.add('open'); }
function closeTrailer(){ const modal=$('#trailerModal'); const frame=$('#trailerFrame'); if(frame) frame.innerHTML=''; if(modal) modal.classList.remove('open'); }
function bindGlobal(){
  document.body.addEventListener('click', e=>{
    const t=e.target.closest('[data-trailer]'); if(t){ e.preventDefault(); openTrailer(t.dataset.trailer); }
    if(e.target.closest('[data-trailer-close]')) closeTrailer();
    const w = e.target.closest('[data-watchlist]'); if(w){ const id = w.dataset.watchlist; state.watchlist = state.watchlist.includes(id) ? state.watchlist.filter(x=>x!==id) : [...state.watchlist,id]; saveWatchlist(); toast(state.watchlist.includes(id)?'Added to My List':'Removed from My List'); if($('#featuredRail')) renderHome(); if($('#catalogGrid')) applyBrowse(); if($('#watchPage')) renderWatch(); }
    if(e.target.closest('[data-login]')) $('#loginModal')?.classList.add('open');
    if(e.target.closest('[data-close]')) $('#loginModal')?.classList.remove('open');
  });
  const form=$('#loginForm'); if(form) form.addEventListener('submit', e=>{ e.preventDefault(); const name=$('#name').value||'Viewer'; state.user={name,plan:'Demo Premium'}; localStorage.setItem('ls_user', JSON.stringify(state.user)); $('#loginModal')?.classList.remove('open'); renderUser(); toast('Demo login successful'); });
}
document.addEventListener('DOMContentLoaded', load);
