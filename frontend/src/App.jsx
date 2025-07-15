import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchQuestionnaireStatus, getUserByFirebaseId } from "./services/userServices";
import AuthForm from "./containers/AuthForm.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import Home from "./pages/Home.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Questionnaire from "./pages/Questionnaire.jsx";

const App = () => {
  const [questionnaireComplete, setQuestionnaireComplete] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const backendUser = await getUserByFirebaseId(firebaseUser.uid);
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
    if (!user) return;
    const checkStatus = async () => {
      try {
        const data = await fetchQuestionnaireStatus(user.id);
        setQuestionnaireComplete(data.completed);
      } catch (err) {
        setQuestionnaireComplete(false);
      }
    };
    checkStatus();
  }, [user]);

    if (loading) {
      return <div>Loading...</div>;
    }

  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<AuthForm isSignUp={true}/>}/>
        <Route path="/signin" element={<AuthForm isSignUp={false}/>}/>
        <Route path="/questionnaire" element={
          <ProtectedRoute user={user} questionnaireComplete={false}>
            <Questionnaire onComplete={() => setQuestionnaireComplete(true)}/>
          </ProtectedRoute>
        }/>
        <Route path="/resume" element={
          <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
            {/*<Resume />*/}
          </ProtectedRoute>
        }/>
        <Route path="*" element={<ErrorPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;