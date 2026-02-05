import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(req: Response) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User is missing",
        },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { reciverId: userId },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ read: "asc" }, { createdAt: "desc" }],
    });

    if (!notifications) {
      return NextResponse.json(
        {
          success: false,
          message: "There is no new Notification",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "something went wrong",
    });
  }
}

export async function POST(req: Response) {
  try {
    const body = await req.json();
    const { notifId } = body;
    if (!notifId) {
      return NextResponse.json(
        { success: false, message: "notifId is missing" },
        { status: 401 }
      );
    }
    const notification = await prisma.notification.update({
      where: { id: notifId },
      data: {
        read: true,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "can't update notification status" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {}
}
