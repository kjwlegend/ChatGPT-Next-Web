// pages/api-test.js

"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button, Input } from "antd";
import {
	ImagineParams,
	ImagineRes,
	imagine,
	ChangeParams,
	ChangeRes,
	change,
	Mjfetch,
	FetchRes,
} from "../api/midjourney/tasksubmit";

export default function ApiTest() {
	const [results, setResults] = useState({}); // 使用对象来存储每个测试的结果
	const resultRefs = useRef([]); // 使用数组来引用每个结果显示区域的 div 元素
	const [inputs, setInputs] = useState(Array(5).fill("")); // 创建一个长度为5的数组，用于存储每个输入框的值

	const updateInput = (index: number, value: string) => {
		const newInput = [...inputs];
		newInput[index] = value;
		setInputs(newInput);
	};

	// API 调用函数模板
	const callApi = async (testNumber: number, additionalInput: string) => {
		try {
			// ... 构建不同的请求参数，这里只是示例
			// const prompt =
			// 	"korean schoolgirl, Big eyes, Fine eyebrow, The cheeks are decorated with sequins, There is a smile on the face, 8 teeth leaking slightly, Pearl earrings, Wears a silver phoenix type crown, Long black hair, Wear a long skirt, Put your hands across your chest., Lie on the pink beach, The light of the sun and sea waves is reflected on the face, It is reminiscent of youth at sunset, The environment is tranquil, Full-body photo";
			const prompt =
				"korean schoolgirl, 上了一天班晚上还要熬夜学习的咨询顾问, 具有明亮的大眼睛, 穿着一个有气质的皮衣, 身材好, 一个手臂袖子只有半截, 漏出火焰花的纹身";
			// 构建请求参数
			const imagineParams = {
				base64Array: [],
				notifyHook: "",
				prompt: prompt,
				state: "",
			};

			const ChangeParams: ChangeParams = {
				action: "UPSCALE",
				index: 3,
				notifyHook: "",
				state: "",
				taskId: "",
			};

			let response: any;
			if (testNumber === 1) {
				// 调用 API 并获取结果
				response = await imagine(imagineParams);
			}

			if (testNumber === 2) {
				// 调用 API 并获取结果
				ChangeParams.taskId = additionalInput;
				response = await change(ChangeParams);
			}

			if (testNumber === 3) {
				// 调用 API 并获取结果
				response = await Mjfetch(additionalInput);
				const res = response.data;

				console.log(res);
			}

			// 更新状态以显示结果
			setResults((prevResults) => ({ ...prevResults, [testNumber]: response }));
		} catch (error) {
			// 错误处理
			console.error(`API call for test ${testNumber} failed:`, error);
			setResults((prevResults) => ({
				...prevResults,
				[testNumber]: error.message,
			}));
		}
	};

	// 创建5个 API 调用函数
	const callApiFunctions = Array.from(
		{ length: 5 },
		(_, index) => (additionalInput: string) => {
			callApi(index + 1, additionalInput);
		},
	);

	// 渲染输入框、按钮和结果显示区域
	const renderButtonsAndResults = () => {
		return inputs.map((_, index) => (
			<div key={`test-${index}`}>
				<Input
					placeholder={`请输入 Test ${index + 1}`}
					value={inputs[index]}
					onChange={(e) => updateInput(index, e.target.value)}
				/>
				<Button onClick={() => callApi(index + 1, inputs[index])}>
					Call API Test {index + 1}
				</Button>
				<div
					style={{
						height: "200px",
						overflow: "auto",
						marginTop: "20px",
						border: "1px solid #ccc",
						padding: "10px",
					}}
					ref={(el) => (resultRefs.current[index] = el)}
				>
					<pre>{JSON.stringify(results[index + 1], null, 2)}</pre>
				</div>
			</div>
		));
	};
	return <div>{renderButtonsAndResults()}</div>;
}
