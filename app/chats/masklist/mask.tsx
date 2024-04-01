"use client";
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

import { DEFAULT_MASK_AVATAR, Mask, useMaskStore } from "@/app/store/mask";
import {
	ChatMessage,
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
import { useEffect, useState } from "react";
import { copyToClipboard, downloadAs, readFromFile } from "@/app/utils";
import { Updater } from "@/app/typing";
import { ModelConfigList } from "@/app/components/model-config";
import { FileName, Path } from "@/app/constant";
import { BUILTIN_MASK_STORE } from "@/app/masks";
import { nanoid } from "nanoid";
import {
	DragDropContext,
	Droppable,
	Draggable,
	OnDragEndResponder,
} from "@hello-pangea/dnd";

import { Card, Button, Switch, Segmented } from "antd";
import MaskComponent from "./maskitem";

import { MaskConfig } from "../mask-components";

import MultipleTag from "@/app/components/multipletags";

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
	const chatStore = useChatStore();
	const [selectedTags, setSelectedTags] = useState<string[]>(["全部"]);
	const [isBuiltin, setisBuiltin] = useState(false);
	const [filterLang, setFilterLang] = useState<Lang>();
	const [filterCategory, setFilterCategory] = useState<typeof MaskCategory>();
	const [searchMasks, setSearchMasks] = useState<Mask[]>([]);
	const [searchText, setSearchText] = useState("");
	const [cardStyle, setCardStyle] = useState<
		"roleplay" | "assistant" | "workflow"
	>("assistant");

	const [segmentValue, setsegmentValue] = useState<string | number>("场景助手");

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
		console.log("fu", selectedTags);
		setSelectedTags(selectedTags);
	};

	const allMasks = maskStore.getAll().filter((m) => {
		if (filterLang && m.lang !== filterLang) {
			return false;
		}
		if (!selectedTags.includes("全部") && !selectedTags.includes(m.category)) {
			return false;
		}
		if (isBuiltin && !!m.builtin) {
			return false;
		}
		if (cardStyle === "roleplay" && m.type !== "roleplay") {
			return false;
		}
		if (
			cardStyle === "assistant" &&
			(m.type === "roleplay" || m.type === "workflow")
		) {
			return false;
		}
		return true;
	});

	const masks = searchText.length > 0 ? searchMasks : allMasks;

	// simple search, will refactor later
	const onSearch = (text: string) => {
		setSearchText(text);
		if (text.length > 0) {
			const result = allMasks.filter((m) => m.name.includes(text));
			setSearchMasks(result);
		} else {
			setSearchMasks(allMasks);
		}
	};

	const [editingMaskId, setEditingMaskId] = useState<string | undefined>();
	const editingMask =
		maskStore.get(editingMaskId) ?? BUILTIN_MASK_STORE.get(editingMaskId);
	const closeMaskModal = () => setEditingMaskId(undefined);

	const downloadAll = () => {
		downloadAs(JSON.stringify(masks.filter((v) => !v.builtin)), FileName.Masks);
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
							{Locale.Mask.Page.SubTitle(allMasks.length)}
						</div>
					</div>

					<div className="window-actions">
						{/* <div className="window-action-button">
              <IconButton
                icon={<DownloadIcon />}
                bordered
                onClick={downloadAll}
                text={Locale.UI.Export}
              />
            </div> */}
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
							<Switch
								defaultChecked={isBuiltin}
								onChange={handleSwitchChange}
								unCheckedChildren="只看自建"
								checkedChildren="查看全部"
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

						<Select
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
						</Select>

						<IconButton
							className={styles["mask-create"]}
							icon={<AddIcon />}
							text={Locale.Mask.Page.Create}
							bordered
							onClick={() => {
								const createdMask = maskStore.create();
								setEditingMaskId(createdMask.id);
							}}
						/>
					</div>
					{/* ====顶部end==== */}

					<div className={`${styles["mask-list"]} flex-container`}>
						{masks.map((m) => (
							<MaskComponent
								mask={m}
								key={m.id}
								styleName={cardStyle}
								setEditingMaskId={(id) => setEditingMaskId(id)}
							/>
						))}
					</div>
				</div>
			</div>

			{editingMask && (
				<div className="modal-mask">
					<Modal
						title={Locale.Mask.EditModal.Title(editingMask?.builtin)}
						onClose={closeMaskModal}
						actions={[
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
								key="copy"
								icon={<CopyIcon />}
								bordered
								text={Locale.Mask.EditModal.Clone}
								onClick={() => {
									navigate(Path.Masks);
									maskStore.create(editingMask);
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
