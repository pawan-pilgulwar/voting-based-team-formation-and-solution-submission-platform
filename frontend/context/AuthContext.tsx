"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { User } from "@/lib/types";

// Context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogout: () => void;
  fetchUser: () => Promise<void>;
  updateProfile: (
    data: Partial<User>,
    files?: { avatar?: File; coverImage?: File }
  ) => Promise<User | null>;
  changePassword: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<boolean>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  setLoading: () => {},
  handleLogout: () => {},
  fetchUser: async () => {},
  updateProfile: async () => null,
  changePassword: async () => false,
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
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
        },
      });

      if (res.data.data) {
        setUser(res.data.data);
        toast?.({ title: `Welcome back, ${res.data.data.name.split(" ")[0]}!`, description: "You are logged in." });
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null); // not logged in or token invalid
      toast?.({ title: "Session Expired", description: "Please log in again." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/logout`, {}, 
        {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      await fetchUser()
      toast?.({ title: "Logged Out", description: "You have been logged out successfully." });

    } catch (error: any) {
      console.log(error)
      toast?.({ title: "Logout Failed", description: error.response?.data?.message || "Something went wrong." });
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (
    data: Partial<User>,
    files?: { avatar?: File; coverImage?: File }
  ) => {
    try {
      let body: any = data;
      let headers: Record<string, string> = { "Cache-Control": "no-store" };
      if (files?.avatar || files?.coverImage) {
        const fd = new FormData();
        Object.entries(data || {}).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (Array.isArray(v)) {
            fd.append(k, v.join(","));
          } else {
            fd.append(k, String(v));
          }
        });
        if (files.avatar) fd.append("avatar", files.avatar);
        if (files.coverImage) fd.append("coverImage", files.coverImage);
        body = fd;
        headers = { "Cache-Control": "no-store" };
      } else {
        headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
      }

      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/update-profile`,
        body,
        {
          withCredentials: true,
          headers,
        }
      );
      if (res?.data?.data) {
        setUser(res.data.data as User);
        toast?.({ title: "Profile Updated", description: "Your profile has been updated successfully." });
        return res.data.data as User;
      }
      return null;
    } catch (err: any) {
      toast?.({ title: "Profile Update Failed", description: err.response?.data?.message || "Something went wrong." });
      throw err;
    }
  };

  const changePassword = async (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/change-password`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast?.({ title: "Password Changed", description: "Your password has been changed successfully." });
      return true;
    } catch (err: any) {
      toast?.({ title: "Password Change Failed", description: err.response?.data?.message || "Something went wrong." });
      throw err;
    }
  };

  // Fetch user on initial load
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, handleLogout, fetchUser, setLoading, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);
