import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-background">
      <div className="bg-app-accent text-app-text border border-app-primary
        p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col items-center"
      >
        <h1 className="text-6xl font-extrabold text-app-primary mb-2">404</h1>
        <p className="text-xl font-semibold mb-4 text-app-text">Page Not Found</p>
        <blockquote className="italic text-app-secondary mb-6 text-center">
          "Mistakes are proof that you are trying." <br />
          <span className="text-sm text-app-text">— Unknown</span>
        </blockquote>
        <button
          className="btn btn-primary w-full py-3 rounded-lg font-semibold mt-2"
          onClick={() => navigate("/")}
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;