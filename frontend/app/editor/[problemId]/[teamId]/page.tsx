"use client";

import { EditorHeader } from "@/components/codeEditor/EditorHeader";
import { EditorLayout } from "@/components/codeEditor/EditorLayout";
import { useParams } from "next/navigation";

export default function Page() {
  const { teamId, problemId } = useParams<{ teamId: string; problemId: string }>();

  return (
    <div className="h-screen flex flex-col bg-background">
      <EditorHeader teamId={teamId} problemId={problemId} teamName="Team Alpha" />
      <div className="flex-1 overflow-hidden">
        <EditorLayout teamId={teamId} problemId={problemId} />
      </div>
    </div>
  );
};
