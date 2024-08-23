import API, { DataResponse } from "./api";

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    categoryId: number;
    subcategoryId: number;
    key: string;
}

export default class ProductAPI extends API {
    public async getProducts(): Promise<DataResponse> {
        return this.get("product/get_all", false);
    }

    public async getProductsByCat(selectedCat: string, selectedSubCat: string, searchText: string): Promise<DataResponse> {
        return this.post("product/get_by_cat", { selectedCat, selectedSubCat, searchText }, false);
    }

    public async getProductsById(id: string): Promise<DataResponse> {
        return this.post("product/get_byId", { id }, false);
    }

    public async addProduct(newProduct: Product): Promise<DataResponse> {
        return this.post("product/add", newProduct, true);
    }

    public async updateProduct(
        updatedProduct: Product
    ): Promise<DataResponse> {
        return this.post(
            "product/update",
            updatedProduct,
            true
        );
    }

    public async deleteProduct(id: number): Promise<DataResponse> {
        return this.post("product/delete", { id: id }, true);
    }
}
