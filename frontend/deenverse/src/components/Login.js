import React, { useState } from "react";
import axios from "axios";
import { USER_API_END_POINT } from "../utils/constant.js";
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom";
import {useDispatch} from "react-redux"
import { getUser } from "../redux/userSlice.js";
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
        <div className="w-screen h-screen flex items-center justify-center">
            <div className="flex items-center justify-evenly w-[80%]">
                <div>
                    <img
                        className="ml-3"
                        width={"400px"}
                        src="https://cdn-icons-png.flaticon.com/128/2918/2918211.png"

                        alt="DEENVERSE"
                    />
                </div>
                <div>
                    <div className="my-5">
                        <h1 className="font-bold text-6xl">Learning now.</h1>
                    </div>
                    <h1 className="font-bold text-4xl mt-4 mb-2">
                        {isLogin ? "Signup" : "Login"}
                    </h1>
                    <form
                        onSubmit={submitHandler}
                        className="flex flex-col w-[50%]"
                    >
                        {!isLogin && (
                            <>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Name"
                                    className="outline-blue-500 border border-gray-800 px-3 py-1 rounded-full my-1 font-semibold text-black  "
                                />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    placeholder="Username"
                                    className="outline-blue-500 border border-gray-800 px-3 py-1 rounded-full my-1 font-semibold text-black"
                                />
                            </>
                        )}

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="E-mail"
                            className="outline-blue-500 border border-gray-800 px-3 py-1 rounded-full my-1 font-semibold text-black"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="outline-blue-500 border border-gray-800 px-3 py-1 rounded-full my-1 font-semibold text-black"
                        />
                        <button className="border-none rounded-full text-lg py-2 my-3 text-white bg-[#1D9BF0]">
                            {!isLogin ? "Create Account" : "Login"}
                        </button>
                        <h1>
                            {isLogin
                                ? "Do not have an account?"
                                : "Already have an account?"}{" "}
                            <span
                                onClick={loginHandler}
                                className="blue cursor-pointer text-blue-700 font-semibold  "
                            >
                                {isLogin ? "Signup" : "Login"}
                            </span>
                        </h1>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
