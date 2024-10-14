"use client";
import React from "react";
import DownloadIcon from "@/app/icons/download.svg";
import UploadIcon from "@/app/icons/upload.svg";
import EditIcon from "@/app/icons/edit.svg";
import AddIcon from "@/app/icons/add.svg";
import CloseIcon from "@/app/icons/close.svg";
import DeleteIcon from "@/app/icons/delete.svg";
import EyeIcon from "@/app/icons/eye.svg";
import CopyIcon from "@/app/icons/copy.svg";
import DragIcon from "@/app/icons/drag.svg";
import styles from "./mask.module.scss";
import { Avatar } from "@/app/components/avatar";
import Locale, { AllLangs, ALL_LANG_OPTIONS, Lang } from "@/app/locales";
import {
	Input,
	List,
	ListItem,
	Modal,
	Popover,
	Select,
	showConfirm,
} from "@/app/components/ui-lib";
import { Card, Tag } from "antd";
import { IconButton } from "@/app/components/button";
import { BotAvatar } from "@/app/components/emoji";
import { DEFAULT_MASK_AVATAR, useMaskStore } from "@/app/store/mask";
import { Mask, ChatMessage } from "@/app/types/";
import {
	createMessage,
	ModelConfig,
	useAppConfig,
	useChatStore,
	useUserStore,
} from "@/app/store";

const { Meta } = Card;

type MaskComponentProps = {
	mask: Mask;
	setEditingMaskId: (id: string) => void;
	styleName?: string;
	onItemClick: (mask: Mask) => void;
	onDelete: (mask: Mask) => void;
};

const MaskComponent: React.FC<MaskComponentProps> = ({
	mask,
	setEditingMaskId,
	styleName = "",
	onItemClick,
	onDelete,
}) => {
	const getCardStyle = () => {
		if (styleName === "assistant") {
			return styles["mask-item-card"];
		} else if (styleName === "info") {
			return styles["mask-item-info"];
		} else if (styleName === "roleplay") {
			return styles["mask-item-roleplay"];
		} else {
			return styles["mask-item-card"];
		}
	};

	const renderPublicAgent = () => {
		return (
			<Card
				title={
					<div className={styles["mask-header"]}>
						<Avatar avatar={mask.avatar} nickname={mask.name} size={40} />
						{mask.name}
						{mask.version ? mask.version : ""}
					</div>
				}
				styles={{
					body: {
						padding: 10,
					},
					header: {
						padding: 5,
					},
				}}
				hoverable
				className={`${styles["mask-item"]} ${styles["mask-item-card"]}`}
				onClick={() => onItemClick(mask)}
			>
				<Meta
					description={
						mask.description ? mask.description : "作者很懒, 还没有上传介绍"
					}
				/>
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
						key="view"
						text={`${mask.hotness ? mask.hotness : "0"}`}
						className={styles.hotness}
					/>
				</div>
			</Card>
		);
	};

	const rendPrivateAgent = () => {
		return (
			<div className={styles["mask-item-info"]}>
				<h3>{mask.name}</h3>
				<p>{mask.description}</p>
				<button onClick={() => onItemClick(mask)}>Chat</button>
				{!mask.builtin && (
					<button onClick={() => onDelete(mask)}>Delete</button>
				)}
			</div>
		);
	};

	const renderComponent = () => {
		if (styleName === "assistant") {
			return renderPublicAgent();
		} else if (styleName === "info") {
			return rendPrivateAgent();
		} else {
			return renderPublicAgent();
		}
	};

	return renderComponent();
};

export default MaskComponent;
