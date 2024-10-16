import React from "react";
import { Card, Button } from "antd";
import Image from "next/image";
import { Mask } from "@/app/types/mask";
import styles from "../styles/NewChat.module.scss";
import Meta from "antd/es/card/Meta";
import { Avatar } from "@/app/components/avatar";

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
		hoverable
		onClick={() => startChat(mask)}
		key={mask.id}
		className={styles["mask-item"]}
	>
		<Avatar
			avatar={"/" + mask?.img || ""}
			size={120}
			className={styles["avatar"]}
		/>
		<Meta description={mask.description} />
	</Card>
);

export default FeatureMaskItem;
