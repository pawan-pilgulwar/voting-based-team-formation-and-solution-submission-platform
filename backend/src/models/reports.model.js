 import mongoose, { Schema } from "mongoose";

 const ReportSchema = new Schema(
   {
     reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
     targetType: {
       type: String,
       enum: ["Problem", "Team", "Solution", "User"],
       required: true,
     },
     targetId: { type: Schema.Types.ObjectId, required: true },
     reason: {
       type: String,
       enum: [
         "spam",
         "abuse",
         "inappropriate",
         "plagiarism",
         "other",
       ],
       required: true,
     },
     description: { type: String, maxlength: 500 },
     status: { type: String, enum: ["open", "reviewing", "resolved"], default: "open" },
     resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
     resolvedAt: { type: Date },
   },
   { timestamps: true }
 );

 ReportSchema.index({ targetType: 1, targetId: 1 });
 ReportSchema.index({ reportedBy: 1 });

 export const Report = mongoose.model("Report", ReportSchema);
