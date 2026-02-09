"use client";
import { useGetChatNotification } from "@/hooks/useGetChatNotification";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const ChatNotificationPopUp = () => {
  const chatNotificationData: any = useGetChatNotification();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (chatNotificationData) {
      // Reset states when new notification arrives
      setShouldRender(true);
      setIsVisible(false);
      // Trigger slide-in animation after a brief delay
      const slideInTimer = setTimeout(() => {
        setIsVisible(true);
      }, 100);

      // Auto-dismiss after 5 seconds
      const autoDismissTimer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => {
        clearTimeout(slideInTimer);
        clearTimeout(autoDismissTimer);
      };
    }
  }, [chatNotificationData]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      setShouldRender(false);
    }, 300);
  };

  const handleClick = () => {
    router.push(`/Chats/${chatNotificationData.senderId}`);
    handleClose();
  };

  if (!chatNotificationData || !shouldRender) {
    return null;
  }

  return (
    <div
      className={`
        fixed w-[320px] bottom-10 right-10 bg-white shadow-2xl border border-gray-200 
        flex space-x-4 p-4 pr-8 z-50 justify-start hover:cursor-pointer rounded-lg
        transition-all duration-300 ease-in-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-[400px] opacity-0"}
      `}
      onClick={handleClick}
    >
      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
        aria-label="Close notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Avatar */}
      <div className="flex-shrink-0">
        <Image
          src={chatNotificationData?.senderAvtar || "/defaultAvatar.png"}
          alt={chatNotificationData?.senderName || "userlogo"}
          width={60}
          height={60}
          quality={100}
          className="rounded-full"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col w-[calc(100%-76px)]">
        <p className="text-[18px] font-semibold truncate">
          {chatNotificationData?.senderName}
        </p>
        <p className="text-sm text-gray-700 line-clamp-2">
          Send a message: {chatNotificationData?.MessageText}...
        </p>
      </div>
    </div>
  );
};

export default ChatNotificationPopUp;
