import { useState, useEffect } from "react";
import { searchUsers, followUser, unfollowUser, getAllCareerGoals } from "../services/friendshipServices";
import { useNotification } from "./NotificationProvider";
import { FaSearch, FaUserPlus, FaUserMinus, FaTimes } from "react-icons/fa";

const UserSearchModal = ({ isOpen, onClose, currentUser, onFriendsUpdated }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [selectedCareerGoal, setSelectedCareerGoal] = useState("");
  const [availableCareerGoals, setAvailableCareerGoals] = useState([]);
  const [loadingCareerGoals, setLoadingCareerGoals] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      setInitialLoading(true);
      setSelectedCareerGoal(""); // Reset filter when modal opens
      loadUsers().finally(() => setInitialLoading(false));
      loadCareerGoals();
    }
  }, [isOpen, currentUser?.id]);

  const loadCareerGoals = async () => {
    setLoadingCareerGoals(true);
    try {
      const data = await getAllCareerGoals();
      setAvailableCareerGoals(data.career_goals || []);
    } catch (error) {
      console.error("Failed to load career goals:", error);
    } finally {
      setLoadingCareerGoals(false);
    }
  };

  // Auto-search as user types or career goal changes
  useEffect(() => {
    if (!isOpen || !currentUser?.id) return;
    
    const timeoutId = setTimeout(() => {
      loadUsers(searchTerm);
    }, 300); // 300ms delay to avoid too many API calls
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCareerGoal, isOpen, currentUser?.id]);

  const loadUsers = async (term = "") => {
    if (!currentUser?.id) return;
    
    setSearching(true);
    try {
      const results = await searchUsers(currentUser.id, term, selectedCareerGoal);
      setUsers(results);
    } catch (error) {
      showNotification("Failed to load users", "error");
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is now automatic, but we can keep this for accessibility
    loadUsers(searchTerm);
  };

  const handleFollow = async (userId) => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    try {
      await followUser(currentUser.id, userId);
      // Update the user's following status in the list
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_following: true } : user
      ));
      showNotification("User followed successfully!", "success");
      // Notify parent component to refresh friends list
      if (onFriendsUpdated) {
        onFriendsUpdated();
      }
    } catch (error) {
      showNotification("Failed to follow user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    try {
      await unfollowUser(currentUser.id, userId);
      // Update the user's following status in the list
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_following: false } : user
      ));
      showNotification("User unfollowed successfully!", "success");
      // Notify parent component to refresh friends list
      if (onFriendsUpdated) {
        onFriendsUpdated();
      }
    } catch (error) {
      showNotification("Failed to unfollow user", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 backdrop-blur-sm pointer-events-auto"></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white text-black rounded-xl p-6 shadow-2xl max-w-2xl w-full border-2 border-app-primary max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-app-primary">Find Users to Follow</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by username or name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-app-primary focus:border-app-primary"
                  autoFocus
                />
              </div>
              {searching && (
                <div className="flex items-center px-4 py-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-app-primary"></div>
                  <span className="ml-2 text-sm">Searching...</span>
                </div>
              )}
            </div>
            
            {/* Career Goal Filter */}
            {!loadingCareerGoals && availableCareerGoals.length > 0 && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Career Goal:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCareerGoal("")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCareerGoal === "" 
                        ? "bg-app-primary text-white" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    All
                  </button>
                  {availableCareerGoals.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setSelectedCareerGoal(goal)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCareerGoal === goal 
                          ? "bg-app-primary text-white" 
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {loadingCareerGoals && (
              <div className="mb-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-app-primary"></div>
                  <span className="text-sm">Loading career goals...</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {initialLoading ? (
              <div className="text-center text-gray-500 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-primary mx-auto mb-2"></div>
                <div>Loading users...</div>
              </div>
            ) : users.length === 0 && !searching ? (
              <div className="text-center text-gray-500 py-8">
                {searchTerm ? "No users found" : "Start typing to search for users"}
              </div>
            ) : (
              <div className="space-y-3">
                {users
                  .filter(user => !selectedCareerGoal || user.career_goal === selectedCareerGoal)
                  .map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded-full bg-app-accent flex items-center justify-center text-lg font-bold text-app-primary">
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                                              <div>
                          <div className="font-semibold text-gray-900">{user.username}</div>
                          {user.name && <div className="text-sm text-gray-600">{user.name}</div>}
                          {user.career_goal && (
                            <div className="mt-1">
                              <span className="inline-block bg-app-accent text-app-primary px-2 py-1 rounded-full text-xs font-medium">
                                {user.career_goal}
                              </span>
                            </div>
                          )}
                        </div>
                    </div>
                    <button
                      onClick={() => user.is_following ? handleUnfollow(user.id) : handleFollow(user.id)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                        user.is_following 
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
                          : "btn-primary"
                      }`}
                    >
                      {loading ? (
                        "Loading..."
                      ) : user.is_following ? (
                        <>
                          <FaUserMinus size={14} />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <FaUserPlus size={14} />
                          Follow
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSearchModal; 