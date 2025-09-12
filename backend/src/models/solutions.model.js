import mongoose, { Schema } from "mongoose";

const FeedbackSchema = new Schema({
  mentor: { type: Schema.Types.ObjectId, ref: "User" },
  comment: { type: String, maxlength: 300 },
  date: { type: Date, default: Date.now }
}, { _id: false });

const EvaluationSchema = new Schema({
  score: { type: Number, min: 0, max: 100 },
  remarks: { type: String, maxlength: 300 }
}, { _id: false });

const SolutionSchema = new Schema({
  team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
  submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, minlength: 20 },
  attachments: [{ type: String }], // file URLs
  feedback: [FeedbackSchema],
  evaluation: EvaluationSchema,
  status: { type: String, enum: ["submitted","under-review","approved","rejected"], default: "submitted" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

SolutionSchema.index({ problem: 1 });
SolutionSchema.index({ team: 1 });

SolutionSchema.methods.overview = function () {
  return {
    id: this._id,
    team: this.team,
    problem: this.problem,
    status: this.status,
    evaluation: this.evaluation
  };
};

export const Solution = mongoose.model("Solution", SolutionSchema);
