import OSS from "ali-oss";

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

export default class AliOSS {
	// 上传文件到指定"文件夹"
	static async put(
		fileName: string,
		data: Buffer,
		folderName?: string,
	): Promise<void> {
		const ossClient = getossClient();
		let objectKey = fileName;
		if (folderName) {
			objectKey = `${folderName}/${fileName}`;
		}

		try {
			const result = await ossClient.put(objectKey, data);
			console.log(`File uploaded successfully to ${objectKey}`);
			console.log(result);
		} catch (e) {
			console.error(`Error uploading file to ${objectKey}:`, e);
			throw e;
		}
	}
}
