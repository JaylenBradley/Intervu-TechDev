import Navbar from "../components/Navbar.jsx";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";

const Home = () => (
  <div className="min-h-screen bg-app-background">
    <div className="flex flex-col items-center justify-center mt-24">
      <h1 className="text-5xl font-bold mb-4 text-app-primary">
        Welcome to Intervu
      </h1>
      <p className="text-xl text-app-text">
        An Interview and Career Planning Platform
      </p>
      <button
        className="mt-8 px-4 py-2 bg-neutral-100 text-app-text rounded"
        onClick={() => signOut(auth)}
      >
        Sign Out
      </button>
    </div>
  </div>
);

export default Home;