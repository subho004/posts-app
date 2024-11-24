// src/app/api/posts/[postId]/vote/route.ts
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Use 'any' type to bypass Next.js 15 type issue
type HandlerContext = any;

export async function POST(request: Request, context: HandlerContext) {
  try {
    await dbConnect();

    const postId = context?.params?.postId;

    // Validate postId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Invalid post ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { voteType, userId } = body;

    // Validate request body
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (!voteType || !["like", "dislike"].includes(voteType)) {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Initialize arrays if they don't exist
    post.likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
    post.dislikedBy = Array.isArray(post.dislikedBy) ? post.dislikedBy : [];

    const hasLiked = post.likedBy.includes(userId);
    const hasDisliked = post.dislikedBy.includes(userId);

    // Handle voting logic
    if (voteType === "like") {
      if (hasLiked) {
        // Remove like if already liked
        post.likedBy = post.likedBy.filter((id: string) => id !== userId);
      } else {
        // Add like and remove dislike if exists
        post.likedBy.push(userId);
        post.dislikedBy = post.dislikedBy.filter((id: string) => id !== userId);
      }
    } else {
      if (hasDisliked) {
        // Remove dislike if already disliked
        post.dislikedBy = post.dislikedBy.filter((id: string) => id !== userId);
      } else {
        // Add dislike and remove like if exists
        post.dislikedBy.push(userId);
        post.likedBy = post.likedBy.filter((id: string) => id !== userId);
      }
    }

    // Update counts
    post.likes = post.likedBy.length;
    post.dislikes = post.dislikedBy.length;

    await post.save();

    return NextResponse.json(post);
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
