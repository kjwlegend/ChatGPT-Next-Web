import { useState, useEffect } from "react";
import { useMaskStore } from "@/app/store/mask";
import { useMasks } from "@/app/hooks/useMasks";
import { useAuthStore } from "@/app/store/auth";
import { Mask } from "@/app/types/mask";
import { featureMaskGroup } from "../utils/maskHelpers";

export const useNewChat = () => {
	const maskStore = useMaskStore();
	const { fetchPromptsCallback, fetchTagsCallback } = useMasks();
	const { isAuthenticated } = useAuthStore();

	const [featureGroup, setFeatureGroup] = useState<Mask[]>([]);
	const [otherMasks, setOtherMasks] = useState<Mask[]>([]);
	const [tags, setTags] = useState<string[]>([]);

	useEffect(() => {
		const initialize = async () => {
			try {
				const { data, total } = await fetchPromptsCallback(1, 100);
				const featureMasks = featureMaskGroup(data);
				const otherMasks = data.filter((mask) => !mask.featureMask);
				const tags = await fetchTagsCallback(1, 100);

				// Randomly select 15 masks from otherMasks
				const shuffledOtherMasks = otherMasks.sort(() => 0.5 - Math.random());
				const selectedOtherMasks = shuffledOtherMasks.slice(0, 15);

				setFeatureGroup(featureMasks);
				setOtherMasks(selectedOtherMasks);
				setTags(tags.data.map((tag) => tag.tag_name));
				maskStore.updatestate({ total });
			} catch (error) {
				console.error("Error fetching prompts:", error);
			}
		};
		initialize();
	}, []);

	return {
		featureGroup,
		otherMasks,
		tags,
		isAuthenticated,
	};
};
