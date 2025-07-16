import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

const ProtectedRoute = ({ user, questionnaireComplete, children }) => {
  const location = useLocation();
  const alerted = useRef(false);

  useEffect(() => {
    alerted.current = false;
  }, [location.pathname]);

  if (!user) {
    if (!alerted.current) {
      alert("You must be logged in to access this page");
      alerted.current = true;
    }
    return <Navigate to="/signin" />;
  }
  // Only require questionnaireComplete for certain routes
  const requireQuestionnaire = [
    "/roadmap",
    "/resume",
    "/tech-prep",
    "/ai-interviewer"
    // add any other routes that should require questionnaire completion
  ];

  if (
    requireQuestionnaire.includes(location.pathname) &&
    !questionnaireComplete
  ) {
    if (!alerted.current) {
      alert("Please complete the questionnaire before accessing this page");
      alerted.current = true;
    }
    return <Navigate to="/questionnaire" />;
  }
  return children;
};

export default ProtectedRoute;