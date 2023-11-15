import request from "../utils/request";

export interface filemedata {
	filename: string;
	username: string;
	upload_date: string;
	knowledge_group: string;
	knowledge_category: string;
}

export async function embeddingFile(fileinfo: filemedata) {
	return request({
		url: `/gpt/embedding/`,
		method: "post",
		data: fileinfo,
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
}

// get response
export async function getResponse(data: any) {
	return request({
		url: `/gpt/context-search/`,
		method: "post",
		data: data,
	})
		.then((res) => {
			console.log("知识库反馈:", res.data);
			return res.data;
		})
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
}
