"use client";

import { cn } from "@/lib/utils";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { AgentControlPanel } from "./components/agent-control/AgentControlPanel";
import { OutputFilesPanel } from "./components/output/OutputFilesPanel";

interface BossModLayoutProps {
	children: React.ReactNode;
}

export default function BossModLayout({ children }: BossModLayoutProps) {
	return (
		<div className="h-screen">
			<ResizablePanelGroup direction="horizontal" className="h-full">
				{/* Left Panel - Agent Control */}
				<ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
					<div className="h-full border-r">
						<AgentControlPanel />
					</div>
				</ResizablePanel>

				<ResizableHandle />

				{/* Middle Panel - Main Workspace */}
				<ResizablePanel defaultSize={50}>
					<div className="h-full border-r">{children}</div>
				</ResizablePanel>

				<ResizableHandle />

				{/* Right Panel - Output Files */}
				<ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
					<div className="h-full">
						<OutputFilesPanel />
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}
