// I want to add langchain vector database, after upload the file , we need to use openai embeding model to store this into the vector database

const loader = new TextLoader("src/document_loaders/example_data/example.txt");
const docs = await loader.load();

import { Document } from "langchain/document";

const doc = new Document({ pageContent: "foo", metadata: { source: "1" } });

import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

import { DocxLoader } from "langchain/document_loaders/fs/docx";

const loader2 = new CSVLoader(
	"src/document_loaders/example_data/example.csv",
	"text",
);

const docs2 = await loader.load();
/*
[
  Document {
    "metadata": {
      "line": 1,
      "source": "src/document_loaders/example_data/example.csv",
    },
    "pageContent": "This is a sentence.",
  },
  Document {
    "metadata": {
      "line": 2,
      "source": "src/document_loaders/example_data/example.csv",
    },
    "pageContent": "This is another sentence.",
  },
]
*/

import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {
	JSONLoader,
	JSONLinesLoader,
} from "langchain/document_loaders/fs/json";

const loader3 = new DirectoryLoader(
	"src/document_loaders/example_data/example",
	{
		".json": (path) => new JSONLoader(path, "/texts"),
		".jsonl": (path) => new JSONLinesLoader(path, "/html"),
		".txt": (path) => new TextLoader(path),
		".csv": (path) => new CSVLoader(path, "text"),
	},
);
const docs3 = await loader.load();
console.log({ docs });

const loader4 = new PDFLoader("src/document_loaders/example_data/example.pdf", {
	// you may need to add `.then(m => m.default)` to the end of the import
	pdfjs: () => import("pdfjs-dist/legacy/build/pdf.js"),
});

const loader5 = new DocxLoader(
	"src/document_loaders/tests/example_data/attention.docx",
);

const docs5 = await loader.load();

import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

const loader6 = new CheerioWebBaseLoader(
	"https://news.ycombinator.com/item?id=34817881",
);

const docs6 = await loader.load();

/// text splitter
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const text = `Hi.\n\nI'm Harrison.\n\nHow? Are? You?\nOkay then f f f f.
This is a weird text to write, but gotta test the splittingggg some how.\n\n
Bye!\n\n-H.`;
const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 10,
	chunkOverlap: 1,
});

const output = await splitter.createDocuments([text]);

const docOutput = await splitter.splitDocuments([
	new Document({ pageContent: text }),
]);

import { HtmlToTextTransformer } from "langchain/document_transformers/html_to_text";

const splitter = RecursiveCharacterTextSplitter.fromLanguage("html");
const transformer = new HtmlToTextTransformer();

const sequence = splitter.pipe(transformer);

const newDocuments = await sequence.invoke(docs);

console.log(newDocuments);

import { CharacterTextSplitter } from "langchain/text_splitter";

const text2 = "foo bar baz 123";
const splitter2 = new CharacterTextSplitter({
	separator: " ",
	chunkSize: 7,
	chunkOverlap: 3,
});
const output2 = await splitter.createDocuments([text]);

// text embedding models

import { OpenAIEmbeddings } from "langchain/embeddings/openai";

/* Create instance */
const embeddings = new OpenAIEmbeddings();

/* Embed queries */
const res = await embeddings.embedQuery("Hello world");

/* Embed documents */
const documentRes = await embeddings.embedDocuments(["Hello world", "Bye bye"]);
