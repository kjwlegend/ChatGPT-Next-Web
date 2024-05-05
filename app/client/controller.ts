// To store message streaming controller
export const ChatControllerPool = {
	controllers: {} as Record<string, AbortController>,

	addController(
		sessionId: string,
		messageId: string,
		controller: AbortController,
	) {
		const key = this.key(sessionId, messageId);
		this.controllers[key] = controller;
		// console.log("on add controller", "key", key, "controller", controller);
		return key;
	},

	stop(sessionId: string, messageId: string) {
		const key = this.key(sessionId, messageId);

		const controller = this.controllers[key];
		// console.log("on stop controller", "key", key, "controller", controller);

		controller?.abort();
	},

	stopAll() {
		Object.values(this.controllers).forEach((v) => v.abort());
	},

	hasPending() {
		return Object.values(this.controllers).length > 0;
	},

	remove(sessionId: string, messageId: string) {
		const key = this.key(sessionId, messageId);
		// console.log(
		// 	"controller removed",
		// 	"key",
		// 	key,
		// 	"controllers",
		// 	this.controllers,
		// );
		delete this.controllers[key];
	},

	key(sessionId: string, messageIndex: string) {
		return `${sessionId},${messageIndex}`;
	},

	updateController(
		sessionId: string,
		messageId: string,
		controller: AbortController,
	) {
		const key = this.key(sessionId, messageId);
		this.controllers[key] = controller;
	},
};
