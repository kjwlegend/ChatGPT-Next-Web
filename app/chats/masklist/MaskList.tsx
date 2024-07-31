import React, { useRef, useCallback, useEffect } from "react";
import { Mask } from "@/app/types/mask";
import MaskItem from "./maskitem";
import styles from "./mask.module.scss";
interface MaskListProps {
	masks: Mask[];
	cardStyle: string;
	loadMore: () => void;
}

const MaskList: React.FC<MaskListProps> = ({ masks, cardStyle, loadMore }) => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const loaderRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadMore();
				}
			},
			{ threshold: 1.0 },
		);

		if (loaderRef.current) {
			observer.observe(loaderRef.current);
		}

		return () => {
			if (loaderRef.current) {
				observer.unobserve(loaderRef.current);
			}
		};
	}, [loadMore]);

	return (
		<div ref={scrollRef} className={styles["mask-list"]}>
			{masks.map((m) => (
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
