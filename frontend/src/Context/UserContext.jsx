import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
 const storedUser = JSON.parse(localStorage.getItem("user"));
const [currentUser, setCurrentUser] = useState(storedUser || null);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
          withCredentials: true,
        });
        setCurrentUser(res.data.user);
        
        
      } catch (error) {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const logout = async () => {
    setCurrentUser(null);
    await axios.get(`${BACKEND_URL}/api/v1/user/logout`, {
      withCredentials: true,
    });
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
