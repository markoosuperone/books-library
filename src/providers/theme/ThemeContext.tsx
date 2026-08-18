"use client";
import { createContext, useEffect, useMemo, useState } from "react";

interface ThemeContextType {
  theme: string;
  toggle: () => void;
}
export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggle: () => {},
});
const getLocalStorageTheme = () => {
  if (typeof window !== "undefined") {
    const theme = localStorage.getItem("theme");
    return theme ? JSON.parse(theme) : "light";
  }
};
interface ThemeContextProps {
  children: React.ReactNode;
}
const ThemeContextProvider = ({ children }: ThemeContextProps) => {
  const [theme, setTheme] = useState(() => getLocalStorageTheme() || "light");

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(theme));
  }, [theme]);
  const toggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);

  return (
    <ThemeContext value={value}>
      {children}
    </ThemeContext>
  );
};

export default ThemeContextProvider;
