import API, { DataResponse } from "./api";

export interface Attribute {
    id: number;
    name: string;
    key: string;
}

export default class AttributeAPI extends API {
    public async getAttributes(): Promise<DataResponse> {
        return this.get("attribute/get_all", false);
    }

    public async addAttribute(newAttribute: Attribute): Promise<DataResponse> {
        return this.post("attribute/add", newAttribute, true);
    }

    public async updateAttribute(
        updatedAttribute: Attribute
    ): Promise<DataResponse> {
        return this.post("attribute/update", updatedAttribute, true);
    }

    public async deleteAttribute(id: number): Promise<DataResponse> {
        return this.post("attribute/delete", { id: id }, true);
    }
}
