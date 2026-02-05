"use client";

import { getSocket } from "@/lib/socket-client";
import { useEffect, useRef } from "react";
import { useAuth } from "../app/context/authContext";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const connected = useRef(false);
  useEffect(() => {
    if (!user?.userId || connected.current) return;
    const socket = getSocket();
    socket.connect();

    const onConnect = () => {
      console.log("socket connected from provider", { id: socket.id });
      console.log("emitting join ->", `user:${user.userId}`);
      socket.emit("join", user.userId);
    };

    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);

    connected.current = true;

    return () => {
      socket.disconnect();
      connected.current = false;
    };
  }, [user?.userId]);

  return <>{children}</>;
}
