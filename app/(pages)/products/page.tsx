"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import MembershipUpgrade from "./components/MembershipUpgrade";
import SingleItemsPage from "./components/SingleItemPurchase";
import CardKeyRedeem from "./components/CardKeyRedeem";
import { Toaster } from "@/components/ui/toaster";

const ProductPage = () => {
	return (
		<div className="mx-auto flex flex-col items-center space-y-12 px-4 py-8">
			<MembershipUpgrade />
			<SingleItemsPage />
			<CardKeyRedeem />
		</div>
	);
};

export default ProductPage;
