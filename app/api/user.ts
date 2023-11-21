import request from "../utils/request";
import { User } from "../store/user";

export async function updateProfile(userId: number, userInfo: User) {
  return request({
    url: `/gpt/users/${userId}/`,
    method: "put",
    data: userInfo,
  })
    .then((res) => res.data)
    .catch((err) => {
      // console.log(err);
      return err.response.data;
    });
}

export async function getUserInfo(userId: any) {
  return await request({
    url: `/gpt/users/${userId}/`,
    method: "get",
  })
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return err.response
    });
}