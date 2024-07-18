import { useNavigate } from "react-router-dom";
import { Mask } from "../../types/mask";
import { useChatStore } from "@/app/store";
import { Path } from "@/app/constant";

// export const startChat = (
// 	navigate: ReturnType<typeof useNavigate>,
// 	mask?: Mask,
// ) => {
// 	const chatStore = useChatStore().state;
// 	const { newSession } = chatStore;

// 	setTimeout(() => {
// 		newSession(mask);
// 		navigate(Path.Chat);
// 	}, 10);
// };
