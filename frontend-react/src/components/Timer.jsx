import { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";

function Timer({ tasks, setTasks }) {

    const [selectedTask, setSelectedTask] = useState("");

    const [seconds, setSeconds] = useState(0);

    const [isRunning, setIsRunning] = useState(false);


    useEffect(() => {

        let interval;

        if (isRunning) {

            interval = setInterval(() => {

                setSeconds(prev => prev + 1);

            }, 1000);

        }

        return () => clearInterval(interval);

    }, [isRunning]);


    function formatTime() {

        const hrs =
            String(Math.floor(seconds / 3600))
                .padStart(2, "0");

        const mins =
            String(Math.floor((seconds % 3600) / 60))
                .padStart(2, "0");

        const secs =
            String(seconds % 60)
                .padStart(2, "0");

        return `${hrs}:${mins}:${secs}`;

    }



    async function handleStartStop() {

        if (!selectedTask) return;

        if (!isRunning) {

            const currentTask =
                tasks.find(
                    item => item.id == selectedTask
                );

            const updatedTask = {

                task_name: currentTask.task_name,

                task_description: currentTask.task_description,

                status: "ongoing",

                due_time: currentTask.due_time,

                duration: currentTask.duration

            };

            const response =
                await axiosInstance.put(

                    `tasks/${selectedTask}/`,

                    updatedTask

                );

            setTasks(

                tasks.map(

                    item =>

                        item.id == selectedTask

                            ?

                            response.data

                            :

                            item

                )

            );

        }

        setIsRunning(!isRunning);

    }



    async function handleComplete() {

        if (!selectedTask) return;

        const currentTask =
            tasks.find(
                item => item.id == selectedTask
            );

        const updatedTask = {

            task_name: currentTask.task_name,

            task_description: currentTask.task_description,

            status: "completed",

            due_time: currentTask.due_time,

            duration: seconds

        };

        const response =
            await axiosInstance.put(

                `tasks/${selectedTask}/`,

                updatedTask

            );


        setTasks(

            tasks.map(

                item =>

                    item.id == selectedTask

                        ?

                        response.data

                        :

                        item

            )

        );

        setIsRunning(false);

        setSeconds(0);

    }



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

            <h1 className="text-white text-3xl font-bold">

                Focus Timer

            </h1>

            <p className="text-gray-400 mt-2">

                Stay focused and productive

            </p>



            <select

                value={selectedTask}

                onChange={(e) => setSelectedTask(e.target.value)}

                className="
                mt-8
                bg-[#111827]
                border
                border-gray-700
                rounded-2xl
                p-4
                text-white
                w-full
                "

            >

                <option value="">

                    Select Task

                </option>

                {

                    tasks.map(

                        task =>

                            <option

                                key={task.id}

                                value={task.id}

                            >

                                {task.task_name}

                            </option>

                    )

                }

            </select>



            <div
                className="
                w-64
                h-64
                rounded-full
                border-10px
                border-purple-600
                flex
                flex-col
                justify-center
                items-center
                mt-10
                "
            >

                <h1 className="text-6xl font-bold text-white">

                    {formatTime()}

                </h1>

                <p className="text-gray-400 mt-3">

                    Focus Session

                </p>

            </div>



            <div className="flex gap-5 mt-10">

                <button

                    onClick={handleStartStop}

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

                    {

                        isRunning

                            ?

                            "Stop"

                            :

                            "Start"

                    }

                </button>



                <button

                    onClick={handleComplete}

                    className="
                    bg-green-600
                    hover:bg-green-700
                    px-8
                    py-4
                    rounded-2xl
                    text-white
                    font-semibold
                    "

                >

                    Complete

                </button>

            </div>

        </div>

    );

}

export default Timer;