import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { 
  getSharedListById, 
  deleteSharedList, 
  updateSharedList,
  addMovieToSharedList,
  removeMovieFromSharedList,
  followUser,
  unfollowUser,
  checkIfFollowing
} from "../../../../services/SocialAPI";
import { getMovies } from "../../../../services/MovieListAPI";
import { useToast } from "../../../../hooks/useToast";
import MovieCard from "../../movie/movieCard/MovieCard";
import "./SharedListDetail.scss";

const SharedListDetail = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = useSelector((state) => state.auth.currentUser);
  
  const [listData, setListData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowingOwner, setIsFollowingOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddMovies, setShowAddMovies] = useState(false);
  const [allMovies, setAllMovies] = useState([]);
  const [movieSearchQuery, setMovieSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("added_date");
  
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    isPublic: true
  });

  useEffect(() => {
    if (listId) {
      loadListData();
    }
  }, [listId, currentUser]);

  const loadListData = async () => {
    try {
      setLoading(true);
      const data = await getSharedListById(listId);
      
      if (!data) {
        navigate("/not-found");
        return;
      }

      if (!data.isPublic && currentUser && data.user_id !== currentUser.id) {
        navigate("/unauthorized");
        return;
      }

      if (!data.isPublic && !currentUser) {
        navigate("/login");
        return;
      }

      setListData(data);
      setIsOwner(currentUser && data.user_id === currentUser.id);
      setEditFormData({
        title: data.title,
        description: data.description || "",
        isPublic: data.isPublic
      });

      if (currentUser && data.user_id !== currentUser.id) {
        const following = await checkIfFollowing(currentUser.id, data.user_id);
        setIsFollowingOwner(following);
      }

      if (currentUser && data.user_id === currentUser.id) {
        const moviesData = await getMovies();
        setAllMovies(moviesData || []);
      }

    } catch (error) {
      console.error("Error loading list:", error);
      toast.error("Failed to load list");
      navigate("/shared-lists");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      if (isFollowingOwner) {
        await unfollowUser(currentUser.id, listData.user_id);
        setIsFollowingOwner(false);
        toast.success("Unfollowed user");
      } else {
        await followUser(currentUser.id, listData.user_id);
        setIsFollowingOwner(true);
        toast.success("Now following user");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    }
  };

  const handleEditSave = async () => {
    try {
      const updatedList = await updateSharedList(listId, editFormData);
      setListData(prev => ({ ...prev, ...updatedList }));
      setIsEditing(false);
      toast.success("List updated successfully");
    } catch (error) {
      console.error("Error updating list:", error);
      toast.error("Failed to update list");
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm("Are you sure you want to delete this list? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteSharedList(listId);
      toast.success("List deleted successfully");
      navigate("/shared-lists");
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Failed to delete list");
    }
  };

  const handleAddMovie = async (movieId) => {
    try {
      await addMovieToSharedList(listId, movieId);
      const movieData = allMovies.find(m => m.id === movieId);
      
      setListData(prev => ({
        ...prev,
        SharedListMovies: [
          ...(prev.SharedListMovies || []),
          { movie_id: movieId, Movies: movieData }
        ]
      }));
      
      toast.success("Movie added to list");
    } catch (error) {
      console.error("Error adding movie:", error);
      toast.error("Failed to add movie");
    }
  };

  const handleRemoveMovie = async (movieId) => {
    if (!window.confirm("Remove this movie from the list?")) {
      return;
    }

    try {
      await removeMovieFromSharedList(listId, movieId);
      setListData(prev => ({
        ...prev,
        SharedListMovies: prev.SharedListMovies?.filter(
          item => item.movie_id !== movieId
        ) || []
      }));
      toast.success("Movie removed from list");
    } catch (error) {
      console.error("Error removing movie:", error);
      toast.error("Failed to remove movie");
    }
  };

  const getSortedMovies = () => {
    if (!listData?.SharedListMovies) return [];
    
    const movies = [...listData.SharedListMovies];
    
    switch (sortBy) {
      case "title":
        return movies.sort((a, b) => 
          (a.Movies?.title || "").localeCompare(b.Movies?.title || "")
        );
      case "year":
        return movies.sort((a, b) => 
          (b.Movies?.year || 0) - (a.Movies?.year || 0)
        );
      case "rating":
        return movies.sort((a, b) => 
          (b.Movies?.imdb_rating || 0) - (a.Movies?.imdb_rating || 0)
        );
      case "added_date":
      default:
        return movies.reverse();
    }
  };

  const filteredMovies = allMovies.filter(movie =>
    movie.title.toLowerCase().includes(movieSearchQuery.toLowerCase()) &&
    !listData?.SharedListMovies?.some(item => item.movie_id === movie.id)
  );

  if (loading) {
    return (
      <div className="shared-list-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading list...</p>
        </div>
      </div>
    );
  }

  if (!listData) {
    return (
      <div className="shared-list-detail">
        <div className="error-container">
          <h2>List not found</h2>
          <p>The list you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate("/shared-lists")}>
            Back to Lists
          </button>
        </div>
      </div>
    );
  }

  const sortedMovies = getSortedMovies();

  return (
    <div className="shared-list-detail">
      <div className="list-header">
        <div className="header-content">
          <div className="breadcrumb">
            <button 
              className="breadcrumb-link"
              onClick={() => navigate("/shared-lists")}
            >
              Shared Lists
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{listData.title}</span>
          </div>

          <div className="list-title-section">
            {isEditing ? (
              <div className="edit-title-form">
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  className="title-input"
                />
                <div className="edit-actions">
                  <button 
                    className="save-btn"
                    onClick={handleEditSave}
                  >
                    Save
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setIsEditing(false);
                      setEditFormData({
                        title: listData.title,
                        description: listData.description || "",
                        isPublic: listData.isPublic
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="title-display">
                <h1>{listData.title}</h1>
                {isOwner && (
                  <button 
                    className="edit-title-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️
                  </button>
                )}
              </div>
            )}

            <div className="list-meta">
              <div className="list-badges">
                <span className={`visibility-badge ${listData.isPublic ? 'public' : 'private'}`}>
                  {listData.isPublic ? '🌍 Public' : '🔒 Private'}
                </span>
                <span className="movie-count-badge">
                  {sortedMovies.length} {sortedMovies.length === 1 ? 'movie' : 'movies'}
                </span>
              </div>
              
              <div className="list-info">
                <span className="created-date">
                  Created {new Date(listData.created_at).toLocaleDateString()}
                </span>
                {listData.Users && (
                  <div className="owner-info">
                    <span>by</span>
                    <button 
                      className="owner-link"
                      onClick={() => navigate(`/profile/${listData.user_id}`)}
                    >
                      <div className="owner-avatar">
                        {listData.Users.avatar_url ? (
                          <img src={listData.Users.avatar_url} alt={listData.Users.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {listData.Users.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <span className="owner-name">{listData.Users.name}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="edit-description">
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="Add a description..."
                  className="description-input"
                  rows="3"
                />
                <div className="visibility-toggle">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editFormData.isPublic}
                      onChange={(e) => setEditFormData(prev => ({
                        ...prev,
                        isPublic: e.target.checked
                      }))}
                    />
                    <span className="checkmark"></span>
                    Make this list public
                  </label>
                </div>
              </div>
            ) : (
              listData.description && (
                <p className="list-description">{listData.description}</p>
              )
            )}
          </div>
        </div>

        <div className="header-actions">
          {isOwner ? (
            <div className="owner-actions">
              <button
                className="add-movies-btn primary"
                onClick={() => setShowAddMovies(true)}
              >
                <span className="btn-icon">➕</span>
                Add Movies
              </button>
              <button
                className="delete-list-btn danger"
                onClick={handleDeleteList}
              >
                <span className="btn-icon">🗑️</span>
                Delete List
              </button>
            </div>
          ) : (
            <div className="visitor-actions">
              {currentUser && (
                <button
                  className={`follow-btn ${isFollowingOwner ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                >
                  {isFollowingOwner ? 'Following' : 'Follow'}
                </button>
              )}
              <button
                className="view-profile-btn"
                onClick={() => navigate(`/profile/${listData.user_id}`)}
              >
                View Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="list-controls">
        <div className="view-controls">
          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ▦
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              ☰
            </button>
          </div>

          <div className="sort-controls">
            <label htmlFor="sortBy">Sort by:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="added_date">Recently Added</option>
              <option value="title">Title A-Z</option>
              <option value="year">Year (Newest)</option>
              <option value="rating">Rating (Highest)</option>
            </select>
          </div>
        </div>

        <div className="list-stats">
          <span className="movie-count">
            {sortedMovies.length} {sortedMovies.length === 1 ? 'Movie' : 'Movies'}
          </span>
        </div>
      </div>

      <div className="movies-content">
        {sortedMovies.length > 0 ? (
          <div className={`movies-${viewMode}`}>
            {sortedMovies.map((item) => (
              <div key={item.movie_id} className="movie-item">
                <div className="movie-card-wrapper">
                  <MovieCard 
                    movie={item.Movies} 
                    viewMode={viewMode}
                  />
                  {isOwner && (
                    <button
                      className="remove-movie-btn"
                      onClick={() => handleRemoveMovie(item.movie_id)}
                      title="Remove from list"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-list">
            <div className="empty-icon">🎬</div>
            <h3>No movies in this list yet</h3>
            <p>
              {isOwner 
                ? "Start building your collection by adding some movies!"
                : "This list is empty. Check back later for updates."
              }
            </p>
            {isOwner && (
              <button
                className="add-first-movie-btn"
                onClick={() => setShowAddMovies(true)}
              >
                <span className="btn-icon">➕</span>
                Add Your First Movie
              </button>
            )}
          </div>
        )}
      </div>

      {showAddMovies && isOwner && (
        <div className="modal-overlay">
          <div className="modal-content movie-selector-modal">
            <div className="modal-header">
              <h2>Add Movies to "{listData.title}"</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddMovies(false)}
              >
                ✕
              </button>
            </div>

            <div className="movie-search">
              <input
                type="text"
                placeholder="Search movies to add..."
                value={movieSearchQuery}
                onChange={(e) => setMovieSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="movies-grid">
              {filteredMovies.map((movie) => (
                <div key={movie.id} className="movie-selector-item">
                  <div className="movie-poster-small">
                    <img
                      src={movie.poster_url || "/placeholder.jpg"}
                      alt={movie.title}
                    />
                  </div>
                  <div className="movie-info">
                    <h4>{movie.title}</h4>
                    <p>{movie.year} • {movie.imdb_rating}⭐</p>
                  </div>
                  <button
                    className="add-movie-btn"
                    onClick={() => handleAddMovie(movie.id)}
                  >
                    Add
                  </button>
                </div>
              ))}

              {filteredMovies.length === 0 && (
                <div className="no-movies-found">
                  <p>
                    {movieSearchQuery 
                      ? `No available movies match "${movieSearchQuery}"`
                      : "All movies have been added to this list"
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="close-modal-btn"
                onClick={() => setShowAddMovies(false)}
              >
                Done Adding Movies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedListDetail;