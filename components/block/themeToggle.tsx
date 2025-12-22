"use client";

import { useTheme } from "next-themes";
import { Switch } from "../ui/switch";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle({ hidden = false }: { hidden?: boolean }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a loading spinner
  }

  const isDark = resolvedTheme === "dark";

  const handleTheme = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
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
          style={{ top: isDark ? "25px" : "0" }}
        ></Sun>
        <Moon
          className=" w-5 absolute  transition-all duration-500 left-0"
          style={{ bottom: isDark ? "0" : "25px" }}
        ></Moon>
      </div>

      <Switch checked={isDark} onCheckedChange={handleTheme}></Switch>
    </div>
  );
}
