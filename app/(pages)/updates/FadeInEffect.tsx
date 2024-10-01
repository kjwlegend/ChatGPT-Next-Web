"use client"; // 客户端组件

import React, { useEffect } from "react";

const FadeInEffect = () => {
	useEffect(() => {
		const timelineItems = document.querySelectorAll(".fade-in-element");

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("fade-in-animation");
				} else {
					entry.target.classList.remove("fade-in-animation");
				}
			});
		});

		timelineItems.forEach((item) => {
			observer.observe(item);
		});

		return () => {
			timelineItems.forEach((item) => {
				observer.unobserve(item);
			});
		};
	}, []);

	return null; // 这个组件不需要渲染任何内容
};

export default FadeInEffect;