"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

// User interface
interface User {
  _id: string;
  username?: string;
  name?: string;
  email?: string;
  avatar?: string;
  gender?: "male" | "female" | "other";
  role: string;
}

// Context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  handleLogout: () => void;
  fetchUser: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  handleLogout: () => {},
  fetchUser: async () => {},
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user info from backend
  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/getuser`, {
        withCredentials: true, // send cookies (JWT)
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null); // not logged in or token invalid
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/logout`, {}, 
        {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      fetchUser()

    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch user on initial load
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, handleLogout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);
