import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { ACCESS_CODE_PREFIX, ModelProvider } from "@/app/constant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { getServerSideConfig } from "@/app/config/server";

import { LangchainConfig } from "@/app/api/langchain/config";
import { getEmbeddings } from "@/app/api/langchain/embeddings";
import { MyScaleStore } from "@langchain/community/vectorstores/myscale";

interface RequestBody {
	sessionId: string;
	query: string;
	baseUrl?: string;
}

async function handle(req: NextRequest) {
	if (req.method === "OPTIONS") {
		return NextResponse.json({ body: "OK" }, { status: 200 });
	}
	try {
		const authResult = auth(req, ModelProvider.GPT);
		if (authResult.error) {
			return NextResponse.json(authResult, {
				status: 401,
			});
		}

		const reqBody: RequestBody = await req.json();
		console.log("reqBody", reqBody);
		const authToken = req.headers.get("Authorization") ?? "";
		const token = authToken.trim().replaceAll("Bearer ", "").trim();
		const serverConfig = getServerSideConfig();
		// const pinecone = new Pinecone();
		// const pineconeIndex = pinecone.Index(serverConfig.pineconeIndex!);
		const apiKey = LangchainConfig.getOpenAIApiKey(token);
		const baseUrl = LangchainConfig.getOpenAIBaseUrl(reqBody.baseUrl);
		const embeddings = getEmbeddings(apiKey, baseUrl);

		// const results = await vectorStore.similaritySearch(reqBody.query, 4, {
		//   sessionId: reqBody.sessionId,
		// });
		const vectorStore = await MyScaleStore.fromExistingIndex(embeddings, {
			host: process.env.MYSCALE_HOST || "",
			port: process.env.MYSCALE_PORT || "",
			username: process.env.MYSCALE_USERNAME || "",
			password: process.env.MYSCALE_PASSWORD || "",
			database: process.env.MYSCALE_DATABASE || "default",
			// table: reqBody.sessionId,
		});

		const returnCount = LangchainConfig.getRagConfig().returnCount;
		const response = await vectorStore.similaritySearch(
			reqBody.query,
			returnCount,
			{
				whereStr: `metadata.sessionId = ${reqBody.sessionId}`,
			},
		);
		console.log("response", response);

		return NextResponse.json(response, {
			status: 200,
		});
	} catch (e) {
		console.error(e);
		return new Response(JSON.stringify({ error: (e as any).message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

export const POST = handle;
export { POST as GET, POST as PUT, POST as DELETE };

export const runtime = "nodejs";
export const preferredRegion = [
	"arn1",
	"bom1",
	"cdg1",
	"cle1",
	"cpt1",
	"dub1",
	"fra1",
	"gru1",
	"hnd1",
	"iad1",
	"icn1",
	"kix1",
	"lhr1",
	"pdx1",
	"sfo1",
	"sin1",
	"syd1",
];
