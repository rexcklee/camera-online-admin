"use client";
import CategoryAPI, { Category } from "@/apis/category";
import type { TableProps } from "antd";

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
} from "antd";

import { useEffect, useState } from "react";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: "number" | "text";
  record: Category;
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
  const inputNode = inputType === "number" ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
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
  const [data, setData] = useState<Category[] | null>(null);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [tableUpdate, setTableUpdate] = useState(false);
  const [editingKey, setEditingKey] = useState(0);

  const category = new CategoryAPI();

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
      title: "Description",
      dataIndex: "description",
      editable: true,
    },
    {
      title: "Sort",
      dataIndex: "sort",
      editable: true,
    },
    {
      title: "Operation",
      dataIndex: "operation",
      render: (_: any, record: Category) => {
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

  const mergedColumns: TableProps<Category>["columns"] = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Category) => ({
        record,
        inputType: col.dataIndex === "sort" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const forceTableUpdate = () => {
    setTableUpdate((prev) => !prev); // Toggle the state to force re-render
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

  const onFinish = (input: Category) => {
    category.addCategory(input).then(() => {
      form.resetFields();
      onClose();
    });
  };

  const handleDelete = (id: number) => {
    category.deleteCategory(id).then((response) => {
      console.log(response);
      forceTableUpdate();
    });
  };

  const isEditing = (record: Category) => record.id === editingKey;

  const edit = (record: Partial<Category> & { key: React.Key }) => {
    form.setFieldsValue({ name: "", description: "", ...record });
    setEditingKey(record.id!);
  };

  const cancel = () => {
    setEditingKey(0);
  };

  const save = async (id: number) => {
    try {
      const row = (await form.validateFields()) as Category;

      category
        .updateCategory(id, row.name, row.description, row.sort)
        .then((response) => {
          console.log(response);
          setEditingKey(0);
          forceTableUpdate();
        });
    } catch (error) {
      console.log("Validate Failed:", error);
    }
  };

  useEffect(() => {
    category
      .getCategories()
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
        <h1 className="mb-2 text-xl">Category</h1>
        <Button type="primary" onClick={showDrawer}>
          Add
        </Button>
      </div>
      {data && <h1 className="mb-3">Number of category: {data.length}</h1>}
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
            name="description"
            label="Description"
            rules={[
              {
                required: true,
                message: "please enter category description",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="please enter category description"
            />
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
