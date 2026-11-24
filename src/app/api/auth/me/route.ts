import { NextResponse } from "next/server";
import { isAdminConfigured, isAuthenticated } from "@/lib/auth";
import { getContentStore } from "@/lib/content";

export async function GET() {
  const authenticated = await isAuthenticated();
  return NextResponse.json({
    authenticated,
    configured: isAdminConfigured(),
    storageMode: getContentStore().mode,
  });
}
