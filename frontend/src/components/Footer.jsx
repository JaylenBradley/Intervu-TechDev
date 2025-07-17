import intervuLogo from "../assets/images/intervu-logo-transparent.png";

const Footer = () => (
  <footer className="w-full bg-app-accent border-t border-app-primary py-4 px-8 flex items-center justify-center shadow-lg h-20">
    <div className="flex items-center mr-2">
      <img
        src={intervuLogo}
        alt="Intervu Logo"
        className="h-10 w-auto"
        style={{ objectFit: "contain" }}
      />
      <span className="text-app-primary font-bold text-lg">Intervu</span>
    </div>
    <span className="text-app-text font-medium text-base">
      © {new Date().getFullYear()} Intervu LLC &mdash; Jaylen Bradley, Justin Song
    </span>
  </footer>
);

export default Footer;