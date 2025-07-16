const NavButton = ({ icon, alt, onClick }) => (
  <button
    onClick={onClick}
    className="nav-btn"
  >
    {icon}
    <span className="font-medium">{alt}</span>
  </button>
);

export default NavButton;