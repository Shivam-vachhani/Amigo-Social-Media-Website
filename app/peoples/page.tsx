"use client";
import React, { useState, useEffect } from "react";
import { Users, UserPlus, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { checkFriendReq, createFriendNotif, getAllUsers } from "@/lib/apiCalls";
import { useAuth } from "../context/authContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  followersCount?: number;
  mutualFriendsCount?: number;
}

const AllUsersList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { user } = useAuth();
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: () => getAllUsers(),
  });

  const sendFriendReq = useMutation({
    mutationFn: createFriendNotif,
    onSuccess: () => {
      console.log("successfully send friend req");
    },
    onError: (res) => {
      console.error("send request mutation failed", res);
    },
  });

  const handelFriendReq = (id: string) => {
    if (user?.userId && id) {
      sendFriendReq.mutate({ senderId: user?.userId, reciverId: id });
    }
  };

  // Fetch all users
  useEffect(() => {
    console.log(data);
  }, [data]);

  // Render action button based on status
  const renderActionButton = (user: any) => {
    return (
      <button
        disabled={isLoading}
        onClick={() => handelFriendReq(user.id)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600  hover:cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        Add Friend
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              Discover People
            </h1>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error Message */}
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            can't fetch users
          </div>
        )}

        {/* Users List */}
        <div className="space-y-3">
          {data?.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500 ">
              No users found
            </div>
          ) : (
            data?.map((ppl: any) => {
              return ppl.id !== user?.userId ? (
                <div
                  key={ppl.id}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/profilePage/${ppl.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-15 h-15 rounded-full flex items-center overflow-hidden justify-center text-white font-bold text-lg">
                        <Image
                          src={ppl?.avatarUrl || "/defaultAvatar.png"}
                          alt={ppl?.username || "User Avatar"}
                          width={50}
                          height={50}
                          quality={100}
                          className="rounded-full w-full h-full"
                          priority
                        />
                      </div>

                      {/* User Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {ppl.name}
                        </h3>
                      </div>
                    </div>

                    {/* Action Button */}
                    {renderActionButton(user)}
                  </div>
                </div>
              ) : (
                ""
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AllUsersList;
