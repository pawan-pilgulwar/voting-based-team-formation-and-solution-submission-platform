import axios from "axios";
import type { Problem, VoteCount, Team } from "./types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

export const fetchProblems = async (): Promise<Problem[]> => {
  const res = await api.get("/api/v1/problems/get-all");
  return res.data?.data || res.data || [];
};

export const fetchProblemById = async (id: string): Promise<Problem> => {
  const res = await api.get(`/api/v1/problems/${id}`);
  return res.data?.data || res.data;
};

export const castVote = async (problemId: string) => {
  const res = await api.post(`/api/v1/votes/${problemId}`);
  return res.data;
};

export const getVoteCount = async (problemId: string): Promise<VoteCount> => {
  const res = await api.get(`/api/v1/votes/${problemId}/count`);
  return res.data?.data || { problemId, count: res.data?.count ?? 0 };
};

// Teams
export const fetchTeams = async (): Promise<Team[]> => {
  const res = await api.get(`/api/v1/teams/all-teams`);
  return res.data?.data || res.data || [];
};

export const fetchTeamById = async (teamId: string): Promise<Team> => {
  const res = await api.get(`/api/v1/teams/${teamId}`);
  return res.data?.data || res.data;
};

// Organization
export const createProblem = async (payload: {
  title: string;
  description: string;
  tags?: string[];
  difficulty?: "easy" | "medium" | "hard";
}) => {
  const res = await api.post(`/api/v1/problems/create-problem`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data?.data || res.data;
};

// Code files
export const getTeamCodeFiles = async (teamId: string) => {
  const res = await api.get(`/api/v1/code/team/${teamId}`);
  return res.data?.data || res.data;
};

export const saveCode = async (payload: { teamId: string; problemId: string; path: string; content: string }) => {
  const res = await api.post(`/api/v1/code/save`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data?.data || res.data;
};

// Solutions
export const submitSolution = async (payload: { teamId: string; problemId: string; files?: Array<{ path: string; content: string }>; code?: string; filename?: string; language?: string; }) => {
  const res = await api.post(`/api/v1/solution/submit`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data?.data || res.data;
};

export const getSolutionsByProblem = async (problemId: string) => {
  const res = await api.get(`/api/v1/solution/problem/${problemId}`);
  return res.data?.data || res.data || [];
};

export const reviewSolution = async (payload: { solutionId: string; status: "under-review" | "approved" | "rejected"; score?: number; remarks?: string; }) => {
  const res = await api.post(`/api/v1/solution/review`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data?.data || res.data;
};

export const getSolutionsByTeam = async (teamId: string) => {
  const res = await api.get(`/api/v1/solution/team/${teamId}`);
  return res.data?.data || res.data || [];
};

export const addSolutionFeedback = async (solutionId: string, comment: string) => {
  const res = await api.post(`/api/v1/solution/${solutionId}/feedback`, { comment }, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data?.data || res.data;
};

// Admin lists
export const adminListUsers = async () => {
  const res = await api.get(`/api/v1/admin/users`);
  return res.data?.data || res.data || [];
};

export const adminListProblems = async () => {
  const res = await api.get(`/api/v1/admin/problems`);
  return res.data?.data || res.data || [];
};

export const adminListTeams = async () => {
  const res = await api.get(`/api/v1/admin/teams`);
  return res.data?.data || res.data || [];
};

export const adminListReports = async () => {
  const res = await api.get(`/api/v1/admin/reports`);
  return res.data?.data || res.data || [];
};
