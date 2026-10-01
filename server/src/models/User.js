const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },
    interests: { type: [String], default: [] },
    preferredTopics: { type: [String], default: [] },
    language: { type: String, default: 'en' }
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
