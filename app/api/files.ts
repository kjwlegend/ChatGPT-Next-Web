import request from "../utils/request";

export interface filemedata {
	filename: string;
	username: string;
	upload_date: string;
	knowledge_group: string;
	knowledge_category: string;
}

export async function getfileme(fileinfo: filemedata) {
	return request({
		url: `/gpt/embedding/`,
		method: "post",
		data: {},
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
}
