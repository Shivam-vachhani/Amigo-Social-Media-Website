"use client";
import { useAuth } from "@/app/context/authContext";
import { useGetChatNotification } from "@/hooks/useGetChatNotification";
import {
  getAllMessages,
  GetUserData,
  sendMessage,
  UpdateMsgSeen,
} from "@/lib/apiCalls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCheck, User } from "lucide-react";

const ChatWindow = () => {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string>("");
  useGetChatNotification();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["friendProfile", id],
    queryFn: () => GetUserData(id),
  });

  const { data: Chats, isLoading: loadingChats } = useQuery({
    queryKey: ["Chats", id],
    queryFn: () =>
      getAllMessages({ senderId: user?.userId as string, reciverId: id }),
    enabled: !!user?.userId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Chats", id] });
      setMessage("");
    },
  });

  const UpdateMessageStatus = useMutation({
    mutationFn: UpdateMsgSeen,
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["Chats", id] });
    },
  });

  const handelSendMsg = () => {
    console.log(Chats?.convoId);

    sendMessageMutation.mutate({
      message: message,
      senderId: user?.userId as string,
      reciverId: id,
      convoId: Chats?.convoId,
    });
  };

  useEffect(() => {
    if (Chats && user) {
      UpdateMessageStatus.mutate({
        convoId: Chats?.convoId,
        senderId: id,
        reciverId: user?.userId as string,
      });
    }
  }, [Chats]);

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Header - Fixed */}
      <div className="flex-none flex space-x-3 h-20 shadow-sm p-3 items-center bg-white mb-1 ">
        <div className="w-12 h-12 overflow-hidden rounded-full">
          <Image
            src={profile?.avatarUrl || "/defaultAvatar.png"}
            alt="userPhoto"
            width={80}
            height={80}
            quality={100}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="font-semibold text-gray-600"> {profile?.name}</div>
        <div></div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar">
        <div className="flex flex-col space-y-3">
          {Chats &&
            Chats?.messages?.map((msg: any) => {
              return msg.senderId === user?.userId ? (
                <div key={msg.id} className="flex justify-end ">
                  <div className="px-5 py-2 flex shadow-lg rounded-xl bg-blue-500 text-white max-w-[70%] break-words relative">
                    <p>{msg.text}</p>
                    <CheckCheck
                      size={10}
                      color={`${msg?.seenBy[0] === id ? "black" : "white"}`}
                      className=" absolute bottom-1 right-1"
                    />
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex justify-start">
                  <div className="px-5 py-2  shadow-lg rounded-xl bg-white max-w-[70%] break-words relative">
                    {msg.text}
                  </div>
                </div>
              );
            })}
          {!Chats?.messages?.length && (
            <div className="flex justify-center items-center h-full text-gray-600">
              No messages yet...
            </div>
          )}
        </div>
      </div>

      {/* Input Bar - Fixed at Bottom */}
      <div className="flex-none p-4 w-full bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Enter text"
            className="flex-1 p-3 border rounded-2xl outline-none w-full bg-gray-50"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="px-4 py-2 rounded-xl bg-blue-500 text-white"
            onClick={() => handelSendMsg()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
