import { useEffect } from "react";
import axiosInstance from "./axiosInstance";
import Sidebar from "./Sidebar";
import Header from "./Header";
import StatsCard from "./StatsCard";
import TaskList from "./TaskList";
import Timer from "./Timer";

function Dashboard() {

    useEffect(() => {

        async function fetchData() {

            try {

                const response =
                    await axiosInstance.get(
                        "auth/protected-view/"
                    );

                console.log(response.data);

            }

            catch (error) {

                console.log(error);

            }

        }
        fetchData();
    }, [])

    return (
            <>
        <div className="min-h-screen bg-[#050816] flex">

            {/* Sidebar */}

            <Sidebar />

            {/* Main Content */}

            <div className="flex-1 px-10 py-8 overflow-y-auto">

                {/* Header */}

                <Header />

                {/* Stats Cards */}

                <StatsCard />

                {/* Bottom Section */}

                <div className="grid grid-cols-2 gap-8 mt-8">

                    {/* Task List */}

                    <TaskList />

                    {/* Timer */}

                    <Timer />

                </div>

            </div>

        </div>
            </>
    )

}

export default Dashboard;