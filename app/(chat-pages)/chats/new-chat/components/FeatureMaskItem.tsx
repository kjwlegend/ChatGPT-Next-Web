import React from "react";
import { Card, Button } from "antd";
import Image from "next/image";
import { Mask } from "@/app/types/mask";
import styles from "../styles/NewChat.module.scss";

interface FeatureMaskItemProps {
	mask: Mask;
	startChat: (mask: Mask) => void;
}

const FeatureMaskItem: React.FC<FeatureMaskItemProps> = ({
	mask,
	startChat,
}) => (
	<Card
		style={{ maxWidth: 300 }}
		title={mask.name}
		extra={
			<span key={mask.id} className={styles["card-extra"]}>
				角色等级: {mask.version}
			</span>
		}
		hoverable
		onClick={() => startChat(mask)}
		actions={[
			<Button
				key={mask.id}
				type="primary"
				onClick={(e) => {
					e.stopPropagation();
					startChat(mask);
				}}
			>
				开始聊天
			</Button>,
		]}
		key={mask.id}
	>
		<div className={styles["mask-item"]}>
			<div className={styles["img-wrapper"]}>
				<Image
					width={90}
					height={180}
					src={"/" + mask?.img || ""}
					alt={mask?.name || ""}
				/>
			</div>
			<div className={styles.description}>
				<p>{mask.zodiac}</p>
				<p style={{ whiteSpace: "pre-line" }}>{mask.description}</p>
			</div>
		</div>
	</Card>
);

export default FeatureMaskItem;
