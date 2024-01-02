// basic react module
import React from "react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import styles from "./paitings.module.scss";

import ResetIcon from "@/app/icons/reload.svg";
import AddIcon from "@/app/icons/add.svg";
import CloseIcon from "@/app/icons/close.svg";
import CopyIcon from "@/app/icons/copy.svg";
import ClearIcon from "@/app/icons/clear.svg";
import LoadingIcon from "@/app/icons/three-dots.svg";
import EditIcon from "@/app/icons/edit.svg";
import EyeIcon from "@/app/icons/eye.svg";
import DownloadIcon from "@/app/icons/download.svg";
import UploadIcon from "@/app/icons/upload.svg";
import ConfigIcon from "@/app/icons/config.svg";
import ConfirmIcon from "@/app/icons/confirm.svg";

import ConnectionIcon from "@/app/icons/connection.svg";
import CloudSuccessIcon from "@/app/icons/cloud-success.svg";
import CloudFailIcon from "@/app/icons/cloud-fail.svg";

// 导入 Masonry 和 LazyLoadImage 组件
import Masonry from "react-masonry-css";
import { Image, MenuProps, Space, TabsProps } from "antd";
import { LazyLoadImage } from "react-lazy-load-image-component";

import {
	DownloadOutlined,
	RotateLeftOutlined,
	RotateRightOutlined,
	SwapOutlined,
	ZoomInOutlined,
	ZoomOutOutlined,
} from "@ant-design/icons";

import { IconButton } from "@/app/components/button";
import {
	useUpdateStore,
	useAccessStore,
	useAppConfig,
	useUserStore,
} from "@/app/store";

import Locale, {
	AllLangs,
	ALL_LANG_OPTIONS,
	changeLang,
	getLang,
} from "@/app/locales";
import { copyToClipboard } from "@/app/utils";
import {
	Azure,
	OPENAI_BASE_URL,
	Path,
	RELEASE_URL,
	STORAGE_KEY,
	ServiceProvider,
	SlotID,
	UPDATE_URL,
} from "@/app/constant";
import { Prompt, SearchService, usePromptStore } from "@/app/store/prompt";
import { ErrorBoundary } from "@/app/components/error";
import { InputRange } from "@/app/components/input-range";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/app/components/emoji";
import { getClientConfig } from "@/app/config/client";
import { useSyncStore } from "@/app/store/sync";
import { useAuthStore } from "@/app/store/auth";
import { getPaintings } from "@/app/api/backend/paintings";
import { Tabs } from "antd";

const { TabPane } = Tabs;

// 定义API返回的画作对象类型
interface Painting {
	id: number;
	task_id: string | null;
	model: string;
	prompt: string;
	prompt_en: string;
	action: string;
	status: string;
	image_url: string;
	publish: boolean;
	create_date: string;
	user: number;
}

// 定义API响应的类型
interface PaintingsResponse {
	code: number;
	msg: string;
	page: number;
	limit: number;
	total: number;
	is_next: boolean;
	is_previous: boolean;
	data: Painting[];
}

interface PaintingsMasonryProps {
	paintings: Painting[];
	hasMore: boolean;
	onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}
const PaintingsMasonry: React.FC<PaintingsMasonryProps> = ({
	paintings,
	hasMore,
	onScroll,
}) => {
	// Masonry布局的断点
	const breakpointColumnsObj = {
		default: 5,
		1800: 5,
		1440: 4,
		1000: 3,
		700: 2,
	};

	const onDownload = (src: any) => {
		fetch(src)
			.then((response) => response.blob())
			.then((blob) => {
				const url = URL.createObjectURL(new Blob([blob]));
				const link = document.createElement("a");
				link.href = url;
				link.download = "image.png";
				document.body.appendChild(link);
				link.click();
				URL.revokeObjectURL(url);
				link.remove();
			});
	};

	const onCopy = (src: any) => {
		copyToClipboard(src);
	};

	return (
		<div onScroll={onScroll} className={styles["gallery-container"]}>
			<Masonry
				breakpointCols={breakpointColumnsObj}
				className={styles["masonry-grid"]}
				columnClassName={styles["masonry-grid_column"]}
			>
				{paintings.map((painting, index) => (
					<div
						key={index}
						style={{ maxWidth: "400px" }}
						className={styles["masonry-grid-item"]}
					>
						<Image
							src={painting.image_url}
							alt={painting.prompt_en}
							style={{ width: "100%", height: "auto" }}
							className={styles["gallery-image"]}
							placeholder={
								<Image
									src={painting.image_url}
									alt={painting.prompt_en}
									style={{ width: "100%", filter: "blur(20px)" }}
								/>
							}
							preview={{
								toolbarRender: (
									_,
									{
										transform: { scale },
										actions: {
											onFlipY,
											onFlipX,
											onRotateLeft,
											onRotateRight,
											onZoomOut,
											onZoomIn,
										},
									},
								) => (
									<Space size={12} className="toolbar-wrapper">
										<DownloadOutlined onClick={onDownload} />
										<SwapOutlined rotate={90} onClick={onFlipY} />
										<SwapOutlined onClick={onFlipX} />
										<RotateLeftOutlined onClick={onRotateLeft} />
										<RotateRightOutlined onClick={onRotateRight} />
										<ZoomOutOutlined
											disabled={scale === 1}
											onClick={onZoomOut}
										/>
										<ZoomInOutlined
											disabled={scale === 50}
											onClick={onZoomIn}
										/>
									</Space>
								),

								mask: (
									<div className={styles["gallery-image-mask"]}>
										<div className={styles["gallery-image-mask-title"]}>
											{painting.prompt_en}
										</div>
										<div className={styles["gallery-image-mask-actions"]}>
											<IconButton
												icon={<CopyIcon />}
												text="复制提示词"
												onClick={(e) => {
													e.stopPropagation();
													onCopy(painting.prompt_en);
												}}
											/>
										</div>
									</div>
								),
							}}
							srcSet={`${painting.image_url} 300w`}
							loading="lazy"
						/>
					</div>
				))}
			</Masonry>
			{!hasMore && <div style={{ textAlign: "center" }}>没有更多了</div>}
		</div>
	);
};

const App: React.FC = () => {
	const navigate = useNavigate();
	const userid = useUserStore((state) => state.user?.id);

	const [publicPaintings, setPublicPaintings] = useState<Painting[]>([]);
	const [privatePaintings, setPrivatePaintings] = useState<Painting[]>([]);
	const [hasMorePublic, setHasMorePublic] = useState<boolean>(true);
	const [hasMorePrivate, setHasMorePrivate] = useState<boolean>(true);

	const [activeTab, setActiveTab] = useState<string>("private"); // 添加一个状态来跟踪当前激活的标签页

	const publicloadingRef = useRef<boolean>(false); // 使用useRef来避免额外的渲染
	const publicPageRef = useRef<number>(1); // 使用useRef来存储page状态

	const PrivateloadingRef = useRef<boolean>(false); // 使用useRef来避免额外的渲染
	const PrivatePageRef = useRef<number>(1); // 使用useRef来存储page状态

	const fetchPublicPaintings = async () => {
		if (publicloadingRef.current || !hasMorePublic) return; // 如果正在加载或没有更多画作，直接返回
		publicloadingRef.current = true; // 开始加载数据
		const response: PaintingsResponse = await getPaintings({
			page: publicPageRef.current,
			limit: 20,
		});
		publicloadingRef.current = false; // 加载完成
		const filterPaintings = response.data.filter(
			(painting) => painting.image_url && painting.publish,
		);
		if (response.code === 2000) {
			setPublicPaintings((prev) => [...prev, ...filterPaintings]);
			setHasMorePublic(response.is_next);
		}
	};

	// Fetch private paintings
	const fetchPrivatePaintings = async () => {
		if (PrivateloadingRef.current || !hasMorePrivate) return;
		PrivateloadingRef.current = true;
		const response: PaintingsResponse = await getPaintings({
			page: PrivatePageRef.current,
			user: userid,
			limit: 20,
		});
		PrivateloadingRef.current = false;
		const filterPaintings = response.data.filter(
			(painting) => painting.image_url && painting.publish,
		);
		if (response.code === 2000) {
			setPrivatePaintings((prev) => [...prev, ...filterPaintings]);
			setHasMorePrivate(response.is_next);
		}
	};

	// 首次渲染和page改变时调用fetchPaintings
	useEffect(() => {
		fetchPrivatePaintings();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Fetch public paintings when the public tab is clicked
	const onTabChange = (activeKey: string) => {
		setActiveTab(activeKey); // 更新当前激活的标签页
		if (activeKey === "public" && publicPaintings.length === 0) {
			fetchPublicPaintings(); // 如果是公共标签页并且公共画作列表为空，则加载公共画作
		}
	};

	const handlePublicScroll = useCallback(
		(event: React.UIEvent<HTMLDivElement>) => {
			const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
			if (
				scrollTop + clientHeight >= scrollHeight - 100 &&
				hasMorePublic &&
				!publicloadingRef.current
			) {
				publicPageRef.current += 1; // 更新page值
				fetchPublicPaintings(); // 调用fetchPaintings
			}
		},
		[hasMorePublic], // 移除loading依赖，因为我们使用useRef来跟踪加载状态
	);

	const handlePrivateScroll = useCallback(
		(event: React.UIEvent<HTMLDivElement>) => {
			const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
			if (
				scrollTop + clientHeight >= scrollHeight - 100 &&
				hasMorePrivate &&
				!PrivateloadingRef.current
			) {
				PrivatePageRef.current += 1; // 更新page值
				fetchPrivatePaintings(); // 调用fetchPaintings
			}
		},
		[hasMorePrivate], // 移除loading依赖，因为我们使用useRef来跟踪加载状态
	);

	// items
	const items: TabsProps["items"] = [
		{
			key: "private",
			label: "私有画廊",
			children: (
				<PaintingsMasonry
					paintings={privatePaintings} // 或 publicPaintings，取决于当前标签页
					hasMore={hasMorePrivate} // 或 hasMorePublic
					onScroll={handlePrivateScroll} // 或 handlePublicScroll
				/>
			),
		},
		{
			key: "public",
			label: "公共画廊",
			children: (
				<PaintingsMasonry
					paintings={publicPaintings} // 或 publicPaintings，取决于当前标签页
					hasMore={hasMorePublic} // 或 hasMorePublic
					onScroll={handlePublicScroll} // 或 handlePublicScroll
				/>
			),
		},
	];

	return (
		<ErrorBoundary>
			<div className="window-header" data-tauri-drag-region>
				<div className="window-header-title">
					<div className="window-header-main-title">画廊</div>
					<div className="window-header-sub-title">
						{Locale.Settings.SubTitle}
					</div>
				</div>
				<div className="window-actions">
					<div className="window-action-button">
						<IconButton
							icon={<CloseIcon />}
							onClick={() => navigate(Path.Home)}
							bordered
						/>
					</div>
				</div>
			</div>
			<Tabs
				defaultActiveKey="private"
				onChange={onTabChange}
				centered
				items={items}
			></Tabs>
		</ErrorBoundary>
	);
};

export default App;
