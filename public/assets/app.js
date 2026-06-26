const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const API = '/data/content.json';
const state = { items: [], user: JSON.parse(localStorage.getItem('ls_user') || 'null'), watchlist: JSON.parse(localStorage.getItem('ls_watchlist') || '[]') };
const thumb = id => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
const embed = id => `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1`;
const byId = id => state.items.find(x => x.id === id);
function slugFromPath(){ const p = location.pathname.split('/').filter(Boolean); return p[0] === 'watch' ? p[1] : new URLSearchParams(location.search).get('slug') || new URLSearchParams(location.search).get('id'); }
function saveWatchlist(){ localStorage.setItem('ls_watchlist', JSON.stringify(state.watchlist)); }
function toast(msg){ const el = $('#toast'); if(!el) return; el.textContent = msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'), 1800); }
function safe(v){ return String(v || '').replace(/[<>&"]/g, s => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[s])); }
function card(item){
  const inList = state.watchlist.includes(item.id);
  const coming = item.type === 'Upcoming 2026 Trailer';
  return `<article class="card ${coming ? 'trailer-card' : ''}">
    <a href="/watch/${item.id}" class="thumb"><img src="${thumb(item.youtubeId)}" onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg'" alt="${safe(item.title)} poster"><span class="badge">${safe(item.type)}</span>${coming?'<span class="corner">2026</span>':''}</a>
    <div class="card-body">
      <h3>${safe(item.title)}</h3>
      <div class="meta"><span class="pill">${safe(item.genre)}</span><span class="pill">${safe(item.rating)}</span><span class="pill">${safe(item.duration)}</span></div>
      <p>${safe(item.synopsis)}</p>
      <div class="card-actions"><a class="btn red" href="/watch/${item.id}">▶ ${coming?'Trailer':'Watch'}</a><button class="btn alt" data-watchlist="${item.id}">${inList?'✓ Saved':'+ List'}</button></div>
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
function renderUser(){
  const label = state.user ? `Hi, ${state.user.name}` : 'Login';
  $$('.loginLabel').forEach(x=>x.textContent = label);
}
function renderHome(){
  const featured = state.items.filter(x=>x.featured && x.type !== 'Upcoming 2026 Trailer').slice(0,4);
  $('#heroPosters').innerHTML = featured.map(x=>`<a class="poster" href="/watch/${x.id}"><img src="${thumb(x.youtubeId)}" onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${x.youtubeId}/hqdefault.jpg'" alt="${safe(x.title)}"><span>${safe(x.title)}</span></a>`).join('');
  $('#featuredRail').innerHTML = featured.map(card).join('');
  $('#shortRail').innerHTML = state.items.filter(x=>x.type==='Short Film').slice(0,4).map(card).join('');
  $('#movieRail').innerHTML = state.items.filter(x=>x.type==='Full Movie').slice(0,4).map(card).join('');
  if($('#upcomingRail')) $('#upcomingRail').innerHTML = state.items.filter(x=>x.type==='Upcoming 2026 Trailer').map(card).join('');
  $('#continueRail').innerHTML = state.watchlist.length ? state.watchlist.map(byId).filter(Boolean).map(card).join('') : `<div class="empty">Your saved watchlist will appear here. Click “+ List” on any title.</div>`;
}
function renderBrowse(){
  const params = new URLSearchParams(location.search);
  const typeParam = params.get('type');
  if(typeParam && $('#typeFilter')) $('#typeFilter').value = typeParam;
  applyBrowse();
  $('#searchBox').addEventListener('input', applyBrowse);
  $('#typeFilter').addEventListener('change', applyBrowse);
  $('#genreFilter').addEventListener('change', applyBrowse);
}
function applyBrowse(){
  const q = ($('#searchBox')?.value || '').toLowerCase();
  const type = $('#typeFilter')?.value || 'All';
  const genre = $('#genreFilter')?.value || 'All';
  const items = state.items.filter(x =>
    (type==='All' || x.type===type) &&
    (genre==='All' || x.genre.toLowerCase().includes(genre.toLowerCase()) || x.tags.join(' ').toLowerCase().includes(genre.toLowerCase())) &&
    (!q || [x.title,x.genre,x.type,x.synopsis,x.tags.join(' '),x.cast,x.director,x.releaseWindow].join(' ').toLowerCase().includes(q))
  );
  $('#catalogGrid').innerHTML = items.length ? items.map(card).join('') : `<div class="empty">No results found. Try another search or category.</div>`;
}
function detailRow(label, value){ return `<div><small>${label}</small><strong>${safe(value || 'TBC')}</strong></div>`; }
function renderWatch(){
  const id = slugFromPath() || 'sf-001';
  const item = byId(id) || state.items[0];
  document.title = `${item.title} | LondonFlix`;
  const related = state.items.filter(x=>x.id!==item.id && (x.type===item.type || x.genre===item.genre)).slice(0,4);
  $('#watchPage').innerHTML = `<div class="player-shell"><div class="player"><iframe src="${embed(item.youtubeId)}" title="${safe(item.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><div class="player-note">Embedded privacy-enhanced player. External YouTube navigation is restricted where browser support allows.</div></div>
  <div class="watch-info">
    <div class="panel"><div class="eyebrow">${safe(item.type)} • ${safe(item.rating)} • ${safe(item.language)}</div><h1>${safe(item.title)}</h1><div class="meta"><span class="pill">${safe(item.genre)}</span><span class="pill">${safe(item.year)}</span><span class="pill">${safe(item.duration)}</span><span class="pill">${safe(item.region)}</span></div><p class="synopsis">${safe(item.synopsis)}</p>
    <div class="details-grid">${detailRow('Availability',item.availability)}${detailRow('Release Window',item.releaseWindow)}${detailRow('Director',item.director)}${detailRow('Cast',item.cast)}${detailRow('Audio',item.audio)}${detailRow('Subtitles',item.subtitles)}${detailRow('Format',item.format)}${detailRow('Quality',item.quality)}${detailRow('Content Advice',item.contentAdvice)}${detailRow('Tags',item.tags.join(', '))}</div>
    <button class="btn gold" data-watchlist="${item.id}">${state.watchlist.includes(item.id)?'✓ Saved to Watchlist':'+ Add to Watchlist'}</button></div>
    <aside class="panel"><h3>More like this</h3><div class="related-list">${related.map(x=>`<a href="/watch/${x.id}" class="related"><img src="${thumb(x.youtubeId)}" onerror="this.onerror=null;this.src='https://img.youtube.com/vi/${x.youtubeId}/hqdefault.jpg'"><span><b>${safe(x.title)}</b><br><small>${safe(x.genre)} • ${safe(x.rating)}</small></span></a>`).join('')}</div></aside>
  </div>`;
}
function bindGlobal(){
  document.body.addEventListener('click', e=>{
    const w = e.target.closest('[data-watchlist]');
    if(w){ const id = w.dataset.watchlist; state.watchlist = state.watchlist.includes(id) ? state.watchlist.filter(x=>x!==id) : [...state.watchlist,id]; saveWatchlist(); toast(state.watchlist.includes(id)?'Added to watchlist':'Removed from watchlist'); if($('#featuredRail')) renderHome(); if($('#catalogGrid')) applyBrowse(); if($('#watchPage')) renderWatch(); }
    if(e.target.closest('[data-login]')) $('#loginModal').classList.add('open');
    if(e.target.closest('[data-close]')) $('#loginModal').classList.remove('open');
    if(e.target.closest('[data-logout]')){ localStorage.removeItem('ls_user'); state.user=null; renderUser(); toast('Logged out'); }
  });
  const form = $('#loginForm');
  if(form) form.addEventListener('submit', e=>{ e.preventDefault(); const name = $('#name').value || 'Viewer'; state.user = {name, plan:'Demo Premium'}; localStorage.setItem('ls_user', JSON.stringify(state.user)); $('#loginModal').classList.remove('open'); renderUser(); toast('Demo login successful'); });
}
document.addEventListener('DOMContentLoaded', load);
