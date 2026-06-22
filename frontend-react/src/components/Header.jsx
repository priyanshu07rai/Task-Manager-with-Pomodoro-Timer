import { useContext } from "react";
import { AuthContext } from "../AuthProvider";
import { useNavigate } from "react-router-dom";

function Header() {

    const navigate = useNavigate();

    const { setIsLoggedIn } =
        useContext(AuthContext);

    function handleLogout() {

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        setIsLoggedIn(false);

        navigate('/login');
    }

    return (
        <>
            <button onClick={handleLogout}>
                Logout
            </button>
        </>
    )
}

export default Header;