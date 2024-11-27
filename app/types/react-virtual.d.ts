declare module "react-virtual" {
	export interface VirtualItem {
		index: number;
		start: number;
		size: number;
		measureRef: (el: HTMLElement | null) => void;
	}

	export interface VirtualOptions {
		size: number;
		parentRef: React.RefObject<HTMLElement>;
		estimateSize?: (index: number) => number;
		overscan?: number;
		horizontal?: boolean;
		scrollToFn?: (offset: number) => void;
		scrollToAlignment?: string;
		observeElementRect?: boolean;
		observeElementOffset?: boolean;
		scrollingDelay?: number;
		onScrollingChange?: (isScrolling: boolean) => void;
	}

	export function useVirtual(options: VirtualOptions): {
		virtualItems: VirtualItem[];
		totalSize: number;
		scrollToIndex: (index: number) => void;
		scrollToOffset: (offset: number) => void;
		measure: () => void;
		measureElement: (element: HTMLElement | null) => void;
		resetAfterIndex: (index: number, shouldForceUpdate?: boolean) => void;
	};
}
