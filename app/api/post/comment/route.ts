import prisma from "@/lib/prisma";
import { pusher } from "@/lib/pusher-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, comment, userId } = body;

    const newComment = await prisma.comment.create({
      data: {
        postId: postId,
        comment: comment,
        commenterId: userId,
      },
      include: {
        post: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!newComment) {
      return NextResponse.json({
        success: false,
        message: "Catn't post your comment",
      });
    }

    const notification = await prisma.notification.create({
      data: {
        reciverId: newComment.post.ownerId,
        senderId: newComment.commenterId,
        postId: postId,
        type: "COMMENTE",
        message: "Commented on your post",
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
        message: "Catn't create notification on comment",
      });
    }

    const payload = {
      type: "COMMENT",
      message: "Commented on your post",
      senderId: userId,
      senderName: notification.sender.name,
      id: notification.id,
    };

    await pusher.trigger(
      `user-${newComment.post.ownerId}`,
      "notification",
      payload,
    );

    return NextResponse.json({
      success: true,
      message: "successfully posted your comment",
      comment: newComment,
      notification: notification,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "somthing went wrong in post your comment",
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    let comments;

    if (postId) {
      comments = await prisma.comment.findMany({
        where: { postId: postId },
      });
    }

    if (!comments) {
      return NextResponse.json({
        success: true,
        message: "There is no comment for this post yet",
      });
    }

    return NextResponse.json({
      success: true,
      comments: comments,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "somthing went wrong in getting this post's comment",
    });
  }
}
