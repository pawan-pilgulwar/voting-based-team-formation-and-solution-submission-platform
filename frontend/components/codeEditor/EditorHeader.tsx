"use client";

import { Code2, Users } from "lucide-react";

interface EditorHeaderProps {
  teamId: string;
  problemId: string;
  teamName?: string;
}

export const EditorHeader = ({ teamName = "Team Alpha" }: EditorHeaderProps) => {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Student Solution Platform</h1>
        </div>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{teamName}</span>
        </div>
      </div>
    </header>
  );
};
