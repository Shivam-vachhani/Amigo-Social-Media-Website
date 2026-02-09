"use client";
import { useAuth } from "@/app/context/authContext";
import { pusherClient } from "@/lib/pusher-client";
import { getSocket } from "@/lib/socket-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useNotifications() {
  const [notification, setNotications] = useState<any[]>([]);
  const [pusherNotif, setPusherNotif] = useState<any[]>([]);
  const { user } = useAuth();
  const socket = getSocket();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!user) return;

    const channel = pusherClient.subscribe(`user-${user.userId}`);

    const handler = (data: any) => {
      setNotications((prev) => [data, ...prev]);
      setPusherNotif((prev) => [data, ...prev]);
      queryClient.invalidateQueries({ queryKey: ["notifiction"] });
      console.log("====================================");
      console.log("notification----->", data);
      console.log("====================================");
    };

    channel.bind("notification", handler);

    socket.on("connect", () => {
      // console.log("Socket connected:", socket?.id);
    });

    socket.on("connect_error", (err: any) => {
      // console.error(" Socket connect_error:", err);
    });

    socket.on("disconnect", (reason: any) => {
      // console.log(" client socket disconnected", reason);
    });

    socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      channel.unbind("notification", handler);
      pusherClient.unsubscribe(`user-${user.userId}`);
    };
  }, [user?.userId]);
  return process.env.NODE_ENV === "production" ? pusherNotif : notification;
}
