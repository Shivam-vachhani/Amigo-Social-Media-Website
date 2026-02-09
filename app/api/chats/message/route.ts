import prisma from "@/lib/prisma";
import { pusher } from "@/lib/pusher-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, senderId, reciverId, convoId } = body.data;

    if (!message || !senderId || !reciverId) {
      return NextResponse.json(
        {
          success: false,
          message: "Some fileds are missing in sending message",
        },
        { status: 401 },
      );
    }

    let convo;
    if (convoId) {
      convo = await prisma.conversation.update({
        where: {
          id: convoId,
        },
        data: {
          lastMessage: message,
        },
      });
    } else {
      convo = await prisma.conversation.create({
        data: {
          participants: [senderId, reciverId],
          lastMessage: message,
        },
      });
    }

    if (!convo) {
      return NextResponse.json(
        {
          success: false,
          message: "Can't get convertsation",
        },
        { status: 401 },
      );
    }

    const createMessage = await prisma.message.create({
      data: {
        conversationId: convo.id,
        senderId: senderId,
        text: message,
        mediaType: "TEXT",
      },
      include: {
        sender: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!createMessage) {
      return NextResponse.json(
        {
          success: false,
          message: "Can't save your message",
        },
        { status: 401 },
      );
    }

    const payload = {
      MessageText: message,
      senderId: senderId,
      convoId: convo.id,
      senderName: createMessage.sender.name,
      senderAvtar: createMessage.sender.avatarUrl,
    };

    await pusher.trigger(`user-${reciverId}`, "chatMessage", payload);

    return NextResponse.json({
      success: true,
      message: "Successfully send",
      convoId: convo.id,
      senderName: createMessage.sender.name,
      senderAvatar: createMessage.sender.avatarUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Somthing went wrong in sending message",
      },
      { status: 401 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const senderId = searchParams.get("senderId");
    const reciverId = searchParams.get("reciverId");

    if (!reciverId || !senderId) {
      return NextResponse.json(
        {
          success: false,
          message: "ids is missing",
        },
        { status: 401 },
      );
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { has: senderId } },
          { participants: { has: reciverId } },
        ],
      },
    });

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          message: "there are no convertation",
        },
        { status: 401 },
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversation.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!messages) {
      return NextResponse.json(
        {
          success: false,
          message: "there are no messages on this convertation",
        },
        { status: 300 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully get all messages",
      messages: messages,
      convoId: conversation.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Somthing went wrong in getting all messages",
      },
      { status: 401 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { convoId, senderId, reciverId } = body;

    if (!convoId) {
      return NextResponse.json(
        {
          success: false,
          message: "payload is missing",
        },
        { status: 401 },
      );
    }

    const messages = await prisma.message.updateMany({
      where: {
        AND: [{ conversationId: convoId }, { senderId: senderId }],
      },
      data: {
        seenBy: [reciverId],
      },
    });

    if (!messages) {
      return NextResponse.json(
        {
          success: false,
          message: "Can't update messages",
        },
        { status: 401 },
      );
    }

    const payload = {
      ownerId: reciverId,
      senderId: senderId,
    };

    await pusher.trigger(`user-${senderId}`, "changeMsgSeen", payload);

    return NextResponse.json({
      success: true,
      message: "Successfully Update messages",
      data: messages,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Somthing went wrong in set seen by user api",
      },
      { status: 401 },
    );
  }
}
