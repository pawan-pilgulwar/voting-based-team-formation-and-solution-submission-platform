import mongoose, { Schema } from "mongoose";
import { User } from "./Users.model.js";

const SuperAdminSchema = new Schema({
  permissions: [{ type: String }], // e.g., ["manage_users", "delete_problems"]
  systemLogs: [{ type: String }]   // track admin actions if needed
});

export const SuperAdmin = User.discriminator("superAdmin", SuperAdminSchema);
