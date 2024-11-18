"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	productType: "membership" | "single" | "recharge";
	product: {
		name: string;
		price: number;
		originalPrice?: number;
		discount?: number;
		period?: "monthly" | "annual";
	};
}

export default function Component({
	isOpen = false,
	onClose = () => {},
	productType = "membership",
	product = {
		name: "黄金会员",
		price: 180,
		originalPrice: 200,
		discount: 10,
		period: "annual",
	},
}: PaymentModalProps) {
	const [paymentMethod, setPaymentMethod] = useState<string>("balance");
	const balance = 372.0;
	const remainingBalance = balance - product.price;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
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
							{product.period && (
								<Badge variant="secondary">
									{product.period === "annual" ? "年付" : "月付"}
								</Badge>
							)}
						</div>
						{product.discount && (
							<div className="text-sm text-green-600">
								优惠: 节省{product.discount}%
							</div>
						)}
					</div>

					{/* Price Breakdown */}
					<div className="space-y-2 rounded-lg bg-muted p-4">
						{product.originalPrice && (
							<div className="flex justify-between text-sm text-muted-foreground">
								<span>原价</span>
								<span>¥{product.originalPrice.toFixed(2)}</span>
							</div>
						)}
						<div className="flex justify-between font-medium">
							<span>支付金额</span>
							<span>¥{product.price.toFixed(2)}</span>
						</div>
						{paymentMethod === "balance" && (
							<>
								<div className="flex justify-between text-sm">
									<span>当前余额</span>
									<span>¥{balance.toFixed(2)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span>支付后余额</span>
									<span>¥{remainingBalance.toFixed(2)}</span>
								</div>
							</>
						)}
					</div>

					{/* Payment Method Selection */}
					<div className="space-y-4">
						<Label>支付方式</Label>
						<RadioGroup
							defaultValue="balance"
							onValueChange={setPaymentMethod}
							className="grid grid-cols-1 gap-4"
						>
							<Label
								htmlFor="balance"
								className="flex cursor-pointer items-center justify-between rounded-lg border p-4 [&:has(:checked)]:bg-muted"
							>
								<div className="flex items-center gap-2">
									<RadioGroupItem value="balance" id="balance" />
									<span>平台余额</span>
								</div>
								<Badge variant="outline">¥{balance.toFixed(2)}</Badge>
							</Label>
							<Label
								htmlFor="wechat"
								className="flex cursor-pointer items-center justify-between rounded-lg border p-4 [&:has(:checked)]:bg-muted"
							>
								<div className="flex items-center gap-2">
									<RadioGroupItem value="wechat" id="wechat" />
									<span>微信支付</span>
								</div>
							</Label>
							<Label
								htmlFor="alipay"
								className="flex cursor-pointer items-center justify-between rounded-lg border p-4 [&:has(:checked)]:bg-muted"
							>
								<div className="flex items-center gap-2">
									<RadioGroupItem value="alipay" id="alipay" />
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
						<Button
							className="w-full"
							onClick={() => console.log("Processing payment...")}
						>
							确认支付
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
