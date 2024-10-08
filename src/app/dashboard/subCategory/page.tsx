"use client";
import { DataResponse } from "@/apis/api";
import CategoryAPI, { Category } from "@/apis/category";
import SubCategoryAPI, { SubCategory } from "@/apis/subCategory";
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
  Select,
  Radio,
} from "antd";

import { useEffect, useState } from "react";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: "number" | "text";
  record: SubCategory;
  index: number;
  categories: Category[];
  form: any;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  categories,
  form,
  ...restProps
}) => {
  let inputNode;
  if (dataIndex === "categoryId") {
    inputNode = (
      <Select
        defaultValue={record.categoryId}
        style={{ width: 120 }}
        onChange={(value: number) => {
          form.setFieldsValue({
            categoryId: value,
          });
        }}
      >
        {categories &&
          categories!.map((category) => (
            <Select.Option key={category.id} value={category.id}>
              {category.name}
            </Select.Option>
          ))}
      </Select>
    );
  } else {
    inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  }
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const category = new CategoryAPI();
  const subCategory = new SubCategoryAPI();

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
      title: "Category",
      dataIndex: "categoryId",
      editable: true,
      render: (_: any, record: SubCategory) => {
        let category;
        if (categoriesData?.data != null) {
          category = categoriesData.data.find(
            (cat: Category) => cat.id === record.categoryId
          );
        }
        return <p>{category && category.name}</p>;
      },
    },
    {
      title: "Sort",
      dataIndex: "sort",
      editable: true,
    },
    {
      title: "Operation",
      dataIndex: "operation",
      render: (_: any, record: SubCategory) => {
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

  const mergedColumns: TableProps<SubCategory>["columns"] = columns.map(
    (col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: SubCategory) => ({
          record,
          inputType:
            col.dataIndex === "categoryId" || col.dataIndex === "sort"
              ? "number"
              : "text",
          dataIndex: col.dataIndex,
          title: col.title,
          editing: isEditing(record),
        }),
      };
    }
  );

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onReset = () => {
    form.resetFields();
  };

  const onFinish = (newSubCategory: SubCategory) => {
    addSubCategoryMutation.mutate(newSubCategory);
    form.resetFields();
    onClose();
  };

  const handleDelete = (id: number) => {
    deleteSubCategoryMutation.mutate(id);
  };

  const isEditing = (record: SubCategory) => record.id === editingKey;

  const edit = (record: Partial<SubCategory> & { key: React.Key }) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.id!);
  };

  const cancel = () => {
    setEditingKey(0);
  };

  const save = async (id: number) => {
    try {
      const updatedInfo = (await form.validateFields()) as SubCategory;
      updateSubCategoryMutation.mutate({
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

  // const {
  //   data: subcategoriesData,
  //   isPending,
  //   isError,
  //   error,
  // } = useQuery<DataResponse>({
  //   queryKey: ["subcategory", "getall"],
  //   queryFn: () => subCategory.getSubCategories(),
  // });

  const {
    data: subcategoriesData,
    isPending,
    isError,
    error,
  } = useQuery<DataResponse>({
    queryKey: ["subcategory", "getall", selectedCategory],
    queryFn: () => subCategory.getSubCategoriesByCat(selectedCategory),
  });

  const { data: categoriesData } = useQuery<DataResponse>({
    queryKey: ["category", "getall"],
    queryFn: () => category.getCategories(),
  });

  const addSubCategoryMutation = useMutation({
    mutationFn: (newSubCategory: SubCategory) =>
      subCategory.addSubCategory(newSubCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategory", "getall"] });
    },
  });

  const updateSubCategoryMutation = useMutation({
    mutationFn: (updatedSubCategory: SubCategory) =>
      subCategory.updateSubCategory(updatedSubCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategory", "getall"] });
    },
  });

  const deleteSubCategoryMutation = useMutation({
    mutationFn: (id: number) => subCategory.deleteSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategory", "getall"] });
    },
  });

  return (
    <div className="min-h-full">
      <div className="flex justify-between">
        <h1 className="mb-4 text-xl">Sub-Category</h1>
        <Button type="primary" onClick={showDrawer}>
          Add
        </Button>
      </div>

      {updateSubCategoryMutation.isPending && (
        <span>Updating sub-categories data...</span>
      )}

      {categoriesData && (
        <div className="mb-2">
          <Radio.Group defaultValue="" size="small">
            <Radio.Button value="" onClick={() => setSelectedCategory("")}>
              All
            </Radio.Button>
            {categoriesData.data.map((category: Category) => (
              <Radio.Button
                value={category.name}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
      )}

      {isPending && <span>Loading sub-categories data...</span>}

      {isError && <span>Error: {error.message}</span>}

      {subcategoriesData && (
        <h1 className="mb-3">
          Number of sub-category: {subcategoriesData.data.length}
        </h1>
      )}
      {subcategoriesData && (
        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                cell: (props: any) => (
                  <EditableCell
                    {...props}
                    record={subcategoriesData.data}
                    categories={categoriesData?.data}
                    form={form}
                  />
                ),
              },
            }}
            bordered
            dataSource={subcategoriesData.data}
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

          <Form.Item
            name="categoryId"
            label="CategoryId"
            rules={[{ required: true, message: "Please select category Id" }]}
          >
            <Select placeholder="Please select category Id">
              {categoriesData &&
                categoriesData.data.map((category: Category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
            </Select>
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
