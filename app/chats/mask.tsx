import { IconButton } from "../components/button";
import { ErrorBoundary } from "../components/error";

import styles from "./mask.module.scss";

import DownloadIcon from "../icons/download.svg";
import UploadIcon from "../icons/upload.svg";
import EditIcon from "../icons/edit.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import DeleteIcon from "../icons/delete.svg";
import EyeIcon from "../icons/eye.svg";
import CopyIcon from "../icons/copy.svg";
import DragIcon from "../icons/drag.svg";
import { ChatMessage, ChatSession, Mask } from "@/app/types/";
import { DEFAULT_MASK_AVATAR, useMaskStore } from "../store/mask";
import {
	createMessage,
	ModelConfig,
	useAppConfig,
	useChatStore,
} from "../store";
import { ROLES } from "../client/api";
import {
	Input,
	List,
	ListItem,
	Modal,
	Popover,
	Select,
	showConfirm,
} from "../components/ui-lib";
import Locale, { AllLangs, ALL_LANG_OPTIONS, Lang } from "../locales";
import { MaskCategory } from "../constant";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "antd";

import chatStyle from "./chat.module.scss";
import { useEffect, useState } from "react";
import { copyToClipboard, downloadAs, readFromFile } from "../utils";
import { Updater } from "../typing";
import { ModelConfigList } from "../components/model-config";
import { FileName, Path } from "../constant";
import { BUILTIN_MASK_STORE } from "../masks";
import { nanoid } from "nanoid";
import {
	DragDropContext,
	Droppable,
	Draggable,
	OnDragEndResponder,
} from "@hello-pangea/dnd";
import { MaskConfig, MaskAvatar } from "./mask-components";

// drag and drop helper function
function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
	const result = [...list];
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);
	return result;
}

export function MaskPage() {
	const navigate = useNavigate();

	const maskStore = useMaskStore();
	const chatStore = useChatStore();

	const [filterLang, setFilterLang] = useState<Lang>();

	const [filterCategory, setFilterCategory] = useState<any>();

	const allMasks = maskStore.getAll().filter((m) => {
		if (filterLang && m.lang !== filterLang) {
			return false;
		}
		if (filterCategory && m.category !== filterCategory) {
			return false;
		}
		return true;
	});

	const [searchMasks, setSearchMasks] = useState<Mask[]>([]);
	const [searchText, setSearchText] = useState("");
	const masks = searchText.length > 0 ? searchMasks : allMasks;

	// refactored already, now it accurate
	const onSearch = (text: string) => {
		setSearchText(text);
		if (text.length > 0) {
			const result = allMasks.filter((m) =>
				m.name.toLowerCase().includes(text.toLowerCase()),
			);
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
							value={filterCategory ?? Locale.Settings.category.All}
							onChange={(e) => {
								const value = e.currentTarget.value;
								if (value === Locale.Settings.category.All) {
									setFilterLang(undefined);
									setFilterCategory(undefined);
								} else {
									setFilterLang(undefined);
									setFilterCategory(MaskCategory);
								}
							}}
						>
							<option key="all" value={Locale.Settings.category.All}>
								{Locale.Settings.category.All}
							</option>
							{Object.values(MaskCategory).map((category) => (
								<option value={category.key} key={category.value}>
									{category.value}
								</option>
							))}
						</Select>
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
							onClick={async () => {
								const createdMask = await maskStore.create();
								setEditingMaskId(createdMask.id);
							}}
						/>
					</div>

					<div>
						{masks.map((m) => (
							<div className={styles["mask-item"]} key={m.id}>
								<div className={styles["mask-header"]}>
									<div className={styles["mask-icon"]}>
										<MaskAvatar mask={m} />
									</div>
									<div className={styles["mask-title"]}>
										<div className={styles["mask-name"]}>{m.name}</div>
										<div className={styles["mask-info"] + " one-line"}>
											{`${Locale.Mask.Item.Info(m.context.length)} / ${
												ALL_LANG_OPTIONS[m.lang]
											} / ${m.modelConfig.model}`}
										</div>
									</div>
								</div>
								<div className={styles["mask-actions"]}>
									<IconButton
										icon={<AddIcon />}
										text={Locale.Mask.Item.Chat}
										onClick={() => {
											chatStore.newSession(m);
											navigate(Path.Chat);
										}}
									/>
									{m.builtin ? (
										<IconButton
											icon={<EyeIcon />}
											text={Locale.Mask.Item.View}
											onClick={() => setEditingMaskId(m.id)}
										/>
									) : (
										<IconButton
											icon={<EditIcon />}
											text={Locale.Mask.Item.Edit}
											onClick={() => setEditingMaskId(m.id)}
										/>
									)}
									{!m.builtin && (
										<IconButton
											icon={<DeleteIcon />}
											text={Locale.Mask.Item.Delete}
											onClick={async () => {
												if (await showConfirm(Locale.Mask.Item.DeleteConfirm)) {
													maskStore.delete(m.id);
												}
											}}
										/>
									)}
								</div>
							</div>
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
