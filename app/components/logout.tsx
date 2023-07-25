import { Button } from "antd";
import { useAuthStore } from "../store/auth";
import { useRouter } from "next/navigation";
import { logoutAPI } from "../api/auth";

interface LogoutButtonProps {
  isButton?: boolean;
}

const LogoutButton = ({ isButton = true }: LogoutButtonProps) => {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAPI();
    logout();
    // router.push("/about");
  };

  if (isButton) {
    return (
      // <div>
      <Button type="primary" onClick={handleLogout}>
        注销登出
      </Button>
      // </div>
    );
  }

  return (
    <span onClick={handleLogout} style={{ cursor: "pointer" }}>
      注销登出
    </span>
  );
};

export default LogoutButton;
