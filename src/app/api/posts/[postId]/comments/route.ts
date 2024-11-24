// src/app/api/posts/[postId]/comments/route.ts
import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";

// Use 'any' temporarily to fix type issue - will be properly typed in Next.js 15.1
type HandlerContext = any;

export async function GET(request: NextRequest, context: HandlerContext) {
  try {
    await dbConnect();

    const postId = context?.params?.postId;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const comments = await Post.find({ parentId: postId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
