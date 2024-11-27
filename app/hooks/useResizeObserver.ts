import { useEffect, useRef } from "react";

export function useResizeObserver(
	elementRef: React.RefObject<HTMLElement>,
	callback: (entry: ResizeObserverEntry) => void,
) {
	const observer = useRef<ResizeObserver | null>(null);

	useEffect(() => {
		if (elementRef.current) {
			observer.current = new ResizeObserver((entries) => {
				callback(entries[0]);
			});

			observer.current.observe(elementRef.current);
		}

		return () => {
			if (observer.current) {
				observer.current.disconnect();
			}
		};
	}, [elementRef, callback]);
}
