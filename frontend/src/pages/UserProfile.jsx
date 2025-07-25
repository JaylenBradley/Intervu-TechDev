import { useState } from "react";
import { FaGithub, FaGlobe, FaInstagram, FaLinkedin, FaTwitter, FaUserFriends } from "react-icons/fa";
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
  website: "",
  linkedin: "",
  github: "",
  instagram: "",
  twitter: "",
};

const UserProfile = ({ user = defaultUser, isCurrentUser = true }) => {
  const [profile, setProfile] = useState(user);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(profile);

  const handleEditClick = () => {
    setEditData(profile);
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = () => {
    setProfile(editData);
    setEditModalOpen(false);
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
          <div className="bg-white rounded-xl shadow p-6 border-2 border-app-primary flex flex-col gap-4">
            <div>
              <span className="font-semibold text-app-primary">Bio:</span>
              <span className="ml-2 text-gray-700">{profile.bio || "Add a short bio about yourself."}</span>
            </div>
            <div>
              <span className="font-semibold text-app-primary">Education:</span>
              <span className="ml-2 text-gray-700">{profile.education || "Education info (placeholder)"}</span>
            </div>
          </div>
          {/* Social Links */}
          <div className="bg-white rounded-xl shadow p-6 border-2 border-app-primary flex gap-6 items-center">
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-app-primary">
                <FaGlobe size={22} /> Website
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500">
                <FaLinkedin size={22} /> LinkedIn
              </a>
            )}
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-800">
                <FaGithub size={22} /> GitHub
              </a>
            )}
            {profile.instagram && (
              <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-pink-500">
                <FaInstagram size={22} /> Instagram
              </a>
            )}
            {profile.twitter && (
              <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400">
                <FaTwitter size={22} /> Twitter
              </a>
            )}
            {!profile.website && !profile.linkedin && !profile.github && !profile.instagram && !profile.twitter && (
              <span className="text-gray-400">No social links added.</span>
            )}
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
      {/* Edit Modal */}
      {editModalOpen && (
        <>
          <div className="fixed inset-0 z-40 backdrop-blur-sm pointer-events-auto"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white text-black rounded-xl p-8 shadow-2xl max-w-md w-full border-2 border-app-primary">
              <h3 className="text-xl font-bold mb-4 text-center">Edit Profile</h3>
              <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                <input
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    placeholder="Full Name"
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
                    name="website"
                    value={editData.website}
                    onChange={handleEditChange}
                    placeholder="Website URL"
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
                <input
                    name="instagram"
                    value={editData.instagram}
                    onChange={handleEditChange}
                    placeholder="Instagram URL"
                    className="bg-app-background border-app-primary border rounded px-3 py-2"
                />
                <input
                    name="twitter"
                    value={editData.twitter}
                    onChange={handleEditChange}
                    placeholder="Twitter URL"
                    className="bg-app-background border border-app-primary rounded px-3 py-2"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" className="btn-danger px-4 py-2 rounded-lg font-semibold cursor-pointer" onClick={() => setEditModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary px-4 py-2 rounded-lg font-semibold cursor-pointer">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;