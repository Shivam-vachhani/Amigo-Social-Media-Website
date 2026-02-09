"use client";

import { redirect } from "next/navigation";
import { useAuth } from "./context/authContext";
import { useGetChatNotification } from "@/hooks/useGetChatNotification";

export default function Home() {
  const { isLoading } = useAuth();
  useGetChatNotification();
  if (!isLoading) {
    redirect("/allposts");
  }

  return null;
}
