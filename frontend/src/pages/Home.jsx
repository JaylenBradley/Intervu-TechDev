import { useNavigate } from "react-router-dom";
import intervuLogo from "../assets/images/intervu-logo-transparent.png";

const features = [
  {
    title: "Personalized Roadmaps",
    desc: "Get a step-by-step plan tailored to your career goals, skills, and interests.",
    icon: "🗺️",
  },
  {
    title: "Technical & Behavioral Interview Prep",
    desc: "Practice with AI-generated questions and get instant feedback on your answers.",
    icon: "🤖",
  },
  {
    title: "Resume Impromvent",
    desc: "Access curated videos, articles, and links to boost your learning.",
    icon: "📚",
  },
  {
    title: "Job Tracking",
    desc: "Monitor your journey and stay motivated as you reach milestones.",
    icon: "📈",
  },
];

const team = [
  {
    name: "Jaylen Bradley",
    role: "Co-Founder & Lead Developer",
    bio: "Jaylen specializes in full-stack development and product design. Passionate about helping others achieve their career goals.",
    img: null
  },
  {
    name: "Justin Song",
    role: "Co-Founder & AI Engineer",
    bio: "Justin focuses on AI, backend, and data. Dedicated to building smart tools for interview and career success.",
    img: null
  },
    {
    name: "Samantha Adorno",
    role: "Co‑Founder & Backend Engineer",
    bio: "Samantha works on backend APIs, databases, and system architecture. She's passionate about making technical tools more accessible and impactful.",
    img: null,
  },
];

const Home = ({ user, questionnaireComplete, hasRoadmap }) => {
  const showModal = user && !questionnaireComplete;
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-app-background flex flex-col items-center">
      <section className="w-full flex flex-col items-center justify-center mt-20 mb-12">
        <img src={intervuLogo} alt="Intervu Logo" className="h-40 mb-4 mx-auto" />
        <h1 className="text-5xl font-bold text-app-primary mb-2">
          Welcome to Intervu{user ? `, ${user.username}` : ""}
        </h1>
        <p className="text-2xl text-app-text mb-4 font-medium">
          Your AI-powered career planning and interview platform
        </p>
        <button
          className="btn-primary px-8 py-3 text-xl font-semibold rounded-lg mt-2 shadow"
          onClick={() => goTo(user ? "/roadmap" : "/signup")}
        >
          {user ? (hasRoadmap ? "View Your Roadmap" : "Create Your Roadmap") : "Get Started"}
        </button>
      </section>

      <section className="w-full max-w-5xl px-8 mb-16">
        <h2 className="text-3xl font-bold text-app-primary mb-8 text-center">Features</h2>
        <div className="grid grid-cols-2 gap-8">
          {features.map((f, i) => (
            <div key={i} className="card bg-app-accent border-app-primary rounded-xl p-6 shadow flex flex-col items-center">
              <span className="text-5xl mb-3">{f.icon}</span>
              <h3 className="text-xl font-semibold text-app-primary mb-2">{f.title}</h3>
              <p className="text-app-text text-center">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-4xl px-8 mb-16">
        <h2 className="text-3xl font-bold text-app-primary mb-8 text-center">Meet the Team</h2>
        <div className="flex gap-8 justify-center">
          {team.map((member, i) => (
            <div key={i} className="card bg-app-accent border-app-primary rounded-xl p-6 shadow flex flex-col items-center w-80">
              {/* If you add images, use: <img src={member.img} ... /> */}
              <h3 className="text-lg font-bold text-app-primary mb-1">{member.name}</h3>
              <span className="text-app-text text-center font-medium mb-2">{member.role}</span>
              <p className="text-app-text text-center text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-3xl px-8 mb-24 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-app-primary mb-4 text-center">
          Ready to take the next step?
        </h2>
        <button
          className="btn-primary px-8 py-3 text-xl font-semibold rounded-lg shadow"
          onClick={() => goTo(user ? "/roadmap" : "/signup")}
        >
          {user ? "Go to Your Roadmap" : "Sign Up Now"}
        </button>
      </section>
      {showModal && (
        <>
          <div className="fixed inset-0 z-40 backdrop-blur-md pointer-events-auto"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full border border-app-primary text-center relative">
              <h2 className="text-2xl font-bold mb-4 text-app-primary">
                Complete Questionnaire
              </h2>
              <p className="mb-6 text-app-text">
                Please complete the questionnaire before continuing
              </p>
              <button
                className="btn-primary w-full py-3 text-lg font-semibold rounded-lg"
                onClick={() => goTo("/questionnaire")}
              >
                Go to Questionnaire
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;