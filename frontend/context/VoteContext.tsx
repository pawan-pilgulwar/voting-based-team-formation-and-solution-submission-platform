"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast"; // optional (for notifications)

interface VoteContextType {
  voteCounts: Record<string, number>; // { problemId: count }
  hasVoted: Record<string, boolean>; // { problemId: true/false }
  loading: boolean;
  castVote: (problemId: string) => Promise<void>;
  getVoteCount: (problemId: string) => Promise<void>;
}

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export const VoteProvider = ({ children }: { children: ReactNode }) => {
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [hasVoted, setHasVoted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // 🗳️ Cast a vote
  const castVote = async (problemId: string) => {
    try {
      setLoading(true);
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/votes/${problemId}`, {}, { withCredentials: true });

      // update local state
      setHasVoted((prev) => ({ ...prev, [problemId]: true }));
      setVoteCounts((prev) => ({
        ...prev,
        [problemId]: (prev[problemId] || 0) + 1,
      }));

      toast({
        title: "Vote Recorded",
        description: "Your vote has been successfully submitted.",
      });
    } catch (error: any) {
      console.error("Error casting vote:", error);
      toast({
        title: "Vote Failed",
        description: error.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔢 Get total votes for a problem
  const getVoteCount = async (problemId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/votes/${problemId}/count`, {
        withCredentials: true,
      });
      setVoteCounts((prev) => ({
        ...prev,
        [problemId]: res.data?.count || 0,
      }));
    } catch (error) {
      console.error("Error fetching vote count:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VoteContext.Provider
      value={{
        voteCounts,
        hasVoted,
        loading,
        castVote,
        getVoteCount,
      }}
    >
      {children}
    </VoteContext.Provider>
  );
};

// 🧠 Custom Hook
export const useVote = () => {
  const context = useContext(VoteContext);
  if (!context) {
    throw new Error("useVote must be used within a VoteProvider");
  }
  return context;
};
