'use client';
import { ThemeContext } from "@/providers/theme/ThemeContext";
import { useContext, useEffect } from "react";
import styles from "./ThemeToggle.module.scss";
import Image from "next/image";

const ThemeToggle = () => {
  const { theme, toggle } = useContext(ThemeContext);
  

  return (
    <button
      onClick={toggle}
      className={styles.container}
      style={
        theme === "dark"
          ? { backgroundColor: "#white" }
          : { backgroundColor: "#0f172a" }
      }
    >
      <Image src="/moon.png" alt="Toggle Theme" width={16} height={16} />
      <div
        className={styles.toggle}
        style={
          theme === "dark"
            ? { left: 1, backgroundColor: "#0f172a" }
            : { right: 1, backgroundColor: "white" }
        }
      ></div>
      <Image src="/sun.png" alt="Toggle Theme" width={18} height={18} />
    </button>
  );
};
export default ThemeToggle;
