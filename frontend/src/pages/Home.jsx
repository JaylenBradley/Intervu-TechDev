import { useNavigate } from "react-router-dom";

const Home = ({ user, questionnaireComplete }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app-background">
      <div className="flex flex-col items-center justify-center mt-24">
        <h1 className="text-5xl font-bold mb-4 text-app-primary">
          Welcome to Intervu
        </h1>
        {user && !questionnaireComplete && (
          <div className="fixed inset-0 flex items-center justify-center bg-app-background bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg text-center">
              <h2 className="text-xl font-bold mb-4">Complete Questionnaire</h2>
              <p className="mb-4">
                Please complete the questionnaire before continuing
              </p>
              <button
                className="btn"
                onClick={() => navigate("/questionnaire")}
              >
                Go to Questionnaire
              </button>
            </div>
          </div>
        )}
        <p className="text-xl text-app-text">
          An Interview and Career Planning Platform
        </p>
      </div>
    </div>
  );
};

export default Home;