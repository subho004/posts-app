// src/components/posts/Comments.tsx
import { useState, useEffect } from "react";
import PostCard from "./PostCard";

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  userId: string;
  likedBy: string[];
  dislikedBy: string[];
}

interface CommentsProps {
  postId: string;
  currentUserId: string;
  onReplyAdded: () => void;
  level?: number;
}

const Comments = ({
  postId,
  currentUserId,
  onReplyAdded,
  level = 1,
}: CommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/posts/${postId}/comments?sortBy=${sortBy}&order=${sortOrder}`
      );
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, sortBy, sortOrder]);

  const handleReply = () => {
    fetchComments();
    onReplyAdded();
  };

  const handleCommentDelete = () => {
    fetchComments();
    onReplyAdded();
  };

  if (loading) {
    return <div className="ml-4 mt-2">Loading comments...</div>;
  }

  return (
    <div className="mt-2">
      {comments.length > 0 && (
        <div className="mb-4 ml-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mr-2 p-1 text-sm border rounded"
          >
            <option value="createdAt">Date</option>
            <option value="likes">Likes</option>
            <option value="dislikes">Dislikes</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-1 text-sm border rounded"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      )}

      {comments.map((comment) => (
        <PostCard
          key={comment._id}
          post={comment}
          currentUserId={currentUserId}
          onReply={handleReply}
          onDelete={handleCommentDelete}
          isComment={true}
          level={level}
        />
      ))}

      {comments.length === 0 && (
        <div className="ml-4 mt-2 text-gray-500">No comments yet</div>
      )}
    </div>
  );
};

export default Comments;
