import { getUserFromToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "can't find authToken",
      },
      { status: 401 }
    );
  }
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "can get user data" },
      { status: 401 }
    );
  }

  return NextResponse.json(user);
}
