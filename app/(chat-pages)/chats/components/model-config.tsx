"use client";
import { ModalConfigValidator, ModelConfig, useAppConfig } from "@/app/store";
import Locale from "@/app/locales";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ListItem, Select } from "@/app/components/ui-lib";
import { useState, useEffect } from "react";

export function ModelConfigList(props: {
	modelConfig: ModelConfig;
	updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
	// 为所有滑块值创建状态
	const [sliderValues, setSliderValues] = useState({
		temperature: props.modelConfig.temperature ?? 0.5,
		top_p: props.modelConfig.top_p ?? 1,
		max_tokens: props.modelConfig.max_tokens,
		presence_penalty: props.modelConfig.presence_penalty ?? 0,
		frequency_penalty: props.modelConfig.frequency_penalty ?? 0,
		historyMessageCount: props.modelConfig.historyMessageCount,
	});

	const [isInjectSystemPrompts, setIsInjectSystemPrompts] = useState(
		props.modelConfig.enableInjectSystemPrompts,
	);

	// 当 props 更新时同步所有状态
	useEffect(() => {
		setSliderValues({
			temperature: props.modelConfig.temperature ?? 0.5,
			top_p: props.modelConfig.top_p ?? 1,
			max_tokens: props.modelConfig.max_tokens,
			presence_penalty: props.modelConfig.presence_penalty ?? 0,
			frequency_penalty: props.modelConfig.frequency_penalty ?? 0,
			historyMessageCount: props.modelConfig.historyMessageCount,
		});
		setIsInjectSystemPrompts(props.modelConfig.enableInjectSystemPrompts);
	}, [props.modelConfig]);

	return (
		<>
			<ListItem
				title={Locale.Settings.Temperature.Title}
				subTitle={Locale.Settings.Temperature.SubTitle}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<span style={{ minWidth: "40px" }}>{sliderValues.temperature}</span>
					<div style={{ width: "300px" }}>
						<Slider
							defaultValue={[props.modelConfig.temperature ?? 0.5]}
							min={0}
							max={1}
							step={0.1}
							onValueChange={(value) => {
								setSliderValues((prev) => ({ ...prev, temperature: value[0] }));
								props.updateConfig(
									(config) =>
										(config.temperature = ModalConfigValidator.temperature(
											value[0],
										)),
								);
							}}
						/>
					</div>
				</div>
			</ListItem>

			<ListItem
				title={Locale.Settings.TopP.Title}
				subTitle={Locale.Settings.TopP.SubTitle}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<span style={{ minWidth: "40px" }}>{sliderValues.top_p}</span>
					<div style={{ width: "300px" }}>
						<Slider
							defaultValue={[props.modelConfig.top_p ?? 1]}
							min={0}
							max={1}
							step={0.1}
							onValueChange={(value) => {
								setSliderValues((prev) => ({ ...prev, top_p: value[0] }));
								props.updateConfig(
									(config) =>
										(config.top_p = ModalConfigValidator.top_p(value[0])),
								);
							}}
						/>
					</div>
				</div>
			</ListItem>

			<ListItem
				title={Locale.Settings.MaxTokens.Title}
				subTitle={Locale.Settings.MaxTokens.SubTitle}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<span style={{ minWidth: "40px" }}>{sliderValues.max_tokens}</span>
					<div style={{ width: "300px" }}>
						<Slider
							defaultValue={[props.modelConfig.max_tokens]}
							min={100}
							max={8000}
							step={1000}
							onValueChange={(value) => {
								setSliderValues((prev) => ({ ...prev, max_tokens: value[0] }));
								props.updateConfig(
									(config) =>
										(config.max_tokens = ModalConfigValidator.max_tokens(
											value[0],
										)),
								);
							}}
						/>
					</div>
				</div>
			</ListItem>

			<ListItem
				title={Locale.Settings.PresencePenalty.Title}
				subTitle={Locale.Settings.PresencePenalty.SubTitle}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<span style={{ minWidth: "40px" }}>
						{sliderValues.presence_penalty}
					</span>
					<div style={{ width: "300px" }}>
						<Slider
							defaultValue={[props.modelConfig.presence_penalty ?? 0]}
							min={-2}
							max={2}
							step={0.1}
							onValueChange={(value) => {
								setSliderValues((prev) => ({
									...prev,
									presence_penalty: value[0],
								}));
								props.updateConfig(
									(config) =>
										(config.presence_penalty =
											ModalConfigValidator.presence_penalty(value[0])),
								);
							}}
						/>
					</div>
				</div>
			</ListItem>

			<ListItem
				title={Locale.Settings.FrequencyPenalty.Title}
				subTitle={Locale.Settings.FrequencyPenalty.SubTitle}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<span style={{ minWidth: "40px" }}>
						{sliderValues.frequency_penalty}
					</span>
					<div style={{ width: "300px" }}>
						<Slider
							defaultValue={[props.modelConfig.frequency_penalty ?? 0]}
							min={-2}
							max={2}
							step={0.1}
							onValueChange={(value) => {
								setSliderValues((prev) => ({
									...prev,
									frequency_penalty: value[0],
								}));
								props.updateConfig(
									(config) =>
										(config.frequency_penalty =
											ModalConfigValidator.frequency_penalty(value[0])),
								);
							}}
						/>
					</div>
				</div>
			</ListItem>

			<ListItem
				title={Locale.Settings.InjectSystemPrompts.Title}
				subTitle={Locale.Settings.InjectSystemPrompts.SubTitle}
			>
				<Switch
					checked={isInjectSystemPrompts}
					onCheckedChange={(checked) => {
						setIsInjectSystemPrompts(checked);
						props.updateConfig(
							(config) => (config.enableInjectSystemPrompts = checked),
						);
					}}
				/>
			</ListItem>

			<ListItem
				title={Locale.Settings.HistoryCount.Title}
				subTitle={Locale.Settings.HistoryCount.SubTitle}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<span style={{ minWidth: "40px" }}>
						{sliderValues.historyMessageCount}
					</span>
					<div style={{ width: "300px" }}>
						<Slider
							defaultValue={[props.modelConfig.historyMessageCount]}
							min={0}
							max={64}
							step={1}
							onValueChange={(value) => {
								setSliderValues((prev) => ({
									...prev,
									historyMessageCount: value[0],
								}));
								props.updateConfig(
									(config) => (config.historyMessageCount = value[0]),
								);
							}}
						/>
					</div>
				</div>
			</ListItem>
		</>
	);
}
