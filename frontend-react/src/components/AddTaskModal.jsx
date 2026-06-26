import { useState } from "react";
import axiosInstance from "./axiosInstance";



function AddTaskModal({ setShowModal, tasks, setTasks }) {

    const [taskName, setTaskName] = useState("");

    const [description, setDescription] = useState("");

    const [status, setStatus] = useState("pending");

    const [dueTime, setDueTime] = useState("");


    async function handleSaveTask() {

        const taskData = {

            task_name: taskName,

            task_description: description,

            status: status,

            due_time: dueTime || null

        };

        try {

            const response = await axiosInstance.post(

                "tasks/",

                taskData

            );

            setTasks(

                [

                    ...tasks,

                    response.data

                ]

            );

            setShowModal(false);

        }

        catch (error) {

            console.log(error);

        }

    }

    return (

        <div
            className="
            fixed
            inset-0
            bg-black/60
            flex
            justify-center
            items-center
            "
        >

            <div
                className="
                bg-[#0d1328]
                border
                border-gray-800
                rounded-3xl
                p-8
                w-[500]px
                "
            >

                {/* Heading */}

                <h1 className="text-3xl font-bold text-white">

                    Add New Task

                </h1>

                <p className="text-gray-400 mt-2">

                    Create a task and stay productive.

                </p>



                {/* Inputs */}

                <div className="flex flex-col gap-5 mt-8">

                    <input

                        type="text"

                        value={taskName}

                        onChange={(e) => setTaskName(e.target.value)}

                        placeholder="Task Name"

                        className="
                        bg-[#111827]
                        border
                        border-gray-700
                        rounded-2xl
                        p-4
                        text-white
                        outline-none
                        "
                    />



                    <textarea
                        value={description}

                        onChange={(e) => setDescription(e.target.value)}

                        placeholder="Description"

                        rows="4"

                        className="
                        bg-[#111827]
                        border
                        border-gray-700
                        rounded-2xl
                        p-4
                        text-white
                        outline-none
                        resize-none
                        "
                    />


                    <select

                            value={status}

                            onChange={(e) => setStatus(e.target.value)}

                            className="
                            bg-[#111827]
                            border
                            border-gray-700
                            rounded-2xl
                            p-4
                            text-white
                            outline-none
                            "
                        >

                            <option value="pending">

                                To Do

                            </option>

                            <option value="ongoing">

                                In Progress

                            </option>

                            <option value="completed">

                                Completed

                            </option>

                    </select>



                    <input
                        type="time"

                        value={dueTime}

                        onChange={(e) => setDueTime(e.target.value)}

                        className="
                        bg-[#111827]
                        border
                        border-gray-700
                        rounded-2xl
                        p-4
                        text-white
                        outline-none
                        "
                    />

                </div>



                {/* Buttons */}

                <div className="flex justify-end gap-5 mt-8">

                    <button

                        onClick={() => setShowModal(false)}

                        className="
                        bg-[#111827]
                        border
                        border-gray-700
                        px-6
                        py-3
                        rounded-2xl
                        text-white
                        "
                    >

                        Cancel

                    </button>

                    <button

                        onClick={handleSaveTask}

                        className="
                        bg-purple-600
                        hover:bg-purple-700
                        px-6
                        py-3
                        rounded-2xl
                        text-white
                        font-semibold
                        "

                    >

                        Save Task

                    </button>
                </div>
            </div>
        </div>
    )
}
export default AddTaskModal;