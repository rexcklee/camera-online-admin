import API, { DataResponse } from "./api";

export interface SubCategory {
    id: number;
    name: string;
    description: string;
    categoryId: number;
    sort: number;
    key: string;
}

export default class SubCategoryAPI extends API {
    public async getSubCategories(): Promise<DataResponse> {
        return this.get("subcategory/get_all", false);
    }

    public async addSubCategory(newSubCategory: SubCategory): Promise<DataResponse> {
        return this.post("subcategory/add", newSubCategory, true);
    }

    public async updateSubCategory(
        id: number,
        name: string,
        description: string,
        categoryId: number,
        sort: number
    ): Promise<DataResponse> {
        return this.post("subcategory/update", { id, name, description, categoryId, sort }, true);
    }

    public async deleteSubCategory(id: number): Promise<DataResponse> {
        return this.post("subcategory/delete", { id: id }, true);
    }
}
