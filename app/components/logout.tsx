import { Button } from "antd";
import { useAuthStore } from "../store/auth";
import { useRouter } from "next/navigation";
import { logoutAPI } from "../api/auth";
import useAuth from "../hooks/useAuth";
import styles from "./button.module.scss";

interface LogoutButtonProps {
  isButton?: boolean;
}

const LogoutButton = ({ isButton = true }: LogoutButtonProps) => {
  const { logout } = useAuthStore();
  const router = useRouter();
  const auth = useAuth();

  const handleLogout = async () => {
    auth.logoutHook();
    // router.push("/about");
  };

  if (isButton) {
    return (
      // <div>
      <Button type="ghost" onClick={handleLogout} className={styles["logout"]}>
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
