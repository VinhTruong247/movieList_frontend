import { useEffect } from "react";
import MovieForm from "./MovieForm";
import "./MovieFormPopup.scss";

const MovieFormPopup = ({ movie, onSubmit, onClose, isSubmitting }) => {
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "auto";
    };
  }, [onClose, isSubmitting]);

  return (
    <div className="movie-form-overlay" onClick={onClose}>
      <div className="movie-form-popup" onClick={(e) => e.stopPropagation()}>
        <button
          className="close-button"
          onClick={onClose}
          disabled={isSubmitting}
        >
          &times;
        </button>
        <MovieForm
          movie={movie}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default MovieFormPopup;
