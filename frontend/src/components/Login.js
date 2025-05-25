import React, { useState } from "react";
import axios from "axios";
import { USER_API_END_POINT } from "../utils/constant.js";
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom";
import { useDispatch} from "react-redux"
import { getUser} from "../redux/userSlice.js";

// Optional: Import an icon for the login page if you have one
// import { BookOpen } from 'lucide-react'; 

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    function loginHandler() {
        setIsLogin(!isLogin);
    }
    const submitHandler = async (e) => {
        e.preventDefault();
    console.log(name, username, email, password)
        if (isLogin) {
            // login
            try {
              const res = await axios.post(
                    `${USER_API_END_POINT}/login`,
                    { email, password },
                    {
                        headers: { "Content-Type": "application/json" },
                        withCredentials: true,
                    }
                );
                console.log(res.data)
                dispatch(getUser(res?.data?.user))
                
                
                if(res.data.success) {
                    navigate("/")
                    toast.success(res.data.message);
                }
                
                
            } catch (error) {
                toast.success(error.response.data.message);
                console.log(error);
            }
        } else {
            // signup
            try {
                const res = await axios.post(
                    `${USER_API_END_POINT}/register`,
                    { name, username, email, password },
                    {
                        headers: { "Content-Type": "application/json" },
                        withCredentials: true,
                    }
                );
                dispatch(getUser(res?.data?.user))
                if(res.data.success) {
                    navigate("/")
                    toast.success(res.data.message);
                }
             } catch (error) {
                toast.success(error.response.data.message);
                console.log(error);
            }
        }
    };
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-theme-primary-accent p-4">
            {/* Optional: Logo or App Name */}
            {/* <div className="mb-8 text-center">
                <BookOpen size={48} className="mx-auto text-theme-text-primary" /> 
                <h1 className="text-4xl font-bold text-theme-text-primary mt-2">DeenVerse</h1>
            </div> */}
            
            <div className="w-full max-w-md bg-theme-card-bg p-8 rounded-xl shadow-2xl">
                <div className="my-5 text-center">
                    <h1 className="font-bold text-3xl sm:text-4xl text-theme-text-primary">
                        {isLogin ? "Welcome Back" : "Join DeenVerse"}
                    </h1>
                    <p className="text-theme-text-secondary mt-2">
                        {isLogin ? "Login to continue your journey." : "Create an account to start exploring."}
                    </p>
                </div>
                
                <form
                    onSubmit={submitHandler}
                    className="space-y-6"
                >
                    {!isLogin && (
                        <>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-theme-text-primary mb-1">Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Full Name"
                                    className="w-full outline-none border border-theme-border px-4 py-2 rounded-lg focus:ring-2 focus:ring-theme-primary-accent focus:border-theme-primary-accent transition-colors bg-theme-background text-theme-text-primary"
                                    required={!isLogin}
                                />
                            </div>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-theme-text-primary mb-1">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Choose a Username"
                                    className="w-full outline-none border border-theme-border px-4 py-2 rounded-lg focus:ring-2 focus:ring-theme-primary-accent focus:border-theme-primary-accent transition-colors bg-theme-background text-theme-text-primary"
                                    required={!isLogin}
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-theme-text-primary mb-1">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="w-full outline-none border border-theme-border px-4 py-2 rounded-lg focus:ring-2 focus:ring-theme-primary-accent focus:border-theme-primary-accent transition-colors bg-theme-background text-theme-text-primary"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-theme-text-primary mb-1">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Your Password"
                            className="w-full outline-none border border-theme-border px-4 py-2 rounded-lg focus:ring-2 focus:ring-theme-primary-accent focus:border-theme-primary-accent transition-colors bg-theme-background text-theme-text-primary"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full bg-theme-button-primary-bg text-theme-button-primary-text font-semibold py-3 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-theme-button-primary-bg focus:ring-offset-2 focus:ring-offset-theme-card-bg transition-colors"
                    >
                        {isLogin ? "Login" : "Create Account"}
                    </button>
                </form>
                <p className="text-center text-sm text-theme-text-secondary mt-8">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <span
                        onClick={loginHandler}
                        className="font-semibold text-theme-hyperlink hover:underline cursor-pointer"
                    >
                        {isLogin ? "Sign up" : "Login"}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
