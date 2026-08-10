/* =========================================================
   StreamMax — API Configuration
   =========================================================
   NOTE: This is a client-side demo. In a production app you
   would proxy TMDb requests through a backend so the API key
   is never exposed in the browser. For this project the key
   is used directly on the client, exactly as provided.
   ========================================================= */

const CONFIG = {
  TMDB: {
    BASE_URL: 'https://api.themoviedb.org/3',
    IMG_BASE: 'https://image.tmdb.org/t/p/',
    API_KEY: '61592149e647840c49ed9c6cc316919a',
    READ_TOKEN: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2MTU5MjE0OWU2NDc4NDBjNDllZDljNmNjMzE2OTE5YSIsIm5iZiI6MTc3NzkxODkwNy44MjYsInN1YiI6IjY5ZjhlM2JiY2Y5ZjAxNWJhNDk1YmYyNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.8gQTQ__twhqVJJuKKIJnbDxpaTIdq1_yKgzHAd4sJRI'
  },
  TVMAZE: {
    BASE_URL: 'https://api.tvmaze.com'
  },
  IMG_SIZES: {
    poster: 'w342',
    posterLg: 'w500',
    backdrop: 'w1280',
    backdropSm: 'w780'
  }
};
