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

    public async getSubCategoriesByCat(categoryName: string): Promise<DataResponse> {
        return this.post("subcategory/get_by_cat", { categoryName: categoryName }, false);
    }

    public async addSubCategory(newSubCategory: SubCategory): Promise<DataResponse> {
        return this.post("subcategory/add", newSubCategory, true);
    }

    public async updateSubCategory(
        updatedSubCategory: SubCategory
    ): Promise<DataResponse> {
        return this.post("subcategory/update", updatedSubCategory, true);
    }

    public async deleteSubCategory(id: number): Promise<DataResponse> {
        return this.post("subcategory/delete", { id: id }, true);
    }
}
