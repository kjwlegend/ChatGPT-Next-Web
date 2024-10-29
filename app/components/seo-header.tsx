"use client";
import React from "react";
import { Helmet } from "react-helmet";
import {pageMetadata, defaultSEOHeader} from "../pageMetadata";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export const SEOHeader = () => {
	const pageKey = usePathname().substring(1) || "home";

	console.log(pageKey);
	let metadata = pageMetadata[pageKey] || pageMetadata["home"];
	const title = metadata.title;
	const description = metadata.description || defaultSEOHeader.description;
	const keywords = metadata.keywords || defaultSEOHeader.keywords;

	return (
		<>
			<title>{title}</title>
			<meta name="description" content={description} />
			{keywords && <meta name="keywords" content={keywords} />}
			{/* Add additional meta tags here as needed */}
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			{keywords && <meta property="og:keywords" content={keywords} />}
		</>
	);
};
