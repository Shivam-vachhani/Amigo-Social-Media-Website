"use client";
import React, { useEffect, useState } from "react";
import {
  Plus,
  ImagePlus,
  X,
  Upload,
  Edit2,
  Trash2,
  Calendar,
  XCircle,
} from "lucide-react";
import { useAuth } from "../app/context/authContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deletePost, getUserPosts, updatePost } from "@/lib/apiCalls";
import { api } from "@/lib/axios";
import Image from "next/image";

export interface Post {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  createdAt: Date;
}

export interface UpdatedPost {
  id: number;
  title: string;
  description: string;
  image: File | null;
}

interface FormDatas {
  title: string;
  description: string;
}

interface FormErrors {
  title: string;
  description: string;
  image: string;
}

const PostsDashboard = ({ userId }: { userId: string }) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [image, setImage] = useState<File | undefined>(undefined);
  const [formData, setFormData] = useState<FormDatas>({
    title: "",
    description: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    title: "",
    description: "",
    image: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const queryClient = useQueryClient();

  const validateTitle = (title: string): string => {
    if (!title.trim()) {
      return "Title is required";
    }
    if (title.trim().length < 3) {
      return "Title must be at least 3 characters";
    }
    if (title.trim().length > 100) {
      return "Title must not exceed 100 characters";
    }
    return "";
  };

  const validateDescription = (description: string): string => {
    if (!description.trim()) {
      return "Description is required";
    }
    if (description.trim().length < 10) {
      return "Description must be at least 10 characters";
    }
    if (description.trim().length > 1000) {
      return "Description must not exceed 1000 characters";
    }
    return "";
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        image: "Please select a valid image file",
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image size must be less than 5MB",
      }));

      return;
    }

    setImage(file);

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleRemoveImage = (): void => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    let error = "";

    if (name === "title") {
      error = validateTitle(value);
    } else if (name === "description") {
      error = validateDescription(value);
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const resetForm = (): void => {
    setFormData({ title: "", description: "" });
    setImage(undefined);
    setImagePreview(null);
    setErrors({ title: "", description: "", image: "" });
    setEditingPost(null);
  };

  const openCreateModal = (): void => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (post: Post): void => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      description: post.description,
    });
    setImagePreview(post.imageUrl);
    setShowCreateModal(true);
  };

  const closeModal = (): void => {
    setShowCreateModal(false);
    setEditingPost(null);
    resetForm();
  };

  const postMutation = useMutation({
    mutationFn: (newPost: FormData) => {
      return api.post("/post", newPost);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["posts", userId] });
      closeModal();
    },
    onError: (err) => {
      console.error("mutation Failed", err);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["posts", userId] });
    },
    onError: (err) => {
      console.error("Delete Mutation failed", err);
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", userId] });
      closeModal();
    },
    onError: (err) => {
      console.error("Update Post Mutation Failed", err);
    },
  });
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    const titleError = validateTitle(formData.title);
    const descriptionError = validateDescription(formData.description);

    setErrors({
      title: titleError,
      description: descriptionError,
      image: "",
    });

    if (titleError || descriptionError) {
      return;
    }
    setIsSubmitting(true);
    if (editingPost) {
      const UpdatePostForm = new FormData();
      UpdatePostForm.append("postId", String(editingPost.id));
      UpdatePostForm.append("title", formData.title);
      UpdatePostForm.append("description", formData.description);
      if (editingPost.imageUrl) {
        UpdatePostForm.append("OldImageUrl", editingPost.imageUrl);
      }
      if (image) {
        UpdatePostForm.append("Newimage", image);
      }
      updatePostMutation.mutate(UpdatePostForm);
    } else {
      const postForm = new FormData();
      postForm.append("title", formData.title);
      postForm.append("description", formData.description);

      if (userId) {
        postForm.append("userId", userId);
      }
      if (image) {
        postForm.append("image", image);
      }
      postMutation.mutate(postForm);
    }
  };

  const handleDelete = (id: string): void => {
    deletePostMutation.mutate(id);
    setShowDeleteConfirm(null);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const {
    data,
    isLoading: postLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["posts", userId],
    queryFn: () => getUserPosts(userId as string),
    enabled: !!userId,
    staleTime: 0,
  });

  useEffect(() => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ["posts", userId] });
    }
  }, [userId, queryClient]);

  if (!userId) {
    return <div>Please log in to view posts</div>;
  }

  if (postLoading) {
    return <div>Loading posts...</div>;
  }

  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Post Button */}
        <div className="mb-8">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Create New Post</span>
          </button>
        </div>

        {/* Posts Grid */}
        {(data?.data?.length ?? 0) === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <ImagePlus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first post to get started
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Create Post</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.map((post: Post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {post.imageUrl && (
                  <div className="relative  object-cover flex items-center bg-gray-200">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      quality={100}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover "
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(post)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit post"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(post?.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Post Modal */}
      {showCreateModal && (
        <form
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onSubmit={handleSubmit}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPost ? "Edit Post" : "Create New Post"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title Field */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Post Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-black ${errors.title
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-indigo-500"
                    }`}
                  placeholder="Enter an engaging title..."
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none text-black ${errors.description
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-indigo-500"
                    }`}
                  placeholder="Share your thoughts in detail..."
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between mt-2">
                  {errors.description ? (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      {errors.description}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {formData.description.length}/1000 characters
                    </p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Image (Optional)
                </label>

                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </label>
                )}

                {errors.image && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.image}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${isSubmitting
                      ? "bg-indigo-400 cursor-not-allowed text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {editingPost ? "Updating..." : "Creating..."}
                    </span>
                  ) : editingPost ? (
                    "Update Post"
                  ) : (
                    "Create Post"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Post</h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this post? All data will be
              permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsDashboard;
