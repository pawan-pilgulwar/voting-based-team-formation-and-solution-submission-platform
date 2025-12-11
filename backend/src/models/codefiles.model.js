import mongoose, { Schema } from "mongoose";

const CodeFileSchema = new Schema(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      index: true,
      required: true,
    },
    solution: {
      type: Schema.Types.ObjectId,
      ref: "Solution",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,    // "App.js" or "src"
    },
    path: { 
      type: String,
      default: "",
      trim: true,
    },
    type: { 
      type: String, 
      enum: ["file", "folder"], 
      default: "file" 
    },
    language: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

CodeFileSchema.index({ team: 1, path: 1, filename: 1 }, { unique: true });

export const CodeFile = mongoose.model("CodeFile", CodeFileSchema);