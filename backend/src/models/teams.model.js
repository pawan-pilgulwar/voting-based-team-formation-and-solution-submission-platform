

import mongoose, { Schema } from "mongoose";

const MemberSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  },
  role: { 
    type: String, 
    enum: ["leader", "member"], 
    default: "member" 
  }
}, { _id: false });

const ProgressSchema = new Schema({
  currentPhase: { 
    type: String, 
    enum: ["idea","development","submission","review"], 
    default: "idea" 
  },
  percentage: { type: Number, default: 0 }
}, { _id: false });

const TeamSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  problem: { 
    type: Schema.Types.ObjectId, 
    ref: "Problem", 
    required: true 
  },
  members: [MemberSchema],
  mentor: { 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  },
  status: { 
    type: String, 
    enum: ["active","submitted","reviewed","archived"], 
    default: "active" 
  },
  chatRoomId: { 
    type: String 
  },
  progress: { 
    type: ProgressSchema, 
    default: () => ({}) 
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

TeamSchema.index({ problem: 1 });
TeamSchema.index({ mentor: 1 });

TeamSchema.methods.summary = function () {
  return {
    id: this._id,
    name: this.name,
    problem: this.problem,
    memberCount: this.members.length,
    mentor: this.mentor,
    progress: this.progress
  };
};

export const Team = mongoose.model("Team", TeamSchema);