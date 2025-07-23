import intervuLogo from "../assets/images/intervu-logo-transparent.png";

const Footer = () => (
  <footer className="w-full bg-cyan-50 py-4 px-8 flex items-center justify-center shadow-lg h-20">
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
      © {new Date().getFullYear()} Intervu &mdash; Jaylen Bradley, Justin Song, Samantha Adorno
    </span>
  </footer>
);

export default Footer;