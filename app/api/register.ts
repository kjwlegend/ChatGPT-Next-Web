import request from "../utils/request";

export interface RegisterParams {
  username: string;
  password: string;
  email: string;
}

export interface RegisterResult {
  token: string;
  status: string;
  data: object;
}

export async function register(params: any): Promise<any> {
  return request
    .post("/api/gpt/register/", params)
    .then((res) => res.data)
    .catch((err) => {
      // console.log(err);
      return err.response.data;
    });
}
