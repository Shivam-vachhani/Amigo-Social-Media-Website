"use client";

import { redirect } from "next/navigation";
import { useAuth } from "./context/authContext";

export default function Home() {
  const { isLoading } = useAuth();

  if (!isLoading) {
    redirect("/allposts");
  }

  return null;
}
