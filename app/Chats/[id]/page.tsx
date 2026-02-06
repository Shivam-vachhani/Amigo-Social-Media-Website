"use client";
import { useAuth } from "@/app/context/authContext";
import { useGetChatNotification } from "@/hooks/useGetChatNotification";
import {
  getAllMessages,
  GetUserData,
  sendMessage,
  UpdateMsgSeen,
} from "@/lib/apiCalls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  CheckCheck,
  Send,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

// TypeScript Interfaces
interface Message {
  id: string;
  text: string;
  senderId: string;
  seenBy: string[];
  createdAt: string;
}

interface ChatData {
  convoId: string;
  messages: Message[];
}

interface Profile {
  id: string;
  name: string;
  avatarUrl?: string;
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
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
};

// Custom Skeleton Component
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
};

const ChatWindow: React.FC = () => {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useGetChatNotification();

  // Fetch profile data
  const { data: profile, isLoading: loadingProfile } = useQuery<Profile>({
    queryKey: ["friendProfile", id],
    queryFn: () => GetUserData(id),
  });

  // Fetch chat messages
  const { data: Chats, isLoading: loadingChats } = useQuery<ChatData>({
    queryKey: ["Chats", id],
    queryFn: () =>
      getAllMessages({ senderId: user?.userId as string, reciverId: id }),
    enabled: !!user?.userId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Chats", id] });
      setMessage("");
      scrollToBottom();
    },
  });

  // Update message status mutation
  const UpdateMessageStatus = useMutation({
    mutationFn: UpdateMsgSeen,
    onSuccess: () => {
      // Optional: invalidate queries if needed
    },
  });

  // Handle send message
  const handleSendMsg = (): void => {
    if (message.trim().length === 0) return;

    sendMessageMutation.mutate({
      message: message,
      senderId: user?.userId as string,
      reciverId: id,
      convoId: Chats?.convoId,
    });
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMsg();
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Format time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date for separators
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare only dates
    const messageDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const yesterdayDate = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    );

    if (messageDate.getTime() === todayDate.getTime()) {
      return "Today";
    } else if (messageDate.getTime() === yesterdayDate.getTime()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  // Check if we need to show date separator
  const shouldShowDateSeparator = (
    currentMsg: Message,
    prevMsg?: Message,
  ): boolean => {
    if (!prevMsg) return true;

    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();

    return currentDate !== prevDate;
  };

  // Update message status on load
  useEffect(() => {
    if (Chats && user) {
      UpdateMessageStatus.mutate({
        convoId: Chats?.convoId,
        senderId: id,
        reciverId: user?.userId as string,
      });
    }
  }, [Chats]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [Chats?.messages]);

  // Loading State
  if (loadingProfile || loadingChats) {
    return (
      <div className="h-full w-full flex flex-col bg-gray-50">
        {/* Header Skeleton */}
        <div className="flex-none flex items-center gap-4 h-20 bg-white border-b border-gray-200 px-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Messages Skeleton */}
        <div className="flex-1 p-4 space-y-4">
          <div className="flex justify-start">
            <Skeleton className="h-12 w-48 rounded-2xl" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-12 w-64 rounded-2xl" />
          </div>
          <div className="flex justify-start">
            <Skeleton className="h-12 w-56 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Header - Fixed */}
      <div className="flex-none bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-20 px-4 sm:px-6">
          {/* Left Section - Profile Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Back Button - Mobile Only */}
            <button
              onClick={() => router.back()}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>

            {/* Avatar */}
            <Avatar
              src={profile?.avatarUrl || "/defaultAvatar.png"}
              alt={profile?.name || "User"}
              fallback={profile?.name?.charAt(0) || "U"}
              className="w-11 h-11 sm:w-12 sm:h-12"
              isOnline={profile?.isOnline}
            />

            {/* Name and Status */}
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">
                {profile?.name || "Unknown User"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {profile?.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone size={20} className="text-gray-600" />
            </button>
            <button className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar">
        <div className="flex flex-col space-y-3 max-w-4xl mx-auto">
          {Chats?.messages && Chats.messages.length > 0 ? (
            Chats.messages.map((msg: Message, index: number) => {
              const isSender = msg.senderId === user?.userId;
              const isSeen = msg.seenBy && msg.seenBy.length > 0; // More than just sender
              const prevMsg = index > 0 ? Chats.messages[index - 1] : undefined;
              const showDateSeparator = shouldShowDateSeparator(msg, prevMsg);

              return (
                <div key={msg.id}>
                  {/* Date Separator */}
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-4">
                      <div className="px-3 py-1 bg-white rounded-lg shadow-sm border border-gray-200">
                        <span className="text-xs font-medium text-gray-600">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                      px-4 py-2 rounded-2xl max-w-[70%] sm:max-w-[60%] break-words shadow-sm
                      ${
                        isSender
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                          : "bg-white text-gray-900 rounded-bl-md border border-gray-200"
                      }
                    `}
                    >
                      <p className="text-sm sm:text-base leading-relaxed">
                        {msg.text}
                      </p>

                      {/* Time and Status */}
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 ${
                          isSender ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        <span className="text-xs">
                          {formatTime(msg.createdAt)}
                        </span>
                        {isSender &&
                          (isSeen ? (
                            // Double tick - Message seen
                            <CheckCheck size={14} className="text-blue-200" />
                          ) : (
                            // Single tick - Message sent but not seen
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-blue-100"
                            >
                              <path
                                d="M13.5 4L6 11.5L2.5 8"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Send size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No messages yet
              </h3>
              <p className="text-sm text-gray-500">
                Start the conversation by sending a message
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar - Fixed at Bottom */}
      <div className="flex-none bg-white border-t border-gray-200 shadow-lg">
        <div className="p-3 sm:p-4 max-w-4xl mx-auto">
          <div className="flex items-end gap-2 sm:gap-3">
            {/* Emoji Button - Hidden on mobile */}
            <button className="hidden sm:flex p-2.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
              <Smile size={22} className="text-gray-600" />
            </button>

            {/* Attachment Button - Hidden on mobile */}
            <button className="hidden sm:flex p-2.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
              <Paperclip size={22} className="text-gray-600" />
            </button>

            {/* Input Field */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendMessageMutation.isPending}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMsg}
              disabled={
                message.trim().length === 0 || sendMessageMutation.isPending
              }
              className="shrink-0 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <Send size={22} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

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
    </div>
  );
};

export default ChatWindow;
