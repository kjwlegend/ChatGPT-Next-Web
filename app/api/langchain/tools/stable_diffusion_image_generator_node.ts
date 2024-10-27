import S3FileStorage from "@/app/utils/s3_file_storage";
import { StableDiffusionWrapper } from "./stable_diffusion_image_generator";
import { getServerSideConfig } from "@/app/config/server";
import AliOSS from "@/app/utils/alioss";
import { oss_base } from "@/app/constant";

export class StableDiffusionNodeWrapper extends StableDiffusionWrapper {
	async saveImage(imageBase64: string) {
		var filePath = "";
		var fileName = `${Date.now()}.png`;
		const buffer = Buffer.from(imageBase64, "base64");
		const serverConfig = getServerSideConfig();
		var filePath = "";
		var fileName = `${Date.now()}.png`;

		await AliOSS.put(fileName, buffer, "sd");
		return `${oss_base}/sd/${fileName}!webp90`;
	}
}
