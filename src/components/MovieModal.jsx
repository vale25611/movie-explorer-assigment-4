import { useEffect } from "react";

const IMG_BASE = "https://image.tmdb.org/t/p/w342";

export default function MovieModal({ movie, onClose }) {
  // Close when the user presses Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey); // cleanup
  }, [onClose]);

  return (
    // Clicking the dark background closes the modal
    <div className="modal-backdrop" onClick={onClose}>
      {/* stopPropagation: clicking INSIDE the box should not close it */}
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        {movie.poster_path && (
          <img src={`${IMG_BASE}${movie.poster_path}`} alt={`${movie.title} poster`} />
        )}
        <h2 id="modal-title">{movie.title}</h2>
        <p className="modal-meta">
          {movie.release_date?.slice(0, 4)} · ★ {movie.vote_average.toFixed(1)}
        </p>
        <p>{movie.overview || "No overview available."}</p>
      </div>
    </div>
  );
}