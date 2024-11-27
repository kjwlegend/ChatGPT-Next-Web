import React, { useEffect, useState } from "react";
import { ErrorBoundary } from "@/app/components/error";
import { ReturnButton } from "../chat/chat-header/WindowHeader";
import FilterOptions from "./components/FilterOptions";
import MaskList from "./components/MaskList";
import SegmentedControl from "./components/SegmentedControl";
import { useMaskList } from "./hooks/useMaskList";
import styles from "./styles/MaskList.module.scss";
import { MaskListPageProps } from "./types";
import { Input } from "antd";
import { useLocation } from "react-router-dom";

const MaskListPage: React.FC<MaskListPageProps> = ({
	onItemClick,
	onDelete,
}) => {
	const location = useLocation();
	const [initialSearchValue, setInitialSearchValue] = useState("");
	const {
		filterMasks,
		loadMore,
		handleSegmentChange,
		handleTagsChange,
		onSearch,
		segmentValue,
		setInitialSearchTerm,
		setInitialSelectedTag,
		selectedTags,
	} = useMaskList();

	useEffect(() => {
		const state = location.state as {
			searchTerm?: string;
			selectedTag?: string;
		};
		if (state?.searchTerm) {
			setInitialSearchTerm(state.searchTerm);
			setInitialSearchValue(state.searchTerm);
		}
		if (state?.selectedTag) {
			setInitialSelectedTag(state.selectedTag);
		}
	}, [location.state, setInitialSearchTerm, setInitialSelectedTag]);

	return (
		<ErrorBoundary>
			<div className={styles["mask-page"]}>
				<div className={styles["mask-page-body"]}>
					<ReturnButton />
					<SegmentedControl
						segmentValue={segmentValue}
						handleSegmentChange={handleSegmentChange}
					/>
					<div className={styles["mask-filter"]}>
						<Input
							className={styles["search-bar"]}
							placeholder="搜索面具"
							onChange={(e) => onSearch(e.target.value)}
							defaultValue={initialSearchValue}
						/>
					</div>
					<FilterOptions
						handleTagsChange={handleTagsChange}
						selectedTags={selectedTags}
					/>
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

export default MaskListPage;
