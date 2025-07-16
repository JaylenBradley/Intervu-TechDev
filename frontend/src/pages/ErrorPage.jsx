import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-app-primary mb-4">404</h1>
      <p className="text-2xl text-app-text mb-8">Page Not Found</p>
      <button
        className="px-6 py-2 bg-app-primary text-app-accent rounded-full font-semibold hover:bg-app-secondary transition"
        onClick={() => navigate("/")}
      >
        Go Home
      </button>
    </div>
  );
};

export default ErrorPage;

