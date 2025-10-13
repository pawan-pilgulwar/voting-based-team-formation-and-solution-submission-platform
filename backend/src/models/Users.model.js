import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SocialLinksSchema = new Schema({
  linkedin: { type: String },
  github: { type: String },
  website: { type: String }
}, { _id: false });


// Base User Schema

const UserSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true
  },
  username: { 
    type: String, 
    required: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true,
    enum: ['student','mentor','organization','admin'], 
    default: 'student' 
  },
  bio: { 
    type: String, 
    maxlength: 1000 
  },
  institution: { 
    type: String 
  },
  avatar: { 
    type: String,
  },
  coverImage: { 
    type: String 
  },
  social: SocialLinksSchema,
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  lastActiveAt: { 
    type: Date 
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  refreshToken: { type: String }, // for JWT refresh token
}, { 
  timestamps: true,
  discriminatorKey: 'role' 
});

UserSchema.index({ email: 1, skills: 1 });


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


UserSchema.pre("save", async function (next) {

  if (!this.isModified("password")) return next()

  this.password = await bcrypt.hash(this.password, 10);

  next();
})


UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
}

UserSchema.methods.generateAccessToken = function() {
  // Short-lived access token
  return jwt.sign({
    _id: this._id,
    username: this.username,
    email: this.email
  }, 
  process.env.ACCESS_TOKEN_SECRET, 
  { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
);
}

UserSchema.methods.generateRefereshToken = function() {
  // Long-lived refresh token
  return jwt.sign({
    _id: this._id,
  }, 
  process.env.REFERESH_TOKEN_SECRET, 
  { expiresIn: process.env.REFERESH_TOKEN_EXPIRY } 
);
}




// Student, Mentor, OrgAdmin, SuperAdmin will extend tiis
const StudentSchema = new Schema({
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  year: { type: Number },        // e.g., 2nd year
  branch: { type: String },      // e.g., "CSE"
  enrollmentId: { type: String }, // optional unique student id
  skills: [{ type: String }], // e.g. ["react","ml","iot"]
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  preferredTeamRoles: [{ type: String }],
});


const OrgAdminSchema = new Schema({
  organizationName: { type: String, required: true },
  designation: { type: String }, // e.g., "Coordinator"
  managedChallenges: [{ type: Schema.Types.ObjectId, ref: "Problem" }]
});


const MentorSchema = new Schema({
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  expertise: [{ type: String }],  // e.g., ["AI", "Web Dev"]
  availability: { type: String }, // e.g., "Weekends"
  mentees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  skills: [{ type: String }], // e.g. ["react","ml","iot"]
});


const SuperAdminSchema = new Schema({
  permissions: [{ type: String }], // e.g., ["manage_users", "delete_problems"]
  systemLogs: [{ type: String }]   // track admin actions if needed
});



// exporting all users
export const User = mongoose.model("User", UserSchema);
export const Student = User.discriminator("student", StudentSchema);
export const OrgAdmin = User.discriminator("organization", OrgAdminSchema);
export const Mentor = User.discriminator("mentor", MentorSchema);
export const SuperAdmin = User.discriminator("admin", SuperAdminSchema);