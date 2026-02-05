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
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import {
  checkFriendReq,
  createFriendNotif,
  GetUserData,
  updateUser,
} from "@/lib/apiCalls";
import PostsDashboard from "../../../Components/usersPosts";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface UpdateUser {
  name: string;
  bio: string;
  location: string;
}
const UserProfilePage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const param = useParams();
  const id = param.userId as string;
  const { user } = useAuth();
  const isOwnProfile = user?.userId === param.userId;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile", isOwnProfile ? user?.userId : id],
    queryFn: () => GetUserData(isOwnProfile ? (user?.userId as string) : id),
    enabled: !!user?.userId || !!id,
  });

  const [editForm, setEditForm] = useState<UpdateUser | undefined>();
  const [image, setImage] = useState<File | undefined>();
  const [previewImage, setPreViewImage] = useState<string | null>();

  useEffect(() => {
    setEditForm({
      name: profile?.name,
      bio: profile?.bio,
      location: profile?.location,
    });
    setImage(profile?.avatarUrl);
  }, [profile]);

  // Check friendship status
  const { data: friendshipStatus } = useQuery({
    queryKey: ["friendshipStatus", id, user?.userId],
    queryFn: () =>
      checkFriendReq({ reciverId: id, senderId: user?.userId as string }),
    enabled: Boolean(user?.userId && id),
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

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editForm) {
      const userData = new FormData();
      userData.append("userId", user?.userId as string);
      userData.append("name", editForm.name);
      userData.append("bio", editForm.bio);
      userData.append("loaction", editForm.location);
      if (image) {
        userData.append("newImage", image);
      }
      userData.append("oldImage", profile?.avatarUrl);
      updateProfileMutation.mutate(userData);
    }
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      setPreViewImage(objectURL);
      setImage(file);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const joinDate = new Date(profile?.createdAt);

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Cover Area */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 relative border-4 border-white overflow-hidden rounded-full">
                <Image
                  src={previewImage || image || profile?.avatarUrl}
                  alt={profile?.name}
                  width={150}
                  height={150}
                  quality={100}
                  className="w-full h-full  shadow-lg object-cover"
                />
                {isOwnProfile && isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full shadow-lg hover:bg-blue-700 transition cursor-pointer">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
                {updateProfileMutation.isPending && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Name and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.name}
                </h1>
                <p className="text-gray-600 mt-1">{profile?.email}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {isOwnProfile ? (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </button>
                    <Link
                      href="profilePage/changePassword"
                      className="pl-2 underline text-blue-600 hover:text-purple-700"
                    >
                      Change Password
                    </Link>
                  </div>
                ) : (
                  <>
                    {friendshipStatus?.status &&
                    friendshipStatus?.status === "ACCEPTED" ? (
                      <button
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm hover:cursor-pointer"
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
                        className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserPlus className="w-4 h-4" />
                        {friendshipStatus == null
                          ? "Add Friend"
                          : friendshipStatus?.status === "PENDING"
                            ? "Request Sent"
                            : "Add Friend"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {profile?._count.post}
                </div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {profile?._count.sentFriendReqs}
                </div>
                <div className="text-sm text-gray-600">Friends</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {profile?._count.recivedFriendReqs}
                </div>
                <div className="text-sm text-gray-600">Connections</div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">About</h2>

          {isEditing ? (
            <form className="space-y-4" onSubmit={handleSaveProfile}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  defaultValue={profile?.name}
                  onChange={(e) => handleEditChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  defaultValue={profile?.bio || ""}
                  onChange={(e) => handleEditChange("bio", e.target.value)}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  defaultValue={profile?.location || ""}
                  onChange={(e) => handleEditChange("location", e.target.value)}
                  placeholder="Where are you based?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {profile?.bio && <p className="text-gray-700">{profile?.bio}</p>}

              {profile?.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{profile?.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Joined{" "}
                  {joinDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {!profile?.bio && !profile?.location && isOwnProfile && (
                <p className="text-gray-500 italic">
                  Click "Edit Profile" to add your bio and location
                </p>
              )}
            </div>
          )}
        </div>
        <div className="mt-3">
          <PostsDashboard
            userId={isOwnProfile ? (user?.userId as string) : id}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
