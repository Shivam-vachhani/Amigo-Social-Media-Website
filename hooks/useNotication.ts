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
    };

    channel.bind("notification", handler);

    socket.on("connect", () => {

    });

    socket.on("connect_error", (err: any) => {

    });

    socket.on("disconnect", (reason: any) => {
 
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
