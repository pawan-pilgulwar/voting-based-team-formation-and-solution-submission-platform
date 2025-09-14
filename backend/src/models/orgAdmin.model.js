import mongoose, { Schema } from "mongoose";
import { User } from "./Users.model.js";

const OrgAdminSchema = new Schema({
  organizationName: { type: String, required: true },
  designation: { type: String }, // e.g., "Coordinator"
  managedChallenges: [{ type: Schema.Types.ObjectId, ref: "Problem" }]
});

export const OrgAdmin = User.discriminator("orgAdmin", OrgAdminSchema);
