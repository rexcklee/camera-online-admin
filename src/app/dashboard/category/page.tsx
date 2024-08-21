"use client";
import { DataResponse } from "@/apis/api";
import CategoryAPI, { Category } from "@/apis/category";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

import { useState } from "react";

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
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
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

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onReset = () => {
    form.resetFields();
  };

  const onFinish = (newCategory: Category) => {
    addCategoryMutation.mutate(newCategory);
    form.resetFields();
    onClose();
  };

  const handleDelete = (id: number) => {
    deleteCategoryMutation.mutate(id);
  };

  const isEditing = (record: Category) => record.id === editingKey;

  const edit = (record: Partial<Category> & { key: React.Key }) => {
    form.setFieldsValue({ name: "", description: "", ...record });
    setEditingKey(record.id!);
  };

  const cancel = () => {
    form.resetFields();
    setEditingKey(0);
  };

  const save = async (id: number) => {
    try {
      const updatedInfo = (await form.validateFields()) as Category;
      updateCategoryMutation.mutate({
        ...updatedInfo,
        id: id,
      });
      form.resetFields();
      setEditingKey(0);
    } catch (error) {
      console.log("Validate Failed:", error);
    }
  };

  const queryClient = useQueryClient();

  const {
    data: categoriesData,
    isPending,
    isError,
    error,
  } = useQuery<DataResponse>({
    queryKey: ["category", "getall"],
    queryFn: () => category.getCategories(),
  });

  const addCategoryMutation = useMutation({
    mutationFn: (newCategory: Category) => category.addCategory(newCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category", "getall"] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (updatedCategory: Category) =>
      category.updateCategory(updatedCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category", "getall"] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => category.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category", "getall"] });
    },
  });

  return (
    <div className="min-h-full">
      <div className="flex justify-between">
        <h1 className="mb-2 text-xl">Category</h1>
        <Button type="primary" onClick={showDrawer}>
          Add
        </Button>
      </div>

      {updateCategoryMutation.isPending && (
        <span>Updating categories data...</span>
      )}

      {isPending && <span>Loading categories data...</span>}

      {isError && <span>Error: {error.message}</span>}

      {categoriesData && (
        <h1 className="mb-3">
          Number of category: {categoriesData.data.length}
        </h1>
      )}
      {categoriesData && (
        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            bordered
            dataSource={categoriesData.data}
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
