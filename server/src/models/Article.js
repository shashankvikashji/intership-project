const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    externalId: { type: String, unique: true, sparse: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    content: { type: String, default: '' },
    image: { type: String, default: '' },
    source: { type: String, default: 'Lumen Wire' },
    url: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },
    author: { type: String, default: '' },
    publishedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

articleSchema.index({ title: 'text', description: 'text', tags: 'text', category: 'text' });

module.exports = mongoose.models.Article || mongoose.model('Article', articleSchema);
