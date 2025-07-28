import Modal from "../components/Modal";
import { getUser, updateUser, deleteUser} from "../services/userServices";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../components/NotificationProvider";
import { useState } from "react";
import { FaGithub, FaLinkedin, FaUserFriends } from "react-icons/fa";
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

const UserProfile = ({ user = defaultUser, isCurrentUser = true }) => {
  const [profile, setProfile] = useState(user);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(profile);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user?.id) {
      getUser(user.id).then(setProfile);
    }
  }, [user?.id]);

  const handleEditClick = () => {
    setEditData(profile);
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!profile.id) {
      showNotification("User ID missing. Cannot update profile.", "error");
      return;
    }
    try {
      const updated = await updateUser(profile.id, editData);
      setProfile(updated);
      setEditModalOpen(false);
      showNotification("Profile updated successfully!", "success");
    } catch (err) {
      showNotification("Failed to update profile.", "error");
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
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="size-28 rounded-full border-4 border-app-primary object-cover"
                />
              ) : (
                <div className="size-28 rounded-full bg-app-accent border-4 border-app-primary flex items-center justify-center text-5xl font-bold text-app-primary">
                  {profile.username ? profile.username[0].toUpperCase() : "U"}
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
              <div className="text-3xl font-extrabold text-app-primary">{profile.username}</div>
              <div className="text-lg text-gray-700">{profile.name || "Full Name (placeholder)"}</div>
              <div className="text-md text-gray-500">{profile.email || "Email (placeholder)"}</div>
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
          <div className="bg-white rounded-xl shadow p-6 border-2 border-app-primary flex flex-col gap-2">
            <div>
              <span className="font-semibold text-app-primary">Bio:</span>
              <span className="ml-2 text-gray-700">{profile.bio || "Add a short bio about yourself"}</span>
            </div>
            <div>
              <span className="font-semibold text-app-primary">Education:</span>
              <span className="ml-2 text-gray-700">{profile.education || "Add your education here"}</span>

              {profile.linkedin && (
                <div className="mt-4">
                  <a
                    href={formatUrl(profile.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500"
                  >
                    <FaLinkedin size={22} /> LinkedIn
                  </a>
                </div>
              )}

              {profile.github && (
                <div className="mt-2">
                  <a
                    href={formatUrl(profile.github)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-800"
                  >
                    <FaGithub size={22} /> GitHub
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Friends List Section */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow p-6 border-2 border-app-primary">
            <div className="flex items-center gap-2 mb-4">
              <FaUserFriends size={22} className="text-app-primary" />
              <span className="font-bold text-app-primary text-lg">Friends</span>
            </div>
            <ul className="flex flex-col gap-3">
              {dummyFriends.map((friend, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-app-accent flex items-center justify-center text-lg font-bold text-app-primary">
                    {friend.username[0].toUpperCase()}
                  </div>
                  <span className="text-gray-700">{friend.username}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-gray-400 text-sm">Friends feature coming soon!</div>
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
            await deleteUser(profile.id);
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
    </div>
  );
};

export default UserProfile;