"use client";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Send, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/authContext";
import { addLike, postComment } from "@/lib/apiCalls";
import { api } from "@/lib/axios";
import Image from "next/image";
import { logger } from "@/lib/logger";

// TypeScript Interfaces
export interface Comment {
  id?: string;
  comment?: string;
  userId?: string | undefined;
  postId?: string | undefined;
  avtarUrl?: string;
  user?: User;
}

interface User {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string;
}

interface Likes {
  id: string;
  likerId: string;
}

interface Post {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  userId: string;
  user?: User;
  likes: Likes[] | [];
  comments?: Comment[] | [];
  createdAt: Date;
}

// Custom Card Component
const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = "", style }) => {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

// Custom CardContent Component
const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return <div className={className}>{children}</div>;
};

// Custom Avatar Component
const Avatar: React.FC<{
  src?: string;
  alt?: string;
  fallback: string;
  className?: string;
}> = ({ src, alt, fallback, className = "" }) => {
  const [imageError, setImageError] = useState<boolean>(false);

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center ${className}`}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt || "Avatar"}
          width={44}
          height={44}
          quality={100}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
          {fallback}
        </div>
      )}
    </div>
  );
};

// Custom Input Component
const Input: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}> = ({ value, onChange, placeholder, className = "", onKeyDown }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
      onKeyDown={onKeyDown}
    />
  );
};

// Custom Button Component
const Button: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}> = ({ children, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
    >
      {children}
    </button>
  );
};

// Utility function for className merging
const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(" ");
};

const PostsPage: React.FC = () => {
  // State Management
  const [openPostID, setOpenPostId] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const [userComment, setUserComment] = useState<Comment>({});
  const queryClient = useQueryClient();
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  // React Query - Fetch Posts
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["allPosts"],
    queryFn: async () => {
      const res = await api.get("/allposts");
      return res.data.posts;
    },
  });

  // React Query - Create Comment Mutation
  const createComment = useMutation({
    mutationFn: postComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
    },
    onError: (err: Error) => {
      logger.error("mutation Failed", err);
    },
  });

  // React Query - Like Mutation
  const sendLike = useMutation({
    mutationFn: addLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
    },
    onError: (err: Error) => {
      logger.error("mutation Failed", err);
    },
  });

  // Format Date Function
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Send Comment Function
  const sendComment = (): void => {
    if (
      userComment?.comment !== undefined &&
      userComment?.userId != null &&
      userComment?.postId != null
    ) {
      if (userComment.comment.trim().length > 0) {
        createComment.mutate(userComment);
        setUserComment({ ...userComment, comment: "" });
      }
    }
  };

  // Handle Like Function
  const handleLike = (id: string | undefined): void => {
    if (id && user) {
      if (!likedPosts.includes(id)) {
        setLikedPosts((prev) => [...prev, id]);
      }
      sendLike.mutate({ id: id, senderId: user.userId });
    }
  };

  // Initialize user comment on mount
  useEffect(() => {
    setUserComment({
      userId: user?.userId,
    });
  }, [isLoading, authLoading, user?.userId, posts]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-gray-600 font-medium">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto bg-gray-50">
      <main className="max-w-2xl overflow-y-auto mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Stories
            </span>
          </h1>
          <p className="text-gray-600">
            See what your friends are sharing today
          </p>
        </div>

        {/* Posts Feed */}
        {posts?.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 text-lg">No posts yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Be the first to share something!
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts?.map((post: Post, index: number) => (
              <Card
                key={post.id}
                className="overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Post Image */}
                {post.imageUrl && (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      width={1000}
                      height={600}
                      quality={100}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                <CardContent className="p-5">
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar
                      src={post?.user?.avatarUrl || "/defaultAvatar.png"}
                      alt={post.user?.name || "User"}
                      fallback={post.user?.name?.charAt(0) || "U"}
                      className="h-11 w-11 ring-2 ring-blue-200"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {post.user?.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {post.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300",
                        post.likes.some((like) => like.likerId === user?.userId)
                          ? "bg-red-50 text-red-600"
                          : "hover:bg-gray-100 text-gray-600 hover:text-gray-900",
                      )}
                    >
                      <Heart
                        className={cn(
                          "h-5 w-5 transition-transform duration-300",
                          post.likes.some(
                            (like) => like.likerId === user?.userId,
                          ) && "fill-current scale-110",
                        )}
                      />
                      <span className="text-sm font-medium">
                        {post.likes?.length || 0}
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        setOpenPostId((prev) =>
                          prev === post.id ? null : post.id,
                        )
                      }
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300",
                        openPostID === post.id
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-100 text-gray-600 hover:text-gray-900",
                      )}
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        {post.comments?.length || 0}
                      </span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {openPostID === post.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 animate-slide-down">
                      {/* Comment Input */}
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar
                          src={user?.avatarUrl || "/defaultAvatar.png"}
                          alt={user?.name || "You"}
                          fallback={user?.name?.charAt(0) || "U"}
                          className="h-9 w-9"
                        />
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={userComment?.comment || ""}
                            onChange={(e) =>
                              setUserComment((prev) => ({
                                ...prev,
                                comment: e.target.value,
                                postId: post.id,
                              }))
                            }
                            placeholder="Write a comment..."
                            className="flex-1 bg-gray-50"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") sendComment();
                            }}
                          />
                          <button
                            onClick={sendComment}
                            className="shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {post.comments?.length === 0 ? (
                          <p className="text-center text-gray-500 text-sm py-4">
                            No comments yet. Be the first!
                          </p>
                        ) : (
                          post.comments?.map((comment) => (
                            <div
                              key={comment.id}
                              className="flex gap-3 p-3 rounded-xl bg-gray-50"
                            >
                              <Avatar
                                src={
                                  comment.user?.avatarUrl ||
                                  "/defaultAvatar.png"
                                }
                                alt={comment.user?.name || "User"}
                                fallback={comment.user?.name?.charAt(0) || "U"}
                                className="h-8 w-8"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {comment.user?.name || "Unknown User"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {comment.comment}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PostsPage;
