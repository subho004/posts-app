// src/app/api/posts/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // Build sort object
    const sortObject: { [key: string]: any } = {};
    sortObject[sortBy] = order === "desc" ? -1 : 1;

    // Only get root posts (posts without parentId)
    const posts = await Post.find({ parentId: null })
      .sort(sortObject)
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ parentId: null });

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
