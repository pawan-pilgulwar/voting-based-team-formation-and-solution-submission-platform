"use client";

import { useState, useEffect, useMemo } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const { user } = useAuth();
  const { chats, fetchTeamMessages, postTeamMessage, loading } = useChat();

  useEffect(() => {
    if (open && activeTeamId) {
      fetchTeamMessages(activeTeamId);
    }
  }, [open, activeTeamId, fetchTeamMessages]);

  const canChat = Boolean(user);

  if (!canChat) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <Card className="w-[360px] mb-3 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Team Chat</CardTitle>
            <div className="text-xs text-muted-foreground">Select a team to view messages</div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Enter Team ID"
                value={activeTeamId ?? ""}
                onChange={(e) => setActiveTeamId(e.target.value)}
              />
              <Button
                variant="secondary"
                onClick={() => {
                  if (activeTeamId) fetchTeamMessages(activeTeamId);
                }}
              >
                Load
              </Button>
            </div>
            <Separator className="my-2" />
            <div className="h-64 overflow-y-auto pr-2 space-y-2">
              {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
              {!loading && chats.length === 0 && (
                <div className="text-sm text-muted-foreground">No messages yet.</div>
              )}
              {chats.map((c) => (
                <div key={c._id} className="text-sm">
                  <span className="font-medium mr-2">{c.role}</span>
                  <span className="text-muted-foreground">{new Date(c.createdAt || '').toLocaleString()}</span>
                  <div>{c.text}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
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
          </CardContent>
        </Card>
      )}

      <Button size="icon" className="rounded-full h-12 w-12 shadow-lg" onClick={() => setOpen((v) => !v)}>
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}
