function TaskItem({ task }) {

    return (

        <div
            className="
            bg-[#111827]
            border
            border-gray-800
            rounded-2xl
            p-5
            flex
            justify-between
            items-center
            hover:border-purple-500
            transition
            "
        >

            {/* Left Side */}

            <div className="flex items-center gap-5">

                <input
                    type="checkbox"
                    className="
                    w-5
                    h-5
                    accent-purple-600
                    "
                />

                <div>

                    <h3 className="text-white text-xl font-semibold">

                        {task.title}

                    </h3>

                    <p className="text-gray-400 mt-1">

                        {task.time}

                    </p>

                </div>

            </div>



            {/* Right Side */}

            <div className="flex items-center gap-5">

                {

                    task.status === "Completed"

                    ?

                    <div
                        className="
                        bg-green-500/20
                        text-green-400
                        px-5
                        py-2
                        rounded-full
                        "
                    >

                        Completed

                    </div>

                    :

                    task.status === "In Progress"

                    ?

                    <div
                        className="
                        bg-blue-500/20
                        text-blue-400
                        px-5
                        py-2
                        rounded-full
                        "
                    >

                        In Progress

                    </div>

                    :

                    <div
                        className="
                        bg-orange-500/20
                        text-orange-400
                        px-5
                        py-2
                        rounded-full
                        "
                    >

                        To Do

                    </div>

                }



                <button
                    className="
                    text-gray-400
                    hover:text-white
                    text-3xl
                    "
                >

                    ⋮

                </button>

            </div>

        </div>

    )

}

export default TaskItem;