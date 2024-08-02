import React, { useState } from "react";
import { Space, Tag, ConfigProvider } from "antd";
import styles from "./tags.module.scss";

const { CheckableTag } = Tag;

interface Props {
	tagsData: string[]; // 传入的标签数组
	onTagsChange: (selectedTags: string[]) => void; // 用于接收选中标签数组的回调函数
}

const MultipleTag: React.FC<Props> = ({ tagsData, onTagsChange }) => {
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	const handleChange = (tag: string, checked: boolean) => {
		const nextSelectedTags = checked
			? [...selectedTags, tag]
			: selectedTags.filter((t) => t !== tag);
		setSelectedTags(nextSelectedTags);
		// 将选中的标签数组传递给父组件
		onTagsChange(nextSelectedTags);
	};

	return (
		<>
			<Space size={[0, 7]} wrap>
				{tagsData.map((tag) => (
					<CheckableTag
						key={tag}
						checked={selectedTags.includes(tag)}
						onChange={(checked) => handleChange(tag, checked)}
						className={`${styles.CheckableTag} ${selectedTags.includes(tag) ? styles.checked : ""}`}
					>
						{tag}
					</CheckableTag>
				))}
			</Space>
		</>
	);
};

export default MultipleTag;
