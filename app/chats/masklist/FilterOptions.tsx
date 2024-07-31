import React from "react";
import { Checkbox } from "antd";
import MultipleTag from "@/app/components/multipletags";
import { useMaskStore } from "@/app/store/mask";
import { Tags } from "@/app/types/mask";
interface FilterOptionsProps {
	handleTagsChange: (selectedTags: string[]) => void;

	cardStyle: string;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({
	handleTagsChange,
	cardStyle,
}) => {
	const maskStore = useMaskStore();
	const tags: Tags[] = Object.values(maskStore.tags);
	const tagsData = tags.map((tag: Tags) => tag.tag_name);
	return (
		<div>
			<MultipleTag tagsData={tagsData} onTagsChange={handleTagsChange} />
		</div>
	);
};

export default FilterOptions;
