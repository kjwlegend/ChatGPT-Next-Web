import Locale from "../locales";
import { usePathname, useRouter } from "next/navigation";
import { Button, Checkbox, Form, Input } from "antd";
import { useAccessStore, useUserStore } from "../store";

export default function CodeLogin() {
  const router = useRouter();
  const access = useAccessStore();
  const user = useUserStore();

  const goHome = () => router.replace("/");
  const path = usePathname();

  const onFinish = (values: any) => {
    const code = values.password;
    console.log("Received values of form: ", code);
    access.updateCode(code);
    user.updateNickname(values.nickname);
    goHome();
    console.log(path);
  };

  return (
    <div>
      <Form
        name="quick_login"
        className="login-form"
        initialValues={{
          nickname: user.nickname,
          password: access.accessCode,
        }}
        style={{ maxWidth: 900, minWidth: 400 }}
        onFinish={onFinish}
      >
        <Form.Item
          name="nickname"
          rules={[
            {
              required: false,
              message: "请输入密码",
            },
          ]}
          hasFeedback
        >
          <Input placeholder="昵称" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "请输入密码",
            },
          ]}
          hasFeedback
        >
          <Input.Password placeholder="请输入授权码" />
        </Form.Item>

        <Form.Item>
          <Button
            block
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            {Locale.Auth.Confirm}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
