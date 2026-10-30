// ---------------------------------------------------------------
// Server-side helpers used ONLY inside API route handlers.
// They make every API answer look the same:
//   { "success": true,  "data": ... }
//   { "success": false, "error": "message" }
// ---------------------------------------------------------------
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export function fail(error: string, status = 400) {
  return NextResponse.json<ApiResponse<never>>({ success: false, error }, { status });
}
