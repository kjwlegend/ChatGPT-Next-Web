import { NextRequest, NextResponse } from "next/server";

function handle(req: NextRequest) {
	return NextResponse.json({ body: "OK" }, { status: 200 });
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
