"use client";

import { useAuth } from "@/app/context/authContext";
import { pusherClient } from "@/lib/pusher-client";
import { getSocket } from "@/lib/socket-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useGetChatNotification() {
  const [chatNotif, setChatNotif] = useState<any>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isProd = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (!user) return;

    const handler = (data: any) => {
      setChatNotif(data);
      queryClient.invalidateQueries({ queryKey: ["Chats"] });
    };

    const seenHandler = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["Chats"] });
    };

    // 🔥 PRODUCTION → PUSHER
    if (isProd) {
      const channel = pusherClient.subscribe(`user-${user.userId}`);

      channel.bind("chatMessage", handler);
      channel.bind("changeMsgSeen", seenHandler);

      return () => {
        channel.unbind("chatMessage", handler);
        channel.unbind("changeMsgSeen", seenHandler);
        pusherClient.unsubscribe(`user-${user.userId}`);
      };
    }

    // 🔥 DEVELOPMENT → SOCKET.IO
    const socket = getSocket();

    socket.on("chatMessage", handler);
    socket.on("changeMsgSeen", seenHandler);

    return () => {
      socket.off("chatMessage", handler);
      socket.off("changeMsgSeen", seenHandler);
    };
  }, [user, isProd, queryClient]);

  return chatNotif;
}
