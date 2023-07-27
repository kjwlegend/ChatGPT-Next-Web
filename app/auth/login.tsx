import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { LoginResult } from "../types";

export default function Login() {
  const { loginHook } = useAuth(); // 获取登录方法
  const [messageApi, contextHolder] = message.useMessage();

  const router = useRouter();

  const onFinish = async (values: any) => {
    try {
      // 调用登录接口

      messageApi.open({
        type: "loading",
        content: "登录初始化中..",
        duration: 0,
        key: "loading",
      });

      const result: any = await loginHook(values);
      // console.log("Received values of form: ", values);
      // console.log("Received values of result: ", result);
      messageApi.destroy("loading");

      if (result) {
        // 登录成功后跳转
        messageApi.open({
          type: "success",
          content: "登录成功",
        });

        router.push("/");
      }
    } catch (error) {
      // 失败提示
      messageApi.destroy("loading");
      messageApi.open({
        type: "error",
        content: "登录失败,请重试",
      });
    }
  };

  return (
    <Form
      name="normal_login"
      className="login-form"
      initialValues={{ remember: true }}
      style={{ maxWidth: 900, minWidth: 300 }}
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
          <Checkbox>2天内保持登录</Checkbox>
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
      {contextHolder}
    </Form>
  );
}
