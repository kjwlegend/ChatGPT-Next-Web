"use client";
import { useRef } from "react";
import { IconButton } from "@/app/components/button";
import { ErrorBoundary } from "@/app/components/error";

import DownloadIcon from "@/app/icons/download.svg";
import UploadIcon from "@/app/icons/upload.svg";
import EditIcon from "@/app/icons/edit.svg";
import AddIcon from "@/app/icons/add.svg";
import CloseIcon from "@/app/icons/close.svg";

import { DEFAULT_MASK_AVATAR, useMaskStore } from "@/app/store/mask";
import { Mask } from "@/app/types/mask";
import {
	createMessage,
	ModelConfig,
	useAppConfig,
	useChatStore,
	useUserStore,
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

import MultipleTag from "@/app/components/multipletags";
import { on } from "events";
import { filter } from "cheerio/lib/api/traversing";
import { useMasks } from "@/app/hooks/useMasks";

import SegmentedControl from "./SegmentedControl";
import FilterOptions from "./FilterOptions";
import MaskList from "./MaskList";
import MaskModal from "./MaskModal";
import styles from "./mask.module.scss";
import { ReturnButton } from "../chat/WindowHeader";

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

interface MaskPageProps {
	onItemClick: (mask: Mask, ...args: any[]) => void;
	onDelete: (mask: Mask, ...args: any[]) => void;
}

export const MaskPage: React.FC<MaskPageProps> = ({
	onItemClick,
	onDelete,
}) => {
	const maskStore = useMaskStore();
	const { fetchPromptsCallback } = useMasks();
	const user = useUserStore().user;
	const { username, nickname } = user;

	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [filterLang, setFilterLang] = useState<Lang>("cn");
	const [searchText, setSearchText] = useState("");
	const [segmentValue, setSegmentValue] = useState<string | number>("public");
	const [filterOptions, setFilterOptions] = useState<Object>({
		tags: [],
		searchTerm: "",
		author: "",
	});
	const [filterMasks, setFilterMasks] = useState<Mask[]>([]);
	const [author, setAuthor] = useState<string | undefined>(undefined);
	const [totalPrompts, setTotalPrompts] = useState(0);
	const [isNext, setIsNext] = useState(true);
	const [page, setPage] = useState(1);

	const loadMore = useCallback(async () => {
		if (isNext) {
			const result = await fetchPromptsCallback(page, 25);
			if (result.is_next !== undefined) {
				setIsNext(result.is_next);
			}
			if (result.total !== undefined) {
				setTotalPrompts(result.total);
			}
			setPage((prevPage) => prevPage + 1);
		}
	}, [isNext, page]);

	useEffect(() => {
		const masksData = maskStore.getAll();
		setFilterMasks(masksData);
	}, [maskStore]);

	useEffect(() => {
		const newFilterOptions = {
			...filterOptions,
			...(selectedTags && { tags: selectedTags }),
			...(searchText !== undefined && { searchTerm: searchText }),
			...(author !== undefined && { author: author }),
		};

		const data = maskStore.filter(newFilterOptions);
		setFilterMasks(maskStore.sort("hotness", data));
	}, [filterLang, selectedTags, searchText, author, maskStore]);

	const handleSegmentChange = (value: string | number) => {
		setSegmentValue(value);
		switch (value) {
			case "public":
				setAuthor(undefined);
				break;
			case "private":
				setAuthor(nickname || username);
				break;
			default:
				break;
		}
	};

	const handleTagsChange = (selectedTags: string[]) => {
		setSelectedTags(selectedTags);
	};

	const onSearch = (text: string) => {
		setSearchText(text);
	};

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
				if (importMasks.name) {
					maskStore.create(importMasks);
				}
			} catch {}
		});
	};

	return (
		<ErrorBoundary>
			<div className={styles["mask-page"]}>
				<div className={styles["mask-page-body"]}>
					<ReturnButton />
					{Locale.Mask.Page.SubTitle(maskStore.total)}
					<SegmentedControl
						segmentValue={segmentValue}
						handleSegmentChange={handleSegmentChange}
					/>
					<div className={styles["mask-filter"]}>
						<input
							type="text"
							className={styles["search-bar"]}
							placeholder={Locale.Mask.Page.Search}
							onInput={(e) => onSearch(e.currentTarget.value)}
						/>
					</div>
					<FilterOptions handleTagsChange={handleTagsChange} />
					<MaskList
						masks={filterMasks}
						loadMore={loadMore}
						onItemClick={onItemClick}
						onDelete={onDelete}
					/>
				</div>
			</div>
		</ErrorBoundary>
	);
};
