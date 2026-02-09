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
  Loader2,
  Image as ImageIcon,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deletePost, getUserPosts, updatePost } from "@/lib/apiCalls";
import { api } from "@/lib/axios";
import Image from "next/image";
import { logger } from "@/lib/logger";

// TypeScript Interfaces
export interface Post {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  createdAt: Date;
}

export interface UpdatedPost {
  id: string;
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

// Custom Card Component
const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Custom Input Component
const Input: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  label?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  error?: string;
}> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  className = "",
  type = "text",
  label,
  name,
  id,
  disabled,
  error,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
        } ${disabled ? "bg-gray-50 cursor-not-allowed" : ""} ${className}`}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <XCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};

// Custom Textarea Component
const Textarea: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  label?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  error?: string;
}> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  className = "",
  rows = 3,
  label,
  name,
  id,
  disabled,
  error,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 resize-none ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
        } ${disabled ? "bg-gray-50 cursor-not-allowed" : ""} ${className}`}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <XCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};

// Custom Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

const PostsDashboard: React.FC<{ userId: string }> = ({ userId }) => {
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

  // Validation functions
  const validateTitle = (title: string): string => {
    if (!title.trim()) return "Title is required";
    if (title.trim().length < 3) return "Title must be at least 3 characters";
    if (title.trim().length > 100)
      return "Title must not exceed 100 characters";
    return "";
  };

  const validateDescription = (description: string): string => {
    if (!description.trim()) return "Description is required";
    if (description.trim().length < 10)
      return "Description must be at least 10 characters";
    if (description.trim().length > 1000)
      return "Description must not exceed 1000 characters";
    return "";
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        image: "Please select a valid image file",
      }));
      return;
    }

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
    setImage(undefined);
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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

  // Mutations
  const postMutation = useMutation({
    mutationFn: (newPost: FormData) => api.post("/post", newPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", userId] });
      closeModal();
      setIsSubmitting(false);
    },
    onError: (err) => {
      logger.error("mutation Failed", err);
      setIsSubmitting(false);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", userId] });
    },
    onError: (err) => {
      logger.error("Delete Mutation failed", err);
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", userId] });
      closeModal();
      setIsSubmitting(false);
    },
    onError: (err) => {
      logger.error("Update Post Mutation Failed", err);
      setIsSubmitting(false);
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

    if (titleError || descriptionError) return;

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

  // Query
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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to view posts</p>
        </div>
      </div>
    );
  }

  if (postLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-18">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Posts</h2>
            <p className="text-sm text-gray-600">
              {data?.data?.length || 0} post
              {(data?.data?.length || 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium hidden sm:inline">Create Post</span>
        </button>
      </div>

      {/* Posts Grid */}
      {(data?.data?.length ?? 0) === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <ImagePlus className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first post to get started
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Create Post</span>
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data.map((post: Post) => (
            <Card key={post.id} className="overflow-hidden group">
              {post.imageUrl && (
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={400}
                    height={300}
                    quality={100}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {post.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(post)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit post"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(post.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Post Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeModal}
        title={editingPost ? "Edit Post" : "Create New Post"}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Field */}
          <Input
            id="title"
            name="title"
            label="Post Title *"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter an engaging title..."
            disabled={isSubmitting}
            error={errors.title}
          />

          {/* Description Field */}
          <div>
            <Textarea
              id="description"
              name="description"
              label="Description *"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={6}
              placeholder="Share your thoughts in detail..."
              disabled={isSubmitting}
              error={errors.description}
            />
            {!errors.description && (
              <p className="mt-2 text-sm text-gray-500">
                {formData.description.length}/1000 characters
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Image (Optional)
            </label>

            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer">
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
              type="button"
              onClick={closeModal}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {editingPost ? "Updating..." : "Creating..."}
                </span>
              ) : editingPost ? (
                "Update Post"
              ) : (
                "Create Post"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
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
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PostsDashboard;
