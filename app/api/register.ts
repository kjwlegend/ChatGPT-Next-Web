import request from "../utils/request";

export interface RegisterParams {
  username: string;
  password: string;
  email: string;
}

export interface RegisterResult {
  token: string;
  status: string;
}

export async function register(
  params: RegisterParams,
): Promise<RegisterResult> {
  return request
    .post("/api/register", params)
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
    });
}
