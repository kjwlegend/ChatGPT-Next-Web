import { Button } from "antd";
import { useAuthStore } from "../store/auth";
import { useRouter } from "next/navigation";
import { logoutAPI } from "../api/auth";
import useAuth from "../hooks/useAuth";
import styles from "./button.module.scss";
import { useChatStore } from "../store";
interface LogoutButtonProps {
	isButton?: boolean;
}

const LogoutButton = ({ isButton = true }: LogoutButtonProps) => {
	const { logout } = useAuthStore();
	const router = useRouter();
	const auth = useAuth();
	const chatStore = useChatStore();

	const handleLogout = async () => {
		auth.logoutHook();
		// router.push("/about");
		// chatStore.clearChatData();
		// router.push("/chats");
		// location.reload();
	};

	if (isButton) {
		return (
			// <div>
			<Button onClick={handleLogout} className={styles["logout"]}>
				注销登出
			</Button>
			// </div>
		);
	}

	return (
		<div onClick={handleLogout} style={{ cursor: "pointer" }}>
			登出
		</div>
	);
};

export default LogoutButton;
