import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, currentPassword, newPassword } = body;
    if (!userId && !currentPassword && !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Some data is missing",
        },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Can't find user",
        },
        { status: 401 },
      );
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user?.password,
    );
    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect Password",
        },
        { status: 401 },
      );
    }

    const newHashedPassword = await bcrypt.hash(body.newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Password Can't be Updated",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully Updated",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "somthing went wrong in updating password",
    });
  }
}
