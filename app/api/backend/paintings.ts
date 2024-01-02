import request from "@/app/utils/request";

/**
 * Request
 */
export interface paintings {
	action: string;
	image_url: string;
	model: string;
	prompt?: string;
	prompt_en?: string;
	publish: boolean;
	status: string;
	task_id: string;
	user: number;
	[property: string]: any;
}

/**
 * get paintings
 * @param params
 * @returns
 * @constructor
 
    */

export async function getPaintings(params?: any) {
	return request({
		url: `/gpt/paintings/`,
		method: "get",
		params,
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
}

/**
 * create paintings
 * @param data
 * @returns
 * @constructor
 
    */

export async function createPaintings(data: paintings) {
	return request({
		url: `/gpt/paintings/`,
		method: "post",
		data,
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err;
		});
}

/**
 * update paintings
 * @param id
 * @param data
 * @returns
 * @constructor
 
    */

export async function updatePaintings(id: number, data: paintings) {
	return request({
		url: `/gpt/paintings/${id}/`,
		method: "put",
		data,
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err;
		});
}

/**
 * delete paintings
 * @param id
 * @returns
 * @constructor
 
    */

export async function deletePaintings(id: number) {
	return request({
		url: `/gpt/paintings/${id}/`,
		method: "delete",
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err;
		});
}
