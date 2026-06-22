function Sidebar() {

    return (

        <div className="w-280px h-screen bg-[#081021] border-r border-gray-800 flex flex-col justify-between p-6">

            {/* Logo */}

            <div>

                <h1 className="text-4xl font-bold text-white">

                    Focus<span className="text-purple-500">Flow</span>

                </h1>

                <p className="text-gray-400 mt-3">
                    Plan. Focus. Achieve More.
                </p>


                {/* Dashboard Button */}

                <button
                    className="
                    mt-12
                    w-full
                    bg-purple-600
                    hover:bg-purple-700
                    text-white
                    py-4
                    rounded-2xl
                    text-xl
                    font-semibold
                    "
                >

                    Dashboard

                </button>

            </div>


            {/* User Card */}

            <div
                className="
                bg-[#0d1328]
                border
                border-gray-800
                rounded-3xl
                p-5
                "
            >

                <h3 className="text-white text-2xl font-semibold">

                    Priyanshu Rai

                </h3>

                <p className="text-gray-400 mt-2">

                    Stay focused!

                </p>

            </div>

        </div>

    )

}

export default Sidebar;