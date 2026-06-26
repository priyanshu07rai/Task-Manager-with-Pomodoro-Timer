import { useState } from "react";
import axiosInstance from "./axiosInstance";

function EditTaskModal({

    task,

    tasks,

    setTasks,

    setShowEdit

}){

    const [taskName, setTaskName] =
        useState(task.task_name);

    const [description, setDescription] =
        useState(task.task_description);

    const [status, setStatus] =
        useState(task.status);

    const [dueTime, setDueTime] =
        useState(task.due_time);


    async function handleUpdate() {

        const updatedTask = {

            task_name: taskName,

            task_description: description,

            status: status,

            due_time: dueTime

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

            setShowEdit(false);

        }

        catch(error) {

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
                w-500px
                "
            >

                <h1 className="text-3xl font-bold text-white">

                    Edit Task

                </h1>

                <div className="flex flex-col gap-5 mt-8">

                    <input

                        type="text"

                        value={taskName}

                        onChange={(e) =>
                            setTaskName(e.target.value)
                        }

                        className="
                        bg-[#111827]
                        border
                        border-gray-700
                        rounded-2xl
                        p-4
                        text-white
                        "
                    />


                    <textarea

                        value={description}

                        onChange={(e) =>
                            setDescription(e.target.value)
                        }

                        rows="4"

                        className="
                        bg-[#111827]
                        border
                        border-gray-700
                        rounded-2xl
                        p-4
                        text-white
                        resize-none
                        "
                    />



                    <select

                        value={status}

                        onChange={(e) =>
                            setStatus(e.target.value)
                        }

                        className="
                        bg-[#111827]
                        border
                        border-gray-700
                        rounded-2xl
                        p-4
                        text-white
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

                        value={dueTime || ""}

                        onChange={(e) =>
                            setDueTime(e.target.value)
                        }

                        className="
                        bg-[#111827]
                        border
                        border-gray-700
                        rounded-2xl
                        p-4
                        text-white
                        "
                    />

                </div>



                <div className="flex justify-end gap-5 mt-8">

                    <button

                        onClick={() => setShowEdit(false)}

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

                        onClick={handleUpdate}

                        className="
                        bg-purple-600
                        hover:bg-purple-700
                        px-6
                        py-3
                        rounded-2xl
                        text-white
                        "
                    >

                        Save Changes

                    </button>

                </div>

            </div>

        </div>

    )

}

export default EditTaskModal;