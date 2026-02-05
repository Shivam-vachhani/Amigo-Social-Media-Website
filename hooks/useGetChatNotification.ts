"use client";

import { getSocket } from "@/lib/socket-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useGetChatNotification() {
  const [chatNotif, setChatNotif] = useState();
  const socket = getSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = (data: any) => {
      setChatNotif(data);
      queryClient.invalidateQueries({ queryKey: ["Chats"] });
    };

    const ChatSeenHandler = (data: any) => {
      // queryClient.setQueryData(["Chats", data.ownerId], (old: any) => {
      //   if (!old) return old;

      //   return {
      //     ...old,
      //     messages: old.messages.map((msg: any) => ({
      //       ...msg,
      //       seenBy: [data.ownerId],
      //     })),
      //   };
      // });
      queryClient.invalidateQueries({ queryKey: ["Chats"] });
    };

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
    };
  }, []);
  return chatNotif;
}
