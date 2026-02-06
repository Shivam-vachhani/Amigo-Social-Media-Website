import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, senderId } = body;

    if (!senderId) {
      return NextResponse.json({
        succcess: false,
        message: "Plese provide user's id",
      });
    }

    if (!id) {
      return NextResponse.json({
        succcess: false,
        message: "Plese provide post id ",
      });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        likerId_postId: {
          likerId: senderId,
          postId: id,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          likerId_postId: {
            likerId: senderId,
            postId: id,
          },
        },
      });

      await prisma.notification.delete({
        where: {
          senderId_postId_type: {
            type: "LIKE",
            postId: id,
            senderId: senderId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Successfully unliked",
        unliked: true,
      });
    }

    const res = await prisma.like.create({
      data: {
        likerId: senderId,
        postId: id,
      },
      include: {
        post: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!res) {
      return NextResponse.json({
        success: false,
        message: "can't update post",
      });
    }

    const notification = await prisma.notification.create({
      data: {
        reciverId: res.post.ownerId,
        senderId,
        postId: id,
        type: "LIKE",
        message: "liked your post",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!notification) {
      return NextResponse.json({
        success: false,
        message: "can't created notification",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully updated",
      post: res,
      notificationId: notification.id,
      postOwnerID: res.post.ownerId,
      senderName: notification.sender.name,
      senderId: notification.sender.id,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Somthing went wrong in liking post",
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({
        succcess: false,
        message: "Plese provide postId ",
      });
    }

    const likes = await prisma.like.findMany({
      where: {
        postId: postId,
      },
    });

    if (!likes) {
      return NextResponse.json({
        success: false,
        message: "there is no likes in this post",
      });
    }

    return NextResponse.json({
      success: true,
      likes: likes,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Somthing went wrong in getting liking post",
    });
  }
}
