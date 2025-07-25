import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { createUser, getUserByFirebaseId } from "../services/userServices.js";
import { FcGoogle } from "react-icons/fc";
import { useNotification } from "../components/NotificationProvider";

const AuthForm = ({ isSignUp }) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [emailError, setEmailError] = useState("");
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleSignUp = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setLoading(true);
        setFormError("");
        setEmailError("");
        try {
            if (!username.trim()) throw new Error("Username cannot be empty");
            if (!emailRegex.test(email)) throw new Error("Please enter a valid email address");
            if (password.length < 8) throw new Error("Password must be at least 8 characters");
            if (!/[A-Z]/.test(password)) throw new Error("Password must contain at least one uppercase letter");
            if (!/\d/.test(password)) throw new Error("Password must contain at least one number");
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) throw new Error("Password must contain at least one special character");
            if (password !== confirmedPassword) throw new Error("Passwords do not match");

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            const data = {
                username: username,
                email: email,
                login_method: "email",
                firebase_id: userCredential.user.uid
            };

            await createUser(data);
            setTimeout(() => {
              navigate("/", { state: { showSignUpToast: true } });
              window.location.reload();
            }, 1200);

        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                setFormError("Email is already in use");
            } else if (error.message) {
                if (error.message.toLowerCase().includes("email")) setEmailError(error.message);
                else setFormError(error.message);
            } else {
                setFormError("Sign up failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setFormError("");
        setEmailError("");
        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address");
            return;
        }
        if (!password) {
            setFormError("Please enter your password");
            return;
        }
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseId = userCredential.user.uid;
            await getUserByFirebaseId(firebaseId);
            setTimeout(() => { navigate("/", { state: { showSignInToast: true } }); }, 1200);
        } catch (error) {
            if (error.code === "auth/user-not-found") {
                setFormError("No user found with this email");
            } else if (error.code === "auth/wrong-password") {
                setFormError("Incorrect password");
            } else if (error.code === "auth/invalid-email") {
                setEmailError("Invalid email address");
            } else {
                setFormError("Sign in failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            const email = result.user.email;
            const username = email.split("@")[0];
            const firebaseId = result.user.uid;

            try {
                await getUserByFirebaseId(firebaseId);
                showNotification("Sign in successful! Welcome back", "success");
                setTimeout(() => { navigate("/", { state: { showSignInToast: true } }); }, 1200);
            } catch {
                await createUser({
                    username,
                    email,
                    login_method: "google",
                    firebase_id: firebaseId,
                });
                showNotification("Sign up successful! Welcome", "success");
                setTimeout(() => { navigate("/", { state: { showSignUpToast: true } }); }, 1200);
            }
        } catch (error) {
            showNotification("Google authentication failed: " + error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-app-accent text-app-text border border-app-primary p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-app-primary">
                    {isSignUp ? "Create an Account" : "Sign In"}
                </h2>
                {formError && (
                    <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2" role="alert">
                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-8-4a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{formError}</span>
                    </div>
                )}
                <form className="flex flex-col gap-4">
                    {isSignUp && (
                        <div>
                            <label className="block mb-1 font-medium">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
                                placeholder="Enter your username"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => {
                                setEmail(e.target.value);
                                setEmailError("");
                            }}
                            className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
                            placeholder="Enter your email"
                        />
                        {emailError && (
                            <p className="text-red-500 text-sm mt-1">{emailError}</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
                            placeholder="Enter your password"
                        />
                    </div>
                    {isSignUp && (
                        <div>
                            <label className="block mb-1 font-medium">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmedPassword}
                                onChange={e => setConfirmedPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
                                placeholder="Confirm your password"
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-3 mt-4">
                        <button
                          type="button"
                          onClick={isSignUp ? handleSignUp : handleSignIn}
                          className="w-full font-semibold py-2 rounded-lg btn cursor-pointer"
                          disabled={loading}
                        >
                          {isSignUp ? (loading ? "Signing up..." : "Sign up") : (loading ? "Signing in..." : "Sign in")}
                        </button>
                        <button
                            type="button"
                            onClick={handleGoogleAuth}
                            className="w-full font-semibold py-2 rounded-lg flex items-center justify-center gap-2 btn cursor-pointer"
                            disabled={loading}
                        >
                            <FcGoogle/>
                            {isSignUp ? "Sign up with Google" : "Sign in with Google"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(isSignUp ? "/signin" : "/signup")}
                            className="w-full mt-2 font-semibold text-base py-1 rounded-lg btn cursor-pointer"
                            disabled={loading}
                        >
                            {isSignUp
                                ? "Already have an account? Sign In"
                                : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthForm;