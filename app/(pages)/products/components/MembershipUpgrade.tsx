"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, Zap, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useUserStore } from "@/app/store/user";
import CheckoutModal from "./CheckoutModal";

const MembershipUpgrade = () => {
	const { user } = useUserStore();
	const [isYearly, setIsYearly] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedMembershipType, setSelectedMembershipType] = useState("");
	const [productKey, setProductKey] = useState("");

	const tiers = [
		{
			name: "免费会员",
			price: "0",
			icon: <Zap className="h-5 w-5" />,
			features: [
				{ name: "基础对话", limit: "200次/每日" },
				{ name: "高级对话", limit: "5次/每日" },
				{ name: "模罗占卜", limit: "1次/每日" },
			],
			color: "bg-gradient-to-br from-gray-50 to-gray-100",
			buttonVariant: "outline" as const,
			productKey: "free_member",
		},
		{
			name: "黄金会员",
			price: isYearly ? "180" : "20",
			icon: <Star className="h-5 w-5 text-yellow-500" />,
			features: [
				{ name: "基础对话", limit: "1000次/每日" },
				{ name: "高级对话", limit: "30次/每日" },
				{ name: "模罗占卜", limit: "5次/每日" },
			],
			color: "bg-gradient-to-br from-yellow-50 to-yellow-100",
			buttonVariant: "secondary" as const,
			popular: true,
			productKey: "gold_member",
		},
		{
			name: "钻石会员",
			price: isYearly ? "450" : "50",
			icon: <Sparkles className="h-5 w-5 text-purple-500" />,
			features: [
				{ name: "基础对话", limit: "无限" },
				{ name: "高级对话", limit: "100次/每日" },
				{ name: "模罗占卜", limit: "10次/每日" },
			],
			color: "bg-gradient-to-br from-purple-50 to-purple-100",
			buttonVariant: "default" as const,
			productKey: "diamond_member",
		},
	];

	const handleUpgrade = (memberType: string, productKey: string) => {
		setSelectedMembershipType(memberType);
		setProductKey(productKey);
		setIsModalVisible(true);
	};

	return (
		<section className="space-y-8">
			<div className="space-y-4 text-center">
				<h1 className="text-3xl font-bold">会员购买</h1>
				<div className="flex items-center justify-center gap-2">
					<span className={!isYearly ? "font-bold" : "text-muted-foreground"}>
						月付
					</span>
					<Switch checked={isYearly} onCheckedChange={setIsYearly} />
					<span className={isYearly ? "font-bold" : "text-muted-foreground"}>
						年付 (9折)
					</span>
				</div>
			</div>

			<div className="grid gap-8 md:grid-cols-3">
				{tiers.map((tier, index) => (
					<motion.div
						key={tier.name}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className="relative"
					>
						<Card className={`relative h-full overflow-hidden ${tier.color}`}>
							{tier.popular && (
								<div className="absolute right-0 top-0 bg-yellow-500 px-3 py-1 text-sm text-white">
									最受欢迎
								</div>
							)}
							<CardHeader>
								<div className="flex items-center gap-2">
									{tier.icon}
									<CardTitle>{tier.name}</CardTitle>
								</div>
								<CardDescription>
									<span className="text-3xl font-bold">¥{tier.price}</span>/
									{isYearly ? "年" : "月"}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{tier.features.map((feature) => (
									<div key={feature.name} className="flex items-center gap-2">
										<Check className="h-4 w-4 text-green-500" />
										<span>{feature.name}</span>
										<span className="text-sm text-muted-foreground">
											{feature.limit}
										</span>
									</div>
								))}
							</CardContent>
							<CardFooter>
								<Button
									className="w-full"
									variant={tier.buttonVariant}
									onClick={() => handleUpgrade(tier.name, tier.productKey)}
									disabled={user.membership_level === tier.productKey}
								>
									{user.membership_level === tier.productKey ? "当前" : "升级"}
								</Button>
							</CardFooter>
						</Card>
					</motion.div>
				))}
			</div>

			<CheckoutModal
				isVisible={isModalVisible}
				onClose={() => setIsModalVisible(false)}
				product={{
					productKey: productKey,
					name: selectedMembershipType,
					price: Number(
						tiers.find((t) => t.productKey === productKey)?.price || 0,
					),
					description: `${isYearly ? "年费" : "月费"}会员升级`,
					productType: "membership",
				}}
				quantity={isYearly ? 12 : 1}
				user={user}
				isYearly={isYearly}
			/>
		</section>
	);
};

export default MembershipUpgrade;
