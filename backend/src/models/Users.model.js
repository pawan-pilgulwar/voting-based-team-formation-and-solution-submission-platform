

import mongoose, { Schema } from "mongoose";

const SocialLinksSchema = new Schema({
  linkedin: { type: String },
  github: { type: String },
  website: { type: String }
}, { _id: false });

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student','mentor','orgAdmin','superAdmin'], default: 'student' },
  skills: [{ type: String, index: true }], // e.g. ["react","ml","iot"]
  bio: { type: String, maxlength: 1000 },
  institution: { type: String },
  avatarUrl: { type: String },
  social: SocialLinksSchema,
  isVerified: { type: Boolean, default: false },
  lastActiveAt: { type: Date },
  // quick lookups
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  assignedProblems: [{ type: Schema.Types.ObjectId, ref: "Problem" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

UserSchema.index({ email: 1 });
UserSchema.index({ skills: 1 });

// Instance helper
UserSchema.methods.shortProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    skills: this.skills,
    role: this.role
  };
};

export const User = mongoose.model("User", UserSchema);