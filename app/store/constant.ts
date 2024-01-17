import Locale from "../locales";
import { ChatMessage } from "./chat";
import { createMessage } from "./chat";

// export const DEFAULT_TOPIC = Locale.Store.DefaultTopic;
export const DEFAULT_TOPIC = "1234";

export const BOT_HELLO: ChatMessage = createMessage({
	role: "assistant",
	content: Locale.Store.BotHello,
});
