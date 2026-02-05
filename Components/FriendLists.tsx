"use client";

import { useAuth } from "@/app/context/authContext";
import { getAllFriends } from "@/lib/apiCalls";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";

const FriendLists = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { data: friends, isLoading } = useQuery({
    queryKey: ["AllMyFriends", user?.userId],
    queryFn: () => getAllFriends(user?.userId as string),
    enabled: !!user?.userId,
  });

  return (
    <div className=" bg-blue-100 h-full w-[30%] overflow-y-auto">
      <h2 className=" m-5 text-3xl font-semibold">Your Friends</h2>
      {friends?.map((friend: any) => {
        return (
          <div
            key={friend.id}
            className=" bg-white m-3 p-5 rounded-2xl flex space-x-4 items-center hover:cursor-pointer hover:bg-gray-50"
            onClick={() => router.push(`/Chats/${friend.id}`)}
          >
            <div className=" w-15 h-15 overflow-hidden flex items-center justify-center rounded-full">
              <Image
                src={friend.avatarUrl || "/defaultAvatar.png"}
                alt="userImage"
                height={40}
                width={40}
                quality={100}
                className="rounded-full w-full h-full "
              />
            </div>
            <div>
              <p className="text-xl font-semibold">{friend.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FriendLists;
