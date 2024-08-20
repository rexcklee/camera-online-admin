"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UserAPI, { User } from "@/apis/user";
import API from "@/apis/api";
import { Button, Form, Input, Space } from "antd";
import { useAuth } from "@/provider/authProvider";
import Cookies from "js-cookie";

export default function Login() {
  const { token, setToken, setCurrentUser } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const user = new UserAPI();

  const onFinish = (input: User) => {
    const checkTokenExpiration = () => {
      API.setCurrentUserToLocalStorage(null);
      API.setTokenToLocalStorage(null);
      setToken(null);
      setCurrentUser(null);
      Cookies.remove("token");
      router.push("/login");
      alert("Your session has expired. Please log in again.");
    };

    user.loginUser(input).then((res) => {
      console.log(res.data.token);
      API.setTokenToLocalStorage(res.data.token);
      API.setCurrentUserToLocalStorage(JSON.stringify(res.data.currentUser));
      setToken(res.data.token);
      setCurrentUser(res.data.currentUser);
      if (res.data.currentUser.isAdmin) {
        Cookies.set("token", res.data.token, {
          expires: 1,
        });
      }
      setTimeout(checkTokenExpiration, res.data.expire_in * 1000);
      router.replace("/dashboard/category");
    });
  };

  return (
    <div className="border border-red-400 min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-center text-2xl mb-4">Login to admin dashboard</h1>
      <div className="border rounded-lg p-14 w-1/3 min-w-96 mx-auto">
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: "please enter your email",
              },
            ]}
          >
            <Input placeholder="please enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: "Please a valid password",
              },
            ]}
          >
            <Input.Password placeholder="Please enter password" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Login
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
