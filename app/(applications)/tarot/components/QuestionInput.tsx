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
import { Stages } from "../store/tarot";
import useAuth from "@/app/hooks/useAuth";
import GetMoreDrawsModal from "./GetDraws";

const QuestionInputComponent = () => {
	const TarotStore = useTarotStore();
	const UserStore = useUserStore();
	const userAuth = useAuth();

	const { updateUserInfo } = userAuth;

	const { tarot_balance, id } = UserStore.user;

	const nickname = UserStore.user.nickname;
	const { setStage, questions, setQuestions, stage } = TarotStore;
	const [question, setQuestion] = useState("");
	const [questiontype, setQuestionType] = useState("");
	const [response, setResponse] = useState("");
	const [spreadName, setspreadName] = useState("");
	const [spreadUsage, setSpreadUsage] = useState("");
	const animationStates = useFadeInAnimation(
		["welcome", "input", "button"],
		1000,
	);

	const [showInput, setShowInput] = useState(stage === Stages.UserInput);
	const [animationClass, setAnimationClass] = useState("");

	const [isGetMoreDrawsVisible, setIsGetMoreDrawsVisible] = useState(false);

	const handleOpenGetMoreDraws = () => {
		setIsGetMoreDrawsVisible(true);
	};

	const handleCloseGetMoreDraws = () => {
		setIsGetMoreDrawsVisible(false);
	};

	useEffect(() => {
		if (stage === Stages.UserInput) {
			setShowInput(true);
			setAnimationClass("");
		} else {
			setAnimationClass(styles.fadeOut);
			const timeoutId = setTimeout(() => setShowInput(false), 2500); // 500ms 是动画时长
			return () => clearTimeout(timeoutId);
		}
	}, [stage]);

	useEffect(() => {
		// 当 stage 不等于 0 时，添加 hidden 类
		if (stage !== Stages.UserInput) {
			// console.log("stage", stage);
		}
	}, [stage]);

	const [isLoading, setIsLoading] = useState(false);

	const [errorText, setErrorText] = useState("");

	useEffect(() => {
		console.log("questions updated", questions);
	}, [questions]); // 这个 useEffect 会在 `questions` 状态变化后执行

	const handleQuestionSubmit = async () => {
		// console.log("Question submitted:", question);
		// TODO: Trigger question type classification
		// TODO: Display crystal ball and tarot spread selection
		try {
			const user = await updateUserInfo(id);
		} catch (error) {
			setErrorText("提交失败，请重试");
		}
		// if no question, show error text
		if (tarot_balance === 0) {
			setErrorText("您的提问次数不足");
			return;
		}
		if (!question) {
			setErrorText("请输入问题");
			return;
		}

		setIsLoading(true);

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
		// console.log("classifySpreadInput", classifySpreadInput);

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

		setIsLoading(false);

		// update store
		setQuestions(updateStoreInfo);

		setStage(Stages.Shuffle);
	};

	return (
		<div className={styles.flexcontainer}>
			<div
				className={`${styles.welcomeText} ${
					animationStates.welcome ? styles.fadeIn : ""
				}
				${stage === Stages.Interpretation ? styles.fadeOut : ""}
				`}
			>
				<p className={styles.title}>欢迎你 {nickname} 来到神秘的塔罗世界</p>
				<p className={`${styles.subtitle} ${animationClass} `}>
					采用金色黎明Golden Dawn正统神秘学释义, 最专业的塔罗占卜
				</p>
				<p className={`${styles.subtitle} ${animationClass} `}>
					所有占卜记录及结果均不会被保存, 请放心使用
				</p>
				<p className={`${styles.subtitle} ${animationClass} `}>
					请尽可能详细的输入你的问题
				</p>
			</div>
			<div
				className={`${animationStates.input ? styles.fadeIn : ""} 
				${stage !== Stages.UserInput ? styles.fadeOut : ""} ${styles.questionInput}`}
			>
				{showInput && (
					<>
						<Input
							type="text"
							placeholder="请输入您的问题..."
							onChange={(e) => setQuestion(e.target.value)}
							onPressEnter={handleQuestionSubmit}
							// width={"100%"}
							size="large"
							className={``}
						/>
						<p className={styles.errortext}>{errorText}</p>
					</>
				)}
			</div>
			{question && stage !== Stages.UserInput && (
				<div className={`${styles.fadeIn} ${styles.responseText}`}>
					你的问题是: {question}
				</div>
			)}

			{showInput && (
				<>
					<button
						className={`${styles.submitButton} ${
							animationStates.button ? styles.fadeIn : ""
						} ${animationClass} ${styles.tarotButtonPrimary} ${styles.hide}`}
						onClick={handleQuestionSubmit}
					>
						提交
					</button>

					<div
						className={`${
							animationStates.button ? styles.fadeIn : ""
						} ${animationClass} ${styles.hide}`}
					>
						{/* 展示剩余提问机会次数, 每天一次, 并提示可升级会员获得3次提问 */}
						您今日还有 {tarot_balance} 次提问机会.
					</div>
					<button
						className={`${styles.tarotButtonPrimary} ${
							animationStates.button ? styles.fadeIn : ""
						} ${animationClass} ${styles.hide}`}
						onClick={() => handleOpenGetMoreDraws()}
					>
						获取占卜次数
					</button>
					<GetMoreDrawsModal
						visible={isGetMoreDrawsVisible}
						onClose={handleCloseGetMoreDraws}
						onConfirm={handleCloseGetMoreDraws}
					/>
				</>
			)}

			{isLoading && (
				<div className={`${styles.fadeIn} ${styles.responseText}`}>
					正在为你寻找答案...
				</div>
			)}

			{questiontype && stage < Stages.Shuffling && (
				<div className={`${styles.fadeIn} ${styles.responseText}`}>
					{response}
				</div>
			)}

			{spreadName && stage < Stages.Draw && (
				<div
					className={`${styles.fadeIn} ${styles.responseTextSmall} ${styles.Small}`}
				>
					我即将使用 {spreadName} 来帮你完成这次占卜, {spreadUsage}
				</div>
			)}
		</div>
	);
};

export default QuestionInputComponent;
