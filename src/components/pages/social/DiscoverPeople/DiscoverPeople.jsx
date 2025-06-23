import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useSocial } from "../../../../hooks/useSocial";
import { searchUsers } from "../../../../services/SocialAPI";
import { useToast } from "../../../../hooks/useToast";
import "./DiscoverPeople.scss";

const DiscoverPeople = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const currentUser = useSelector((state) => state.auth.currentUser);
  const {
    following,
    followersLoading,
    followingLoading,
    handleFollowUser,
    handleUnfollowUser,
    isFollowing,
    checkUserFollowingStatus,
  } = useSocial();

  const dataLoadedRef = useRef(false);

  useEffect(() => {
    const loadSuggestedUsers = async () => {
      if (dataLoadedRef.current) return;

      setInitialLoading(true);
      try {
        if (following.length === 0) {
          const popularUsers = await searchUsers({
            sortBy: "followers",
            limit: 10,
          });

          setSuggestedUsers(
            popularUsers.filter((user) => user.id !== currentUser.id)
          );
          dataLoadedRef.current = true;
          return;
        }

        const followerOfFollowingIds = new Set();
        const alreadyFollowingIds = new Set(
          following.map((f) => f.followee_id)
        );

        const followingSample = following.slice(0, 5);

        for (const followedUser of followingSample) {
          try {
            const response = await searchUsers({
              followeeId: followedUser.followee_id,
            });

            response.forEach((user) => {
              if (
                !alreadyFollowingIds.has(user.id) &&
                user.id !== currentUser.id
              ) {
                followerOfFollowingIds.add(user.id);
              }
            });
          } catch (err) {
            console.log(
              `Error fetching followers for user ${followedUser.followee_id}:`,
              err
            );
          }
        }

        if (followerOfFollowingIds.size > 0) {
          const suggestedUsersData = await searchUsers({
            userIds: Array.from(followerOfFollowingIds).slice(0, 10),
          });

          if (suggestedUsersData.length < 8) {
            const popularUsers = await searchUsers({
              sortBy: "followers",
              limit: 10 - suggestedUsersData.length,
            });

            const additionalUsers = popularUsers.filter(
              (user) =>
                !alreadyFollowingIds.has(user.id) &&
                user.id !== currentUser.id &&
                !followerOfFollowingIds.has(user.id)
            );

            setSuggestedUsers([...suggestedUsersData, ...additionalUsers]);
          } else {
            setSuggestedUsers(suggestedUsersData);
          }
        } else {
          const popularUsers = await searchUsers({
            sortBy: "followers",
            limit: 10,
          });

          setSuggestedUsers(
            popularUsers.filter((user) => user.id !== currentUser.id)
          );
        }

        dataLoadedRef.current = true;
      } catch (error) {
        console.error("Failed to load suggested users:", error);
        toast.error("Failed to load suggested users");
      } finally {
        setInitialLoading(false);
      }
    };

    if (currentUser && !followersLoading && !followingLoading) {
      loadSuggestedUsers();
    }

    return () => {
      dataLoadedRef.current = false;
    };
  }, [currentUser, followersLoading, followingLoading]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setLoading(true);
    setIsSearching(true);

    try {
      console.log("Searching for:", searchQuery);
      const results = await searchUsers({ query: searchQuery });
      console.log("Raw search results:", results);

      const filteredResults = results.filter(
        (user) => user.id !== currentUser?.id
      );

      console.log("Filtered results:", filteredResults);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId, userData) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      if (isFollowing(userId)) {
        await handleUnfollowUser(userId);
      } else {
        await handleFollowUser(userId, userData);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    }
  };

  const showNotFound = isSearching && searchResults.length === 0 && !loading;

  useEffect(() => {
    if (!currentUser) return;

    if (searchResults.length > 0) {
      searchResults.forEach((user) => {
        checkUserFollowingStatus(user.id);
      });
    }

    if (suggestedUsers.length > 0) {
      suggestedUsers.forEach((user) => {
        checkUserFollowingStatus(user.id);
      });
    }
  }, [currentUser, searchResults, suggestedUsers, checkUserFollowingStatus]);

  if (!currentUser || initialLoading) {
    return (
      <div className="discover-people-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="discover-people-container">
      <div className="discover-header">
        <div className="page-title-section">
          <h1>Discover People</h1>
          <p className="page-subtitle">
            Find and connect with other movie enthusiasts
          </p>
        </div>

        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="search-input"
            />
            <button className="search-button" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
      </div>

      {isSearching && (
        <div className="search-results-section">
          <div className="section-header">
            <h2>Search Results</h2>
            <button
              className="back-to-suggestions-btn"
              onClick={() => {
                setIsSearching(false);
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              Back to Suggestions
            </button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Searching...</p>
            </div>
          ) : showNotFound ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No users found</h3>
              <p>We couldn't find any users matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="users-grid">
              {searchResults.map((user, index) => (
                <div key={`search-${user.id || index}`} className="user-card">
                  <div
                    className="user-avatar"
                    onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={`${user.name || user.username}'s avatar`}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {(user.name || user.username || "?")[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="user-info">
                    <h3 onClick={() => navigate(`/profile/${user.id}`)}>
                      {user.name || user.username}
                    </h3>
                    <p className="username">@{user.username}</p>
                  </div>

                  <div className="user-actions">
                    <button
                      className={`follow-btn ${
                        isFollowing(user.id) ? "following" : ""
                      }`}
                      onClick={() => handleFollowToggle(user.id, user)}
                    >
                      {isFollowing(user.id) ? "Following" : "Follow"}
                    </button>
                    <button
                      className="profile-btn"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isSearching && (
        <>
          <div className="suggestions-section">
            <div className="section-header">
              <h2>People You Might Know</h2>
              <p>Users followed by people you follow</p>
            </div>

            {suggestedUsers.length > 0 ? (
              <div className="users-grid">
                {suggestedUsers.map((user, index) => (
                  <div
                    key={`suggestion-${user.id || index}`}
                    className="user-card"
                  >
                    <div
                      className="user-avatar"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={`${user.name || user.username}'s avatar`}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {(user.name || user.username || "?")[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="user-info">
                      <h3 onClick={() => navigate(`/profile/${user.id}`)}>
                        {user.name || user.username}
                      </h3>
                      <p className="username">@{user.username}</p>
                    </div>

                    <div className="user-actions">
                      <button
                        className={`follow-btn ${
                          isFollowing(user.id) ? "following" : ""
                        }`}
                        onClick={() => handleFollowToggle(user.id, user)}
                      >
                        {isFollowing(user.id) ? "Following" : "Follow"}
                      </button>
                      <button
                        className="profile-btn"
                        onClick={() => navigate(`/profile/${user.id}`)}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No suggestions available</h3>
                <p>Follow more people to get personalized suggestions</p>
              </div>
            )}
          </div>

          <div className="popular-section">
            <div className="section-header">
              <h2>Popular on MovieList</h2>
              <p>Users with the most followers</p>
            </div>

            <div className="action-prompt">
              <p>
                Follow more users to discover more content and get personalized
                recommendations!
              </p>
              <button
                className="social-btn"
                onClick={() => navigate(`/shared-lists/${list.id}`)}
              >
                Go to Social Hub
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DiscoverPeople;
