import API, { DataResponse } from "./api";

export interface Category {
  id: number;
  name: string;
  description: string;
  sort: number;
  key: string;
}

export default class CategoryAPI extends API {
  public async getCategories(): Promise<DataResponse> {
    console.log('category start')
    return this.get("category/get_all", false);
  }

  public async addCategory(newCategory: Category): Promise<DataResponse> {
    return this.post("category/add", newCategory, true);
  }

  public async updateCategory(
    updatedCategory: Category
  ): Promise<DataResponse> {
    return this.post("category/update", updatedCategory, true);
  }

  public async deleteCategory(id: number): Promise<DataResponse> {
    return this.post("category/delete", { id: id }, true);
  }
}
