// api/ai.ts
import axios from "axios";

const API_BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1` || "http://localhost:5000/api/v1";

// Get recommended problems for a user
export const getRecommendedProblems = async (userId: string) => {
  const response = await axios.get(`${API_BASE}/ai/recommendations/user/${userId}`, {
    withCredentials: true, // include cookies if JWT is stored in cookies
  });
  return response.data.data.problems; // returns array [{ problem, score }]
};

// Get recommended teams for a mentor
export const getRecommendedTeams = async (mentorId: string) => {
  const response = await axios.get(`${API_BASE}/ai/recommendations/mentor/${mentorId}`, {
    withCredentials: true,
  });
  return response.data.data.teams; // returns array [{ team, score }]
};
