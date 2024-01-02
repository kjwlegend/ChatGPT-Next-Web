import request from "@/app/utils/request";
import { User } from "@/app/store/user";

export async function updateProfile(userId: number, userInfo: User) {
	return request({
		url: `/gpt/users/${userId}/`,
		method: "put",
		data: userInfo,
	})
		.then((res) => res.data)
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
}

export async function getUserInfo(userId: any) {
	return request({
		url: `/gpt/users/${userId}/`,
		method: "get",
	})
		.then((res) => res.data)
		.catch((err) => {
			console.log(err);
			return err.response;
		});
}

// Member type 包含 normal, monthly, quarterly, yearly
export type member_type =
	| "normal"
	| "monthly"
	| "quarterly"
	| "halfyearly"
	| "yearly";

interface upgradeMemberParams {
	user_id: number;
	member_type: member_type;
	order_amount: number;
	payment_type: string;
}

// upgradeMember
export async function upgradeMember(params: upgradeMemberParams) {
	return request({
		url: `/gpt/orders/`,
		method: "post",
		data: params,
	})
		.then((res) => res.data)
		.catch((err) => {
			return err.response.data;
		});
}
