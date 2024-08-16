"use client";
import UserAPI, { User } from "@/apis/user";
import type { TableProps } from "antd";
import { GoCheckCircleFill, GoXCircleFill } from "react-icons/go";

import {
  Table,
  Button,
  Drawer,
  Space,
  Form,
  Input,
  Popconfirm,
  Typography,
  InputNumber,
  Switch,
} from "antd";

import { useEffect, useState } from "react";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: "number" | "text" | "boolean";
  record: User;
  index: number;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  let inputNode;

  if (inputType === "number") {
    inputNode = <InputNumber />;
  } else if (inputType === "boolean") {
    inputNode = <Switch size="small" checked={record.isAdmin} />;
  } else {
    inputNode = <Input />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          valuePropName={inputType === "boolean" ? "checked" : "value"}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default function Home() {
  const [data, setData] = useState<User[] | null>(null);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [tableUpdate, setTableUpdate] = useState(false);
  const [editingKey, setEditingKey] = useState(0);

  const user = new UserAPI();

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      editable: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      editable: true,
    },
    {
      title: "IsAdmin",
      dataIndex: "isAdmin",
      editable: true,
      render: (isAdmin: boolean) =>
        isAdmin ? (
          <GoCheckCircleFill className="text-green-500" />
        ) : (
          <GoXCircleFill className="text-red-500" />
        ),
    },
    {
      title: "Operation",
      dataIndex: "operation",
      render: (_: any, record: User) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.id)}
              style={{ marginInlineEnd: 8 }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <>
            <Typography.Link
              disabled={editingKey !== 0}
              onClick={() => edit(record)}
            >
              <Button className="mr-2">Edit</Button>
            </Typography.Link>
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button>Delete</Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  const mergedColumns: TableProps<User>["columns"] = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: User) => ({
        record,
        //inputType: col.dataIndex === "sort" ? "number" : "text",
        inputType:
          col.dataIndex === "sort"
            ? "number"
            : col.dataIndex === "isAdmin"
            ? "boolean"
            : "text", // Handle boolean input type
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const forceTableUpdate = () => {
    setTableUpdate((prev) => !prev);
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onReset = () => {
    form.resetFields();
  };

  const onFinish = (input: User) => {
    user.registerUser(input).then(() => {
      form.resetFields();
      onClose();
    });
  };

  const handleDelete = (id: number) => {
    user.deleteUser(id).then((response) => {
      console.log(response);
      forceTableUpdate();
    });
  };

  const isEditing = (record: User) => record.id === editingKey;

  const edit = (record: Partial<User> & { key: React.Key }) => {
    form.setFieldsValue({ name: "", email: "", ...record });
    setEditingKey(record.id!);
  };

  const cancel = () => {
    setEditingKey(0);
  };

  const save = async (id: number) => {
    try {
      const row = (await form.validateFields()) as User;

      user.updateUser(id, row.name, row.email, row.isAdmin).then((response) => {
        console.log(response);
        setEditingKey(0);
        forceTableUpdate();
      });
    } catch (error) {
      console.log("Validate Failed:", error);
    }
  };

  useEffect(() => {
    user
      .getUsers()
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [open, tableUpdate]);

  return (
    <div className="min-h-full">
      <div className="flex justify-between">
        <h1 className="mb-2 text-xl">User</h1>
        <Button type="primary" onClick={showDrawer}>
          Add
        </Button>
      </div>
      {data && <h1 className="mb-3">Number of users: {data.length}</h1>}
      {data && (
        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            bordered
            dataSource={data}
            columns={mergedColumns}
            rowClassName="editable-row"
            pagination={{
              onChange: cancel,
            }}
          />
        </Form>
      )}
      <Drawer
        title="Create a category"
        width={400}
        onClose={onClose}
        open={open}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input placeholder="Please enter category name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: "please enter a email",
              },
            ]}
          >
            <Input placeholder="please enter a email" />
          </Form.Item>

          <Form.Item
            name="isAdmin"
            label="Admin"
            valuePropName="checked"
            initialValue={false} // Optional: set the default value to false
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: "Please enter a password",
              },
              {
                min: 7,
                message: "Password must be at least 7 characters long",
              },
              {
                pattern: /[A-Za-z]/,
                message: "Password must contain at least one letter",
              },
            ]}
          >
            <Input.Password placeholder="Please enter a password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Please confirm your password",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Please confirm your password" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button htmlType="button" onClick={onReset}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
