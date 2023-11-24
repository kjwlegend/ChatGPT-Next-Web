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
import { Avatar, AvatarPicker } from "@/app/components/emoji";
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
		<Avatar avatar={props.mask.avatar} />
	) : (
		<Avatar model={props.mask} />
	);
}

export function MaskConfig(props: {
	mask: Mask;
	updateMask: Updater<Mask>;
	extraListItems?: JSX.Element;
	readonly?: boolean;
	shouldSyncFromGlobal?: boolean;
}) {
	const [showPicker, setShowPicker] = useState(false);

	const updateConfig = (updater: (config: ModelConfig) => void) => {
		if (props.readonly) return;

		const config = { ...props.mask.modelConfig };
		updater(config);
		props.updateMask((mask) => {
			mask.modelConfig = config;
			// if user changed current session mask, it will disable auto sync
			mask.syncGlobalConfig = false;
		});
	};

	const copyMaskLink = () => {
		const maskLink = `${location.protocol}//${location.host}/chats#${Path.NewChat}?mask=${props.mask.id}`;
		copyToClipboard(maskLink);
	};

	const globalConfig = useAppConfig();

	return (
		<>
			<ContextPrompts
				context={props.mask.context}
				updateContext={(updater) => {
					const context = props.mask.context.slice();
					updater(context);
					props.updateMask((mask) => (mask.context = context));
				}}
			/>

			<List>
				<ListItem title={Locale.Mask.Config.Avatar}>
					<Popover
						content={
							<AvatarPicker
								onEmojiClick={(emoji) => {
									props.updateMask((mask) => (mask.avatar = emoji));
									setShowPicker(false);
								}}
							></AvatarPicker>
						}
						open={showPicker}
						onClose={() => setShowPicker(false)}
					>
						<div
							onClick={() => setShowPicker(true)}
							style={{ cursor: "pointer" }}
						>
							<MaskAvatar mask={props.mask} />
						</div>
					</Popover>
				</ListItem>
				<ListItem title={Locale.Mask.Config.Name}>
					<input
						type="text"
						value={props.mask.name}
						onInput={(e) =>
							props.updateMask((mask) => {
								mask.name = e.currentTarget.value;
							})
						}
					></input>
				</ListItem>
				<ListItem title={Locale.Mask.Config.category}>
					<select
						value={props.mask.category}
						onChange={(e) =>
							props.updateMask((mask) => {
								mask.category = e.currentTarget.value;
							})
						}
					>
						{Object.values(MaskCategory).map((category) => (
							<option key={category.key} value={category.value}>
								{category.value}
							</option>
						))}
					</select>
				</ListItem>
				<ListItem
					title={Locale.Mask.Config.HideContext.Title}
					subTitle={Locale.Mask.Config.HideContext.SubTitle}
				>
					<input
						type="checkbox"
						checked={props.mask.hideContext}
						onChange={(e) => {
							props.updateMask((mask) => {
								mask.hideContext = e.currentTarget.checked;
							});
						}}
					></input>
				</ListItem>

				{!props.shouldSyncFromGlobal ? (
					<ListItem
						title={Locale.Mask.Config.Share.Title}
						subTitle={Locale.Mask.Config.Share.SubTitle}
					>
						<IconButton
							icon={<CopyIcon />}
							text={Locale.Mask.Config.Share.Action}
							onClick={copyMaskLink}
						/>
					</ListItem>
				) : null}

				{props.shouldSyncFromGlobal ? (
					<ListItem
						title={Locale.Mask.Config.Sync.Title}
						subTitle={Locale.Mask.Config.Sync.SubTitle}
					>
						<input
							type="checkbox"
							checked={props.mask.syncGlobalConfig}
							onChange={async (e) => {
								const checked = e.currentTarget.checked;
								if (
									checked &&
									(await showConfirm(Locale.Mask.Config.Sync.Confirm))
								) {
									props.updateMask((mask) => {
										mask.syncGlobalConfig = checked;
										mask.modelConfig = { ...globalConfig.modelConfig };
									});
								} else if (!checked) {
									props.updateMask((mask) => {
										mask.syncGlobalConfig = checked;
									});
								}
							}}
						></input>
					</ListItem>
				) : null}
			</List>

			<List>
				<ModelConfigList
					modelConfig={{ ...props.mask.modelConfig }}
					updateConfig={updateConfig}
				/>
				{props.extraListItems}
			</List>
		</>
	);
}

function ContextPromptItem(props: {
	index: number;
	prompt: ChatMessage;
	update: (prompt: ChatMessage) => void;
	remove: () => void;
}) {
	const [focusingInput, setFocusingInput] = useState(false);

	return (
		<div className={chatStyle["context-prompt-row"]}>
			{!focusingInput && (
				<>
					<div className={chatStyle["context-drag"]}>
						<DragIcon />
					</div>
					<Select
						value={props.prompt.role}
						className={chatStyle["context-role"]}
						onChange={(e) =>
							props.update({
								...props.prompt,
								role: e.target.value as any,
							})
						}
					>
						{ROLES.map((r) => (
							<option key={r} value={r}>
								{r}
							</option>
						))}
					</Select>
				</>
			)}
			<Input
				value={props.prompt.content}
				type="text"
				className={chatStyle["context-content"]}
				rows={focusingInput ? 10 : 2}
				onFocus={() => setFocusingInput(true)}
				onBlur={() => {
					setFocusingInput(false);
					// If the selection is not removed when the user loses focus, some
					// extensions like "Translate" will always display a floating bar
					window?.getSelection()?.removeAllRanges();
				}}
				onInput={(e) =>
					props.update({
						...props.prompt,
						content: e.currentTarget.value as any,
					})
				}
			/>
			{!focusingInput && (
				<IconButton
					icon={<DeleteIcon />}
					className={chatStyle["context-delete-button"]}
					onClick={() => props.remove()}
					bordered
				/>
			)}
		</div>
	);
}

export function ContextPrompts(props: {
	context: ChatMessage[];
	updateContext: (updater: (context: ChatMessage[]) => void) => void;
}) {
	const context = props.context;

	const addContextPrompt = (prompt: ChatMessage, i: number) => {
		props.updateContext((context) => context.splice(i, 0, prompt));
	};

	const removeContextPrompt = (i: number) => {
		props.updateContext((context) => context.splice(i, 1));
	};

	const updateContextPrompt = (i: number, prompt: ChatMessage) => {
		props.updateContext((context) => (context[i] = prompt));
	};

	const onDragEnd: OnDragEndResponder = (result) => {
		if (!result.destination) {
			return;
		}
		const newContext = reorder(
			context,
			result.source.index,
			result.destination.index,
		);
		props.updateContext((context) => {
			context.splice(0, context.length, ...newContext);
		});
	};

	return (
		<>
			<div className={chatStyle["context-prompt"]} style={{ marginBottom: 20 }}>
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId="context-prompt-list">
						{(provided) => (
							<div ref={provided.innerRef} {...provided.droppableProps}>
								{context.map((c, i) => (
									<Draggable
										draggableId={c.id || i.toString()}
										index={i}
										key={c.id}
									>
										{(provided) => (
											<div
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
											>
												<ContextPromptItem
													index={i}
													prompt={c}
													update={(prompt) => updateContextPrompt(i, prompt)}
													remove={() => removeContextPrompt(i)}
												/>
												<div
													className={chatStyle["context-prompt-insert"]}
													onClick={() => {
														addContextPrompt(
															createMessage({
																role: "user",
																content: "",
																date: new Date().toLocaleString(),
															}),
															i + 1,
														);
													}}
												>
													<AddIcon />
												</div>
											</div>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>

				{props.context.length === 0 && (
					<div className={chatStyle["context-prompt-row"]}>
						<IconButton
							icon={<AddIcon />}
							text={Locale.Context.Add}
							bordered
							className={chatStyle["context-prompt-button"]}
							onClick={() =>
								addContextPrompt(
									createMessage({
										role: "user",
										content: "",
										date: "",
									}),
									props.context.length,
								)
							}
						/>
					</div>
				)}
			</div>
		</>
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
	const [cardStyle, setCardStyle] = useState<"roleplay" | "card">("card");

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
				setCardStyle("card");
				break;
			case "角色对话":
				setCardStyle("roleplay");
				break;
			case "工作流":
				setCardStyle("card");
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
		if (cardStyle === "card" && m.type === "roleplay") {
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
								defaultChecked
								onChange={handleSwitchChange}
								unCheckedChildren="只看自建"
								checkedChildren="查看全部"
							/>
						</span>
						<MultipleTag
							tagsData={MaskCategory.map((v) => v.value)}
							onTagsChange={handleTagsChange}
						/>
					</div>

					<div className={styles["mask-filter"]}>
						<input
							type="text"
							className={styles["search-bar"]}
							placeholder={Locale.Mask.Page.Search}
							autoFocus
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
