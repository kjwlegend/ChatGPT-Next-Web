import React from "react";
import { X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createOrder, processOrder } from "@/app/services/api/orders";
import { Product, Order } from "@/app/services/api/orders";
import useAuth from "@/app/hooks/useAuth";

interface CheckoutModalProps {
	isVisible: boolean;
	onClose: () => void;
	product: Product;
	quantity: number;
	user: any;
	isYearly?: boolean;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
	isVisible,
	onClose,
	product,
	quantity,
	user,
	isYearly,
}) => {
	const [paymentMethod, setPaymentMethod] = React.useState("virtual_currency");
	const { updateUserInfo } = useAuth();
	const { toast } = useToast();
	const balance = user.virtual_currency;
	const remainingBalance = balance - product.price;

	const handleConfirmPayment = async () => {
		if (product.price === 0) {
			toast({
				title: "错误",
				description: "免费会员无需购买",
				variant: "destructive",
			});
			return;
		}

		try {
			toast({
				title: "处理中",
				description: "系统正在处理您的支付请求...",
			});

			// 创建订单
			const createOrderResponse = await createOrder({
				product_key: product.productKey,
				quantity: quantity,
				payment_method: paymentMethod,
				currency: "CNY",
			});

			if (createOrderResponse.code === 201) {
				if (paymentMethod === "virtual_currency") {
					handleOrderResult(createOrderResponse.order);
				} else {
					const processOrderResponse = await processOrder(
						{
							order_id: createOrderResponse.order.id,
						},
						createOrderResponse.order.id,
					);
					handleOrderResult(processOrderResponse.order);
				}
			} else {
				toast({
					title: "错误",
					description: `创建订单失败: ${createOrderResponse.message || createOrderResponse.error}`,
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "错误",
				description: `支付失败, 请联系管理员: ${error}`,
				variant: "destructive",
			});
		}

		onClose();
	};

	const handleOrderResult = (order: Order) => {
		if (order.payment_status === "paid") {
			toast({
				title: "成功",
				description: "支付成功，请刷新页面或重新登录",
			});
			updateUserInfo(user.id);
		} else {
			toast({
				title: "错误",
				description: "订单处理失败",
				variant: "destructive",
			});
		}
	};

	// 计算折扣信息
	const originalPrice = isYearly ? product.price * (10 / 9) : product.price;
	const discount = isYearly ? 10 : 0;

	return (
		<Dialog open={isVisible} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<DialogTitle>确认支付</DialogTitle>
						<Button variant="ghost" size="icon" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</DialogHeader>
				<div className="space-y-6 py-4">
					{/* Product Information */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold">{product.name}</h3>
							{isYearly && <Badge variant="secondary">年付</Badge>}
						</div>
						{discount > 0 && (
							<div className="text-sm text-green-600">
								优惠: 节省{discount}%
							</div>
						)}
					</div>

					{/* Price Breakdown */}
					<div className="space-y-2 rounded-lg bg-muted p-4">
						{discount > 0 && (
							<div className="flex justify-between text-sm text-muted-foreground">
								<span>原价</span>
								<span>¥{originalPrice}</span>
							</div>
						)}
						<div className="flex justify-between font-medium">
							<span>支付金额</span>
							<span>¥{product.price}</span>
						</div>
						{paymentMethod === "virtual_currency" && (
							<>
								<div className="flex justify-between text-sm">
									<span>当前余额</span>
									<span>¥{balance}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span>支付后余额</span>
									<span>¥{remainingBalance}</span>
								</div>
							</>
						)}
					</div>

					{/* Payment Method Selection */}
					<div className="space-y-4">
						<Label>支付方式</Label>
						<RadioGroup
							defaultValue="virtual_currency"
							onValueChange={setPaymentMethod}
							className="grid grid-cols-1 gap-4"
						>
							<Label
								htmlFor="virtual_currency"
								className="flex cursor-pointer items-center justify-between rounded-lg border p-4 [&:has(:checked)]:bg-muted"
							>
								<div className="flex items-center gap-2">
									<input
										type="radio"
										value="virtual_currency"
										id="virtual_currency"
										checked={paymentMethod === "virtual_currency"}
										onChange={(e) => setPaymentMethod(e.target.value)}
									/>
									<span>平台余额</span>
								</div>
								<Badge variant="outline">¥{balance}</Badge>
							</Label>
							<Label
								htmlFor="wechat"
								className="flex cursor-pointer items-center justify-between rounded-lg border p-4 [&:has(:checked)]:bg-muted"
							>
								<div className="flex items-center gap-2">
									<input
										type="radio"
										value="wechat"
										id="wechat"
										checked={paymentMethod === "wechat"}
										onChange={(e) => setPaymentMethod(e.target.value)}
										disabled
									/>
									<span>微信支付</span>
								</div>
							</Label>
							<Label
								htmlFor="alipay"
								className="flex cursor-pointer items-center justify-between rounded-lg border p-4 [&:has(:checked)]:bg-muted"
							>
								<div className="flex items-center gap-2">
									<input
										type="radio"
										value="alipay"
										id="alipay"
										checked={paymentMethod === "alipay"}
										onChange={(e) => setPaymentMethod(e.target.value)}
										disabled
									/>
									<span>支付宝</span>
								</div>
							</Label>
						</RadioGroup>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-4">
						<Button variant="outline" className="w-full" onClick={onClose}>
							取消
						</Button>
						<Button className="w-full" onClick={handleConfirmPayment}>
							确认支付
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default CheckoutModal;
