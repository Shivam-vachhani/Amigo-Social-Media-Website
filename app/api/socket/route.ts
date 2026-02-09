import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

let initialized = false;
export async function GET() {
  if (!initialized) {
    //@ts-ignore
    const server = (global as any).server;
    if (server) {
      initialized = true;
      logger.log("Socket initialized");
    }
  }

  return NextResponse.json({ ok: true });
}
