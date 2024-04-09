"use client";
import { useRef } from "react";
import { IconButton } from "@/app/components/button";
import { ErrorBoundary } from "@/app/components/error";

import styles from "./mask.module.scss";

import DownloadIcon from "@/app/icons/download.svg";
import UploadIcon from "@/app/icons/upload.svg";
import EditIcon from "@/app/icons/edit.svg";
import AddIcon from "@/app/icons/add.svg";
import CloseIcon from "@/app/icons/close.svg";
import DeleteIcon from "@/app/icons/delete.svg";
import EyeIcon from "@/app/icons/eye.svg";
import CopyIcon from "@/app/icons/copy.svg";
import DragIcon from "@/app/icons/drag.svg";

import { DEFAULT_MASK_AVATAR, useMaskStore } from "@/app/store/mask";
import { Mask } from "@/app/types/mask";
import {
	createMessage,
	ModelConfig,
	useAppConfig,
	useChatStore,
} from "@/app/store";
import { ROLES } from "@/app/client/api";
import {
	Input,
	List,
	ListItem,
	Modal,
	Popover,
	Select,
	showConfirm,
} from "@/app/components/ui-lib";
import { BotAvatar } from "@/app/components/emoji";
import Locale, { AllLangs, ALL_LANG_OPTIONS, Lang } from "@/app/locales";
import { MaskCategory, maskCategories, MaskCategoryType } from "@/app/constant";

import { useNavigate } from "react-router-dom";
import chatStyle from "../chat.module.scss";
import { use, useCallback, useEffect, useState } from "react";
import { copyToClipboard, downloadAs, readFromFile } from "@/app/utils";
import { Updater } from "@/app/typing";
import { ModelConfigList } from "@/app/components/model-config";
import { FileName, Path } from "@/app/constant";
import { BUILTIN_MASKS, BUILTIN_MASK_STORE } from "@/app/masks";
import { nanoid } from "nanoid";
import {
	DragDropContext,
	Droppable,
	Draggable,
	OnDragEndResponder,
} from "@hello-pangea/dnd";

import { Card, Button, Switch, Segmented, Checkbox } from "antd";
import MaskComponent from "./maskitem";

import { MaskConfig } from "../mask-components";

import MultipleTag from "@/app/components/multipletags";
import { on } from "events";
import { filter } from "cheerio/lib/api/traversing";
import { useMasks } from "@/app/masks/useMasks";
import { FilterOptions } from "react-markdown/lib/react-markdown";

const { Meta } = Card;

// drag and drop helper function
function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
	const result = [...list];
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);
	return result;
}

export function MaskAvatar(props: { mask: Mask }) {
	return props.mask.avatar !== DEFAULT_MASK_AVATAR ? (
		<BotAvatar mask={props.mask} />
	) : (
		<BotAvatar mask={props.mask} />
	);
}

export function MaskPage() {
	const navigate = useNavigate();

	const maskStore = useMaskStore();
	const { masks: maskfetch, fetchPrompts } = useMasks();

	const { masks: originalMask, maskslist } = maskStore;
	const chatStore = useChatStore();
	const [selectedTags, setSelectedTags] = useState<string[]>(["全部"]);
	const [isBuiltin, setisBuiltin] = useState<boolean | undefined>(true);
	const [filterLang, setFilterLang] = useState<Lang>("cn");
	const [filterCategory, setFilterCategory] = useState<typeof MaskCategory>();
	const [searchText, setSearchText] = useState("");
	const [cardStyle, setCardStyle] = useState<
		"roleplay" | "assistant" | "workflow"
	>("assistant");

	const [segmentValue, setsegmentValue] = useState<string | number>("场景助手");
	const [filterOptions, setFilterOptions] = useState<Object>({
		lang: "",
		tags: [],
		builtin: false,
		type: "",
		searchTerm: "",
		author: "",
	});

	const [allMasks, setallMasks] = useState<Mask[]>([]);
	const [filterMasks, setFilterMasks] = useState<Mask[]>([]);
	const [userMasks, setUserMasks] = useState<Mask[]>([]);
	const [author, setAuthor] = useState<string | undefined>("");

	const [totalPrompts, setTotalPrompts] = useState(0);
	const [isNext, setIsNext] = useState(true);
	const [page, setPage] = useState(1);

	// create a scroll ref to detect scroll container
	const scrollRef = useRef<HTMLDivElement>(null);
	const limit = 25; // 或者其他你需要的限制数
	const loaderRef = useRef(null);

	const loadMore = useCallback(async () => {
		console.log(isNext, page, totalPrompts);
		if (isNext) {
			const result = await fetchPrompts(page, limit);
			if (result.is_next !== undefined) {
				setIsNext(result.is_next);
			}
			if (result.total !== undefined) {
				setTotalPrompts(result.total);
			}
			setPage((prevPage) => prevPage + 1);
		}
	}, [isNext, page, limit]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadMore();
				}
			},
			{ threshold: 1.0 },
		);

		if (loaderRef.current) {
			observer.observe(loaderRef.current);
		}

		return () => {
			if (loaderRef.current) {
				observer.unobserve(loaderRef.current);
			}
		};
	}, [loadMore]);

	const segmentOptions = [
		{ label: "场景助手", value: "场景助手", disabled: false },
		{ label: "角色对话", value: "角色对话", disabled: false },
		{ label: "工作流", value: "工作流", disabled: true },
	];

	const handleSegmentChange = (value: string | number) => {
		setsegmentValue(value);
		console.log("value = ", value);
		// set card style
		switch (value) {
			case "场景助手":
				setCardStyle("assistant");
				break;
			case "角色对话":
				setCardStyle("roleplay");
				break;
			case "工作流":
				setCardStyle("workflow");
				break;
			default:
				break;
		}
	};

	const handleSwitchChange = (checked: boolean) => {
		setisBuiltin(checked);
		console.log("checked = ", checked);
	};

	const handleTagsChange = (selectedTags: string[]) => {
		console.log("tags", selectedTags);
		setSelectedTags(selectedTags);
	};

	const checkOptions = [
		{ label: "官方", value: "builtin" },
		{ label: "用户", value: "user" },
		{ label: "自建", value: "private" },
	];
	const defaultValue = ["builtin", "user"];
	const handleCheckChange = (checkedValues: any[]) => {
		console.log("option", checkedValues);

		// 定义局部变量来存储新的状态值
		const isBuiltinChecked = checkedValues.includes("builtin");
		const isUserChecked = checkedValues.includes("user");
		const isPrivateChecked = checkedValues.includes("private");

		// // 计算 isBuiltin 的新值
		// const newIsBuiltin = isBuiltinChecked && !isUserChecked;
		// 计算 isBuiltin 的新值，如果同时选择了 builtin 和 user，则设置为 undefined
		const newIsBuiltin = isBuiltinChecked
			? isUserChecked
				? undefined
				: true
			: false;
		// 计算 author 的新值
		const newAuthor = isPrivateChecked ? "kjw1" : undefined;

		console.log("newIsBuiltin", newIsBuiltin, "newAuthor", newAuthor);

		// 更新状态
		setisBuiltin(newIsBuiltin);
		setAuthor(newAuthor);

		// 更新 filterOptions 状态
		setFilterOptions((prevOptions) => ({
			...prevOptions,
			builtin: newIsBuiltin,
			author: newAuthor,
		}));
	};
	const onFilter = () => {
		// 如果存在 filterLang，添加到过滤条件中
		// const filterOptions = {
		// 	lang: filterLang,
		// };
		const newFilterOptions = {
			...filterOptions,
			...(filterLang !== undefined && { lang: filterLang }),
			...(selectedTags && { tags: selectedTags }),
			...(isBuiltin !== undefined && { builtin: isBuiltin }),
			...(cardStyle !== undefined && { type: cardStyle }),
			...(searchText !== undefined && { searchTerm: searchText }),
		};

		// 调用新的 filter 方法，并传递过滤条件对象
		const data = maskStore.filter(newFilterOptions);

		// 更新状态
		return data;
	};

	useEffect(() => {
		const masksData = maskStore.getAll();

		console.log("masksData", masksData.length);
		setallMasks(masksData);
	}, [maskStore]);

	// 依赖项数组中包含所有可能影响过滤的变量
	useEffect(() => {
		let filteredMasks = onFilter();
		filteredMasks = maskStore.sort("createdAt", filteredMasks);
		setFilterMasks(filteredMasks);
	}, [
		filterLang,
		selectedTags,
		isBuiltin,
		cardStyle,
		searchText,
		author,
		maskStore,
	]);

	function deleteHandler() {
		console.log("item delete");
	}

	const onSearch = (text: string) => {
		setSearchText(text);
	};
	const masks = filterMasks;

	const [editingMaskId, setEditingMaskId] = useState<string | undefined>();
	const editingMask =
		maskStore.get(editingMaskId) ?? BUILTIN_MASK_STORE.get(editingMaskId);
	const closeMaskModal = () => setEditingMaskId(undefined);

	const downloadAll = () => {
		downloadAs(JSON.stringify(BUILTIN_MASKS), FileName.Masks);
	};

	const importFromFile = () => {
		readFromFile().then((content) => {
			try {
				const importMasks = JSON.parse(content);
				if (Array.isArray(importMasks)) {
					for (const mask of importMasks) {
						if (mask.name) {
							maskStore.create(mask);
						}
					}
					return;
				}
				//if the content is a single mask.
				if (importMasks.name) {
					maskStore.create(importMasks);
				}
			} catch {}
		});
	};

	return (
		<ErrorBoundary>
			<div className={styles["mask-page"]}>
				<div className="window-header">
					<div className="window-header-title">
						<div className="window-header-main-title">
							{Locale.Mask.Page.Title}
						</div>
						<div className="window-header-submai-title">
							{Locale.Mask.Page.SubTitle(maskStore.total)}
						</div>
					</div>

					<div className="window-actions">
						<div className="window-action-button">
							<IconButton
								icon={<DownloadIcon />}
								bordered
								onClick={downloadAll}
								text={Locale.UI.Export}
							/>
						</div>
						<div className="window-action-button">
							<IconButton
								icon={<UploadIcon />}
								text={Locale.UI.Import}
								bordered
								onClick={() => importFromFile()}
							/>
						</div>
						<div className="window-action-button">
							<IconButton
								icon={<CloseIcon />}
								bordered
								onClick={() => navigate(-1)}
							/>
						</div>
					</div>
				</div>

				<div className={styles["mask-page-body"]}>
					{/* ====顶部筛选器==== */}
					<div>
						<Segmented
							options={segmentOptions}
							value={segmentValue}
							block
							onChange={handleSegmentChange}
							size="large"
						/>
					</div>
					<div className={styles["mask-category"]}>
						<span className={styles["builtin"]}>
							{/* <Switch
								defaultChecked={isBuiltin}
								onChange={handleSwitchChange}
								unCheckedChildren="只看官方"
								checkedChildren="查看全部"
							/>
							<Switch
								defaultChecked={isBuiltin}
								onChange={handleSwitchChange}
								unCheckedChildren="只看自己"
								checkedChildren="查看全部"
							/> */}
							<Checkbox.Group
								options={checkOptions}
								defaultValue={defaultValue}
								onChange={handleCheckChange}
							/>
						</span>
						<MultipleTag
							tagsData={MaskCategory.filter((c) => c.scene === cardStyle).map(
								(c) => c.value,
							)}
							onTagsChange={handleTagsChange}
						/>
					</div>

					<div className={styles["mask-filter"]}>
						<input
							type="text"
							className={styles["search-bar"]}
							placeholder={Locale.Mask.Page.Search}
							onInput={(e) => onSearch(e.currentTarget.value)}
						/>

						{/* <Select
							className={styles["mask-filter-lang"]}
							value={filterLang ?? Locale.Settings.Lang.All}
							onChange={(e) => {
								const value = e.currentTarget.value;
								if (value === Locale.Settings.Lang.All) {
									setFilterLang(undefined);
								} else {
									setFilterLang(value as Lang);
								}
							}}
						>
							<option key="all" value={Locale.Settings.Lang.All}>
								{Locale.Settings.Lang.All}
							</option>
							{AllLangs.map((lang) => (
								<option value={lang} key={lang}>
									{ALL_LANG_OPTIONS[lang]}
								</option>
							))}
						</Select> */}

						<IconButton
							className={styles["mask-create"]}
							icon={<AddIcon />}
							text={Locale.Mask.Page.Create}
							bordered
							onClick={async () => {
								const createdMask = await maskStore.create();
								setEditingMaskId(createdMask.id);
							}}
						/>
					</div>
					{/* ====顶部end==== */}

					<div>
						<div
							className={`${styles["mask-list"]} flex-container`}
							ref={scrollRef}
						>
							{masks.map((m) => (
								<MaskComponent
									mask={m}
									key={m.id}
									styleName={cardStyle}
									setEditingMaskId={(id) => setEditingMaskId(id)}
								/>
							))}
							<div ref={loaderRef} style={{ height: "1px" }} />
						</div>
					</div>
				</div>
			</div>

			{editingMask && (
				<div className="modal-mask">
					<Modal
						title={Locale.Mask.EditModal.Title(editingMask?.builtin)}
						onClose={closeMaskModal}
						actions={[
							<p key="description">新建角色可以享受 1小光币奖励</p>,
							<IconButton
								icon={<DownloadIcon />}
								text={Locale.Mask.EditModal.Download}
								key="export"
								bordered
								onClick={() =>
									downloadAs(
										JSON.stringify(editingMask),
										`${editingMask.name}.json`,
									)
								}
							/>,
							<IconButton
								key="save"
								icon={<CopyIcon />}
								bordered
								text={"保存助手"}
								onClick={() => {
									// navigate(Path.Masks);
									maskStore.saveMask(editingMaskId!);
									setEditingMaskId(undefined);
								}}
							/>,
						]}
					>
						<MaskConfig
							mask={editingMask}
							updateMask={(updater) =>
								maskStore.updateMask(editingMaskId!, updater)
							}
							readonly={editingMask.builtin}
						/>
					</Modal>
				</div>
			)}
		</ErrorBoundary>
	);
}
