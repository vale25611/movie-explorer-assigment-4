import { useEffect, useState } from "react";
import { isCancel } from "axios";
import { getPopularMovies, searchMovies } from "./api/tmdb";
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";
import "./App.css";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");   // what's typed in the box
  const [search, setSearch] = useState(""); // what was actually submitted
  const [page, setPage] = useState(1);              // NEW: current page
  const [totalPages, setTotalPages] = useState(1);  // NEW: pages TMDB has
  const [selectedMovie, setSelectedMovie] = useState(null); // NEW: open modal

  // Runs when the search OR the page changes
  useEffect(() => {
    const controller = new AbortController();

    const request = search
      ? searchMovies(search, page, controller.signal)
      : getPopularMovies(page, controller.signal);

    request
      .then((data) => {
        setMovies((prev) => {
          if (page === 1) return data.results; // new search: start fresh
          // Load more: add new movies to the end, skipping duplicates
          const seen = new Set(prev.map((m) => m.id));
          return [...prev, ...data.results.filter((m) => !seen.has(m.id))];
        });
        setTotalPages(data.total_pages);
        setLoading(false);
      })
      .catch((err) => {
        if (isCancel(err)) return; // ignore our own cancelled requests
        setError("Couldn't load movies. Try again later.");
        setLoading(false);
      });

    return () => controller.abort(); // cleanup
  }, [search, page]);

  function handleSubmit(e) {
    e.preventDefault();
    const next = query.trim();
    if (next === search) return; // same search: nothing to do
    setLoading(true);
    setError(null);
    setMovies([]);  // clear old results
    setPage(1);     // new search starts at page 1
    setSearch(next);
  }

  function handleLoadMore() {
    setLoading(true);
    setPage((p) => p + 1); // triggers the useEffect to fetch the next page
  }

  return (
    <main className="app">
      <h1>Movie Explorer</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies…"
          aria-label="Search movies"
        />
        <button type="submit">Search</button>
      </form>

      {error && <p className="error">{error}</p>}

      {/* FEATURE 1: empty state */}
      {!loading && !error && search && movies.length === 0 && (
        <p className="empty">No results for “{search}”</p>
      )}

      {movies.length > 0 && (
        <div className="grid">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} onSelect={setSelectedMovie} />
          ))}
        </div>
      )}

      {loading && <p className="status">Loading…</p>}

      {/* FEATURE 3: load more (hidden on the last page) */}
      {!loading && !error && movies.length > 0 && page < totalPages && (
        <button className="load-more" onClick={handleLoadMore}>
          Load more
        </button>
      )}

      {/* FEATURE 2: detail view */}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </main>
  );
}