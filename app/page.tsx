"use client";

import PostsPage from "./allposts/page";
import { useAuth } from "./context/authContext";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return <PostsPage />;
}
