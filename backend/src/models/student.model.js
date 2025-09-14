import mongoose, { Schema } from "mongoose";
import { User } from "./Users.model.js";

const StudentSchema = new Schema({
  year: { type: Number },        // e.g., 2nd year
  branch: { type: String },      // e.g., "CSE"
  enrollmentId: { type: String } // optional unique student id
});

export const Student = User.discriminator("student", StudentSchema);
