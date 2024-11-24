// src/models/Post.ts
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null,
  },
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  // Add userId for tracking post ownership
  userId: {
    type: String,
    required: true,
  },
  // Add arrays to track who liked/disliked
  likedBy: [
    {
      type: String,
    },
  ],
  dislikedBy: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the existing indexes
postSchema.index({ parentId: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ userId: 1 });

export default mongoose.models.Post || mongoose.model("Post", postSchema);
