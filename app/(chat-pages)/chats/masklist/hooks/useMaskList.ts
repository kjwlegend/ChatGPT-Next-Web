import { useState, useEffect, useCallback } from "react";
import { useMaskStore } from "@/app/store/mask";
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

	const loadMore = useCallback(async () => {
		if (isNext) {
			const result = await fetchPromptsCallback(page, 25);
			if (result.is_next !== undefined) {
				setIsNext(result.is_next);
			}
			if (result.total !== undefined) {
				maskStore.updatestate({ total: result.total });
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

		const data = maskStore.filter(newFilterOptions);
		setFilterMasks(maskStore.sort("hotness", data));
	}, [filterLang, selectedTags, searchText, author, maskStore]);

	return {
		masks,
		filterMasks,
		loadMore,
		handleSegmentChange,
		handleTagsChange,
		onSearch,
		segmentValue,
	};
};
