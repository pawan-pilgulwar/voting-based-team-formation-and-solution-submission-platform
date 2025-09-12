import mongoose, { Schema } from "mongoose";

const VoteSchema = new Schema({
  problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
  votedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

VoteSchema.index({ problem: 1, votedBy: 1 }, { unique: true });

VoteSchema.methods.brief = function () {
  return {
    id: this._id,
    problem: this.problem,
    votedBy: this.votedBy
  };
};

export const Vote = mongoose.model("Vote", VoteSchema);
