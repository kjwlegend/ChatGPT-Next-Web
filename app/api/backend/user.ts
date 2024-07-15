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
export type membership_level =
	| "normal"
	| "monthly"
	| "quarterly"
	| "halfyearly"
	| "yearly";

interface upgradeMemberParams {
	user_id: number;
	membership_level: membership_level;
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

export async function resetTarotBalance(userId: number) {
	return request({
		url: `/gpt/reset-tarot/`,
		method: "post",
		data: { userid: userId },
	})
		.then((res) => res.data)
		.catch((err) => {
			return err.message;
		});
}

export async function decreaseTarotBalance(userId: number) {
	return request({
		url: `/gpt/decrease-tarot/`,
		method: "post",
		data: { userid: userId },
	})
		.then((res) => res.data)
		.catch((err) => {
			return err.message;
		});
}
