import crypto from "crypto";

// 假设这是您从支付平台获取的商户密钥
const merchantKey = "8i71P777IL87ICdpD18fl4ic4R8iyIZd";

// 您需要签名的参数对象
const params = {
	pid: "1044",
	type: "alipay",
	out_trade_no: "20160806151343349",
	notify_url: "http://xiaoguang.fun",
	name: "test1",
	money: "0.1",
	clientip: "192.168.1.100",
	device: "pc",
	// sign和sign_type参数不参与签名过程，这里不包含
};

// 用于生成签名的函数
function generateSignature(params: any, merchantKey: string) {
	// 步骤1：参数排序
	const sortedKeys = Object.keys(params).sort((a, b) => a.localeCompare(b));
	let sortedParams = "";
	for (const key of sortedKeys) {
		if (params[key] !== undefined && params[key] !== "") {
			sortedParams += `${key}=${params[key]}`;
			if (key !== sortedKeys[sortedKeys.length - 1]) {
				sortedParams += "&";
			}
		}
	}

	// 步骤2：拼接字符串（已经完成）

	// 步骤3：MD5加密
	const preSign = sortedParams + merchantKey;
	const hash = crypto.createHash("md5");
	hash.update(preSign);
	const sign = hash.digest("hex").toLowerCase();

	// 步骤4：生成签名字符串
	return sign;
}

// 生成签名
export const epaySigniture = generateSignature(params, merchantKey);
console.log("MD5 Signature:", epaySigniture);
