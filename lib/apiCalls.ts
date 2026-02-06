
import { Comment } from "@/app/(dashboard)/allposts/page";
import { api } from "./axios";
import { getSocket } from "./socket-client";
import axios from "axios";

export async function getUserPosts(id: string) {
  try {
    const response = await api.get("/post", { params: { id } });

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updatePost(data: FormData) {
  try {
    const response = await api.put("/post", data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deletePost(id: string) {
  try {
    const response = await api.delete("/post", { params: { id } });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function postComment(comment: Comment) {
  try {
    const socket = getSocket();
    const res = await api.post("/post/comment", comment, {
      withCredentials: true,
    });
    if (res.data.success) {
      socket.emit("notification", {
        toUserId: res.data.notification.reciverId,
        type: "COMMENT",
        message: "Commented on your post",
        senderId: res.data.notification.senderId,
        senderName: res.data.notification.sender.name,
        id: res.data.notification.id,
      });
    }

    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getPostComments(id: string) {
  try {
    const res = await api.get("/post/comment", {
      params: { id },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function addLike({
  id,
  senderId,
}: {
  id: string;
  senderId: string;
}) {
  try {
    const socket = getSocket();
    const res = await api.post("/post/like", { id, senderId });
    if (res.data.postOwnerID) {
      socket.emit("notification", {
        toUserId: res.data.postOwnerID,
        type: "LIKE",
        message: "liked your post",
        senderName: res.data.senderName,
        senderId: res.data.senderId,
        id: res.data.notificationId,
      });
    } else if (res.data.unliked) {
      socket.emit("delete-notification", {
        toUserId: res.data.postOwnerID,
        notificationId: res.data.notificationDeleted,
      });
    }
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getAllNotification(userId: string) {
  try {
    const res = await api.get("/post/notification", {
      params: { userId },
    });

    return res.data.data;
  } catch (error) {
    throw error;
  }
}

export async function readNotification(notifId: string) {
  try {
    const res = await api.post("/post/notification", { notifId });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function createFriendNotif({
  reciverId,
  senderId,
}: {
  reciverId: string;
  senderId: string;
}) {
  try {
    const socket = getSocket();
    const res = await api.post("/request/friend", {
      reciverId,
      senderId,
    });
    if (res.data.success) {
      socket.emit("notification", {
        toUserId: res.data.notification.reciverId,
        type: "FRIEND-REQUEST",
        message: "send a friend request",
        senderId: res.data.notification.senderId,
        friendReqId: res.data.friendReqId,
      });
    }
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function checkFriendReq({
  reciverId,
  senderId,
}: {
  reciverId: string;
  senderId: string;
}) {
  try {
    const res = await api.get("/request/friend", {
      params: { reciverId: reciverId, senderId: senderId },
    });
    console.log(res.data.req);

    return res.data.req;
  } catch (error) {
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const res = await api.get("/get/allUsers");
    return res.data.data;
  } catch (error) {
    throw error;
  }
}

export async function acceptFriendReq({
  reqId,
  notifId,
}: {
  reqId: string;
  notifId: string;
}) {
  try {
    const res = await api.post("/request/friend/accept", {
      reqId,
      notifId,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function rejectFriendReq({
  reqId,
  notifId,
}: {
  reqId: string;
  notifId: string;
}) {
  try {
    const res = await api.post("/request/friend/reject", {
      reqId,
      notifId,
    });

    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function GetUserData(userId: string) {
  try {
    const res = await api.get("/get/userData", {
      params: { userId },
    });

    return res.data.data;
  } catch (error) {
    throw error;
  }
}

export async function updateUser(formData: FormData) {
  try {
    const res = await api.put("/get/userData", formData);
    return res.data.data;
  } catch (error) {
    throw error;
  }
}

export async function changePassword({
  userId,
  currentPassword,
  newPassword,
}: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const res = await api.post("/authMe/changePassword", {
      userId,
      currentPassword,
      newPassword,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getAllFriends(id: string) {
  try {
    const res = await api.get("/get/allFriends", {
      params: { userId: id },
    });
    return res.data.friendList;
  } catch (error) {
    throw error;
  }
}

export async function getAllMessages({
  senderId,
  reciverId,
}: {
  senderId: string;
  reciverId: string;
}) {
  try {
    const res = await api.get("/chats/message", {
      params: { senderId, reciverId },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function sendMessage({
  message,
  senderId,
  reciverId,
  convoId,
}: {
  message: string;
  senderId: string;
  reciverId: string;
  convoId: string;
}) {
  try {
    const socket = getSocket();
    const data = {
      message,
      senderId,
      reciverId,
      convoId,
    };
    const res = await api.post("/chats/message", { data });
    socket.emit("chatMessage", {
      toUserId: reciverId,
      MessageText: message,
      senderId: senderId,
      convoId: res.data.convoId,
      senderName: res.data.senderName,
      senderAvtar: res.data.senderAvatar,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function UpdateMsgSeen({
  convoId,
  senderId,
  reciverId,
}: {
  convoId: string;
  senderId: string;
  reciverId: string;
}) {
  try {
    const socket = getSocket();
    const res = await api.put("/chats/message", {
      convoId,
      senderId,
      reciverId,
    });
    console.log(res.data);
    socket.emit("changeMsgSeen", {
      ownerId: reciverId,
      senderId: senderId,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
