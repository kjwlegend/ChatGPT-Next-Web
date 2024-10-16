import React, { useRef, useCallback, useEffect, useState } from "react";
import { Mask } from "@/app/types/mask";
import MaskItem from "./MaskItem";
import styles from "../styles/MaskList.module.scss";

interface MaskListProps {
  masks: Mask[];
  loadMore: () => void;
  onItemClick: (mask: Mask) => void;
  onDelete: (mask: Mask) => void;
}

const MaskList: React.FC<MaskListProps> = ({
  masks,
  loadMore,
  onItemClick,
  onDelete,
}) => {
  const [visibleCount, setVisibleCount] = useState(25);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prevCount) => prevCount + 5);
    loadMore();
  }, [loadMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [handleLoadMore]);

  return (
    <div ref={scrollRef} className={styles["mask-list"]}>
      {masks.slice(0, visibleCount).map((m) => (
        <MaskItem
          mask={m}
          key={m.id}
          onItemClick={onItemClick}
          onDelete={onDelete}
        />
      ))}
      <div ref={loaderRef} style={{ height: "1px" }} />
    </div>
  );
};

export default MaskList;
