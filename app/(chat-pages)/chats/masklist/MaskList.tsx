import React, { useRef, useCallback, useEffect, useState } from "react";
import { Mask } from "@/app/types/mask";
import MaskItem from "./maskitem";
import styles from "./mask.module.scss";
interface MaskListProps {
	masks: Mask[];
	cardStyle: string;
	loadMore: () => void;
}

const MaskList: React.FC<MaskListProps> = ({ masks, cardStyle, loadMore }) => {
	const [visibleCount, setVisibleCount] = useState(25);
	const scrollRef = useRef<HTMLDivElement>(null);
	const loaderRef = useRef<HTMLDivElement>(null);

	const handleLoadMore = useCallback(() => {
		setVisibleCount((prevCount) => prevCount + 5);
		console.log("loadmore", visibleCount);
		loadMore();
	}, [loadMore]);

	useEffect(() => {
		console.log("Observer initialized");
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					console.log("Loader is intersecting, loading more items...");
					handleLoadMore();
				}
			},
			{
				root: null,
				rootMargin: "0px",
				threshold: 1.0,
			},
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
					styleName={cardStyle}
					setEditingMaskId={() => {
						console.log("click");
					}}
				/>
			))}
			<div ref={loaderRef} style={{ height: "1px" }} />
		</div>
	);
};

export default MaskList;
