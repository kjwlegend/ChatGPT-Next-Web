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
	stock: number;
	product_type: ProductType;
	currency: string;
	icon: typeof ShoppingOutlined | typeof RobotOutlined | typeof CoffeeOutlined;
	unit: string;
	quantity: number;
}

export type ProductKey = "basic_chat_quota" | "pro_chat_quota" | "tarot_quota";

export const PRODUCT_INFO: Record<ProductKey, ProductInfo> = {
	basic_chat_quota: {
		product_key: "basic_chat_quota",
		name: "基础对话次数",
		description: "补充基础对话次数",
		price: 1.0,
		stock: 999,
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
		stock: 999,
		product_type: "quota",
		currency: "CNY",
		icon: RobotOutlined,
		unit: "15次",
		quantity: 15,
	},
	tarot_quota: {
		product_key: "tarot_quota",
		name: "塔罗占卜次数",
		description: "补充塔罗占卜次数",
		price: 1.0,
		stock: 999,
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
