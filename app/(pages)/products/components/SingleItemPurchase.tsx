import React, { useState } from "react";
import styles from "../products.module.scss";
import { Button, InputNumber } from "antd";
import CheckoutModal from "./CheckoutModal";
import { useUserStore } from "@/app/store/user";
import useAuth from "@/app/hooks/useAuth";
import { getProductInfo, ProductKey, getAllProducts } from "../productUtils";

interface SingleItemPurchaseProps {
	productKey: ProductKey;
}

const SingleItemPurchase: React.FC<SingleItemPurchaseProps> = ({
	productKey,
}) => {
	const [quantity, setQuantity] = useState(1);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const { user } = useUserStore();
	const { updateUserInfo } = useAuth();

	const productInfo = getProductInfo(productKey);

	const handleQuantityChange = (value: number | null) => {
		if (value !== null) {
			setQuantity(value);
		}
	};

	const handlePurchase = () => {
		setIsModalVisible(true);
	};

	const createProductInfo = () => {
		return {
			name: productInfo.name,
			price: quantity * productInfo.price,
			productKey: productInfo.product_key,
			description: `购买 ${quantity * productInfo.quantity} 次 ${productInfo.name}`,
			productType: productInfo.product_type,
			quantity: quantity * productInfo.quantity,
		};
	};

	return (
		<div className={styles.singleItemPurchase}>
			<h3>{productInfo.name}</h3>
			<p>{productInfo.description}</p>
			<p className={styles.price}>
				价格: ¥{productInfo.price.toFixed(2)} / {productInfo.unit}
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
				product={createProductInfo()}
				quantity={quantity}
				user={user}
			/>
		</div>
	);
};

const SingleItemsPage: React.FC = () => {
	const products = getAllProducts();

	return (
		<div className={styles.singleItemsPage}>
			<h2>单品购买</h2>
			<div className={styles.singleItemsContainer}>
				{products.map((product) => (
					<SingleItemPurchase
						key={product.product_key}
						productKey={product.product_key as ProductKey}
					/>
				))}
			</div>
		</div>
	);
};

export default SingleItemsPage;
