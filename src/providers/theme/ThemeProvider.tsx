"use client";

import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { theme } = useContext(ThemeContext);
 

  return <div className={theme}>{children}</div>;
};

export default ThemeProvider;
