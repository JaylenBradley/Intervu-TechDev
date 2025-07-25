import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useNotification } from "../components/NotificationProvider";

const ProtectedRoute = ({ user, questionnaireComplete, children }) => {
  const location = useLocation();
  const alerted = useRef(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    alerted.current = false;
  }, [location.pathname]);

  if (!user) {
    if (!alerted.current) {
      showNotification("You must be logged in to access this page", "error");
      alerted.current = true;
    }
    return <Navigate to="/signin" />;
  }
  if (!questionnaireComplete && location.pathname !== "/questionnaire") {
    if (!alerted.current) {
      showNotification("Please complete the questionnaire before accessing this page", "error");
      alerted.current = true;
    }
    return <Navigate to="/questionnaire" />;
  }
  return children;
};

export default ProtectedRoute;