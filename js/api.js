/* =========================================================
   StreamMax — API layer
   TMDb (movies/tv) + TVmaze (live air-date schedule)
   ========================================================= */

const TMDb = {
  async _get(path, params = {}) {
    const url = new URL(CONFIG.TMDB.BASE_URL + path);
    url.searchParams.set('api_key', CONFIG.TMDB.API_KEY);
    url.searchParams.set('language', 'en-US');
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDb error ${res.status} on ${path}`);
    return res.json();
  },

  trending(mediaType = 'all', window = 'day') {
    return this._get(`/trending/${mediaType}/${window}`);
  },
  popularMovies(page = 1) { return this._get('/movie/popular', { page }); },
  topRatedMovies(page = 1) { return this._get('/movie/top_rated', { page }); },
  upcomingMovies(page = 1) { return this._get('/movie/upcoming', { page }); },
  nowPlayingMovies(page = 1) { return this._get('/movie/now_playing', { page }); },

  popularTV(page = 1) { return this._get('/tv/popular', { page }); },
  topRatedTV(page = 1) { return this._get('/tv/top_rated', { page }); },
  onTheAirTV(page = 1) { return this._get('/tv/on_the_air', { page }); },

  byGenreMovie(genreId, page = 1) {
    return this._get('/discover/movie', { with_genres: genreId, sort_by: 'popularity.desc', page });
  },
  byGenreTV(genreId, page = 1) {
    return this._get('/discover/tv', { with_genres: genreId, sort_by: 'popularity.desc', page });
  },

  genresMovie() { return this._get('/genre/movie/list'); },
  genresTV() { return this._get('/genre/tv/list'); },

  detail(mediaType, id) {
    return this._get(`/${mediaType}/${id}`, { append_to_response: 'videos,credits' });
  },

  searchMulti(query, page = 1) {
    return this._get('/search/multi', { query, page, include_adult: false });
  },

  img(path, size = CONFIG.IMG_SIZES.poster) {
    if (!path) return null;
    return `${CONFIG.TMDB.IMG_BASE}${size}${path}`;
  },

  /** Pick the best YouTube trailer/teaser key from a videos payload */
  bestTrailerKey(videosResponse) {
    const list = videosResponse?.videos?.results || videosResponse?.results || [];
    if (!list.length) return null;
    const yt = list.filter(v => v.site === 'YouTube');
    const trailer = yt.find(v => v.type === 'Trailer' && v.official) ||
                     yt.find(v => v.type === 'Trailer') ||
                     yt.find(v => v.type === 'Teaser') ||
                     yt[0];
    return trailer ? trailer.key : null;
  }
};

const TVMaze = {
  async _get(path) {
    const res = await fetch(CONFIG.TVMAZE.BASE_URL + path);
    if (!res.ok) throw new Error(`TVmaze error ${res.status} on ${path}`);
    return res.json();
  },
  /** Shows airing today (network + web schedule combined) */
  async scheduleToday(countryCode = 'US') {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const [network, web] = await Promise.all([
        this._get(`/schedule?country=${countryCode}&date=${today}`),
        this._get(`/schedule/web?date=${today}`)
      ]);
      return [...network, ...web];
    } catch (e) {
      // Fallback to network-only schedule if web schedule fails
      return this._get(`/schedule?country=${countryCode}&date=${today}`);
    }
  },
  searchShows(query) {
    return this._get(`/search/shows?q=${encodeURIComponent(query)}`);
  }
};
