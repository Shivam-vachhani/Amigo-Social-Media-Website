"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logOutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("authToken");
  cookieStore.delete("refreshToken");
  redirect("/login");
}
