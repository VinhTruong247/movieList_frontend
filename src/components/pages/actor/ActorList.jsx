import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getAllActors } from "../../../services/ActorsAPI";
import Loader from "../../common/Loader";
import "./ActorList.scss";

const ActorList = () => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActors = async () => {
      try {
        setLoading(true);
        const data = await getAllActors();
        setActors(data);
      } catch (err) {
        setError("Failed to load actors.");
      } finally {
        setLoading(false);
      }
    };
    fetchActors();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="actor-list-page">
      <h2 className="page-title">Actors</h2>
      {actors.length === 0 ? (
        <div className="no-actors">No actors found.</div>
      ) : (
        <div className="actors-grid">
          {actors.map((actor) => (
            <Link
              to={`/actor/${actor.id}`}
              className="actor-card"
              key={actor.id}
            >
              <div className="actor-image">
                <img
                  src={
                    actor.image_url ||
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png?20200912122019"
                  }
                  alt={actor.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png?20200912122019";
                  }}
                />
              </div>
              <div className="actor-info">
                <h3 className="actor-name">{actor.name}</h3>
                {actor.nationality && (
                  <div className="actor-nationality">{actor.nationality}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActorList;
