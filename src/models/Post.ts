import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Content is required"],
    trim: true,
    maxlength: [5000, "Content cannot exceed 5000 characters"],
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null,
    validate: {
      validator: function (v: any) {
        return v === null || mongoose.Types.ObjectId.isValid(v);
      },
      message: "Invalid parent post ID",
    },
  },
  likes: {
    type: Number,
    default: 0,
    min: [0, "Likes cannot be negative"],
  },
  dislikes: {
    type: Number,
    default: 0,
    min: [0, "Dislikes cannot be negative"],
  },
  userId: {
    type: String,
    required: [true, "User ID is required"],
    trim: true,
  },
  likedBy: [
    {
      type: String,
      trim: true,
    },
  ],
  dislikedBy: [
    {
      type: String,
      trim: true,
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

// Add middleware to update the updatedAt timestamp
postSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Ensure arrays are initialized
postSchema.pre("save", function (next) {
  if (!Array.isArray(this.likedBy)) this.likedBy = [];
  if (!Array.isArray(this.dislikedBy)) this.dislikedBy = [];
  next();
});

// Add compound indexes for better query performance
postSchema.index({ parentId: 1, createdAt: -1 });
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ likes: -1 });
postSchema.index({ dislikes: -1 });

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
export default Post;
