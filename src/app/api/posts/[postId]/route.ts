import dbConnect from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
type HandlerContext = any;

// src/app/api/posts/[postId]/route.ts
export async function PUT(request: NextRequest, context: HandlerContext) {
  try {
    await dbConnect();

    const postId = context?.params?.postId;
    const { content, userId } = await request.json();

    // Rest of your PUT logic...
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: HandlerContext) {
  try {
    await dbConnect();

    const postId = context?.params?.postId;
    const userId = new URL(request.url).searchParams.get("userId");

    // Rest of your DELETE logic...
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
