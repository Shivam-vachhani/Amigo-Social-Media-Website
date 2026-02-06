"use client";
import React, { useState, useEffect } from "react";
import { Users, UserPlus, Search, Loader2, UserCheck, Clock } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { checkFriendReq, createFriendNotif, getAllUsers } from "@/lib/apiCalls";
import { useAuth } from "../context/authContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

// TypeScript Interfaces
interface User {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  followersCount?: number;
  mutualFriendsCount?: number;
}

type FriendStatus = "none" | "pending" | "friends";

// Custom Card Component
const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => {
  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 ${className}`}
      onClick={onClick}
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
    <div className={`rounded-full overflow-hidden flex items-center justify-center ${className}`}>
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt || "Avatar"}
          width={64}
          height={64}
          quality={100}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          priority
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
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
  type?: string;
}> = ({ value, onChange, placeholder, className = "", type = "text" }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
    />
  );
};

// Custom Badge Component
const Badge: React.FC<{
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}> = ({ children, variant = "default", className = "" }) => {
  const baseStyles = "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium";
  const variantStyles = {
    default: "bg-blue-100 text-blue-700",
    secondary: "bg-gray-100 text-gray-700",
    outline: "border border-blue-300 text-blue-600 bg-transparent",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Custom Skeleton Component
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
};

// Utility function for className merging
const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(" ");
};

const AllUsersList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { user } = useAuth();
  const router = useRouter();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  // Fetch all users
  const { data, isLoading, isError } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => getAllUsers(),
  });

  // Send friend request mutation
  const sendFriendReq = useMutation({
    mutationFn: createFriendNotif,
    onSuccess: () => {
      console.log("successfully send friend req");
      setLoadingUserId(null);
    },
    onError: (res: Error) => {
      console.error("send request mutation failed", res);
      setLoadingUserId(null);
    },
  });

  // Handle friend request
  const handleFriendReq = (id: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    if (user?.userId && id) {
      setLoadingUserId(id);
      sendFriendReq.mutate({ senderId: user.userId, reciverId: id });
    }
  };

  // Filter users based on search query
  const filteredUsers = data?.filter((ppl: User) => 
    ppl.id !== user?.userId && (
      ppl.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ppl.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ppl.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || [];

  // Log data on mount
  useEffect(() => {
    console.log(data);
  }, [data]);

  // Render action button
  const renderActionButton = (userId: string) => {
    const isButtonLoading = loadingUserId === userId;

    return (
      <button
        disabled={isButtonLoading}
        onClick={(e) => handleFriendReq(userId, e)}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
      >
        {isButtonLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Add Friend</span>
      </button>
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Discover People
              </h1>
              <p className="text-gray-600">
                Find and connect with amazing people
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              type="text"
              placeholder="Search by name, username, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 w-full"
            />
          </div>
        </div>

        {/* Error Message */}
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            Unable to fetch users. Please try again later.
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6">
          <Badge variant="secondary" className="px-3 py-1.5 text-sm">
            {filteredUsers.length} people found
          </Badge>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-1">
                  No people found
                </p>
                <p className="text-gray-600">
                  Try adjusting your search query
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((ppl: User) => (
              <Card
                key={ppl.id}
                className="group overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/profilePage/${ppl.id}`)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar
                        src={ppl?.avatarUrl || "/defaultAvatar.png"}
                        alt={ppl?.name || "User"}
                        fallback={ppl?.name?.charAt(0) || "U"}
                        className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-blue-200 group-hover:border-blue-400 transition-colors"
                      />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {ppl.name}
                        </h3>
                        <span className="text-sm text-gray-500 hidden sm:inline">
                          @{ppl.username}
                        </span>
                      </div>
                      {ppl.bio && (
                        <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                          {ppl.bio}
                        </p>
                      )}
                      {ppl.mutualFriendsCount && ppl.mutualFriendsCount > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Users size={12} />
                          <span>
                            {ppl.mutualFriendsCount} mutual friend
                            {ppl.mutualFriendsCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0">
                      {renderActionButton(ppl.id)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default AllUsersList;