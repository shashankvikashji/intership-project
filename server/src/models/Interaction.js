const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true, index: true },
    // VIEW, LIKE, UNLIKE, SAVE, UNSAVE, SKIP, SHARE, OPEN
    type: { type: String, required: true, index: true },
    duration: { type: Number, default: 0 }
  },
  { timestamps: true }
);

interactionSchema.index({ userId: 1, articleId: 1, type: 1 });
interactionSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Interaction || mongoose.model('Interaction', interactionSchema);
