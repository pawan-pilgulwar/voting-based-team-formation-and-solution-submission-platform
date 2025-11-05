"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast"; // optional, if you have shadcn toast

export interface Solution {
  _id?: string;
  team: string;
  problem: string;
  submittedBy: string;
  files: string[];
  attachments?: string[];
  feedback?: any[];
  evaluation?: {
    score?: number;
    remarks?: string;
  };
  status: "draft" | "submitted" | "under-review" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

interface SolutionContextType {
  solutions: Solution[];
  loading: boolean;
  submitSolution: (data: Partial<Solution>) => Promise<void>;
  reviewSolution: (solutionId: string, evaluation: any) => Promise<void>;
  fetchTeamSolutions: (teamId: string) => Promise<void>;
}

const SolutionContext = createContext<SolutionContextType | undefined>(undefined);

export const SolutionProvider = ({ children }: { children: ReactNode }) => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Submit new solution
  const submitSolution = async (data: Partial<Solution>) => {
    try {
      setLoading(true);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/solution/submit`, data, { withCredentials: true });
      toast?.({ title: "Solution Submitted", description: "Your solution was successfully submitted." });
      setSolutions((prev) => [...prev, res.data.solution]);
    } catch (err: any) {
      console.error("Error submitting solution:", err);
      toast?.({ title: "Error", description: err.response?.data?.message || "Submission failed." });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Review solution (mentor/admin action)
  const reviewSolution = async (solutionId: string, evaluation: any) => {
    try {
      setLoading(true);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/solution/review`, { solutionId, evaluation }, { withCredentials: true });
      toast?.({ title: "Solution Reviewed", description: "Review submitted successfully." });
      setSolutions((prev) =>
        prev.map((sol) => (sol._id === solutionId ? { ...sol, evaluation: res.data.evaluation } : sol))
      );
    } catch (err: any) {
      console.error("Error reviewing solution:", err);
      toast?.({ title: "Error", description: err.response?.data?.message || "Review failed." });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch all solutions for a team
  const fetchTeamSolutions = async (teamId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/solution/team/${teamId}`, { withCredentials: true });
      setSolutions(res.data.solutions);
    } catch (err) {
      console.error("Error fetching team solutions:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SolutionContext.Provider
      value={{
        solutions,
        loading,
        submitSolution,
        reviewSolution,
        fetchTeamSolutions,
      }}
    >
      {children}
    </SolutionContext.Provider>
  );
};

export const useSolution = () => {
  const context = useContext(SolutionContext);
  if (!context) throw new Error("useSolution must be used within a SolutionProvider");
  return context;
};
