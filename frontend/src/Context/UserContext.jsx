import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch logged-in user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
          withCredentials: true,
        });
        setCurrentUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch (error) {
        setCurrentUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [BACKEND_URL]);

  // 🔹 Sync user changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("user");
    }
  }, [currentUser]);

  // 🔹 Logout
  const logout = async () => {
    try {
      await axios.get(`${BACKEND_URL}/api/v1/user/logout`, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loading,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
