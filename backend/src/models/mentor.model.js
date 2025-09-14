import mongoose, { Schema } from "mongoose";
import { User } from "./Users.model.js";

const MentorSchema = new Schema({
  expertise: [{ type: String }],  // e.g., ["AI", "Web Dev"]
  availability: { type: String }, // e.g., "Weekends"
  mentees: [{ type: Schema.Types.ObjectId, ref: "User" }]
});

export const Mentor = User.discriminator("mentor", MentorSchema);
