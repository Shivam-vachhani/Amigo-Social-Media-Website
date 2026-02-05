import prisma from "@/lib/prisma";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    console.log("❌ No refresh token found in cookies");
    return NextResponse.json({
      success: false,
      message: "Can't find refresh token",
    });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = (await jwtVerify(refreshToken, secret)) as {
      payload: { userId: string };
    };
    const { userId } = payload;
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    });

    if (!userData) {
      return NextResponse.json({
        success: false,
        message: "Can't find user",
      });
    }

    const newAccessToken = await new SignJWT({
      userId: userId,
      name: userData.name,
      email: userData.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .setIssuedAt()
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    (await cookies()).set("authToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
    console.log("🔄 Refresh token endpoint called");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "somthing went worng in refreshing token",
    });
  }
}
