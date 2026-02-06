import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({});
    if (!users) {
      return NextResponse.json(
        {
          success: false,
          message: "somthing went wrong in getting all users",
        },
        { status: 401 }
      );
    }
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "somthing went wrong in getting all users",
    });
  }
}
