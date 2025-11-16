export type UserRole = "student" | "mentor" | "organization" | "admin";

export type TeamRole = "leader" | "member";

export interface Problem {
  _id: string;
  title: string;
  description: string;
  tags?: string[];
  difficulty?: "easy" | "medium" | "hard";
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  votes?: string[];
  hasVoted?: boolean;
  voteCount?: number;
  status?: "open" | "in-progress" | "completed" | "archived";
  deadline?: string;
  postedBy?: {
    _id: string;
    username?: string;
    email?: string;
    name?: string;
    organizationName?: string;
  };
  selectedTeams?: Team[];
}

export interface VoteCount {
  problemId: string;
  count: number;
}

export interface TeamMember {
  user: User;
  role: TeamRole;
}

export interface Team {
  _id: string;
  name: string;
  leader: TeamMember | null;
  members: TeamMember[];
  problem: {
    _id: string;
    title: string;
    postedBy: string;
  };
  createdAt?: string;
}

export interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  role: UserRole;
  bio?: string;
  institution?: string;
  isVerified?: boolean;
  social?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  // student fields
  gender?: "male" | "female" | "other";
  year?: number;
  branch?: string;
  skills?: string[];
  preferredTeamRoles?: string[];
  // mentor fields
  expertise?: string[];
  availability?: string;
  // orgAdmin fields
  organizationName?: string;
  designation?: string;
}
