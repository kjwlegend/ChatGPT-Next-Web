import { createContext } from "react";

interface AppState {
	isMobile: boolean;
}

export const AppGeneralContext = createContext<AppState>({
	isMobile: false,
});
