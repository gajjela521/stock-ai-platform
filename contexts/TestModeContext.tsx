"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TestModeContextType {
    isTestMode: boolean;
    toggleTestMode: () => void;
}

const TestModeContext = createContext<TestModeContextType | undefined>(undefined);

export function TestModeProvider({ children }: { children: ReactNode }) {
    const [isTestMode, setIsTestMode] = useState(false);

    // Load test mode from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("testMode");
        if (saved === "true") {
            setIsTestMode(true);
        }
    }, []);

    const toggleTestMode = () => {
        setIsTestMode(prev => {
            const newValue = !prev;
            localStorage.setItem("testMode", String(newValue));
            return newValue;
        });
    };

    return (
        <TestModeContext.Provider value={{ isTestMode, toggleTestMode }}>
            {children}
        </TestModeContext.Provider>
    );
}

export function useTestMode() {
    const context = useContext(TestModeContext);
    if (context === undefined) {
        throw new Error("useTestMode must be used within a TestModeProvider");
    }
    return context;
}
