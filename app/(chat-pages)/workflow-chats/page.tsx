"use client";
import React, { Suspense } from "react";
import { HashRouter } from "react-router-dom";
import { WorkflowProvider } from "./workflowContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import SimpleWorkflow from "./components/workflow/SimpleWorkflow";
import { useHasHydrated } from "@/app/hooks/useHasHydrated";

const App = () => {
	const hasHydrated = useHasHydrated();

	if (!hasHydrated) {
		return null;
	}

	return (
		<WorkflowProvider>
			<HashRouter>
				<Suspense fallback={<div>loading..</div>}>
					<TooltipProvider>
						<SimpleWorkflow />
					</TooltipProvider>
				</Suspense>
			</HashRouter>
		</WorkflowProvider>
	);
};

export default App;
