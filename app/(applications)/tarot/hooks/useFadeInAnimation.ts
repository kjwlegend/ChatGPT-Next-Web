import { useState, useEffect } from "react";

interface AnimationState {
	[key: string]: boolean;
}

const useFadeInAnimation = (elements: string[], delayIncrement: number) => {
	const [animationStates, setAnimationStates] = useState<AnimationState>({});

	useEffect(() => {
		elements.forEach((element, index) => {
			const timeoutId = setTimeout(() => {
				setAnimationStates((prevStates) => ({
					...prevStates,
					[element]: true,
				}));
			}, delayIncrement * index);
			return () => clearTimeout(timeoutId);
		});
	}, [elements, delayIncrement]);

	return animationStates;
};

export default useFadeInAnimation;
