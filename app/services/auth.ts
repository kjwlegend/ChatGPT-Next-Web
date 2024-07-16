import axios from "axios";
import request from "./api";
import { AppMapping, api } from "./api";

// 定义接口
export interface RegisterParams {
	username: string;
	password: string;
	nickname?: string;
	gender?: number;
	email: string;
	invite_code?: string;
}

export interface RegisterResult {
	token: string;
	status: string;
	data: object;
}

interface ChangePasswordParams {
	email: string;
	reset_code: string;
	new_password: string;
}

interface LoginParams {
	username: string;
	password: string;
}

const appnamespace = AppMapping.user;

export const register = api(appnamespace, "/register/");
export const login = api(appnamespace, "/login/");
export const resetPasswordapi = api(appnamespace, "/reset-password/");
export const changePasswordapi = api(appnamespace, "/reset-password-confirm/");
export const logout = api(appnamespace, "/logout/");
