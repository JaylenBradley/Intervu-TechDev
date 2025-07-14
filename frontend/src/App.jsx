import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Home from "./pages/Home.jsx";
import AuthForm from "./containers/AuthForm.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import Navbar from "./components/Navbar.jsx";

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
        <Route path="*" element={<ErrorPage/>}/>
      </Routes>
    </Router>
  );
};

export default App;