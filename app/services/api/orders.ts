import { AppMapping, api } from "./api";

// 定义产品类型
export type ProductType = "membership" | "quota" | "unlock";

// 定义支付方式
type PaymentMethod = "virtual_currency" | "alipay" | "wechat";

// 定义货币类型
type Currency = "CNY" | "USD";

// 定义订单状态
type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

// 定义支付状态
type PaymentStatus = "unpaid" | "paid" | "refunded";

// 创建订单请求接口
interface CreateOrderRequest {
	product_id: number;
	quantity: number;
	payment_method: PaymentMethod;
}

export interface Product {
	name: string;
	productKey: string;
	price: number;
	description: string;
	productType: ProductType;
}

export interface Order {
	id: number;
	user: number;
	product: number;
	product_name: string;
	product_type: ProductType;
	quantity: number;
	total_price: number;
	currency: Currency;
	order_status: OrderStatus;
	payment_method: PaymentMethod;
	payment_status: PaymentStatus;
	created_at: string;
	updated_at: string;
	membership_start_date?: string;
	membership_end_date?: string;
	quota_added?: number;
	unlock_feature?: string;
}

// 创建订单响应接口
interface CreateOrderResponse {
	code: number;
	data: {
		id: number;
		user: number;
		product: number;
		product_name: string;
		product_type: ProductType;
		quantity: number;
		total_price: number;
		currency: Currency;
		order_status: OrderStatus;
		payment_method: PaymentMethod;
		payment_status: PaymentStatus;
		created_at: string;
		updated_at: string;
		membership_start_date?: string;
		membership_end_date?: string;
		quota_added?: number;
		unlock_feature?: string;
	};
	message: string;
}

// 处理订单请求接口
interface ProcessOrderRequest {
	order_id: number;
}

// 处理订单响应接口
interface ProcessOrderResponse {
	message: string;
	order: {
		id: number;
		user: number;
		product: number;
		product_name: string;
		product_type: ProductType;
		quantity: number;
		total_price: number;
		currency: Currency;
		order_status: OrderStatus;
		payment_method: PaymentMethod;
		payment_status: PaymentStatus;
		created_at: string;
		updated_at: string;
		membership_start_date?: string;
		membership_end_date?: string;
		quota_added?: number;
		unlock_feature?: string;
	};
}

// 错误响应接口
interface ErrorResponse {
	error: string;
}

const appnamespace = AppMapping.ecommerce;

const createOrder = api(appnamespace, "/user/orders/");
const processOrder = api(appnamespace, "/user/orders/:id/process_order/");
const paymentCallback = api(appnamespace, "/user/orders/:id/payment-callback/");

const redeemCardKey = api(appnamespace, "/card-keys/redeem/");

export { createOrder, processOrder, paymentCallback, redeemCardKey };
