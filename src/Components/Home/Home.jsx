import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../authContext/userContext";

const HomePage = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login"); // Redirect to login page
  };

  const handleLogout = () => {
    setUser(null); // Clear user data
    navigate("/login"); // Redirect back to login
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 text-white h-[90vh]">
      <h1 className="text-4xl font-bold mb-6">
        {user ? `Welcome, ${user.name}! 👋` : "Welcome to Our Desktop App"}
      </h1>

      <p className="text-lg text-gray-300 mb-4">
        {user ? "Manage your tasks seamlessly." : "Please log in to continue."}
      </p>

      <div className="flex gap-4">
        {!user ? (
          <button
            onClick={handleLogin}
            className="bg-blue-500 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition"
          >
            Login
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-600 transition"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default HomePage;
