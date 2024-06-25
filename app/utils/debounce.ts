export function debounce(func: Function, wait: number) {
	let timeout: NodeJS.Timeout;
	return function (this: any, ...args: any[]) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), wait);
	};
}
