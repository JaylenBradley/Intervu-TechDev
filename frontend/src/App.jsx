import { Analytics } from '@vercel/analytics/react';
import { auth } from "./services/firebase";
import { fetchQuestionnaireStatus, getUserByFirebaseId } from "./services/userServices";
import { fetchRoadmap } from "./services/roadmapServices";
import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import AiInterviewerMain from "./pages/AiInterviewerMain.jsx";
import AuthForm from "./containers/AuthForm.jsx";
import CareerGoalRoadmap from "./pages/CareerGoalRoadmap.jsx";
import BehavioralPrep from "./pages/BehavioralPrep.jsx";
import Blind75Prep from "./pages/Blind75Prep.jsx";
import ChangeResume from "./pages/ChangeResume";
import CreateResume from "./pages/CreateResume.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import JobDashboard from "./pages/JobDashboard.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./containers/ProtectedRoute.jsx";
import Questionnaire from "./pages/Questionnaire.jsx";
import ResumeMain from "./pages/ResumeMain.jsx";
import ResumeFeedback from "./pages/ResumeFeedback.jsx";
import RoadmapMain from "./pages/RoadmapMain.jsx";
import ScrollToTopButton from "./components/ScrollToTopButton.jsx";
import SkillGapRoadmap from "./pages/SkillGapRoadmap.jsx";
import SkillGapRoadmapDetail from "./pages/SkillGapRoadmapDetail.jsx";
import TailorResume from "./pages/TailorResume.jsx";
import TechnicalPrep from "./pages/TechnicalPrep.jsx";
import UploadResume from "./pages/UploadResume.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import NotificationProvider from "./components/NotificationProvider";
import BackgroundBlobs from "./components/BackgroundBlobs.jsx";

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
        } catch (error) {
          console.error("Failed to fetch user:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-200 to-cyan-400 relative overflow-x-hidden">
      <BackgroundBlobs />
      <div className="relative z-10">
        <NotificationProvider>
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
            <Route path="/profile" element={
              <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
                <UserProfile user={user}/>
              </ProtectedRoute>
            }/>
            {/*<Route path="/user/:id" element={*/}
            {/*  <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>*/}

            {/*  </ProtectedRoute>*/}
            {/*}/>*/}
            <Route path="/questionnaire" element={
              <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
                <Questionnaire onComplete={() => setQuestionnaireComplete(true)} user={user}/>
              </ProtectedRoute>
            }/>
            <Route path="/roadmaps" element={
            <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
              <RoadmapMain user={user}/>
            </ProtectedRoute>
            }/>
            <Route path="/roadmaps/career-goal-roadmap" element={
              <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
                <CareerGoalRoadmap user={user} onRoadmapGenerated={() => setHasRoadmap(true)}/>
              </ProtectedRoute>
            }/>
            <Route path="/roadmaps/skill-gap-roadmap" element={
              <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
                <SkillGapRoadmap user={user}/>
              </ProtectedRoute>
            }/>
            <Route path="/roadmaps/skill-gap-roadmap/:id" element={
              <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
                <SkillGapRoadmapDetail user={user}/>
              </ProtectedRoute>
            }/>
            <Route path="/resume" element={
              <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
                <ResumeMain user={user}/>
              </ProtectedRoute>
            }/>
            <Route path="/resume/upload" element={
              <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
                <UploadResume user={user}/>
              </ProtectedRoute>
            }/>
            <Route path="/resume/change" element={
              <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
                <ChangeResume user={user}/>
              </ProtectedRoute>
            }/>
            <Route path="/resume/improve" element={
              <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
                <CreateResume user={user}/>
              </ProtectedRoute>
            }/>
            <Route path="/resume/feedback" element={
              <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
                <ResumeFeedback user={user}/>
              </ProtectedRoute>
            }/>
            <Route path="/resume/tailor" element={
              <ProtectedRoute user={user} questionnaireComplete={questionnaireComplete}>
                <TailorResume user={user}/>
              </ProtectedRoute>
            }/>
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
          <ScrollToTopButton/>
          <Footer/>
          <Analytics/>
        </NotificationProvider>
      </div>
    </div>
  );
}

export default App;