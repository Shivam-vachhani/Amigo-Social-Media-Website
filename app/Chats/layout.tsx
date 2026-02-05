import FriendLists from "@/Components/FriendLists";
import React from "react";

export default function ChatsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <FriendLists />
      {children}
    </div>
  );
}
