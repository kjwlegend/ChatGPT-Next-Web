// ThemeContext.tsx
import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

interface ThemeContextType {
	theme: string;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
	theme: "light",
	toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
	children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
	const [theme, setTheme] = useState<string>("light");

	useEffect(() => {
		const storedTheme = localStorage.getItem("theme") || "light";
		setTheme(storedTheme);
		document.body.className = storedTheme;
	}, []);

	const toggleTheme = () => {

	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};
