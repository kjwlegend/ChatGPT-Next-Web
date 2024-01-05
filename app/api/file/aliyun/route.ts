import OSS from "ali-oss";
import { NextRequest, NextResponse } from "next/server";
const OSS_ACCESS_KEY_ID = process.env.OSS_ACCESS_KEY_ID;
const OSS_ACCESS_KEY_SECRET = process.env.OSS_ACCESS_KEY_SECRET;
const OSS_BUCKET = process.env.OSS_BUCKET;

const getossClient = () => {
	return new OSS({
		region: "oss-cn-shanghai",
		accessKeyId: OSS_ACCESS_KEY_ID!,
		accessKeySecret: OSS_ACCESS_KEY_SECRET!,
		bucket: OSS_BUCKET!,
	});
};

async function AliOSSPut(fileName: string, data: Buffer): Promise<void> {
	const ossClient = getossClient();

	try {
		const result = await ossClient.put(fileName, data);
		console.log(`File uploaded successfully to ${fileName}`);
		console.log(result);

		const getResult = await ossClient.get(fileName);
		console.log(getResult);
		// return Promise.resolve();
	} catch (e) {
		console.error(`Error uploading file to ${fileName}:`, e);
		throw e;
	}
}

const handle = async (req: NextRequest) => {
	if (req.method === "OPTIONS") {
		return NextResponse.json({ body: "OK" }, { status: 200 });
	}

	try {
		const formData = await req.formData();
		const image = formData.get("file") as File;

		const imageReader = image.stream().getReader();
		const imageData: number[] = [];

		while (true) {
			const { done, value } = await imageReader.read();
			if (done) break;
			imageData.push(...value);
		}

		const buffer = Buffer.from(imageData);

		var fileName = `${Date.now()}.png`;
		console.log("fileName: ", fileName);

		await AliOSSPut(fileName, buffer);

		return NextResponse.json(
			{
				fileName: "fileName",
			},
			{
				status: 200,
			},
		);
	} catch (e) {
		return NextResponse.json(
			{
				error: true,
				msg: (e as Error).message,
			},
			{
				status: 500,
			},
		);
	}
};

export const POST = handle;
export const runtime = "nodejs";
