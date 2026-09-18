import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  testName: { type: String, required: true, trim: true, maxlength: 120, index: true },
  topic: { type: String, required: true, trim: true, maxlength: 120, index: true },
  question: { type: String, required: true, trim: true, maxlength: 1000 },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (options) => Array.isArray(options) && options.length === 4 && options.every((option) => typeof option === "string" && option.trim()),
      message: "A question needs four answer options."
    }
  },
  answer: { type: Number, required: true, min: 0, max: 3 },
  testDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/, index: true },
  testTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
  createdBy: { type: String, required: true, lowercase: true, trim: true }
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model("Question", QuestionSchema);
