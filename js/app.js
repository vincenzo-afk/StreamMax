/* =========================================================
   StreamMax — App logic
   ========================================================= */

/* ---------- Genre ID maps (TMDb) ---------- */
const GENRE = {
  movie: { action: 28, comedy: 35, horror: 27, scifi: 878, romance: 10749, thriller: 53, animation: 16, family: 10751, crime: 80, documentary: 99 },
  tv:    { actionAdventure: 10759, comedy: 35, drama: 18, crime: 80, sciFiFantasy: 10765, animation: 16, kids: 10762, reality: 10764, mystery: 9648, documentary: 99 }
};

/* ---------- Row configurations per view ---------- */
const ROW_CONFIGS = {
  home: [
    { title: 'Trending Now', badge: 'HOT', mediaType: 'mixed', fetch: () => TMDb.trending('all', 'day') },
    { title: 'Popular Movies', mediaType: 'movie', fetch: () => TMDb.popularMovies() },
    { title: 'Popular TV Shows', mediaType: 'tv', fetch: () => TMDb.popularTV() },
    { title: 'Top Rated Movies', badge: 'TOP', mediaType: 'movie', fetch: () => TMDb.topRatedMovies() },
    { title: 'Top Rated TV Shows', badge: 'TOP', mediaType: 'tv', fetch: () => TMDb.topRatedTV() },
    { title: 'Action Movies', mediaType: 'movie', fetch: () => TMDb.byGenreMovie(GENRE.movie.action) },
    { title: 'Comedy Movies', mediaType: 'movie', fetch: () => TMDb.byGenreMovie(GENRE.movie.comedy) },
    { title: 'Horror Movies', mediaType: 'movie', fetch: () => TMDb.byGenreMovie(GENRE.movie.horror) },
    { title: 'Sci-Fi Movies', mediaType: 'movie', fetch: () => TMDb.byGenreMovie(GENRE.movie.scifi) },
    { title: 'Crime TV Shows', mediaType: 'tv', fetch: () => TMDb.byGenreTV(GENRE.tv.crime) },
    { title: 'Documentaries', mediaType: 'movie', fetch: () => TMDb.byGenreMovie(GENRE.movie.documentary) }
  ],
  movies: [
    { title: 'Popular Movies', mediaType: 'movie', fetch: () => TMDb.popularMovies() },
    { title: 'Top Rated Movies', badge: 'TOP', mediaType: 'movie', fetch: () => TMDb.topRatedMovies() },
    { title: 'Now Playing', badge: 'NEW', mediaType: 'movie', fetch: () => TMDb.nowPlayingMovies() },
    { title: 'Upcoming', mediaType: 'movie', fetch: () => TMDb.upcomingMovies() },
    { title: 'Action', mediaType: 'movie', fetch: () => TMDb.byGenreMovie(GENRE.movie.action) },
    { title: 'Comedy', mediaType: 'movie', fetch: () => TMDb.byGenreMovie(GENRE.movie.comedy) },
    { title: 'Horror', mediaType: 'movie', fetch: () => TMDb.byGenreMovie(GENRE.movie.horror) },
    { title: 'Science Fiction', mediaType: 'movie', fetch: () => TMDb.byGenreMovie(GENRE.movie.scifi) },
    { title: 'Romance', mediaType: 'movie', fetch: () => TMDb.byGenreMovie(GENRE.movie.romance) },
    { title: 'Thriller', mediaType: 'movie', fetch: () => TMDb.byGenreMovie(GENRE.movie.thriller) },
    { title: 'Animation', mediaType: 'movie', fetch: () => TMDb.byGenreMovie(GENRE.movie.animation) },
    { title: 'Family', mediaType: 'movie', fetch: () => TMDb.byGenreMovie(GENRE.movie.family) }
  ],
  tv: [
    { title: 'Popular TV Shows', mediaType: 'tv', fetch: () => TMDb.popularTV() },
    { title: 'Top Rated TV Shows', badge: 'TOP', mediaType: 'tv', fetch: () => TMDb.topRatedTV() },
    { title: 'On The Air', badge: 'NEW', mediaType: 'tv', fetch: () => TMDb.onTheAirTV() },
    { title: 'Action & Adventure', mediaType: 'tv', fetch: () => TMDb.byGenreTV(GENRE.tv.actionAdventure) },
    { title: 'Comedy', mediaType: 'tv', fetch: () => TMDb.byGenreTV(GENRE.tv.comedy) },
    { title: 'Drama', mediaType: 'tv', fetch: () => TMDb.byGenreTV(GENRE.tv.drama) },
    { title: 'Crime', mediaType: 'tv', fetch: () => TMDb.byGenreTV(GENRE.tv.crime) },
    { title: 'Sci-Fi & Fantasy', mediaType: 'tv', fetch: () => TMDb.byGenreTV(GENRE.tv.sciFiFantasy) },
    { title: 'Animation', mediaType: 'tv', fetch: () => TMDb.byGenreTV(GENRE.tv.animation) },
    { title: 'Reality', mediaType: 'tv', fetch: () => TMDb.byGenreTV(GENRE.tv.reality) }
  ]
};

/* ---------- State ---------- */
const state = {
  view: 'home',
  myList: loadMyList(),
  searchTimer: null,
  currentDetail: null
};

/* ---------- LocalStorage helpers ---------- */
function loadMyList() {
  try { return JSON.parse(localStorage.getItem('streammax_mylist')) || []; }
  catch { return []; }
}
function saveMyList() {
  localStorage.setItem('streammax_mylist', JSON.stringify(state.myList));
}
function isInMyList(id, mediaType) {
  return state.myList.some(i => i.id === id && i.media_type === mediaType);
}
function toggleMyList(item) {
  const exists = isInMyList(item.id, item.media_type);
  if (exists) {
    state.myList = state.myList.filter(i => !(i.id === item.id && i.media_type === item.media_type));
    showToast(`Removed “${item.title}” from My List`);
  } else {
    state.myList.push(item);
    showToast(`Added “${item.title}” to My List`);
  }
  saveMyList();
  syncAddButtons(item);
  if (state.view === 'mylist') renderMyList();
}
function syncAddButtons(item) {
  const saved = isInMyList(item.id, item.media_type);
  document.querySelectorAll(`[data-add-id="${item.id}-${item.media_type}"]`).forEach(btn => {
    btn.classList.toggle('saved', saved);
    btn.textContent = btn.classList.contains('btn-add-outline') ? (saved ? '✓ In My List' : '+ My List') : (saved ? '✓' : '+');
  });
}

/* ---------- Normalizers ---------- */
function normalizeItem(raw, forcedType) {
  const media_type = forcedType || raw.media_type || (raw.first_air_date ? 'tv' : 'movie');
  const title = raw.title || raw.name || 'Untitled';
  const date = raw.release_date || raw.first_air_date || '';
  return {
    id: raw.id,
    media_type,
    title,
    overview: raw.overview || '',
    poster_path: raw.poster_path || null,
    backdrop_path: raw.backdrop_path || null,
    vote_average: raw.vote_average || 0,
    year: date ? date.slice(0, 4) : '—',
    genre_ids: raw.genre_ids || []
  };
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ---------- Card rendering ---------- */
function createCard(item) {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');

  const posterUrl = TMDb.img(item.poster_path, CONFIG.IMG_SIZES.poster);
  const saved = isInMyList(item.id, item.media_type);

  card.innerHTML = `
    <div class="card-poster-wrap">
      ${item.media_type ? `<span class="card-badge">${item.media_type === 'tv' ? 'SERIES' : 'FILM'}</span>` : ''}
      <button class="card-add ${saved ? 'saved' : ''}" data-add-id="${item.id}-${item.media_type}" aria-label="Add to My List">${saved ? '✓' : '+'}</button>
      <img class="card-poster" alt="${item.title}" src="${posterUrl || ''}" />
    </div>
    <div class="card-info">
      <p class="card-title">${item.title}</p>
      <div class="card-sub">
        <span class="rating">★ ${item.vote_average ? item.vote_average.toFixed(1) : '—'}</span>
        <span>${item.year}</span>
      </div>
    </div>
  `;

  const img = card.querySelector('.card-poster');
  img.addEventListener('load', () => img.classList.add('loaded'));
  if (!posterUrl) img.classList.add('loaded');

  card.querySelector('.card-add').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMyList(item);
  });

  card.addEventListener('click', () => openDetailModal(item.id, item.media_type));
  card.addEventListener('keypress', (e) => { if (e.key === 'Enter') openDetailModal(item.id, item.media_type); });

  return card;
}

/* ---------- Row rendering ---------- */
async function buildRow(container, config) {
  const section = document.createElement('div');
  section.className = 'rail-section';
  section.innerHTML = `
    <div class="rail-head">
      <h2 class="rail-title">${config.title} ${config.badge ? `<span class="card-badge" style="position:static;">${config.badge}</span>` : ''}</h2>
    </div>
    <div class="rail-track-wrap">
      <button class="rail-arrow left" aria-label="Scroll left">&#10094;</button>
      <div class="rail-track"><div class="skeleton-row">${'<div class="skeleton-card"></div>'.repeat(6)}</div></div>
      <button class="rail-arrow right" aria-label="Scroll right">&#10095;</button>
    </div>
  `;
  container.appendChild(section);
  const track = section.querySelector('.rail-track');

  try {
    const data = await config.fetch();
    const results = (data.results || []).filter(r => r.poster_path);
    track.innerHTML = '';
    if (!results.length) {
      track.innerHTML = `<p class="empty-msg">Nothing to show right now.</p>`;
      return;
    }
    results.slice(0, 20).forEach(raw => {
      const item = normalizeItem(raw, config.mediaType === 'mixed' ? undefined : config.mediaType);
      if (item.media_type !== 'movie' && item.media_type !== 'tv') return;
      track.appendChild(createCard(item));
    });
  } catch (err) {
    console.error(err);
    track.innerHTML = `<p class="empty-msg">Couldn't load this row. Check your connection and refresh.</p>`;
  }

  const left = section.querySelector('.rail-arrow.left');
  const right = section.querySelector('.rail-arrow.right');
  left.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.8, behavior: 'smooth' }));
  right.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' }));
}

function renderRows(viewKey) {
  const container = document.getElementById('rowsContainer');
  container.innerHTML = '';
  const configs = ROW_CONFIGS[viewKey] || [];
  configs.forEach(cfg => buildRow(container, cfg));
}

/* ---------- Hero ---------- */
async function initHero() {
  try {
    const data = await TMDb.trending('all', 'day');
    const pool = (data.results || []).filter(r => r.backdrop_path && r.overview && (r.media_type === 'movie' || r.media_type === 'tv'));
    const pick = pool[Math.floor(Math.random() * Math.min(pool.length, 8))] || pool[0];
    if (!pick) return;
    const item = normalizeItem(pick);
    state.heroItem = item;

    const backdrop = document.getElementById('heroBackdrop');
    backdrop.src = TMDb.img(pick.backdrop_path, CONFIG.IMG_SIZES.backdrop);
    backdrop.addEventListener('load', () => backdrop.classList.add('loaded'));

    document.getElementById('heroTitle').textContent = item.title;
    document.getElementById('heroOverview').textContent = item.overview;
    document.getElementById('heroMeta').innerHTML = `
      <span class="rating">★ ${item.vote_average.toFixed(1)}</span>
      <span class="pill">${item.year}</span>
      <span class="pill">${item.media_type === 'tv' ? 'Series' : 'Film'}</span>
    `;
    syncHeroAddButton();

    document.getElementById('heroInfoBtn').onclick = () => openDetailModal(item.id, item.media_type);
    document.getElementById('heroPlayBtn').onclick = () => playTrailerFor(item.id, item.media_type);
    document.getElementById('heroAddBtn').onclick = () => { toggleMyList(item); syncHeroAddButton(); };
  } catch (err) {
    console.error('Hero failed', err);
    document.getElementById('heroTitle').textContent = 'StreamMax';
    document.getElementById('heroOverview').textContent = 'Unable to load featured content right now.';
  }
}
function syncHeroAddButton() {
  if (!state.heroItem) return;
  const btn = document.getElementById('heroAddBtn');
  btn.classList.toggle('saved', isInMyList(state.heroItem.id, state.heroItem.media_type));
}

/* ---------- Detail Modal ---------- */
async function openDetailModal(id, mediaType) {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  document.getElementById('modalTitle').textContent = 'Loading…';
  document.getElementById('modalOverview').textContent = '';
  document.getElementById('modalMeta').innerHTML = '';
  document.getElementById('modalGenres').innerHTML = '';
  document.getElementById('modalCast').innerHTML = '';
  document.getElementById('modalBackdrop').src = '';

  try {
    const data = await TMDb.detail(mediaType, id);
    const item = normalizeItem({ ...data, media_type: mediaType });
    state.currentDetail = item;

    document.getElementById('modalBackdrop').src = TMDb.img(data.backdrop_path || data.poster_path, CONFIG.IMG_SIZES.backdropSm) || '';
    document.getElementById('modalTitle').textContent = item.title;
    document.getElementById('modalOverview').textContent = item.overview || 'No synopsis available.';

    const runtime = data.runtime ? `${data.runtime} min` : (data.episode_run_time?.[0] ? `${data.episode_run_time[0]} min/ep` : '');
    const seasons = data.number_of_seasons ? `${data.number_of_seasons} Season${data.number_of_seasons > 1 ? 's' : ''}` : '';
    document.getElementById('modalMeta').innerHTML = `
      <span class="rating">★ ${item.vote_average.toFixed(1)}</span>
      <span>${item.year}</span>
      ${runtime ? `<span>${runtime}</span>` : ''}
      ${seasons ? `<span>${seasons}</span>` : ''}
      <span>${mediaType === 'tv' ? 'Series' : 'Film'}</span>
    `;

    document.getElementById('modalGenres').innerHTML = (data.genres || [])
      .map(g => `<span class="genre-chip">${g.name}</span>`).join('');

    const cast = (data.credits?.cast || []).slice(0, 5).map(c => c.name).join(', ');
    document.getElementById('modalCast').innerHTML = cast ? `<strong>Cast:</strong> ${cast}` : '';

    const addBtn = document.getElementById('modalAddBtn');
    addBtn.setAttribute('data-add-id', `${item.id}-${item.media_type}`);
    const saved = isInMyList(item.id, item.media_type);
    addBtn.classList.toggle('saved', saved);
    addBtn.textContent = saved ? '✓ In My List' : '+ My List';
    addBtn.onclick = () => toggleMyList(item);

    const trailerKey = TMDb.bestTrailerKey(data);
    const playAction = () => {
      if (trailerKey) openTrailer(trailerKey);
      else showToast('No trailer available for this title.');
    };
    document.getElementById('modalPlayBtn').onclick = playAction;
    document.getElementById('modalPlayOverlay').onclick = playAction;

  } catch (err) {
    console.error(err);
    document.getElementById('modalTitle').textContent = 'Something went wrong';
    document.getElementById('modalOverview').textContent = 'Could not load details for this title.';
  }
}
function closeDetailModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

/* ---------- Trailer ---------- */
async function playTrailerFor(id, mediaType) {
  try {
    const data = await TMDb.detail(mediaType, id);
    const key = TMDb.bestTrailerKey(data);
    if (key) openTrailer(key);
    else showToast('No trailer available for this title.');
  } catch {
    showToast('Could not load trailer.');
  }
}
function openTrailer(youtubeKey) {
  const overlay = document.getElementById('trailerOverlay');
  const frame = document.getElementById('trailerFrame');
  frame.src = `https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0`;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeTrailer() {
  document.getElementById('trailerOverlay').classList.add('hidden');
  document.getElementById('trailerFrame').src = '';
  document.body.style.overflow = '';
}

/* ---------- My List view ---------- */
function renderMyList() {
  const grid = document.getElementById('myListGrid');
  const empty = document.getElementById('myListEmpty');
  grid.innerHTML = '';
  if (!state.myList.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  state.myList.slice().reverse().forEach(item => grid.appendChild(createCard(item)));
}

/* ---------- Search ---------- */
async function runSearch(query) {
  const view = document.getElementById('searchResultsView');
  const grid = document.getElementById('searchGrid');
  const empty = document.getElementById('searchEmpty');
  document.getElementById('searchQueryLabel').textContent = query;
  grid.innerHTML = '<div class="skeleton-row">' + '<div class="skeleton-card"></div>'.repeat(6) + '</div>';
  empty.classList.add('hidden');
  view.classList.remove('hidden');

  try {
    const data = await TMDb.searchMulti(query);
    const results = (data.results || []).filter(r => r.poster_path && (r.media_type === 'movie' || r.media_type === 'tv'));
    grid.innerHTML = '';
    if (!results.length) {
      empty.classList.remove('hidden');
      return;
    }
    results.forEach(raw => grid.appendChild(createCard(normalizeItem(raw))));
  } catch (err) {
    console.error(err);
    grid.innerHTML = '';
    empty.textContent = 'Search failed. Please try again.';
    empty.classList.remove('hidden');
  }
}

/* ---------- TVmaze: On Air Today ---------- */
async function renderAiringToday() {
  const container = document.getElementById('rowsContainer');
  container.innerHTML = `
    <div class="rail-section">
      <div class="rail-head">
        <h2 class="rail-title">On Air Today <span class="card-badge" style="position:static;">TVMAZE</span></h2>
      </div>
      <div id="airingGrid" class="poster-grid">
        <div class="skeleton-row">${'<div class="skeleton-card"></div>'.repeat(10)}</div>
      </div>
    </div>
  `;
  const grid = document.getElementById('airingGrid');
  try {
    const items = await TVMaze.scheduleToday();
    const seen = new Set();
    const shows = [];
    items.forEach(ep => {
      const show = ep.show || ep._embedded?.show;
      if (!show || seen.has(show.id) || !show.image) return;
      seen.add(show.id);
      shows.push({ ep, show });
    });
    grid.innerHTML = '';
    if (!shows.length) {
      grid.innerHTML = '<p class="empty-msg">No scheduled airings found for today.</p>';
      return;
    }
    shows.slice(0, 60).forEach(({ ep, show }) => grid.appendChild(createTvMazeCard(ep, show)));
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<p class="empty-msg">Could not load today\'s schedule from TVmaze.</p>';
  }
}

function createTvMazeCard(episode, show) {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('tabindex', '0');
  const poster = show.image?.medium || show.image?.original || '';
  card.innerHTML = `
    <div class="card-poster-wrap">
      <span class="card-badge">${episode.airtime || 'TBA'}</span>
      <img class="card-poster loaded" alt="${show.name}" src="${poster}" />
    </div>
    <div class="card-info">
      <p class="card-title">${show.name}</p>
      <div class="card-sub"><span>${show.network?.name || show.webChannel?.name || 'TV'}</span></div>
    </div>
  `;
  card.addEventListener('click', () => openTvMazeModal(show, episode));
  return card;
}

function openTvMazeModal(show, episode) {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  document.getElementById('modalBackdrop').src = show.image?.original || show.image?.medium || '';
  document.getElementById('modalTitle').textContent = show.name;
  const summary = (show.summary || '').replace(/<[^>]+>/g, '');
  document.getElementById('modalOverview').textContent = summary || 'No summary available.';
  document.getElementById('modalMeta').innerHTML = `
    <span class="rating">★ ${show.rating?.average || '—'}</span>
    <span>${show.premiered ? show.premiered.slice(0, 4) : '—'}</span>
    <span>${episode?.airtime ? 'Airs ' + episode.airtime : ''}</span>
    <span>${show.network?.name || show.webChannel?.name || ''}</span>
  `;
  document.getElementById('modalGenres').innerHTML = (show.genres || [])
    .map(g => `<span class="genre-chip">${g}</span>`).join('');
  document.getElementById('modalCast').innerHTML = show.officialSite
    ? `<strong>Official site:</strong> <a href="${show.officialSite}" target="_blank" rel="noopener" style="color:var(--red-highlight)">${show.officialSite}</a>` : '';

  const addBtn = document.getElementById('modalAddBtn');
  addBtn.removeAttribute('data-add-id');
  addBtn.classList.remove('saved');
  addBtn.textContent = 'Open Official Site';
  addBtn.onclick = () => show.officialSite ? window.open(show.officialSite, '_blank') : showToast('No official site listed.');

  const playBtn = document.getElementById('modalPlayBtn');
  const disabledAction = () => showToast('Trailer not available via TVmaze — try searching this title.');
  playBtn.onclick = disabledAction;
  document.getElementById('modalPlayOverlay').onclick = disabledAction;
}

/* ---------- View switching ---------- */
function setView(view) {
  state.view = view;
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.view === view));
  document.getElementById('searchResultsView').classList.add('hidden');
  document.getElementById('myListView').classList.add('hidden');
  document.getElementById('rowsContainer').classList.remove('hidden');

  document.getElementById('hero').style.display = view === 'home' ? '' : 'none';
  document.getElementById('main').style.marginTop = view === 'home' ? '' : 'calc(var(--nav-h) + 30px)';

  closeMobileMenu();

  if (view === 'mylist') {
    document.getElementById('rowsContainer').classList.add('hidden');
    document.getElementById('myListView').classList.remove('hidden');
    renderMyList();
  } else if (view === 'airing') {
    renderAiringToday();
  } else {
    renderRows(view === 'home' ? 'home' : view);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- Mobile menu ---------- */
function closeMobileMenu() {
  document.getElementById('navLinks').classList.remove('open');
}

/* ---------- Clock tag ---------- */
function tickClock() {
  const el = document.getElementById('clockTag');
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/* ---------- Init & event wiring ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  renderRows('home');
  tickClock();
  setInterval(tickClock, 30000);

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
  });

  // Nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setView(link.dataset.view);
    });
  });
  document.getElementById('brandLink').addEventListener('click', (e) => { e.preventDefault(); setView('home'); });

  // Hamburger
  document.getElementById('hamburgerBtn').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });

  // Search
  const searchWrap = document.getElementById('searchWrap');
  const searchInput = document.getElementById('searchInput');
  document.getElementById('searchToggle').addEventListener('click', () => {
    searchWrap.classList.toggle('open');
    if (searchWrap.classList.contains('open')) searchInput.focus();
  });
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    clearTimeout(state.searchTimer);
    if (!q) {
      document.getElementById('searchResultsView').classList.add('hidden');
      document.getElementById('rowsContainer').classList.toggle('hidden', state.view === 'mylist');
      return;
    }
    state.searchTimer = setTimeout(() => {
      document.getElementById('rowsContainer').classList.add('hidden');
      document.getElementById('myListView').classList.add('hidden');
      runSearch(q);
    }, 400);
  });

  // Modal close
  document.getElementById('modalClose').addEventListener('click', closeDetailModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeDetailModal();
  });

  // Trailer close
  document.getElementById('trailerClose').addEventListener('click', closeTrailer);

  // ESC key closes overlays
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTrailer();
      closeDetailModal();
    }
  });
});
