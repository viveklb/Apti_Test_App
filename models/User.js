import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({ score: Number, total: Number, topic: String, questionCount: Number, scheduledFor: Date, completedAt: { type: Date, default: Date.now } }, { _id: false });
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  sessionToken: String,
  sessionProvider: String,
  resetTokenHash: String,
  resetTokenExpires: Date,
  results: [ResultSchema]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
