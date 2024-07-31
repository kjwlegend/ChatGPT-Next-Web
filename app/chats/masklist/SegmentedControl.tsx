import React from "react";
import { Segmented } from "antd";

interface SegmentedControlProps {
	segmentValue: string | number;
	handleSegmentChange: (value: string | number) => void;
}

const segmentOptions = [
	{ label: "官方公开", value: "public", disabled: false },
	{ label: "我的自建", value: "private", disabled: false },
];

const SegmentedControl: React.FC<SegmentedControlProps> = ({
	segmentValue,
	handleSegmentChange,
}) => {
	return (
		<Segmented
			options={segmentOptions}
			value={segmentValue}
			block
			onChange={handleSegmentChange}
			size="large"
		/>
	);
};

export default SegmentedControl;
