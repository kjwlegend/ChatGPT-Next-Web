import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/router";
import { message } from "antd";
import { LoginResult } from "../types";

export default function Login() {
  const { login } = useAuth(); // 获取登录方法

  const router = useRouter();

  const onFinish = async (values: any) => {
    try {
      // 调用登录接口
      const result: any = await login(values);

      if (result) {
        // 登录成功后跳转
        router.push("/");
      }
    } catch (error) {
      // 失败提示
      message.error("登录失败,请重试");
    }
  };

  return (
    <Form
      name="normal_login"
      className="login-form"
      initialValues={{ remember: true }}
      style={{ maxWidth: 900, minWidth: 400 }}
      onFinish={onFinish}
      labelAlign="left"
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: " 请输入用户名!" }]}
      >
        <Input
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder="用户名"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: "请输入密码!" }]}
      >
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="密码"
        />
      </Form.Item>
      <Form.Item>
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>5天内保持登录</Checkbox>
        </Form.Item>
      </Form.Item>

      <Form.Item>
        <Button
          block
          type="primary"
          htmlType="submit"
          className="login-form-button"
        >
          登录
        </Button>
      </Form.Item>
    </Form>
  );
}
