import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Home from "./pages/Home.jsx";
import AuthForm from "./containers/AuthForm.jsx";
import JobDashboard from "./pages/JobDashboard.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import Navbar from "./components/Navbar.jsx";
import ResumeMain from "./pages/ResumeMain.jsx";
import CreateResume from "./pages/CreateResume.jsx";
import ResumeFeedback from "./pages/ResumeFeedback.jsx";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/signup" element={<AuthForm isSignUp={true}/>}/>
        <Route path="/signin" element={<AuthForm isSignUp={false}/>}/>
        <Route path="/dashboard" element={<JobDashboard/>}/>
        <Route path="/resume" element={<ResumeMain/>}/>
        <Route path="/resume/create" element={<CreateResume/>}/>
        <Route path="/resume/feedback" element={<ResumeFeedback/>}/>
        <Route path="*" element={<ErrorPage/>}/>
      </Routes>
    </Router>
  );
};

export default App;