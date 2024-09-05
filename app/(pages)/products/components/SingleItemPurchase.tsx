import React, { useState } from "react";
import styles from "../products.module.scss";
import { Button, InputNumber } from "antd";
import CheckoutModal from "./CheckoutModal";
import { useUserStore } from "@/app/store/user";
import useAuth from "@/app/hooks/useAuth";

interface SingleItemPurchaseProps {
	title: string;
	description: string;
	price: number;
	unit: string;
	productType: string;
}

const SingleItemPurchase: React.FC<SingleItemPurchaseProps> = ({
	title,
	description,
	price,
	unit,
	productType,
}) => {
	const [quantity, setQuantity] = useState(1);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const { user } = useUserStore();
	const { updateUserInfo } = useAuth();

	const handleQuantityChange = (value: number | null) => {
		if (value !== null) {
			setQuantity(value);
		}
	};

	const handlePurchase = () => {
		setIsModalVisible(true);
	};

	const getProductInfo = () => {
		const totalQuantity =
			quantity *
			(productType === "basic" ? 100 : productType === "advanced" ? 15 : 1);
		return {
			name: title,
			price: quantity * price,
			description: `购买 ${totalQuantity} ${unit}`,
			productType: productType,
			quantity: totalQuantity,
		};
	};

	return (
		<div className={styles.singleItemPurchase}>
			<h3>{title}</h3>
			<p>{description}</p>
			<p className={styles.price}>
				价格: ¥{price.toFixed(2)} / {unit}
			</p>
			<div className={styles.quantitySelector}>
				<InputNumber
					min={1}
					value={quantity}
					onChange={handleQuantityChange}
					addonBefore={
						<Button onClick={() => handleQuantityChange(quantity - 1)}>
							-
						</Button>
					}
					addonAfter={
						<Button onClick={() => handleQuantityChange(quantity + 1)}>
							+
						</Button>
					}
				/>
			</div>
			<Button type="primary" onClick={handlePurchase}>
				购买
			</Button>

			<CheckoutModal
				isVisible={isModalVisible}
				onClose={() => setIsModalVisible(false)}
				product={getProductInfo()}
				user={user}
			/>
		</div>
	);
};

const SingleItemsPage = () => {
	return (
		<div className={styles.singleItemsPage}>
			<h2>单品购买</h2>
			<div className={styles.singleItemsContainer}>
				<SingleItemPurchase
					title="基础对话次数"
					description="购买基础对话次数，提升您的日常交互体验"
					price={1}
					unit="100次"
					productType="basic"
				/>
				<SingleItemPurchase
					title="高级对话次数"
					description="购买高级对话次数，体验更智能的交互"
					price={1}
					unit="15次"
					productType="advanced"
				/>
				<SingleItemPurchase
					title="塔罗占卜次数"
					description="购买塔罗占卜次数，探索神秘的塔罗世界"
					price={1}
					unit="1次"
					productType="tarot"
				/>
			</div>
		</div>
	);
};

export default SingleItemsPage;
