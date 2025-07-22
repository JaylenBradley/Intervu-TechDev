import {Routes, Route, useNavigate} from 'react-router-dom';
import { useEffect, useState } from "react";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { fetchQuestionnaireStatus, getUserByFirebaseId } from "./services/userServices";
import { fetchRoadmap } from "./services/roadmapServices";
import AuthForm from "./containers/AuthForm.jsx";
import BehavioralPrep from "./pages/BehavioralPrep.jsx";
import JobDashboard from "./pages/JobDashboard.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Blind75Prep from "./pages/Blind75Prep.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./containers/ProtectedRoute.jsx";
import Questionnaire from "./pages/Questionnaire.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import ResumeMain from "./pages/ResumeMain.jsx";
import CreateResume from "./pages/CreateResume.jsx";
import ResumeFeedback from "./pages/ResumeFeedback.jsx";
import AiInterviewerMain from "./pages/AiInterviewerMain.jsx";
import TechnicalPrep from "./pages/TechnicalPrep.jsx";

const App = () => {
  const [questionnaireComplete, setQuestionnaireComplete] = useState(false);
  const [questionnaireStatusLoading, setQuestionnaireStatusLoading] = useState(true);
  const [hasRoadmap, setHasRoadmap] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!user) {
      setHasRoadmap(false);
      return;
    }
    const checkRoadmap = async () => {
      try {
        const data = await fetchRoadmap(user.id);
        setHasRoadmap(!!(data && data.roadmap_json && data.roadmap_json.roadmap));
      } catch {
        setHasRoadmap(false);
      }
    };
    checkRoadmap();
  }, [user]);

  if (loading || questionnaireStatusLoading)
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="loader-lg"/>
        </div>
    );

  return (
    <>
      <Navbar user={user}/>
      <Routes>
        <Route path="/signup" element={<AuthForm isSignUp={true}/>}/>
        <Route path="/signin" element={<AuthForm isSignUp={false} />} />
        <Route path="/" element={
          <Home
              user={user}
              questionnaireComplete={questionnaireComplete}
              hasRoadmap={hasRoadmap}
          />
        }/>
        <Route path="/questionnaire" element={
          <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
            <Questionnaire onComplete={() => setQuestionnaireComplete(true)} user={user}/>
          </ProtectedRoute>
        }/>
        <Route path="/roadmap" element={
          <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
            <Roadmap user={user} onRoadmapGenerated={() => setHasRoadmap(true)}/>
          </ProtectedRoute>
        }/>
        <Route path="/resume" element={
          <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
            <ResumeMain />
          </ProtectedRoute>
        }/>
        <Route path="/resume/improve" element={<CreateResume/>}/>
        <Route path="/resume/feedback" element={<ResumeFeedback/>}/>
        <Route path="/dashboard" element={
          <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
            <JobDashboard user={user}/>
          </ProtectedRoute>
        }/>
        <Route path="/ai-interviewer" element={
          <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
            <AiInterviewerMain />
          </ProtectedRoute>
        }/>
        <Route path="/ai-interviewer/technical" element={
          <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
            <TechnicalPrep user={user} />
          </ProtectedRoute>
        }/>
        <Route path="/ai-interviewer/behavioral" element={
          <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
            <BehavioralPrep user={user}/>
          </ProtectedRoute>
        }/>
        <Route path="/ai-interviewer/blind75" element={
          <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
            <Blind75Prep user={user}/>
          </ProtectedRoute>
        }/>
        <Route path="*" element={<ErrorPage/>}/>
      </Routes>
      <Footer/>
    </>
  );
}

export default App;