import { NextResponse } from "next/server";

export function authErrorStatus(message: string): number {
  if (
    message === "Unauthorized." ||
    message === "Missing or invalid Authorization header." ||
    message === "Missing access token."
  ) {
    return 401;
  }
  if (message === "Forbidden." || message === "Admin profile not found.") {
    return 403;
  }
  return 500;
}

export function jsonError(message: string, status?: number) {
  return NextResponse.json(
    { error: message },
    { status: status ?? authErrorStatus(message) }
  );
}
