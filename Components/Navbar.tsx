"use client";
import {
  User,
  LogOut,
  Bell,
  HeartPlus,
  UserRound,
  MessageSquareMore,
} from "lucide-react";
import { useAuth } from "../app/context/authContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { logOutUser } from "@/lib/logout";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotication";
import { useState } from "react";
import {
  acceptFriendReq,
  getAllNotification,
  readNotification,
  rejectFriendReq,
} from "@/lib/apiCalls";

const Navbar = () => {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  useNotifications();
  const [openNotification, setOpenNotification] = useState<boolean>(false);
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

  const renderLogo = (notif: any) => {
    switch (notif.type) {
      case "LIKE":
        return (
          <div className="bg-red-500 p-1 w-8 h-8 rounded-2xl  flex justify-center items-center border-1 border-black">
            <HeartPlus size={20} color="white" />
          </div>
        );

      case "FRIEND-REQUEST":
        return (
          <div className="bg-blue-500 p-1 w-8 h-8 rounded-2xl  flex justify-center items-center border-1 border-black">
            <UserRound size={20} color="white" />
          </div>
        );
      case "COMMENTE":
        return (
          <div className="bg-amber-900 p-1 w-8 h-8 rounded-2xl  flex justify-center items-center border-1 border-black">
            <MessageSquareMore size={20} color="white" />
          </div>
        );
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center hover:cursor-pointer"
              onClick={() => router.push("/allposts")}
            >
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Posts</h1>
              <p className="text-sm text-gray-500">
                Share your thoughts with the world
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:cursor-pointer"
              onClick={() => router.push(`/profilePage/${user?.userId}`)}
            >
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {user?.name.split(" ")[0]}
              </span>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
              onClick={() => logOutFunction()}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
            <button
              className="flex items-center gap-2 hover:cursor-pointer px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
              onClick={() => setOpenNotification(!openNotification)}
              onMouseEnter={() => setOpenNotification(true)}
            >
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">Notifications</span>
            </button>
          </div>
        </div>
      </div>
      <div
        className={`absolute top-22 right-4 bg-white shadow-lg rounded-lg  w-80 ${
          openNotification ? "block" : "hidden"
        }`}
      >
        <>
          <h3 className="text-lg font-semibold m-3 text-black">
            Notifications
          </h3>
          {data?.length === 0 ? (
            <p className="text-gray-700 p-5">No new notifications</p>
          ) : (
            <ul>
              {data?.map((notif: any) => {
                return (
                  <div
                    className={`${
                      notif.read
                        ? " grayscale-100 text-gray-500  bg-[#f7f7f4]"
                        : "grayscale-0 text-gray-700 font-semibold hover:cursor-pointer  bg-[#e6e6e6]"
                    } p-3 flex items-center space-x-3 m-1 rounded-xl`}
                    key={notif.id}
                    onClick={() => {
                      notif.read ? "" : raedNotifMutation.mutate(notif.id);
                    }}
                  >
                    {renderLogo(notif)}

                    <div className="flex flex-col">
                      <p>{`${notif?.sender.name} ${notif?.message}`}</p>

                      {notif.type === "FRIEND-REQUEST" &&
                      notif.status === "PENDING" ? (
                        <div className="flex items-center justify-center space-x-5 mt-1 text-white">
                          <button
                            onClick={() => acceptReqHandler(notif)}
                            className="bg-green-600 px-3 py-1 rounded-xl text-center hover:bg-green-700 hover:cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => rejectReqHandler(notif)}
                            className="bg-red-600 px-4 py-1 rounded-xl text-center hover:bg-red-700 hover:cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                );
              })}
            </ul>
          )}
        </>
      </div>
    </header>
  );
};

export default Navbar;
