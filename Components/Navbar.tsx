"use client";
import {
  User,
  LogOut,
  Bell,
  HeartPlus,
  UserRound,
  MessageSquareMore,
  X,
  Check,
  ChevronDown,
  Users,
  MessageCircle,
  FileText,
} from "lucide-react";
import { useAuth } from "../app/context/authContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { logOutUser } from "@/lib/logout";
import { useRouter, usePathname } from "next/navigation";
import { useNotifications } from "@/hooks/useNotication";
import { useEffect, useState } from "react";
import {
  acceptFriendReq,
  getAllNotification,
  readNotification,
  rejectFriendReq,
} from "@/lib/apiCalls";
import Image from "next/image";

// Modern Logo Component
const ModernLogo = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="hover:scale-105 transition-transform"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="10" fill="url(#logoGradient)" />
    <path
      d="M20 10C14.477 10 10 14.477 10 20C10 25.523 14.477 30 20 30C25.523 30 30 25.523 30 20C30 14.477 25.523 10 20 10Z"
      fill="white"
      fillOpacity="0.2"
    />
    <path
      d="M16 18C16 17.4477 16.4477 17 17 17H23C23.5523 17 24 17.4477 24 18V22C24 22.5523 23.5523 23 23 23H17C16.4477 23 16 22.5523 16 22V18Z"
      fill="white"
    />
    <circle cx="20" cy="15" r="2" fill="white" />
    <path
      d="M18 26C18 25.4477 18.4477 25 19 25H21C21.5523 25 22 25.4477 22 26V27C22 27.5523 21.5523 28 21 28H19C18.4477 28 18 27.5523 18 27V26Z"
      fill="white"
    />
  </svg>
);

const Navbar = () => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const queryClient = useQueryClient();
  useNotifications();
  const [openNotification, setOpenNotification] = useState<boolean>(false);
  const [openProfileMenu, setOpenProfileMenu] = useState<boolean>(false);

  const logOutFunction = () => {
    queryClient.clear();
    queryClient.removeQueries({ queryKey: ["posts"] });
    logOutUser();
  };

  const { data } = useQuery({
    queryKey: ["notifiction", user?.userId],
    queryFn: () => getAllNotification(user?.userId as string),
    enabled: !!user?.userId,
  });

  const acceptReqMutation = useMutation({
    mutationFn: acceptFriendReq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifiction"] });
    },
    onError: (err) => {
      console.error("accept request mutation failed", err);
    },
  });

  const rejectReqMutation = useMutation({
    mutationFn: rejectFriendReq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifiction"] });
    },
    onError: (err) => {
      console.error("reject request mutation failed", err);
    },
  });

  const acceptReqHandler = (notif: any) => {
    if (notif) {
      acceptReqMutation.mutate({ reqId: notif.friendReqId, notifId: notif.id });
    }
  };

  const rejectReqHandler = (notif: any) => {
    if (notif) {
      rejectReqMutation.mutate({ reqId: notif.friendReqId, notifId: notif.id });
    }
  };

  const raedNotifMutation = useMutation({
    mutationFn: readNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifiction"] });
    },
    onError: (res) => {
      console.error("readNotification mutation failed", res);
    },
  });

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return (
          <div className="bg-gradient-to-br from-red-500 to-pink-500 p-2 w-9 h-9 rounded-xl flex justify-center items-center shadow-sm">
            <HeartPlus size={18} color="white" />
          </div>
        );
      case "FRIEND-REQUEST":
        return (
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 w-9 h-9 rounded-xl flex justify-center items-center shadow-sm">
            <UserRound size={18} color="white" />
          </div>
        );
      case "COMMENTE":
        return (
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 w-9 h-9 rounded-xl flex justify-center items-center shadow-sm">
            <MessageSquareMore size={18} color="white" />
          </div>
        );
      default:
        return null;
    }
  };

  const unreadCount = data?.filter((n: any) => !n.read).length || 0;

  // Navigation items
  const navItems = [
    {
      path: "/allposts",
      label: "Posts",
      icon: <FileText size={18} />,
    },
    {
      path: "/peoples",
      label: "People",
      icon: <Users size={18} />,
    },
    {
      path: "/Chats",
      label: "Chats",
      icon: <MessageCircle size={18} />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="cursor-pointer hover:opacity-90 transition-opacity flex space-x-2 items-center"
            onClick={() => router.push("/allposts")}
          >
            <ModernLogo />
            <p className="text-2xl font-semibold">Amigo</p>
          </div>

          {/* Navigation Items - Center */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  pathname.split("/")[1] === item.path.split("/")[1]
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                <span className="text-lg font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setOpenNotification(!openNotification)}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Bell size={22} className="text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {openNotification && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenNotification(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 animate-slide-down overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>
                      <button
                        onClick={() => setOpenNotification(false)}
                        className="p-1 hover:bg-white rounded-lg transition-colors"
                      >
                        <X size={18} className="text-gray-600" />
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {data?.length === 0 ? (
                        <p className="text-gray-500 p-6 text-center">
                          No new notifications
                        </p>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {data?.map((notif: any) => (
                            <div
                              key={notif.id}
                              className={`p-4 flex items-center justify-center gap-3 transition-colors cursor-pointer ${
                                notif.read
                                  ? "bg-gray-50/50"
                                  : "bg-white hover:bg-indigo-50/30"
                              }`}
                              onClick={() =>
                                !notif.read &&
                                raedNotifMutation.mutate(notif.id)
                              }
                            >
                              {renderNotificationIcon(notif.type)}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-[15px] ${
                                    notif.read
                                      ? "text-gray-500"
                                      : "text-gray-900 font-medium"
                                  }`}
                                >
                                  <span className="font-semibold">
                                    {notif.sender.name}
                                  </span>{" "}
                                  {notif.message}
                                </p>

                                {notif.type === "FRIEND-REQUEST" &&
                                  notif.status === "PENDING" && (
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          acceptReqHandler(notif);
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm"
                                      >
                                        <Check size={14} />
                                        Accept
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          rejectReqHandler(notif);
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                      >
                                        <X size={14} />
                                        Decline
                                      </button>
                                    </div>
                                  )}

                                {notif.status === "ACCEPTED" && (
                                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-lg bg-green-100 text-green-700">
                                    Accepted
                                  </span>
                                )}
                              </div>
                              {!notif.read && (
                                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenProfileMenu(!openProfileMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {user?.avatarUrl ? (
                  <div
                    className={`rounded-full w-12 h-12 overflow-hidden flex items-center justify-center`}
                  >
                    <Image
                      src={user?.avatarUrl || "/defaultAvatar.png"}
                      alt={user.name || "Avatar"}
                      width={34}
                      height={34}
                      quality={100}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-medium border-2 border-indigo-200">
                    {user?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                )}

                <span className="hidden sm:inline text-sm font-medium text-gray-900">
                  {user?.name.split(" ")[0]}
                </span>
                <ChevronDown size={16} className="text-gray-600" />
              </button>

              {/* Profile Dropdown Menu */}
              {openProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-slide-down overflow-hidden">
                    <div className="px-3 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">View profile</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          router.push(`/profilePage/${user?.userId}`);
                          setOpenProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">Profile</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={() => {
                          logOutFunction();
                          setOpenProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Log out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-around py-2 border-t border-gray-200/50 -mx-4 px-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                pathname === item.path ? "text-indigo-600" : "text-gray-600"
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
