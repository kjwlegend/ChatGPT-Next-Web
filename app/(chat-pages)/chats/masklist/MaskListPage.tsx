import React from "react";
import { ErrorBoundary } from "@/app/components/error";
import { ReturnButton } from "../chat/WindowHeader";
import FilterOptions from "./components/FilterOptions";
import MaskList from "./components/MaskList";
import SegmentedControl from "./components/SegmentedControl";
import { useMaskList } from "./hooks/useMaskList";
import styles from "./styles/MaskList.module.scss";
import { MaskListPageProps } from "./types";
import { Input } from "antd";

const MaskListPage: React.FC<MaskListPageProps> = ({ onItemClick, onDelete }) => {
  const {
    filterMasks,
    loadMore,
    handleSegmentChange,
    handleTagsChange,
    onSearch,
    segmentValue,
  } = useMaskList();

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

export default MaskListPage;
