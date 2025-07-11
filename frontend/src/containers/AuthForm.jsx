import { useState } from "react";
import { auth } from "../services/firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const AuthForm = ({ isSignUp }) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");

    const handleSignUp = async () => {
        if (password !== confirmedPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // You can use userCredential.user here
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleSignIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // You can use userCredential.user here
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleSignWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            // You can use result.user here
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8">
                <form className="flex flex-col">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />

                    {isSignUp &&
                        <>
                            <label>Email</label>
                            <input
                                type="text"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </>
                    }

                    <label>Password</label>
                    <input
                        type="text"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    {isSignUp &&
                        <label>Confirm Password</label>
                        <input
                            type="text"
                            value={confirmedPassword}
                            onChange={e => setConfirmedPassword(e.target.value)}
                        />
                    }
                </form>
            </div>
        </div>
    );
};

export default AuthForm;