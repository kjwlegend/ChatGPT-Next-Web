import React, { useState, useEffect } from "react";
import { Tag } from "antd";

interface MultipleTagProps {
	tagsData: string[];
	onTagsChange: (selectedTags: string[]) => void;
	selectedTags: string[];
}

const MultipleTag: React.FC<MultipleTagProps> = ({
	tagsData,
	onTagsChange,
	selectedTags,
}) => {
	const [selectedTagsState, setSelectedTagsState] =
		useState<string[]>(selectedTags);

	useEffect(() => {
		setSelectedTagsState(selectedTags);
	}, [selectedTags]);

	const handleChange = (tag: string, checked: boolean) => {
		const nextSelectedTags = checked
			? [...selectedTagsState, tag]
			: selectedTagsState.filter((t) => t !== tag);
		setSelectedTagsState(nextSelectedTags);
		onTagsChange(nextSelectedTags);
	};

	return (
		<>
			{tagsData.map((tag) => (
				<Tag.CheckableTag
					key={tag}
					checked={selectedTagsState.includes(tag)}
					onChange={(checked) => handleChange(tag, checked)}
				>
					{tag}
				</Tag.CheckableTag>
			))}
		</>
	);
};

export default MultipleTag;
