import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getAllDirectors } from "../../../services/DirectorsAPI";
import Loader from "../../common/Loader";
import "./DirectorList.scss";

const DirectorList = () => {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDirectors = async () => {
      try {
        setLoading(true);
        const data = await getAllDirectors();
        setDirectors(data);
      } catch (err) {
        setError("Failed to load directors.");
      } finally {
        setLoading(false);
      }
    };
    fetchDirectors();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="director-list-page">
      <h2 className="page-title">Directors</h2>
      {directors.length === 0 ? (
        <div className="no-directors">No directors found.</div>
      ) : (
        <div className="directors-grid">
          {directors.map((director) => (
            <Link
              to={`/director/${director.id}`}
              className="director-card"
              key={director.id}
            >
              <div className="director-image">
                <img
                  src={
                    director.image_url ||
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png?20200912122019"
                  }
                  alt={director.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png?20200912122019";
                  }}
                />
              </div>
              <div className="director-info">
                <h3 className="director-name">{director.name}</h3>
                {director.nationality && (
                  <div className="director-nationality">
                    {director.nationality}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DirectorList;
