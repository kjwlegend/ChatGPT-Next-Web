import { useEffect, useRef, useState } from "react";
import { Path, SlotID } from "../constant";
import styles from "./new-chat.module.scss";

import { Avatar, Card, Skeleton, Switch, Button, Row } from "antd";
const { Meta } = Card;
import { IconButton } from "@/app/components/button";
import { EmojiAvatar } from "./emoji";
import LeftIcon from "../icons/left.svg";
import LightningIcon from "../icons/lightning.svg";
import EyeIcon from "../icons/eye.svg";

import { useLocation, useNavigate } from "react-router-dom";
import { Mask, useMaskStore, createEmptyMask } from "../store/mask";
import { useUserStore } from "../store";
import Locale from "../locales";
import { useAppConfig, useChatStore } from "../store";
import { MaskAvatar } from "./masklist/mask";
import { useCommand } from "../command";
import { showConfirm } from "@/app/components/ui-lib";
import { BUILTIN_MASK_STORE } from "../masks";
import Image from "next/image";
import { type } from "os";

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
		(mask) =>
			mask.featureMask === true &&
			mask.builtin === true &&
			mask.type !== "roleplay",
	);
	return [...featureMasks];
}

function FeatureMaskItem(mask: Mask, startChat: (mask?: Mask) => void) {
	return (
		<Card
			style={{ maxWidth: 300 }}
			title={mask.name}
			extra={<span key={mask.id}>角色等级: {mask.version} </span>}
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
					<p>{mask.constellation}</p>
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

	const navigate = useNavigate();
	const config = useAppConfig();

	const [masks, setMasks] = useState<Mask[]>([]);
	const [featureGroup, setFeatureGroup] = useState<Mask[]>([]);

	useEffect(() => {
		async function fetchMasks() {
			const masksData = await maskStore.getAll();

			setMasks(masksData);
			setFeatureGroup(featureMaskGroup(masksData));
		}

		fetchMasks();
	}, [maskStore]);

	const maskRef = useRef<HTMLDivElement>(null);

	const { state } = useLocation();

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
						key="return"
						icon={<LeftIcon />}
						text={Locale.NewChat.Return}
						onClick={() => navigate(Path.Home)}
						shadow
					></IconButton>
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

					{!state?.fromHome && (
						<IconButton
							key="not-show"
							text={Locale.NewChat.NotShow}
							onClick={async () => {
								if (await showConfirm(Locale.NewChat.ConfirmNoShow)) {
									startChat();
									config.update(
										(config) => (config.dontShowMaskSplashScreen = true),
									);
								}
							}}
							icon={<EyeIcon />}
							shadow
						></IconButton>
					)}
				</div>
			</div>
			<Row
				gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
				justify="center"
				className={styles["feature-masks"]}
			>
				{featureGroup.map((mask) => FeatureMaskItem(mask, startChat))}
			</Row>
		</div>
	);
}
