import React from "react";
import { Path } from "@/app/constant";
import styles from "./styles/NewChat.module.scss";
import { Button, Card, Avatar } from "antd";
import { useNavigate } from "react-router-dom";
import { useMaskStore } from "@/app/store/mask";
import { Mask } from "@/app/types/mask";
import { useUserStore, useChatStore } from "@/app/store";
import { useCommand } from "@/app/command";
import { BUILTIN_MASK_STORE } from "@/app/masks";
import { useNewChat } from "./hooks/useNewChat";
import FeatureMaskItem from "./components/FeatureMaskItem";
import OtherMaskItem from "./components/OtherMaskItem";
import SearchBar from "./components/SearchBar";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export function NewChat() {
	const navigate = useNavigate();
	const { featureGroup, otherMasks, isAuthenticated } = useNewChat();
	const chatStore = useChatStore();
	const maskStore = useMaskStore();
	const userStore = useUserStore();

	const startChat = (mask?: Mask) => {
		setTimeout(() => {
			chatStore.newSession(mask, userStore);
			navigate(Path.Chat);
		}, 10);
	};

	const handleSearch = (value: string) => {
		navigate(Path.Masks, { state: { searchTerm: value } });
	};

	const handleTagClick = (tag: string) => {
		navigate(Path.Masks, { state: { selectedTag: tag } });
	};

	const tags = Object.values(maskStore.tags).map((tag) => tag.tag_name);

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

	return (
		<div className={styles["new-chat"]}>
			<h1 className={styles.title}>选择一个助手</h1>
			<div className={styles["main-content"]}>
				<Card className={styles["quick-actions"]}>
					<h2 className={styles["section-title"]}>快速操作</h2>
					<div className={styles["button-group"]}>
						<Button
							className={styles["full-width-button"]}
							onClick={() => startChat()}
						>
							直接开始
						</Button>
						<Button
							className={styles["full-width-button"]}
							onClick={() => navigate("/create-agent")}
						>
							创建自定义智能体
						</Button>
					</div>
				</Card>

				<Card className={styles["recommended-agents"]}>
					<h2 className={styles["section-title"]}>推荐智能体</h2>
					<Swiper
						className={styles["feature-carousel"]}
						modules={[Navigation, Pagination]}
						spaceBetween={10}
						slidesPerView={3.5}
						pagination={{ clickable: true }}
						breakpoints={{
							320: {
								slidesPerView: 1.5,
								spaceBetween: 20,
							},
							480: {
								slidesPerView: 2,
								spaceBetween: 20,
							},
							640: {
								slidesPerView: 2.5,
								spaceBetween: 30,
							},
							768: {
								slidesPerView: 3,
								spaceBetween: 30,
							},
						}}
					>
						{featureGroup.map((mask) => (
							<SwiperSlide key={mask.id} className={styles["carousel-item"]}>
								<FeatureMaskItem mask={mask} startChat={startChat} />
							</SwiperSlide>
						))}
					</Swiper>
				</Card>
			</div>

			<Card className={styles["search-filter"]}>
				<SearchBar
					onSearch={handleSearch}
					tags={tags}
					onTagClick={handleTagClick}
				/>
			</Card>

			<Card className={styles["all-agents"]}>
				<div className={styles.header}>
					<h2 className={styles["section-title"]}>所有智能体</h2>
					<Button onClick={() => navigate(Path.Masks)}>查看全部</Button>
				</div>
				<div className={styles["agents-grid"]}>
					{otherMasks.slice(0, 6).map((mask) => (
						<div key={mask.id} className={styles["agent-item"]}>
							<Avatar src={mask.avatar} size={64} />
							<h3>{mask.name}</h3>
							<p>{mask.description}</p>
							<Button onClick={() => startChat(mask)}>开始聊天</Button>
						</div>
					))}
				</div>
			</Card>
		</div>
	);
}

export default NewChat;
