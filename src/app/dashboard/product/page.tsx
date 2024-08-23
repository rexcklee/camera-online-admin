"use client";
import CategoryAPI, { Category } from "@/apis/category";
import SubCategoryAPI, { SubCategory } from "@/apis/subCategory";
import ProductAPI, { Product } from "@/apis/product";

import type { TableProps } from "antd";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

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

import { useState } from "react";
import { DataResponse } from "@/apis/api";
import Link from "next/link";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: "number" | "text";
  record: Product;
  index: number;
  categoriesData: Category[];
  subCategoriesData: SubCategory[];
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
  categoriesData,
  subCategoriesData,
  form,
  ...restProps
}) => {
  let inputNode;

  switch (dataIndex) {
    case "categoryId":
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
          {categoriesData &&
            categoriesData.map((category: Category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
        </Select>
      );
      break;

    case "subcategoryId":
      inputNode = (
        <Select
          defaultValue={record.subcategoryId}
          style={{ width: 120 }}
          onChange={(value: number) => {
            form.setFieldsValue({
              subCategoryId: value,
            });
          }}
        >
          {subCategoriesData &&
            subCategoriesData.map((subcategory: Category) => (
              <Select.Option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </Select.Option>
            ))}
        </Select>
      );
      break;

    default:
      inputNode = inputType === "number" ? <InputNumber /> : <Input />;
      break;
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
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [searchText, setSearchText] = useState("");

  const category = new CategoryAPI();
  const subCategory = new SubCategoryAPI();
  const product = new ProductAPI();

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
      title: "Price",
      dataIndex: "price",
      editable: true,
    },
    {
      title: "Category",
      dataIndex: "categoryId",
      editable: true,
      render: (_: any, record: Product) => {
        let category;
        if (categoriesData != null) {
          category = categoriesData.data.find(
            (cat: Category) => cat.id === record.categoryId
          );
        }
        return <p>{category && category.name}</p>;
      },
    },
    {
      title: "Sub-Category",
      dataIndex: "subcategoryId",
      editable: true,
      render: (_: any, record: Product) => {
        let subcategory;
        if (subcategoriesData != null) {
          subcategory = subcategoriesData.data.find(
            (subcat: SubCategory) => subcat.id === record.subcategoryId
          );
        }
        return <p>{subcategory && subcategory.name}</p>;
      },
    },
    {
      title: "Operation",
      dataIndex: "operation",
      render: (_: any, record: Product) => {
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
            <Link href={`/dashboard/product/${record.id}`} className="text-sm">
              <Button className="mr-2">Detail</Button>
            </Link>
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

  const mergedColumns: TableProps<Product>["columns"] = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Product) => ({
        record,
        inputType:
          col.dataIndex === "categoryId" || col.dataIndex === "price"
            ? "number"
            : "text",
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

  const onFinish = (newProduct: Product) => {
    // let subcategory;
    // if (subcategoriesData != null) {
    //   subcategory = subcategoriesData!.data.find(
    //     (cat: SubCategory) => cat.id === input.subcategoryId
    //   );
    // }
    // if (subcategory) {
    //   addProductMutation.mutate({
    //     ...input,
    //     categoryId: subcategory.categoryId,
    //   });
    // } else {
    //   console.error("Subcategory not found");
    // }
    addProductMutation.mutate(newProduct);
    form.resetFields();
    onClose();
  };

  const handleDelete = (id: number) => {
    deleteProductMutation.mutate(id);
  };

  const isEditing = (record: Product) => record.id === editingKey;

  const edit = (record: Partial<SubCategory> & { key: React.Key }) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.id!);
  };

  const cancel = () => {
    form.resetFields();
    setEditingKey(0);
  };

  const save = async (id: number) => {
    try {
      const updatedInfo = (await form.validateFields()) as Product;
      updateProductMutation.mutate({
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
  //   data: productsData,
  //   isPending,
  //   isError,
  //   error,
  // } = useQuery<DataResponse>({
  //   queryKey: ["product", "getall"],
  //   queryFn: () => product.getProducts(),
  // });

  const {
    data: productsData,
    isPending,
    isError,
    error,
  } = useQuery<DataResponse>({
    queryKey: [
      "product",
      "getall",
      selectedCategory,
      selectedSubCategory,
      searchText,
    ],
    queryFn: () =>
      product.getProductsByCat(
        selectedCategory,
        selectedSubCategory,
        searchText
      ),
  });

  const { data: categoriesData } = useQuery<DataResponse>({
    queryKey: ["category", "getall"],
    queryFn: () => category.getCategories(),
  });

  const { data: subcategoriesData } = useQuery<DataResponse>({
    queryKey: ["subcategory", "getall"],
    queryFn: () => subCategory.getSubCategories(),
  });

  const addProductMutation = useMutation({
    mutationFn: (newProduct: Product) => product.addProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", "getall"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (updatedProduct: Product) =>
      product.updateProduct(updatedProduct),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product", "getall"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => product.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", "getall"] });
    },
  });

  return (
    <div className="min-h-full">
      <div className="flex justify-between">
        <h1 className="mb-2 text-xl">Product</h1>
        <Button type="primary" onClick={showDrawer}>
          Add
        </Button>
      </div>
      <div className="mb-2">
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

        {subcategoriesData && (
          <div className="mb-2">
            <Radio.Group defaultValue="" size="small">
              <Radio.Button value="" onClick={() => setSelectedSubCategory("")}>
                All
              </Radio.Button>
              {subcategoriesData.data.map((subcategory: SubCategory) => (
                <Radio.Button
                  value={subcategory.name}
                  onClick={() => setSelectedSubCategory(subcategory.name)}
                >
                  {subcategory.name}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>
        )}

        <Input
          size="small"
          style={{ width: "40%" }}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search..."
        />
      </div>

      {updateProductMutation.isPending && <div>Updating product data...</div>}

      {isPending && <span>Loading product data...</span>}

      {isError && <span>Error: {error.message}</span>}

      {productsData && (
        <h1 className="mb-3">Number of product: {productsData.data.length}</h1>
      )}

      {productsData && (
        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                cell: (props: any) => (
                  <EditableCell
                    {...props}
                    record={productsData.data}
                    categoriesData={categoriesData?.data}
                    subCategoriesData={subcategoriesData?.data}
                    form={form}
                  />
                ),
              },
            }}
            bordered
            dataSource={productsData.data}
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
            name="price"
            label="Price"
            rules={[
              { required: true, message: "Please enter price" },
              {
                validator: (_, value) => {
                  if (value > 0) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Price must be a positive number")
                  );
                },
              },
            ]}
          >
            <Input type="number" placeholder="Please enter price" />
          </Form.Item>

          {/* <Form.Item
            name="subcategoryId"
            label="SubCategory"
            rules={[{ required: true, message: "Please select sub-category" }]}
          >
            <Select placeholder="Please select sub-category">
              {subcategoriesData &&
                subcategoriesData.data.map((subcategory: Category) => (
                  <Select.Option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item> */}

          <Form.Item
            name="categoryId"
            label="Category"
            rules={[
              { required: true, message: "Please select Category first" },
            ]}
          >
            <Select
              placeholder="Please select category"
              onChange={(value) => setSelectedCategoryId(value)}
            >
              {categoriesData &&
                categoriesData.data.map((category: Category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subcategoryId"
            label="SubCategory"
            rules={[{ required: true, message: "Please select sub-category" }]}
          >
            <Select placeholder="Please select sub-category">
              {subcategoriesData &&
                selectedCategoryId &&
                subcategoriesData.data
                  .filter(
                    (subcat: SubCategory) =>
                      subcat.categoryId ===
                      selectedCategoryId /*form.getFieldValue("categoryId")*/
                  )
                  .map((subcategory: SubCategory) => (
                    <Select.Option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
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
