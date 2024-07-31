import { useEffect, useRef, useState } from "react";
import { Path, SlotID } from "../../constant";
import styles from "./new-chat.module.scss";

import { Avatar, Card, Skeleton, Switch, Button, Row } from "antd";
const { Meta } = Card;
import { IconButton } from "@/app/components/button";
import { EmojiAvatar } from "../components/emoji";
import LeftIcon from "@/app/icons/left.svg";
import LightningIcon from "@/app/icons/lightning.svg";
import EyeIcon from "@/app/icons/eye.svg";

import { useLocation, useNavigate } from "react-router-dom";
import { useMaskStore, createEmptyMask } from "../../store/mask";
import { Mask } from "../../types/mask";
import { useUserStore } from "../../store";
import Locale from "../../locales";
import { useAppConfig, useChatStore } from "../../store";
import { MaskAvatar } from "./mask";
import { useCommand } from "../../command";
import { showConfirm } from "@/app/components/ui-lib";
import { BUILTIN_MASK_STORE } from "../../masks";
import Image from "next/image";
import { type } from "os";
import { useMasks } from "../../hooks/useMasks";
import { useAuthStore } from "../../store/auth";
import { featureMask } from "../../masks/featureMask_cn";

function MaskItem(props: { mask: Mask; onClick?: () => void }) {
	return (
		<div className={styles["mask"]} onClick={props.onClick}>
			<MaskAvatar mask={props.mask} />
			<div className={styles["mask-name"] + " one-line"}>{props.mask.name}</div>
		</div>
	);
}

function featureMaskGroup(masks: Mask[]) {
	// 2个filter , build-in mask 和 feature mask
	const featureMasks = masks.filter(
		(mask) => mask.featureMask === true && mask.type !== "roleplay",
	);
	return [...featureMasks];
}

function FeatureMaskItem(mask: Mask, startChat: (mask?: Mask) => void) {
	console.log("item", mask);
	return (
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
				<Button key={mask.id} type="primary" onClick={() => startChat(mask)}>
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
						src={mask?.img || ""}
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
}

export function NewChat() {
	const chatStore = useChatStore();
	const maskStore = useMaskStore();
	const userStore = useUserStore();
	const {
		masks: maskfetch,
		fetchPromptsCallback,
		fetchTagsCallback,
	} = useMasks();
	const { isAuthenticated } = useAuthStore();

	const navigate = useNavigate();

	const [masks, setMasks] = useState<Mask[]>([]);
	const [featureGroup, setFeatureGroup] = useState<Mask[]>([]);

	useEffect(() => {
		const initialize = async () => {
			try {
				const { data, total, is_next } = await fetchPromptsCallback(1, 100);
				const featureMasks = featureMaskGroup(data);
				console.log("feature", featureMasks); // 确保这里输出的是有效的数组
				const tags = await fetchTagsCallback(1, 100);
				setFeatureGroup(featureMasks);
				setMasks(data);
				maskStore.updatestate({ total });
			} catch (error) {
				console.error("Error fetching prompts:", error);
			}
		};
		initialize();
	}, []);

	const startChat = (mask?: Mask) => {
		setTimeout(() => {
			chatStore.newSession(mask, userStore);
			navigate(Path.Chat);
		}, 10);
	};

	useCommand({
		mask: (id) => {
			try {
				const mask = maskStore.get(id) ?? BUILTIN_MASK_STORE.get(id);
				startChat(mask ?? undefined);
			} catch {
				console.error("[New Chat] failed to create chat from mask id=", id);
			}
		},
	});
	// 确保在数据加载时处理加载状态或空状态
	if (!masks) {
		return <div>Loading...</div>;
	}
	return (
		<div className={styles["new-chat"]}>
			<div className={styles["mask-intro"]}>
				<div className={styles["title"]}>{Locale.NewChat.Title}</div>
				<div className={styles["sub-title"]}>{Locale.NewChat.SubTitle}</div>
				<div className={styles["actions"]}>
					<IconButton
						key="skip"
						text={Locale.NewChat.Skip}
						onClick={() => startChat()}
						icon={<LightningIcon />}
						type="primary"
						shadow
						className={"primary"}
					/>

					<IconButton
						key="more"
						text={Locale.NewChat.More}
						onClick={() => navigate(Path.Masks)}
						icon={<EyeIcon />}
						shadow
					/>
				</div>
			</div>
			<Row
				gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
				justify="center"
				className={styles["feature-masks"]}
			>
				{isAuthenticated ? (
					featureGroup.length > 0 ? (
						featureGroup.map((mask) => FeatureMaskItem(mask, startChat))
					) : (
						<div>没有可用的特征面具</div>
					)
				) : (
					<>请登录后开启该功能</>
				)}
			</Row>
		</div>
	);
}
