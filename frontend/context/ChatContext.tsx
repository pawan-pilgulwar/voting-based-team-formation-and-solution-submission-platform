"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast"; 

// Define Chat type
export interface Chat {
  _id: string;
  team: string;
  sender: string;
  text: string;
  attachments: string[];
  role: "student" | "mentor" | "organization" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

// Context type
interface ChatContextType {
  chats: Chat[];
  loading: boolean;
  fetchTeamMessages: (teamId: string) => Promise<void>;
  postTeamMessage: (teamId: string, text: string, attachments?: string[]) => Promise<void>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch messages for a team
  const fetchTeamMessages = async (teamId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/team/${teamId}`, { withCredentials: true });
      setChats(res.data);
      toast?.({ title: "Messages Loaded", description: "Team messages have been loaded successfully." });
    } catch (err: any) {
      console.error("Failed to fetch team messages:", err);
      toast?.({ title: "Fetch Messages Failed", description: err.response?.data?.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  // Post a message to a team
  const postTeamMessage = async (teamId: string, text: string, attachments: string[] = []) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/team/${teamId}`,
        { text, attachments },
        { withCredentials: true }
      );
      setChats((prev) => [res.data, ...prev]);
      toast?.({ title: "Message Sent", description: "Your message has been sent successfully." });
    } catch (err: any) {
      console.error("Failed to post team message:", err);
      toast?.({ title: "Send Message Failed", description: err.response?.data?.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ chats, loading, fetchTeamMessages, postTeamMessage, setChats }}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};
