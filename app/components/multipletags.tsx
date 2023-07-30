import React, { useState } from "react";
import { Space, Tag } from "antd";

const { CheckableTag } = Tag;

interface Props {
  tagsData: string[]; // 传入的标签数组
  onTagsChange: (selectedTags: string[]) => void; // 用于接收选中标签数组的回调函数
}

const App: React.FC<Props> = ({ tagsData, onTagsChange }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(["全部"]);

  const handleChange = (tag: string, checked: boolean) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t !== tag);
    console.log("You are interested in:", nextSelectedTags);
    setSelectedTags(nextSelectedTags);
    // 将选中的标签数组传递给父组件
    onTagsChange(nextSelectedTags);
  };

  return (
    <>
      <span style={{ marginRight: 8 }}>分类:</span>
      <Space size={[0, 7]} wrap>
        {tagsData.map((tag) => (
          <CheckableTag
            key={tag}
            checked={selectedTags.includes(tag)}
            onChange={(checked) => handleChange(tag, checked)}
          >
            {tag}
          </CheckableTag>
        ))}
      </Space>
    </>
  );
};

export default App;
