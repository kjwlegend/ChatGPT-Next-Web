"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TaskGroup } from "../PlanningView";
import * as d3 from "d3";

interface GraphViewProps {
	group: TaskGroup;
}

export function GraphView({ group }: GraphViewProps) {
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!svgRef.current) return;

		// 清除现有内容
		d3.select(svgRef.current).selectAll("*").remove();

		const width = 800;
		const height = 600;

		const svg = d3
			.select(svgRef.current)
			.attr("width", width)
			.attr("height", height);

		// 创建力导向图
		const simulation = d3
			.forceSimulation()
			.force(
				"link",
				d3.forceLink().id((d: any) => d.id),
			)
			.force("charge", d3.forceManyBody().strength(-300))
			.force("center", d3.forceCenter(width / 2, height / 2));

		// 准备数据
		const nodes = group.tasks;
		const links = group.tasks.flatMap((task) =>
			task.dependencies.map((depId) => ({
				source: depId,
				target: task.id,
			})),
		);

		// 绘制连线
		const link = svg
			.append("g")
			.selectAll("line")
			.data(links)
			.join("line")
			.attr("stroke", "#999")
			.attr("stroke-opacity", 0.6)
			.attr("stroke-width", 2);

		// 创建节点组
		const node = svg.append("g").selectAll("g").data(nodes).join("g");

		// 添加节点背景
		node
			.append("circle")
			.attr("r", 30)
			.attr("fill", (d) => getStatusColor(d.status));

		// 添加节点文本
		node
			.append("text")
			.text((d) => d.title)
			.attr("text-anchor", "middle")
			.attr("dy", ".35em")
			.attr("fill", "white")
			.style("font-size", "12px");

		// 更新力导向图
		simulation.nodes(nodes as any).on("tick", () => {
			link
				.attr("x1", (d: any) => d.source.x)
				.attr("y1", (d: any) => d.source.y)
				.attr("x2", (d: any) => d.target.x)
				.attr("y2", (d: any) => d.target.y);

			node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
		});

		(simulation.force("link") as d3.ForceLink<any, any>).links(links);
	}, [group]);

	return (
		<div className="h-full">
			<ScrollArea className="h-full">
				<div className="p-4">
					<svg ref={svgRef}></svg>
				</div>
			</ScrollArea>
		</div>
	);
}

function getStatusColor(status: string) {
	const colors = {
		pending: "#EAB308",
		in_progress: "#3B82F6",
		completed: "#22C55E",
		blocked: "#EF4444",
	};
	return colors[status as keyof typeof colors];
}
