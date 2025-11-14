"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast"; 

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

interface ChatContextType {
  chats: Chat[];
  loading: boolean;
  fetchTeamMessages: (teamId: string) => Promise<void>;
  postTeamMessage: (teamId: string, text: string, attachments?: string[]) => Promise<void>;
  deleteOwnMessage: (messageId: string) => Promise<void>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTeamMessages = async (teamId: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chat/team/${teamId}`, { withCredentials: true });
      setChats(res.data?.data || res.data || []);
      toast?.({ title: "Messages Loaded", description: "Team messages have been loaded successfully." });
    } catch (err: any) {
      console.error("Failed to fetch team messages:", err);
      toast?.({ title: "Fetch Messages Failed", description: err.response?.data?.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const postTeamMessage = async (teamId: string, text: string, attachments: string[] = []) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chat/team/${teamId}`,
        { text, attachments },
        { withCredentials: true }
      );
      const msg = res.data?.data || res.data;
      setChats((prev) => [...prev, msg]);
      toast?.({ title: "Message Sent", description: "Your message has been sent successfully." });
    } catch (err: any) {
      console.error("Failed to post team message:", err);
      toast?.({ title: "Send Message Failed", description: err.response?.data?.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const deleteOwnMessage = async (messageId: string) => {
    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chat/message/${messageId}`, { withCredentials: true });
      const id = res.data?.data?._id || messageId;
      setChats((prev) => prev.filter((m) => m._id !== id));
    } catch (err: any) {
      console.error("Failed to delete message:", err);
      toast?.({ title: "Delete Failed", description: err.response?.data?.message || "Something went wrong." });
    }
  };

  return (
    <ChatContext.Provider value={{ chats, loading, fetchTeamMessages, postTeamMessage, deleteOwnMessage, setChats }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};
