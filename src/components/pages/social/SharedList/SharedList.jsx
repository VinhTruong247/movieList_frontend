import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useSocial } from "../../../../hooks/useSocial";
import { getMovies } from "../../../../services/MovieListAPI";
import { useToast } from "../../../../hooks/useToast";
import "./SharedList.scss";

const SharedList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const currentUser = useSelector((state) => state.auth.currentUser);
  
  const {
    userLists,
    listsLoading,
    handleCreateList,
    handleAddMovieToList,
    handleRemoveMovieFromList,
    handleDeleteList,
  } = useSocial();

  const [activeTab, setActiveTab] = useState("my-lists");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMovieSelector, setShowMovieSelector] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [movieSearchQuery, setMovieSearchQuery] = useState("");
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: "",
    description: "",
    isPublic: true,
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    loadMovies();
  }, [currentUser, navigate]);

  const loadMovies = async () => {
    try {
      const moviesData = await getMovies();
      setAllMovies(moviesData || []);
    } catch (error) {
      console.error("Error loading movies:", error);
      toast.error("Failed to load movies");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setLoading(true);
    try {
      const result = await handleCreateList(
        createFormData.title,
        createFormData.description,
        createFormData.isPublic
      );

      if (result) {
        setShowCreateForm(false);
        setCreateFormData({ title: "", description: "", isPublic: true });
        toast.success("List created successfully!");
      }
    } catch (error) {
      console.error("Error creating list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = async (movieId) => {
    if (!selectedList) return;

    try {
      const movieData = allMovies.find((movie) => movie.id === movieId);
      const success = await handleAddMovieToList(
        selectedList.id,
        movieId,
        movieData
      );

      if (success) {
        setSelectedList(prev => ({
          ...prev,
          SharedListMovies: [
            ...(prev.SharedListMovies || []),
            { movie_id: movieId, Movies: movieData }
          ]
        }));
      }
    } catch (error) {
      console.error("Error adding movie:", error);
    }
  };

  const handleRemoveMovie = async (listId, movieId) => {
    try {
      const success = await handleRemoveMovieFromList(listId, movieId);
      if (success && selectedList && selectedList.id === listId) {
        setSelectedList(prev => ({
          ...prev,
          SharedListMovies: prev.SharedListMovies?.filter(
            item => item.movie_id !== movieId
          ) || []
        }));
      }
    } catch (error) {
      console.error("Error removing movie:", error);
    }
  };

  const handleDeleteListConfirm = async (listId) => {
    if (window.confirm("Are you sure you want to delete this list? This action cannot be undone.")) {
      try {
        const success = await handleDeleteList(listId);
        if (success && selectedList && selectedList.id === listId) {
          setSelectedList(null);
          setShowMovieSelector(false);
        }
      } catch (error) {
        console.error("Error deleting list:", error);
      }
    }
  };

  const filteredLists = userLists.filter((list) =>
    list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (list.description && list.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMovies = allMovies.filter((movie) =>
    movie.title.toLowerCase().includes(movieSearchQuery.toLowerCase()) &&
    !movie.isDisabled
  );

  const isMovieInList = (movieId) => {
    return selectedList?.SharedListMovies?.some(item => item.movie_id === movieId) || false;
  };

  if (!currentUser) {
    return (
      <div className="shared-list-container">
        <div className="auth-required">
          <h2>Login Required</h2>
          <p>Please log in to manage your shared lists</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-list-container">
      <div className="page-header">
        <div className="header-content">
          <h1>My Shared Lists</h1>
          <p>Create and manage your movie collections to share with others</p>
        </div>
        <button
          className="create-list-btn primary"
          onClick={() => setShowCreateForm(true)}
        >
          <span className="btn-icon">➕</span>
          Create New List
        </button>
      </div>

      <div className="list-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search your lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>
        <div className="list-stats">
          <span className="stat">
            <span className="count">{userLists.length}</span>
            <span className="label">Total Lists</span>
          </span>
          <span className="stat">
            <span className="count">
              {userLists.filter(list => list.isPublic).length}
            </span>
            <span className="label">Public</span>
          </span>
          <span className="stat">
            <span className="count">
              {userLists.filter(list => !list.isPublic).length}
            </span>
            <span className="label">Private</span>
          </span>
        </div>
      </div>

      {listsLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your lists...</p>
        </div>
      ) : (
        <div className="lists-content">
          {filteredLists.length > 0 ? (
            <div className="lists-grid">
              {filteredLists.map((list) => (
                <div key={list.id} className="list-card">
                  <div className="list-header">
                    <div className="list-title-section">
                      <h3>{list.title}</h3>
                      <div className="list-badges">
                        <span className={`visibility-badge ${list.isPublic ? 'public' : 'private'}`}>
                          {list.isPublic ? '🌍 Public' : '🔒 Private'}
                        </span>
                        <span className="movie-count-badge">
                          {list.SharedListMovies?.length || 0} movies
                        </span>
                      </div>
                    </div>
                    <div className="list-actions">
                      <button
                        className="action-btn add-movies"
                        onClick={() => {
                          setSelectedList(list);
                          setShowMovieSelector(true);
                        }}
                        title="Add Movies"
                      >
                        ➕
                      </button>
                      <button
                        className="action-btn delete-list"
                        onClick={() => handleDeleteListConfirm(list.id)}
                        title="Delete List"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {list.description && (
                    <p className="list-description">{list.description}</p>
                  )}

                  <div className="list-movies">
                    {list.SharedListMovies && list.SharedListMovies.length > 0 ? (
                      <div className="movies-preview">
                        {list.SharedListMovies.slice(0, 6).map((item) => (
                          <div key={item.movie_id} className="movie-poster-container">
                            <img
                              src={item.Movies?.poster_url || "/placeholder.jpg"}
                              alt={item.Movies?.title}
                              className="movie-poster"
                              onClick={() => navigate(`/movie/${item.movie_id}`)}
                            />
                            <button
                              className="remove-movie-btn"
                              onClick={() => handleRemoveMovie(list.id, item.movie_id)}
                              title="Remove from list"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {list.SharedListMovies.length > 6 && (
                          <div className="more-movies-indicator">
                            <span>+{list.SharedListMovies.length - 6}</span>
                            <small>more</small>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-list">
                        <div className="empty-icon">🎬</div>
                        <p>No movies added yet</p>
                        <button
                          className="add-first-movie"
                          onClick={() => {
                            setSelectedList(list);
                            setShowMovieSelector(true);
                          }}
                        >
                          Add Your First Movie
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="list-footer">
                    <span className="created-date">
                      Created {new Date(list.created_at).toLocaleDateString()}
                    </span>
                    <button
                      className="view-full-list"
                      onClick={() => navigate(`/shared-list/${list.id}`)}
                    >
                      View Full List →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>
                {searchQuery ? "No lists found" : "No shared lists yet"}
              </h3>
              <p>
                {searchQuery
                  ? `No lists match "${searchQuery}"`
                  : "Create your first shared list to start organizing and sharing your favorite movies"}
              </p>
              {!searchQuery && (
                <button
                  className="create-first-list"
                  onClick={() => setShowCreateForm(true)}
                >
                  <span className="btn-icon">➕</span>
                  Create Your First List
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content create-list-modal">
            <div className="modal-header">
              <h2>Create New Shared List</h2>
              <button
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="create-form">
              <div className="form-group">
                <label htmlFor="title">List Title *</label>
                <input
                  type="text"
                  id="title"
                  value={createFormData.title}
                  onChange={(e) =>
                    setCreateFormData(prev => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., My Favorite Action Movies"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData(prev => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Tell others about your list..."
                  rows="3"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={createFormData.isPublic}
                    onChange={(e) =>
                      setCreateFormData(prev => ({ ...prev, isPublic: e.target.checked }))
                    }
                  />
                  <span className="checkmark"></span>
                  Make this list public
                  <small>Public lists can be discovered and viewed by other users</small>
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-shared-btn primary"
                >
                  {loading ? "Creating..." : "Create List"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMovieSelector && selectedList && (
        <div className="modal-overlay">
          <div className="modal-content movie-selector-modal">
            <div className="modal-header">
              <h2>Add Movies to "{selectedList.title}"</h2>
              <button
                className="close-btn"
                onClick={() => setShowMovieSelector(false)}
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
                    className={`add-movie-btn ${
                      isMovieInList(movie.id) ? "added" : ""
                    }`}
                    onClick={() => handleAddMovie(movie.id)}
                    disabled={isMovieInList(movie.id)}
                  >
                    {isMovieInList(movie.id) ? "✓ Added" : "Add"}
                  </button>
                </div>
              ))}

              {filteredMovies.length === 0 && (
                <div className="no-movies-found">
                  <p>No movies found matching "{movieSearchQuery}"</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="close-modal-btn"
                onClick={() => setShowMovieSelector(false)}
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

export default SharedList;