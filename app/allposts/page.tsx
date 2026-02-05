"use client";
import { useState, useEffect, ReactEventHandler } from "react";
import { Heart, MessageCircle, User, Send } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/authContext";
import { addLike, postComment } from "@/lib/apiCalls";
import { api } from "@/lib/axios";
import Image from "next/image";

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

const PostsPage = () => {
  const [openPostID, setOpenPostId] = useState<string | null>(null);
  const { user, isLoading: authLoding } = useAuth();
  const [userComment, setUserComment] = useState<Comment>();
  const queryClient = useQueryClient();
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const { data: posts, isLoading } = useQuery({
    queryKey: ["allPosts"],
    queryFn: async () => {
      const res = await api.get("/allposts");
      return res.data.posts;
    },
  });

  const createComment = useMutation({
    mutationFn: postComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
    },
    onError: (err) => {
      console.error("mutation Failed", err);
    },
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const sendComment = () => {
    if (
      userComment?.comment != undefined &&
      userComment?.userId != null &&
      userComment?.postId != null
    ) {
      if (userComment?.comment.trim().length > 0) {
        createComment.mutate(userComment);
        setUserComment({ comment: "" });
      }
    }
  };

  const sendLike = useMutation({
    mutationFn: addLike,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      // console.log(res);
    },
    onError: (err) => {
      console.error("mutation Failed", err);
    },
  });

  const handleLike = (id: string | undefined) => {
    if (id && user) {
      if (!likedPosts.includes(id)) {
        setLikedPosts((prev) => [...prev, id]);
      }
      if (user) sendLike.mutate({ id: id, senderId: user?.userId });
    }
  };

  useEffect(() => {
    setUserComment({
      userId: user?.userId,
    });
    console.log(posts);
  }, [isLoading, authLoding]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 ">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">All Posts</h1>

        {posts?.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts?.map((post: Post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.imageUrl && (
                  <div className="w-full h-full overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      width={1000}
                      height={1000}
                      quality="100"
                      className=" object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full flex overflow-hidden items-center justify-center">
                      <Image
                        src={post?.user?.avatarUrl || "/defaultAvatar.png"}
                        alt={post?.user?.name || "User Avatar"}
                        width={50}
                        height={50}
                        quality={100}
                        className="rounded-full w-full h-full"
                        priority
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {post.user?.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {post.title}
                  </h2>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {post.description}
                  </p>

                  <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                    <button
                      className={`flex items-center gap-2 text-gray-600 hover:text-red-600  transition-colors ${
                        post.likes?.length > 0 ? "text-red-600" : ""
                      }`}
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart
                        className="w-5 h-5"
                        fill={post.likes?.length > 0 ? "red" : "none"}
                      />
                      <span className="text-sm font-medium">
                        {post.likes?.length || 0}
                      </span>
                    </button>

                    <button
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={() =>
                        setOpenPostId((prev) =>
                          prev === post.id ? null : post?.id,
                        )
                      }
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {post.comments?.length || 0}
                      </span>
                    </button>
                  </div>
                  {openPostID === post.id ? (
                    <div className="flex flex-col space-y-10">
                      <div className="ml-8 flex items-center mt-11 space-x-3">
                        <div className="bg-blue-700 text-xl text-white w-8 h-8 text-center pt-0.5 rounded-4xl relative">
                          {user?.name.charAt(0)}
                        </div>
                        <input
                          type="text"
                          className="p-1 w-[40%] border-b-1 border-gray-500  text-gray-800 focus:outline-none focus:ring-0"
                          multiple
                          onChange={(e) =>
                            setUserComment((prev) => ({
                              ...prev,
                              comment: e.target?.value,
                              postId: post.id,
                            }))
                          }
                          placeholder="Write your comment "
                        />
                        <button
                          className="w-10 h-10 bg-emerald-800 rounded-4xl flex items-center justify-center right-0 hover:cursor-pointer"
                          onClick={sendComment}
                        >
                          <Send className="w-5 h-5" color="white" />
                        </button>
                      </div>
                      <div className="ml-1 flex-col items-center mt-5 space-y-12">
                        {post.comments != undefined ? (
                          post.comments?.map((comment) => (
                            <div
                              className="flex space-x-3 items-center"
                              key={comment.id}
                            >
                              <Image
                                src={
                                  comment.user?.avatarUrl ||
                                  "/defaultAvatar.png"
                                }
                                alt={comment.user?.name || "commenter"}
                                width={50}
                                height={50}
                                quality={100}
                                className="rounded-full  object-cover"
                              />
                              <div className="text-gray-500 flex flex-col spa">
                                <p className="text-black text-[16px]">
                                  {comment.user?.name}
                                </p>
                                <p className="pl-2">{comment.comment}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsPage;
