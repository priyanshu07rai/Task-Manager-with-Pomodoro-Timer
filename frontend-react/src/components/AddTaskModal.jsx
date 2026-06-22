function AddTaskModal() {

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

                        <option>

                            To Do

                        </option>

                        <option>

                            In Progress

                        </option>

                        <option>

                            Completed

                        </option>

                    </select>



                    <input

                        type="time"

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