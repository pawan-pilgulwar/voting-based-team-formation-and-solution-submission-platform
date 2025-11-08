

import mongoose, { Schema } from "mongoose";
import { Vote } from "./votes.model.js";

const ProblemSchema = new Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true, 
    minlength: 20 
  },
  tags: [{ 
    type: String, 
    index: true 
  }], // e.g. ["AI","Web","Healthcare"]
  difficulty: { 
    type: String, 
    enum: ["easy", "medium", "hard"], 
    default: "medium" 
  },
  postedBy: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  deadline: { 
    type: Date 
  },
  votes: [{ 
    type: Schema.Types.ObjectId, 
    ref: "Vote",
  }],
  selectedTeams: [{ 
    type: Schema.Types.ObjectId, 
    ref: "Team" 
  }],
  status: { 
    type: String, 
    enum: ["open","in-progress","completed","archived"], 
    default: "open" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

ProblemSchema.index({ title: "text", description: "text" });
ProblemSchema.index({ tags: 1 });
ProblemSchema.index({ postedBy: 1 }, { unique: true });

// Custom validator — limit max number of votes
ProblemSchema.path("votes").validate(function (value) {
  return value.length <= 6; // e.g., limit to 6 votes
}, "Maximum of 6 votes allowed.");

ProblemSchema.methods.brief = function () {
  return {
    id: this._id,
    title: this.title,
    tags: this.tags,
    status: this.status,
    deadline: this.deadline
  };
};

ProblemSchema.methods.getVoteCount = function () {
  return this.votes.length ? this.votes.length : 0;
};

ProblemSchema.methods.hasVoted = async function (userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) return false;

  // Check in Vote collection if this user has already voted for this problem
  const existingVote = await Vote.findOne({
    problem: this._id,
    votedBy: userId,
  });

  return !!existingVote;
};

export const Problem = mongoose.model("Problem", ProblemSchema);