import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // Allowed sort fields validation
    const allowedSortFields = ["createdAt", "likes", "dislikes"];
    if (!allowedSortFields.includes(sortBy)) {
      return NextResponse.json(
        {
          error:
            "Invalid sort field. Allowed fields: createdAt, likes, dislikes.",
        },
        { status: 400 }
      );
    }

    // Build sort object
    const sortObject: Record<string, 1 | -1> = {
      [sortBy]: order === "desc" ? -1 : 1,
    };

    // Fetch posts and total count
    const [posts, total] = await Promise.all([
      Post.find({ parentId: null })
        .sort(sortObject)
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments({ parentId: null }),
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { content, userId, parentId } = body;

    // Validate required fields
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required and must be a string." },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "UserId is required and must be a string." },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length > 5000) {
      return NextResponse.json(
        { error: "Content cannot exceed 5000 characters." },
        { status: 400 }
      );
    }

    // Create new post
    const newPost = new Post({
      content: content.trim(),
      userId,
      parentId: parentId || null,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
    });

    // Save the post
    const savedPost = await newPost.save();

    return NextResponse.json(savedPost, { status: 201 });
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Failed to create post." },
      { status: 500 }
    );
  }
}
