import { type OpenAIListModelResponse } from "@/app/client/platforms/openai";
import { getServerSideConfig } from "@/app/config/server";
import { OpenaiPath } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../auth";
import { requestMidjourney } from "../../common";

async function handle(
	req: NextRequest,
	{ params }: { params: { path: string[] } },
) {
	console.log("[OpenAI Route] params ", params);

	if (req.method === "OPTIONS") {
		return NextResponse.json({ body: "OK" }, { status: 200 });
	}

	const subpath = params.path.join("/");

	const authResult = await auth(req);
	if (authResult.error) {
		return NextResponse.json(authResult, {
			status: 401,
		});
	}

	try {
		const response = await requestMidjourney(req);

		// list models
		if (subpath === OpenaiPath.ListModelPath && response.status === 200) {
		}

		return response;
	} catch (e) {
		console.error("[OpenAI] ", e);
		return NextResponse.json(prettyObject(e));
	}
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
