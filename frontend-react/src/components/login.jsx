import React from "react";
import { useState } from "react";
import axios from 'axios'
import { useContext } from "react";
import { AuthContext } from "../AuthProvider";
import { useNavigate } from "react-router-dom";


const Login = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { setIsLoggedIn } = useContext(AuthContext);

    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);

    const handleLogin = async (e) => {
    e.preventDefault();
    const userData = {
        username,
        password
    };
    try {
      const response = await axios.post(
            "http://127.0.0.1:8000/api/token/",
            userData
        );
        localStorage.setItem(
            "accessToken",
            response.data.access
        );
        localStorage.setItem(
            "refreshToken",
            response.data.refresh
        );
        setIsLoggedIn(true);
        navigate("/Dashboard");
    }
    catch (error) {
        alert("Invalid Username or Password");
    }

    }
    const handleRegister = async (e) => {
            e.preventDefault()
            const userData = {
                username,
                email,
                password
            }
            try{
                const response = await axios.post(
                    'http://127.0.0.1:8000/api/auth/register/',
                    userData
                )
                localStorage.setItem(
                    'accessToken',
                    response.data.access
                )
                localStorage.setItem(
                    'refreshToken',
                    response.data.refresh
                )
                setIsLoggedIn(true);
                setIsLogin(true);
                navigate('/Dashboard');
            }
            catch(error){
                alert("Username already exists");
            }
        }

    return (
        <>
           return (

                    <div className="min-h-screen bg-[#0b0120] flex">

                        {/* LEFT SIDE */}

                        <div className="w-1/2 relative flex flex-col justify-between p-16">

                            {/* Logo */}

                            <div>

                                <h1 className="text-white text-3xl font-bold">

                                    Focus<span className="text-purple-400">Flow</span>

                                </h1>

                            </div>



                            {/* Main Text */}

                            <div>

                                <h1 className="text-white text-7xl font-bold leading-tight">

                                    Plan.

                                </h1>

                                <h1 className="text-white text-7xl font-bold leading-tight">

                                    Focus.

                                </h1>

                                <h1 className="text-7xl font-bold">

                                    <span className="text-white">

                                        Achieve

                                    </span>

                                    <span className="text-purple-500">

                                        {" "}More.

                                    </span>

                                </h1>


                                <p className="text-gray-400 text-2xl mt-8 w-550px">

                                    Your all-in-one productivity hub with tasks,
                                    Pomodoro timer and analytics to help you stay
                                    on track and get things done.

                                </p>

                            </div>



                            {/* Bottom Quote */}

                            <div className="bg-[#1b0d45]/70 border border-purple-800 rounded-3xl p-6 w-500px">

                                <h1 className="text-purple-300 text-xl text-center">

                                    ❝ Discipline is the bridge between goals and accomplishment. ❞

                                </h1>

                                <p className="text-gray-500 text-center mt-2">

                                    — Jim Rohn

                                </p>

                            </div>

                        </div>



                        {/* RIGHT SIDE */}

                        <div className="w-1/2 flex justify-center items-center">

                            <div className="bg-[#1b0d45]/80 border border-purple-800 rounded-3xl p-10 w-500px shadow-2xl backdrop-blur-lg">


                                {/* Tabs */}

                                <div className="flex bg-[#2a1868] rounded-2xl overflow-hidden mb-10">

                                    <button

                                        onClick={() => {

                                            setIsLogin(true);

                                        }}

                                        className={`w-1/2 p-4 font-bold

                                        ${

                                            isLogin

                                            ?

                                            "bg-purple-600 text-white"

                                            :

                                            "text-gray-400"

                                        }

                                        `}

                                    >

                                        Login

                                    </button>



                                    <button

                                        onClick={() => {

                                            setIsLogin(false);

                                        }}

                                        className={`w-1/2 p-4 font-bold

                                        ${

                                            !isLogin

                                            ?

                                            "bg-purple-600 text-white"

                                            :

                                            "text-gray-400"

                                        }

                                        `}

                                    >

                                        Sign Up

                                    </button>

                                </div>



                                {/* Heading */}

                                <h1 className="text-white text-4xl font-bold text-center">

                                    {

                                        isLogin

                                        ?

                                        "Welcome Back"

                                        :

                                        "Create Account"

                                    }

                                </h1>


                                <p className="text-gray-400 text-center mt-3">

                                    {

                                        isLogin

                                        ?

                                        "Login to continue your productivity journey"

                                        :

                                        "Create your FocusFlow account"

                                    }

                                </p>



                                {/* Inputs */}

                                <div className="flex flex-col gap-5 mt-10">

                                    <input

                                        type="text"

                                        placeholder="Username"

                                        value={username}

                                        onChange={(e)=>{

                                            setUsername(e.target.value)

                                        }}

                                        className="bg-[#2a1868] border border-purple-700 p-4 rounded-xl text-white outline-none"

                                    />


                                    {

                                        !isLogin &&

                                        <input

                                            type="email"

                                            placeholder="Email"

                                            value={email}

                                            onChange={(e)=>{

                                                setEmail(e.target.value)

                                            }}

                                            className="bg-[#2a1868] border border-purple-700 p-4 rounded-xl text-white outline-none"

                                        />

                                    }



                                    <input

                                        type="password"

                                        placeholder="Password"

                                        value={password}

                                        onChange={(e)=>{

                                            setPassword(e.target.value)

                                        }}

                                        className="bg-[#2a1868] border border-purple-700 p-4 rounded-xl text-white outline-none"

                                    />



                                    {

                                        isLogin &&

                                        <div className="flex justify-between">

                                            <div className="flex gap-2">

                                                <input type="checkbox"/>

                                                <p className="text-gray-400">

                                                    Remember Me

                                                </p>

                                            </div>


                                            <p className="text-purple-400 cursor-pointer">

                                                Forgot Password?

                                            </p>

                                        </div>

                                    }



                                    <button

                                        onClick={

                                            isLogin

                                            ?

                                            handleLogin

                                            :

                                            handleRegister

                                        }

                                        className="bg-linear-to-r from-purple-600 to-fuchsia-500 p-4 rounded-xl text-white font-bold hover:scale-105 transition"

                                    >

                                        {

                                            isLogin

                                            ?

                                            "Login"

                                            :

                                            "Create Account"

                                        }

                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                )

        </>
    );
};

export default Login;