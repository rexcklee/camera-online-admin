import API, { DataResponse } from "./api";
import { Attribute } from "./attribute";

export interface ProductAttribute {
    id: number;
    attributeId: number;
    productId: number;
    value: string;
    sort: number;
    key: string;
    attribute: Attribute;
}

export default class ProductAttributeAPI extends API {
    public async getProductAttributes(): Promise<DataResponse> {
        return this.get("productAttribute/get_all", false);
    }

    public async getProductAttributesByProductId(id: number): Promise<DataResponse> {
        return this.post("productAttribute/get_byId", { productId: id }, true);
    }

    public async addProductAttribute(newProductAttribute: {
        productId: number;
        attributeId: number;
        value: string;
    }): Promise<DataResponse> {
        return this.post("productAttribute/add", newProductAttribute, true);
    }

    public async updateProductAttribute(
        updatednewProductAttribute: ProductAttribute
    ): Promise<DataResponse> {
        return this.post("productAttribute/update", updatednewProductAttribute, true);
    }

    public async deleteProductAttribute(id: number): Promise<DataResponse> {
        return this.post("productAttribute/delete", { id: id }, true);
    }
}
