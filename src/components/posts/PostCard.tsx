// src/components/posts/PostCard.tsx
import { useEffect, useState } from "react";
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
    likedBy?: string[];
    dislikedBy?: string[];
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
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (isVoting) return;

    try {
      setIsVoting(true);
      setVoteError(null);

      const response = await fetch(`/api/posts/${post._id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voteType,
          userId: currentUserId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to vote");
      }

      if (onReply) {
        await onReply(); // Refresh the posts to show updated vote counts
      }
    } catch (error) {
      console.error("Error voting:", error);
      setVoteError(error instanceof Error ? error.message : "Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/posts/${post._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editContent.trim(),
          userId: currentUserId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to edit post");
      }

      setIsEditing(false);
      if (onReply) await onReply(); // Refresh the post
    } catch (error) {
      console.error("Error editing post:", error);
      alert(error instanceof Error ? error.message : "Failed to edit post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/posts/${post._id}?userId=${currentUserId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete post");
      }

      if (onDelete) await onDelete();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error instanceof Error ? error.message : "Failed to delete post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          parentId: post._id,
          userId: currentUserId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post reply");
      }

      setReplyContent("");
      setShowReplyForm(false);
      await fetchCommentCount();
      if (onReply) await onReply();
    } catch (error) {
      console.error("Error posting reply:", error);
      alert(error instanceof Error ? error.message : "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate margin based on nesting level
  const marginClass = level > 0 ? `ml-${Math.min(level * 4, 16)}` : "";

  // Determine if we should show nested comments (limit to 5 levels deep)
  const canShowNestedComments = level < 5;

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-4 ${marginClass}`}>
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isSubmitting}
          />
          <div className="mt-2 flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={!editContent.trim() || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 mb-2 whitespace-pre-wrap">{post.content}</p>
      )}

      <div className="flex items-center text-sm text-gray-500">
        <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>

        <div className="ml-4 flex items-center space-x-2">
          <button
            onClick={() => handleVote("like")}
            disabled={isVoting || isSubmitting}
            className={`flex items-center transition-colors ${
              post.likedBy?.includes(currentUserId)
                ? "text-blue-500"
                : "text-gray-500 hover:text-blue-500"
            } ${
              isVoting || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ThumbsUp size={16} className="mr-1" />
            {post.likes || 0}
          </button>

          <button
            onClick={() => handleVote("dislike")}
            disabled={isVoting || isSubmitting}
            className={`flex items-center transition-colors ${
              post.dislikedBy?.includes(currentUserId)
                ? "text-red-500"
                : "text-gray-500 hover:text-red-500"
            } ${
              isVoting || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ThumbsDown size={16} className="mr-1" />
            {post.dislikes || 0}
          </button>
        </div>

        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          disabled={isSubmitting}
          className="ml-4 text-blue-500 hover:text-blue-600 flex items-center disabled:opacity-50"
        >
          <MessageCircle size={16} className="mr-1" />
          Reply
        </button>

        {isOwner && (
          <div className="ml-4 flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              disabled={isSubmitting}
              className="text-gray-500 hover:text-blue-500 disabled:opacity-50"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="text-gray-500 hover:text-red-500 disabled:opacity-50"
            >
              <Trash size={16} />
            </button>
          </div>
        )}

        {commentCount > 0 && canShowNestedComments && (
          <button
            onClick={() => setShowComments(!showComments)}
            disabled={isSubmitting}
            className="ml-4 text-blue-500 hover:text-blue-600 flex items-center disabled:opacity-50"
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

      {voteError && (
        <div className="mt-2 text-sm text-red-500">{voteError}</div>
      )}

      {showReplyForm && (
        <form onSubmit={handleSubmitReply} className="mt-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Write your reply..."
            disabled={isSubmitting}
          />
          <div className="mt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!replyContent.trim() || isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
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
