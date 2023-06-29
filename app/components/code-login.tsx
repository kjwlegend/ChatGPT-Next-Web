import { IconButton } from "./button";
import Locale from "../locales";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox, Form, Input } from "antd";

import { Path } from "../constant";
import { useAccessStore } from "../store";

export default function CodeLogin() {
  const navigate = useNavigate();
  const access = useAccessStore();

  const goHome = () => navigate(Path.Home);

  const onFinish = (values: any) => {
    const code = values.password;
    console.log("Received values of form: ", code);
    access.updateCode(code);
    goHome();
  };

  return (
    <div>
      <Form
        name="quick_login"
        className="login-form"
        initialValues={{ password: access.accessCode }}
        style={{ maxWidth: 900, minWidth: 400 }}
        onFinish={onFinish}
      >
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
