import { useNavigate } from "react-router-dom";
import { BsLinkedin, BsGraphUpArrow } from "react-icons/bs";
import { FaGithubSquare } from "react-icons/fa";
import { RiRoadMapFill } from "react-icons/ri";
import { GiBrain } from "react-icons/gi";
import { SiProbot } from "react-icons/si";
import intervuLogo from "../assets/images/intervu-logo-transparent.png";

const features = [
  {
    title: "Personalized Roadmaps",
    desc: "Get a step-by-step plan tailored to your career goals, skills, and interests",
    icon: <RiRoadMapFill/>,
  },
  {
    title: "Technical & Behavioral Interview Prep",
    desc: "Practice with AI-generated questions and get instant feedback on your responses",
    icon: <SiProbot/>,
  },
  {
    title: "Resume Improvement",
    desc: "Access curated videos, books, articles, and courses to boost your learning",
    icon: <GiBrain/>,
  },
  {
    title: "Job Tracking",
    desc: "Monitor your journey and stay motivated as you reach milestones",
    icon: <BsGraphUpArrow/>,
  },
];

const team = [
  {
    name: "Jaylen Bradley",
    role: "Co-Founder & Lead Developer",
    linkedin: "https://www.linkedin.com/in/jaylenbradley8/",
    github: "https://github.com/JaylenBradley",
    img: null
  },
  {
    name: "Justin Song",
    role: "Co-Founder & Fullstack Engineer",
    linkedin: "https://www.linkedin.com/in/jujiwoo/",
    github: "https://github.com/jujiwoo",
    img: null
  },
    {
    name: "Samantha Adorno",
    role: "Co‑Founder & Backend Engineer",
    linkedin: "https://www.linkedin.com/in/samantha-adorno/",
    github: "https://github.com/sadorno1",
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
    <div className="min-h-screen flex flex-col items-center">
      <section className="w-full flex flex-col items-center justify-center mt-20 mb-12">
        <img src={intervuLogo} alt="Intervu Logo" className="h-40 mb-4 mx-auto" />
        <h1 className="text-5xl font-bold text-app-primary mb-2">
          Welcome to Intervu{user ? `, ${user.username}` : ""}
        </h1>
        <p className="text-2xl text-app-text mb-4 font-medium">
          Your AI-powered career planning and interview platform
        </p>
        <button
          className="btn-primary px-8 py-3 text-xl font-semibold rounded-lg mt-2 shadow cursor-pointer"
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
              <span className="text-5xl mb-3">
                {f.icon}
              </span>
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
          <div key={i} className="card rounded-xl p-6 shadow flex flex-col items-center border-app-primary bg-app-accent">
              <div className="font-bold text-lg">{member.name}</div>
              <div className="text-app-text mb-2">{member.role}</div>
              <div className="flex gap-2">
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline icon-pop">
                    <BsLinkedin size={28} />
                  </a>
                )}
                {member.github && (
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="underline icon-pop">
                    <FaGithubSquare size={28} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-3xl px-8 mb-24 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-app-primary mb-4 text-center">
          Ready to take the next step?
        </h2>
        <button
          className="btn-primary px-8 py-3 text-xl font-semibold rounded-lg shadow cursor-pointer"
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
                className="btn-primary w-full py-3 text-lg font-semibold rounded-lg cursor-pointer"
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