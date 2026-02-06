import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  const body = await req.json();

  let res;
  const user = await prisma.user.findUnique({
    where: { email: body.email.trim().toLowerCase() },
  });

  if (!user) {
    return NextResponse.json({
      success: false,
      message: "User not exists check your email",
      field: "email",
    });
  }

  const isPasswordCorrect = await bcrypt.compare(body.password, user?.password);
  if (!isPasswordCorrect) {
    return NextResponse.json({
      success: false,
      message: "Incorrect Password",
      field: "password",
    });
  }

  if (isPasswordCorrect) {
    const { accesstoken, refreshToken } = await createTokens(
      user?.id,
      user?.email,
      user?.name,
      user?.avatarUrl as string,
    );

    const updatedUser = await prisma.user.update({
      where: { id: user?.id },
      data: { refreshToken: refreshToken },
    });

    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        message: "can't update user",
      });
    }

    res = NextResponse.json({
      success: true,
      message: "user is exists",
      token: accesstoken,
    });

    res?.cookies.set("authToken", accesstoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
    res?.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return res;
}

const createTokens = async (
  id: string,
  email: string,
  name: string,
  avatarUrl: string,
) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const refreshToken = await new SignJWT({ userId: id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secret);

  const accesstoken = await new SignJWT({
    userId: id,
    email: email,
    name: name,
    avatarUrl: avatarUrl,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .setIssuedAt()
    .sign(secret);

  return { accesstoken, refreshToken };
};
