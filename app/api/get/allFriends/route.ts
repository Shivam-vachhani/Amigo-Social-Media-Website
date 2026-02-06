import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "userId missing" },
      { status: 401 },
    );
  }

  const friends = await prisma.frendship.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
  });

  if (!friends) {
    return NextResponse.json(
      { success: false, message: "You don't have any friends" },
      { status: 401 },
    );
  }

  const friendList = friends.map((fr) =>
    fr.user1Id === userId ? fr.user2Id : fr.user1Id,
  );

  const FriendListData = await prisma.user.findMany({
    where: {
      id: { in: friendList },
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  });

  if (!FriendListData) {
    return NextResponse.json(
      { success: false, message: "Can't find your friends data" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    success: true,
    friendList: FriendListData,
  });
}
