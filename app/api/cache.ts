class SimpleCache {
	private static instance: SimpleCache;
	private cache: Map<string, { value: any; expires: number }>;

	private constructor() {
		this.cache = new Map();
	}

	public static getInstance(): SimpleCache {
		if (!SimpleCache.instance) {
			SimpleCache.instance = new SimpleCache();
		}
		return SimpleCache.instance;
	}

	set<T>(key: string, value: T, ttlSeconds: number): void {
		this.cache.set(key, {
			value,
			expires: Date.now() + ttlSeconds * 1000,
		});
	}

	get<T>(key: string): T | null {
		const item = this.cache.get(key);
		if (!item) return null;

		if (Date.now() > item.expires) {
			this.cache.delete(key);
			return null;
		}

		return item.value as T;
	}

	delete(key: string): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}

	// 清理过期项
	cleanup(): void {
		const now = Date.now();
		for (const [key, item] of this.cache.entries()) {
			if (now > item.expires) {
				this.cache.delete(key);
			}
		}
	}

	// 获取缓存大小
	size(): number {
		return this.cache.size;
	}
}

// 导出单例实例
export const cache = SimpleCache.getInstance();

// 每5分钟清理一次缓存
if (typeof setInterval !== "undefined") {
	setInterval(() => cache.cleanup(), 5 * 60 * 1000);
}
