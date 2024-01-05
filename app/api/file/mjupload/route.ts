import { NextRequest, NextResponse } from "next/server";
import S3FileStorage from "@/app/utils/s3_file_storage";
import AliOSS from "@/app/utils/alioss";
import { oss } from "@/app/constant";

// 由于你正在使用Next.js的API路由，你应该使用NextRequest和NextResponse
// 而不是NextRequest和NextResponse，后者是用于中间件的。

async function saveImageFromUrl(url: string) {
	const response = await fetch(url);
	const content = await response.arrayBuffer();
	const buffer = Buffer.from(content);
	const filename = `${Date.now()}.png`;
	await AliOSS.put(filename, buffer, "mj");
	return `${oss}/mj/${filename}!webp90`;
}

async function handle(req: NextRequest) {
	if (req.method === "OPTIONS") {
		return NextResponse.json({ body: "OK" }, { status: 200 });
	}

	try {
		// 解析JSON请求体
		const body = await req.json();
		const imageUrl = body.url;

		// 使用imageUrl来获取图片并上传到S3
		const fileName = await saveImageFromUrl(imageUrl);

		// 返回JSON响应
		return NextResponse.json(
			{
				fileName: fileName,
			},
			{
				status: 200,
			},
		);
	} catch (error) {
		return NextResponse.json(
			{
				error: true,
				msg: "not a valid image url",
			},
			{
				status: 500,
			},
		);
	}
}

// 由于这是一个API路由，不需要runtime或特定的HTTP方法导出
// handle函数即可

export const POST = handle;
export const runtime = "nodejs";
