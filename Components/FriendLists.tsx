"use client";

import { useAuth } from "@/app/context/authContext";
import { getAllFriends } from "@/lib/apiCalls";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Search, Users, Loader2, MessageCircle, X } from "lucide-react";
import { useState } from "react";

// TypeScript Interface
interface Friend {
  id: string;
  name: string;
  avatarUrl?: string;
  username?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

// Custom Avatar Component
const Avatar: React.FC<{
  src?: string;
  alt?: string;
  fallback: string;
  className?: string;
  isOnline?: boolean;
}> = ({ src, alt, fallback, className = "", isOnline = false }) => {
  const [imageError, setImageError] = useState<boolean>(false);

  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center ${className}`}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt || "Avatar"}
          width={48}
          height={48}
          quality={100}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
          {fallback}
        </div>
      )}
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
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
}> = ({ value, onChange, placeholder, className = "" }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
    />
  );
};

// Custom Skeleton Component
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
};

const FriendLists: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Fetch friends
  const { data: friends, isLoading } = useQuery<Friend[]>({
    queryKey: ["AllMyFriends", user?.userId],
    queryFn: () => getAllFriends(user?.userId as string),
    enabled: !!user?.userId,
  });

  // Filter friends based on search
  const filteredFriends =
    friends?.filter(
      (friend: Friend) =>
        friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  // Check if current chat is selected
  const isSelected = (friendId: string): boolean => {
    return pathname?.includes(friendId);
  };

  // Handle friend click
  const handleFriendClick = (friendId: string): void => {
    router.push(`/Chats/${friendId}`);
    setIsMobileOpen(false); // Close sidebar on mobile after selection
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="h-full w-full lg:w-[380px] bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3 mb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-50
        h-full w-full sm:w-[380px] lg:w-[380px] 
        bg-white border-r border-gray-200 
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Chats</h2>
                <p className="text-xs text-gray-600">
                  {filteredFriends.length} conversation
                  {filteredFriends.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 bg-white"
            />
          </div>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto">
          {filteredFriends.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No results found" : "No friends yet"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchQuery
                  ? "Try searching with a different name"
                  : "Start connecting with people to begin chatting"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => router.push("/people")}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Find Friends
                </button>
              )}
            </div>
          ) : (
            <div className="p-2">
              {filteredFriends.map((friend: Friend) => (
                <div
                  key={friend.id}
                  onClick={() => handleFriendClick(friend.id)}
                  className={`
                    p-3 mb-1 rounded-xl cursor-pointer transition-all duration-200
                    hover:bg-gray-50
                    ${
                      isSelected(friend.id)
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <Avatar
                      src={friend.avatarUrl || "/defaultAvatar.png"}
                      alt={friend.name}
                      fallback={friend.name?.charAt(0) || "U"}
                      className="w-12 h-12"
                      isOnline={friend.isOnline}
                    />

                    {/* Friend Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold truncate ${
                            isSelected(friend.id)
                              ? "text-blue-600"
                              : "text-gray-900"
                          }`}
                        >
                          {friend.name}
                        </h3>
                        {friend.lastMessageTime && (
                          <span className="text-xs text-gray-500 ml-2">
                            {friend.lastMessageTime}
                          </span>
                        )}
                      </div>

                      {friend.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {friend.lastMessage}
                        </p>
                      )}
                    </div>

                    {/* Unread Badge */}
                    {friend.unreadCount && friend.unreadCount > 0 && (
                      <div className="shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {friend.unreadCount > 9 ? "9+" : friend.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Toggle Button - Only show when sidebar is closed */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-41 right-6 lg:hidden w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center z-30 hover:scale-110 transition-transform"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
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
    </>
  );
};

export default FriendLists;
