import { useState, useEffect } from "react";
import { getFollowers, getFollowing, unfollowUser } from "../services/friendshipServices";
import { useNotification } from "./NotificationProvider";
import { FaTimes, FaUserFriends, FaUsers, FaUserMinus } from "react-icons/fa";

const FriendsListModal = ({ isOpen, onClose, currentUser, type = "following", onFriendsUpdated }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unfollowingId, setUnfollowingId] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      loadFriends();
    }
  }, [isOpen, currentUser?.id, type]);

  const loadFriends = async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    try {
      const data = type === "following" 
        ? await getFollowing(currentUser.id)
        : await getFollowers(currentUser.id);
      setFriends(data);
    } catch (error) {
      showNotification(`Failed to load ${type}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    return type === "following" ? "Following" : "Followers";
  };

  const getIcon = () => {
    return type === "following" ? <FaUsers size={20} /> : <FaUserFriends size={20} />;
  };

  const handleUnfollow = async (friendId) => {
    if (!currentUser?.id) return;
    
    setUnfollowingId(friendId);
    try {
      await unfollowUser(currentUser.id, friendId);
      // Remove the user from the list
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
      showNotification("User unfollowed successfully!", "success");
      // Notify parent component to refresh friends list
      if (onFriendsUpdated) {
        onFriendsUpdated();
      }
    } catch (error) {
      showNotification("Failed to unfollow user", "error");
    } finally {
      setUnfollowingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 backdrop-blur-sm pointer-events-auto"></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white text-black rounded-xl p-6 shadow-2xl max-w-2xl w-full border-2 border-app-primary max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getIcon()}
              <h3 className="text-xl font-bold text-app-primary">{getTitle()} ({friends.length})</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 cursor-pointer"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center text-gray-500 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-primary mx-auto mb-2"></div>
                <div>Loading {type}...</div>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {type === "following" 
                  ? "You're not following anyone yet" 
                  : "You don't have any followers yet"
                }
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      {friend.avatar ? (
                        <img
                          src={friend.avatar}
                          alt={friend.username}
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded-full bg-app-accent flex items-center justify-center text-lg font-bold text-app-primary">
                          {friend.username[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold text-gray-900">{friend.username}</div>
                        {friend.name && <div className="text-sm text-gray-600">{friend.name}</div>}
                        {friend.career_goal && (
                          <span className="inline-block bg-app-accent text-app-primary px-2 py-1 rounded-full text-xs font-medium w-fit -ml-2">
                            {friend.career_goal}
                          </span>
                        )}
                      </div>
                    </div>
                    {type === "following" && (
                      <button
                        onClick={() => handleUnfollow(friend.id)}
                        disabled={unfollowingId === friend.id}
                        className="
                          flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700
                          hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {unfollowingId === friend.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                        ) : (
                          <FaUserMinus size={14} />
                        )}
                        Unfollow
                      </button>
                    )}
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

export default FriendsListModal; 