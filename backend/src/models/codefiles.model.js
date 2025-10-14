import mongoose, { Schema } from "mongoose";

const CodeFileSchema = new Schema({
  team: { 
    type: Schema.Types.ObjectId, 
    ref: "Team", 
    index: true, 
    required: true 
},
  author: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
},
  filename: { 
    type: String, 
    required: true 
},
  language: { 
    type: String, 
    required: true 
},
  content: { 
    type: String, 
    default: "" 
},
  updatedAt: { 
    type: Date, 
    default: Date.now 
},
  createdAt: { 
    type: Date, 
    default: Date.now 
}
}, { timestamps: true });

CodeFileSchema.index({ team: 1, filename: 1 }, { unique: false });

export const CodeFile = mongoose.model("CodeFile", CodeFileSchema);


