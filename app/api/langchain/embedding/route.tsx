import { NextRequest, NextResponse } from "next/server";

import { Document } from "langchain/document";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
// import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {
	JSONLoader,
	JSONLinesLoader,
} from "langchain/document_loaders/fs/json";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HtmlToTextTransformer } from "langchain/document_transformers/html_to_text";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";

const fileLoaders: { [key: string]: any } = {
	".txt": TextLoader,
	".csv": CSVLoader,
	// ".pdf": PDFLoader,
	".docx": DocxLoader,
	".json": JSONLoader,
	".jsonl": JSONLinesLoader,
};

const textSplitters: { [key: string]: any } = {
	recursive: RecursiveCharacterTextSplitter,
	character: CharacterTextSplitter,
};
// Path: app/api/langchain/embedding/route.tsx
// request body: { filePath, fileType, textSplitterType }
// response: vectorStore

async function processFile(req: NextRequest) {
	const body = await req.json();
	const { filePath, fileType, textSplitterType } = body;
	const Loader = fileLoaders[fileType];
	let loader;
	if (fileType === ".pdf") {
		loader = new Loader(filePath, {
			pdfjs: () =>
				import("pdfjs-dist/legacy/build/pdf.js").then((m) => m.default),
		});
	} else {
		loader = new Loader(filePath);
	}
	const docs = await loader.load();

	const Splitter = textSplitters[textSplitterType];
	const splitter = new Splitter({
		chunkSize: 1000,
		chunkOverlap: 100,
	});
	const splitDocs = await splitter.createDocuments(docs);

	const embeddings = new OpenAIEmbeddings();
	const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
	console.log("vectorStore", vectorStore);

	return NextResponse.json(vectorStore);
}

async function deleteDocs(req: NextRequest) {
	const body = await req.json();
	const { vectorStore, ids } = body;
	await vectorStore.delete({ ids });
	return NextResponse.json({ body: "OK" }, { status: 200 });
}

async function searchDocs(req: NextRequest) {
	const body = await req.json();
	const { vectorStore, query, numResults } = body;
	const docs = await vectorStore.similaritySearch(query, numResults);
	return NextResponse.json({ body: docs });
}

async function getDoc(req: NextRequest) {
	const body = await req.json();
	const { vectorStore, id } = body;
	const doc = await vectorStore.get(id);
	return NextResponse.json({ body: doc });
}

//  simply create a test function that returns ok
async function test(req: NextRequest) {
	return NextResponse.json({ body: "OK" }, { status: 200 });
}

// post and get
import { URL } from "url";
type RouteHandler = (req: NextRequest) => Promise<NextResponse<any>>;

const routes: { [key: string]: RouteHandler } = {
	"/api/langchain/embedding/processFile": processFile,
	"/api/langchain/embedding/deleteDocs": deleteDocs,
	"/api/langchain/embedding/searchDocs": searchDocs,
	"/api/langchain/embedding/getDoc": getDoc,
};

function handle(req: NextRequest) {
	const url = new URL(req.url);
	const handler = routes[url.pathname];
	if (handler) {
		return handler(req);
	}
	return NextResponse.next();
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
