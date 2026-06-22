import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/Dashboard"
          element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;