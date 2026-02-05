export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: NextResponse) {
  const body = await req.json();
  const hashPassword = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashPassword,
      refreshToken: "",
    },
  });

  if (!user) {
    return NextResponse.json({ success: false, message: "Can't created user" });
  }

  const res = NextResponse.json({
    success: true,
    message: "Successfully user Created......",
  });

  return res;
}
