import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useNotification } from "../components/NotificationProvider";

if (typeof window !== "undefined" && !window.__lastLoginToastTime) {
  window.__lastLoginToastTime = 0;
}

const ProtectedRoute = ({ user, questionnaireComplete, children }) => {
  const location = useLocation();
  const alerted = useRef(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    alerted.current = false;
  }, [location.pathname]);

  // Reset the global flag on navigation (optional, but harmless)
  useEffect(() => {
    // window.__shownLoginToastThisTick = false; // no longer needed
  }, [location.pathname]);

  useEffect(() => {
    const isAuthPage = location.pathname === "/signin" || location.pathname === "/signup";
    const now = Date.now();
    if (
      !user &&
      !alerted.current &&
      !isAuthPage &&
      (now - window.__lastLoginToastTime > 500)
    ) {
      if (localStorage.getItem("justLoggedOut") === "true") {
        localStorage.removeItem("justLoggedOut");
      } else {
        showNotification("You must be logged in to access this page", "error");
        window.__lastLoginToastTime = now;
      }
      alerted.current = true;
    } else if (user && !questionnaireComplete && location.pathname !== "/questionnaire" && !alerted.current) {
      showNotification("Please complete the questionnaire before accessing this page", "error");
      alerted.current = true;
    }
  }, [user, questionnaireComplete, location.pathname, showNotification]);

  if (!user) {
    return <Navigate to="/signin" />;
  }

  if (!questionnaireComplete && location.pathname !== "/questionnaire") {
    return <Navigate to="/questionnaire" />;
  }

  return children;
};

export default ProtectedRoute;