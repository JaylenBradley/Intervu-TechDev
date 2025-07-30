import Modal from "../components/Modal";
import UserSearchModal from "../components/UserSearchModal";
import FriendsListModal from "../components/FriendsListModal";
import PracticeProgressChart from "../components/PracticeProgressChart";
import Leaderboard from "../components/Leaderboard";
import { getUser, updateUser, deleteUser} from "../services/userServices";
import { getFollowers, getFollowing } from "../services/friendshipServices";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/NotificationProvider";
import { useState } from "react";
import { FaGithub, FaLinkedin, FaUserFriends, FaUserPlus, FaEye } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

const dummyFriends = [
  { username: "alice" },
  { username: "bob" },
  { username: "charlie" },
  { username: "diana" },
];

const defaultUser = {
  username: "johndoe",
  name: "",
  email: "johndoe@email.com",
  bio: "",
  education: "",
  avatar: "",
  linkedin: "",
  github: "",
  career_goal: "",
};

const UserProfile = ({ user: initialUser = defaultUser, isCurrentUser = true }) => {
  const [user, setUser] = useState(initialUser);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(initialUser);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [friendsListModalOpen, setFriendsListModalOpen] = useState(false);
  const [friendsListType, setFriendsListType] = useState("following");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user?.id) {
      getUser(user.id).then(setUser);
      loadFriends();
    }
  }, [user?.id]);

  const loadFriends = async () => {
    if (!user?.id) return;
    
    setLoadingFriends(true);
    try {
      const [followersData, followingData] = await Promise.all([
        getFollowers(user.id),
        getFollowing(user.id)
      ]);
      setFollowers(followersData);
      setFollowing(followingData);
    } catch (error) {
      console.error("Failed to load friends:", error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleEditClick = () => {
    setEditData(user);
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!user.id) {
      showNotification("User ID missing. Cannot update user.", "error");
      return;
    }
    try {
      const updated = await updateUser(user.id, editData);
      setUser(updated);
      setEditModalOpen(false);
      showNotification("Profile updated successfully!", "success");
    } catch (err) {
      showNotification("Failed to update user.", "error");
    }
  };

  const formatUrl = url => {
    if (!url) return "";
    return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  };

  return (
    <div className="min-h-screen flex justify-center items-start py-16">
      <div className="flex gap-12 w-full max-w-5xl">
        {/* Profile Section */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="size-28 rounded-full border-4 border-app-primary object-cover"
                />
              ) : (
                <div className="size-28 rounded-full bg-app-accent border-4 border-app-primary flex items-center justify-center text-5xl font-bold text-app-primary">
                  {user.username ? user.username[0].toUpperCase() : "U"}
                </div>
              )}
              {isCurrentUser && (
                <button
                  className="absolute bottom-2 right-2 bg-white border border-app-primary rounded-full p-2 shadow cursor-pointer"
                  title="Upload Avatar (coming soon)"
                  disabled
                >
                  <MdEdit size={20} />
                </button>
              )}
            </div>
            <div>
              <div className="text-3xl font-extrabold">{user.username}</div>
              <div className="text-lg text-gray-700">{user.name || "Full Name (placeholder)"}</div>
              <div className="text-md text-gray-500">{user.email || "Email (placeholder)"}</div>
            </div>
            {isCurrentUser && (
              <button
                className="ml-4 btn-primary px-4 py-2 rounded-lg font-semibold cursor-pointer flex items-center gap-2"
                onClick={handleEditClick}
              >
                <MdEdit size={20} /> Edit Profile
              </button>
            )}
          </div>
          
          {/* Bio & Education */}
          <div className="bg-white rounded-xl shadow p-6 border-2 border-app-primary flex flex-col gap-5">
            <div>
              <span className="font-semibold text-app-primary">Bio:</span>
              <span className="ml-2 text-gray-700">{user.bio || "Add a short bio about yourself"}</span>
            </div>
            <div>
              <span className="font-semibold text-app-primary">Education:</span>
              <span className="ml-2 text-gray-700">{user.education || "Add your education here"}</span>
            </div>

            {/* Career Goal Display */}
            {user.career_goal && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-app-primary">Career Goal:</span>
                <span className="inline-block bg-app-primary text-white px-3 py-1 rounded-full text-sm shadow-sm">
                  {user.career_goal}
                </span>
              </div>
            )}

            {user.linkedin && (
              <div>
                <a
                  href={formatUrl(user.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-500"
                >
                  <FaLinkedin size={22} /> LinkedIn
                </a>
              </div>
            )}

            {user.github && (
              <div>
                <a
                  href={formatUrl(user.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-800"
                >
                  <FaGithub size={22} /> GitHub
                </a>
              </div>
            )}
          </div>
          
          {/* Progress Chart */}
          <PracticeProgressChart userId={user.id} />
          
          {/* Leaderboard */}
          <Leaderboard />
        </div>

        {/* Friends List Section */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow p-6 border-2 border-app-primary flex flex-col pb-11">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaUserFriends size={22} className="text-app-primary" />
                <span className="font-bold text-app-primary text-lg">Friends</span>
              </div>
              {isCurrentUser && (
                <button
                  onClick={() => setSearchModalOpen(true)}
                  className="btn-primary px-3 py-1 rounded-lg font-semibold text-sm flex items-center gap-1 cursor-pointer"
                >
                  <FaUserPlus size={14} />
                  Add
                </button>
              )}
            </div>
            
            {loadingFriends ? (
              <div className="text-center text-gray-500 py-4">Loading...</div>
            ) : (
              <>
                {/* Following Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-700">Following ({following.length})</h4>
                    {following.length > 0 && (
                      <button
                        onClick={() => {
                          setFriendsListType("following");
                          setFriendsListModalOpen(true);
                        }}
                        className="text-app-primary hover:text-app-primary-dark text-xs font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <FaEye size={12} />
                        View All
                      </button>
                    )}
                  </div>
                  <ul className="flex flex-col gap-2">
                    {following.length === 0 ? (
                      <li className="text-gray-400 text-sm">Not following anyone yet</li>
                    ) : (
                      following.slice(0, 3).map((friend) => (
                        <li key={friend.id} className="flex items-center gap-2">
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              alt={friend.username}
                              className="size-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="size-6 rounded-full bg-app-accent flex items-center justify-center text-sm font-bold text-app-primary">
                              {friend.username[0].toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-gray-700 text-sm">{friend.username}</span>
                            {friend.career_goal && (
                              <span className="text-xs text-gray-500">{friend.career_goal}</span>
                            )}
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                  {following.length > 3 && (
                    <div className="text-gray-400 text-xs mt-1">+{following.length - 3} more</div>
                  )}
                </div>

                {/* Followers Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-700">Followers ({followers.length})</h4>
                    {followers.length > 0 && (
                      <button
                        onClick={() => {
                          setFriendsListType("followers");
                          setFriendsListModalOpen(true);
                        }}
                        className="text-app-primary hover:text-app-primary-dark text-xs font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <FaEye size={12} />
                        View All
                      </button>
                    )}
                  </div>
                  <ul className="flex flex-col gap-2">
                    {followers.length === 0 ? (
                      <li className="text-gray-400 text-sm">No followers yet</li>
                    ) : (
                      followers.slice(0, 3).map((friend) => (
                        <li key={friend.id} className="flex items-center gap-2">
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              alt={friend.username}
                              className="size-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="size-6 rounded-full bg-app-accent flex items-center justify-center text-sm font-bold text-app-primary">
                              {friend.username[0].toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-gray-700 text-sm">{friend.username}</span>
                            {friend.career_goal && (
                              <span className="text-xs text-gray-500">{friend.career_goal}</span>
                            )}
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                  {followers.length > 3 && (
                    <div className="text-gray-400 text-xs mt-1">+{followers.length - 3} more</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {editModalOpen && (
        <>
          <div className="fixed inset-0 z-40 backdrop-blur-sm pointer-events-auto"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white text-black rounded-xl p-8 shadow-2xl max-w-md w-full border-2 border-app-primary">
              <h3 className="text-xl font-bold mb-4 text-center">Edit Profile</h3>
              <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                <input
                  name="username"
                  value={editData.username}
                  onChange={handleEditChange}
                  placeholder="Username"
                  className="bg-app-background border border-app-primary rounded px-3 py-2"
                />
                <input
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  placeholder="Full Name"
                  className="bg-app-background border border-app-primary rounded px-3 py-2"
                />
                <input
                  name="career_goal"
                  value={editData.career_goal || ""}
                  onChange={handleEditChange}
                  placeholder="Career Goal"
                  className="bg-app-background border border-app-primary rounded px-3 py-2"
                />
                <input
                  name="bio"
                  value={editData.bio}
                  onChange={handleEditChange}
                  placeholder="Bio"
                  className="bg-app-background border border-app-primary rounded px-3 py-2"
                />
                <input
                  name="education"
                  value={editData.education}
                  onChange={handleEditChange}
                  placeholder="Education"
                  className="bg-app-background border border-app-primary rounded px-3 py-2"
                />
                <input
                  name="linkedin"
                  value={editData.linkedin}
                  onChange={handleEditChange}
                  placeholder="LinkedIn URL"
                  className="bg-app-background border border-app-primary rounded px-3 py-2"
                />
                <input
                  name="github"
                  value={editData.github}
                  onChange={handleEditChange}
                  placeholder="GitHub URL"
                  className="bg-app-background border border-app-primary rounded px-3 py-2"
                />
                <div className="flex justify-center gap-2 mt-2">
                  <button type="button" className="btn-danger px-4 py-2 rounded-lg font-semibold cursor-pointer" onClick={() => setEditModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary px-4 py-2 rounded-lg font-semibold cursor-pointer">
                    Save
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    className="btn-danger px-4 py-2 rounded-lg font-semibold cursor-pointer"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Delete Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      <Modal
        open={deleteModalOpen}
        message="Are you sure you want to delete your account? This aciton cannot be undone"
        onConfirm={async () => {
          try {
            await deleteUser(user.id);
            showNotification("Account deleted.", "success");
            setDeleteModalOpen(false);
            navigate("/signup");
            window.location.reload();
          } catch {
            showNotification("Failed to delete account.", "error");
            setDeleteModalOpen(false);
          }
        }}
        onCancel={() => setDeleteModalOpen(false)}
        confirmText="Delete Account"
        cancelText="Cancel"
      />

      <UserSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        currentUser={user}
        onFriendsUpdated={loadFriends}
      />

      <FriendsListModal
        isOpen={friendsListModalOpen}
        onClose={() => setFriendsListModalOpen(false)}
        currentUser={user}
        type={friendsListType}
        onFriendsUpdated={loadFriends}
      />
    </div>
  );
};

export default UserProfile;