import {
  AutoComplete,
  Button,
  Cascader,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
} from "antd";
import React, { useState, useContext } from "react";
import { register, RegisterParams, RegisterResult } from "../api/register";

const { Option } = Select;

interface DataNodeType {
  value: string;
  label: string;
  children?: DataNodeType[];
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

import request from "../utils/request";
import axios from "axios";
import { message } from "antd";
import { useRouter } from "next/navigation";

const App = ({ onRegisterSuccess }: { onRegisterSuccess: () => void }) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const onFinish = async (values: RegisterParams) => {
    try {
      const result = await register(values);

      if (result.code == "201") {
        // 跳转页面
        messageApi.open({
          type: "success",
          content: "注册成功,请登录",
          style: {
            marginTop: "10vh",
          },
        });
        onRegisterSuccess();
      } else {
        // 采用antd的message提示
        const errormsg = result.msg ? result.msg : result.error;

        messageApi.open({
          type: "error",
          content: errormsg,
          style: {
            marginTop: "10vh",
          },
        });
      }
    } catch (error) {
      // 处理错误
      console.log(error);
    }
  };

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select style={{ width: 70 }}>
        <Option value="86">+86</Option>
      </Select>
    </Form.Item>
  );

  return (
    <Form
      {...formItemLayout}
      form={form}
      name="register"
      onFinish={onFinish}
      initialValues={{ prefix: "86" }}
      style={{ maxWidth: 900, minWidth: 400 }}
      scrollToFirstError
      labelAlign="left"
    >
      <Form.Item
        name="username"
        label="用户名"
        tooltip="登录使用"
        rules={[
          { required: true, message: "请输入你的用户名", whitespace: false },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="password"
        label="密码"
        rules={[
          {
            required: true,
            message: "请输入密码",
          },
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="confirm"
        label="密码确认"
        dependencies={["password"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: "请再次输入密码",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("两次输入的密码没有匹配"));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="nickname"
        label="昵称"
        tooltip="您希望别人怎么称呼您？"
        rules={[
          { required: false, message: "请输入你的昵称", whitespace: true },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="gender"
        label="性别"
        rules={[{ required: false, message: "请选择您的性别" }]}
      >
        <Select>
          <Option value="0">请选择</Option>
          <Option value="1">男</Option>
          <Option value="2">女</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="email"
        label="邮箱"
        rules={[
          {
            type: "email",
            message: "您的邮箱格式不正确",
          },
          {
            required: true,
            message: "请输入邮箱",
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="phone_number"
        label="手机号"
        rules={[{ required: true, message: "请输入手机号" }]}
      >
        <Input addonBefore={prefixSelector} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="agreement"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value
                ? Promise.resolve()
                : Promise.reject(new Error("需要同意用户协议才能注册")),
          },
        ]}
        {...tailFormItemLayout}
      >
        <Checkbox>
          同意 <a href="">用户协议</a>
        </Checkbox>
      </Form.Item>
      <Form.Item
        wrapperCol={{
          xs: { span: 24, offset: 0 },
          sm: { span: 16, offset: 4 },
        }}
      >
        <Button block type="primary" htmlType="submit">
          立即注册
        </Button>
      </Form.Item>
      {contextHolder}
    </Form>
  );
};

export default App;
