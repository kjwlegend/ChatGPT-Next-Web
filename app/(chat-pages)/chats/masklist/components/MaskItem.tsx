import React from "react";
import { Card, Tag } from "antd";
import { IconButton } from "@/app/components/button";
import { Mask } from "@/app/types/mask";
import Avatar from "@/app/components/avatar";
import EyeIcon from "@/app/icons/eye.svg";
import styles from "../styles/MaskList.module.scss";

const { Meta } = Card;

interface MaskItemProps {
	mask: Mask;
	onItemClick: (mask: Mask) => void;
	onDelete: (mask: Mask) => void;
}

const MaskItem: React.FC<MaskItemProps> = ({ mask, onItemClick, onDelete }) => {
	return (
		<Card
			title={
				<div className={styles["mask-header"]}>
					<Avatar avatar={mask.avatar} nickname={mask.name} size={40} />
					{mask.name}
					{mask.version && mask.version}
				</div>
			}
			styles={{
				body: { padding: 10 },
				header: { padding: 5 },
			}}
			hoverable
			className={`${styles["mask-item"]} ${styles["mask-item-card"]}`}
			onClick={() => onItemClick(mask)}
		>
			<Meta description={mask.description || "作者很懒, 还没有上传介绍"} />
			<div className={styles.tags}>
				{mask.tags?.map((tag, index) => (
					<span className={styles["label"]} key={`${mask.id}-${index}`}>
						{tag}
					</span>
				))}
			</div>
			<div className={styles.cardFooter}>
				<div className={styles.author}>作者: @{mask.author}</div>
				<div className={styles.author}>Agent_id: {mask.id}</div>
				<IconButton
					icon={<EyeIcon />}
					text={`${mask.hotness || "0"}`}
					className={styles.hotness}
				/>
			</div>
		</Card>
	);
};

export default MaskItem;
