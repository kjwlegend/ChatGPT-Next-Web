export function debounce(func: Function, wait: number) {
	let timeout: NodeJS.Timeout | null;
	return function (this: any, ...args: any[]) {
		clearTimeout(timeout as NodeJS.Timeout);
		timeout = setTimeout(() => func.apply(this, args), wait);
	};
}

export function throttle(func: Function, wait: number) {
	let timeout: NodeJS.Timeout | null = null;
	return function (this: any, ...args: any[]) {
		if (!timeout) {
			timeout = setTimeout(() => {
				timeout = null;
				func.apply(this, args);
			}, wait);
		}
	};
}
