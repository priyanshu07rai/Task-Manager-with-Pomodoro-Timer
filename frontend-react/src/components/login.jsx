import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    function HandleLogin() {

        if(email === "" || password === ""){
            alert("Fill all fields");
            return;
        }

        localStorage.setItem("user", email);

        navigate("/dashboard");
    }

    return (
        <>

        <div className="min-h-screen bg-[#0f0725] flex">

            {/* left side */}

            <div className="w-1/2 flex flex-col justify-center pl-20">

                <h1 className="text-7xl font-bold text-white">
                    Plan.
                </h1>

                <h1 className="text-7xl font-bold text-white">
                    Focus.
                </h1>

                <h1 className="text-7xl font-bold text-purple-500">
                    Achieve More.
                </h1>

                <p className="text-gray-300 mt-8 text-xl w-500px">
                    Your all-in-one productivity hub with tasks,
                    Pomodoro timer and analytics.
                </p>

            </div>

            {/* login card */}

            <div className="w-1/2 flex justify-center items-center">

                <div className="bg-[#1b0d45] p-10 rounded-3xl w-500px border border-purple-700">

                    <h1 className="text-white text-4xl font-bold text-center">
                        Welcome Back
                    </h1>

                    <p className="text-gray-400 text-center mt-2">
                        Login to continue your productivity journey
                    </p>

                    <div className="flex flex-col gap-5 mt-10">

                        <input
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e)=>{
                            setEmail(e.target.value);
                        }}
                        className="p-4 rounded-xl bg-[#2a1868] text-white outline-none"
                        />

                        <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e)=>{
                            setPassword(e.target.value);
                        }}
                        className="p-4 rounded-xl bg-[#2a1868] text-white outline-none"
                        />

                        <button
                        onClick={HandleLogin}
                        className="bg-purple-600 p-4 rounded-xl text-white font-bold hover:scale-105 transition"
                        >
                            Login
                        </button>

                    </div>

                </div>

            </div>

        </div>

        </>
    );
};

export default Login;