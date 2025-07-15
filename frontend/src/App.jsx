import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchQuestionnaireStatus } from "./services/userServices";
import AuthForm from "./containers/AuthForm.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import Home from "./pages/Home.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Questionnaire from "./pages/Questionnaire.jsx";

const App = () => {
  const [questionnaireComplete, setQuestionnaireComplete] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const checkStatus = async () => {
      try {
        const data = await fetchQuestionnaireStatus(user.uid);
        setQuestionnaireComplete(data.completed);
      } catch (err) {
        setQuestionnaireComplete(false);
      }
    };
    checkStatus();
  }, [user]);

  return (
    <Router>
      <Navbar/>
      <Routes>
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
        <Route path="/" element={<Home />} />
        <Route path="*" element={<ErrorPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;