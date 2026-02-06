import FriendLists from "@/Components/FriendLists";
import React from "react";

export default function ChatsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Friend List Sidebar */}
      <FriendLists />

      {/* Chat Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  );
}
