import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Response) {
  try {
    const body = await req.json();
    const { reqId, notifId } = body;
    if (!reqId) {
      return NextResponse.json({
        success: false,
        message: "reqId is missing ",
      });
    }

    const updatedReq = await prisma.friendReq.update({
      where: { id: reqId },
      data: {
        status: "ACCEPTED",
      },
    });

    const notifiUpdate = await prisma.notification.update({
      where: { id: notifId },
      data: {
        status: "ACCEPTED",
        message: "is now your friend",
      },
    });

    if (!updatedReq && !notifiUpdate) {
      return NextResponse.json(
        {
          success: false,
          message: "friend req status not updated",
        },
        { status: 401 },
      );
    }

    const userA = updatedReq.senderId;
    const userB = updatedReq.reciverId;

    const [u1, u2] = userA < userB ? [userA, userB] : [userB, userA];

    const createFriendShip = await prisma.frendship.create({
      data: {
        user1Id: u1,
        user2Id: u2,
      },
    });

    if (!createFriendShip) {
      return NextResponse.json(
        {
          success: false,
          message: "friendship is not created",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedReq,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Somthing went wrong in updating friend req",
    });
  }
}
