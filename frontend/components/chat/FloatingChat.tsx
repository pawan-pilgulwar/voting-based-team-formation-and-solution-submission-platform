"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { MessageCircle, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { api, chatList as getChatList } from "@/lib/api";
import { Team } from "@/lib/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { io, Socket } from "socket.io-client";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const { user } = useAuth();
  const { chats, fetchTeamMessages, postTeamMessage, deleteOwnMessage, loading, setChats } = useChat();
  const [chatList, setChatList] = useState<Team[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const listView = activeTeamId === null;

  useEffect(() => {
    const fetchChatList = async () => {
      const data = await getChatList(user?._id || "");
      setChatList(data);
    };
    if (open) fetchChatList();
  }, [open, user?._id]);

  useEffect(() => {
    if (!open || !activeTeamId) return;
    fetchTeamMessages(activeTeamId);

    const ns = `${process.env.NEXT_PUBLIC_BACKEND_URL}/team/${activeTeamId}`;
    const s = io(ns, { withCredentials: true, transports: ["websocket"] });
    socketRef.current = s;
    s.on("connect", () => {});
    s.on("message", (payload: any) => {
      setChats((prev) => [...prev, payload]);
    });
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [open, activeTeamId, fetchTeamMessages, setChats]);

  const canChat = Boolean(user);

  if (!canChat) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="p-0 w-[380px] sm:w-[420px]">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center gap-2">
              {!listView && (
                <Button variant="ghost" size="icon" onClick={() => setActiveTeamId(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <SheetTitle>{listView ? "Your Teams" : "Team Chat"}</SheetTitle>
            </div>
          </SheetHeader>

          {listView ? (
            <div className="p-4">
              <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2 space-y-2">
                {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
                {!loading && chatList.length === 0 && (
                  <div className="text-sm text-muted-foreground">No teams found</div>
                )}
                {chatList.map((team) => (
                  <Card key={team._id} className="shadow-sm hover:bg-accent cursor-pointer" onClick={() => setActiveTeamId(team._id)}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">{team.name}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4">
                <div className="h-[calc(100vh-260px)] overflow-y-auto space-y-3 pr-1">
                  {chats.map((c) =>{
                    const isOwnMessage = c.sender === user?._id;
                    return (
                      <div
                        key={c._id}
                        className={`flex items-start gap-2 ${
                          isOwnMessage ? "justify-end" : "justify-sart"
                        }`}
                      >
                        {/* Message bubble wrapper */}
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm ${
                            isOwnMessage
                              ? "bg-primary/10 text-left rounded-tr-none"
                              : "bg-secondary/20 text-right rounded-tl-none"
                        }`}
                      >
                        <div className="text-[10px] text-muted-foreground mb-1">
                          {new Date(c.createdAt || "").toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{c.text}</div>
                      </div>

                      {/* Show delete button for user's own messages */}
                      {isOwnMessage && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteOwnMessage(c._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && activeTeamId && message.trim()) {
                        postTeamMessage(activeTeamId, message.trim());
                        setMessage("");
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (activeTeamId && message.trim()) {
                        postTeamMessage(activeTeamId, message.trim());
                        setMessage("");
                      }
                    }}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Button size="icon" className="rounded-full h-12 w-12 shadow-lg" onClick={() => setOpen((v) => !v)}>
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}
