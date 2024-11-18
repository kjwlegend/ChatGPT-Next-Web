import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { redeemCardKey } from "@/app/services/api/orders";

const CardKeyRedeem = () => {
	const [cardKey, setCardKey] = useState("");
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	const handleRedeem = async () => {
		if (!cardKey) {
			toast({
				title: "错误",
				description: "请输入卡密",
				variant: "destructive",
			});
			return;
		}

		setLoading(true);
		try {
			const response = await redeemCardKey({ card_key: cardKey });
			if (response.code === 200) {
				toast({
					title: "成功",
					description: "卡密兑换成功",
				});
				setCardKey("");
			} else {
				toast({
					title: "错误",
					description: response.message || "卡密兑换失败",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "错误",
				description: "卡密兑换失败,请稍后再试",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="mx-auto max-w-md">
			<Card>
				<CardHeader>
					<CardTitle>卡密兑换</CardTitle>
					<CardDescription>请输入您的兑换码</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2">
						<Input
							placeholder="请输入卡密"
							value={cardKey}
							onChange={(e) => setCardKey(e.target.value)}
						/>
						<Button onClick={handleRedeem} disabled={loading}>
							{loading ? "兑换中..." : "兑换"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</section>
	);
};

export default CardKeyRedeem;
