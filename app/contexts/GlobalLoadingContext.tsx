import React, { createContext, useState, useContext } from "react";

interface GlobalLoadingContextType {
	isLoading: boolean;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const GlobalLoadingContext = createContext<
	GlobalLoadingContextType | undefined
>(undefined);

export const GlobalLoadingProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isLoading, setIsLoading] = useState(false);

	return (
		<GlobalLoadingContext.Provider value={{ isLoading, setIsLoading }}>
			{children}
		</GlobalLoadingContext.Provider>
	);
};

export const useGlobalLoading = () => {
	const context = useContext(GlobalLoadingContext);
	if (context === undefined) {
		throw new Error(
			"useGlobalLoading must be used within a GlobalLoadingProvider",
		);
	}
	return context;
};
