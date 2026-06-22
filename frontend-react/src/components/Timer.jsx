function Timer() {

    return (

        <div
            className="
            bg-[#0d1328]
            border
            border-gray-800
            rounded-3xl
            p-8
            flex
            flex-col
            items-center
            "
        >

            {/* Heading */}

            <h1 className="text-white text-3xl font-bold">

                Focus Timer

            </h1>

            <p className="text-gray-400 mt-2">

                Stay focused and productive

            </p>



            {/* Circle */}

            <div
                className="
                w-64
                h-64
                rounded-full
                border-10px
                border-purple-600
                flex
                flex-col
                items-center
                justify-center
                mt-10
                "
            >

                <h1 className="text-6xl font-bold text-white">

                    25:00

                </h1>

                <p className="text-gray-400 mt-3">

                    Focus Session

                </p>

            </div>



            {/* Buttons */}

            <div className="flex gap-5 mt-10">

                <button
                    className="
                    bg-purple-600
                    hover:bg-purple-700
                    px-8
                    py-4
                    rounded-2xl
                    text-white
                    font-semibold
                    "
                >

                    Start

                </button>



                <button
                    className="
                    bg-[#111827]
                    border
                    border-gray-700
                    px-8
                    py-4
                    rounded-2xl
                    text-white
                    font-semibold
                    "
                >

                    Reset

                </button>

            </div>



            {/* Session Info */}

            <div className="mt-10 w-full">

                <div
                    className="
                    bg-[#111827]
                    rounded-2xl
                    p-5
                    border
                    border-gray-800
                    "
                >

                    <div className="flex justify-between">

                        <p className="text-gray-400">

                            Sessions Today

                        </p>

                        <p className="text-white font-semibold">

                            4

                        </p>

                    </div>



                    <div className="flex justify-between mt-4">

                        <p className="text-gray-400">

                            Focus Time

                        </p>

                        <p className="text-white font-semibold">

                            2h 15m

                        </p>

                    </div>

                </div>

            </div>

        </div>

    )

}

export default Timer;