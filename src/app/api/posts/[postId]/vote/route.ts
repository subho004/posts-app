import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import { NextResponse } from "next/server";

// src/app/api/posts/[postId]/vote/route.ts
export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    await dbConnect();
    const { voteType, userId } = await request.json();

    const post = await Post.findById(params.postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Remove any existing votes by this user
    post.likedBy = post.likedBy.filter((id: string) => id !== userId);
    post.dislikedBy = post.dislikedBy.filter((id: string) => id !== userId);

    // Update likes/dislikes count
    post.likes = post.likedBy.length;
    post.dislikes = post.dislikedBy.length;

    // Add new vote
    if (voteType === "like") {
      post.likedBy.push(userId);
      post.likes += 1;
    } else if (voteType === "dislike") {
      post.dislikedBy.push(userId);
      post.dislikes += 1;
    }

    await post.save();
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
