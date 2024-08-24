import { useState, useEffect } from "react";

export const MOBILE_MAX_WIDTH = 768;

export function useWindowSize() {
	const isClient = typeof window === "object";

	const [size, setSize] = useState({
		width: isClient ? window.innerWidth : 0,
		height: isClient ? window.innerHeight : 0,
	});

	useEffect(() => {
		if (!isClient) {
			return;
		}

		const onResize = () => {
			setSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("resize", onResize);
		};
	}, [isClient]); // Depend on isClient to handle changes

	return size;
}

export function useMobileScreen() {
	const { width } = useWindowSize();

	return width <= MOBILE_MAX_WIDTH;
}
