import { useState, useEffect, useCallback } from "react";
import { useMaskStore } from "@/app/store/mask/index";
import { useMasks } from "@/app/hooks/useMasks";
import { Mask } from "@/app/types/mask";
import { useAuthStore } from "@/app/store/auth";

export const useMaskList = () => {
	const maskStore = useMaskStore();
	const authStore = useAuthStore();
	const { fetchPromptsCallback } = useMasks();
	const [masks, setMasks] = useState<Mask[]>([]);
	const [filterMasks, setFilterMasks] = useState<Mask[]>([]);
	const [page, setPage] = useState(1);
	const [isNext, setIsNext] = useState(true);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [filterLang, setFilterLang] = useState<string>("cn");
	const [searchText, setSearchText] = useState("");
	const [segmentValue, setSegmentValue] = useState<string | number>("public");
	const [author, setAuthor] = useState<string | undefined>(undefined);
	const [initialSearchTerm, setInitialSearchTerm] = useState("");
	const [initialSelectedTag, setInitialSelectedTag] = useState("");

	const loadMore = useCallback(async () => {
		if (isNext) {
			const result = await fetchPromptsCallback(page, 60);
			if (result.is_next !== undefined) {
				setIsNext(result.is_next);
			}
			if (result.total !== undefined) {
				maskStore.updateState({ total: result.total });
			}
			setPage((prevPage) => prevPage + 1);
		}
	}, [isNext, page, fetchPromptsCallback, maskStore]);

	const handleSegmentChange = (value: string | number) => {
		setSegmentValue(value);
		setAuthor(value === "private" ? authStore.user?.nickname : undefined);
	};

	const handleTagsChange = (selectedTags: string[]) => {
		setSelectedTags(selectedTags);
	};

	const onSearch = (text: string) => {
		setSearchText(text);
	};

	useEffect(() => {
		const newFilterOptions = {
			tags: selectedTags,
			searchTerm: searchText,
			author: author,
		};

		const data = maskStore.selectFilteredMasks(newFilterOptions);
		setFilterMasks(maskStore.selectSortedMasks("hotness", data));
	}, [filterLang, selectedTags, searchText, author, maskStore]);

	useEffect(() => {
		if (initialSearchTerm) {
			setSearchText(initialSearchTerm);
			onSearch(initialSearchTerm);
		}
	}, [initialSearchTerm]);

	useEffect(() => {
		if (initialSelectedTag) {
			setSelectedTags([initialSelectedTag]);
			handleTagsChange([initialSelectedTag]);
		}
	}, [initialSelectedTag]);

	return {
		masks,
		filterMasks,
		loadMore,
		handleSegmentChange,
		handleTagsChange,
		onSearch,
		segmentValue,
		setInitialSearchTerm,
		setInitialSelectedTag,
		selectedTags,
	};
};
