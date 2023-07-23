import request from "../utils/request";
import { User } from "../store/user";

export async function updateUserInfo(userId: number, userInfo: User) {
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
