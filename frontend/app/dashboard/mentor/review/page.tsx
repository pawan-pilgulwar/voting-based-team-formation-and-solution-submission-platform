"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { fetchTeams, getSolutionsByTeam } from "@/lib/api";
import Link from "next/link";

interface Solution {
  _id: string;
  team: { _id: string; name?: string } | string;
  problem: { _id: string; title?: string } | string;
  status: "submitted" | "under-review" | "approved" | "rejected";
  createdAt?: string;
  files?: any[];
}

interface TeamWithSolutions {
  _id: string;
  name: string;
  problem: { _id: string; title?: string };
  solutions: Solution[];
}

export default function MentorReviewPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teamsWithSubmissions, setTeamsWithSubmissions] = useState<TeamWithSolutions[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        
        // Fetch teams assigned to this mentor
        const teams = await fetchTeams({ mentorId: user?._id });

        // Fetch solutions for each team
        const teamsData: TeamWithSolutions[] = [];
        for (const team of teams) {
          try {
            const solutions = await getSolutionsByTeam(team._id);
            if (solutions.length > 0) {
              teamsData.push({
                _id: team._id,
                name: team.name,
                problem: team.problem,
                solutions: solutions,
              });
            }
          } catch (e) {
            // Skip if error loading solutions for this team
          }
        }

        setTeamsWithSubmissions(teamsData);
      } catch (e: any) {
        console.error("Failed to load teams and solutions", e);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      load();
    }
  }, [user?._id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "under-review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading team submissions...</div>
        </CardContent>
      </Card>
    );
  }

  if (teamsWithSubmissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Team Submissions</CardTitle>
          <CardDescription>No teams assigned to you yet or no submissions to review.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Submissions for Review</CardTitle>
          <CardDescription>
            Review solutions submitted by teams you are mentoring
          </CardDescription>
        </CardHeader>
      </Card>

      {teamsWithSubmissions.map((team) => (
        <Card key={team._id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <CardDescription>
                  Problem: {typeof team.problem === "string" ? team.problem : team.problem?.title || "N/A"}
                </CardDescription>
              </div>
              <Badge variant="secondary">{team.solutions.length} submissions</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {team.solutions.map((solution) => (
                <div
                  key={solution._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">
                      Solution ID: {solution._id.substring(0, 12)}...
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Submitted:{" "}
                      {solution.createdAt
                        ? new Date(solution.createdAt).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div className="mt-2">
                      <Badge className={getStatusColor(solution.status)}>
                        {solution.status}
                      </Badge>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/editor/${team.problem._id || team.problem}/${team._id}`}>
                      Open Editor
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
