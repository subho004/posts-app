// src/app/api/posts/[postId]/comments/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    await dbConnect();

    const comments = await Post.find({ parentId: params.postId }).sort({
      createdAt: -1,
    });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
