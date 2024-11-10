import { PluginConfig } from "@/app/store";

import Locale from "@/app/locales";
import { ListItem } from "@/app/components/ui-lib";
import { Checkbox } from "@/components/ui/checkbox";

export function PluginConfigList(props: {
	pluginConfig: PluginConfig;
	updateConfig: (updater: (config: PluginConfig) => void) => void;
}) {
	return (
		<>
			<ListItem
				title={Locale.Settings.Plugin.Enable.Title}
				subTitle={Locale.Settings.Plugin.Enable.SubTitle}
			>
				<Checkbox
					checked={props.pluginConfig.enable}
					onCheckedChange={(checked: boolean) =>
						props.updateConfig((config) => (config.enable = checked))
					}
				></Checkbox>
			</ListItem>
			<ListItem
				title={Locale.Settings.Plugin.MaxIteration.Title}
				subTitle={Locale.Settings.Plugin.MaxIteration.SubTitle}
			>
				<input
					type="number"
					min={1}
					max={10}
					value={props.pluginConfig.maxIterations}
					onChange={(e) =>
						props.updateConfig(
							(config) =>
								(config.maxIterations = e.currentTarget.valueAsNumber),
						)
					}
				></input>
			</ListItem>
			<ListItem
				title={Locale.Settings.Plugin.ReturnIntermediateStep.Title}
				subTitle={Locale.Settings.Plugin.ReturnIntermediateStep.SubTitle}
			>
				<Checkbox
					checked={props.pluginConfig.returnIntermediateSteps}
					onCheckedChange={(checked: boolean) =>
						props.updateConfig(
							(config) => (config.returnIntermediateSteps = checked),
						)
					}
				></Checkbox>
			</ListItem>
		</>
	);
}
