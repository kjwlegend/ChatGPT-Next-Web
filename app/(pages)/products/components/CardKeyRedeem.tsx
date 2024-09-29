import React, { useState } from "react";
import { Input, Button, message } from "antd";
import { redeemCardKey } from "@/app/services/api/orders";
import styles from "../products.module.scss";

const CardKeyRedeem: React.FC = () => {
	const [cardKey, setCardKey] = useState("");
	const [loading, setLoading] = useState(false);

	const handleRedeem = async () => {
		if (!cardKey) {
			message.error("请输入卡密");
			return;
		}

		setLoading(true);
		try {
			const response = await redeemCardKey({ card_key: cardKey });
			if (response.code === 200) {
				message.success("卡密兑换成功");
				setCardKey("");
			} else {
				message.error(response.message || "卡密兑换失败");
			}
		} catch (error) {
			message.error("卡密兑换失败,请稍后再试");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.cardKeyRedeem}>
			<h2>卡密兑换</h2>
			<div className={styles.redeemInput}>
				<Input
					placeholder="请输入卡密"
					value={cardKey}
					onChange={(e) => setCardKey(e.target.value)}
				/>
				<Button type="primary" onClick={handleRedeem} loading={loading}>
					兑换
				</Button>
			</div>
		</div>
	);
};

export default CardKeyRedeem;
