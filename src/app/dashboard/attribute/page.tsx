"use client";
import { DataResponse } from "@/apis/api";
import AttributeAPI, { Attribute } from "@/apis/attribute";
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
  record: Attribute;
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

  const attribute = new AttributeAPI();

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
      title: "Operation",
      dataIndex: "operation",
      render: (_: any, record: Attribute) => {
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

  const mergedColumns: TableProps<Attribute>["columns"] = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Attribute) => ({
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

  const onFinish = (newAttribute: Attribute) => {
    addAttributeMutation.mutate(newAttribute);
    form.resetFields();
    onClose();
  };

  const handleDelete = (id: number) => {
    deleteAttributeMutation.mutate(id);
  };

  const isEditing = (record: Attribute) => record.id === editingKey;

  const edit = (record: Partial<Attribute> & { key: React.Key }) => {
    form.setFieldsValue({ name: "", ...record });
    setEditingKey(record.id!);
  };

  const cancel = () => {
    form.resetFields();
    setEditingKey(0);
  };

  const save = async (id: number) => {
    try {
      const updatedInfo = (await form.validateFields()) as Attribute;
      updateAttributeMutation.mutate({
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
    data: attributesData,
    isPending,
    isError,
    error,
  } = useQuery<DataResponse>({
    queryKey: ["attribute", "getall"],
    queryFn: () => attribute.getAttributes(),
  });

  const addAttributeMutation = useMutation({
    mutationFn: (newAttribute: Attribute) =>
      attribute.addAttribute(newAttribute),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute", "getall"] });
    },
  });

  const updateAttributeMutation = useMutation({
    mutationFn: (updatedAttribute: Attribute) =>
      attribute.updateAttribute(updatedAttribute),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute", "getall"] });
    },
  });

  const deleteAttributeMutation = useMutation({
    mutationFn: (id: number) => attribute.deleteAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute", "getall"] });
    },
  });

  return (
    <div className="min-h-full">
      <div className="flex justify-between">
        <h1 className="mb-2 text-xl">Attribute</h1>
        <Button type="primary" onClick={showDrawer}>
          Add
        </Button>
      </div>

      {updateAttributeMutation.isPending && (
        <span>Updating attributes data...</span>
      )}

      {isPending && <span>Loading attributes data...</span>}

      {isError && <span>Error: {error.message}</span>}

      {attributesData && (
        <h1 className="mb-3">
          Number of attributes: {attributesData.data.length}
        </h1>
      )}
      {attributesData && (
        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            bordered
            dataSource={attributesData.data}
            columns={mergedColumns}
            rowClassName="editable-row"
            pagination={{
              onChange: cancel,
            }}
          />
        </Form>
      )}
      <Drawer
        title="Create a attribute"
        width={400}
        onClose={onClose}
        open={open}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter attribute name" }]}
          >
            <Input placeholder="Please enter attribute name" />
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
