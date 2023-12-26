// pages/api-test.js

"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "antd";
import {
	ImagineParams,
	ImagineRes,
	imagine,
} from "../api/midjourney/tasksubmit";

export default function ApiTest() {
	const [result, setResult] = useState<any>(null); // 使用状态来存储结果
	const resultRef = useRef(null); // 使用 useRef 来引用 div 元素

	// API 调用函数
	const callApi = async () => {
		try {
			const prompt =
				"korean schoolgirl, Big eyes, Fine eyebrow, The cheeks are decorated with sequins, There is a smile on the face, 8 teeth leaking slightly, Pearl earrings, Wears a silver phoenix type crown, Long black hair, Wear a long skirt, Put your hands across your chest., Lie on the pink beach, The light of the sun and sea waves is reflected on the face, It is reminiscent of youth at sunset, The environment is tranquil, Full-body photo";
			// 构建请求参数
			const imagineParams = {
				base64Array: [],
				notifyHook: "",
				prompt: prompt,
				state: "",
			};

			// 调用 API 并获取结果
			const response = await imagine(imagineParams);
			// 更新状态以显示结果
			setResult(response);
		} catch (error) {
			// 错误处理
			console.error("API call failed:", error);
			setResult(error.message);
		}
	};

	// 使用 useEffect 来更新 div 中显示的结果
	useEffect(() => {
		if (resultRef.current) {
			resultRef.current.textContent = JSON.stringify(result, null, 2);
		}
	}, [result]);

	return (
		<div>
			<Button onClick={callApi}>Call API</Button>
			<div
				style={{
					height: "500px",
					overflow: "auto",
					marginTop: "20px",
					border: "1px solid #ccc",
					padding: "10px",
				}}
			>
				{/* 绑定 ref 到 div */}
				<pre ref={resultRef}>{/* 结果将在这里显示 */}</pre>
			</div>
		</div>
	);
}
