import { useEffect } from "react";
import axiosInstance from "./axiosInstance";

function Dashboard() {

    useEffect(() => {

        async function fetchData() {

            try {

                const response =
                    await axiosInstance.get(
                        "protected-view/"
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
        <h1>Dashboard</h1>
    )
}
export default Dashboard;