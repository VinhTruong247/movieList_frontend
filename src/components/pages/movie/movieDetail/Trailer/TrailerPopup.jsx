import "./TrailerPopup.scss";

const TrailerPopup = ({ trailerUrl, onClose }) => {
  const getYouTubeVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(trailerUrl);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="trailer-popup-overlay" onClick={onClose}>
      <div
        className="trailer-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <div className="video-container">
          <iframe
            src={embedUrl}
            title="Movie Trailer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default TrailerPopup;
