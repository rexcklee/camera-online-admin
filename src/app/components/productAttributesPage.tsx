"use client";

import { DataResponse } from "@/apis/api";
import AttributeAPI, { Attribute } from "@/apis/attribute";
import ProductAPI, { Product } from "@/apis/product";
import ProductAttributeAPI, { ProductAttribute } from "@/apis/productAttribute";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Space,
  Table,
  TableProps,
  Typography,
} from "antd";
import Link from "next/link";
import { useState } from "react";
import { RiArrowGoBackLine } from "react-icons/ri";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: "number" | "text";
  record: ProductAttribute;
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

const ProductAttributesPage = ({ id }: { id: string }) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(0);

  const product = new ProductAPI();
  const attribute = new AttributeAPI();
  const productAttribute = new ProductAttributeAPI();

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Attribute",
      dataIndex: "attribute",
      render: (_: any, record: any) => record.attribute.name,
      editable: false,
    },
    {
      title: "Value",
      dataIndex: "value",
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
      render: (_: any, record: ProductAttribute) => {
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

  const mergedColumns: TableProps<ProductAttribute>["columns"] = columns.map(
    (col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: ProductAttribute) => ({
          record,
          inputType: col.dataIndex === "sort" ? "number" : "text",
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

  const onFinish = (attributes: { [key: number]: any }) => {
    console.log(attributes);
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        if (value !== undefined) {
          console.log(`Key: ${key}, Value: ${value}`);
          addProductAttributeMutation.mutate({
            attributeId: Number(key),
            productId: Number(id),
            value: String(value),
          });
        }
      }
    }

    // TODO
    // addProductAttributeMutation.mutate(input);
    form.resetFields();
    onClose();
  };

  const handleDelete = (id: number) => {
    deleteProductAttributeMutation.mutate(id);
  };

  const isEditing = (record: ProductAttribute) => record.id === editingKey;

  const edit = (record: Partial<ProductAttribute> & { key: React.Key }) => {
    form.setFieldsValue({ name: "", description: "", ...record });
    setEditingKey(record.id!);
  };

  const cancel = () => {
    form.resetFields();
    setEditingKey(0);
  };

  const save = async (id: number) => {
    try {
      const updatedInfo = (await form.validateFields()) as ProductAttribute;
      updateProductAttributeMutation.mutate({
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
    data: productData,
    isPending,
    isError,
    error,
  } = useQuery<DataResponse>({
    queryKey: ["product", Number(id)],
    queryFn: () => product.getProductsById(id),
  });

  const { data: attributesData } = useQuery<DataResponse>({
    queryKey: ["attribute", "getall"],
    queryFn: () => attribute.getAttributes(),
  });

  const { data: productAttributesByIdData } = useQuery<DataResponse>({
    queryKey: ["productAttributesById", Number(id)],
    queryFn: () => productAttribute.getProductAttributesByProductId(Number(id)),
  });

  if (productAttributesByIdData) {
    const attributeIds = productAttributesByIdData?.data.map(
      (item: ProductAttribute) => item.attributeId
    );
    console.log("prodAtt:", attributeIds);
  }

  const addProductAttributeMutation = useMutation({
    mutationFn: (newProductAttribute: {
      productId: number;
      attributeId: number;
      value: string;
    }) => productAttribute.addProductAttribute(newProductAttribute),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["productAttribute", "getall"],
      });
      queryClient.invalidateQueries({
        queryKey: ["productAttributesById", Number(id)],
      });
    },
  });

  const updateProductAttributeMutation = useMutation({
    mutationFn: (updatedProductAttribute: ProductAttribute) =>
      productAttribute.updateProductAttribute(updatedProductAttribute),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["productAttribute", "getall"],
      });
      queryClient.invalidateQueries({
        queryKey: ["productAttributesById", Number(id)],
      });
    },
  });

  const deleteProductAttributeMutation = useMutation({
    mutationFn: (id: number) => productAttribute.deleteProductAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["productAttribute", "getall"],
      });
      queryClient.invalidateQueries({
        queryKey: ["productAttributesById", Number(id)],
      });
    },
  });

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error loading product</div>;

  return (
    <div className="min-h-full">
      {productData && (
        <div className="flex justify-between mb-6">
          <div className="flex gap-10 text-xl">
            <h1>Product: {productData.data.name}</h1>
            <p>Price: ${productData.data.price}</p>
          </div>
          <div className="">
            <Link href="/dashboard/product">
              <Button>
                <RiArrowGoBackLine />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {productAttributesByIdData && (
        <div className="flex justify-between items-center mb-2">
          <h1>Number of attributes: {productAttributesByIdData.data.length}</h1>
          <Button type="primary" onClick={showDrawer}>
            Add
          </Button>
        </div>
      )}

      {productAttributesByIdData && (
        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            bordered
            dataSource={productAttributesByIdData.data}
            columns={mergedColumns}
            rowClassName="editable-row"
            pagination={{
              onChange: cancel,
            }}
          />
        </Form>
      )}

      <Drawer title="Add attributes" width={1000} onClose={onClose} open={open}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          {attributesData && productAttributesByIdData && (
            <Row gutter={16}>
              {attributesData.data
                // filter out attributes that already added
                .filter(
                  (attribute: Attribute) =>
                    !productAttributesByIdData.data
                      .map((item: ProductAttribute) => item.attributeId)
                      .includes(attribute.id)
                )
                .map((attribute: Attribute) => (
                  <Col span={6} key={attribute.id}>
                    {" "}
                    <Form.Item
                      name={attribute.id}
                      label={attribute.name}
                      rules={[
                        { required: false, message: "Please enter name" },
                      ]}
                    >
                      <Input placeholder="Please enter value" />
                    </Form.Item>
                  </Col>
                ))}
            </Row>
          )}

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
};

export default ProductAttributesPage;
