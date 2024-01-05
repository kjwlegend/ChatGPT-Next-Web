import { getAuthHeaders } from "../api";

export class FileApi {
	async upload(file: any, folderName?: string): Promise<void> {
		const formData = new FormData();
		formData.append("file", file);
		if (folderName) {
			formData.append("folderName", folderName);
		}
		var headers = getAuthHeaders();
		var res = await fetch("/api/file/upload", {
			method: "POST",
			body: formData,
			headers: {
				...headers,
			},
		});
		const resJson = await res.json();
		console.log(resJson);
		return resJson.fileName;
	}
}
