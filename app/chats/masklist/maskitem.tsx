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
import { Card } from "antd";
import { IconButton } from "@/app/components/button";
import { Avatar, AvatarPicker } from "@/app/components/emoji";
import { Avatar as BotAvatar } from "antd";
import { DEFAULT_MASK_AVATAR, Mask, useMaskStore } from "@/app/store/mask";
import {
	ChatMessage,
	createMessage,
	ModelConfig,
	useAppConfig,
	useChatStore,
	useUserStore,
} from "@/app/store";
import { FileName, Path } from "@/app/constant";

import { useNavigate } from "react-router-dom";

const { Meta } = Card;

export function MaskAvatar(props: { mask: Mask }) {
	return props.mask.avatar !== DEFAULT_MASK_AVATAR ? (
		<Avatar mask={props.mask} />
	) : (
		<Avatar mask={props.mask} />
	);
}

type MaskComponentProps = {
	mask: Mask;
	setEditingMaskId: (id: string) => void;
	styleName?: string;
};

const MaskComponent: React.FC<MaskComponentProps> = ({
	mask,
	setEditingMaskId,
	styleName = "",
}) => {
	const navigate = useNavigate();

	const maskStore = useMaskStore();
	const chatStore = useChatStore();
	const userStore = useUserStore();

	const onChat = () => {
		setTimeout(() => {
			chatStore.newSession(mask, userStore);
		}, 10);
		navigate(Path.Chat);
	};

	const onDelete = () => {
		console.log("onDelete");
		maskStore.delete(mask.id);
	};
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

	const renderCard = () => {
		return (
			<Card
				title={
					<div className={styles["mask-header"]}>
						{<MaskAvatar mask={mask} />} {mask.name}{" "}
						{mask.version ? mask.version : ""}
					</div>
				}
				headStyle={{ padding: 5 }}
				extra={<span className={styles["label"]}>{mask.category}</span>}
				hoverable
				className={`${styles["mask-item"]} ${getCardStyle()}`}
				bodyStyle={{ padding: 10 }}
				actions={[
					<IconButton
						icon={<AddIcon />}
						key="chat"
						text={Locale.Mask.Item.Chat}
						onClick={() => onChat()}
					/>,
					<>
						{" "}
						{mask.builtin ? (
							<IconButton
								icon={<EyeIcon />}
								key="view"
								text={`热度: ${mask.hotness ? mask.hotness : "0"}`}
								// onClick={() => setEditingMaskId(mask.id)}
							/>
						) : (
							<IconButton
								icon={<EditIcon />}
								key="edit"
								text={Locale.Mask.Item.Edit}
								onClick={() => setEditingMaskId(mask.id)}
							/>
						)}
					</>,
					<>
						{" "}
						{!mask.builtin && (
							<IconButton
								icon={<DeleteIcon />}
								text={Locale.Mask.Item.Delete}
								key="delete"
								onClick={async () => {
									if (await showConfirm(Locale.Mask.Item.DeleteConfirm)) {
										onDelete();
									}
								}}
							/>
						)}
					</>,
				]}
			>
				<Meta
					// avatar={<MaskAvatar mask={mask} />}
					description={
						mask.description ? mask.description : "作者很懒, 还没有上传介绍"
					}
				/>
			</Card>
		);
	};

	const renderInfo = () => {
		return (
			<div className={styles["mask-item-info"]}>
				<h3>{mask.name}</h3>
				<p>{mask.description}</p>
				<button onClick={onChat}>Chat</button>
				{!mask.builtin && <button onClick={onDelete}>Delete</button>}
			</div>
		);
	};

	const ColorList = ["#f56a00", "#7265e6", "#ffbf00", "#00a2ae"];
	const getRandomColor = () => {
		return ColorList[Math.floor(Math.random() * ColorList.length)];
	};

	const renderRoleplay = () => {
		const author = mask.author || "@创世神";

		return (
			<div className={styles["mask-item-roleplay"]}>
				<BotAvatar
					style={{ backgroundColor: getRandomColor(), fontSize: "32px" }}
					size={100}
					src={mask.img}
				>
					{mask.name}
				</BotAvatar>
				<div className={styles["author"]}>{author}</div>

				<h1 className={styles["name"]}>{mask.name}</h1>
				<IconButton
					icon={<AddIcon />}
					key="chat"
					text={Locale.Mask.Item.Chat}
					onClick={() => onChat()}
				/>
				<p className={styles["description"]}>
					{mask.description ?? "作者很懒, 还没有上传介绍"}
				</p>
				<div className={styles["actions"]}>
					{mask.builtin ? (
						<IconButton
							icon={<EyeIcon />}
							key="view"
							text={`热度: ${mask.hotness ? mask.hotness : "0"}`}
							// onClick={() => setEditingMaskId(mask.id)}
						/>
					) : (
						<IconButton
							icon={<EditIcon />}
							key="edit"
							text={Locale.Mask.Item.Edit}
							onClick={() => setEditingMaskId(mask.id)}
						/>
					)}

					{!mask.builtin && (
						<IconButton
							icon={<DeleteIcon />}
							text={Locale.Mask.Item.Delete}
							key="delete"
							onClick={async () => {
								if (await showConfirm(Locale.Mask.Item.DeleteConfirm)) {
									onDelete();
								}
							}}
						/>
					)}
				</div>
			</div>
		);
	};

	const renderComponent = () => {
		if (styleName === "assistant") {
			return renderCard();
		} else if (styleName === "info") {
			return renderInfo();
		} else if (styleName === "roleplay") {
			return renderRoleplay();
		} else {
			return renderCard();
		}
	};

	return renderComponent();
};

export default MaskComponent;
