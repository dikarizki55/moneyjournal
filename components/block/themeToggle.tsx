"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Moon, Sun } from "lucide-react";

const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
};

export default function ThemeToggle({ hidden = false }: { hidden?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = getCookie("dark") === "true" ? true : false;
    setDark(isDark);
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const handleTheme = () => {
    !dark ? setCookie("dark", "true") : setCookie("dark", "false");
    setDark(!dark);
  };

  return (
    <div
      className={`flex gap-4 items-center overflow-hidden p-5 ${
        hidden ? "hidden" : ""
      }`}
    >
      <div className=" relative flex flex-col overflow-hidden">
        <Sun
          className=" w-5 relative transition-all duration-500"
          style={{ top: dark ? "25" : "0" }}
        ></Sun>
        <Moon
          className=" w-5 absolute  transition-all duration-500 left-0"
          style={{ bottom: dark ? "0" : "25" }}
        ></Moon>
      </div>

      <Switch checked={dark} onCheckedChange={handleTheme}></Switch>
    </div>
  );
}
