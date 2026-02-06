"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Calendar,
  Edit2,
  UserPlus,
  MessageCircle,
  Camera,
  Check,
  Clock,
  Settings,
  Mail,
  Users,
  FileText,
  Link as LinkIcon,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../../context/authContext";
import {
  checkFriendReq,
  createFriendNotif,
  GetUserData,
  updateUser,
} from "@/lib/apiCalls";
import PostsDashboard from "../../../../Components/usersPosts";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// TypeScript Interfaces
interface UpdateUser {
  name: string;
  bio: string;
  location: string;
}

interface Profile {
  name: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  location?: string;
  createdAt: string;
  _count: {
    post: number;
    sentFriendReqs: number;
    recivedFriendReqs: number;
  };
}

interface FriendshipStatus {
  status: "PENDING" | "ACCEPTED" | null;
}

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
          width={128}
          height={128}
          quality={100}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl">
          {fallback}
        </div>
      )}
    </div>
  );
};

// Custom Input Component
const Input: React.FC<{
  value?: string;
  defaultValue?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  label?: string;
}> = ({
  value,
  defaultValue,
  onChange,
  placeholder,
  className = "",
  type = "text",
  label,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
      />
    </div>
  );
};

// Custom Textarea Component
const Textarea: React.FC<{
  value?: string;
  defaultValue?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  label?: string;
}> = ({
  value,
  defaultValue,
  onChange,
  placeholder,
  className = "",
  rows = 3,
  label,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${className}`}
      />
    </div>
  );
};

// Custom Card Component
const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md ${className}`}>
      {children}
    </div>
  );
};

// Custom Badge Component
const Badge: React.FC<{
  children: React.ReactNode;
  variant?: "default" | "success" | "warning";
  className?: string;
}> = ({ children, variant = "default", className = "" }) => {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium";
  const variantStyles = {
    default: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

const UserProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const param = useParams();
  const id = param.userId as string;
  const { user } = useAuth();
  const isOwnProfile = user?.userId === param.userId;

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["userProfile", isOwnProfile ? user?.userId : id],
    queryFn: () => GetUserData(isOwnProfile ? (user?.userId as string) : id),
    enabled: !!user?.userId || !!id,
  });

  const [editForm, setEditForm] = useState<UpdateUser>({
    name: "",
    bio: "",
    location: "",
  });
  const [image, setImage] = useState<File | string | undefined>();
  const [previewImage, setPreViewImage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile?.name || "",
        bio: profile?.bio || "",
        location: profile?.location || "",
      });
      setImage(profile?.avatarUrl);
    }
  }, [profile]);

  // Check friendship status
  const { data: friendshipStatus } = useQuery<FriendshipStatus>({
    queryKey: ["friendshipStatus", id, user?.userId],
    queryFn: () =>
      checkFriendReq({ reciverId: id, senderId: user?.userId as string }),
    enabled: Boolean(user?.userId && id && !isOwnProfile),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", user?.userId],
      });
      setIsEditing(false);
    },
  });

  // Add friend mutation
  const addFriendMutation = useMutation({
    mutationFn: createFriendNotif,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["friendshipStatus", id, user?.userId],
      });
    },
  });

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (editForm && user?.userId) {
      const userData = new FormData();
      userData.append("userId", user.userId);
      userData.append("name", editForm.name);
      userData.append("bio", editForm.bio);
      userData.append("loaction", editForm.location);
      if (image && typeof image !== "string") {
        userData.append("newImage", image);
      }
      if (profile?.avatarUrl) {
        userData.append("oldImage", profile.avatarUrl);
      }
      updateProfileMutation.mutate(userData);
    }
  };

  const handleEditChange = (field: keyof UpdateUser, value: string): void => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      setPreViewImage(objectURL);
      setImage(file);
    }
  };

  const handleCancelEdit = (): void => {
    setIsEditing(false);
    setPreViewImage(null);
    if (profile) {
      setEditForm({
        name: profile.name,
        bio: profile.bio || "",
        location: profile.location || "",
      });
      setImage(profile.avatarUrl);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt)
    : new Date();

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-50 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ">
        {/* Profile Header Card */}
        <Card className="overflow-hidden mb-6">
          {/* Cover Image with Gradient */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Profile Info */}
          <div className="relative px-4 sm:px-6 pb-6">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
              <div className="relative -mt-16 sm:-mt-20 mb-4">
                <div className="relative inline-block">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-white rounded-full shadow-xl overflow-hidden bg-white">
                    <Avatar
                      src={
                        previewImage ||
                        (typeof image === "string" ? image : undefined) ||
                        profile?.avatarUrl
                      }
                      alt={profile?.name || "User"}
                      fallback={profile?.name?.charAt(0) || "U"}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Camera Button for Edit Mode */}
                  {isOwnProfile && isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 p-2.5 rounded-full shadow-lg hover:bg-blue-700 transition cursor-pointer">
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {/* Loading Overlay */}
                  {updateProfileMutation.isPending && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Desktop */}
              <div className="hidden sm:flex gap-3 mb-4">
                {isOwnProfile ? (
                  <>
                    {isEditing ? (
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </button>
                        <Link
                          href="/profilePage/changePassword"
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {friendshipStatus?.status === "ACCEPTED" ? (
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md"
                        onClick={() => router.push(`/Chats/${id}`)}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          addFriendMutation.mutate({
                            reciverId: id,
                            senderId: user?.userId as string,
                          })
                        }
                        disabled={
                          addFriendMutation.isPending ||
                          friendshipStatus?.status === "PENDING"
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addFriendMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : friendshipStatus?.status === "PENDING" ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        {friendshipStatus?.status === "PENDING"
                          ? "Request Sent"
                          : "Add Friend"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Name and Email */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {profile?.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm sm:text-base">{profile?.email}</span>
              </div>
            </div>

            {/* Action Buttons - Mobile */}
            <div className="flex sm:hidden flex-col gap-2 mb-6">
              {isOwnProfile ? (
                <>
                  {isEditing ? (
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                      <Link
                        href="/profilePage/changePassword"
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  {friendshipStatus?.status === "ACCEPTED" ? (
                    <button
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md"
                      onClick={() => router.push(`/Chats/${id}`)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        addFriendMutation.mutate({
                          reciverId: id,
                          senderId: user?.userId as string,
                        })
                      }
                      disabled={
                        addFriendMutation.isPending ||
                        friendshipStatus?.status === "PENDING"
                      }
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addFriendMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : friendshipStatus?.status === "PENDING" ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                      {friendshipStatus?.status === "PENDING"
                        ? "Request Sent"
                        : "Add Friend"}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900">
                    {profile?._count.post || 0}
                  </div>
                </div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-green-600" />
                  <div className="text-2xl font-bold text-gray-900">
                    {profile?._count.sentFriendReqs || 0}
                  </div>
                </div>
                <div className="text-sm text-gray-600">Friends</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <LinkIcon className="w-4 h-4 text-purple-600" />
                  <div className="text-2xl font-bold text-gray-900">
                    {profile?._count.recivedFriendReqs || 0}
                  </div>
                </div>
                <div className="text-sm text-gray-600">Connections</div>
              </div>
            </div>
          </div>
        </Card>

        {/* About Section */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            About
          </h2>

          {isEditing ? (
            <form className="space-y-4" onSubmit={handleSaveProfile}>
              <Input
                label="Name"
                defaultValue={profile?.name}
                onChange={(e) => handleEditChange("name", e.target.value)}
                placeholder="Your name"
              />

              <Textarea
                label="Bio"
                defaultValue={profile?.bio || ""}
                onChange={(e) => handleEditChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />

              <Input
                label="Location"
                defaultValue={profile?.location || ""}
                onChange={(e) => handleEditChange("location", e.target.value)}
                placeholder="Where are you based?"
              />

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md disabled:opacity-50 font-medium"
              >
                {updateProfileMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {profile?.bio ? (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              ) : (
                isOwnProfile && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-blue-700 text-sm">
                      Click "Edit Profile" to add your bio
                    </p>
                  </div>
                )
              )}

              <div className="space-y-3">
                {profile?.location && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Location
                      </p>
                      <p className="font-medium">{profile.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Joined</p>
                    <p className="font-medium">
                      {joinDate.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Posts Section */}
        <div className="">
          <PostsDashboard
            userId={isOwnProfile ? (user?.userId as string) : id}
          />
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default UserProfilePage;
