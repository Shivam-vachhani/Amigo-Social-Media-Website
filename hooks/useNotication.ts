"use client";
import { getSocket } from "@/lib/socket-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useNotifications() {
  const [notification, setNotications] = useState<any[]>([]);
  const socket = getSocket();
  const queryClient = useQueryClient();
  useEffect(() => {
    const handler = (data: any) => {
      setNotications((prev) => [data, ...prev]);
      queryClient.invalidateQueries({ queryKey: ["notifiction"] });
    };

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
    };
  }, []);
  return notification;
}
