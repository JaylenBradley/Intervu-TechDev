import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { createUser, getUserByFirebaseId } from "../services/userServices.js";
import { FcGoogle } from "react-icons/fc";

const AuthForm = ({ isSignUp }) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");

    const navigate = useNavigate();

    const handleSignUp = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!username.trim()) {
            alert("Username cannot be empty");
            return;
        }
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address");
            return;
        }
        if (password.length < 8) {
            alert("Password must be at least 8 characters");
            return;
        }
        if (!/[A-Z]/.test(password)) {
            alert("Password must contain at least one uppercase letter");
            return;
        }
        if (!/\d/.test(password)) {
            alert("Password must contain at least one number");
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            alert("Password must contain at least one special character");
            return;
        }
        if (password !== confirmedPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            const data = {
                username: username,
                email: email,
                login_method: "email",
                firebase_id: userCredential.user.uid
            };

            await createUser(data);
            alert("Sign up successful! Welcome");
            navigate('/');

        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                alert("Email is already in use");
            } else {
                alert("Sign up failed: " + error.message);
            }
        }
    };

    const handleSignIn = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address");
            return;
        }
        if (!password) {
            alert("Please enter your password");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseId = userCredential.user.uid;
            await getUserByFirebaseId(firebaseId);

        alert("Sign in successful! Welcome back");
        navigate('/');

        } catch (error) {
            if (error.code === "auth/user-not-found") {
                alert("No user found with this email");
            } else if (error.code === "auth/wrong-password") {
                alert("Incorrect password");
            } else if (error.code === "auth/invalid-email") {
                alert("Invalid email address");
            } else {
                alert("Sign in failed: " + error.message);
            }
        }
    };

    const handleGoogleAuth = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            const email = result.user.email;
            const username = email.split("@")[0];
            const firebaseId = result.user.uid;

            try {
                await getUserByFirebaseId(firebaseId);
                alert("Sign in successful! Welcome back.");
            } catch {
                await createUser({
                    username,
                    email,
                    login_method: "google",
                    firebase_id: firebaseId,
                });
                alert("Sign up successful! Welcome.");
            }
            navigate("/");
        } catch (error) {
            alert("Google authentication failed: " + error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-app-accent text-app-text border border-app-primary p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-app-primary">
                    {isSignUp ? "Create an Account" : "Sign In"}
                </h2>
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
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-app-primary rounded-lg focus:outline-none bg-app-background text-app-text"
                            placeholder="Enter your email"
                        />
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
                          className="w-full font-semibold py-2 rounded-lg btn"
                        >
                          {isSignUp ? "Sign up" : "Sign in"}
                        </button>
                        <button
                            type="button"
                            onClick={handleGoogleAuth}
                            className="w-full font-semibold py-2 rounded-lg flex items-center justify-center gap-2 btn"
                        >
                            <FcGoogle/>
                            {isSignUp ? "Sign up with Google" : "Sign in with Google"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(isSignUp ? "/signin" : "/signup")}
                            className="w-full mt-2 font-semibold text-base py-1 rounded-lg btn"
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