import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SocialLinksSchema = new Schema({
  linkedin: { type: String },
  github: { type: String },
  website: { type: String }
}, { _id: false });

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
    enum: ['student','mentor','orgAdmin','superAdmin'], 
    default: 'student' 
  },
  skills: [{ 
    type: String
  }], // e.g. ["react","ml","iot"]
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

  // quick lookups
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  assignedProblems: [{ type: Schema.Types.ObjectId, ref: "Problem" }],
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
    username: this.username
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


export const User = mongoose.model("User", UserSchema);