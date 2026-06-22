import TaskItem from "./TaskItem";

function TaskList() {

    const tasks = [

        {
            id: 1,
            title: "API Integration",
            status: "Completed",
            time: "12:30 PM"
        },

        {
            id: 2,
            title: "Database Optimization",
            status: "In Progress",
            time: "2:00 PM"
        },

        {
            id: 3,
            title: "React Components",
            status: "To Do",
            time: "4:30 PM"
        }

    ];


    return (

        <div className="bg-[#0d1328] border border-gray-800 rounded-3xl p-8">

            {/* Header */}

            <div className="flex justify-between items-center mb-8">

                <div>

                    <h1 className="text-3xl font-bold text-white">

                        Today's Tasks

                    </h1>

                    <p className="text-gray-400 mt-2">

                        Stay productive and focused

                    </p>

                </div>


                <button
                    className="
                    bg-purple-600
                    hover:bg-purple-700
                    text-white
                    px-6
                    py-3
                    rounded-2xl
                    font-semibold
                    "
                >

                    + Add Task

                </button>

            </div>


            {/* Tasks */}

            <div className="flex flex-col gap-5">

                {

                    tasks.map((task) => (

                        <TaskItem

                            key={task.id}

                            task={task}

                        />

                    ))

                }

            </div>

        </div>

    )

}

export default TaskList;