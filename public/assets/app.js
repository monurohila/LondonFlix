const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const API = '/data/content.json';
const state = { items: [], user: JSON.parse(localStorage.getItem('ls_user') || 'null'), watchlist: JSON.parse(localStorage.getItem('ls_watchlist') || '[]') };
const thumb = id => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
const byId = id => state.items.find(x => x.id === id);
function slugFromPath(){ const p = location.pathname.split('/').filter(Boolean); return p[0] === 'watch' ? p[1] : new URLSearchParams(location.search).get('slug') || new URLSearchParams(location.search).get('id'); }
function saveWatchlist(){ localStorage.setItem('ls_watchlist', JSON.stringify(state.watchlist)); }
function toast(msg){ const el = $('#toast'); if(!el) return; el.textContent = msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'), 1800); }
function card(item){
  const inList = state.watchlist.includes(item.id);
  return `<article class="card">
    <a href="/watch/${item.id}" class="thumb"><img src="${thumb(item.youtubeId)}" alt="${item.title} poster"><span class="badge">${item.type}</span></a>
    <div class="card-body">
      <h3>${item.title}</h3>
      <div class="meta"><span class="pill">${item.genre}</span><span class="pill">${item.rating}</span><span class="pill">${item.duration}</span></div>
      <p>${item.synopsis}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn red" href="/watch/${item.id}">▶ Watch</a><button class="btn alt" data-watchlist="${item.id}">${inList?'✓ Saved':'+ List'}</button></div>
    </div>
  </article>`;
}
async function load(){
  const res = await fetch(API); const data = await res.json();
  state.items = [...data.items, ...(data.series || [])];
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
  const featured = state.items.filter(x=>x.featured).slice(0,4);
  $('#heroPosters').innerHTML = featured.map(x=>`<a class="poster" href="/watch/${x.id}"><img src="${thumb(x.youtubeId)}" alt="${x.title}"><span>${x.title}</span></a>`).join('');
  $('#featuredRail').innerHTML = featured.map(card).join('');
  $('#shortRail').innerHTML = state.items.filter(x=>x.type==='Short Film').slice(0,4).map(card).join('');
  $('#movieRail').innerHTML = state.items.filter(x=>x.type==='Full Movie').slice(0,4).map(card).join('');
  $('#continueRail').innerHTML = state.watchlist.length ? state.watchlist.map(byId).filter(Boolean).map(card).join('') : `<div class="empty">Your saved watchlist will appear here. Click “+ List” on any title.</div>`;
}
function renderBrowse(){
  const params = new URLSearchParams(location.search);
  const typeParam = params.get('type');
  if(typeParam) $('#typeFilter').value = typeParam;
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
    (!q || [x.title,x.genre,x.type,x.synopsis,x.tags.join(' ')].join(' ').toLowerCase().includes(q))
  );
  $('#catalogGrid').innerHTML = items.length ? items.map(card).join('') : `<div class="empty">No results found. Try another search or category.</div>`;
}
function renderWatch(){
  const id = slugFromPath() || 'sf-001';
  const item = byId(id) || state.items[0];
  document.title = `${item.title} | LondonStream`;
  $('#watchPage').innerHTML = `<div class="player"><iframe src="https://www.youtube.com/embed/${item.youtubeId}?rel=0&modestbranding=1" title="${item.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
  <div class="watch-info">
    <div class="panel"><div class="eyebrow">${item.type} • ${item.rating} • ${item.language}</div><h1>${item.title}</h1><div class="meta"><span class="pill">${item.genre}</span><span class="pill">${item.year}</span><span class="pill">${item.duration}</span><span class="pill">${item.region}</span></div><p style="color:#d6d6e5;line-height:1.7">${item.synopsis}</p><p style="color:#aaaabc"><b>Cast:</b> ${item.cast || 'Demo cast'}<br><b>Tags:</b> ${item.tags.join(', ')}</p><button class="btn gold" data-watchlist="${item.id}">${state.watchlist.includes(item.id)?'✓ Saved to Watchlist':'+ Add to Watchlist'}</button></div>
    <aside class="panel"><h3>More like this</h3><div style="display:grid;gap:12px">${state.items.filter(x=>x.id!==item.id && x.type===item.type).slice(0,4).map(x=>`<a href="/watch/${x.id}" style="display:grid;grid-template-columns:104px 1fr;gap:12px;align-items:center"><img src="${thumb(x.youtubeId)}" style="width:104px;border-radius:12px"><span><b>${x.title}</b><br><small style="color:#aaaabc">${x.genre} • ${x.rating}</small></span></a>`).join('')}</div></aside>
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
