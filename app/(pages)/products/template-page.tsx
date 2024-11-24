"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Star, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function Component() {
	const [isAnnual, setIsAnnual] = useState(false);

	const tiers = [
		{
			name: "免费会员",
			price: "0",
			icon: <Zap className="h-5 w-5" />,
			features: [
				{ name: "基础对话", limit: "200次/每日" },
				{ name: "高级对话", limit: "5次/每日" },
				{ name: "塔罗占卜", limit: "1次/每日" },
			],
			color: "bg-gradient-to-br from-gray-50 to-gray-100",
			buttonVariant: "outline" as const,
		},
		{
			name: "黄金会员",
			price: isAnnual ? "180" : "20",
			icon: <Star className="h-5 w-5 text-yellow-500" />,
			features: [
				{ name: "基础对话", limit: "1000次/每日" },
				{ name: "高级对话", limit: "30次/每日" },
				{ name: "塔罗占卜", limit: "5次/每日" },
			],
			color: "bg-gradient-to-br from-yellow-50 to-yellow-100",
			buttonVariant: "secondary" as const,
			popular: true,
		},
		{
			name: "钻石会员",
			price: isAnnual ? "450" : "50",
			icon: <Sparkles className="h-5 w-5 text-purple-500" />,
			features: [
				{ name: "基础对话", limit: "无限" },
				{ name: "高级对话", limit: "100次/每日" },
				{ name: "塔罗占卜", limit: "10次/每日" },
			],
			color: "bg-gradient-to-br from-purple-50 to-purple-100",
			buttonVariant: "default" as const,
		},
	];

	const singlePurchaseItems = [
		{ name: "基础对话次数", price: 1, unit: "100次", defaultValue: 1 },
		{ name: "高级对话次数", price: 1, unit: "15次", defaultValue: 1 },
		{ name: "塔罗占卜次数", price: 1, unit: "1次", defaultValue: 1 },
	];

	return (
		<div className="container mx-auto space-y-12 px-4 py-8">
			<section className="space-y-8">
				<div className="space-y-4 text-center">
					<h1 className="text-3xl font-bold">会员购买</h1>
					<div className="flex items-center justify-center gap-2">
						<span className={!isAnnual ? "font-bold" : "text-muted-foreground"}>
							月付
						</span>
						<Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
						<span className={isAnnual ? "font-bold" : "text-muted-foreground"}>
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
										{isAnnual ? "年" : "月"}
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
									<Button className="w-full" variant={tier.buttonVariant}>
										升级
									</Button>
								</CardFooter>
							</Card>
						</motion.div>
					))}
				</div>
			</section>

			<section className="space-y-8">
				<h2 className="text-center text-2xl font-bold">单品购买</h2>
				<div className="grid gap-8 md:grid-cols-3">
					{singlePurchaseItems.map((item) => (
						<Card key={item.name}>
							<CardHeader>
								<CardTitle className="text-lg">{item.name}</CardTitle>
								<CardDescription>
									价格: ¥{item.price} / {item.unit}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center gap-2">
									<Button variant="outline" size="icon">
										-
									</Button>
									<Input
										type="number"
										defaultValue={item.defaultValue}
										className="w-20 text-center"
									/>
									<Button variant="outline" size="icon">
										+
									</Button>
								</div>
							</CardContent>
							<CardFooter>
								<Button className="w-full">购买</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			</section>

			<section className="mx-auto max-w-md">
				<Card>
					<CardHeader>
						<CardTitle>卡密兑换</CardTitle>
						<CardDescription>请输入您的兑换码</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-2">
							<Input placeholder="请输入卡密" />
							<Button>兑换</Button>
						</div>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
