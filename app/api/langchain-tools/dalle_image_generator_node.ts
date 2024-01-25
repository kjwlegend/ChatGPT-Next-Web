import { getServerSideConfig } from "@/app/config/server";
import { DallEAPIWrapper } from "./dalle_image_generator";
import S3FileStorage from "@/app/utils/s3_file_storage";
import AliOSS from "@/app/utils/alioss";
import { oss } from "@/app/constant";

export class DallEAPINodeWrapper extends DallEAPIWrapper {
	async saveImageFromUrl(url: string) {
		const response = await fetch(url);
		const content = await response.arrayBuffer();
		const buffer = Buffer.from(content);

		var filePath = "";
		const serverConfig = getServerSideConfig();
		var fileName = `${Date.now()}.png`;

		await AliOSS.put(fileName, buffer, "dalle");
		return `${oss}/dalle/${fileName}!webp90`;
	}
}
