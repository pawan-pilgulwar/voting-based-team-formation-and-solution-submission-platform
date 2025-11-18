"use client";

import { EditorHeader } from "@/components/codeEditor/EditorHeader";
import { EditorLayout } from "@/components/codeEditor/EditorLayout";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { fetchTeamById } from "@/lib/api";
import type { Team } from "@/lib/types";
import { useState } from "react";

export default function Page() {
  const { teamId, problemId } = useParams<{ teamId: string; problemId: string }>();
  const { user } = useAuth();
  const readOnly = user?.role === "mentor" || user?.role === "organization";
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!teamId || !problemId) return;
      const team = await fetchTeamById(teamId);
      setTeam(team);
    };
    load();
  }, [teamId, problemId]);

  return (
    <RequireAuth>
      <div className="h-screen flex flex-col bg-background">
        <EditorHeader teamId={teamId} problemId={problemId} teamName={team?.name || "Team Alpha"} />
        <div className="flex-1 overflow-hidden">
          <EditorLayout teamId={teamId} problemId={problemId} readOnly={readOnly} />
        </div>
      </div>
    </RequireAuth>
  );
};
