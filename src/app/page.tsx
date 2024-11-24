// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/posts/PostCard";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Post {
  _id: string;
  content: string;
  createdAt: string;
  userId: string;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // In a real application, this would come from your authentication system
  const currentUserId = "user123"; // Placeholder user ID

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/posts?page=${page}&sortBy=${sortBy}&order=${sortOrder}`
      );
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, sortBy, sortOrder]);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newPostContent,
          userId: currentUserId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      setNewPostContent("");
      setPage(1); // Reset to first page
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmitPost} className="mb-8">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          className="w-full p-4 border rounded-lg resize-none"
          rows={4}
          placeholder="What's on your mind?"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            disabled={!newPostContent.trim() || loading}
          >
            Post
          </button>
        </div>
      </form>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded"
          >
            <option value="createdAt">Date</option>
            <option value="likes">Most Liked</option>
            <option value="dislikes">Most Controversial</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading posts...</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={currentUserId}
              onReply={fetchPosts}
              onDelete={fetchPosts}
              level={0}
            />
          ))}

          {posts.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No posts yet. Be the first to post!
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 flex items-center"
          >
            <ChevronUp className="mr-1" size={16} />
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 flex items-center"
          >
            Next
            <ChevronDown className="ml-1" size={16} />
          </button>
        </div>
      )}
    </main>
  );
}
