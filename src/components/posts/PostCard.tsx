// src/components/posts/PostCard.tsx
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash,
} from "lucide-react";
import Comments from "./Comments";

interface PostProps {
  post: {
    _id: string;
    content: string;
    createdAt: string;
    userId: string;
    likes: number;
    dislikes: number;
    likedBy?: string[]; // Make optional
    dislikedBy?: string[]; // Make optional
  };
  currentUserId: string;
  onReply?: () => void;
  onDelete?: () => void;
  isComment?: boolean;
  level?: number;
}

const PostCard = ({
  post,
  currentUserId,
  onReply,
  onDelete,
  isComment = false,
  level = 0,
}: PostProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [commentCount, setCommentCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const isOwner = currentUserId === post.userId;

  const fetchCommentCount = async () => {
    try {
      const response = await fetch(`/api/posts/${post._id}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comment count");
      const data = await response.json();
      setCommentCount(data.length);
    } catch (error) {
      console.error("Error fetching comment count:", error);
    }
  };

  useEffect(() => {
    fetchCommentCount();
  }, [post._id]);

  const handleVote = async (voteType: "like" | "dislike") => {
    try {
      const response = await fetch(`/api/posts/${post._id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType, userId: currentUserId }),
      });
      if (!response.ok) throw new Error("Failed to vote");
      if (onReply) onReply(); // Refresh the post
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent, userId: currentUserId }),
      });
      if (!response.ok) throw new Error("Failed to edit post");
      setIsEditing(false);
      if (onReply) onReply(); // Refresh the post
    } catch (error) {
      console.error("Error editing post:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const response = await fetch(
        `/api/posts/${post._id}?userId=${currentUserId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete post");
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyContent,
          parentId: post._id,
          userId: currentUserId,
        }),
      });

      if (!response.ok) throw new Error("Failed to post reply");

      setReplyContent("");
      setShowReplyForm(false);
      fetchCommentCount();
      if (onReply) onReply();
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  // Calculate margin based on nesting level
  const marginClass = level > 0 ? `ml-${Math.min(level * 8, 32)}` : "";

  // Determine if we should show nested comments (limit to 5 levels deep)
  const canShowNestedComments = level < 5;

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-4 ${marginClass}`}>
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border rounded-lg resize-none"
            rows={3}
          />
          <div className="mt-2 flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={!editContent.trim()}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 mb-2">{post.content}</p>
      )}

      <div className="flex items-center text-sm text-gray-500">
        <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>

        <div className="ml-4 flex items-center space-x-2">
          <button
            onClick={() => handleVote("like")}
            className={`flex items-center ${
              post.likedBy?.includes(currentUserId) ? "text-blue-500" : ""
            }`}
          >
            <ThumbsUp size={16} className="mr-1" />
            {post.likes || 0}
          </button>
          <button
            onClick={() => handleVote("dislike")}
            className={`flex items-center ${
              post.dislikedBy?.includes(currentUserId) ? "text-red-500" : ""
            }`}
          >
            <ThumbsDown size={16} className="mr-1" />
            {post.dislikes || 0}
          </button>
        </div>

        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="ml-4 text-blue-500 hover:text-blue-600 flex items-center"
        >
          <MessageCircle size={16} className="mr-1" />
          Reply
        </button>

        {isOwner && (
          <div className="ml-4 flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-blue-500"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-500 hover:text-red-500"
            >
              <Trash size={16} />
            </button>
          </div>
        )}

        {commentCount > 0 && canShowNestedComments && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="ml-4 text-blue-500 hover:text-blue-600 flex items-center"
          >
            {showComments ? (
              <ChevronUp size={16} className="mr-1" />
            ) : (
              <ChevronDown size={16} className="mr-1" />
            )}
            {showComments ? "Hide" : "Show"} Comments ({commentCount})
          </button>
        )}
      </div>

      {showReplyForm && (
        <form onSubmit={handleSubmitReply} className="mt-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full p-2 border rounded-lg resize-none"
            rows={3}
            placeholder="Write your reply..."
          />
          <div className="mt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={!replyContent.trim()}
            >
              Submit
            </button>
          </div>
        </form>
      )}

      {canShowNestedComments && showComments && (
        <Comments
          postId={post._id}
          currentUserId={currentUserId}
          onReplyAdded={() => {
            fetchCommentCount();
            if (onReply) onReply();
          }}
          level={level + 1}
        />
      )}
    </div>
  );
};

export default PostCard;
