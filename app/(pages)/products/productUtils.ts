import {
	ShoppingOutlined,
	RobotOutlined,
	CoffeeOutlined,
} from "@ant-design/icons";

import { ProductType } from "@/app/services/api/orders";
export interface ProductInfo {
	product_key: string;
	name: string;
	description: string;
	price: number;
	product_type: ProductType;
	currency: string;
	icon: typeof ShoppingOutlined | typeof RobotOutlined | typeof CoffeeOutlined;
	unit: string;
	quantity: number;
}

export type ProductKey =
	| "basic_chat_quota"
	| "pro_chat_quota"
	| "basic_tarot_quota";

export const PRODUCT_INFO: Record<ProductKey, ProductInfo> = {
	basic_chat_quota: {
		product_key: "basic_chat_quota",
		name: "基础对话次数",
		description: "补充基础对话次数",
		price: 1.0,
		product_type: "quota",
		currency: "CNY",
		icon: ShoppingOutlined,
		unit: "100次",
		quantity: 100,
	},
	pro_chat_quota: {
		product_key: "pro_chat_quota",
		name: "高级对话次数",
		description: "补充高级对话次数",
		price: 1.0,
		product_type: "quota",
		currency: "CNY",
		icon: RobotOutlined,
		unit: "15次",
		quantity: 15,
	},
	basic_tarot_quota: {
		product_key: "basic_tarot_quota",
		name: "塔罗占卜次数",
		description: "补充塔罗占卜次数",
		price: 1.0,
		product_type: "quota",
		currency: "CNY",
		icon: CoffeeOutlined,
		unit: "1次",
		quantity: 1,
	},
};

export function getProductInfo(productKey: ProductKey): ProductInfo {
	return PRODUCT_INFO[productKey];
}

export function getAllProducts(): ProductInfo[] {
	return Object.values(PRODUCT_INFO);
}

export type MembershipType = "free" | "gold" | "diamond";

export interface MembershipInfo {
	membership_type: MembershipType;
	name: string;
	description: string;
	price: number;
	stock: number;
	currency: string;
	unit: string;
	quantity: number;
}

export const MEMBERSHIP_INFO: Record<MembershipType, MembershipInfo> = {
	free: {
		membership_type: "free",
		name: "免费会员",
		description: "基础对话和服务",
		price: 0,
		stock: 999,
		currency: "CNY",
		unit: "无限",
		quantity: 1,
	},
	gold: {
		membership_type: "gold",
		name: "黄金会员",
		description: "高级对话和服务",
		price: 20,
		stock: 999,
		currency: "CNY",
		unit: "1年",
		quantity: 1,
	},
	diamond: {
		membership_type: "diamond",
		name: "钻石会员",
		description: "顶级对话和服务",
		price: 50,
		stock: 999,
		currency: "CNY",
		unit: "1年",
		quantity: 1,
	},
};

export function getMembershipInfo(
	membershipType: MembershipType,
): MembershipInfo {
	return MEMBERSHIP_INFO[membershipType];
}

export function getAllMemberships(): MembershipInfo[] {
	return Object.values(MEMBERSHIP_INFO);
}
