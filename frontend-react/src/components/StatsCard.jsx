function StatsCard() {

    return (

        <div className="grid grid-cols-4 gap-6 mt-10">

            {/* Tasks Card */}

            <div className="bg-[#0d1328] rounded-3xl p-7 border border-gray-800">

                <div className="flex items-center gap-5">

                    <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-3xl">

                        ✔

                    </div>

                    <div>

                        <h3 className="text-gray-400">

                            Tasks Today

                        </h3>

                        <h1 className="text-white text-5xl font-bold mt-2">

                            5

                        </h1>

                    </div>

                </div>

                <p className="text-gray-500 mt-6">

                    3 completed

                </p>

            </div>



            {/* Focus Time Card */}

            <div className="bg-[#0d1328] rounded-3xl p-7 border border-gray-800">

                <div className="flex items-center gap-5">

                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl">

                        🕒

                    </div>

                    <div>

                        <h3 className="text-gray-400">

                            Focus Time

                        </h3>

                        <h1 className="text-white text-5xl font-bold mt-2">

                            2h 15m

                        </h1>

                    </div>

                </div>

                <p className="text-green-400 mt-6">

                    +12% from yesterday

                </p>

            </div>



            {/* Pomodoro Card */}

            <div className="bg-[#0d1328] rounded-3xl p-7 border border-gray-800">

                <div className="flex items-center gap-5">

                    <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-3xl">

                        🔥

                    </div>

                    <div>

                        <h3 className="text-gray-400">

                            Pomodoros

                        </h3>

                        <h1 className="text-white text-5xl font-bold mt-2">

                            4

                        </h1>

                    </div>

                </div>

                <p className="text-gray-500 mt-6">

                    Great job! 🔥

                </p>

            </div>



            {/* Streak Card */}

            <div className="bg-[#0d1328] rounded-3xl p-7 border border-gray-800">

                <div className="flex items-center gap-5">

                    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-3xl">

                        📈

                    </div>

                    <div>

                        <h3 className="text-gray-400">

                            Streak

                        </h3>

                        <h1 className="text-white text-5xl font-bold mt-2">

                            7

                        </h1>

                    </div>

                </div>

                <p className="text-gray-500 mt-6">

                    Keep it up! 💪

                </p>

            </div>

        </div>

    )

}

export default StatsCard;