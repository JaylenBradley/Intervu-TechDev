const NavButton = ({ icon, onClick, alt }) => (
  <button
    onClick={onClick}
    className="mx-2 p-2 rounded-full hover:bg-app-primary transition bg-transparent"
  >
    <img src={icon} alt={alt} className="w-6 h-6" />
  </button>
);

export default NavButton;