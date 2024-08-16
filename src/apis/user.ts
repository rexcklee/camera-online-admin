import API, { DataResponse } from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  password: number;
  key: string;
}

export default class UserAPI extends API {
    public async loginUser(loginUser: User): Promise<DataResponse> {
        return this.post("user/login", loginUser, false);
      }

  public async getUsers(): Promise<DataResponse> {
    return this.get("user/get_all", false);
  }

  public async registerUser(newUser: User): Promise<DataResponse> {
    return this.post("user/register_user", newUser, false);
  }

  public async updateUser(
        id: number,
        name: string,
        email: string,
        isAdmin: boolean,
  ): Promise<DataResponse> {
    return this.post(
      "user/update",
      {id, name, email, isAdmin},
      false
    );
  }

  public async deleteUser(
    id: number
  ): Promise<DataResponse> {
    return this.post(
      "user/delete",
      { id: id },
      false
    );
  }
}
