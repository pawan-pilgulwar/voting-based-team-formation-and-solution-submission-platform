import mongoose, { Schema } from "mongoose";

const ChatMessageSchema = new Schema({
  team: { 
    type: Schema.Types.ObjectId, 
    ref: "Team", index: true, 
    required: true 
},
  sender: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
},
  text: { 
    type: String, 
    default: "" 
},
  attachments: [{ type: String }],
  role: { 
    type: String, 
    enum: ["student", "mentor", "organization", "admin"], 
    required: true 
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

ChatMessageSchema.index({ team: 1, createdAt: -1 });

export const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);


