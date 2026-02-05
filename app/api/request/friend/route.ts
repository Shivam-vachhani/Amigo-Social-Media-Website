import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Response) {
  try {
    const body = await req.json();
    const { reciverId, senderId } = body;
    if (!reciverId && !senderId) {
      return NextResponse.json(
        {
          success: false,
          message: "please provide importent ids",
        },
        { status: 401 },
      );
    }

    const isExist = await prisma.friendReq.findUnique({
      where: {
        senderId_reciverId: {
          senderId: senderId,
          reciverId: reciverId,
        },
      },
    });

    if (isExist) {
      return NextResponse.json({
        success: false,
        message: "You already send req",
      });
    }

    const createReq = await prisma.friendReq.create({
      data: {
        senderId: senderId,
        reciverId: reciverId,
        status: "PENDING",
      },
    });

    if (!createReq) {
      return NextResponse.json(
        {
          success: false,
          message: "can't create friend req",
        },
        { status: 401 },
      );
    }

    const notification = await prisma.notification.create({
      data: {
        reciverId: reciverId,
        senderId: senderId,
        accepted: false,
        type: "FRIEND-REQUEST",
        message: "send a friend request",
        friendReqId: createReq.id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "can't create notification",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true, notification, req: createReq });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "somthing went wrong in sending friend req",
    });
  }
}

export async function GET(req: Response) {
  try {
    const { searchParams } = new URL(req.url);
    const reciverId = searchParams.get("reciverId");
    const senderId = searchParams.get("senderId");

    if (!senderId || !reciverId) {
      return NextResponse.json(
        { success: false, message: "Missing some fileds" },
        { status: 401 },
      );
    }

    const friendreq = await prisma.friendReq.findUnique({
      where: {
        senderId_reciverId: {
          senderId: senderId,
          reciverId: reciverId,
        },
      },
    });

    if (!friendreq) {
      return NextResponse.json(
        {
          success: false,
          message: "Reqeuest not created",
          data: "nodta",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Request exist",
      req: friendreq,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "somthing went wrong in checking friend req",
    });
  }
}
