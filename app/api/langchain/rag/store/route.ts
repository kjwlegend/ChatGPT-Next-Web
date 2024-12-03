import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth";
import { ACCESS_CODE_PREFIX, ModelProvider } from "@/app/constant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import {
	JSONLoader,
	JSONLinesLoader,
} from "langchain/document_loaders/fs/json";
// import { PPTXLoader } from "langchain/document_loaders/fs/pptx";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { getServerSideConfig } from "@/app/config/server";
import { FileInfo } from "@/app/client/platforms/utils";
import mime from "mime";

import { getEmbeddings } from "@/app/api/langchain/embeddings";
import { LangchainConfig } from "@/app/api/langchain/config";

import { MyScaleStore } from "@langchain/community/vectorstores/myscale";
import AliOSS from "@/app/utils/alioss";

interface RequestBody {
	sessionId: string;
	fileInfos: FileInfo[];
	userinfo?: string;
	baseUrl?: string;
}

function getLoader(
	fileName: string,
	fileBlob: Blob,
	openaiApiKey: string,
	openaiBaseUrl: string,
) {
	const extension = fileName.split(".").pop();
	switch (extension) {
		case "txt":
		case "md":
			return new TextLoader(fileBlob);
		case "pdf":
			return new PDFLoader(fileBlob);
		case "docx":
			return new DocxLoader(fileBlob);
		case "csv":
			return new CSVLoader(fileBlob);
		case "json":
			return new JSONLoader(fileBlob);
		// case 'pptx':
		//   return new PPTXLoader(fileBlob);

		default:
			throw new Error(`Unsupported file type: ${extension}`);
	}
}

async function handle(req: NextRequest) {
	if (req.method === "OPTIONS") {
		return NextResponse.json({ body: "OK" }, { status: 200 });
	}
	try {
		const authResult = await auth(req);
		if (authResult.error) {
			return NextResponse.json(authResult, {
				status: 401,
			});
		}

		const reqBody: RequestBody = await req.json();
		const authToken = req.headers.get("Authorization") ?? "";
		const token = authToken.trim().replaceAll("Bearer ", "").trim();
		const apiKey = LangchainConfig.getOpenAIApiKey(token);
		const baseUrl = LangchainConfig.getOpenAIBaseUrl(reqBody.baseUrl);
		const serverConfig = getServerSideConfig();

		const embeddings = getEmbeddings(apiKey, baseUrl);

		// process files
		for (let i = 0; i < reqBody.fileInfos.length; i++) {
			const fileInfo = reqBody.fileInfos[i];
			const contentType = mime.getType(fileInfo.fileName);
			// get file buffer
			var fileBuffer: Buffer | undefined;

			const file = await AliOSS.get(fileInfo.fileName);
			if (file && file.content) {
				fileBuffer = Buffer.from(file.content);
			}
			if (!fileBuffer || !contentType) {
				console.error(`get ${fileInfo.fileName} buffer fail`);
				continue;
			}
			// load file to docs
			const fileBlob = bufferToBlob(fileBuffer, contentType);
			const loader = getLoader(fileInfo.fileName, fileBlob, apiKey, baseUrl);
			const docs = await loader.load();
			// modify doc meta
			docs.forEach((doc) => {
				doc.metadata = {
					...doc.metadata,
					sessionId: reqBody.sessionId,
					userinfo: reqBody.userinfo,
					sourceFileName: fileInfo.originalFilename,
					fileName: fileInfo.fileName,
				};
			});
			console.log("docs", docs);
			const chunkSize = serverConfig.ragChunkSize
				? parseInt(serverConfig.ragChunkSize, 10)
				: 2000;
			const chunkOverlap = serverConfig.ragChunkOverlap
				? parseInt(serverConfig.ragChunkOverlap, 10)
				: 200;
			const textSplitter = new RecursiveCharacterTextSplitter({
				chunkSize: chunkSize,
				chunkOverlap: chunkOverlap,
			});
			const splits = await textSplitter.splitDocuments(docs);
			console.log("splits", splits);

			// Ensure metadata is included when storing in MyScale
			const vectorStore = await MyScaleStore.fromDocuments(splits, embeddings, {
				host: process.env.MYSCALE_HOST || "",
				port: process.env.MYSCALE_PORT || "",
				username: process.env.MYSCALE_USERNAME || "",
				password: process.env.MYSCALE_PASSWORD || "",
				database: process.env.MYSCALE_DATABASE || "default",
				// table: reqBody.sessionId,
			});
		}
		return NextResponse.json(
			{
				sessionId: reqBody.sessionId,
			},
			{
				status: 200,
			},
		);
	} catch (e) {
		console.error(e);
		return new Response(JSON.stringify({ error: (e as any).message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

function bufferToBlob(buffer: Buffer, mimeType?: string): Blob {
	const arrayBuffer: ArrayBuffer = buffer.buffer.slice(
		buffer.byteOffset,
		buffer.byteOffset + buffer.byteLength,
	);
	return new Blob([arrayBuffer], { type: mimeType || "" });
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
