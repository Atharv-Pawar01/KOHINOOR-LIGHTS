import { createContext, useState, useEffect } from "react";

// Create Context
const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Function to fetch stored user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await window.electron.getUser("user");
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  // Function to handle login
  const login = async (data) => {
    try {
      if (data) {
        setUser(data.user); // Update state
      }
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, message: "Server error!" };
    }
  };

  // Function to handle logout
  const logout = async () => {
    try {
      setUser(null); // Clear state
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout,setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
