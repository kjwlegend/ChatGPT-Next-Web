import React from 'react';
import { Input } from 'antd';
import styles from '../styles/NewChat.module.scss';

const { Search } = Input;

interface SearchBarProps {
  onSearch: (value: string) => void;
  tags: string[];
  onTagClick: (tag: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, tags, onTagClick }) => {
  return (
    <div className={styles["search-container"]}>
      <Search
        placeholder="搜索智能体"
        onSearch={onSearch}
        style={{ width: '100%' }}
      />
      <div className={styles["tags-list"]}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tag} onClick={() => onTagClick(tag)}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
