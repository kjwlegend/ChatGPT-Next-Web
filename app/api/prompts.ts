import request from "../utils/request";
import { User } from "../store/user";
import { ModelType } from "../store/config";
import { ChatMessage } from "../store/chat";

export interface CreateChatSessionData {
  user: number;
  prompt_id?: string;
  model?: ModelType;
}

export interface CreateChatData {
  user: number;
  chat_session: string;
  message?: string | ChatMessage[];
  memory?: ChatMessage[];
  token_count?: number;
}

// get prompt category url : /api/gpt/get-prompt-categories/

export async function getPromptCategory() {
  return request({
    url: `/gpt/get-prompt-categories/`,
    method: "get",
  })
    .then((res) => res.data)
    .catch((err) => {
      // console.log(err);
      return err.response.data;
    });
}

// get prompthotness
export async function getPromptHotness() {
  return request({
    url: `/gpt/prompt-hotness/`,
    method: "get",
  })
    .then((res) => res.data)
    .catch((err) => {
      // console.log(err);
      return err.response.data;
    });
}
