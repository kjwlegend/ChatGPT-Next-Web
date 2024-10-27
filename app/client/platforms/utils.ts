import { ModelProvider } from "@/app/constant";
import { getAuthHeaders } from "../api";

import { getHeaders, ClientApi } from "../api";
import { ChatSession } from "@/app/types/chat";

export interface FileInfo {
	originalFilename: string;
	fileName: string;
	filePath: string;
	size: number;
	partial?: any;
	status?: "uploading" | "removed" | "done" | "error"; // 新增状态字段
}

export class FileApi {
	async upload(file: any, folderName?: string): Promise<FileInfo> {
		const fileName = file.name;
		const fileSize = file.size;
		const formData = new FormData();
		formData.append("file", file);
		if (folderName) {
			formData.append("folderName", folderName);
		}
		var headers = getHeaders(true);
		const api = "/api/file/upload";
		var res = await fetch(api, {
			method: "POST",
			body: formData,
			headers: {
				...headers,
			},
		});
		const resJson = await res.json();
		console.log(resJson);
		return {
			originalFilename: fileName,
			size: fileSize,
			fileName: resJson.fileName,
			filePath: resJson.filePath,
		};
	}

	async uploadForRag(
		file: any,
		session: ChatSession,
		userinfo: string,
	): Promise<FileInfo> {
		let fileInfo: FileInfo = {
			originalFilename: file.name,
			fileName: "",
			filePath: "",
			size: file.size,
			status: "uploading", // 设置为上传中
		};

		// 上传文件
		fileInfo = await this.upload(file, "RAG");
		fileInfo.status = "removed"; // 上传完成，设置为转码中

		const api: ClientApi = new ClientApi(ModelProvider.GPT);
		let partial;
		try {
			partial = await api.llm.createRAGStore({
				chatSessionId: session.id,
				fileInfos: [fileInfo],
				userinfo: userinfo,
			});
			fileInfo.partial = partial;
			fileInfo.status = "done"; // 转码成功
		} catch (error) {
			console.error("转码失败:", error);
			fileInfo.status = "error"; // 转码失败
		}

		return fileInfo;
	}
}
