import axiosInstance from "./axiosInstance";
import EditTaskModal from "./EditTaskModal";
import { useState } from "react";

function TaskItem({ task ,setTasks,tasks }) {

    async function handleDelete() {

        try {

            await axiosInstance.delete(

                `tasks/${task.id}/`

            );

            setTasks(

                tasks.filter(

                    item => item.id !== task.id

                )

            );

        }

        catch(error) {

            console.log(error);

        }

    }

    async function handleComplete() {

        const updatedTask = {

            task_name: task.task_name,

            task_description: task.task_description,

            status:

                task.status === "completed"

                ?

                "pending"

                :

                "completed",

            due_time: task.due_time

        };


        try {

            const response =
                await axiosInstance.put(

                    `tasks/${task.id}/`,

                    updatedTask

                );


            setTasks(

                tasks.map(

                    item =>

                        item.id === task.id

                        ?

                        response.data

                        :

                        item

                )

            );

        }

        catch(error) {

            console.log(error);

        }

    }

    const [showEdit, setShowEdit] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

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

            <div>

                <h3 className="text-white text-xl font-semibold">

                    {task.task_name}

                </h3>


                {

                    task.task_description &&

                    <p className="text-gray-500 text-sm mt-1">

                        {task.task_description}

                    </p>

                }


                <p className="text-gray-400 text-sm mt-2">

                    {

                        task.due_time

                        ?

                        new Date(
                            `1970-01-01T${task.due_time}`
                        ).toLocaleTimeString(

                            [],

                            {

                                hour: "numeric",

                                minute: "2-digit"

                            }

                        )

                        :

                        ""

                    }

                </p>

                {

                    task.status === "completed"

                    &&

                    <p className="text-green-400 text-sm mt-2">

                        Completed in

                        {

                            Math.floor(task.duration / 3600)

                        }

                        h

                        {

                            Math.floor((task.duration % 3600) / 60)

                        }

                        min

                    </p>

                }

            </div>

        </div>



            {/* Right Side */}

            <div className="flex items-center gap-5">

                {

                    task.status === "completed"

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

                    task.status === "ongoing"

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

                <div className="relative">

                    <button

                        className="
                        text-gray-400
                        text-3xl
                        hover:text-white
                        "

                        onClick={() => setShowMenu(!showMenu)}

                    >

                        ⋮

                    </button>



                    {

                        showMenu &&

                        <div

                            className="
                            absolute
                            right-0
                            top-12
                            bg-[#111827]
                            border
                            border-gray-700
                            rounded-xl
                            w-40
                            shadow-xl
                            z-50
                            "

                        >

                            <button

                                className="
                                block
                                w-full
                                text-left
                                px-5
                                py-3
                                text-white
                                hover:bg-[#1f2937]
                                "

                                onClick={() => {

                                    setShowEdit(true);

                                    setShowMenu(false);

                                }}

                            >

                                Edit

                            </button>



                            <button

                                className="
                                block
                                w-full
                                text-left
                                px-5
                                py-3
                                text-red-400
                                hover:bg-[#1f2937]
                                "

                                onClick={handleDelete}

                            >

                                Delete

                            </button>

                        </div>

                    }

                </div>



            </div>
                {

                    showEdit &&

                    <EditTaskModal

                        task={task}

                        tasks={tasks}

                        setTasks={setTasks}

                        setShowEdit={setShowEdit}

                    />

                }
        </div>

    )

}

export default TaskItem;