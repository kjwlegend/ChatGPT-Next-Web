import React from "react";
import MultipleTag from "@/app/components/multipletags";
import { useMaskStore } from "@/app/store/mask/index";
import { Tags } from "@/app/types/mask";

interface FilterOptionsProps {
	handleTagsChange: (selectedTags: string[]) => void;
	selectedTags: string[];
}

const FilterOptions: React.FC<FilterOptionsProps> = ({
	handleTagsChange,
	selectedTags,
}) => {
	const maskStore = useMaskStore();
	const tags: Tags[] = Object.values(maskStore.tags);
	const tagsData = tags.map((tag: Tags) => tag.tag_name);

	return (
		<div className="flex-container">
			<MultipleTag
				tagsData={tagsData}
				onTagsChange={handleTagsChange}
				selectedTags={selectedTags}
			/>
		</div>
	);
};

export default FilterOptions;
