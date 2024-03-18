import { useState, useEffect } from "react";
import styles from "../styles/QuestionInput.module.scss";
import useFadeInAnimation from "../hooks/useFadeInAnimation";
import { Input } from "antd";
import { classifyQuestion } from "../services/QuestionTypeClassifier";
import { useTarotStore } from "../store/tarot";
import {
	classifySpread,
	findSpreadIndex,
} from "../services/TarotSpreadSelector";
import { stringify } from "querystring";
import { useUserStore } from "@/app/store";

const QuestionInputComponent = () => {
	const TarotStore = useTarotStore();
	const UserStore = useUserStore();
	const nickname = UserStore.user.nickname;
	const { setStage, questions, setQuestions } = TarotStore;
	const [question, setQuestion] = useState("");
	const [questiontype, setQuestionType] = useState("");
	const [response, setResponse] = useState("");
	const [spreadName, setspreadName] = useState("");
	const [spreadUsage, setSpreadUsage] = useState("");
	const animationStates = useFadeInAnimation(
		["welcome", "input", "button"],
		1000,
	);

	useEffect(() => {
		console.log("questions updated", questions);
	}, [questions]); // 这个 useEffect 会在 `questions` 状态变化后执行

	const handleQuestionSubmit = async () => {
		console.log("Question submitted:", question);
		// TODO: Trigger question type classification
		// TODO: Display crystal ball and tarot spread selection

		const res = await classifyQuestion(question);
		if (!res) {
			console.error("Failed to classify question");
			return;
		}
		const { questionType, complexity, response, language } = res;
		setQuestionType(questionType);
		setResponse(response);

		const questionOutput = {
			question: question,
			questionType: questionType,
			complexity: complexity,
			language: language,
		};

		// concact userInput into a string
		const classifySpreadInput = JSON.stringify(questionOutput);
		console.log("classifySpreadInput", classifySpreadInput);

		const spread = await classifySpread(classifySpreadInput);
		if (!spread) {
			console.error("Failed to classify spread");
			return;
		}

		const { spreadName, spreadUsage } = spread;

		setspreadName(spreadName);
		setSpreadUsage(spreadUsage);

		const spreadIndex = findSpreadIndex(spreadName);
		if (spreadIndex === -1) {
			console.error("Failed to find spread index");
			return;
		}
		// set spreadIndex to store
		TarotStore.selectSpread(spreadIndex);

		const updateStoreInfo = {
			question: question,
			questionType: questionType,
			complexity: complexity,
			language: language,
			response: response,
			spreadName: spreadName,
			spreadUsage: spreadUsage,
		};

		setQuestions(updateStoreInfo);

		setStage("question");
	};

	return (
		<div className={styles.flexcontainer}>
			<div
				className={`${styles.welcomeText} ${
					animationStates.welcome ? styles.fadeIn : ""
				}`}
			>
				<p className={styles.title}>欢迎你 {nickname} 来到神秘的塔罗世界</p>
				<p>希望你的问题能在这里找到答案</p>
				<p>请尽可能详细的输入你的问题</p>
			</div>
			<div
				className={`${animationStates.input ? styles.fadeIn : ""} ${
					styles.questionInput
				}`}
			>
				<Input
					type="text"
					placeholder="请输入您的问题..."
					onChange={(e) => setQuestion(e.target.value)}
					onPressEnter={handleQuestionSubmit}
					width={"100%"}
					size="large"
					className={``}
				/>
			</div>

			<button
				className={`${styles.submitButton} ${
					animationStates.button ? styles.fadeIn : ""
				}`}
				onClick={handleQuestionSubmit}
			>
				提交
			</button>

			{questiontype && (
				<div className={`${styles.fadeIn} ${styles.responseText}`}>
					{response}
				</div>
			)}

			{spreadName && (
				<div className={`${styles.fadeIn} ${styles.responseText}`}>
					我即将使用 {spreadName} 来帮你完成这次占卜, {spreadUsage}
				</div>
			)}
		</div>
	);
};

export default QuestionInputComponent;
