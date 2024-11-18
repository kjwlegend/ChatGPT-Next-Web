"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
import { useUserStore } from "@/app/store/user";
import CheckoutModal from "./CheckoutModal";
import { getAllProducts } from "../productUtils";
import { Product } from "@/app/services/api/orders";

const SingleItemsPage = () => {
	const { user } = useUserStore();
	const [quantities, setQuantities] = useState<Record<string, number>>({});
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

	const products = getAllProducts();

	const handleQuantityChange = (productKey: string, value: number) => {
		setQuantities((prev) => ({
			...prev,
			[productKey]: Math.max(1, value),
		}));
	};

	const handlePurchase = (product: any) => {
		const quantity = quantities[product.product_key] || 1;
		setSelectedProduct({
			productKey: product.product_key,
			name: product.name,
			price: product.price * quantity,
			description: `购买 ${quantity * product.quantity} ${product.unit} ${product.name}`,
			productType: product.product_type,
		});
		setIsModalVisible(true);
	};

	return (
		<section className="space-y-8">
			<h2 className="text-center text-2xl font-bold">单品购买</h2>
			<div className="grid gap-8 md:grid-cols-3">
				{products.map((product, index) => (
					<motion.div
						key={product.product_key}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">{product.name}</CardTitle>
								<CardDescription>
									价格: ¥{product.price} / {product.unit}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											handleQuantityChange(
												product.product_key,
												(quantities[product.product_key] || 1) - 1,
											)
										}
									>
										-
									</Button>
									<Input
										type="number"
										value={quantities[product.product_key] || 1}
										onChange={(e) =>
											handleQuantityChange(
												product.product_key,
												parseInt(e.target.value) || 1,
											)
										}
										className="w-20 text-center"
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											handleQuantityChange(
												product.product_key,
												(quantities[product.product_key] || 1) + 1,
											)
										}
									>
										+
									</Button>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									className="w-full"
									onClick={() => handlePurchase(product)}
								>
									购买
								</Button>
							</CardFooter>
						</Card>
					</motion.div>
				))}
			</div>

			{selectedProduct && (
				<CheckoutModal
					isVisible={isModalVisible}
					onClose={() => {
						setIsModalVisible(false);
						setSelectedProduct(null);
					}}
					product={selectedProduct}
					quantity={quantities[selectedProduct.productKey] || 1}
					user={user}
				/>
			)}
		</section>
	);
};

export default SingleItemsPage;
