import request from "@/app/utils/request";

// get prompt category url : /api/gpt/get-prompt-categories/

interface pageParams {
	page: number;
	limit: number;
}

export async function getPromptCategory() {
	return request({
		url: `/gpt/get-prompt-categories/`,
		method: "get",
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
}

export async function getPrompt(data: pageParams) {
	return request({
		url: "/gpt/prompts-public/",
		method: "get",
		params: data,
	})
		.then((res) => res.data)
		.catch((err) => {
			return err.message;
		});
}
// get prompthotness
export async function getPromptHotness() {
	return request({
		url: `/gpt/prompt-hotness/`,
		method: "get",
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
}
