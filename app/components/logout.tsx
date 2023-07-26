import { Button } from "antd";
import { useAuthStore } from "../store/auth";
import { useRouter } from "next/navigation";
import { logoutAPI } from "../api/auth";
import useAuth from "../hooks/useAuth";

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
