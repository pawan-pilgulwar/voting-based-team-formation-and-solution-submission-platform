"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast"; // optional, if you have shadcn toast

// Type for a code file (based on your backend model)
export interface CodeFile {
  _id: string;
  team: string;
  solution?: string;
  author: string;
  filename: string;
  path: string;
  type: "file" | "folder";
  language: string;
  content: string;
  updatedAt?: string;
  createdAt?: string;
}

// Context type
interface CodeFilesContextType {
  codeFiles: CodeFile[];
  loading: boolean;
  fetchTeamCodeFiles: (teamId: string) => Promise<void>;
  saveCodeFile: (file: Partial<CodeFile>) => Promise<void>;
  setCodeFiles: React.Dispatch<React.SetStateAction<CodeFile[]>>;
}

// Create context
const CodeFilesContext = createContext<CodeFilesContextType | undefined>(undefined);

// Provider component
export const CodeFilesProvider = ({ children }: { children: ReactNode }) => {
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch all code files for a team
  const fetchTeamCodeFiles = async (teamId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/code/team/${teamId}`, { withCredentials: true });
      setCodeFiles(res.data);
      toast?.({ title: "Code Files Loaded", description: "Team code files have been loaded successfully." });
    } catch (err: any) {
      console.error("Failed to fetch team code files:", err);
      toast?.({ title: "Fetch Code Files Failed", description: err.response?.data?.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  // Save or update a code file
  const saveCodeFile = async (file: Partial<CodeFile>) => {
    try {
      setLoading(true);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/code/save`, file, { withCredentials: true });
      
      // Update local state
      setCodeFiles((prev) => {
        const existingIndex = prev.findIndex((f) => f._id === res.data._id);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = res.data;
          toast?.({ title: "Code File Updated", description: "The code file has been updated successfully." });
          return updated;
        } else {
          toast?.({ title: "Code File Saved", description: "A new code file has been saved successfully." });
          return [res.data, ...prev];
        }
      });
    } catch (err: any) {
      toast?.({ title: "Save Code File Failed", description: err.response?.data?.message || "Something went wrong." });
      console.error("Failed to save code file:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CodeFilesContext.Provider
      value={{ codeFiles, loading, fetchTeamCodeFiles, saveCodeFile, setCodeFiles }}
    >
      {children}
    </CodeFilesContext.Provider>
  );
};

// Custom hook for consuming context
export const useCodeFiles = () => {
  const context = useContext(CodeFilesContext);
  if (!context) throw new Error("useCodeFiles must be used within CodeFilesProvider");
  return context;
};
