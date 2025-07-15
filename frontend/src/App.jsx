import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchQuestionnaireStatus, getUserByFirebaseId, createUser } from "./services/userServices";
import AuthForm from "./containers/AuthForm.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import Home from "./pages/Home.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Questionnaire from "./pages/Questionnaire.jsx";

const App = () => {
  const [questionnaireComplete, setQuestionnaireComplete] = useState(false);
  const [questionnaireStatusLoading, setQuestionnaireStatusLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let backendUser;
          try {
            backendUser = await getUserByFirebaseId(firebaseUser.uid);
          } catch {
            // User not found, create it
            const data = {
              username: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              email: firebaseUser.email,
              login_method: firebaseUser.providerData[0]?.providerId || "email",
              firebase_id: firebaseUser.uid,
            };
            await createUser(data);
            backendUser = await getUserByFirebaseId(firebaseUser.uid);
          }
          setUser(backendUser);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setQuestionnaireStatusLoading(false);
      return;
    }
    setQuestionnaireStatusLoading(true);
    const checkStatus = async () => {
      try {
        const data = await fetchQuestionnaireStatus(user.id);
        setQuestionnaireComplete(data.completed);
      } catch {
        setQuestionnaireComplete(false);
      } finally {
        setQuestionnaireStatusLoading(false);
      }
    };
    checkStatus();
  }, [user]);

  if (loading || questionnaireStatusLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar user={user}/>
      <Routes>
        <Route path="/" element={<Home questionnaireComplete={questionnaireComplete}/>} />
        <Route path="/signup" element={<AuthForm isSignUp={true}/>}/>
        <Route path="/signin" element={<AuthForm isSignUp={false}/>}/>
        <Route path="/questionnaire" element={
          <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
            <Questionnaire onComplete={() => setQuestionnaireComplete(true)} user={user} />
          </ProtectedRoute>
        }/>
        <Route path="/resume" element={
          <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
            {/*<Resume />*/}
          </ProtectedRoute>
        }/>
        <Route path="*" element={<ErrorPage/>}/>
      </Routes>
    </>
  );
}

export default App;