"use client";

import { useAuth } from "@/app/context/authContext";
import { pusherClient } from "@/lib/pusher-client";
import { getSocket } from "@/lib/socket-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useGetChatNotification() {
  const [chatNotif, setChatNotif] = useState();
  const [pusherChatNotif, setPusherChatNotif] = useState();
  const { user } = useAuth();
  const socket = getSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = pusherClient.subscribe(`user-${user.userId}`);

    const handler = (data: any) => {
      setChatNotif(data);
      setPusherChatNotif(data);
      queryClient.invalidateQueries({ queryKey: ["Chats"] });
      console.log("====================================");
      console.log("ChatNotif---->", data);
      console.log("====================================");
    };

    channel.bind("chatMessage", handler);

    const ChatSeenHandler = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["Chats"] });
      console.log("====================================");
      console.log("ChatSeen---->", data);
      console.log("====================================");
    };

    channel.bind("changeMsgSeen", ChatSeenHandler);

    socket.on("connect", () => {
      console.log("Socket connected from chat hook:", socket?.id);
    });
    socket.on("connect_error", (err: any) => {
      console.error(" Socket connect_error:", err);
    });
    socket.on("disconnect", (reason: any) => {
      console.log(" client socket disconnected", reason);
    });

    socket.on("chatMessage", handler);

    socket.on("changeMsgSeen", ChatSeenHandler);

    return () => {
      socket.off("chatMessage", handler);
      socket.off("changeMsgSeen", ChatSeenHandler);
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      channel.unbind("chatMessage", handler);
      channel.unbind("changeMsgSeen", ChatSeenHandler);
      pusherClient.unsubscribe(`user-${user.userId}`);
    };
  }, []);
  return process.env.NODE_ENV === "development" ? pusherChatNotif : chatNotif;
}
