import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { debounce } from "@/app/utils/debounce";

export function useInfiniteScroll(loadMoreFn: () => Promise<void>) {
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const loadRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const listElement = loadRef.current;
		let observer: IntersectionObserver;

		if (listElement) {
			const options = {
				root: null,
				rootMargin: "0px",
				threshold: 1.0,
			};

			const debouncedLoadMore = debounce(() => loadMoreFn(), 1000);

			observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						debouncedLoadMore();
					}
				});
			}, options);

			observer.observe(listElement);
		}

		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	}, [hasMore, page, loadMoreFn]);

	return { page, loadRef, hasMore, setHasMore, setPage };
}
